import { describe, expect, it } from 'vitest'
import { contrasena, negocioEsquema, nuevaClaveEsquema, registroEsquema } from './esquemas'

describe('contraseña', () => {
  it('acepta 8 caracteres con letras y números', () => {
    expect(contrasena.safeParse('obra2026').success).toBe(true)
  })

  it.each([
    ['corta', 'ab12'],
    ['sin números', 'soloLetras'],
    ['sin letras', '12345678'],
  ])('rechaza una contraseña %s', (_caso, valor) => {
    expect(contrasena.safeParse(valor).success).toBe(false)
  })
})

describe('registro', () => {
  it('normaliza espacios del email y del nombre', () => {
    const r = registroEsquema.parse({
      nombre: '  Ana ',
      email: ' ana@mail.com ',
      contrasena: 'obra2026',
    })
    expect(r).toEqual({ nombre: 'Ana', email: 'ana@mail.com', contrasena: 'obra2026' })
  })
})

describe('nueva contraseña', () => {
  it('exige que las dos coincidan', () => {
    const r = nuevaClaveEsquema.safeParse({ contrasena: 'obra2026', repetir: 'obra2027' })
    expect(r.success).toBe(false)
  })
})

describe('negocio', () => {
  it('acepta un teléfono argentino con espacios y guiones', () => {
    const r = negocioEsquema.safeParse({
      nombre: 'Electricidad Ana',
      rubro: 'Electricista',
      telefono: '11 5555-0000',
    })
    expect(r.success).toBe(true)
  })

  it('rechaza un rubro fuera de la lista', () => {
    const r = negocioEsquema.safeParse({ nombre: 'Algo', rubro: 'Astronauta', telefono: '' })
    expect(r.success).toBe(false)
  })
})
