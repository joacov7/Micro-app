-- Plataforma: organizaciones, membresías, catálogo de apps, planes, permisos,
-- suscripciones, pagos, uso y auditoría.
-- Diseño: docs/04-arquitectura.md §4 y §5. Toda tabla tiene Row Level Security.
-- Las operaciones sensibles pasan por funciones SECURITY DEFINER con search_path vacío.

-- ---------------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------------
create type public.rol_org as enum ('owner', 'member');
create type public.estado_app as enum ('publicada', 'oculta', 'retirada');
create type public.estado_suscripcion as enum (
  'prueba', 'activa', 'pago_pendiente', 'en_gracia', 'suspendida', 'cancelada'
);

-- ---------------------------------------------------------------------------
-- Utilidades
-- ---------------------------------------------------------------------------
create function public.tocar_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Tablas
-- ---------------------------------------------------------------------------
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (char_length(btrim(nombre)) between 2 and 80),
  rubro text check (char_length(rubro) <= 80),
  telefono text check (char_length(telefono) <= 30),
  logo_path text check (char_length(logo_path) <= 300),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.organizations is 'El negocio cliente. Es quien paga y es dueño de los datos.';

create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  nombre text check (char_length(nombre) <= 80),
  is_platform_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on column public.profiles.is_platform_admin is
  'Solo se asigna por SQL con el rol de servicio (runbook). Los usuarios no pueden modificarlo.';

create table public.memberships (
  org_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  rol public.rol_org not null default 'member',
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);
create index memberships_user_id_idx on public.memberships (user_id);

create table public.apps (
  id text primary key check (id ~ '^[a-z][a-z0-9-]{1,30}$'),
  nombre text not null check (char_length(nombre) between 2 and 60),
  descripcion text check (char_length(descripcion) <= 500),
  estado public.estado_app not null default 'oculta',
  created_at timestamptz not null default now()
);

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  app_id text not null references public.apps (id),
  nombre text not null check (char_length(nombre) between 2 and 40),
  precio_ars numeric(14, 2) not null default 0 check (precio_ars >= 0),
  intervalo text not null default 'mensual' check (intervalo in ('mensual', 'anual')),
  es_gratuito boolean not null default false,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  unique (app_id, nombre)
);
-- Cada app tiene exactamente un plan gratuito: es el que aplica sin suscripción vigente.
create unique index plans_un_gratuito_por_app on public.plans (app_id) where es_gratuito;

create table public.plan_entitlements (
  plan_id uuid not null references public.plans (id) on delete cascade,
  clave text not null check (clave ~ '^[a-z][a-z0-9-]*\.[a-z][a-z0-9_]{1,40}$'),
  valor integer not null check (valor >= -1),
  primary key (plan_id, clave)
);
comment on table public.plan_entitlements is
  'Permisos y límites por plan. Clave "<app>.<permiso>". Valor: 0 = no, 1 = sí, N = límite, -1 = ilimitado.';

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  app_id text not null references public.apps (id),
  plan_id uuid not null references public.plans (id),
  estado public.estado_suscripcion not null,
  vence_el timestamptz,
  proveedor text not null default 'manual' check (proveedor in ('manual', 'mercadopago')),
  ref_proveedor text check (char_length(ref_proveedor) <= 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- Una sola suscripción viva por organización y app.
create unique index subscriptions_una_viva
  on public.subscriptions (org_id, app_id) where estado <> 'cancelada';

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete restrict,
  subscription_id uuid references public.subscriptions (id) on delete set null,
  monto numeric(14, 2) not null check (monto > 0),
  moneda text not null default 'ARS' check (moneda = 'ARS'),
  estado text not null default 'aprobado' check (estado in ('aprobado', 'rechazado', 'reembolsado')),
  proveedor text not null default 'mercadopago' check (proveedor in ('mercadopago', 'transferencia')),
  id_pago_proveedor text not null check (char_length(btrim(id_pago_proveedor)) between 1 and 120),
  pagado_el timestamptz not null,
  cargado_por uuid references auth.users (id) on delete set null,
  notas text check (char_length(notas) <= 500),
  created_at timestamptz not null default now(),
  -- Idempotencia: el mismo pago (manual o por webhook) nunca se registra dos veces.
  unique (proveedor, id_pago_proveedor)
);
create index payments_org_id_idx on public.payments (org_id);

create table public.usage_counters (
  org_id uuid not null references public.organizations (id) on delete cascade,
  clave text not null,
  periodo date not null,
  cantidad integer not null default 0 check (cantidad >= 0),
  primary key (org_id, clave, periodo)
);

create table public.audit_log (
  id bigint generated always as identity primary key,
  actor uuid,
  org_id uuid,
  accion text not null,
  datos jsonb,
  created_at timestamptz not null default now()
);
create index audit_log_org_id_idx on public.audit_log (org_id);

create trigger organizations_updated_at before update on public.organizations
  for each row execute function public.tocar_updated_at();
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.tocar_updated_at();
create trigger subscriptions_updated_at before update on public.subscriptions
  for each row execute function public.tocar_updated_at();

-- ---------------------------------------------------------------------------
-- Funciones de permisos (usadas por las políticas RLS)
-- ---------------------------------------------------------------------------
create function public.es_miembro(p_org uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.memberships m
    where m.org_id = p_org and m.user_id = auth.uid()
  );
$$;

create function public.es_owner(p_org uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.memberships m
    where m.org_id = p_org and m.user_id = auth.uid() and m.rol = 'owner'
  );
$$;

create function public.es_admin_plataforma()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select p.is_platform_admin from public.profiles p where p.user_id = auth.uid()),
    false
  );
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.memberships enable row level security;
alter table public.apps enable row level security;
alter table public.plans enable row level security;
alter table public.plan_entitlements enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;
alter table public.usage_counters enable row level security;
alter table public.audit_log enable row level security;

-- Organizaciones: los miembros ven la suya; solo el dueño la edita.
-- Se crean únicamente con crear_organizacion().
create policy organizations_select on public.organizations for select to authenticated
  using (public.es_miembro(id) or public.es_admin_plataforma());
create policy organizations_update on public.organizations for update to authenticated
  using (public.es_owner(id)) with check (public.es_owner(id));

-- Perfiles: cada uno ve y edita el suyo (solo el nombre, ver permisos de columnas).
create policy profiles_select on public.profiles for select to authenticated
  using (user_id = auth.uid() or public.es_admin_plataforma());
create policy profiles_update on public.profiles for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Membresías: se ven las de las organizaciones propias. Altas y bajas solo por funciones.
create policy memberships_select on public.memberships for select to authenticated
  using (public.es_miembro(org_id) or public.es_admin_plataforma());

-- Catálogo: lo publicado es visible para todos (página de precios); el resto, solo admin.
create policy apps_select on public.apps for select to anon, authenticated
  using (estado = 'publicada' or public.es_admin_plataforma());
create policy plans_select on public.plans for select to anon, authenticated
  using (
    (activo and exists (
      select 1 from public.apps a where a.id = app_id and a.estado = 'publicada'
    ))
    or public.es_admin_plataforma()
  );
create policy plan_entitlements_select on public.plan_entitlements for select to anon, authenticated
  using (exists (select 1 from public.plans p where p.id = plan_id));

-- Suscripciones, pagos y uso: lectura para miembros; escritura solo por funciones.
create policy subscriptions_select on public.subscriptions for select to authenticated
  using (public.es_miembro(org_id) or public.es_admin_plataforma());
create policy payments_select on public.payments for select to authenticated
  using (public.es_owner(org_id) or public.es_admin_plataforma());
create policy usage_counters_select on public.usage_counters for select to authenticated
  using (public.es_miembro(org_id) or public.es_admin_plataforma());

-- Auditoría: solo administradores.
create policy audit_log_select on public.audit_log for select to authenticated
  using (public.es_admin_plataforma());

-- ---------------------------------------------------------------------------
-- Permisos de tablas (defensa en profundidad además de RLS)
-- ---------------------------------------------------------------------------
revoke all on all tables in schema public from anon, authenticated;
grant select on public.apps, public.plans, public.plan_entitlements to anon;
grant select on all tables in schema public to authenticated;
grant update (nombre, rubro, telefono, logo_path) on public.organizations to authenticated;
grant update (nombre) on public.profiles to authenticated;

-- Las tablas futuras no heredan permisos automáticos: cada migración los da explícitamente.
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on functions from anon, authenticated, public;

-- ---------------------------------------------------------------------------
-- Perfil automático al registrarse
-- ---------------------------------------------------------------------------
create function public.crear_perfil_de_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id, nombre)
  values (new.id, left(nullif(btrim(new.raw_user_meta_data ->> 'nombre'), ''), 80));
  return new;
end;
$$;

create trigger auth_users_crear_perfil after insert on auth.users
  for each row execute function public.crear_perfil_de_usuario();

-- ---------------------------------------------------------------------------
-- Contrato de plataforma para las apps
-- ---------------------------------------------------------------------------

-- Valor de un permiso para una organización, sin chequear quién pregunta.
-- Uso interno desde otras funciones SECURITY DEFINER.
create function public._entitlement(p_org uuid, p_clave text)
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  with plan_vigente as (
    select coalesce(
      (
        select s.plan_id from public.subscriptions s
        where s.org_id = p_org
          and s.app_id = split_part(p_clave, '.', 1)
          and s.estado in ('prueba', 'activa', 'en_gracia')
          and (s.vence_el is null or s.vence_el > now() or s.estado = 'en_gracia')
        limit 1
      ),
      (
        select p.id from public.plans p
        where p.app_id = split_part(p_clave, '.', 1) and p.es_gratuito
      )
    ) as plan_id
  )
  select coalesce(
    (select e.valor from public.plan_entitlements e, plan_vigente v
     where e.plan_id = v.plan_id and e.clave = p_clave),
    0
  );
$$;

-- Lo que consultan las apps: "¿esta organización puede hacer X?" / "¿cuál es su límite?".
create function public.entitlement(p_org uuid, p_clave text)
returns integer
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not (public.es_miembro(p_org) or public.es_admin_plataforma()) then
    raise exception 'sin_permiso' using errcode = '42501';
  end if;
  return public._entitlement(p_org, p_clave);
end;
$$;

-- Registra un uso y hace cumplir el límite del plan. Lo llaman las apps desde
-- sus propias funciones o triggers (no se expone a los usuarios).
create function public._registrar_uso(p_org uuid, p_clave text)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_limite integer := public._entitlement(p_org, p_clave);
  v_periodo date := date_trunc('month', now() at time zone 'America/Argentina/Buenos_Aires')::date;
  v_cantidad integer;
begin
  insert into public.usage_counters as u (org_id, clave, periodo, cantidad)
  values (p_org, p_clave, v_periodo, 1)
  on conflict (org_id, clave, periodo) do update set cantidad = u.cantidad + 1
  returning u.cantidad into v_cantidad;

  if v_limite <> -1 and v_cantidad > v_limite then
    raise exception 'limite_alcanzado' using
      errcode = 'P0001',
      detail = format('Límite mensual de %s: %s', p_clave, v_limite);
  end if;
  return v_cantidad;
end;
$$;

-- ---------------------------------------------------------------------------
-- Alta de organización (primer paso después de registrarse)
-- ---------------------------------------------------------------------------
create function public.crear_organizacion(p_nombre text, p_rubro text default null, p_telefono text default null)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_org uuid;
begin
  if v_user is null then
    raise exception 'sin_sesion' using errcode = '42501';
  end if;
  -- MVP: un negocio por usuario.
  if exists (select 1 from public.memberships where user_id = v_user) then
    raise exception 'ya_tiene_organizacion' using errcode = 'P0001';
  end if;

  insert into public.organizations (nombre, rubro, telefono)
  values (btrim(p_nombre), nullif(btrim(p_rubro), ''), nullif(btrim(p_telefono), ''))
  returning id into v_org;

  insert into public.memberships (org_id, user_id, rol) values (v_org, v_user, 'owner');
  insert into public.audit_log (actor, org_id, accion) values (v_user, v_org, 'organizacion.creada');
  return v_org;
end;
$$;

-- ---------------------------------------------------------------------------
-- Administración (solo administradores de la plataforma)
-- ---------------------------------------------------------------------------
create function public._exigir_admin()
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.es_admin_plataforma() then
    raise exception 'solo_administradores' using errcode = '42501';
  end if;
end;
$$;

-- Activa o renueva un plan en forma manual (D-06).
create function public.admin_activar_plan(p_org uuid, p_plan uuid, p_vence_el timestamptz)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_app text;
  v_sub uuid;
begin
  perform public._exigir_admin();
  if p_vence_el is null or p_vence_el <= now() then
    raise exception 'vencimiento_invalido' using errcode = '22023';
  end if;
  select app_id into v_app from public.plans where id = p_plan and activo;
  if v_app is null then
    raise exception 'plan_inexistente' using errcode = '22023';
  end if;

  update public.subscriptions
     set plan_id = p_plan, estado = 'activa', vence_el = p_vence_el, proveedor = 'manual'
   where org_id = p_org and app_id = v_app and estado <> 'cancelada'
  returning id into v_sub;

  if v_sub is null then
    insert into public.subscriptions (org_id, app_id, plan_id, estado, vence_el, proveedor)
    values (p_org, v_app, p_plan, 'activa', p_vence_el, 'manual')
    returning id into v_sub;
  end if;

  insert into public.audit_log (actor, org_id, accion, datos)
  values (auth.uid(), p_org, 'suscripcion.activada',
          jsonb_build_object('plan', p_plan, 'vence_el', p_vence_el));
  return v_sub;
end;
$$;

-- Cambia el estado de una suscripción (suspender, cancelar, reactivar).
create function public.admin_cambiar_estado_suscripcion(p_sub uuid, p_estado public.estado_suscripcion)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_org uuid;
begin
  perform public._exigir_admin();
  update public.subscriptions set estado = p_estado where id = p_sub returning org_id into v_org;
  if v_org is null then
    raise exception 'suscripcion_inexistente' using errcode = '22023';
  end if;
  insert into public.audit_log (actor, org_id, accion, datos)
  values (auth.uid(), v_org, 'suscripcion.estado', jsonb_build_object('suscripcion', p_sub, 'estado', p_estado));
end;
$$;

-- Registra un pago verificado a mano en Mercado Pago o por transferencia.
create function public.admin_registrar_pago(
  p_org uuid,
  p_monto numeric,
  p_id_pago_proveedor text,
  p_pagado_el timestamptz,
  p_proveedor text default 'mercadopago',
  p_notas text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_pago uuid;
  v_sub uuid;
begin
  perform public._exigir_admin();
  select id into v_sub from public.subscriptions
   where org_id = p_org and estado <> 'cancelada' order by created_at desc limit 1;

  begin
    insert into public.payments
      (org_id, subscription_id, monto, id_pago_proveedor, pagado_el, proveedor, cargado_por, notas)
    values
      (p_org, v_sub, p_monto, btrim(p_id_pago_proveedor), p_pagado_el, p_proveedor, auth.uid(), p_notas)
    returning id into v_pago;
  exception when unique_violation then
    raise exception 'pago_duplicado' using errcode = '23505',
      detail = 'Ese número de operación ya está registrado.';
  end;

  insert into public.audit_log (actor, org_id, accion, datos)
  values (auth.uid(), p_org, 'pago.registrado',
          jsonb_build_object('pago', v_pago, 'monto', p_monto, 'operacion', p_id_pago_proveedor));
  return v_pago;
end;
$$;

-- ---------------------------------------------------------------------------
-- Permisos de ejecución
-- ---------------------------------------------------------------------------
revoke all on all functions in schema public from public, anon, authenticated;
grant execute on function
  public.es_miembro(uuid),
  public.es_owner(uuid),
  public.es_admin_plataforma(),
  public.entitlement(uuid, text),
  public.crear_organizacion(text, text, text),
  public.admin_activar_plan(uuid, uuid, timestamptz),
  public.admin_cambiar_estado_suscripcion(uuid, public.estado_suscripcion),
  public.admin_registrar_pago(uuid, numeric, text, timestamptz, text, text)
to authenticated;
-- Las políticas del catálogo usan es_admin_plataforma() también para visitantes anónimos.
grant execute on function public.es_admin_plataforma() to anon;

-- ---------------------------------------------------------------------------
-- Catálogo inicial: app Presupuestador con planes Gratis y Pro (docs/03-diseno.md §6)
-- La app queda "oculta" hasta el lanzamiento. El precio de Pro se fija desde administración.
-- ---------------------------------------------------------------------------
insert into public.apps (id, nombre, descripcion, estado) values
  ('presupuestos', 'Presupuestador',
   'Presupuestos desde el celular, envío por WhatsApp, seguimiento y aceptación online.', 'oculta');

with gratis as (
  insert into public.plans (app_id, nombre, precio_ars, es_gratuito)
  values ('presupuestos', 'Gratis', 0, true) returning id
), pro as (
  insert into public.plans (app_id, nombre, precio_ars, es_gratuito)
  values ('presupuestos', 'Pro', 0, false) returning id
)
insert into public.plan_entitlements (plan_id, clave, valor)
select gratis.id, v.clave, v.valor from gratis, (values
  ('presupuestos.por_mes', 5),
  ('presupuestos.seguimiento', 0),
  ('presupuestos.aumento_masivo', 0),
  ('presupuestos.logo', 0),
  ('presupuestos.sin_marca', 0)
) as v (clave, valor)
union all
select pro.id, v.clave, v.valor from pro, (values
  ('presupuestos.por_mes', -1),
  ('presupuestos.seguimiento', 1),
  ('presupuestos.aumento_masivo', 1),
  ('presupuestos.logo', 1),
  ('presupuestos.sin_marca', 1)
) as v (clave, valor);
