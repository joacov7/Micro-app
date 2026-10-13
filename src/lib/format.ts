const enteros = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})
const conCentavos = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/**
 * Formatea un monto en pesos argentinos: 18000 → "$ 18.000" y 1234567.5 → "$ 1.234.567,50".
 * Los montos se guardan en la base como numeric; acá solo se muestran.
 */
export function formatARS(monto: number): string {
  if (!Number.isFinite(monto)) {
    throw new RangeError(`Monto inválido: ${monto}`)
  }
  return Number.isInteger(monto) ? enteros.format(monto) : conCentavos.format(monto)
}
