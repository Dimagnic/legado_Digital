-- Pruebas de privacidad: Ana y Beto no pueden verse entre sí.
\set ON_ERROR_STOP on
grant select, insert, update, delete on all tables in schema public, storage to authenticated;
insert into auth.users values ('00000000-0000-0000-0000-00000000000a','ana@ejemplo.test'),
                              ('00000000-0000-0000-0000-00000000000b','beto@ejemplo.test');

-- Ana crea su recuerdo, una etiqueta y sube un original
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000a';
insert into public.memories (title, story, kind) values ('La receta del mole', 'Mi abuela tostaba los chiles en comal', 'recipe');
insert into public.entries (kind, body) values ('text', 'Hoy recordé el mole de mi abuela');
insert into public.assets (storage_path, mime_type, size_bytes, sha256)
  values ('00000000-0000-0000-0000-00000000000a/audio1.webm','audio/webm',100, repeat('a',64));
insert into storage.objects (bucket_id, name) values ('originals','00000000-0000-0000-0000-00000000000a/audio1.webm');

do $$ begin
  assert (select count(*) from public.profiles) = 1, 'Ana debe ver solo su perfil';
  assert (select count(*) from public.memory_revisions) = 1, 'debe existir historial del recuerdo';
  assert (select count(*) from public.memories where search @@ plainto_tsquery('spanish','chiles')) = 1, 'búsqueda en español';
end $$;

-- 1) Entradas originales no se reescriben
do $$ begin
  begin
    update public.entries set body = 'otro texto';
    raise exception 'FALLO: se pudo reescribir una entrada';
  exception when raise_exception then
    if sqlerrm like 'FALLO%' then raise; end if;
  end;
end $$;

-- 2) Archivos originales no se sobrescriben
do $$ begin
  begin
    update public.assets set sha256 = repeat('b',64);
    raise exception 'FALLO: se pudo cambiar el hash de un original';
  exception when raise_exception then
    if sqlerrm like 'FALLO%' then raise; end if;
  end;
end $$;

-- 3) Una sugerencia de IA nace como sugerida, nunca confirmada
insert into public.tags (name) values ('cocina');
insert into public.memory_tags (memory_id, tag_id, origin, status)
  select m.id, t.id, 'ai', 'confirmed' from public.memories m, public.tags t;
do $$ begin
  assert (select status from public.memory_tags) = 'suggested', 'IA no puede confirmar';
end $$;
insert into public.memories (title, provenance, verification_status) values ('Inferencia', 'ai_interpretation', 'confirmed_by_owner');
do $$ begin
  assert (select verification_status from public.memories where title='Inferencia') = 'unconfirmed', 'interpretación IA nace sin confirmar';
end $$;

-- Ahora Beto
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000b';
do $$ begin
  assert (select count(*) from public.memories) = 0, 'FALLO: Beto ve recuerdos de Ana';
  assert (select count(*) from public.entries) = 0, 'FALLO: Beto ve entradas de Ana';
  assert (select count(*) from public.assets) = 0, 'FALLO: Beto ve archivos de Ana';
  assert (select count(*) from public.memory_revisions) = 0, 'FALLO: Beto ve historial de Ana';
  assert (select count(*) from public.audit_log) = 0, 'FALLO: Beto ve auditoría de Ana';
  assert (select count(*) from public.profiles) = 1, 'Beto ve solo su perfil';
  assert (select count(*) from storage.objects) = 0, 'FALLO: Beto ve archivos de Storage de Ana';
end $$;

-- 4) Beto no puede escribir en nombre de Ana
do $$ begin
  begin
    insert into public.memories (owner_id, title) values ('00000000-0000-0000-0000-00000000000a', 'intruso');
    raise exception 'FALLO: Beto escribió como Ana';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into storage.objects (bucket_id, name) values ('originals','00000000-0000-0000-0000-00000000000a/x.webm');
    raise exception 'FALLO: Beto subió a la carpeta de Ana';
  exception when insufficient_privilege then null;
  end;
end $$;
update public.memories set title = 'hackeado';
delete from public.memories;
reset role;
do $$ begin
  assert (select count(*) from public.memories where title = 'La receta del mole') = 1, 'FALLO: Beto modificó o borró datos de Ana';
end $$;

-- 5) Sin sesión (anónimo) no se ve nada
set role anon;
reset request.jwt.claim.sub;
do $$ begin
  begin
    perform count(*) from public.memories;
    raise exception 'FALLO: anónimo accede a recuerdos';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;
select 'TODAS LAS PRUEBAS DE PRIVACIDAD PASARON' as resultado;
