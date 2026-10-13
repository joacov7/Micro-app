import { formatARS } from '@/lib/format'
import { iniciales } from '@/lib/texto'
import { cn } from '@/lib/utils'
import { importeLinea, numeroPresupuesto, venceEl } from './calculos'
import { ETIQUETA_ESTADO, type Emisor, type EstadoPresupuesto, type Presupuesto } from './tipos'

const fecha = (d: Date | string) =>
  new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
const cantidad = (n: number) =>
  new Intl.NumberFormat('es-AR', { maximumFractionDigits: 3 }).format(n)

const colorEstado: Record<EstadoPresupuesto, string> = {
  borrador: 'bg-muted text-foreground',
  enviado: 'bg-estado-enviado/15 text-estado-enviado',
  visto: 'bg-estado-visto/15 text-estado-visto',
  aceptado: 'bg-estado-aceptado/15 text-estado-aceptado',
  rechazado: 'bg-estado-rechazado/15 text-estado-rechazado',
  vencido: 'bg-muted text-muted-foreground',
}

export function EtiquetaEstado({ estado }: { estado: EstadoPresupuesto }) {
  return (
    <span
      className={cn(
        'inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold',
        colorEstado[estado],
      )}
    >
      {ETIQUETA_ESTADO[estado]}
    </span>
  )
}

/**
 * El presupuesto como documento en papel. Se usa en el detalle y (incremento 5) en la página
 * que ve el cliente. Colores fijos de papel: se ve igual en tema claro y oscuro, como el PDF.
 */
export function Documento({ p, emisor }: { p: Presupuesto; emisor: Emisor }) {
  return (
    <article
      aria-label={`Presupuesto N.º ${numeroPresupuesto(p.numero)}`}
      className="flex flex-col gap-4 rounded-sm bg-white p-5 text-[13.5px] text-[#16233a] shadow-[0_8px_24px_rgba(10,20,40,.12)]"
    >
      <header className="flex items-start justify-between gap-3 border-b-2 border-[#16233a] pb-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            aria-hidden="true"
            className="font-display grid size-10 shrink-0 place-items-center rounded-md bg-[#1f3a5f] text-lg font-bold text-white"
          >
            {iniciales(emisor.nombre)}
          </span>
          <div className="min-w-0">
            <p className="font-display text-lg leading-tight font-semibold">{emisor.nombre}</p>
            <p className="text-xs text-[#5b6678]">
              {[emisor.rubro, emisor.telefono && `Tel. ${emisor.telefono}`]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>
        </div>
        <div className="font-display shrink-0 text-right leading-tight">
          <p className="text-sm">PRESUPUESTO</p>
          <p className="text-xl font-bold">N.º {numeroPresupuesto(p.numero)}</p>
          <p className="font-sans text-xs text-[#5b6678]">{fecha(p.created_at)}</p>
        </div>
      </header>

      <div>
        <p className="text-xs text-[#5b6678]">Para</p>
        <p className="font-semibold">{p.cliente_nombre}</p>
        {p.cliente_telefono && <p className="text-xs text-[#5b6678]">{p.cliente_telefono}</p>}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[#dadde3] text-left text-[11px] tracking-wide text-[#5b6678] uppercase">
              <th className="py-1.5 pr-2 font-semibold">Detalle</th>
              <th className="px-2 py-1.5 text-right font-semibold">Cant.</th>
              <th className="py-1.5 pl-2 text-right font-semibold">Importe</th>
            </tr>
          </thead>
          <tbody>
            {p.items.map((i, k) => (
              <tr key={i.id ?? k} className="border-b border-[#eef0f3] align-top">
                <td className="py-2 pr-2">
                  {i.descripcion}
                  <span className="block text-xs text-[#5b6678]">
                    {formatARS(i.precio_unitario)} por {i.unidad}
                  </span>
                </td>
                <td className="px-2 py-2 text-right whitespace-nowrap">{cantidad(i.cantidad)}</td>
                <td className="py-2 pl-2 text-right whitespace-nowrap">
                  {formatARS(importeLinea(i))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <dl className="ml-auto grid min-w-[60%] grid-cols-[1fr_auto] gap-x-4 gap-y-1">
        <dt>Subtotal</dt>
        <dd className="text-right">{formatARS(p.subtotal)}</dd>
        {p.descuento > 0 && (
          <>
            <dt>Descuento {cantidad(p.descuento_pct)}%</dt>
            <dd className="text-right">− {formatARS(p.descuento)}</dd>
          </>
        )}
        <div className="font-display col-span-2 grid grid-cols-subgrid border-t-2 border-[#16233a] pt-1 text-xl font-bold">
          <dt>Total</dt>
          <dd className="text-right">{formatARS(p.total)}</dd>
        </div>
      </dl>

      <div className="flex flex-col gap-1 border-t border-[#dadde3] pt-3 text-xs text-[#5b6678]">
        <p>
          Validez: {p.validez_dias} días (hasta el{' '}
          {fecha(venceEl(new Date(p.created_at), p.validez_dias))}).
        </p>
        {p.forma_pago && <p>Forma de pago: {p.forma_pago}</p>}
        {p.notas && <p>Observaciones: {p.notas}</p>}
        {emisor.notas_pie && <p>{emisor.notas_pie}</p>}
      </div>
    </article>
  )
}
