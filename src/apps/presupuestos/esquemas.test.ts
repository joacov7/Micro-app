import { describe, expect, it } from 'vitest'
import { ajustesEsquema, clienteEsquema, itemEsquema } from './esquemas'

describe('ítem', () => {
  it('convierte el precio escrito en formato argentino', () => {
    const r = itemEsquema.parse({
      nombre: ' Boca de luz ',
      unidad: 'boca',
      precio: '18.000,50',
      categoria: 'Mano de obra',
    })
    expect(r).toEqual({
      nombre: 'Boca de luz',
      unidad: 'boca',
      precio: 18000.5,
      categoria: 'Mano de obra',
    })
  })

  it('rechaza un precio inválido con un mensaje claro', () => {
    const r = itemEsquema.safeParse({
      nombre: 'X',
      unidad: 'u.',
      precio: 'mucho',
      categoria: 'Otro',
    })
    expect(r.success).toBe(false)
    expect(r.error?.issues[0]?.message).toMatch(/precio válido/)
  })
})

describe('cliente', () => {
  it('acepta un cliente sin email ni teléfono', () => {
    expect(
      clienteEsquema.safeParse({ nombre: 'Laura', telefono: '', email: '', notas: '' }).success,
    ).toBe(true)
  })

  it('rechaza un email mal escrito', () => {
    expect(
      clienteEsquema.safeParse({ nombre: 'Laura', telefono: '', email: 'laura@', notas: '' })
        .success,
    ).toBe(false)
  })
})

describe('ajustes', () => {
  it('convierte la validez a número', () => {
    expect(
      ajustesEsquema.parse({ validez_dias: '15', forma_pago: '', notas_pie: '' }).validez_dias,
    ).toBe(15)
  })

  it.each(['0', '400', '1.5', ''])('rechaza una validez de "%s" días', (v) => {
    expect(
      ajustesEsquema.safeParse({ validez_dias: v, forma_pago: '', notas_pie: '' }).success,
    ).toBe(false)
  })
})
