/**
 * Traduce errores de Supabase (Auth y funciones de la base) a mensajes que dicen
 * qué pasó y qué hacer. Nunca muestra detalles técnicos al usuario.
 */
const mensajes: Array<[RegExp, string]> = [
  [/invalid login credentials/i, 'El email o la contraseña no son correctos.'],
  [
    /email not confirmed/i,
    'Todavía no confirmaste tu email. Buscá el mensaje que te mandamos (revisá también spam).',
  ],
  [
    /user already registered/i,
    'Ya hay una cuenta con ese email. Probá entrar o recuperar la contraseña.',
  ],
  [
    /rate limit|too many requests|security purposes/i,
    'Hiciste muchos intentos seguidos. Esperá un minuto y volvé a probar.',
  ],
  [
    /password should|weak password|password is too weak/i,
    'La contraseña es muy débil: usá al menos 8 caracteres con letras y números.',
  ],
  [
    /same password|different from the old/i,
    'La contraseña nueva tiene que ser distinta de la anterior.',
  ],
  [/ya_tiene_organizacion/, 'Tu cuenta ya tiene un negocio creado.'],
  [/limite_alcanzado/, 'Llegaste al límite de tu plan este mes.'],
  [/sin_permiso|solo_administradores|42501/, 'No tenés permiso para hacer esto.'],
  [/failed to fetch|network|load failed/i, 'No hay conexión. Revisá tu internet y volvé a probar.'],
]

export const MENSAJE_GENERICO = 'Algo salió mal. Volvé a probar en unos minutos.'

export function traducirError(error: unknown): string {
  const texto =
    error instanceof Error
      ? error.message
      : typeof error === 'object' && error !== null && 'message' in error
        ? String((error as { message: unknown }).message)
        : String(error ?? '')
  for (const [patron, mensaje] of mensajes) {
    if (patron.test(texto)) return mensaje
  }
  return MENSAJE_GENERICO
}
