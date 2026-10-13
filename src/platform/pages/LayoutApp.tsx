import { NavLink, Outlet, useNavigate } from 'react-router'
import { iniciales } from '@/lib/texto'
import { Button } from '@/ui/button'
import { useOrganizacionActual } from '../contract'
import type { ItemNavegacion } from '../navegacion'
import { supabase } from '../supabase'

/** Marco del panel: encabezado con el negocio y navegación inferior (celular) o lateral. */
export function LayoutApp({ navegacion }: { navegacion: ItemNavegacion[] }) {
  const navigate = useNavigate()
  const { data: org } = useOrganizacionActual()
  if (!org) return null

  const salir = async () => {
    // Primero salir del panel: si no, el área privada redirige a /entrar al perder la sesión.
    navigate('/', { replace: true })
    await supabase().auth.signOut()
  }

  return (
    <div className="mx-auto flex min-h-full max-w-3xl flex-col pb-20">
      <header className="bg-card sticky top-[env(safe-area-inset-top,0px)] z-10 flex items-center gap-3 border-b px-4 py-3">
        <span
          aria-hidden="true"
          className="bg-primary font-display text-primary-foreground grid size-10 shrink-0 place-items-center rounded-md text-lg font-bold"
        >
          {iniciales(org.nombre)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display truncate text-xl font-semibold">{org.nombre}</p>
          {org.rubro && <p className="text-muted-foreground truncate text-sm">{org.rubro}</p>}
        </div>
        <Button variant="borde" onClick={salir}>
          Salir
        </Button>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4">
        <Outlet />
      </main>

      <nav
        aria-label="Secciones"
        className="bg-card fixed inset-x-0 bottom-0 z-10 border-t pb-[env(safe-area-inset-bottom,0px)]"
      >
        <ul
          className="mx-auto grid max-w-3xl"
          style={{ gridTemplateColumns: `repeat(${navegacion.length}, 1fr)` }}
        >
          {navegacion.map(({ a, etiqueta, Icono, exacto }) => (
            <li key={a}>
              <NavLink
                to={a}
                end={exacto}
                className={({ isActive }) =>
                  `flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs ${
                    isActive ? 'text-foreground font-semibold' : 'text-muted-foreground'
                  }`
                }
              >
                <Icono className="size-6" />
                {etiqueta}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
