import { describe, expect, it } from 'vitest'
import { montoParaEditar, parsearMonto } from './montos'

describe('parsearMonto', () => {
  it.each([
    ['18000', 18000],
    ['18.000', 18000],
    ['1.234.567', 1234567],
    ['18.000,50', 18000.5],
    ['18000,5', 18000.5],
    ['$ 18.000', 18000],
    ['0', 0],
    ['3500.50', 3500.5],
  ])('"%s" → %s', (texto, esperado) => {
    expect(parsearMonto(texto)).toBe(esperado)
  })

  it.each(['', 'abc', '-100', '1,2,3', '18.000,555', '12a'])('rechaza "%s"', (texto) => {
    expect(parsearMonto(texto)).toBeNull()
  })
})

describe('montoParaEditar', () => {
  it('usa formato argentino y es reversible', () => {
    expect(montoParaEditar(18000)).toBe('18.000')
    expect(montoParaEditar(18000.5)).toBe('18.000,50')
    expect(parsearMonto(montoParaEditar(1234567.89))).toBe(1234567.89)
  })
})
