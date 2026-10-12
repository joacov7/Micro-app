import { useEffect, useState, type ReactNode } from 'react'
import { SesionContexto, type EstadoSesion } from './sesion-contexto'
import { supabase } from './supabase'

export function ProveedorSesion({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<EstadoSesion>({
    sesion: null,
    cargando: true,
    recuperando: false,
  })

  useEffect(() => {
    const cliente = supabase()
    cliente.auth.getSession().then(({ data }) => {
      setEstado((e) => ({ ...e, sesion: data.session, cargando: false }))
    })
    const { data } = cliente.auth.onAuthStateChange((evento, sesion) => {
      setEstado((e) => ({
        sesion,
        cargando: false,
        recuperando:
          evento === 'PASSWORD_RECOVERY' ? true : evento === 'SIGNED_OUT' ? false : e.recuperando,
      }))
    })
    return () => data.subscription.unsubscribe()
  }, [])

  return <SesionContexto.Provider value={estado}>{children}</SesionContexto.Provider>
}
