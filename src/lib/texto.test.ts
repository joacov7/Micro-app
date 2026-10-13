import { describe, expect, it } from 'vitest'
import { iniciales } from './texto'

describe('iniciales', () => {
  it('toma la primera letra de las dos primeras palabras', () => {
    expect(iniciales('Electricidad Romero Hnos')).toBe('ER')
    expect(iniciales('  gas  beto ')).toBe('GB')
    expect(iniciales('Panadería')).toBe('P')
  })
})
