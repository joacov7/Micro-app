import { useNavigate } from 'react-router'
import { Button } from '@/ui/button'
import { usePermiso, useOrganizacionActual } from '../contract'
import { supabase } from '../supabase'

const iniciales = (nombre: string) =>
  nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')

/** Inicio provisorio del panel. Los presupuestos llegan en los incrementos 3 a 5. */
export function InicioAppPage() {
  const navigate = useNavigate()
  const { data: org } = useOrganizacionActual()
  const limite = usePermiso(org?.id, 'presupuestos.por_mes')
  if (!org) return null

  const salir = async () => {
    // Primero salir del panel: si no, el área privada redirige a /entrar al perder la sesión.
    navigate('/', { replace: true })
    await supabase().auth.signOut()
  }

  const plan =
    limite.data === undefined
      ? 'Consultando tu plan…'
      : limite.data === -1
        ? 'Plan Pro: presupuestos ilimitados.'
        : `Plan Gratis: hasta ${limite.data} presupuestos por mes.`

  return (
    <div className="mx-auto flex min-h-full max-w-3xl flex-col">
      <header className="bg-card flex items-center gap-3 border-b px-4 py-3">
        <span
          aria-hidden="true"
          className="bg-primary font-display text-primary-foreground grid size-10 shrink-0 place-items-center rounded-md text-lg font-bold"
        >
          {iniciales(org.nombre)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display truncate text-xl font-semibold">{org.nombre}</p>
          {org.rubro && <p className="text-muted-foreground text-sm">{org.rubro}</p>}
        </div>
        <Button variant="borde" onClick={salir}>
          Salir
        </Button>
      </header>
      <main className="flex flex-col gap-4 p-4">
        <h1 className="text-3xl font-bold">¡Tu negocio está listo!</h1>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            Tu plan
          </p>
          <p className="mt-1 text-lg">{plan}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="font-semibold">Muy pronto</p>
          <p className="text-muted-foreground">
            Acá vas a cargar tus precios y armar tus presupuestos. Estamos terminando esa parte.
          </p>
        </div>
      </main>
    </div>
  )
}
