import { describe, expect, it } from 'vitest'
import { MENSAJE_GENERICO, traducirError } from './errores'

describe('traducirError', () => {
  it('traduce credenciales inválidas', () => {
    expect(traducirError({ message: 'Invalid login credentials' })).toBe(
      'El email o la contraseña no son correctos.',
    )
  })

  it('traduce errores de las funciones de la base', () => {
    expect(traducirError(new Error('ya_tiene_organizacion'))).toBe(
      'Tu cuenta ya tiene un negocio creado.',
    )
  })

  it('detecta falta de conexión', () => {
    expect(traducirError(new TypeError('Failed to fetch'))).toMatch(/No hay conexión/)
  })

  it('no muestra detalles técnicos desconocidos', () => {
    expect(traducirError(new Error('duplicate key value violates constraint xyz'))).toBe(
      MENSAJE_GENERICO,
    )
    expect(traducirError(undefined)).toBe(MENSAJE_GENERICO)
  })
})
