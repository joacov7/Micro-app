import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { formatARS } from '@/lib/format'
import { montoParaEditar } from '@/lib/montos'
import { traducirError, useOrganizacionActual } from '@/platform/contract'
import { Button } from '@/ui/button'
import { Aviso, Campo, Input, Select } from '@/ui/campo'
import { Hoja } from '@/ui/hoja'
import { useArchivarItem, useCargarEjemplos, useGuardarItem, useItems, type Item } from '../api'
import {
  CATEGORIAS,
  itemEsquema,
  UNIDADES_SUGERIDAS,
  type ItemDatos,
  type ItemFormulario,
} from '../esquemas'

type Filtro = 'Todas' | (typeof CATEGORIAS)[number]

export function PreciosPage() {
  const { data: org } = useOrganizacionActual()
  const orgId = org!.id
  const items = useItems(orgId)
  const ejemplos = useCargarEjemplos(orgId)
  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState<Filtro>('Todas')
  const [editando, setEditando] = useState<Item | 'nuevo' | null>(null)
  const cerrar = useCallback(() => setEditando(null), [])

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLocaleLowerCase('es')
    return (items.data ?? []).filter(
      (i) =>
        (filtro === 'Todas' || i.categoria === filtro) &&
        (!q || i.nombre.toLocaleLowerCase('es').includes(q)),
    )
  }, [items.data, busqueda, filtro])

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Mis precios</h1>
        <Button onClick={() => setEditando('nuevo')}>Agregar</Button>
      </div>

      {items.isPending ? (
        <p role="status" className="text-muted-foreground">
          Cargando tus precios…
        </p>
      ) : items.isError ? (
        <Aviso>{traducirError(items.error)}</Aviso>
      ) : items.data.length === 0 ? (
        <div className="flex flex-col gap-3 rounded-lg border border-dashed p-5">
          <p className="font-semibold">Todavía no cargaste precios</p>
          <p className="text-muted-foreground">
            Cargá los trabajos y materiales que más usás. Después armás cada presupuesto
            eligiéndolos de esta lista.
          </p>
          {ejemplos.isError && <Aviso>{traducirError(ejemplos.error)}</Aviso>}
          <div className="flex flex-wrap gap-2">
            {org!.rol === 'owner' && (
              <Button
                variant="marca"
                disabled={ejemplos.isPending}
                onClick={() => ejemplos.mutate()}
              >
                {ejemplos.isPending
                  ? 'Cargando…'
                  : `Cargar ejemplos de ${org!.rubro ?? 'mi rubro'}`}
              </Button>
            )}
            <Button variant="borde" onClick={() => setEditando('nuevo')}>
              Agregar el primero
            </Button>
          </div>
        </div>
      ) : (
        <>
          <Campo etiqueta="Buscar">
            {(p) => (
              <Input
                {...p}
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Ej.: boca"
              />
            )}
          </Campo>
          <div role="group" aria-label="Filtrar por categoría" className="flex flex-wrap gap-2">
            {(['Todas', ...CATEGORIAS] as const).map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={filtro === c}
                onClick={() => setFiltro(c)}
                className="aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground min-h-9 rounded-full border px-3 text-sm"
              >
                {c}
              </button>
            ))}
          </div>
          {ejemplos.isSuccess && (
            <Aviso tipo="exito">
              Cargamos {ejemplos.data} ítems de ejemplo. Revisá los precios y ajustalos a los tuyos.
            </Aviso>
          )}
          {visibles.length === 0 ? (
            <p className="text-muted-foreground">No hay ítems que coincidan con la búsqueda.</p>
          ) : (
            <ul className="bg-card divide-y overflow-hidden rounded-lg border">
              {visibles.map((i) => (
                <li key={i.id}>
                  <button
                    type="button"
                    onClick={() => setEditando(i)}
                    className="hover:bg-muted grid w-full grid-cols-[1fr_auto] gap-x-3 gap-y-0.5 px-4 py-3 text-left"
                  >
                    <span className="min-w-0 font-semibold">{i.nombre}</span>
                    <span className="text-right font-semibold">{formatARS(i.precio)}</span>
                    <span className="text-muted-foreground text-sm">
                      {i.categoria} · por {i.unidad}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <Hoja
        titulo={editando === 'nuevo' ? 'Nuevo ítem' : 'Editar ítem'}
        abierta={editando !== null}
        onCerrar={cerrar}
      >
        {editando !== null && (
          <FormItem
            key={editando === 'nuevo' ? 'nuevo' : editando.id}
            orgId={orgId}
            item={editando === 'nuevo' ? null : editando}
            onListo={cerrar}
          />
        )}
      </Hoja>
    </>
  )
}

function FormItem({
  orgId,
  item,
  onListo,
}: {
  orgId: string
  item: Item | null
  onListo: () => void
}) {
  const guardar = useGuardarItem(orgId)
  const archivar = useArchivarItem(orgId)
  const [confirmarArchivo, setConfirmarArchivo] = useState(false)
  const form = useForm<ItemFormulario, unknown, ItemDatos>({
    resolver: zodResolver(itemEsquema),
    defaultValues: item
      ? {
          nombre: item.nombre,
          unidad: item.unidad,
          precio: montoParaEditar(item.precio),
          categoria: item.categoria,
        }
      : { nombre: '', unidad: 'u.', precio: '', categoria: 'Materiales' },
  })
  const { errors } = form.formState
  const error = guardar.error ?? archivar.error

  const enviar = form.handleSubmit((datos) =>
    guardar.mutate({ ...datos, id: item?.id }, { onSuccess: onListo }),
  )

  return (
    <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
      {error && (
        <Aviso>
          {(error as { code?: string }).code === '23505'
            ? 'Ya tenés un ítem con ese nombre.'
            : traducirError(error)}
        </Aviso>
      )}
      <Campo etiqueta="Nombre" error={errors.nombre?.message}>
        {(p) => <Input {...p} {...form.register('nombre')} />}
      </Campo>
      <div className="grid grid-cols-2 gap-3">
        <Campo etiqueta="Precio ($)" error={errors.precio?.message}>
          {(p) => (
            <Input {...p} inputMode="decimal" placeholder="18.000" {...form.register('precio')} />
          )}
        </Campo>
        <Campo etiqueta="Unidad" error={errors.unidad?.message}>
          {(p) => <Input {...p} list="unidades" {...form.register('unidad')} />}
        </Campo>
      </div>
      <datalist id="unidades">
        {UNIDADES_SUGERIDAS.map((u) => (
          <option key={u} value={u} />
        ))}
      </datalist>
      <Campo etiqueta="Categoría" error={errors.categoria?.message}>
        {(p) => (
          <Select {...p} {...form.register('categoria')}>
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        )}
      </Campo>
      <Button type="submit" ancho="completo" disabled={guardar.isPending}>
        {guardar.isPending ? 'Guardando…' : 'Guardar'}
      </Button>
      {item &&
        (confirmarArchivo ? (
          <div className="flex flex-col gap-2 rounded-md border p-3">
            <p className="text-sm">
              Deja de aparecer en tu lista. Los presupuestos ya hechos no cambian.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="borde" onClick={() => setConfirmarArchivo(false)}>
                Cancelar
              </Button>
              <Button
                variant="peligro"
                disabled={archivar.isPending}
                onClick={() => archivar.mutate(item.id, { onSuccess: onListo })}
              >
                Sí, quitar
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="borde" ancho="completo" onClick={() => setConfirmarArchivo(true)}>
            Quitar de mi lista
          </Button>
        ))}
    </form>
  )
}
