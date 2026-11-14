-- =====================================================================
-- Mi Legado Digital · Migración 0002 · Suscripciones
-- Cada persona nace con el plan gratuito "Semilla".
-- El plan solo lo cambia el servidor (webhook del procesador de pagos con
-- la clave service_role), nunca el navegador: nadie se sube de plan solo.
-- Garantía de permanencia: si un pago vence, la cuenta pasa a solo lectura;
-- nada se borra por falta de pago.
-- =====================================================================

create type public.plan_id as enum ('semilla', 'mi_historia', 'familia');
create type public.subscription_status as enum ('active', 'trialing', 'past_due', 'read_only', 'canceled');
create type public.billing_period as enum ('monthly', 'yearly');

create table public.plans (
  id                     public.plan_id primary key,
  name                   text not null,
  storage_bytes          bigint not null,
  transcription_minutes  int not null,          -- por mes
  max_members            int not null default 1,
  price_monthly_mxn      numeric(10, 2) not null default 0,
  price_yearly_mxn       numeric(10, 2) not null default 0,
  sort_order             int not null
);

insert into public.plans values
  ('semilla',     'Semilla',      1::bigint  * 1024 * 1024 * 1024,   30, 1,   0,    0,   0),
  ('mi_historia', 'Mi Historia', 50::bigint  * 1024 * 1024 * 1024,  600, 1,  79,  790,   1),
  ('familia',     'Familia',    200::bigint  * 1024 * 1024 * 1024, 1500, 5, 159, 1590,   2);

create table public.subscriptions (
  owner_id                  uuid primary key references auth.users (id) on delete cascade,
  plan_id                   public.plan_id not null default 'semilla' references public.plans (id),
  status                    public.subscription_status not null default 'active',
  billing_period            public.billing_period,
  provider                  text,           -- 'stripe' | 'mercadopago' cuando se conecte
  provider_customer_id      text,
  provider_subscription_id  text unique,
  current_period_end        timestamptz,
  is_gift                   boolean not null default false,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);
create trigger subscriptions_touch before update on public.subscriptions
  for each row execute function public.touch_updated_at();

-- Plan gratuito automático al registrarse (y para quienes ya existían)
create or replace function public.handle_new_subscription()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.subscriptions (owner_id) values (new.id) on conflict do nothing;
  return new;
end $$;
create trigger on_auth_user_created_subscription after insert on auth.users
  for each row execute function public.handle_new_subscription();

insert into public.subscriptions (owner_id)
  select id from auth.users on conflict do nothing;

-- Auditoría de cambios de plan
-- (función propia porque la tabla usa owner_id como llave)
create or replace function public.audit_sensitive_subscription()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.audit_log (owner_id, action, resource, resource_id)
  values (new.owner_id, lower(tg_op) || ':' || new.plan_id || ':' || new.status, 'subscriptions', new.owner_id::text);
  return new;
end $$;
create trigger subscriptions_audit after insert or update on public.subscriptions
  for each row execute function public.audit_sensitive_subscription();

-- Uso de almacenamiento frente al límite del plan
create or replace function public.my_usage()
returns table (plan_id public.plan_id, status public.subscription_status, storage_used bigint, storage_limit bigint, transcription_minutes int)
language sql stable security invoker set search_path = '' as $$
  select s.plan_id, s.status,
         coalesce((select sum(a.size_bytes) from public.assets a where a.owner_id = s.owner_id), 0)::bigint,
         p.storage_bytes, p.transcription_minutes
  from public.subscriptions s
  join public.plans p on p.id = s.plan_id
  where s.owner_id = (select auth.uid())
$$;

-- Cuota: no se puede registrar un archivo que exceda el plan, ni subir en solo lectura
create or replace function public.enforce_storage_quota()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  limite bigint;
  usado  bigint;
  estado public.subscription_status;
begin
  select p.storage_bytes, s.status into limite, estado
  from public.subscriptions s join public.plans p on p.id = s.plan_id
  where s.owner_id = new.owner_id;
  if estado in ('read_only', 'canceled') then
    raise exception 'Tu cuenta está en solo lectura. Tus recuerdos siguen a salvo; renueva tu plan para guardar nuevos archivos.';
  end if;
  select coalesce(sum(size_bytes), 0) into usado from public.assets where owner_id = new.owner_id;
  if limite is not null and usado + new.size_bytes > limite then
    raise exception 'Llegaste al límite de almacenamiento de tu plan.';
  end if;
  return new;
end $$;
create trigger assets_quota before insert on public.assets
  for each row execute function public.enforce_storage_quota();

-- RLS: los planes son públicos; la suscripción solo la lee su dueño.
-- Sin políticas de escritura: solo el servidor (service_role) la modifica.
alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;
create policy "planes: lectura pública" on public.plans for select using (true);
create policy "suscripción: leer la propia" on public.subscriptions for select using (owner_id = (select auth.uid()));

-- El nombre que la persona escribe al crear su cuenta pasa a su perfil
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, nullif(left(trim(coalesce(new.raw_user_meta_data ->> 'display_name', '')), 80), ''))
  on conflict do nothing;
  return new;
end $$;
