/**
 * Envío por WhatsApp con enlaces "click to chat" (wa.me): gratis y sin aprobación de Meta (D-05).
 * El comercio toca un botón, se abre WhatsApp con el mensaje escrito y lo manda él.
 */
import { formatARS } from '@/lib/format'
import { numeroPresupuesto } from './calculos'

/**
 * Convierte un celular argentino al formato internacional que pide wa.me:
 * "11 4000-1111" → "5491140001111" · "0341 15 555-1234" → "5493415551234".
 * Devuelve null si no parece un celular argentino válido.
 */
export function telefonoParaWhatsApp(telefono: string | null | undefined): string | null {
  if (!telefono) return null
  let d = telefono.replace(/\D/g, '')
  if (d.startsWith('549') && d.length === 13) return d
  if (d.startsWith('54')) d = d.slice(2)
  if (d.startsWith('9') && d.length === 11) d = d.slice(1)
  if (d.startsWith('0')) d = d.slice(1)
  // Quitar el "15" que va después del código de área (de 2, 3 o 4 dígitos).
  if (d.length === 12) {
    for (const largoArea of [2, 3, 4]) {
      if (d.slice(largoArea, largoArea + 2) === '15') {
        d = d.slice(0, largoArea) + d.slice(largoArea + 2)
        break
      }
    }
  }
  return d.length === 10 ? `549${d}` : null
}

export function linkWhatsApp(telefono: string | null | undefined, texto: string): string {
  const numero = telefonoParaWhatsApp(telefono)
  const mensaje = encodeURIComponent(texto)
  // Sin número válido, WhatsApp deja elegir el contacto.
  return numero ? `https://wa.me/${numero}?text=${mensaje}` : `https://wa.me/?text=${mensaje}`
}

const primerNombre = (nombre: string) => nombre.trim().split(/\s+/)[0] ?? ''

export function mensajeEnvio(
  p: { numero: number; cliente_nombre: string; total: number },
  negocio: string,
  link: string,
) {
  return (
    `Hola ${primerNombre(p.cliente_nombre)}, te paso el presupuesto N.º ${numeroPresupuesto(p.numero)} ` +
    `de ${negocio} por ${formatARS(p.total)}.\n\nLo podés ver y aceptar acá:\n${link}\n\nCualquier duda, escribime.`
  )
}

export function mensajeSeguimiento(p: { numero: number; cliente_nombre: string }, link: string) {
  return (
    `Hola ${primerNombre(p.cliente_nombre)}, ¿pudiste ver el presupuesto N.º ${numeroPresupuesto(p.numero)}? ` +
    `Si querés lo ajustamos o te paso fechas para empezar.\n\n${link}`
  )
}

export const linkPublico = (origen: string, token: string) => `${origen}/p/${token}`
