/**
 * Acceso a datos de la app Presupuestador. Solo toca tablas pres_* y funciones pres_*;
 * de la plataforma usa únicamente el contrato (@/platform/contract).
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/platform/supabase'
import type { AjustesDatos, ClienteDatos, ItemDatos } from './esquemas'

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
