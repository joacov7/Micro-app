import { z } from 'zod'

// Mismas reglas que supabase/config.toml ([auth] minimum_password_length y password_requirements).
export const contrasena = z
  .string()
  .min(8, 'Usá al menos 8 caracteres.')
  .regex(/[a-zA-Z]/, 'Incluí al menos una letra.')
  .regex(/[0-9]/, 'Incluí al menos un número.')

export const email = z
  .string()
  .trim()
  .min(1, 'Escribí tu email.')
  .email('Revisá el email: parece incompleto.')

export const registroEsquema = z.object({
  nombre: z.string().trim().min(2, 'Escribí tu nombre.').max(80, 'Máximo 80 caracteres.'),
  email,
  contrasena,
})

export const entrarEsquema = z.object({
  email,
  contrasena: z.string().min(1, 'Escribí tu contraseña.'),
})

export const recuperarEsquema = z.object({ email })

export const nuevaClaveEsquema = z
  .object({ contrasena, repetir: z.string() })
  .refine((v) => v.contrasena === v.repetir, {
    message: 'Las contraseñas no coinciden.',
    path: ['repetir'],
  })

export const RUBROS = [
  'Electricista',
  'Gasista',
  'Plomero',
  'Aire acondicionado',
  'Durlock y pintura',
  'Aberturas',
  'Servicio técnico',
  'Corralón',
  'Imprenta',
  'Carpintería',
  'Otro',
] as const

export const negocioEsquema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, 'Escribí el nombre del negocio.')
    .max(80, 'Máximo 80 caracteres.'),
  rubro: z.enum(RUBROS, { message: 'Elegí un rubro.' }),
  telefono: z
    .string()
    .trim()
    .max(30, 'Máximo 30 caracteres.')
    .regex(/^[0-9 +()-]*$/, 'Usá solo números, espacios y guiones.'),
})

export type Registro = z.infer<typeof registroEsquema>
export type Entrar = z.infer<typeof entrarEsquema>
export type Recuperar = z.infer<typeof recuperarEsquema>
export type NuevaClave = z.infer<typeof nuevaClaveEsquema>
export type Negocio = z.infer<typeof negocioEsquema>
