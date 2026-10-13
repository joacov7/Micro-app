-- App Presupuestador: numeración, totales, reglas de edición y aislamiento de presupuestos.
begin;
create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;

select plan(31);

insert into auth.users (id, email, aud, role) values
  ('aaaaaaaa-0000-0000-0000-00000000000a', 'ana@ejemplo.test', 'authenticated', 'authenticated'),
  ('bbbbbbbb-0000-0000-0000-00000000000b', 'beto@ejemplo.test', 'authenticated', 'authenticated');

create function pg_temp.como(p_user uuid) returns void language sql as $$
  select set_config('request.jwt.claims', json_build_object('sub', p_user, 'role', 'authenticated')::text, true);
  set local role authenticated;
$$;

select pg_temp.como('aaaaaaaa-0000-0000-0000-00000000000a');
create temp table org_a as select public.crear_organizacion('Electricidad Ana', 'Electricista') as id;
select pg_temp.como('bbbbbbbb-0000-0000-0000-00000000000b');
create temp table org_b as select public.crear_organizacion('Gas Beto', 'Gasista') as id;
reset role;
grant select on org_a, org_b to authenticated;
create temp table ids (nombre text primary key, id uuid);
grant all on ids to authenticated;

-- Datos de Beto que Ana no debería poder usar
select pg_temp.como('bbbbbbbb-0000-0000-0000-00000000000b');
insert into public.pres_clientes (org_id, nombre) values ((select id from org_b), 'Cliente de Beto');
insert into ids select 'cliente_beto', id from public.pres_clientes;
insert into public.pres_items (org_id, nombre, precio) values ((select id from org_b), 'Ítem de Beto', 100);
insert into ids select 'item_beto', id from public.pres_items;

-- ---------------------------------------------------------------------------
-- Alta con el guardado atómico
-- ---------------------------------------------------------------------------
select pg_temp.como('aaaaaaaa-0000-0000-0000-00000000000a');
insert into public.pres_items (org_id, nombre, unidad, precio) values ((select id from org_a), 'Boca de luz', 'boca', 18000);
insert into ids select 'item_ana', id from public.pres_items where nombre = 'Boca de luz';

insert into ids select 'p1', public.pres_guardar_presupuesto(
  (select id from org_a), null, null, 'Laura Giménez', '11 4000-1111', true, 10, 15, '50% anticipo', null,
  jsonb_build_array(
    jsonb_build_object('item_id', (select id from ids where nombre = 'item_ana'), 'descripcion', 'Boca de luz',
                       'unidad', 'boca', 'cantidad', 6, 'precio_unitario', 18000),
    jsonb_build_object('descripcion', 'Cable 2,5 mm²', 'unidad', 'm', 'cantidad', 12.5, 'precio_unitario', 680.33)
  )
);

select is((select numero from public.pres_presupuestos where id = (select id from ids where nombre = 'p1')), 1,
  'el primer presupuesto del negocio es el N.º 1');
select is((select subtotal from public.pres_presupuestos where id = (select id from ids where nombre = 'p1')),
  116504.13, 'subtotal = suma de líneas redondeadas (108.000 + 8.504,13)');
select is((select descuento from public.pres_presupuestos where id = (select id from ids where nombre = 'p1')),
  11650.41, 'descuento del 10% redondeado a centavos');
select is((select total from public.pres_presupuestos where id = (select id from ids where nombre = 'p1')),
  104853.72, 'total = subtotal − descuento');
select is((select count(*)::int from public.pres_clientes where nombre = 'Laura Giménez'), 1,
  'un cliente nuevo se guarda en la lista si se pide');
select is((select cliente_id from public.pres_presupuestos where id = (select id from ids where nombre = 'p1')),
  (select id from public.pres_clientes where nombre = 'Laura Giménez'), 'y queda vinculado al presupuesto');
select ok((select char_length(token_publico) = 32 from public.pres_presupuestos where id = (select id from ids where nombre = 'p1')),
  'cada presupuesto tiene un código de link aleatorio de 128 bits');

insert into ids select 'p2', public.pres_guardar_presupuesto(
  (select id from org_a), null, null, 'Diego', '', false, 0, 15, '', '',
  '[{"descripcion":"Visita","unidad":"u.","cantidad":1,"precio_unitario":20000}]'::jsonb);
select is((select numero from public.pres_presupuestos where id = (select id from ids where nombre = 'p2')), 2,
  'el segundo es el N.º 2');
select is((select count(*)::int from public.pres_clientes where nombre = 'Diego'), 0,
  'si no se pide, el cliente no se guarda en la lista');

-- ---------------------------------------------------------------------------
-- Los totales los calcula la base
-- ---------------------------------------------------------------------------
select throws_ok(
  $$ update public.pres_presupuestos set total = 1 where numero = 1 $$,
  '42501', null, 'no se puede escribir el total a mano'
);
select throws_ok(
  $$ update public.pres_presupuestos set numero = 99 where numero = 1 $$,
  '42501', null, 'no se puede cambiar el número'
);
update public.pres_presupuesto_items set cantidad = 1 where descripcion = 'Boca de luz';
select is((select subtotal from public.pres_presupuestos where numero = 1), 26504.13,
  'al cambiar una cantidad se recalcula el subtotal');
update public.pres_presupuestos set descuento_pct = 0 where numero = 1;
select is((select total from public.pres_presupuestos where numero = 1), 26504.13,
  'al cambiar el descuento se recalcula el total');

-- Editar con el guardado atómico reemplaza los ítems
select public.pres_guardar_presupuesto(
  (select id from org_a), (select id from ids where nombre = 'p2'), null, 'Diego Ferreyra', '11 4000-3333', false, 0, 10, '', 'Incluye materiales',
  '[{"descripcion":"Visita","unidad":"u.","cantidad":1,"precio_unitario":20000},{"descripcion":"Boca","unidad":"boca","cantidad":2,"precio_unitario":18000}]'::jsonb);
select is((select total from public.pres_presupuestos where id = (select id from ids where nombre = 'p2')), 56000.00,
  'editar reemplaza los ítems y recalcula');
select is((select count(*)::int from public.pres_presupuesto_items where presupuesto_id = (select id from ids where nombre = 'p2')), 2,
  'sin ítems duplicados después de editar');
select is((select numero from public.pres_presupuestos where id = (select id from ids where nombre = 'p2')), 2,
  'editar no cambia el número');

select throws_ok(
  format($$ select public.pres_guardar_presupuesto(%L, null, null, 'X', '', false, 0, 15, '', '', '[]'::jsonb) $$, (select id from org_a)),
  'P0001', 'presupuesto_sin_items', 'no se guarda un presupuesto sin ítems'
);

-- ---------------------------------------------------------------------------
-- Aislamiento entre negocios
-- ---------------------------------------------------------------------------
select throws_ok(
  format($$ select public.pres_guardar_presupuesto(%L, null, %L, 'Robado', '', false, 0, 15, '', '',
            '[{"descripcion":"x","cantidad":1,"precio_unitario":1}]'::jsonb) $$,
         (select id from org_a), (select id from ids where nombre = 'cliente_beto')),
  '42501', 'cliente_de_otro_negocio', 'no se puede usar un cliente de otro negocio'
);
select throws_ok(
  format($$ select public.pres_guardar_presupuesto(%L, null, null, 'X', '', false, 0, 15, '', '',
            jsonb_build_array(jsonb_build_object('item_id', %L::uuid, 'descripcion', 'x', 'cantidad', 1, 'precio_unitario', 1))) $$,
         (select id from org_a), (select id from ids where nombre = 'item_beto')),
  '42501', 'item_de_otro_negocio', 'no se puede usar un ítem de la lista de otro negocio'
);
select throws_ok(
  format($$ select public.pres_guardar_presupuesto(%L, null, null, 'X', '', false, 0, 15, '', '',
            '[{"descripcion":"x","cantidad":1,"precio_unitario":1}]'::jsonb) $$, (select id from org_b)),
  '42501', null, 'no se puede crear un presupuesto en otro negocio'
);

select pg_temp.como('bbbbbbbb-0000-0000-0000-00000000000b');
select is((select count(*)::int from public.pres_presupuestos), 0, 'Beto no ve presupuestos de Ana');
select is((select count(*)::int from public.pres_presupuesto_items), 0, 'Beto no ve ítems de presupuestos de Ana');
select throws_ok(
  format($$ insert into public.pres_presupuesto_items (presupuesto_id, descripcion, cantidad, precio_unitario)
            values (%L, 'Intruso', 1, 1) $$, (select id from ids where nombre = 'p1')),
  '42501', null, 'Beto no puede agregar ítems a un presupuesto de Ana'
);
delete from public.pres_presupuestos where id = (select id from ids where nombre = 'p1');

-- Numeración independiente por negocio
insert into ids select 'pb', public.pres_guardar_presupuesto(
  (select id from org_b), null, null, 'Cliente', '', false, 0, 15, '', '',
  '[{"descripcion":"Prueba de hermeticidad","cantidad":1,"precio_unitario":60000}]'::jsonb);
select is((select numero from public.pres_presupuestos where id = (select id from ids where nombre = 'pb')), 1,
  'cada negocio tiene su propia numeración');

-- ---------------------------------------------------------------------------
-- Solo se edita o borra un borrador
-- ---------------------------------------------------------------------------
select pg_temp.como('aaaaaaaa-0000-0000-0000-00000000000a');
select is((select count(*)::int from public.pres_presupuestos), 2, 'Beto no pudo borrar presupuestos de Ana');

reset role;
select set_config('pres.cambio_de_estado', 'si', true);
update public.pres_presupuestos set estado = 'enviado' where id = (select id from ids where nombre = 'p1');
select set_config('pres.cambio_de_estado', '', true);

select pg_temp.como('aaaaaaaa-0000-0000-0000-00000000000a');
select throws_ok(
  $$ update public.pres_presupuestos set notas = 'cambio' where numero = 1 $$,
  'P0001', 'presupuesto_no_editable', 'un presupuesto enviado no se edita'
);
select throws_ok(
  $$ update public.pres_presupuesto_items set cantidad = 99 where descripcion = 'Boca de luz' $$,
  'P0001', 'presupuesto_no_editable', 'tampoco sus ítems'
);
select throws_ok(
  $$ delete from public.pres_presupuestos where numero = 1 $$,
  'P0001', 'presupuesto_no_editable', 'ni se borra'
);
select lives_ok(
  $$ delete from public.pres_presupuestos where numero = 2 $$,
  'un borrador sí se puede borrar'
);

-- Borrar el negocio entero (baja de la cuenta) borra todo, aunque haya presupuestos enviados
reset role;
delete from public.organizations where id = (select id from org_a);
select is((select count(*)::int from public.pres_presupuestos where org_id = (select id from org_a)), 0,
  'dar de baja el negocio borra también sus presupuestos enviados');
select is((select count(*)::int from public.pres_presupuestos where org_id = (select id from org_b)), 1,
  'sin tocar los de otros negocios');

select * from finish();
rollback;
