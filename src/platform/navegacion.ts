import type { ComponentType, SVGProps } from 'react'

/** Ítem de la barra de navegación del panel. Cada micro-app declara los suyos. */
export type ItemNavegacion = {
  a: string
  etiqueta: string
  Icono: ComponentType<SVGProps<SVGSVGElement>>
  exacto?: boolean
}
