-- Pruebas de permisos y aislamiento de la plataforma (docs/04-arquitectura.md §5 y §10).
-- Se corren con: npx supabase test db
begin;
create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;

select plan(41);

-- ---------------------------------------------------------------------------
-- Preparación: tres usuarios (dos comercios y un administrador)
-- ---------------------------------------------------------------------------
insert into auth.users (id, email, raw_user_meta_data, aud, role)
values
  ('11111111-1111-1111-1111-111111111111', 'ana@ejemplo.test', '{"nombre":"Ana"}', 'authenticated', 'authenticated'),
  ('22222222-2222-2222-2222-222222222222', 'beto@ejemplo.test', '{"nombre":"Beto"}', 'authenticated', 'authenticated'),
  ('33333333-3333-3333-3333-333333333333', 'admin@ejemplo.test', '{}', 'authenticated', 'authenticated');

update public.profiles set is_platform_admin = true where user_id = '33333333-3333-3333-3333-333333333333';

create function pg_temp.como(p_user uuid) returns void language sql as $$
  select set_config('request.jwt.claims', json_build_object('sub', p_user, 'role', 'authenticated')::text, true);
  set local role authenticated;
$$;
create function pg_temp.como_anonimo() returns void language sql as $$
  select set_config('request.jwt.claims', '{"role":"anon"}', true);
  set local role anon;
$$;
create function pg_temp.como_sistema() returns void language sql as $$
  reset role;
$$;

select is(
  (select nombre from public.profiles where user_id = '11111111-1111-1111-1111-111111111111'),
  'Ana', 'el registro crea el perfil con el nombre'
);

-- Cada usuario crea su negocio
select pg_temp.como('11111111-1111-1111-1111-111111111111');
create temp table ids as select public.crear_organizacion('Electricidad Ana', 'Electricista') as org_ana;
grant select on ids to authenticated, anon;
select pg_temp.como('22222222-2222-2222-2222-222222222222');
create temp table ids_beto as select public.crear_organizacion('Gas Beto', 'Gasista') as org_beto;
select pg_temp.como_sistema();
grant select on ids_beto to authenticated, anon;

-- ---------------------------------------------------------------------------
-- Alta de organización
-- ---------------------------------------------------------------------------
select is(
  (select rol::text from public.memberships m, ids where m.org_id = ids.org_ana),
  'owner', 'quien crea el negocio queda como dueño'
);

select pg_temp.como('11111111-1111-1111-1111-111111111111');
select throws_ok(
  $$ select public.crear_organizacion('Otro negocio') $$,
  'P0001', 'ya_tiene_organizacion', 'un usuario no puede crear un segundo negocio'
);
select throws_ok(
  $$ insert into public.organizations (nombre) values ('Directo') $$,
  '42501', null, 'no se pueden crear organizaciones salteando la función'
);

-- ---------------------------------------------------------------------------
-- Aislamiento entre organizaciones (Ana no ve nada de Beto)
-- ---------------------------------------------------------------------------
select is((select count(*)::int from public.organizations), 1, 'Ana ve una sola organización');
select is(
  (select id from public.organizations), (select org_ana from ids), 'y es la suya'
);
select is(
  (select count(*)::int from public.organizations o, ids_beto where o.id = ids_beto.org_beto),
  0, 'Ana no ve la organización de Beto'
);
select is((select count(*)::int from public.memberships), 1, 'Ana solo ve su membresía');
select is((select count(*)::int from public.profiles), 1, 'Ana solo ve su perfil');

update public.organizations set nombre = 'Hackeado' where id = (select org_beto from ids_beto);
select pg_temp.como_sistema();
select is(
  (select nombre from public.organizations o, ids_beto where o.id = ids_beto.org_beto),
  'Gas Beto', 'Ana no puede modificar la organización de Beto'
);

select pg_temp.como('11111111-1111-1111-1111-111111111111');
select throws_ok(
  format($$ insert into public.memberships (org_id, user_id, rol) values (%L, auth.uid(), 'owner') $$,
         (select org_beto from ids_beto)),
  '42501', null, 'Ana no puede sumarse a la organización de Beto'
);
select throws_ok(
  $$ select public.entitlement((select org_beto from ids_beto), 'presupuestos.por_mes') $$,
  '42501', 'sin_permiso', 'Ana no puede consultar permisos de otra organización'
);

-- Ana sí puede editar su propio negocio
update public.organizations set telefono = '11 5555-0000' where id = (select org_ana from ids);
select is(
  (select telefono from public.organizations where id = (select org_ana from ids)),
  '11 5555-0000', 'el dueño puede editar los datos de su negocio'
);

-- ---------------------------------------------------------------------------
-- Escalada de privilegios
-- ---------------------------------------------------------------------------
select throws_ok(
  $$ update public.profiles set is_platform_admin = true where user_id = auth.uid() $$,
  '42501', null, 'un usuario no puede hacerse administrador'
);
select throws_ok(
  format($$ insert into public.subscriptions (org_id, app_id, plan_id, estado)
            select %L, 'presupuestos', id, 'activa' from public.plans where nombre = 'Pro' $$,
         (select org_ana from ids)),
  '42501', null, 'un usuario no puede darse un plan pago insertando la suscripción'
);
select throws_ok(
  format($$ insert into public.payments (org_id, monto, id_pago_proveedor, pagado_el)
            values (%L, 100, 'X1', now()) $$, (select org_ana from ids)),
  '42501', null, 'un usuario no puede registrar pagos'
);
select throws_ok(
  format($$ select public.admin_activar_plan(%L, (select id from public.plans where nombre = 'Pro'), now() + interval '30 days') $$,
         (select org_ana from ids)),
  '42501', 'solo_administradores', 'un usuario no puede activar planes'
);
select throws_ok(
  format($$ select public._registrar_uso(%L, 'presupuestos.por_mes') $$, (select org_ana from ids)),
  '42501', null, 'las funciones internas no están expuestas a los usuarios'
);
select throws_ok(
  format($$ select public._entitlement(%L, 'presupuestos.por_mes') $$, (select org_beto from ids_beto)),
  '42501', null, 'la función interna de permisos no está expuesta'
);
select is((select count(*)::int from public.audit_log), 0, 'un usuario no ve la auditoría');

-- ---------------------------------------------------------------------------
-- Permisos del plan gratuito (sin suscripción)
-- ---------------------------------------------------------------------------
select is(
  public.entitlement((select org_ana from ids), 'presupuestos.por_mes'), 5,
  'sin suscripción aplica el plan Gratis: 5 presupuestos por mes'
);
select is(
  public.entitlement((select org_ana from ids), 'presupuestos.seguimiento'), 0,
  'el plan Gratis no incluye seguimiento'
);
select is(
  public.entitlement((select org_ana from ids), 'presupuestos.no_existe'), 0,
  'un permiso inexistente vale 0 (no permitido)'
);

-- Límite de uso del plan Gratis
select pg_temp.como_sistema();
select is(public._registrar_uso((select org_ana from ids), 'presupuestos.por_mes'), 1, 'primer uso registrado');
select public._registrar_uso((select org_ana from ids), 'presupuestos.por_mes') from generate_series(2, 5);
select throws_ok(
  format($$ select public._registrar_uso(%L, 'presupuestos.por_mes') $$, (select org_ana from ids)),
  'P0001', 'limite_alcanzado', 'el sexto presupuesto del mes supera el límite del plan Gratis'
);

-- ---------------------------------------------------------------------------
-- Administración
-- ---------------------------------------------------------------------------
select pg_temp.como('33333333-3333-3333-3333-333333333333');
select is(
  (select count(*)::int from public.organizations o
   where o.id in ((select org_ana from ids), (select org_beto from ids_beto))),
  2, 'el administrador ve las organizaciones de todos'
);
select is((select count(*)::int from public.apps), 1, 'el administrador ve las apps ocultas');

select lives_ok(
  format($$ select public.admin_activar_plan(%L, (select id from public.plans where nombre = 'Pro'), now() + interval '30 days') $$,
         (select org_ana from ids)),
  'el administrador activa el plan Pro'
);
select throws_ok(
  format($$ select public.admin_activar_plan(%L, (select id from public.plans where nombre = 'Pro'), now() - interval '1 day') $$,
         (select org_ana from ids)),
  '22023', 'vencimiento_invalido', 'no se puede activar un plan con vencimiento en el pasado'
);
select lives_ok(
  format($$ select public.admin_registrar_pago(%L, 8000, 'MP-123456', now()) $$, (select org_ana from ids)),
  'el administrador registra un pago'
);
select throws_ok(
  format($$ select public.admin_registrar_pago(%L, 8000, 'MP-123456', now()) $$, (select org_ana from ids)),
  '23505', 'pago_duplicado', 'el mismo número de operación no se registra dos veces'
);
select is(
  (select count(*)::int from public.audit_log a
   where a.org_id in ((select org_ana from ids), (select org_beto from ids_beto))),
  4, 'cada acción queda auditada (2 altas de negocio, 1 activación y 1 pago)'
);

-- Con Pro, Ana tiene permisos ilimitados y Beto sigue en Gratis
select pg_temp.como('11111111-1111-1111-1111-111111111111');
select is(public.entitlement((select org_ana from ids), 'presupuestos.por_mes'), -1, 'con Pro los presupuestos son ilimitados');
select is(public.entitlement((select org_ana from ids), 'presupuestos.seguimiento'), 1, 'con Pro hay seguimiento');
select is((select count(*)::int from public.payments), 1, 'el dueño ve sus pagos');
select pg_temp.como('22222222-2222-2222-2222-222222222222');
select is(public.entitlement((select org_beto from ids_beto), 'presupuestos.por_mes'), 5, 'Beto sigue en Gratis');
select is((select count(*)::int from public.payments), 0, 'Beto no ve pagos de otros');
select is((select count(*)::int from public.subscriptions), 0, 'Beto no ve suscripciones de otros');

-- Suspender: vuelve a Gratis
select pg_temp.como('33333333-3333-3333-3333-333333333333');
select public.admin_cambiar_estado_suscripcion(
  (select id from public.subscriptions where org_id = (select org_ana from ids)), 'suspendida');
select pg_temp.como('11111111-1111-1111-1111-111111111111');
select is(public.entitlement((select org_ana from ids), 'presupuestos.por_mes'), 5, 'una suscripción suspendida vuelve a los límites de Gratis');

-- ---------------------------------------------------------------------------
-- Visitantes sin sesión
-- ---------------------------------------------------------------------------
select pg_temp.como_anonimo();
select throws_ok($$ select * from public.organizations $$, '42501', null, 'un visitante no puede leer organizaciones');
select is((select count(*)::int from public.apps), 0, 'un visitante no ve apps ocultas');

select * from finish();
rollback;
