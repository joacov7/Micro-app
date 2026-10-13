/**
 * PDF del presupuesto, generado en el dispositivo del usuario (sin servidor: costo cero).
 * Las librerías se cargan recién cuando alguien pide el PDF, para no hacer más lento el panel.
 */
import type { jsPDF } from 'jspdf'
import { formatARS } from '@/lib/format'
import { iniciales } from '@/lib/texto'
import { importeLinea, numeroPresupuesto, venceEl } from './calculos'
import type { Emisor, Presupuesto } from './tipos'

const TINTA: [number, number, number] = [22, 35, 58]
const MARCA: [number, number, number] = [31, 58, 95]
const GRIS: [number, number, number] = [91, 102, 120]
const fecha = (d: Date) =>
  d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
const cantidad = (n: number) =>
  new Intl.NumberFormat('es-AR', { maximumFractionDigits: 3 }).format(n)

export async function armarPdf(
  p: Presupuesto,
  emisor: Emisor,
  opciones: { conMarca: boolean },
): Promise<jsPDF> {
  const [{ jsPDF }, { autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')])
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const ancho = doc.internal.pageSize.getWidth()
  const margen = 16
  const emitido = new Date(p.created_at)

  doc.setProperties({
    title: `Presupuesto ${numeroPresupuesto(p.numero)} - ${p.cliente_nombre}`,
    creator: emisor.nombre,
  })

  // Encabezado: logo provisorio, negocio y número
  doc.setFillColor(...MARCA)
  doc.roundedRect(margen, 14, 14, 14, 2, 2, 'F')
  doc.setTextColor(255, 255, 255).setFont('helvetica', 'bold').setFontSize(12)
  doc.text(iniciales(emisor.nombre), margen + 7, 23, { align: 'center' })

  doc
    .setTextColor(...TINTA)
    .setFontSize(14)
    .text(emisor.nombre, margen + 18, 20)
  doc
    .setFont('helvetica', 'normal')
    .setFontSize(9)
    .setTextColor(...GRIS)
  const datosEmisor = [emisor.rubro, emisor.telefono && `Tel./WhatsApp ${emisor.telefono}`]
    .filter(Boolean)
    .join(' · ')
  if (datosEmisor) doc.text(datosEmisor, margen + 18, 25)

  doc
    .setTextColor(...TINTA)
    .setFont('helvetica', 'bold')
    .setFontSize(11)
  doc.text('PRESUPUESTO', ancho - margen, 18, { align: 'right' })
  doc
    .setFontSize(15)
    .text(`N.º ${numeroPresupuesto(p.numero)}`, ancho - margen, 25, { align: 'right' })
  doc
    .setFont('helvetica', 'normal')
    .setFontSize(9)
    .setTextColor(...GRIS)
  doc.text(`Fecha: ${fecha(emitido)}`, ancho - margen, 30, { align: 'right' })

  doc
    .setDrawColor(...TINTA)
    .setLineWidth(0.6)
    .line(margen, 34, ancho - margen, 34)

  // Cliente
  doc
    .setFontSize(8)
    .setTextColor(...GRIS)
    .text('PARA', margen, 41)
  doc
    .setFont('helvetica', 'bold')
    .setFontSize(11)
    .setTextColor(...TINTA)
    .text(p.cliente_nombre, margen, 46)
  if (p.cliente_telefono) {
    doc
      .setFont('helvetica', 'normal')
      .setFontSize(9)
      .setTextColor(...GRIS)
      .text(p.cliente_telefono, margen, 51)
  }

  // Detalle
  autoTable(doc, {
    startY: 56,
    margin: { left: margen, right: margen },
    head: [['Detalle', 'Cant.', 'Precio unit.', 'Importe']],
    body: p.items.map((i) => [
      i.descripcion,
      `${cantidad(i.cantidad)} ${i.unidad}`,
      formatARS(i.precio_unitario),
      formatARS(importeLinea(i)),
    ]),
    styles: {
      font: 'helvetica',
      fontSize: 9.5,
      textColor: TINTA,
      cellPadding: 2.2,
      lineColor: [227, 230, 235],
    },
    headStyles: { fillColor: [238, 241, 245], textColor: GRIS, fontStyle: 'bold', fontSize: 8 },
    columnStyles: {
      1: { halign: 'right', cellWidth: 26 },
      2: { halign: 'right', cellWidth: 32 },
      3: { halign: 'right', cellWidth: 34 },
    },
    theme: 'grid',
  })

  // Totales
  let y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8
  const filaTotal = (etiqueta: string, valor: string, destacada = false) => {
    doc
      .setFont('helvetica', destacada ? 'bold' : 'normal')
      .setFontSize(destacada ? 13 : 10)
      .setTextColor(...TINTA)
    doc.text(etiqueta, ancho - margen - 50, y)
    doc.text(valor, ancho - margen, y, { align: 'right' })
    y += destacada ? 8 : 6
  }
  filaTotal('Subtotal', formatARS(p.subtotal))
  if (p.descuento > 0)
    filaTotal(`Descuento ${cantidad(p.descuento_pct)}%`, `- ${formatARS(p.descuento)}`)
  doc
    .setDrawColor(...TINTA)
    .setLineWidth(0.4)
    .line(ancho - margen - 50, y - 3, ancho - margen, y - 3)
  y += 2
  filaTotal('TOTAL', formatARS(p.total), true)

  // Condiciones
  y += 4
  const condiciones = [
    `Validez: ${p.validez_dias} días (hasta el ${fecha(venceEl(emitido, p.validez_dias))}).`,
    p.forma_pago && `Forma de pago: ${p.forma_pago}`,
    p.notas && `Observaciones: ${p.notas}`,
    emisor.notas_pie,
  ].filter((t): t is string => !!t)
  doc
    .setFont('helvetica', 'normal')
    .setFontSize(9)
    .setTextColor(...GRIS)
  for (const texto of condiciones) {
    const lineas = doc.splitTextToSize(texto, ancho - margen * 2) as string[]
    if (y + lineas.length * 4.5 > doc.internal.pageSize.getHeight() - 16) {
      doc.addPage()
      y = 20
    }
    doc.text(lineas, margen, y)
    y += lineas.length * 4.5 + 1.5
  }

  if (opciones.conMarca) {
    const alto = doc.internal.pageSize.getHeight()
    doc
      .setFontSize(7.5)
      .setTextColor(...GRIS)
      .text('Hecho con Presupuestá', ancho / 2, alto - 8, { align: 'center' })
  }
  return doc
}

export function nombreArchivo(p: Pick<Presupuesto, 'numero' | 'cliente_nombre'>): string {
  const cliente = p.cliente_nombre
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return `Presupuesto-${numeroPresupuesto(p.numero)}${cliente ? `-${cliente}` : ''}.pdf`
}

export async function descargarPdf(
  p: Presupuesto,
  emisor: Emisor,
  opciones: { conMarca: boolean },
) {
  const doc = await armarPdf(p, emisor, opciones)
  doc.save(nombreArchivo(p))
}
