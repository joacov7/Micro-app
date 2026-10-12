const ars = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

/**
 * Formatea un monto en pesos argentinos: 1234567.5 → "$ 1.234.567,5".
 * Los montos se guardan en la base como numeric; acá solo se muestran.
 */
export function formatARS(monto: number): string {
  if (!Number.isFinite(monto)) {
    throw new RangeError(`Monto inválido: ${monto}`)
  }
  return ars.format(monto)
}
