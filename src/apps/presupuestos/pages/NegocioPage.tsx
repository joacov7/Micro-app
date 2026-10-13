import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  negocioEsquema,
  RUBROS,
  traducirError,
  useActualizarOrganizacion,
  useOrganizacionActual,
} from '@/platform/contract'
import { Button } from '@/ui/button'
import { Aviso, Campo, Input, Select, Textarea } from '@/ui/campo'
import { useAjustes, useGuardarAjustes, type Ajustes } from '../api'
import { ajustesEsquema } from '../esquemas'

const esquema = negocioEsquema.extend(ajustesEsquema.shape)
type Formulario = z.input<typeof esquema>
type Datos = z.output<typeof esquema>

export function NegocioPage() {
  const { data: org } = useOrganizacionActual()
  const ajustes = useAjustes(org!.id)

  return (
    <>
      <h1 className="text-3xl font-bold">Mi negocio</h1>
      <p className="text-muted-foreground">Estos datos salen en cada presupuesto que mandás.</p>
      {ajustes.isPending ? (
        <p role="status" className="text-muted-foreground">
          Cargando…
        </p>
      ) : ajustes.isError ? (
        <Aviso>{traducirError(ajustes.error)}</Aviso>
      ) : (
        <FormNegocio ajustes={ajustes.data} />
      )}
    </>
  )
}

function FormNegocio({ ajustes }: { ajustes: Ajustes }) {
  const { data: org } = useOrganizacionActual()
  const esDueno = org!.rol === 'owner'
  const actualizarOrg = useActualizarOrganizacion()
  const guardarAjustes = useGuardarAjustes(org!.id)
  const [guardado, setGuardado] = useState(false)
  const rubroValido = (RUBROS as readonly string[]).includes(org!.rubro ?? '')
  const form = useForm<Formulario, unknown, Datos>({
    resolver: zodResolver(esquema),
    defaultValues: {
      nombre: org!.nombre,
      rubro: (rubroValido ? org!.rubro : 'Otro') as Datos['rubro'],
      telefono: org!.telefono ?? '',
      validez_dias: String(ajustes.validez_dias),
      forma_pago: ajustes.forma_pago ?? '',
      notas_pie: ajustes.notas_pie ?? '',
    },
  })
  const { errors, isSubmitting } = form.formState
  const error = actualizarOrg.error ?? guardarAjustes.error

  const enviar = form.handleSubmit(async (d) => {
    setGuardado(false)
    try {
      await Promise.all([
        esDueno &&
          actualizarOrg.mutateAsync({
            id: org!.id,
            nombre: d.nombre,
            rubro: d.rubro,
            telefono: d.telefono,
          }),
        guardarAjustes.mutateAsync(d),
      ])
      setGuardado(true)
    } catch {
      // El error queda en el estado de la mutación y se muestra arriba del formulario.
    }
  })

  return (
    <form
      onSubmit={enviar}
      noValidate
      className="flex flex-col gap-4"
      onChange={() => setGuardado(false)}
    >
      {error && <Aviso>{traducirError(error)}</Aviso>}
      {guardado && <Aviso tipo="exito">Listo, guardamos los cambios.</Aviso>}
      {!esDueno && (
        <Aviso tipo="info">
          Solo el dueño de la cuenta puede cambiar el nombre, el rubro y el teléfono.
        </Aviso>
      )}

      <fieldset className="bg-card flex flex-col gap-4 rounded-lg border p-4" disabled={!esDueno}>
        <legend className="font-display px-1 text-lg font-semibold">Datos del negocio</legend>
        <Campo etiqueta="Nombre del negocio" error={errors.nombre?.message}>
          {(p) => <Input {...p} {...form.register('nombre')} />}
        </Campo>
        <Campo etiqueta="Rubro" error={errors.rubro?.message}>
          {(p) => (
            <Select {...p} {...form.register('rubro')}>
              {RUBROS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
          )}
        </Campo>
        <Campo
          etiqueta="WhatsApp del negocio"
          error={errors.telefono?.message}
          ayuda="Tus clientes te escriben a este número."
        >
          {(p) => <Input {...p} type="tel" inputMode="tel" {...form.register('telefono')} />}
        </Campo>
      </fieldset>

      <fieldset className="bg-card flex flex-col gap-4 rounded-lg border p-4">
        <legend className="font-display px-1 text-lg font-semibold">
          Condiciones de tus presupuestos
        </legend>
        <Campo
          etiqueta="Validez (días)"
          error={errors.validez_dias?.message}
          ayuda="Cuántos días respetás el precio."
        >
          {(p) => (
            <Input
              {...p}
              inputMode="numeric"
              className="max-w-32"
              {...form.register('validez_dias')}
            />
          )}
        </Campo>
        <Campo
          etiqueta="Forma de pago"
          error={errors.forma_pago?.message}
          ayuda="Ej.: 50% de anticipo, saldo al terminar."
        >
          {(p) => <Textarea {...p} {...form.register('forma_pago')} />}
        </Campo>
        <Campo
          etiqueta="Nota al pie (opcional)"
          error={errors.notas_pie?.message}
          ayuda="Ej.: Garantía de 90 días en mano de obra."
        >
          {(p) => <Textarea {...p} {...form.register('notas_pie')} />}
        </Campo>
      </fieldset>

      <Button type="submit" ancho="completo" disabled={isSubmitting}>
        {isSubmitting ? 'Guardando…' : 'Guardar cambios'}
      </Button>
    </form>
  )
}
