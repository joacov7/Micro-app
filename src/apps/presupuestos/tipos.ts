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
  respondido_el: string | null
  motivo_rechazo: string | null
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

/** Lo necesario para mostrar o imprimir un presupuesto (lo usa también la vista pública). */
export type DatosDocumento = Pick<
  Presupuesto,
  | 'numero'
  | 'cliente_nombre'
  | 'cliente_telefono'
  | 'descuento_pct'
  | 'subtotal'
  | 'descuento'
  | 'total'
  | 'validez_dias'
  | 'forma_pago'
  | 'notas'
  | 'created_at'
  | 'enviado_el'
> & {
  items: Array<
    Pick<LineaPresupuesto, 'descripcion' | 'unidad' | 'cantidad' | 'precio_unitario'> & {
      id?: string
    }
  >
}

/** La validez corre desde el envío (o desde la creación si todavía no se envió), como en la base. */
export const fechaBaseValidez = (p: Pick<Presupuesto, 'enviado_el' | 'created_at'>) =>
  new Date(p.enviado_el ?? p.created_at)
