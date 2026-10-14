import { useState } from 'react'
import { Link } from 'react-router'
import { formatARS } from '@/lib/format'
import { traducirError, useOrganizacionActual, usePermiso } from '@/platform/contract'
import { buttonVariants } from '@/ui/button-variants'
import { Aviso } from '@/ui/campo'
import { useItems, usePresupuestos } from '../api'
import { numeroPresupuesto } from '../calculos'
import { EtiquetaEstado } from '../componentes'
import { haceCuanto, necesitanSeguimiento } from '../seguimiento'

const fecha = (d: string) =>
  new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })

export function InicioPage() {
  const { data: org } = useOrganizacionActual()
  const orgId = org!.id
  const limite = usePermiso(orgId, 'presupuestos.por_mes')
  const items = useItems(orgId)
  const presupuestos = usePresupuestos(orgId)

  const [ahora] = useState(() => new Date())
  const lista = presupuestos.data ?? []
  const enJuego = lista.filter((p) => p.estado === 'enviado' || p.estado === 'visto')
  const aceptadosMes = lista.filter((p) => {
    if (p.estado !== 'aceptado') return false
    const d = new Date(p.created_at)
    return d.getMonth() === ahora.getMonth() && d.getFullYear() === ahora.getFullYear()
  })
  const suma = (ps: typeof lista) => ps.reduce((s, p) => s + p.total, 0)
  const pendientes = necesitanSeguimiento(lista, ahora)

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
  const faltanPasos = pasos.some((p) => !p.hecho)

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Presupuestos</h1>
        <Link to="/app/presupuestos/nuevo" className={buttonVariants({ variant: 'accion' })}>
          Nuevo
        </Link>
      </div>

      {pendientes.length > 0 && (
        <section
          aria-labelledby="seguimiento"
          className="border-estado-visto/40 bg-estado-visto/10 flex flex-col gap-2 rounded-lg border p-4"
        >
          <h2 id="seguimiento" className="font-display text-estado-visto text-xl font-semibold">
            {pendientes.length === 1
              ? '1 cliente vio tu presupuesto y no contestó'
              : `${pendientes.length} clientes vieron tu presupuesto y no contestaron`}
          </h2>
          <p className="text-sm">Es el mejor momento para escribirles.</p>
          <ul className="flex flex-col gap-1">
            {pendientes.map((p) => (
              <li key={p.id}>
                <Link to={`/app/presupuestos/${p.id}`} className="font-semibold underline">
                  {p.cliente_nombre} · N.º {numeroPresupuesto(p.numero)}
                </Link>{' '}
                <span className="text-muted-foreground text-sm">
                  (lo vio {haceCuanto(p.visto_el!, ahora)})
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card rounded-lg border p-4">
          <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            En juego
          </p>
          <p className="font-display text-2xl font-bold">{formatARS(suma(enJuego))}</p>
          <p className="text-muted-foreground text-sm">{enJuego.length} esperando respuesta</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            Aceptados este mes
          </p>
          <p className="font-display text-2xl font-bold">{formatARS(suma(aceptadosMes))}</p>
          <p className="text-muted-foreground text-sm">
            {aceptadosMes.length} {aceptadosMes.length === 1 ? 'presupuesto' : 'presupuestos'}
          </p>
        </div>
      </div>

      <p className="text-muted-foreground text-sm">{plan}</p>

      {faltanPasos && (
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
          </ol>
        </section>
      )}

      {presupuestos.isPending ? (
        <p role="status" className="text-muted-foreground">
          Cargando presupuestos…
        </p>
      ) : presupuestos.isError ? (
        <Aviso>{traducirError(presupuestos.error)}</Aviso>
      ) : presupuestos.data.length === 0 ? (
        <div className="flex flex-col gap-3 rounded-lg border border-dashed p-5">
          <p className="font-semibold">Todavía no hiciste presupuestos</p>
          <p className="text-muted-foreground">
            Elegí ítems de tu lista, ajustá cantidades y listo: sale con tu marca.
          </p>
          <div>
            <Link to="/app/presupuestos/nuevo" className={buttonVariants({ variant: 'marca' })}>
              Hacer el primero
            </Link>
          </div>
        </div>
      ) : (
        <ul
          aria-label="Tus presupuestos"
          className="bg-card divide-y overflow-hidden rounded-lg border"
        >
          {presupuestos.data.map((p) => (
            <li key={p.id}>
              <Link
                to={`/app/presupuestos/${p.id}`}
                className="hover:bg-muted grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 px-4 py-3"
              >
                <span className="min-w-0 truncate font-semibold">
                  N.º {numeroPresupuesto(p.numero)} · {p.cliente_nombre}
                </span>
                <span className="text-right font-semibold">{formatARS(p.total)}</span>
                <span className="text-muted-foreground text-sm">{fecha(p.created_at)}</span>
                <span className="justify-self-end">
                  <EtiquetaEstado estado={p.estado} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
