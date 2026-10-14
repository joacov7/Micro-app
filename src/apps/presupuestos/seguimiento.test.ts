import { describe, expect, it } from 'vitest'
import { haceCuanto, necesitanSeguimiento } from './seguimiento'

const ahora = new Date('2026-10-20T12:00:00Z')
const dias = (n: number) => new Date(ahora.getTime() - n * 864e5).toISOString()

describe('necesitanSeguimiento', () => {
  it('elige solo los vistos hace 2 días o más sin respuesta', () => {
    const lista = [
      { id: 'a', estado: 'visto' as const, visto_el: dias(3) },
      { id: 'b', estado: 'visto' as const, visto_el: dias(1) },
      { id: 'c', estado: 'aceptado' as const, visto_el: dias(5) },
      { id: 'd', estado: 'enviado' as const, visto_el: null },
      { id: 'e', estado: 'visto' as const, visto_el: dias(2) },
    ]
    expect(necesitanSeguimiento(lista, ahora).map((p) => p.id)).toEqual(['a', 'e'])
  })
})

describe('haceCuanto', () => {
  it('describe el tiempo en palabras', () => {
    expect(haceCuanto(dias(0), ahora)).toBe('hoy')
    expect(haceCuanto(dias(1), ahora)).toBe('ayer')
    expect(haceCuanto(dias(4), ahora)).toBe('hace 4 días')
  })
})
