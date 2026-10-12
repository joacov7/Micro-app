/**
 * Contrato de plataforma para las micro-apps (docs/04-arquitectura.md §3).
 * Las apps usan SOLO estas funciones; nunca leen tablas de la plataforma ni de otras apps.
 */
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSesion } from './sesion-contexto'
import { supabase } from './supabase'

export type Organizacion = {
  id: string
  nombre: string
  rubro: string | null
  telefono: string | null
  rol: 'owner' | 'member'
}

const claveOrg = (userId: string | undefined) => ['organizacion-actual', userId] as const

/** Organización del usuario con sesión (null si todavía no creó su negocio). */
export function useOrganizacionActual() {
  const { sesion } = useSesion()
  const userId = sesion?.user.id
  return useQuery({
    queryKey: claveOrg(userId),
    enabled: !!userId,
    queryFn: async (): Promise<Organizacion | null> => {
      const { data, error } = await supabase()
        .from('memberships')
        .select('rol, organizations (id, nombre, rubro, telefono)')
        .eq('user_id', userId!)
        .limit(1)
        .maybeSingle()
      if (error) throw error
      if (!data?.organizations) return null
      return { ...data.organizations, rol: data.rol }
    },
  })
}

export function useRefrescarOrganizacion() {
  const qc = useQueryClient()
  return () => qc.invalidateQueries({ queryKey: ['organizacion-actual'] })
}

/** Valor de un permiso del plan: 0 = no, 1 = sí, N = límite, -1 = ilimitado. */
export function usePermiso(orgId: string | undefined, clave: string) {
  return useQuery({
    queryKey: ['permiso', orgId, clave],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase().rpc('entitlement', { p_org: orgId!, p_clave: clave })
      if (error) throw error
      return data
    },
  })
}
