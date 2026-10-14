import type { EstadoPresupuesto } from './tipos'

export const DIAS_PARA_SEGUIMIENTO = 2

/**
 * Presupuestos que el cliente abrió hace más de 2 días y no respondió:
 * el mejor momento para volver a escribirle.
 */
export function necesitanSeguimiento<
  T extends { estado: EstadoPresupuesto; visto_el: string | null },
>(lista: T[], ahora: Date): T[] {
  const limite = ahora.getTime() - DIAS_PARA_SEGUIMIENTO * 24 * 60 * 60 * 1000
  return lista.filter(
    (p) => p.estado === 'visto' && p.visto_el !== null && new Date(p.visto_el).getTime() <= limite,
  )
}

/** "hoy", "ayer" o "hace N días". */
export function haceCuanto(fecha: string, ahora: Date): string {
  const dias = Math.floor((ahora.getTime() - new Date(fecha).getTime()) / (24 * 60 * 60 * 1000))
  if (dias <= 0) return 'hoy'
  if (dias === 1) return 'ayer'
  return `hace ${dias} días`
}
