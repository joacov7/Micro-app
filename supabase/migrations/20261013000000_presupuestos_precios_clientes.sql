-- App Presupuestador, incremento 3: mis precios, clientes y ajustes del negocio.
-- Contrato de micro-app (docs/04-arquitectura.md §3): tablas con prefijo pres_, siempre con
-- org_id y RLS por membresía. No lee ni escribe tablas de la plataforma salvo por sus funciones.

-- ---------------------------------------------------------------------------
-- Tablas
-- ---------------------------------------------------------------------------
create table public.pres_items (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  nombre text not null check (char_length(btrim(nombre)) between 1 and 120),
  unidad text not null default 'u.' check (char_length(btrim(unidad)) between 1 and 20),
  precio numeric(14, 2) not null default 0 check (precio >= 0 and precio < 100000000000),
  categoria text not null default 'Materiales'
    check (categoria in ('Materiales', 'Mano de obra', 'Otro')),
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index pres_items_org_idx on public.pres_items (org_id) where activo;
-- Evita dos ítems activos con el mismo nombre en un negocio (confunde al presupuestar).
create unique index pres_items_nombre_unico
  on public.pres_items (org_id, lower(btrim(nombre))) where activo;

create table public.pres_clientes (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  nombre text not null check (char_length(btrim(nombre)) between 1 and 120),
  telefono text check (char_length(telefono) <= 30),
  email text check (char_length(email) <= 120),
  notas text check (char_length(notas) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index pres_clientes_org_idx on public.pres_clientes (org_id);

create table public.pres_ajustes (
  org_id uuid primary key references public.organizations (id) on delete cascade,
  validez_dias integer not null default 15 check (validez_dias between 1 and 365),
  forma_pago text check (char_length(forma_pago) <= 300),
  notas_pie text check (char_length(notas_pie) <= 500),
  updated_at timestamptz not null default now()
);

create trigger pres_items_updated_at before update on public.pres_items
  for each row execute function public.tocar_updated_at();
create trigger pres_clientes_updated_at before update on public.pres_clientes
  for each row execute function public.tocar_updated_at();
create trigger pres_ajustes_updated_at before update on public.pres_ajustes
  for each row execute function public.tocar_updated_at();

-- ---------------------------------------------------------------------------
-- Topes por negocio: protegen el almacenamiento gratuito (500 MB) de abusos.
-- ---------------------------------------------------------------------------
create function public.pres_controlar_tope()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_tope integer := tg_argv[0]::integer;
  v_cantidad integer;
begin
  execute format('select count(*) from public.%I where org_id = $1', tg_table_name)
    into v_cantidad using new.org_id;
  if v_cantidad >= v_tope then
    raise exception 'tope_alcanzado' using errcode = 'P0001',
      detail = format('Máximo %s registros en %s por negocio.', v_tope, tg_table_name);
  end if;
  return new;
end;
$$;

create trigger pres_items_tope before insert on public.pres_items
  for each row execute function public.pres_controlar_tope('2000');
create trigger pres_clientes_tope before insert on public.pres_clientes
  for each row execute function public.pres_controlar_tope('5000');

-- ---------------------------------------------------------------------------
-- Row Level Security: cada negocio ve y modifica solo lo suyo.
-- ---------------------------------------------------------------------------
alter table public.pres_items enable row level security;
alter table public.pres_clientes enable row level security;
alter table public.pres_ajustes enable row level security;

create policy pres_items_todo on public.pres_items for all to authenticated
  using (public.es_miembro(org_id)) with check (public.es_miembro(org_id));
create policy pres_clientes_todo on public.pres_clientes for all to authenticated
  using (public.es_miembro(org_id)) with check (public.es_miembro(org_id));
create policy pres_ajustes_todo on public.pres_ajustes for all to authenticated
  using (public.es_miembro(org_id)) with check (public.es_miembro(org_id));

grant select, insert, delete on public.pres_items, public.pres_clientes to authenticated;
grant update (nombre, unidad, precio, categoria, activo) on public.pres_items to authenticated;
grant update (nombre, telefono, email, notas) on public.pres_clientes to authenticated;
grant select, insert on public.pres_ajustes to authenticated;
grant update (validez_dias, forma_pago, notas_pie) on public.pres_ajustes to authenticated;

-- ---------------------------------------------------------------------------
-- Ítems de ejemplo según el rubro, para que el primer presupuesto salga en minutos.
-- Solo el dueño, y solo si el negocio todavía no tiene ítems.
-- ---------------------------------------------------------------------------
create function public.pres_cargar_ejemplos(p_org uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_rubro text;
  v_cantidad integer;
begin
  if not public.es_owner(p_org) then
    raise exception 'sin_permiso' using errcode = '42501';
  end if;
  if exists (select 1 from public.pres_items where org_id = p_org) then
    raise exception 'ya_tiene_items' using errcode = 'P0001';
  end if;

  select rubro into v_rubro from public.organizations where id = p_org;

  insert into public.pres_items (org_id, nombre, unidad, precio, categoria)
  select p_org, e.nombre, e.unidad, e.precio, e.categoria
  from (values
    ('Electricista', 'Boca de luz (mano de obra)', 'boca', 18000, 'Mano de obra'),
    ('Electricista', 'Tomacorriente doble (mano de obra)', 'boca', 16000, 'Mano de obra'),
    ('Electricista', 'Tablero seccional 12 módulos (armado)', 'u.', 95000, 'Mano de obra'),
    ('Electricista', 'Cable unipolar 2,5 mm² (rollo 100 m)', 'rollo', 68000, 'Materiales'),
    ('Electricista', 'Térmica bipolar 20 A', 'u.', 21000, 'Materiales'),
    ('Electricista', 'Disyuntor diferencial 40 A', 'u.', 58000, 'Materiales'),
    ('Gasista', 'Conexión de artefacto a gas', 'u.', 45000, 'Mano de obra'),
    ('Gasista', 'Prueba de hermeticidad', 'u.', 60000, 'Mano de obra'),
    ('Gasista', 'Caño epoxi 3/4" (colocado)', 'm', 22000, 'Mano de obra'),
    ('Gasista', 'Llave de paso 1/2" para gas', 'u.', 15000, 'Materiales'),
    ('Plomero', 'Destapación de cañería', 'u.', 40000, 'Mano de obra'),
    ('Plomero', 'Cambio de canilla o grifería', 'u.', 25000, 'Mano de obra'),
    ('Plomero', 'Caño termofusión 3/4" (colocado)', 'm', 12000, 'Mano de obra'),
    ('Plomero', 'Instalación de termotanque', 'u.', 80000, 'Mano de obra'),
    ('Aire acondicionado', 'Instalación split hasta 3000 frigorías', 'u.', 150000, 'Mano de obra'),
    ('Aire acondicionado', 'Kit de instalación (caños 3 m)', 'u.', 85000, 'Materiales'),
    ('Aire acondicionado', 'Carga de gas', 'u.', 70000, 'Mano de obra'),
    ('Aire acondicionado', 'Limpieza y mantenimiento', 'u.', 45000, 'Mano de obra'),
    ('Durlock y pintura', 'Tabique de durlock (colocado)', 'm²', 28000, 'Mano de obra'),
    ('Durlock y pintura', 'Cielorraso de durlock (colocado)', 'm²', 32000, 'Mano de obra'),
    ('Durlock y pintura', 'Pintura látex interior (2 manos)', 'm²', 9000, 'Mano de obra'),
    ('Durlock y pintura', 'Enduido y lijado', 'm²', 6000, 'Mano de obra'),
    ('Aberturas', 'Ventana de aluminio 150 x 110', 'u.', 320000, 'Materiales'),
    ('Aberturas', 'Puerta placa con marco', 'u.', 180000, 'Materiales'),
    ('Aberturas', 'Colocación de abertura', 'u.', 60000, 'Mano de obra'),
    ('Servicio técnico', 'Diagnóstico', 'u.', 15000, 'Mano de obra'),
    ('Servicio técnico', 'Cambio de pantalla (mano de obra)', 'u.', 35000, 'Mano de obra'),
    ('Servicio técnico', 'Cambio de batería (mano de obra)', 'u.', 20000, 'Mano de obra'),
    ('Carpintería', 'Mueble a medida', 'm lineal', 250000, 'Mano de obra'),
    ('Carpintería', 'Placa de melamina 18 mm', 'placa', 95000, 'Materiales'),
    ('*', 'Visita técnica', 'u.', 20000, 'Mano de obra'),
    ('*', 'Mano de obra', 'hora', 15000, 'Mano de obra'),
    ('*', 'Materiales varios', 'u.', 10000, 'Materiales')
  ) as e (rubro, nombre, unidad, precio, categoria)
  where e.rubro = v_rubro or e.rubro = '*';

  get diagnostics v_cantidad = row_count;
  return v_cantidad;
end;
$$;

revoke all on function public.pres_cargar_ejemplos(uuid) from public, anon;
revoke all on function public.pres_controlar_tope() from public, anon, authenticated;
grant execute on function public.pres_cargar_ejemplos(uuid) to authenticated;
