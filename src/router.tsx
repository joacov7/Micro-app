import { createBrowserRouter } from 'react-router'
import { AreaPrivada } from '@/platform/pages/AreaPrivada'
import { EntrarPage } from '@/platform/pages/EntrarPage'
import { InicioAppPage } from '@/platform/pages/InicioAppPage'
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
    children: [{ index: true, element: <InicioAppPage /> }],
  },
  { path: '*', element: <NotFoundPage /> },
]

export const router = createBrowserRouter(routes)
