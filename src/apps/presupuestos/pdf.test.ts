import { describe, expect, it } from 'vitest'
import { armarPdf, nombreArchivo } from './pdf'
import type { Presupuesto } from './tipos'

const presupuesto: Presupuesto = {
  id: 'p1',
  numero: 7,
  estado: 'borrador',
  cliente_id: null,
  cliente_nombre: 'Laura Giménez',
  cliente_telefono: '11 4000-1111',
  descuento_pct: 10,
  subtotal: 116504.13,
  descuento: 11650.41,
  total: 104853.72,
  validez_dias: 15,
  forma_pago: '50% de anticipo',
  notas: null,
  created_at: '2026-10-14T12:00:00Z',
  enviado_el: null,
  visto_el: null,
  items: [
    {
      item_id: null,
      descripcion: 'Boca de luz',
      unidad: 'boca',
      cantidad: 6,
      precio_unitario: 18000,
    },
    {
      item_id: null,
      descripcion: 'Cable 2,5 mm²',
      unidad: 'm',
      cantidad: 12.5,
      precio_unitario: 680.33,
    },
  ],
}
const emisor = {
  nombre: 'Electricidad Romero',
  rubro: 'Electricista',
  telefono: '11 5555-0000',
  notas_pie: 'Garantía 90 días.',
}

describe('PDF del presupuesto', () => {
  it('incluye número, cliente, ítems, total y condiciones', async () => {
    const doc = await armarPdf(presupuesto, emisor, { conMarca: true })
    const contenido = doc.output()
    for (const texto of [
      'PRESUPUESTO',
      '0007',
      'Laura Gim',
      'Boca de luz',
      '104.853,72',
      'Validez: 15',
      'Garant',
      'Hecho con Presupuest',
    ]) {
      expect(contenido).toContain(texto)
    }
  })

  it('sin la marca en el plan que la quita', async () => {
    const doc = await armarPdf(presupuesto, emisor, { conMarca: false })
    expect(doc.output()).not.toContain('Hecho con Presupuest')
  })

  it('arma un nombre de archivo sin acentos ni espacios', () => {
    expect(nombreArchivo({ numero: 7, cliente_nombre: 'Laura Giménez / Obra' })).toBe(
      'Presupuesto-0007-Laura-Gimenez-Obra.pdf',
    )
  })
})
