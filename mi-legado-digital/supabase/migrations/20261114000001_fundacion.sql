-- =====================================================================
-- Mi Legado Digital · Migración 0001 · Fundación (Fase 1)
-- Principios: el original es inmutable, todo lo derivado se etiqueta,
-- la IA sugiere y la persona confirma, privacidad por defecto (RLS).
-- =====================================================================

-- ---------- Tipos ----------------------------------------------------
create type public.entry_kind as enum ('text', 'voice', 'photo', 'video', 'document', 'interview');

-- Clases de recuerdo, incluidas las experiencias "del corazón"
create type public.memory_kind as enum (
  'moment',       -- un momento de la vida
  'recipe',       -- Lo que sabía hacer: receta
  'remedy',       -- Lo que sabía hacer: remedio
  'saying',       -- Lo que sabía hacer: dicho
  'craft',        -- Lo que sabía hacer: oficio
  'reassurance',  -- Lo que quiero que sepan (sellado)
  'phrase'        -- Sus palabras
);

create type public.date_precision as enum ('day', 'month', 'year', 'decade', 'approx', 'unknown');

create type public.provenance as enum ('user_direct', 'original_file', 'third_party', 'ai_interpretation', 'unknown');

create type public.verification_status as enum ('unconfirmed', 'confirmed_by_owner', 'disputed');

create type public.suggestion_status as enum ('suggested', 'confirmed', 'rejected');

create type public.actor_kind as enum ('owner', 'ai', 'system');

create type public.consent_kind as enum (
  'ai_processing', 'transcription', 'interview_recording', 'voice_clone', 'avatar', 'provider_training'
);

-- ---------- Utilidades -----------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- ---------- Perfil -----------------------------------------------------
create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  display_name  text check (char_length(display_name) <= 80),
  birth_year    int check (birth_year between 1900 and 2100),
  locale        text not null default 'es-419',
  timezone      text not null default 'America/Mexico_City',
  onboarded_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- Crea el perfil al registrarse
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Etapas de vida (configurables) -----------------------------
create table public.life_stages (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 60),
  starts_on   date,
  ends_on     date,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  check (ends_on is null or starts_on is null or ends_on >= starts_on)
);
create index life_stages_owner_idx on public.life_stages (owner_id, sort_order);

-- ---------- Fuentes: entradas y archivos originales --------------------
create table public.entries (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind         public.entry_kind not null,
  body         text,                       -- texto tal como lo escribió la persona
  recorded_at  timestamptz not null default now(),
  created_at   timestamptz not null default now()
);
create index entries_owner_idx on public.entries (owner_id, recorded_at desc);

-- El texto original de una entrada no se reescribe: corregir = nueva entrada
create or replace function public.entries_immutable()
returns trigger language plpgsql as $$
begin
  if new.body is distinct from old.body or new.kind <> old.kind or new.owner_id <> old.owner_id then
    raise exception 'Las entradas originales no se modifican; crea una nueva entrada o edita el recuerdo';
  end if;
  return new;
end $$;
create trigger entries_no_rewrite before update on public.entries
  for each row execute function public.entries_immutable();

create table public.assets (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  entry_id      uuid references public.entries (id) on delete set null,
  storage_path  text not null unique,      -- originals/<owner_id>/<uuid>.<ext>
  mime_type     text not null,
  size_bytes    bigint not null check (size_bytes >= 0),
  sha256        text not null check (sha256 ~ '^[0-9a-f]{64}$'),
  duration_ms   int,
  is_original   boolean not null default true,
  created_at    timestamptz not null default now(),
  check (split_part(storage_path, '/', 1) = owner_id::text)
);
create index assets_owner_idx on public.assets (owner_id, created_at desc);

create or replace function public.assets_immutable()
returns trigger language plpgsql as $$
begin
  if new.storage_path <> old.storage_path or new.sha256 <> old.sha256
     or new.owner_id <> old.owner_id or new.is_original <> old.is_original then
    raise exception 'Un archivo original nunca se sobrescribe';
  end if;
  return new;
end $$;
create trigger assets_no_rewrite before update on public.assets
  for each row execute function public.assets_immutable();

-- ---------- Derivados: transcripciones (capa separada) -----------------
create table public.transcripts (
  id               uuid primary key default gen_random_uuid(),
  owner_id         uuid not null default auth.uid() references auth.users (id) on delete cascade,
  asset_id         uuid not null references public.assets (id) on delete cascade,
  version          int not null default 1,
  provider         text,        -- null cuando la escribió la persona
  model            text,
  body             text not null,
  edited_by_owner  boolean not null default false,
  created_at       timestamptz not null default now(),
  unique (asset_id, version)
);

-- ---------- Recuerdos (la unidad que la persona reconoce como suya) ----
create table public.memories (
  id                   uuid primary key default gen_random_uuid(),
  owner_id             uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind                 public.memory_kind not null default 'moment',
  title                text not null check (char_length(title) between 1 and 160),
  story                text,
  details              jsonb not null default '{}'::jsonb,   -- p. ej. ingredientes de una receta
  occurred_on          date,
  occurred_precision   public.date_precision not null default 'unknown',
  stage_id             uuid references public.life_stages (id) on delete set null,
  provenance           public.provenance not null default 'user_direct',
  verification_status  public.verification_status not null default 'confirmed_by_owner',
  is_sealed            boolean not null default false,       -- Lo que quiero que sepan
  is_demo              boolean not null default false,       -- datos de demostración, siempre marcados
  search               tsvector generated always as (
                         setweight(to_tsvector('spanish', coalesce(title, '')), 'A') ||
                         setweight(to_tsvector('spanish', coalesce(story, '')), 'B')
                       ) stored,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  deleted_at           timestamptz
);
create index memories_owner_idx on public.memories (owner_id, occurred_on desc nulls last);
create index memories_search_idx on public.memories using gin (search);
create trigger memories_touch before update on public.memories
  for each row execute function public.touch_updated_at();

-- Una interpretación de IA nunca nace confirmada
create or replace function public.ai_memories_start_unconfirmed()
returns trigger language plpgsql as $$
begin
  if new.provenance = 'ai_interpretation' then
    new.verification_status := 'unconfirmed';
  end if;
  return new;
end $$;
create trigger memories_ai_unconfirmed before insert on public.memories
  for each row execute function public.ai_memories_start_unconfirmed();

-- Trazabilidad: de qué fuentes sale cada recuerdo
create table public.memory_sources (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null default auth.uid() references auth.users (id) on delete cascade,
  memory_id  uuid not null references public.memories (id) on delete cascade,
  entry_id   uuid references public.entries (id) on delete cascade,
  asset_id   uuid references public.assets (id) on delete cascade,
  created_at timestamptz not null default now(),
  check (num_nonnulls(entry_id, asset_id) = 1)
);
create index memory_sources_memory_idx on public.memory_sources (memory_id);

-- Historial de cambios: solo inserción, escrito por trigger
create table public.memory_revisions (
  id          bigint generated always as identity primary key,
  owner_id    uuid not null references auth.users (id) on delete cascade,
  memory_id   uuid not null references public.memories (id) on delete cascade,
  actor       public.actor_kind not null,
  operation   text not null,
  snapshot    jsonb not null,
  created_at  timestamptz not null default now()
);
create index memory_revisions_memory_idx on public.memory_revisions (memory_id, created_at);

create or replace function public.log_memory_revision()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  who public.actor_kind := coalesce(nullif(current_setting('app.actor', true), '')::public.actor_kind, 'owner');
begin
  insert into public.memory_revisions (owner_id, memory_id, actor, operation, snapshot)
  values (new.owner_id, new.id, who, lower(tg_op), to_jsonb(new) - 'search');
  return new;
end $$;
create trigger memories_revision after insert or update on public.memories
  for each row execute function public.log_memory_revision();

-- ---------- Etiquetas (la IA sugiere, la persona confirma) -------------
create table public.tags (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 40),
  created_at  timestamptz not null default now(),
  unique (owner_id, name)
);

create table public.memory_tags (
  owner_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  memory_id   uuid not null references public.memories (id) on delete cascade,
  tag_id      uuid not null references public.tags (id) on delete cascade,
  origin      public.actor_kind not null default 'owner',
  status      public.suggestion_status not null default 'confirmed',
  created_at  timestamptz not null default now(),
  primary key (memory_id, tag_id)
);

-- Una sugerencia de IA debe nacer como "sugerida"
create or replace function public.ai_tags_start_suggested()
returns trigger language plpgsql as $$
begin
  if new.origin = 'ai' and tg_op = 'INSERT' then
    new.status := 'suggested';
  end if;
  return new;
end $$;
create trigger memory_tags_ai_suggested before insert on public.memory_tags
  for each row execute function public.ai_tags_start_suggested();

-- ---------- Sus palabras: fragmentos de voz real -----------------------
create table public.voice_highlights (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  asset_id    uuid not null references public.assets (id) on delete cascade,
  memory_id   uuid references public.memories (id) on delete set null,
  start_ms    int not null check (start_ms >= 0),
  end_ms      int not null,
  label       text check (char_length(label) <= 120),
  created_at  timestamptz not null default now(),
  check (end_ms > start_ms)
);

-- ---------- Consentimientos ---------------------------------------------
create table public.consents (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind          public.consent_kind not null,
  text_version  text not null,
  granted_at    timestamptz not null default now(),
  revoked_at    timestamptz,
  detail        jsonb not null default '{}'::jsonb
);
create unique index consents_one_active on public.consents (owner_id, kind) where revoked_at is null;

-- ---------- Registro de operaciones sensibles -------------------------
create table public.audit_log (
  id           bigint generated always as identity primary key,
  owner_id     uuid not null references auth.users (id) on delete cascade,
  action       text not null,
  resource     text not null,
  resource_id  text,
  created_at   timestamptz not null default now()
);
create index audit_log_owner_idx on public.audit_log (owner_id, created_at desc);

create or replace function public.audit_sensitive()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  rec jsonb := to_jsonb(coalesce(new, old));
begin
  insert into public.audit_log (owner_id, action, resource, resource_id)
  values ((rec ->> 'owner_id')::uuid, lower(tg_op), tg_table_name, rec ->> 'id');
  return coalesce(new, old);
end $$;
create trigger consents_audit after insert or update or delete on public.consents
  for each row execute function public.audit_sensitive();
create trigger assets_audit after insert or delete on public.assets
  for each row execute function public.audit_sensitive();
create trigger memories_delete_audit after delete on public.memories
  for each row execute function public.audit_sensitive();

-- =====================================================================
-- Row Level Security: cada persona solo ve lo suyo. Sin excepciones.
-- =====================================================================
alter table public.profiles          enable row level security;
alter table public.life_stages       enable row level security;
alter table public.entries           enable row level security;
alter table public.assets            enable row level security;
alter table public.transcripts       enable row level security;
alter table public.memories          enable row level security;
alter table public.memory_sources    enable row level security;
alter table public.memory_revisions  enable row level security;
alter table public.tags              enable row level security;
alter table public.memory_tags       enable row level security;
alter table public.voice_highlights  enable row level security;
alter table public.consents          enable row level security;
alter table public.audit_log         enable row level security;

-- Perfil
create policy "perfil: leer el propio"      on public.profiles for select using (id = (select auth.uid()));
create policy "perfil: editar el propio"    on public.profiles for update using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- Tablas con owner_id y CRUD completo del dueño
do $$
declare t text;
begin
  foreach t in array array['life_stages','entries','transcripts','memories','memory_sources','tags','memory_tags','voice_highlights','consents']
  loop
    execute format('create policy "dueño: leer" on public.%I for select using (owner_id = (select auth.uid()))', t);
    execute format('create policy "dueño: crear" on public.%I for insert with check (owner_id = (select auth.uid()))', t);
    execute format('create policy "dueño: editar" on public.%I for update using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()))', t);
    execute format('create policy "dueño: borrar" on public.%I for delete using (owner_id = (select auth.uid()))', t);
  end loop;
end $$;

-- Archivos: se crean, se leen y se borran; los campos clave son inmutables (trigger)
create policy "dueño: leer"   on public.assets for select using (owner_id = (select auth.uid()));
create policy "dueño: crear"  on public.assets for insert with check (owner_id = (select auth.uid()));
create policy "dueño: editar" on public.assets for update using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "dueño: borrar" on public.assets for delete using (owner_id = (select auth.uid()));

-- Historial y auditoría: solo lectura para el dueño (los escriben triggers)
create policy "dueño: leer historial" on public.memory_revisions for select using (owner_id = (select auth.uid()));
create policy "dueño: leer auditoría" on public.audit_log for select using (owner_id = (select auth.uid()));

-- =====================================================================
-- Storage: bucket privado de originales, carpeta por persona.
-- Sin política de UPDATE: un original no se reemplaza.
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit)
values ('originals', 'originals', false, 524288000)
on conflict (id) do nothing;

create policy "originales: leer los propios" on storage.objects for select
  using (bucket_id = 'originals' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "originales: subir a la carpeta propia" on storage.objects for insert
  with check (bucket_id = 'originals' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "originales: borrar los propios" on storage.objects for delete
  using (bucket_id = 'originals' and (storage.foldername(name))[1] = (select auth.uid())::text);
