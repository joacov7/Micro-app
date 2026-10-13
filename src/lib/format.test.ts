import { describe, expect, it } from 'vitest'
import { formatARS } from './format'

// Intl usa un espacio duro (U+00A0) entre el signo y el número.
const normalizar = (s: string) => s.replace(/ /g, ' ')

describe('formatARS', () => {
  it('usa punto para miles y coma con dos decimales para los centavos', () => {
    expect(normalizar(formatARS(1234567.5))).toBe('$ 1.234.567,50')
    expect(normalizar(formatARS(0.07))).toBe('$ 0,07')
  })

  it('no muestra decimales en montos enteros', () => {
    expect(normalizar(formatARS(18000))).toBe('$ 18.000')
  })

  it('formatea cero', () => {
    expect(normalizar(formatARS(0))).toBe('$ 0')
  })

  it('rechaza valores que no son números', () => {
    expect(() => formatARS(Number.NaN)).toThrow(RangeError)
    expect(() => formatARS(Number.POSITIVE_INFINITY)).toThrow(RangeError)
  })
})
