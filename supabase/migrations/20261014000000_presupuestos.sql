-- App Presupuestador, incremento 4: presupuestos, ítems, numeración y totales.
-- Reglas clave (docs/04-arquitectura.md §4):
--  * El número es correlativo por negocio y nunca se repite (contador con bloqueo de fila).
--  * Los totales los calcula la base desde los ítems: lo que mande el navegador no cuenta.
--  * Cada ítem guarda una copia del precio: aumentar la lista no cambia lo ya presupuestado.
--  * Solo se edita o borra un presupuesto en borrador.

-- ---------------------------------------------------------------------------
-- Tablas
-- ---------------------------------------------------------------------------
create table public.pres_contador (
  org_id uuid primary key references public.organizations (id) on delete cascade,
  ultimo integer not null default 0
);

create table public.pres_presupuestos (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  numero integer not null,
  cliente_id uuid references public.pres_clientes (id) on delete set null,
  cliente_nombre text not null check (char_length(btrim(cliente_nombre)) between 1 and 120),
  cliente_telefono text check (char_length(cliente_telefono) <= 30),
  estado text not null default 'borrador'
    check (estado in ('borrador', 'enviado', 'visto', 'aceptado', 'rechazado', 'vencido')),
  descuento_pct numeric(5, 2) not null default 0 check (descuento_pct between 0 and 100),
  subtotal numeric(14, 2) not null default 0,
  descuento numeric(14, 2) not null default 0,
  total numeric(14, 2) not null default 0,
  validez_dias integer not null default 15 check (validez_dias between 1 and 365),
  forma_pago text check (char_length(forma_pago) <= 300),
  notas text check (char_length(notas) <= 1000),
  -- Para el link que recibe el cliente (incremento 5). 128 bits aleatorios: imposible de adivinar.
  token_publico text not null unique default encode(extensions.gen_random_bytes(16), 'hex'),
  enviado_el timestamptz,
  visto_el timestamptz,
  respondido_el timestamptz,
  motivo_rechazo text check (char_length(motivo_rechazo) <= 500),
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, numero)
);
create index pres_presupuestos_org_idx on public.pres_presupuestos (org_id, created_at desc);

create table public.pres_presupuesto_items (
  id uuid primary key default gen_random_uuid(),
  presupuesto_id uuid not null references public.pres_presupuestos (id) on delete cascade,
  -- Se completa solo desde el presupuesto (trigger): sirve para RLS sin joins.
  org_id uuid not null references public.organizations (id) on delete cascade,
  orden integer not null default 0,
  item_id uuid references public.pres_items (id) on delete set null,
  descripcion text not null check (char_length(btrim(descripcion)) between 1 and 200),
  unidad text not null default 'u.' check (char_length(btrim(unidad)) between 1 and 20),
  cantidad numeric(12, 3) not null check (cantidad > 0 and cantidad <= 1000000),
  precio_unitario numeric(14, 2) not null check (precio_unitario >= 0 and precio_unitario < 100000000000)
);
create index pres_presupuesto_items_presupuesto_idx on public.pres_presupuesto_items (presupuesto_id, orden);

create trigger pres_presupuestos_updated_at before update on public.pres_presupuestos
  for each row execute function public.tocar_updated_at();

-- ---------------------------------------------------------------------------
-- Numeración correlativa por negocio
-- ---------------------------------------------------------------------------
create function public.pres_asignar_numero()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.pres_contador as c (org_id, ultimo) values (new.org_id, 1)
  on conflict (org_id) do update set ultimo = c.ultimo + 1
  returning c.ultimo into new.numero;
  return new;
end;
$$;

create trigger pres_presupuestos_numero before insert on public.pres_presupuestos
  for each row execute function public.pres_asignar_numero();

-- ---------------------------------------------------------------------------
-- Integridad entre negocios: un presupuesto no puede apuntar a clientes o ítems ajenos.
-- (Las claves foráneas solo verifican que existan, no de quién son.)
-- ---------------------------------------------------------------------------
create function public.pres_validar_presupuesto()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.cliente_id is not null and not exists (
    select 1 from public.pres_clientes where id = new.cliente_id and org_id = new.org_id
  ) then
    raise exception 'cliente_de_otro_negocio' using errcode = '42501';
  end if;

  if tg_op = 'UPDATE' then
    if new.org_id <> old.org_id or new.numero <> old.numero or new.token_publico <> old.token_publico then
      raise exception 'campo_no_modificable' using errcode = '42501';
    end if;
    -- Solo los borradores se editan. Los cambios de estado los hacen funciones dedicadas
    -- (incremento 5), que marcan la sesión con pres.cambio_de_estado.
    if old.estado <> 'borrador' and coalesce(current_setting('pres.cambio_de_estado', true), '') <> 'si' then
      raise exception 'presupuesto_no_editable' using errcode = 'P0001';
    end if;
  end if;

  -- Recalcular descuento y total con el subtotal vigente (el subtotal lo mantiene el trigger de ítems).
  new.descuento := round(new.subtotal * new.descuento_pct / 100, 2);
  new.total := new.subtotal - new.descuento;
  return new;
end;
$$;

create trigger pres_presupuestos_validar before insert or update on public.pres_presupuestos
  for each row execute function public.pres_validar_presupuesto();

create function public.pres_validar_item()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_org uuid;
  v_estado text;
  v_cantidad integer;
begin
  select org_id, estado into v_org, v_estado
    from public.pres_presupuestos where id = new.presupuesto_id;
  if v_estado <> 'borrador' then
    raise exception 'presupuesto_no_editable' using errcode = 'P0001';
  end if;
  new.org_id := v_org;

  if new.item_id is not null and not exists (
    select 1 from public.pres_items where id = new.item_id and org_id = v_org
  ) then
    raise exception 'item_de_otro_negocio' using errcode = '42501';
  end if;

  if tg_op = 'INSERT' then
    select count(*) into v_cantidad from public.pres_presupuesto_items where presupuesto_id = new.presupuesto_id;
    if v_cantidad >= 100 then
      raise exception 'tope_alcanzado' using errcode = 'P0001', detail = 'Máximo 100 ítems por presupuesto.';
    end if;
  elsif new.presupuesto_id <> old.presupuesto_id then
    raise exception 'campo_no_modificable' using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger pres_presupuesto_items_validar before insert or update on public.pres_presupuesto_items
  for each row execute function public.pres_validar_item();

create function public.pres_impedir_borrar_item()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- pg_trigger_depth() > 1: borrado en cascada (se borra el presupuesto o el negocio entero).
  if pg_trigger_depth() = 1 and exists (
    select 1 from public.pres_presupuestos where id = old.presupuesto_id and estado <> 'borrador'
  ) then
    raise exception 'presupuesto_no_editable' using errcode = 'P0001';
  end if;
  return old;
end;
$$;

create trigger pres_presupuesto_items_borrar before delete on public.pres_presupuesto_items
  for each row execute function public.pres_impedir_borrar_item();

-- Subtotal = suma de cada línea redondeada a centavos. Se recalcula ante cualquier cambio de ítems.
create function public.pres_recalcular_subtotal()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid := coalesce(new.presupuesto_id, old.presupuesto_id);
begin
  perform set_config('pres.cambio_de_estado', 'si', true);
  update public.pres_presupuestos p
     set subtotal = coalesce((
       select sum(round(i.cantidad * i.precio_unitario, 2))
       from public.pres_presupuesto_items i where i.presupuesto_id = v_id
     ), 0)
   where p.id = v_id;
  perform set_config('pres.cambio_de_estado', '', true);
  return null;
end;
$$;

create trigger pres_presupuesto_items_subtotal after insert or update or delete on public.pres_presupuesto_items
  for each row execute function public.pres_recalcular_subtotal();

create function public.pres_impedir_borrar_presupuesto()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- pg_trigger_depth() > 1: borrado en cascada del negocio entero (por ejemplo, baja de la cuenta).
  if pg_trigger_depth() = 1 and old.estado <> 'borrador' then
    raise exception 'presupuesto_no_editable' using errcode = 'P0001';
  end if;
  return old;
end;
$$;

create trigger pres_presupuestos_borrar before delete on public.pres_presupuestos
  for each row execute function public.pres_impedir_borrar_presupuesto();

-- ---------------------------------------------------------------------------
-- RLS y permisos
-- ---------------------------------------------------------------------------
alter table public.pres_contador enable row level security;
alter table public.pres_presupuestos enable row level security;
alter table public.pres_presupuesto_items enable row level security;
-- pres_contador: sin políticas ni permisos. Solo lo usa el trigger de numeración.

create policy pres_presupuestos_todo on public.pres_presupuestos for all to authenticated
  using (public.es_miembro(org_id)) with check (public.es_miembro(org_id));
create policy pres_presupuesto_items_todo on public.pres_presupuesto_items for all to authenticated
  using (public.es_miembro(org_id))
  with check (exists (
    select 1 from public.pres_presupuestos p
    where p.id = presupuesto_id and public.es_miembro(p.org_id)
  ));

grant select, delete on public.pres_presupuestos, public.pres_presupuesto_items to authenticated;
grant insert (org_id, cliente_id, cliente_nombre, cliente_telefono, descuento_pct, validez_dias, forma_pago, notas)
  on public.pres_presupuestos to authenticated;
grant update (cliente_id, cliente_nombre, cliente_telefono, descuento_pct, validez_dias, forma_pago, notas)
  on public.pres_presupuestos to authenticated;
grant insert (presupuesto_id, orden, item_id, descripcion, unidad, cantidad, precio_unitario)
  on public.pres_presupuesto_items to authenticated;
grant update (orden, descripcion, unidad, cantidad, precio_unitario)
  on public.pres_presupuesto_items to authenticated;

-- ---------------------------------------------------------------------------
-- Guardado atómico desde el editor: encabezado + ítems en una sola transacción.
-- SECURITY INVOKER: corre con los permisos del usuario, así que RLS y los triggers aplican igual.
-- ---------------------------------------------------------------------------
create function public.pres_guardar_presupuesto(
  p_org uuid,
  p_id uuid,
  p_cliente_id uuid,
  p_cliente_nombre text,
  p_cliente_telefono text,
  p_guardar_cliente boolean,
  p_descuento_pct numeric,
  p_validez_dias integer,
  p_forma_pago text,
  p_notas text,
  p_items jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_id uuid := p_id;
  v_cliente uuid := p_cliente_id;
begin
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'presupuesto_sin_items' using errcode = 'P0001';
  end if;

  -- Cliente nuevo: se guarda en la lista si se pidió.
  if v_cliente is null and p_guardar_cliente then
    insert into public.pres_clientes (org_id, nombre, telefono)
    values (p_org, btrim(p_cliente_nombre), nullif(btrim(p_cliente_telefono), ''))
    returning id into v_cliente;
  end if;

  if v_id is null then
    insert into public.pres_presupuestos
      (org_id, cliente_id, cliente_nombre, cliente_telefono, descuento_pct, validez_dias, forma_pago, notas)
    values
      (p_org, v_cliente, btrim(p_cliente_nombre), nullif(btrim(p_cliente_telefono), ''), p_descuento_pct,
       p_validez_dias, nullif(btrim(p_forma_pago), ''), nullif(btrim(p_notas), ''))
    returning id into v_id;
  else
    update public.pres_presupuestos
       set cliente_id = v_cliente,
           cliente_nombre = btrim(p_cliente_nombre),
           cliente_telefono = nullif(btrim(p_cliente_telefono), ''),
           descuento_pct = p_descuento_pct,
           validez_dias = p_validez_dias,
           forma_pago = nullif(btrim(p_forma_pago), ''),
           notas = nullif(btrim(p_notas), '')
     where id = v_id and org_id = p_org;
    if not found then
      raise exception 'presupuesto_inexistente' using errcode = 'P0002';
    end if;
    delete from public.pres_presupuesto_items where presupuesto_id = v_id;
  end if;

  insert into public.pres_presupuesto_items
    (presupuesto_id, orden, item_id, descripcion, unidad, cantidad, precio_unitario)
  select v_id, x.orden - 1, (x.valor ->> 'item_id')::uuid, btrim(x.valor ->> 'descripcion'),
         coalesce(nullif(btrim(x.valor ->> 'unidad'), ''), 'u.'),
         (x.valor ->> 'cantidad')::numeric, (x.valor ->> 'precio_unitario')::numeric
  from jsonb_array_elements(p_items) with ordinality as x (valor, orden);

  return v_id;
end;
$$;

revoke all on function public.pres_guardar_presupuesto(uuid, uuid, uuid, text, text, boolean, numeric, integer, text, text, jsonb)
  from public, anon;
grant execute on function public.pres_guardar_presupuesto(uuid, uuid, uuid, text, text, boolean, numeric, integer, text, text, jsonb)
  to authenticated;
revoke all on function
  public.pres_asignar_numero(), public.pres_validar_presupuesto(), public.pres_validar_item(),
  public.pres_impedir_borrar_item(), public.pres_recalcular_subtotal(), public.pres_impedir_borrar_presupuesto()
  from public, anon, authenticated;
