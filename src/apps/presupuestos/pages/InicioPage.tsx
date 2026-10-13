import { Link } from 'react-router'
import { useOrganizacionActual, usePermiso } from '@/platform/contract'
import { useItems } from '../api'

export function InicioPage() {
  const { data: org } = useOrganizacionActual()
  const limite = usePermiso(org?.id, 'presupuestos.por_mes')
  const items = useItems(org!.id)

  const plan =
    limite.data === undefined
      ? 'Consultando tu plan…'
      : limite.data === -1
        ? 'Plan Pro: presupuestos ilimitados.'
        : `Plan Gratis: hasta ${limite.data} presupuestos por mes.`

  const pasos = [
    {
      hecho: (items.data?.length ?? 0) > 0,
      texto: 'Cargá tus precios',
      a: '/app/precios',
      detalle: items.data?.length
        ? `${items.data.length} ítems cargados`
        : 'Podés empezar con ejemplos de tu rubro',
    },
    {
      hecho: !!org?.telefono,
      texto: 'Completá los datos de tu negocio',
      a: '/app/negocio',
      detalle: 'Salen en cada presupuesto',
    },
  ]

  return (
    <>
      <h1 className="text-3xl font-bold">Hola</h1>
      <div className="bg-card rounded-lg border p-4">
        <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
          Tu plan
        </p>
        <p className="mt-1 text-lg">{plan}</p>
      </div>
      <section aria-labelledby="primeros-pasos" className="flex flex-col gap-2">
        <h2 id="primeros-pasos" className="text-xl font-semibold">
          Primeros pasos
        </h2>
        <ol className="flex flex-col gap-2">
          {pasos.map((p) => (
            <li key={p.a}>
              <Link
                to={p.a}
                className="bg-card hover:bg-muted flex items-center gap-3 rounded-lg border p-4"
              >
                <span
                  aria-hidden="true"
                  className={`grid size-7 shrink-0 place-items-center rounded-full border-2 text-sm font-bold ${
                    p.hecho
                      ? 'border-estado-aceptado bg-estado-aceptado text-white'
                      : 'border-border'
                  }`}
                >
                  {p.hecho ? '✓' : ''}
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold">
                    {p.texto}
                    <span className="sr-only">{p.hecho ? ' (hecho)' : ' (pendiente)'}</span>
                  </span>
                  <span className="text-muted-foreground block text-sm">{p.detalle}</span>
                </span>
              </Link>
            </li>
          ))}
          <li className="text-muted-foreground flex items-center gap-3 rounded-lg border border-dashed p-4">
            <span
              aria-hidden="true"
              className="size-7 shrink-0 rounded-full border-2 border-dashed"
            />
            <span>Tu primer presupuesto: muy pronto</span>
          </li>
        </ol>
      </section>
    </>
  )
}
