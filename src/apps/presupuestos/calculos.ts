/**
 * Cálculo de totales en el navegador, idéntico al de la base
 * (supabase/migrations/*_presupuestos.sql): cada línea se redondea a centavos,
 * el descuento también, y el total es la resta. La base vuelve a calcular al guardar;
 * esto es solo para mostrar los números mientras se arma el presupuesto.
 */
export type Linea = { cantidad: number; precio_unitario: number }

/** Redondeo a centavos "mitad hacia arriba", como round(numeric, 2) en Postgres. */
export function redondear(monto: number): number {
  const centavos = Math.round(Math.abs(monto) * 100 + 1e-7)
  return (Math.sign(monto) * centavos) / 100
}

export function importeLinea(l: Linea): number {
  return redondear(l.cantidad * l.precio_unitario)
}

export function calcularTotales(lineas: Linea[], descuentoPct: number) {
  const subtotal = redondear(lineas.reduce((suma, l) => suma + importeLinea(l), 0))
  const descuento = redondear((subtotal * descuentoPct) / 100)
  return { subtotal, descuento, total: redondear(subtotal - descuento) }
}

/** Número con ceros a la izquierda, como en los talonarios: 7 → "0007". */
export const numeroPresupuesto = (n: number) => String(n).padStart(4, '0')

/** Fecha hasta la que vale el presupuesto. */
export function venceEl(emitido: Date, validezDias: number): Date {
  const d = new Date(emitido)
  d.setDate(d.getDate() + validezDias)
  return d
}
