-- App Presupuestador: aislamiento y reglas de precios, clientes y ajustes.
begin;
create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;

select plan(22);

insert into auth.users (id, email, aud, role) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'ana@ejemplo.test', 'authenticated', 'authenticated'),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'beto@ejemplo.test', 'authenticated', 'authenticated');

create function pg_temp.como(p_user uuid) returns void language sql as $$
  select set_config('request.jwt.claims', json_build_object('sub', p_user, 'role', 'authenticated')::text, true);
  set local role authenticated;
$$;

select pg_temp.como('aaaaaaaa-0000-0000-0000-000000000001');
create temp table org_a as select public.crear_organizacion('Electricidad Ana', 'Electricista') as id;
select pg_temp.como('bbbbbbbb-0000-0000-0000-000000000002');
create temp table org_b as select public.crear_organizacion('Gas Beto', 'Gasista') as id;
reset role;
grant select on org_a, org_b to authenticated;

-- ---------------------------------------------------------------------------
-- Ítems de ejemplo
-- ---------------------------------------------------------------------------
select pg_temp.como('bbbbbbbb-0000-0000-0000-000000000002');
select throws_ok(
  $$ select public.pres_cargar_ejemplos((select id from org_a)) $$,
  '42501', 'sin_permiso', 'nadie puede cargar ejemplos en un negocio ajeno'
);

select pg_temp.como('aaaaaaaa-0000-0000-0000-000000000001');
select is(public.pres_cargar_ejemplos((select id from org_a)), 9, 'un electricista recibe 6 ítems de su rubro y 3 generales');
select throws_ok(
  $$ select public.pres_cargar_ejemplos((select id from org_a)) $$,
  'P0001', 'ya_tiene_items', 'los ejemplos se cargan una sola vez'
);
select ok(
  exists (select 1 from public.pres_items where nombre = 'Boca de luz (mano de obra)'),
  'los ejemplos son del rubro del negocio'
);

-- ---------------------------------------------------------------------------
-- Ítems: alta, edición y aislamiento
-- ---------------------------------------------------------------------------
select lives_ok(
  $$ insert into public.pres_items (org_id, nombre, unidad, precio, categoria)
     values ((select id from org_a), 'Llave de luz', 'u.', 3500.50, 'Materiales') $$,
  'el negocio carga un ítem propio'
);
select throws_ok(
  $$ insert into public.pres_items (org_id, nombre, precio) values ((select id from org_a), 'llave de luz ', 100) $$,
  '23505', null, 'no se repite un nombre de ítem activo (sin importar mayúsculas ni espacios)'
);
select throws_ok(
  $$ insert into public.pres_items (org_id, nombre, precio) values ((select id from org_a), 'Negativo', -1) $$,
  '23514', null, 'no se aceptan precios negativos'
);
select throws_ok(
  $$ insert into public.pres_items (org_id, nombre, precio, categoria) values ((select id from org_a), 'X', 1, 'Inventada') $$,
  '23514', null, 'la categoría debe ser una de las previstas'
);
select throws_ok(
  $$ insert into public.pres_items (org_id, nombre, precio) values ((select id from org_b), 'Intruso', 1) $$,
  '42501', null, 'Ana no puede cargar ítems en el negocio de Beto'
);

select pg_temp.como('bbbbbbbb-0000-0000-0000-000000000002');
select is((select count(*)::int from public.pres_items), 0, 'Beto no ve los ítems de Ana');
update public.pres_items set precio = 1 where org_id = (select id from org_a);
delete from public.pres_items where org_id = (select id from org_a);
select pg_temp.como('aaaaaaaa-0000-0000-0000-000000000001');
select is((select count(*)::int from public.pres_items), 10, 'Beto no pudo borrar ítems de Ana');
select is(
  (select precio from public.pres_items where nombre = 'Llave de luz'), 3500.50::numeric,
  'Beto no pudo cambiar precios de Ana'
);
select throws_ok(
  $$ update public.pres_items set org_id = (select id from org_b) where nombre = 'Llave de luz' $$,
  '42501', null, 'no se puede mover un ítem a otro negocio'
);

-- Archivar libera el nombre para un ítem nuevo
update public.pres_items set activo = false where nombre = 'Llave de luz';
select lives_ok(
  $$ insert into public.pres_items (org_id, nombre, precio) values ((select id from org_a), 'Llave de luz', 4000) $$,
  'un ítem archivado no bloquea el nombre'
);

-- ---------------------------------------------------------------------------
-- Clientes
-- ---------------------------------------------------------------------------
select lives_ok(
  $$ insert into public.pres_clientes (org_id, nombre, telefono) values ((select id from org_a), 'Laura Giménez', '11 4000-1111') $$,
  'el negocio carga un cliente'
);
select throws_ok(
  $$ insert into public.pres_clientes (org_id, nombre) values ((select id from org_b), 'Intruso') $$,
  '42501', null, 'Ana no puede cargar clientes en el negocio de Beto'
);
select pg_temp.como('bbbbbbbb-0000-0000-0000-000000000002');
select is((select count(*)::int from public.pres_clientes), 0, 'Beto no ve los clientes de Ana');

-- ---------------------------------------------------------------------------
-- Ajustes
-- ---------------------------------------------------------------------------
select pg_temp.como('aaaaaaaa-0000-0000-0000-000000000001');
select lives_ok(
  $$ insert into public.pres_ajustes (org_id, validez_dias, forma_pago) values ((select id from org_a), 10, '50% anticipo') $$,
  'el negocio guarda sus ajustes'
);
select throws_ok(
  $$ update public.pres_ajustes set validez_dias = 0 where org_id = (select id from org_a) $$,
  '23514', null, 'la validez debe ser de al menos 1 día'
);
select pg_temp.como('bbbbbbbb-0000-0000-0000-000000000002');
select is((select count(*)::int from public.pres_ajustes), 0, 'Beto no ve los ajustes de Ana');

-- ---------------------------------------------------------------------------
-- Tope por negocio
-- ---------------------------------------------------------------------------
reset role;
insert into public.pres_clientes (org_id, nombre)
select (select id from org_b), 'Cliente ' || g from generate_series(1, 5000) g;
select pg_temp.como('bbbbbbbb-0000-0000-0000-000000000002');
select throws_ok(
  $$ insert into public.pres_clientes (org_id, nombre) values ((select id from org_b), 'Uno más') $$,
  'P0001', 'tope_alcanzado', 'hay un tope de 5000 clientes por negocio'
);
select is((select count(*)::int from public.pres_clientes), 5000, 'el tope no afecta lo ya cargado');

select * from finish();
rollback;
