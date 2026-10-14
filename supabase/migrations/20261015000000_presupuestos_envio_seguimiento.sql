-- App Presupuestador, incremento 5: envío, link para el cliente, visto, respuesta,
-- vencimiento y duplicar.
--
-- El cliente final no tiene cuenta: accede SOLO con el código del link (token_publico,
-- 128 bits aleatorios) y SOLO a través de estas funciones. Las tablas siguen cerradas
-- para visitantes anónimos.
--
-- Los cambios de estado marcan la transacción con pres.cambio_de_estado = 'si' para
-- pasar la regla "solo se editan borradores" (pres_validar_presupuesto).

-- ---------------------------------------------------------------------------
-- Utilidades
-- ---------------------------------------------------------------------------
create function public.pres_vence_el(p public.pres_presupuestos)
returns timestamptz
language sql
immutable
set search_path = ''
as $$
  select coalesce(p.enviado_el, p.created_at) + make_interval(days => p.validez_dias);
$$;

create function public._pres_cambiar_estado(p_id uuid, p_estado text, p_extra jsonb default '{}'::jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform set_config('pres.cambio_de_estado', 'si', true);
  update public.pres_presupuestos set
    estado = p_estado,
    enviado_el = case when p_estado = 'enviado' then coalesce(enviado_el, now()) else enviado_el end,
    visto_el = case when p_estado = 'visto' then coalesce(visto_el, now()) else visto_el end,
    respondido_el = case when p_estado in ('aceptado', 'rechazado') then now() else respondido_el end,
    motivo_rechazo = case when p_estado = 'rechazado' then nullif(btrim(p_extra ->> 'motivo'), '') else motivo_rechazo end
  where id = p_id;
  perform set_config('pres.cambio_de_estado', '', true);
end;
$$;

-- ---------------------------------------------------------------------------
-- Para el negocio (requiere ser miembro)
-- ---------------------------------------------------------------------------

-- Marca el presupuesto como enviado (si era borrador) y devuelve el código del link.
create function public.pres_marcar_enviado(p_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v public.pres_presupuestos;
begin
  select * into v from public.pres_presupuestos where id = p_id;
  if v.id is null or not public.es_miembro(v.org_id) then
    raise exception 'sin_permiso' using errcode = '42501';
  end if;
  if v.estado = 'borrador' then
    perform public._pres_cambiar_estado(p_id, 'enviado');
  end if;
  return v.token_publico;
end;
$$;

-- El negocio registra la respuesta que recibió por otro medio (teléfono, en persona).
create function public.pres_marcar_respuesta(p_id uuid, p_respuesta text, p_motivo text default null)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v public.pres_presupuestos;
  v_estado text := case p_respuesta when 'aceptar' then 'aceptado' when 'rechazar' then 'rechazado' end;
begin
  select * into v from public.pres_presupuestos where id = p_id;
  if v.id is null or not public.es_miembro(v.org_id) then
    raise exception 'sin_permiso' using errcode = '42501';
  end if;
  if v_estado is null then
    raise exception 'respuesta_invalida' using errcode = '22023';
  end if;
  if v.estado not in ('enviado', 'visto', 'vencido') then
    raise exception 'presupuesto_no_respondible' using errcode = 'P0001';
  end if;
  perform public._pres_cambiar_estado(p_id, v_estado, jsonb_build_object('motivo', p_motivo));
  return v_estado;
end;
$$;

-- Crea un borrador nuevo a partir de otro. Con p_actualizar_precios, los ítems que vienen
-- de "mis precios" toman el precio actual de la lista.
create function public.pres_duplicar(p_id uuid, p_actualizar_precios boolean default true)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v public.pres_presupuestos;
  v_nuevo uuid;
begin
  select * into v from public.pres_presupuestos where id = p_id;
  if v.id is null or not public.es_miembro(v.org_id) then
    raise exception 'sin_permiso' using errcode = '42501';
  end if;

  insert into public.pres_presupuestos
    (org_id, cliente_id, cliente_nombre, cliente_telefono, descuento_pct, validez_dias, forma_pago, notas, created_by)
  values
    (v.org_id, v.cliente_id, v.cliente_nombre, v.cliente_telefono, v.descuento_pct, v.validez_dias, v.forma_pago,
     v.notas, auth.uid())
  returning id into v_nuevo;

  insert into public.pres_presupuesto_items
    (presupuesto_id, orden, item_id, descripcion, unidad, cantidad, precio_unitario)
  select v_nuevo, i.orden, i.item_id, i.descripcion, i.unidad, i.cantidad,
         case when p_actualizar_precios and l.activo then l.precio else i.precio_unitario end
  from public.pres_presupuesto_items i
  left join public.pres_items l on l.id = i.item_id
  where i.presupuesto_id = p_id;

  return v_nuevo;
end;
$$;

-- ---------------------------------------------------------------------------
-- Para el cliente final (sin cuenta, solo con el código del link)
-- ---------------------------------------------------------------------------

-- Devuelve el presupuesto para mostrarlo. La primera vez que lo abre alguien que no es
-- del negocio, queda marcado como "visto". Un borrador no se muestra a terceros.
create function public.pres_ver_presupuesto(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v public.pres_presupuestos;
  v_es_del_negocio boolean;
  v_org public.organizations;
  v_ajustes public.pres_ajustes;
begin
  if p_token is null or p_token !~ '^[0-9a-f]{32}$' then
    return null;
  end if;
  select * into v from public.pres_presupuestos where token_publico = p_token;
  if v.id is null then
    return null;
  end if;
  v_es_del_negocio := auth.uid() is not null and public.es_miembro(v.org_id);
  if v.estado = 'borrador' and not v_es_del_negocio then
    return null;
  end if;

  -- Vencido: se marca al consultarlo (además de la tarea diaria).
  if v.estado in ('enviado', 'visto') and now() > public.pres_vence_el(v) then
    perform public._pres_cambiar_estado(v.id, 'vencido');
  elsif v.estado = 'enviado' and not v_es_del_negocio then
    perform public._pres_cambiar_estado(v.id, 'visto');
  end if;
  select * into v from public.pres_presupuestos where id = v.id;
  select * into v_org from public.organizations where id = v.org_id;
  select * into v_ajustes from public.pres_ajustes where org_id = v.org_id;

  return jsonb_build_object(
    'presupuesto', jsonb_build_object(
      'numero', v.numero, 'estado', v.estado, 'cliente_nombre', v.cliente_nombre,
      'cliente_telefono', v.cliente_telefono, 'descuento_pct', v.descuento_pct, 'subtotal', v.subtotal,
      'descuento', v.descuento, 'total', v.total, 'validez_dias', v.validez_dias, 'forma_pago', v.forma_pago,
      'notas', v.notas, 'created_at', v.created_at, 'enviado_el', v.enviado_el, 'visto_el', v.visto_el,
      'respondido_el', v.respondido_el, 'vence_el', public.pres_vence_el(v),
      'items', coalesce((
        select jsonb_agg(jsonb_build_object(
          'descripcion', i.descripcion, 'unidad', i.unidad, 'cantidad', i.cantidad,
          'precio_unitario', i.precio_unitario) order by i.orden)
        from public.pres_presupuesto_items i where i.presupuesto_id = v.id
      ), '[]'::jsonb)
    ),
    'emisor', jsonb_build_object(
      'nombre', v_org.nombre, 'rubro', v_org.rubro, 'telefono', v_org.telefono,
      'notas_pie', v_ajustes.notas_pie
    ),
    'con_marca', public._entitlement(v.org_id, 'presupuestos.sin_marca') <> 1,
    'es_del_negocio', v_es_del_negocio
  );
end;
$$;

-- El cliente acepta o rechaza desde el link. Una sola vez, y solo si no venció.
-- Devuelve el estado final: 'aceptado', 'rechazado' o 'vencido'.
create function public.pres_responder_presupuesto(p_token text, p_respuesta text, p_motivo text default null)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v public.pres_presupuestos;
  v_estado text := case p_respuesta when 'aceptar' then 'aceptado' when 'rechazar' then 'rechazado' end;
begin
  if v_estado is null then
    raise exception 'respuesta_invalida' using errcode = '22023';
  end if;
  if p_token is null or p_token !~ '^[0-9a-f]{32}$' then
    raise exception 'presupuesto_inexistente' using errcode = 'P0002';
  end if;
  select * into v from public.pres_presupuestos where token_publico = p_token for update;
  if v.id is null or v.estado = 'borrador' then
    raise exception 'presupuesto_inexistente' using errcode = 'P0002';
  end if;
  if v.estado in ('aceptado', 'rechazado') then
    raise exception 'ya_respondido' using errcode = 'P0001';
  end if;
  -- Vencido: no se acepta. Se devuelve 'vencido' (sin error) para que el cambio de estado
  -- quede guardado; un error desharía también ese cambio.
  if v.estado = 'vencido' or now() > public.pres_vence_el(v) then
    if v.estado <> 'vencido' then
      perform public._pres_cambiar_estado(v.id, 'vencido');
    end if;
    return 'vencido';
  end if;
  if char_length(coalesce(p_motivo, '')) > 500 then
    raise exception 'motivo_muy_largo' using errcode = '22023';
  end if;
  perform public._pres_cambiar_estado(v.id, v_estado, jsonb_build_object('motivo', p_motivo));
  return v_estado;
end;
$$;

-- ---------------------------------------------------------------------------
-- Tarea diaria: marcar vencidos los presupuestos sin respuesta pasada su validez.
-- ---------------------------------------------------------------------------
create function public.pres_vencer_presupuestos()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_cantidad integer;
begin
  perform set_config('pres.cambio_de_estado', 'si', true);
  update public.pres_presupuestos p set estado = 'vencido'
   where p.estado in ('enviado', 'visto') and now() > public.pres_vence_el(p);
  get diagnostics v_cantidad = row_count;
  perform set_config('pres.cambio_de_estado', '', true);
  return v_cantidad;
end;
$$;

create extension if not exists pg_cron;
-- Todos los días a las 06:00 de Argentina (09:00 UTC).
select cron.schedule('pres-vencer-presupuestos', '0 9 * * *', $$ select public.pres_vencer_presupuestos() $$);

-- ---------------------------------------------------------------------------
-- Permisos de ejecución
-- ---------------------------------------------------------------------------
revoke all on function
  public.pres_vence_el(public.pres_presupuestos),
  public._pres_cambiar_estado(uuid, text, jsonb),
  public.pres_marcar_enviado(uuid),
  public.pres_marcar_respuesta(uuid, text, text),
  public.pres_duplicar(uuid, boolean),
  public.pres_ver_presupuesto(text),
  public.pres_responder_presupuesto(text, text, text),
  public.pres_vencer_presupuestos()
from public, anon, authenticated;

grant execute on function
  public.pres_marcar_enviado(uuid),
  public.pres_marcar_respuesta(uuid, text, text),
  public.pres_duplicar(uuid, boolean)
to authenticated;

grant execute on function
  public.pres_ver_presupuesto(text),
  public.pres_responder_presupuesto(text, text, text)
to anon, authenticated;
