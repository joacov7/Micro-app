/**
 * Manifiesto de la app: sus pantallas dentro de /app y su navegación.
 * Una app nueva se suma copiando esta carpeta y registrando su manifiesto en src/router.tsx.
 */
import type { RouteObject } from 'react-router'
import type { ItemNavegacion } from '@/platform/navegacion'
import { IconoClientes, IconoInicio, IconoNegocio, IconoPrecios } from '@/ui/iconos'
import { ClientesPage } from './pages/ClientesPage'
import { InicioPage } from './pages/InicioPage'
import { NegocioPage } from './pages/NegocioPage'
import { PreciosPage } from './pages/PreciosPage'

export const rutasPresupuestos: RouteObject[] = [
  { index: true, element: <InicioPage /> },
  { path: 'precios', element: <PreciosPage /> },
  { path: 'clientes', element: <ClientesPage /> },
  { path: 'negocio', element: <NegocioPage /> },
]

export const navegacionPresupuestos: ItemNavegacion[] = [
  { a: '/app', etiqueta: 'Inicio', Icono: IconoInicio, exacto: true },
  { a: '/app/precios', etiqueta: 'Precios', Icono: IconoPrecios },
  { a: '/app/clientes', etiqueta: 'Clientes', Icono: IconoClientes },
  { a: '/app/negocio', etiqueta: 'Mi negocio', Icono: IconoNegocio },
]
