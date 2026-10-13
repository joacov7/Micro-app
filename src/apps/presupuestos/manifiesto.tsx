/**
 * Manifiesto de la app: sus pantallas dentro de /app y su navegación.
 * Una app nueva se suma copiando esta carpeta y registrando su manifiesto en src/router.tsx.
 */
import type { RouteObject } from 'react-router'
import type { ItemNavegacion } from '@/platform/navegacion'
import { IconoClientes, IconoInicio, IconoNegocio, IconoNuevo, IconoPrecios } from '@/ui/iconos'
import { ClientesPage } from './pages/ClientesPage'
import { DetallePresupuestoPage } from './pages/DetallePresupuestoPage'
import { EditorPresupuestoPage } from './pages/EditorPresupuestoPage'
import { InicioPage } from './pages/InicioPage'
import { NegocioPage } from './pages/NegocioPage'
import { PreciosPage } from './pages/PreciosPage'

export const rutasPresupuestos: RouteObject[] = [
  { index: true, element: <InicioPage /> },
  { path: 'presupuestos/nuevo', element: <EditorPresupuestoPage /> },
  { path: 'presupuestos/:id', element: <DetallePresupuestoPage /> },
  { path: 'presupuestos/:id/editar', element: <EditorPresupuestoPage /> },
  { path: 'precios', element: <PreciosPage /> },
  { path: 'clientes', element: <ClientesPage /> },
  { path: 'negocio', element: <NegocioPage /> },
]

export const navegacionPresupuestos: ItemNavegacion[] = [
  { a: '/app', etiqueta: 'Presupuestos', Icono: IconoInicio, exacto: true },
  { a: '/app/presupuestos/nuevo', etiqueta: 'Nuevo', Icono: IconoNuevo },
  { a: '/app/precios', etiqueta: 'Precios', Icono: IconoPrecios },
  { a: '/app/clientes', etiqueta: 'Clientes', Icono: IconoClientes },
  { a: '/app/negocio', etiqueta: 'Negocio', Icono: IconoNegocio },
]
