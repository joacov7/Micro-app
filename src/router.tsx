import { createBrowserRouter } from 'react-router'
import { HomePage } from '@/site/HomePage'
import { NotFoundPage } from '@/site/NotFoundPage'

// Rutas previstas en docs/03-diseno.md §2. Se suman por incremento.
export const routes = [
  { path: '/', element: <HomePage /> },
  { path: '*', element: <NotFoundPage /> },
]

export const router = createBrowserRouter(routes)
