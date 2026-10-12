import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/ui/button'
import { Aviso, Campo, Input, Select } from '@/ui/campo'
import { useRefrescarOrganizacion } from '../contract'
import { traducirError } from '../errores'
import { negocioEsquema, RUBROS, type Negocio } from '../esquemas'
import { supabase } from '../supabase'
import { MarcoAcceso } from './MarcoAcceso'

export function CrearNegocioPage() {
  const refrescar = useRefrescarOrganizacion()
  const [error, setError] = useState<string | null>(null)
  const form = useForm<Negocio>({
    resolver: zodResolver(negocioEsquema),
    defaultValues: { telefono: '' },
  })
  const { errors, isSubmitting } = form.formState

  const enviar = form.handleSubmit(async (datos) => {
    setError(null)
    const { error } = await supabase().rpc('crear_organizacion', {
      p_nombre: datos.nombre,
      p_rubro: datos.rubro,
      p_telefono: datos.telefono,
    })
    if (error) setError(traducirError(error))
    else await refrescar()
  })

  return (
    <MarcoAcceso titulo="Contanos de tu negocio">
      <p className="text-muted-foreground">
        Estos datos salen en cada presupuesto. Los podés cambiar después.
      </p>
      {error && <Aviso>{error}</Aviso>}
      <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
        <Campo
          etiqueta="Nombre del negocio"
          error={errors.nombre?.message}
          ayuda="Ej.: Electricidad Romero"
        >
          {(p) => <Input {...p} autoComplete="organization" {...form.register('nombre')} />}
        </Campo>
        <Campo etiqueta="Rubro" error={errors.rubro?.message}>
          {(p) => (
            <Select {...p} defaultValue="" {...form.register('rubro')}>
              <option value="" disabled>
                Elegí uno
              </option>
              {RUBROS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
          )}
        </Campo>
        <Campo etiqueta="WhatsApp del negocio (opcional)" error={errors.telefono?.message}>
          {(p) => (
            <Input
              {...p}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              {...form.register('telefono')}
            />
          )}
        </Campo>
        <Button type="submit" ancho="completo" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando…' : 'Empezar'}
        </Button>
      </form>
    </MarcoAcceso>
  )
}
