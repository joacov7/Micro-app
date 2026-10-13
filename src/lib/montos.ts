/**
 * Convierte lo que escribe una persona en Argentina a un número:
 * "18.000" → 18000 · "18.000,50" → 18000.5 · "$ 1.234" → 1234 · "18000.5" → 18000.5
 * Devuelve null si el texto no es un monto válido.
 */
export function parsearMonto(texto: string): number | null {
  let t = texto.replace(/\$|\s/g, '')
  if (t === '') return null
  if (!/^\d[\d.,]*$/.test(t)) return null

  const comas = (t.match(/,/g) ?? []).length
  const puntos = (t.match(/\./g) ?? []).length
  if (comas > 1) return null
  if (comas === 1) {
    // Formato argentino: puntos de miles y coma decimal.
    t = t.replace(/\./g, '').replace(',', '.')
  } else if (puntos > 1 || /\.\d{3}$/.test(t)) {
    // "18.000" o "1.234.567": puntos de miles.
    t = t.replace(/\./g, '')
  }
  const n = Number(t)
  if (!Number.isFinite(n)) return null
  const partes = t.split('.')
  if (partes[1] && partes[1].length > 2) return null
  return n
}

/** Muestra un monto para editarlo en un campo de texto: 18000.5 → "18.000,50". */
export function montoParaEditar(monto: number): string {
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: Number.isInteger(monto) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(monto)
}
