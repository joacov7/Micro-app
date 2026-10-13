import { describe, expect, it } from 'vitest'
import { calcularTotales, importeLinea, numeroPresupuesto, redondear, venceEl } from './calculos'

describe('redondear', () => {
  it('redondea a centavos con la mitad hacia arriba, como Postgres', () => {
    expect(redondear(8504.125)).toBe(8504.13)
    expect(redondear(1.005)).toBe(1.01)
    expect(redondear(2.344)).toBe(2.34)
    expect(redondear(0)).toBe(0)
  })
})

describe('calcularTotales', () => {
  // Mismo caso que supabase/tests/presupuestos.test.sql
  it('da los mismos números que la base', () => {
    const t = calcularTotales(
      [
        { cantidad: 6, precio_unitario: 18000 },
        { cantidad: 12.5, precio_unitario: 680.33 },
      ],
      10,
    )
    expect(t).toEqual({ subtotal: 116504.13, descuento: 11650.41, total: 104853.72 })
  })

  it('sin ítems todo es cero', () => {
    expect(calcularTotales([], 15)).toEqual({ subtotal: 0, descuento: 0, total: 0 })
  })

  it('redondea cada línea antes de sumar', () => {
    expect(importeLinea({ cantidad: 3, precio_unitario: 0.335 })).toBe(1.01)
  })
})

describe('formatos', () => {
  it('numera con cuatro dígitos', () => {
    expect(numeroPresupuesto(7)).toBe('0007')
    expect(numeroPresupuesto(12345)).toBe('12345')
  })

  it('calcula el vencimiento sumando días', () => {
    expect(venceEl(new Date(2026, 9, 25), 15).toDateString()).toBe(
      new Date(2026, 10, 9).toDateString(),
    )
  })
})
