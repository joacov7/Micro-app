/**
 * Acceso a datos de la app Presupuestador. Solo toca tablas pres_* y funciones pres_*;
 * de la plataforma usa únicamente el contrato (@/platform/contract).
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/platform/supabase'
import type { AjustesDatos, ClienteDatos, ItemDatos } from './esquemas'
import type { EstadoPresupuesto, LineaPresupuesto, Presupuesto } from './tipos'

export type Item = ItemDatos & { id: string }
export type Cliente = {
  id: string
  nombre: string
  telefono: string | null
  email: string | null
  notas: string | null
}
export type Ajustes = { validez_dias: number; forma_pago: string | null; notas_pie: string | null }

const claves = {
  items: (org: string) => ['pres', org, 'items'] as const,
  clientes: (org: string) => ['pres', org, 'clientes'] as const,
  ajustes: (org: string) => ['pres', org, 'ajustes'] as const,
}

// ---------------------------------------------------------------- Ítems
export function useItems(orgId: string) {
  return useQuery({
    queryKey: claves.items(orgId),
    queryFn: async (): Promise<Item[]> => {
      const { data, error } = await supabase()
        .from('pres_items')
        .select('id, nombre, unidad, precio, categoria')
        .eq('org_id', orgId)
        .eq('activo', true)
        .order('categoria')
        .order('nombre')
      if (error) throw error
      return data.map((i) => ({ ...i, categoria: i.categoria as Item['categoria'] }))
    },
  })
}

export function useGuardarItem(orgId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...datos }: ItemDatos & { id?: string }) => {
      const q = id
        ? supabase().from('pres_items').update(datos).eq('id', id)
        : supabase()
            .from('pres_items')
            .insert({ ...datos, org_id: orgId })
      const { error } = await q
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: claves.items(orgId) }),
  })
}

/** Archiva el ítem: deja de aparecer, pero los presupuestos ya hechos no cambian. */
export function useArchivarItem(orgId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase().from('pres_items').update({ activo: false }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: claves.items(orgId) }),
  })
}

export function useCargarEjemplos(orgId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase().rpc('pres_cargar_ejemplos', { p_org: orgId })
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: claves.items(orgId) }),
  })
}

// ---------------------------------------------------------------- Clientes
export function useClientes(orgId: string) {
  return useQuery({
    queryKey: claves.clientes(orgId),
    queryFn: async (): Promise<Cliente[]> => {
      const { data, error } = await supabase()
        .from('pres_clientes')
        .select('id, nombre, telefono, email, notas')
        .eq('org_id', orgId)
        .order('nombre')
      if (error) throw error
      return data
    },
  })
}

const vacioANull = (v: string) => (v.trim() === '' ? null : v.trim())

export function useGuardarCliente(orgId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...d }: ClienteDatos & { id?: string }) => {
      const fila = {
        nombre: d.nombre,
        telefono: vacioANull(d.telefono),
        email: vacioANull(d.email),
        notas: vacioANull(d.notas),
      }
      const q = id
        ? supabase().from('pres_clientes').update(fila).eq('id', id)
        : supabase()
            .from('pres_clientes')
            .insert({ ...fila, org_id: orgId })
      const { error } = await q
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: claves.clientes(orgId) }),
  })
}

export function useBorrarCliente(orgId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase().from('pres_clientes').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: claves.clientes(orgId) }),
  })
}

// ---------------------------------------------------------------- Ajustes
export const AJUSTES_POR_DEFECTO: Ajustes = { validez_dias: 15, forma_pago: null, notas_pie: null }

export function useAjustes(orgId: string) {
  return useQuery({
    queryKey: claves.ajustes(orgId),
    queryFn: async (): Promise<Ajustes> => {
      const { data, error } = await supabase()
        .from('pres_ajustes')
        .select('validez_dias, forma_pago, notas_pie')
        .eq('org_id', orgId)
        .maybeSingle()
      if (error) throw error
      return data ?? AJUSTES_POR_DEFECTO
    },
  })
}

export function useGuardarAjustes(orgId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (d: AjustesDatos) => {
      const fila = {
        validez_dias: d.validez_dias,
        forma_pago: vacioANull(d.forma_pago),
        notas_pie: vacioANull(d.notas_pie),
      }
      // Actualizar y, si todavía no existen, crear. (Un upsert intentaría reescribir org_id,
      // que a propósito no se puede modificar.)
      const actualizado = await supabase()
        .from('pres_ajustes')
        .update(fila)
        .eq('org_id', orgId)
        .select('org_id')
      if (actualizado.error) throw actualizado.error
      if (actualizado.data.length > 0) return
      const { error } = await supabase()
        .from('pres_ajustes')
        .insert({ ...fila, org_id: orgId })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: claves.ajustes(orgId) }),
  })
}

// ---------------------------------------------------------------- Presupuestos
export type ResumenPresupuesto = Pick<
  Presupuesto,
  'id' | 'numero' | 'estado' | 'cliente_nombre' | 'total' | 'created_at' | 'enviado_el' | 'visto_el'
>

const clavePresupuestos = (org: string) => ['pres', org, 'presupuestos'] as const
const clavePresupuesto = (org: string, id: string) => ['pres', org, 'presupuestos', id] as const

export function usePresupuestos(orgId: string) {
  return useQuery({
    queryKey: clavePresupuestos(orgId),
    queryFn: async (): Promise<ResumenPresupuesto[]> => {
      const { data, error } = await supabase()
        .from('pres_presupuestos')
        .select('id, numero, estado, cliente_nombre, total, created_at, enviado_el, visto_el')
        .eq('org_id', orgId)
        .order('numero', { ascending: false })
        .limit(200)
      if (error) throw error
      return data.map((p) => ({ ...p, estado: p.estado as EstadoPresupuesto }))
    },
  })
}

export function usePresupuesto(orgId: string, id: string | undefined) {
  return useQuery({
    queryKey: clavePresupuesto(orgId, id ?? ''),
    enabled: !!id,
    queryFn: async (): Promise<Presupuesto | null> => {
      const { data, error } = await supabase()
        .from('pres_presupuestos')
        .select(
          `id, numero, estado, cliente_id, cliente_nombre, cliente_telefono, descuento_pct, subtotal,
           descuento, total, validez_dias, forma_pago, notas, created_at, enviado_el, visto_el,
           items:pres_presupuesto_items (id, orden, item_id, descripcion, unidad, cantidad, precio_unitario)`,
        )
        .eq('org_id', orgId)
        .eq('id', id!)
        .order('orden', { referencedTable: 'pres_presupuesto_items' })
        .maybeSingle()
      if (error) throw error
      if (!data) return null
      return { ...data, estado: data.estado as EstadoPresupuesto }
    },
  })
}

export type DatosPresupuesto = {
  id?: string
  cliente_id: string | null
  cliente_nombre: string
  cliente_telefono: string
  guardar_cliente: boolean
  descuento_pct: number
  validez_dias: number
  forma_pago: string
  notas: string
  items: LineaPresupuesto[]
}

/** Guarda encabezado e ítems en una sola operación (todo o nada). Devuelve el id. */
export function useGuardarPresupuesto(orgId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (d: DatosPresupuesto): Promise<string> => {
      const { data, error } = await supabase().rpc('pres_guardar_presupuesto', {
        p_org: orgId,
        // La función acepta null en p_id y p_cliente_id; los tipos generados no lo reflejan.
        p_id: (d.id ?? null) as unknown as string,
        p_cliente_id: d.cliente_id as unknown as string,
        p_cliente_nombre: d.cliente_nombre,
        p_cliente_telefono: d.cliente_telefono,
        p_guardar_cliente: d.guardar_cliente,
        p_descuento_pct: d.descuento_pct,
        p_validez_dias: d.validez_dias,
        p_forma_pago: d.forma_pago,
        p_notas: d.notas,
        p_items: d.items.map((i) => ({
          item_id: i.item_id,
          descripcion: i.descripcion,
          unidad: i.unidad,
          cantidad: i.cantidad,
          precio_unitario: i.precio_unitario,
        })),
      })
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: clavePresupuestos(orgId) })
      qc.invalidateQueries({ queryKey: claves.clientes(orgId) })
    },
  })
}

export function useBorrarPresupuesto(orgId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase().from('pres_presupuestos').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: clavePresupuestos(orgId) }),
  })
}
