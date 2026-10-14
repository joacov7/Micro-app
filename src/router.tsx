import { createBrowserRouter } from 'react-router'
import {
  navegacionPresupuestos,
  rutasPresupuestos,
  rutasPublicasPresupuestos,
} from '@/apps/presupuestos/manifiesto'
import { AreaPrivada } from '@/platform/pages/AreaPrivada'
import { EntrarPage } from '@/platform/pages/EntrarPage'
import { LayoutApp } from '@/platform/pages/LayoutApp'
import { NuevaClavePage } from '@/platform/pages/NuevaClavePage'
import { RecuperarPage } from '@/platform/pages/RecuperarPage'
import { RegistroPage } from '@/platform/pages/RegistroPage'
import { HomePage } from '@/site/HomePage'
import { NotFoundPage } from '@/site/NotFoundPage'

// Rutas previstas en docs/03-diseno.md §2. Se suman por incremento.
export const routes = [
  { path: '/', element: <HomePage /> },
  { path: '/registro', element: <RegistroPage /> },
  { path: '/entrar', element: <EntrarPage /> },
  { path: '/recuperar', element: <RecuperarPage /> },
  { path: '/nueva-clave', element: <NuevaClavePage /> },
  {
    path: '/app',
    element: <AreaPrivada />,
    children: [
      {
        element: <LayoutApp navegacion={navegacionPresupuestos} />,
        children: rutasPresupuestos,
      },
    ],
  },
  ...rutasPublicasPresupuestos,
  { path: '*', element: <NotFoundPage /> },
]

export const router = createBrowserRouter(routes)
