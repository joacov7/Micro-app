import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { traducirError, useOrganizacionActual } from '@/platform/contract'
import { Button } from '@/ui/button'
import { Aviso, Campo, Input, Textarea } from '@/ui/campo'
import { Hoja } from '@/ui/hoja'
import { useBorrarCliente, useClientes, useGuardarCliente, type Cliente } from '../api'
import { clienteEsquema, type ClienteDatos } from '../esquemas'

export function ClientesPage() {
  const { data: org } = useOrganizacionActual()
  const orgId = org!.id
  const clientes = useClientes(orgId)
  const [busqueda, setBusqueda] = useState('')
  const [editando, setEditando] = useState<Cliente | 'nuevo' | null>(null)
  const cerrar = useCallback(() => setEditando(null), [])

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLocaleLowerCase('es')
    return (clientes.data ?? []).filter(
      (c) => !q || c.nombre.toLocaleLowerCase('es').includes(q) || (c.telefono ?? '').includes(q),
    )
  }, [clientes.data, busqueda])

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Clientes</h1>
        <Button onClick={() => setEditando('nuevo')}>Agregar</Button>
      </div>

      {clientes.isPending ? (
        <p role="status" className="text-muted-foreground">
          Cargando clientes…
        </p>
      ) : clientes.isError ? (
        <Aviso>{traducirError(clientes.error)}</Aviso>
      ) : clientes.data.length === 0 ? (
        <div className="flex flex-col gap-3 rounded-lg border border-dashed p-5">
          <p className="font-semibold">Todavía no tenés clientes cargados</p>
          <p className="text-muted-foreground">
            Guardá nombre y WhatsApp para mandarles presupuestos en un toque. También los vas a
            poder crear al armar un presupuesto.
          </p>
          <div>
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
                placeholder="Nombre o teléfono"
              />
            )}
          </Campo>
          {visibles.length === 0 ? (
            <p className="text-muted-foreground">No hay clientes que coincidan con la búsqueda.</p>
          ) : (
            <ul className="bg-card divide-y overflow-hidden rounded-lg border">
              {visibles.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setEditando(c)}
                    className="hover:bg-muted flex w-full flex-col px-4 py-3 text-left"
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
        </>
      )}

      <Hoja
        titulo={editando === 'nuevo' ? 'Nuevo cliente' : 'Editar cliente'}
        abierta={editando !== null}
        onCerrar={cerrar}
      >
        {editando !== null && (
          <FormCliente
            key={editando === 'nuevo' ? 'nuevo' : editando.id}
            orgId={orgId}
            cliente={editando === 'nuevo' ? null : editando}
            onListo={cerrar}
          />
        )}
      </Hoja>
    </>
  )
}

function FormCliente({
  orgId,
  cliente,
  onListo,
}: {
  orgId: string
  cliente: Cliente | null
  onListo: () => void
}) {
  const guardar = useGuardarCliente(orgId)
  const borrar = useBorrarCliente(orgId)
  const [confirmarBorrado, setConfirmarBorrado] = useState(false)
  const form = useForm<ClienteDatos>({
    resolver: zodResolver(clienteEsquema),
    defaultValues: {
      nombre: cliente?.nombre ?? '',
      telefono: cliente?.telefono ?? '',
      email: cliente?.email ?? '',
      notas: cliente?.notas ?? '',
    },
  })
  const { errors } = form.formState
  const error = guardar.error ?? borrar.error

  const enviar = form.handleSubmit((datos) =>
    guardar.mutate({ ...datos, id: cliente?.id }, { onSuccess: onListo }),
  )

  return (
    <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
      {error && <Aviso>{traducirError(error)}</Aviso>}
      <Campo etiqueta="Nombre" error={errors.nombre?.message}>
        {(p) => <Input {...p} autoComplete="off" {...form.register('nombre')} />}
      </Campo>
      <Campo
        etiqueta="WhatsApp"
        error={errors.telefono?.message}
        ayuda="Con código de área, por ejemplo 11 4000-1111."
      >
        {(p) => <Input {...p} type="tel" inputMode="tel" {...form.register('telefono')} />}
      </Campo>
      <Campo etiqueta="Email (opcional)" error={errors.email?.message}>
        {(p) => <Input {...p} type="email" inputMode="email" {...form.register('email')} />}
      </Campo>
      <Campo
        etiqueta="Notas (opcional)"
        error={errors.notas?.message}
        ayuda="Por ejemplo, la dirección de la obra."
      >
        {(p) => <Textarea {...p} {...form.register('notas')} />}
      </Campo>
      <Button type="submit" ancho="completo" disabled={guardar.isPending}>
        {guardar.isPending ? 'Guardando…' : 'Guardar'}
      </Button>
      {cliente &&
        (confirmarBorrado ? (
          <div className="flex flex-col gap-2 rounded-md border p-3">
            <p className="text-sm">
              Se borra el cliente de tu lista. Esta acción no se puede deshacer.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="borde" onClick={() => setConfirmarBorrado(false)}>
                Cancelar
              </Button>
              <Button
                variant="peligro"
                disabled={borrar.isPending}
                onClick={() => borrar.mutate(cliente.id, { onSuccess: onListo })}
              >
                Sí, borrar
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="borde" ancho="completo" onClick={() => setConfirmarBorrado(true)}>
            Borrar cliente
          </Button>
        ))}
    </form>
  )
}
