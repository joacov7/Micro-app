import type { Session } from '@supabase/supabase-js'
import { createContext, useContext } from 'react'

export type EstadoSesion = {
  sesion: Session | null
  cargando: boolean
  /** true cuando el usuario llegó desde el link de "recuperar contraseña". */
  recuperando: boolean
}

export const SesionContexto = createContext<EstadoSesion>({
  sesion: null,
  cargando: true,
  recuperando: false,
})

export function useSesion() {
  return useContext(SesionContexto)
}
