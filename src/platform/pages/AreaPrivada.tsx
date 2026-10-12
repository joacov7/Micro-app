import { Navigate, Outlet, useLocation } from 'react-router'
import { Aviso } from '@/ui/campo'
import { useOrganizacionActual } from '../contract'
import { traducirError } from '../errores'
import { useSesion } from '../sesion-contexto'
import { CrearNegocioPage } from './CrearNegocioPage'

/** Protege /app: exige sesión y, si todavía no hay negocio, pide crearlo. */
export function AreaPrivada() {
  const { sesion, cargando } = useSesion()
  const location = useLocation()
  const org = useOrganizacionActual()

  if (cargando) return <Cargando />
  if (!sesion) return <Navigate to="/entrar" replace state={{ desde: location.pathname }} />
  if (org.isPending) return <Cargando />
  if (org.isError) {
    return (
      <div className="mx-auto max-w-sm px-4 py-8">
        <Aviso>{traducirError(org.error)}</Aviso>
      </div>
    )
  }
  if (!org.data) return <CrearNegocioPage />
  return <Outlet />
}

function Cargando() {
  return (
    <p role="status" className="text-muted-foreground px-4 py-8 text-center">
      Cargando…
    </p>
  )
}
