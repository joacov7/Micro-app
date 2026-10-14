-- App Presupuestador: link público, visto, respuesta del cliente, vencimiento y duplicar.
begin;
create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;

select plan(30);

insert into auth.users (id, email, aud, role) values
  ('aaaaaaaa-0000-0000-0000-0000000000a5', 'ana@ejemplo.test', 'authenticated', 'authenticated'),
  ('bbbbbbbb-0000-0000-0000-0000000000b5', 'beto@ejemplo.test', 'authenticated', 'authenticated');

create function pg_temp.como(p_user uuid) returns void language sql as $$
  select set_config('request.jwt.claims', json_build_object('sub', p_user, 'role', 'authenticated')::text, true);
  set local role authenticated;
$$;
create function pg_temp.como_anonimo() returns void language sql as $$
  select set_config('request.jwt.claims', '{"role":"anon"}', true);
  set local role anon;
$$;

select pg_temp.como('aaaaaaaa-0000-0000-0000-0000000000a5');
create temp table org_a as select public.crear_organizacion('Electricidad Ana', 'Electricista') as id;
select pg_temp.como('bbbbbbbb-0000-0000-0000-0000000000b5');
select public.crear_organizacion('Gas Beto', 'Gasista');
reset role;
create temp table p (nombre text primary key, id uuid, token text);
grant select on org_a to authenticated;
grant all on p to authenticated, anon;

select pg_temp.como('aaaaaaaa-0000-0000-0000-0000000000a5');
insert into public.pres_items (org_id, nombre, unidad, precio) values ((select id from org_a), 'Boca de luz', 'boca', 18000);
insert into p (nombre, id) select 'p1', public.pres_guardar_presupuesto(
  (select id from org_a), null, null, 'Laura', '11 4000-1111', false, 0, 15, '', '',
  jsonb_build_array(jsonb_build_object('item_id', (select id from public.pres_items limit 1),
    'descripcion', 'Boca de luz', 'unidad', 'boca', 'cantidad', 2, 'precio_unitario', 18000)));
update p set token = (select token_publico from public.pres_presupuestos where id = p.id);

-- ---------------------------------------------------------------------------
-- Borrador: invisible para terceros
-- ---------------------------------------------------------------------------
select pg_temp.como_anonimo();
select is(public.pres_ver_presupuesto((select token from p where nombre = 'p1')), null,
  'un borrador no se muestra a quien tiene el link');
select throws_ok(
  $$ select public.pres_responder_presupuesto((select token from p where nombre = 'p1'), 'aceptar') $$,
  'P0002', 'presupuesto_inexistente', 'un borrador no se puede aceptar'
);
select throws_ok($$ select * from public.pres_presupuestos $$, '42501', null,
  'un visitante no puede leer la tabla de presupuestos');
select throws_ok(
  format($$ select public.pres_marcar_enviado(%L) $$, (select id from p where nombre = 'p1')),
  '42501', null, 'un visitante no puede marcar presupuestos como enviados'
);

-- ---------------------------------------------------------------------------
-- Envío
-- ---------------------------------------------------------------------------
select pg_temp.como('bbbbbbbb-0000-0000-0000-0000000000b5');
select throws_ok(
  format($$ select public.pres_marcar_enviado(%L) $$, (select id from p where nombre = 'p1')),
  '42501', 'sin_permiso', 'otro negocio no puede enviar mis presupuestos'
);
select pg_temp.como('aaaaaaaa-0000-0000-0000-0000000000a5');
select is(public.pres_marcar_enviado((select id from p where nombre = 'p1')), (select token from p where nombre = 'p1'),
  'marcar enviado devuelve el código del link');
select is((select estado from public.pres_presupuestos where numero = 1), 'enviado', 'queda en estado enviado');
select isnt((select enviado_el from public.pres_presupuestos where numero = 1), null, 'con fecha de envío');
select throws_ok(
  $$ update public.pres_presupuestos set notas = 'x' where numero = 1 $$,
  'P0001', 'presupuesto_no_editable', 'un enviado ya no se edita'
);

-- El propio negocio puede previsualizar sin marcarlo como visto
select ok((public.pres_ver_presupuesto((select token from p where nombre = 'p1')) ->> 'es_del_negocio')::boolean,
  'el negocio ve su presupuesto como vista previa');
select is((select estado from public.pres_presupuestos where numero = 1), 'enviado',
  'la vista previa del negocio no lo marca como visto');

-- ---------------------------------------------------------------------------
-- El cliente lo abre
-- ---------------------------------------------------------------------------
select pg_temp.como_anonimo();
create temp table vista as select public.pres_ver_presupuesto((select token from p where nombre = 'p1')) as j;
select is((select j -> 'presupuesto' ->> 'total' from vista), '36000.00', 'el cliente ve el total');
select is((select j -> 'emisor' ->> 'nombre' from vista), 'Electricidad Ana', 'y los datos del negocio');
select is((select jsonb_array_length(j -> 'presupuesto' -> 'items') from vista), 1, 'y los ítems');
select ok(not (select j ? 'id' from vista) and not (select (j -> 'presupuesto') ? 'id' from vista)
  and not (select (j -> 'presupuesto') ? 'org_id' from vista),
  'no expone identificadores internos');
select is(public.pres_ver_presupuesto('ffffffffffffffffffffffffffffffff'), null, 'un código inexistente no devuelve nada');
select is(public.pres_ver_presupuesto('no-es-un-codigo'), null, 'un código mal formado no devuelve nada');

reset role;
select is((select estado from public.pres_presupuestos where numero = 1 and org_id = (select id from org_a)), 'visto',
  'al abrirlo el cliente, queda como visto');
select isnt((select visto_el from public.pres_presupuestos where numero = 1 and org_id = (select id from org_a)), null,
  'con la fecha en que lo vio');

-- ---------------------------------------------------------------------------
-- Respuesta del cliente
-- ---------------------------------------------------------------------------
select pg_temp.como_anonimo();
select throws_ok(
  $$ select public.pres_responder_presupuesto((select token from p where nombre = 'p1'), 'tal vez') $$,
  '22023', 'respuesta_invalida', 'solo se acepta o se rechaza'
);
select is(public.pres_responder_presupuesto((select token from p where nombre = 'p1'), 'aceptar'), 'aceptado',
  'el cliente acepta desde el link');
select throws_ok(
  $$ select public.pres_responder_presupuesto((select token from p where nombre = 'p1'), 'rechazar') $$,
  'P0001', 'ya_respondido', 'no se puede cambiar la respuesta'
);

-- ---------------------------------------------------------------------------
-- Duplicar con precios actualizados
-- ---------------------------------------------------------------------------
select pg_temp.como('aaaaaaaa-0000-0000-0000-0000000000a5');
update public.pres_items set precio = 20000 where nombre = 'Boca de luz';
insert into p (nombre, id) select 'copia', public.pres_duplicar((select id from p where nombre = 'p1'));
select is((select estado from public.pres_presupuestos where id = (select id from p where nombre = 'copia')), 'borrador',
  'la copia es un borrador nuevo');
select is((select numero from public.pres_presupuestos where id = (select id from p where nombre = 'copia')), 2,
  'con número nuevo');
select is((select total from public.pres_presupuestos where id = (select id from p where nombre = 'copia')), 40000.00,
  'y con el precio actual de la lista');
select is((select total from public.pres_presupuestos where numero = 1), 36000.00, 'el original no cambia');

-- ---------------------------------------------------------------------------
-- Vencimiento
-- ---------------------------------------------------------------------------
select public.pres_marcar_enviado((select id from p where nombre = 'copia'));
update p set token = (select token_publico from public.pres_presupuestos where id = p.id) where nombre = 'copia';
reset role;
-- Simula que se envió hace 20 días con validez de 15
select set_config('pres.cambio_de_estado', 'si', true);
update public.pres_presupuestos set enviado_el = now() - interval '20 days' where id = (select id from p where nombre = 'copia');
select set_config('pres.cambio_de_estado', '', true);

select pg_temp.como_anonimo();
select is(public.pres_responder_presupuesto((select token from p where nombre = 'copia'), 'aceptar'), 'vencido',
  'un presupuesto vencido no se puede aceptar');
reset role;
select is((select estado from public.pres_presupuestos where id = (select id from p where nombre = 'copia')), 'vencido',
  'y queda marcado como vencido');

-- La tarea diaria vence los que quedaron sin respuesta
select pg_temp.como('aaaaaaaa-0000-0000-0000-0000000000a5');
insert into p (nombre, id) select 'p3', public.pres_duplicar((select id from p where nombre = 'p1'), false);
reset role;
select set_config('pres.cambio_de_estado', 'si', true);
update public.pres_presupuestos set estado = 'visto', enviado_el = now() - interval '30 days'
 where id = (select id from p where nombre = 'p3');
select set_config('pres.cambio_de_estado', '', true);
select is(public.pres_vencer_presupuestos(), 1, 'la tarea diaria vence los presupuestos sin respuesta');

-- El negocio puede registrar una respuesta recibida por teléfono, aunque esté vencido
select pg_temp.como('aaaaaaaa-0000-0000-0000-0000000000a5');
select is(public.pres_marcar_respuesta((select id from p where nombre = 'p3'), 'aceptar'), 'aceptado',
  'el negocio marca como aceptado lo que le confirmaron por teléfono');

select * from finish();
rollback;
