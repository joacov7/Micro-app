import { z } from 'zod'
import { parsearMonto } from '@/lib/montos'

export const CATEGORIAS = ['Materiales', 'Mano de obra', 'Otro'] as const
export const UNIDADES_SUGERIDAS = [
  'u.',
  'm',
  'm²',
  'm³',
  'boca',
  'hora',
  'día',
  'rollo',
  'kg',
  'litro',
]

// Mismos límites que la base (supabase/migrations/*_presupuestos_precios_clientes.sql).
export const itemEsquema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, 'Escribí el nombre del ítem.')
    .max(120, 'Máximo 120 caracteres.'),
  unidad: z
    .string()
    .trim()
    .min(1, 'Indicá la unidad (por ejemplo u., m², hora).')
    .max(20, 'Máximo 20 caracteres.'),
  precio: z.string().transform((t, ctx) => {
    const n = parsearMonto(t)
    if (n === null) {
      ctx.addIssue({
        code: 'custom',
        message: 'Escribí un precio válido, por ejemplo 18.000 o 18.000,50.',
      })
      return z.NEVER
    }
    if (n >= 100_000_000_000) {
      ctx.addIssue({ code: 'custom', message: 'El precio es demasiado alto.' })
      return z.NEVER
    }
    return n
  }),
  categoria: z.enum(CATEGORIAS),
})

export const clienteEsquema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, 'Escribí el nombre del cliente.')
    .max(120, 'Máximo 120 caracteres.'),
  telefono: z
    .string()
    .trim()
    .max(30, 'Máximo 30 caracteres.')
    .regex(/^[0-9 +()-]*$/, 'Usá solo números, espacios y guiones.'),
  email: z.union([
    z.literal(''),
    z.string().trim().email('Revisá el email.').max(120, 'Máximo 120 caracteres.'),
  ]),
  notas: z.string().trim().max(500, 'Máximo 500 caracteres.'),
})

export const ajustesEsquema = z.object({
  validez_dias: z.coerce
    .number({ message: 'Escribí una cantidad de días.' })
    .int('Usá un número entero de días.')
    .min(1, 'Al menos 1 día.')
    .max(365, 'Máximo 365 días.'),
  forma_pago: z.string().trim().max(300, 'Máximo 300 caracteres.'),
  notas_pie: z.string().trim().max(500, 'Máximo 500 caracteres.'),
})

export type ItemFormulario = z.input<typeof itemEsquema>
export type ItemDatos = z.output<typeof itemEsquema>
export type ClienteDatos = z.infer<typeof clienteEsquema>
export type AjustesFormulario = z.input<typeof ajustesEsquema>
export type AjustesDatos = z.output<typeof ajustesEsquema>
