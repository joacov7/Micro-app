export type EstadoPresupuesto =
  'borrador' | 'enviado' | 'visto' | 'aceptado' | 'rechazado' | 'vencido'

export type LineaPresupuesto = {
  id?: string
  item_id: string | null
  descripcion: string
  unidad: string
  cantidad: number
  precio_unitario: number
}

export type Presupuesto = {
  id: string
  numero: number
  estado: EstadoPresupuesto
  cliente_id: string | null
  cliente_nombre: string
  cliente_telefono: string | null
  descuento_pct: number
  subtotal: number
  descuento: number
  total: number
  validez_dias: number
  forma_pago: string | null
  notas: string | null
  created_at: string
  enviado_el: string | null
  visto_el: string | null
  items: LineaPresupuesto[]
}

/** Datos del negocio que se imprimen en el documento. */
export type Emisor = {
  nombre: string
  rubro: string | null
  telefono: string | null
  notas_pie: string | null
}

export const ETIQUETA_ESTADO: Record<EstadoPresupuesto, string> = {
  borrador: 'Borrador',
  enviado: 'Enviado',
  visto: 'Visto',
  aceptado: 'Aceptado',
  rechazado: 'Rechazado',
  vencido: 'Vencido',
}
