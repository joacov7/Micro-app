import { describe, expect, it } from 'vitest'
import { linkWhatsApp, mensajeEnvio, telefonoParaWhatsApp } from './whatsapp'

describe('telefonoParaWhatsApp', () => {
  it.each([
    ['11 4000-1111', '5491140001111'],
    ['011 15 4000-1111', '5491140001111'],
    ['11 15 4000 1111', '5491140001111'],
    ['0341 15 555-1234', '5493415551234'],
    ['(2944) 15 41-2345', '5492944412345'],
    ['+54 9 11 4000-1111', '5491140001111'],
    ['5491140001111', '5491140001111'],
    ['+54 11 4000-1111', '5491140001111'],
  ])('%s → %s', (entrada, esperado) => {
    expect(telefonoParaWhatsApp(entrada)).toBe(esperado)
  })

  it.each(['', '1234', '4000-1111', 'sin número'])('rechaza "%s"', (entrada) => {
    expect(telefonoParaWhatsApp(entrada)).toBeNull()
  })
})

describe('linkWhatsApp', () => {
  it('arma el link con número y mensaje', () => {
    expect(linkWhatsApp('11 4000-1111', 'Hola $ 1')).toBe(
      'https://wa.me/5491140001111?text=Hola%20%24%201',
    )
  })

  it('sin número deja elegir el contacto', () => {
    expect(linkWhatsApp(null, 'Hola')).toBe('https://wa.me/?text=Hola')
  })
})

describe('mensajeEnvio', () => {
  it('incluye nombre, número, negocio, total y link', () => {
    const m = mensajeEnvio(
      { numero: 7, cliente_nombre: 'Laura Giménez', total: 36000 },
      'Electricidad Romero',
      'https://x/p/abc',
    )
    expect(m.replace(/ /g, ' ')).toBe(
      'Hola Laura, te paso el presupuesto N.º 0007 de Electricidad Romero por $ 36.000.\n\nLo podés ver y aceptar acá:\nhttps://x/p/abc\n\nCualquier duda, escribime.',
    )
  })
})
