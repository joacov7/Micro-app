import { useCallback, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router'
import { formatARS } from '@/lib/format'
import { montoParaEditar, parsearMonto } from '@/lib/montos'
import { traducirError, useOrganizacionActual } from '@/platform/contract'
import { Button } from '@/ui/button'
import { Aviso, Campo, Input, Textarea } from '@/ui/campo'
import { Hoja } from '@/ui/hoja'
import {
  useAjustes,
  useClientes,
  useGuardarPresupuesto,
  useItems,
  usePresupuesto,
  type Ajustes,
  type Cliente,
} from '../api'
import { calcularTotales, importeLinea, numeroPresupuesto } from '../calculos'
import type { Presupuesto } from '../tipos'

/** Línea en edición: el precio y la cantidad se guardan como texto mientras se escriben. */
type LineaEditor = {
  clave: string
  item_id: string | null
  descripcion: string
  unidad: string
  cantidad: string
  precio: string
}

let contador = 0
const nuevaClave = () => `l${++contador}`

const aNumero = (texto: string) => parsearMonto(texto)

export function EditorPresupuestoPage() {
  const { id } = useParams()
  const { data: org } = useOrganizacionActual()
  const orgId = org!.id
  const ajustes = useAjustes(orgId)
  const existente = usePresupuesto(orgId, id)

  if (ajustes.isPending || (id && existente.isPending)) {
    return (
      <p role="status" className="text-muted-foreground">
        Cargando…
      </p>
    )
  }
  if (ajustes.isError) return <Aviso>{traducirError(ajustes.error)}</Aviso>
  if (id && (existente.isError || !existente.data)) {
    return (
      <Aviso>
        {existente.isError ? traducirError(existente.error) : 'No encontramos ese presupuesto.'}
      </Aviso>
    )
  }
  if (existente.data && existente.data.estado !== 'borrador') {
    return <Navigate to={`/app/presupuestos/${existente.data.id}`} replace />
  }
  return (
    <Editor
      key={id ?? 'nuevo'}
      orgId={orgId}
      ajustes={ajustes.data}
      existente={existente.data ?? null}
    />
  )
}

function Editor({
  orgId,
  ajustes,
  existente,
}: {
  orgId: string
  ajustes: Ajustes
  existente: Presupuesto | null
}) {
  const navigate = useNavigate()
  const guardar = useGuardarPresupuesto(orgId)
  const clientes = useClientes(orgId)

  const [cliente, setCliente] = useState<{ id: string | null; nombre: string; telefono: string }>({
    id: existente?.cliente_id ?? null,
    nombre: existente?.cliente_nombre ?? '',
    telefono: existente?.cliente_telefono ?? '',
  })
  const [guardarCliente, setGuardarCliente] = useState(true)
  const [lineas, setLineas] = useState<LineaEditor[]>(
    () =>
      existente?.items.map((i) => ({
        clave: nuevaClave(),
        item_id: i.item_id,
        descripcion: i.descripcion,
        unidad: i.unidad,
        cantidad: montoParaEditar(i.cantidad),
        precio: montoParaEditar(i.precio_unitario),
      })) ?? [],
  )
  const [descuento, setDescuento] = useState(
    existente ? montoParaEditar(existente.descuento_pct) : '0',
  )
  const [validez, setValidez] = useState(String(existente?.validez_dias ?? ajustes.validez_dias))
  const [formaPago, setFormaPago] = useState(existente?.forma_pago ?? ajustes.forma_pago ?? '')
  const [notas, setNotas] = useState(existente?.notas ?? '')
  const [eligiendo, setEligiendo] = useState(false)
  const [errores, setErrores] = useState<string[]>([])
  const cerrarElegir = useCallback(() => setEligiendo(false), [])

  const totales = useMemo(
    () =>
      calcularTotales(
        lineas.map((l) => ({
          cantidad: aNumero(l.cantidad) ?? 0,
          precio_unitario: aNumero(l.precio) ?? 0,
        })),
        Math.min(100, Math.max(0, aNumero(descuento) ?? 0)),
      ),
    [lineas, descuento],
  )

  const cambiarLinea = (clave: string, cambios: Partial<LineaEditor>) =>
    setLineas((ls) => ls.map((l) => (l.clave === clave ? { ...l, ...cambios } : l)))
  const sumar = (clave: string, delta: number) =>
    setLineas((ls) =>
      ls.map((l) => {
        if (l.clave !== clave) return l
        const nueva = Math.max(1, Math.round((aNumero(l.cantidad) ?? 0) + delta))
        return { ...l, cantidad: String(nueva) }
      }),
    )

  const agregarDeLista = (item: { id: string; nombre: string; unidad: string; precio: number }) => {
    setLineas((ls) => {
      const ya = ls.find((l) => l.item_id === item.id)
      if (ya) {
        return ls.map((l) =>
          l === ya ? { ...l, cantidad: String(Math.round((aNumero(l.cantidad) ?? 0) + 1)) } : l,
        )
      }
      return [
        ...ls,
        {
          clave: nuevaClave(),
          item_id: item.id,
          descripcion: item.nombre,
          unidad: item.unidad,
          cantidad: '1',
          precio: montoParaEditar(item.precio),
        },
      ]
    })
  }

  const enviar = () => {
    const problemas: string[] = []
    if (!cliente.nombre.trim()) problemas.push('Escribí el nombre del cliente.')
    if (lineas.length === 0) problemas.push('Agregá al menos un ítem.')
    const items = lineas.map((l, k) => {
      const cantidad = aNumero(l.cantidad)
      const precio = aNumero(l.precio)
      if (!l.descripcion.trim()) problemas.push(`Ítem ${k + 1}: falta la descripción.`)
      if (cantidad === null || cantidad <= 0) problemas.push(`Ítem ${k + 1}: revisá la cantidad.`)
      if (precio === null) problemas.push(`Ítem ${k + 1}: revisá el precio.`)
      return {
        item_id: l.item_id,
        descripcion: l.descripcion.trim(),
        unidad: l.unidad.trim() || 'u.',
        cantidad: cantidad ?? 0,
        precio_unitario: precio ?? 0,
      }
    })
    const pct = aNumero(descuento)
    if (pct === null || pct > 100)
      problemas.push('El descuento tiene que ser un porcentaje entre 0 y 100.')
    const dias = Number(validez)
    if (!Number.isInteger(dias) || dias < 1 || dias > 365)
      problemas.push('La validez tiene que ser de 1 a 365 días.')
    setErrores(problemas)
    if (problemas.length) return

    guardar.mutate(
      {
        id: existente?.id,
        cliente_id: cliente.id,
        cliente_nombre: cliente.nombre.trim(),
        cliente_telefono: cliente.telefono.trim(),
        guardar_cliente: !cliente.id && guardarCliente,
        descuento_pct: pct ?? 0,
        validez_dias: dias,
        forma_pago: formaPago,
        notas,
        items,
      },
      { onSuccess: (id) => navigate(`/app/presupuestos/${id}`, { replace: true }) },
    )
  }

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">
          {existente ? `Editar N.º ${numeroPresupuesto(existente.numero)}` : 'Nuevo presupuesto'}
        </h1>
        <Link
          to={existente ? `/app/presupuestos/${existente.id}` : '/app'}
          className="text-sm font-semibold underline"
        >
          Cancelar
        </Link>
      </div>

      <section
        aria-labelledby="sec-cliente"
        className="bg-card flex flex-col gap-3 rounded-lg border p-4"
      >
        <h2 id="sec-cliente" className="text-xl font-semibold">
          Cliente
        </h2>
        {cliente.id ? (
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold">{cliente.nombre}</p>
              <p className="text-muted-foreground text-sm">{cliente.telefono || 'Sin teléfono'}</p>
            </div>
            <Button
              variant="borde"
              onClick={() => setCliente({ id: null, nombre: '', telefono: '' })}
            >
              Cambiar
            </Button>
          </div>
        ) : (
          <ElegirCliente
            clientes={clientes.data ?? []}
            cliente={cliente}
            onCambiar={setCliente}
            guardar={guardarCliente}
            onGuardar={setGuardarCliente}
          />
        )}
      </section>

      <section
        aria-labelledby="sec-items"
        className="bg-card flex flex-col gap-3 rounded-lg border p-4"
      >
        <h2 id="sec-items" className="text-xl font-semibold">
          Ítems
        </h2>
        {lineas.length === 0 && (
          <p className="text-muted-foreground">Todavía no agregaste ítems.</p>
        )}
        <ol className="flex flex-col divide-y">
          {lineas.map((l, k) => (
            <li key={l.clave} className="flex flex-col gap-2 py-3 first:pt-0">
              <Campo etiqueta={`Ítem ${k + 1}`}>
                {(p) => (
                  <Input
                    {...p}
                    value={l.descripcion}
                    onChange={(e) => cambiarLinea(l.clave, { descripcion: e.target.value })}
                    placeholder="Descripción"
                  />
                )}
              </Campo>
              <div className="grid grid-cols-[auto_1fr] items-end gap-3">
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium" id={`cant-${l.clave}`}>
                    Cantidad ({l.unidad})
                  </span>
                  <div
                    className="flex items-center overflow-hidden rounded-md border"
                    role="group"
                    aria-labelledby={`cant-${l.clave}`}
                  >
                    <button
                      type="button"
                      className="bg-muted size-11 text-xl"
                      aria-label="Restar uno"
                      onClick={() => sumar(l.clave, -1)}
                    >
                      −
                    </button>
                    <input
                      aria-label={`Cantidad del ítem ${k + 1}`}
                      inputMode="decimal"
                      className="bg-card h-11 w-16 text-center font-semibold"
                      value={l.cantidad}
                      onChange={(e) => cambiarLinea(l.clave, { cantidad: e.target.value })}
                    />
                    <button
                      type="button"
                      className="bg-muted size-11 text-xl"
                      aria-label="Sumar uno"
                      onClick={() => sumar(l.clave, 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
                <Campo etiqueta={`Precio por ${l.unidad} ($)`}>
                  {(p) => (
                    <Input
                      {...p}
                      inputMode="decimal"
                      value={l.precio}
                      onChange={(e) => cambiarLinea(l.clave, { precio: e.target.value })}
                    />
                  )}
                </Campo>
              </div>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  className="text-destructive text-sm underline"
                  onClick={() => setLineas((ls) => ls.filter((x) => x.clave !== l.clave))}
                >
                  Quitar ítem {k + 1}
                </button>
                <span className="font-semibold">
                  {formatARS(
                    importeLinea({
                      cantidad: aNumero(l.cantidad) ?? 0,
                      precio_unitario: aNumero(l.precio) ?? 0,
                    }),
                  )}
                </span>
              </div>
            </li>
          ))}
        </ol>
        <div className="grid gap-2 sm:grid-cols-2">
          <Button variant="marca" onClick={() => setEligiendo(true)}>
            + Agregar de mis precios
          </Button>
          <Button
            variant="borde"
            onClick={() =>
              setLineas((ls) => [
                ...ls,
                {
                  clave: nuevaClave(),
                  item_id: null,
                  descripcion: '',
                  unidad: 'u.',
                  cantidad: '1',
                  precio: '',
                },
              ])
            }
          >
            + Ítem libre
          </Button>
        </div>
      </section>

      <section
        aria-labelledby="sec-condiciones"
        className="bg-card flex flex-col gap-3 rounded-lg border p-4"
      >
        <h2 id="sec-condiciones" className="text-xl font-semibold">
          Condiciones
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <Campo etiqueta="Descuento (%)">
            {(p) => (
              <Input
                {...p}
                inputMode="decimal"
                value={descuento}
                onChange={(e) => setDescuento(e.target.value)}
              />
            )}
          </Campo>
          <Campo etiqueta="Validez (días)">
            {(p) => (
              <Input
                {...p}
                inputMode="numeric"
                value={validez}
                onChange={(e) => setValidez(e.target.value)}
              />
            )}
          </Campo>
        </div>
        <Campo etiqueta="Forma de pago">
          {(p) => (
            <Textarea
              {...p}
              maxLength={300}
              value={formaPago}
              onChange={(e) => setFormaPago(e.target.value)}
            />
          )}
        </Campo>
        <Campo
          etiqueta="Observaciones (opcional)"
          ayuda="Ej.: no incluye materiales de terminación."
        >
          {(p) => (
            <Textarea
              {...p}
              maxLength={1000}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
            />
          )}
        </Campo>
      </section>

      {errores.length > 0 && (
        <Aviso>
          <ul className="list-disc pl-4">
            {errores.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </Aviso>
      )}
      {guardar.isError && <Aviso>{traducirError(guardar.error)}</Aviso>}

      <div className="bg-card sticky bottom-16 z-[5] -mx-4 flex items-center gap-3 border-t px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="text-muted-foreground text-xs">
            {totales.descuento > 0
              ? `Subtotal ${formatARS(totales.subtotal)} · Desc. ${formatARS(totales.descuento)}`
              : 'Total'}
          </p>
          <p
            className="font-display text-2xl font-bold"
            aria-live="polite"
            data-testid="total-editor"
          >
            {formatARS(totales.total)}
          </p>
        </div>
        <Button onClick={enviar} disabled={guardar.isPending}>
          {guardar.isPending ? 'Guardando…' : 'Guardar'}
        </Button>
      </div>

      <Hoja titulo="Mis precios" abierta={eligiendo} onCerrar={cerrarElegir}>
        <ElegirItems orgId={orgId} onElegir={agregarDeLista} onListo={cerrarElegir} />
      </Hoja>
    </>
  )
}

function ElegirCliente({
  clientes,
  cliente,
  onCambiar,
  guardar,
  onGuardar,
}: {
  clientes: Cliente[]
  cliente: { id: string | null; nombre: string; telefono: string }
  onCambiar: (c: { id: string | null; nombre: string; telefono: string }) => void
  guardar: boolean
  onGuardar: (v: boolean) => void
}) {
  const q = cliente.nombre.trim().toLocaleLowerCase('es')
  const sugeridos = q
    ? clientes.filter((c) => c.nombre.toLocaleLowerCase('es').includes(q)).slice(0, 5)
    : []
  return (
    <>
      <Campo
        etiqueta="Nombre del cliente"
        ayuda={clientes.length ? 'Escribí para buscar en tus clientes.' : undefined}
      >
        {(p) => (
          <Input
            {...p}
            autoComplete="off"
            value={cliente.nombre}
            onChange={(e) => onCambiar({ ...cliente, nombre: e.target.value })}
          />
        )}
      </Campo>
      {sugeridos.length > 0 && (
        <ul
          aria-label="Clientes que coinciden"
          className="divide-y overflow-hidden rounded-md border"
        >
          {sugeridos.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                className="hover:bg-muted flex w-full flex-col px-3 py-2 text-left"
                onClick={() =>
                  onCambiar({ id: c.id, nombre: c.nombre, telefono: c.telefono ?? '' })
                }
              >
                <span className="font-semibold">{c.nombre}</span>
                <span className="text-muted-foreground text-sm">
                  {c.telefono ?? 'Sin teléfono'}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <Campo etiqueta="WhatsApp del cliente (opcional)">
        {(p) => (
          <Input
            {...p}
            type="tel"
            inputMode="tel"
            value={cliente.telefono}
            onChange={(e) => onCambiar({ ...cliente, telefono: e.target.value })}
          />
        )}
      </Campo>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          className="size-5"
          checked={guardar}
          onChange={(e) => onGuardar(e.target.checked)}
        />
        Guardar en mis clientes
      </label>
    </>
  )
}

function ElegirItems({
  orgId,
  onElegir,
  onListo,
}: {
  orgId: string
  onElegir: (i: { id: string; nombre: string; unidad: string; precio: number }) => void
  onListo: () => void
}) {
  const items = useItems(orgId)
  const [busqueda, setBusqueda] = useState('')
  const [agregados, setAgregados] = useState(0)
  const q = busqueda.trim().toLocaleLowerCase('es')
  const visibles = (items.data ?? []).filter(
    (i) => !q || i.nombre.toLocaleLowerCase('es').includes(q),
  )

  return (
    <>
      <Campo etiqueta="Buscar en mis precios">
        {(p) => (
          <Input
            {...p}
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        )}
      </Campo>
      {items.isPending ? (
        <p role="status">Cargando…</p>
      ) : items.data?.length === 0 ? (
        <p className="text-muted-foreground">
          Tu lista está vacía.{' '}
          <Link to="/app/precios" className="font-semibold underline">
            Cargá tus precios
          </Link>{' '}
          o usá “Ítem libre”.
        </p>
      ) : (
        <ul className="max-h-[50dvh] divide-y overflow-y-auto rounded-md border">
          {visibles.map((i) => (
            <li key={i.id}>
              <button
                type="button"
                className="hover:bg-muted grid w-full grid-cols-[1fr_auto] gap-x-3 px-3 py-2.5 text-left"
                onClick={() => {
                  onElegir(i)
                  setAgregados((n) => n + 1)
                }}
              >
                <span className="font-semibold">{i.nombre}</span>
                <span className="text-right font-semibold">{formatARS(i.precio)}</span>
                <span className="text-muted-foreground text-sm">por {i.unidad}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <p role="status" className="text-muted-foreground text-sm">
        {agregados > 0
          ? `Agregaste ${agregados} ${agregados === 1 ? 'ítem' : 'ítems'}.`
          : 'Tocá un ítem para agregarlo.'}
      </p>
      <Button ancho="completo" onClick={onListo}>
        Listo
      </Button>
    </>
  )
}
