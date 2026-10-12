import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import { Button } from '@/ui/button'
import { Aviso, Campo, Input } from '@/ui/campo'
import { traducirError } from '../errores'
import { nuevaClaveEsquema, type NuevaClave } from '../esquemas'
import { useSesion } from '../sesion-contexto'
import { supabase } from '../supabase'
import { MarcoAcceso } from './MarcoAcceso'

export function NuevaClavePage() {
  const { sesion, cargando } = useSesion()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const form = useForm<NuevaClave>({ resolver: zodResolver(nuevaClaveEsquema) })
  const { errors, isSubmitting } = form.formState

  if (cargando) {
    return (
      <MarcoAcceso titulo="Elegí tu contraseña nueva">
        <p>Cargando…</p>
      </MarcoAcceso>
    )
  }
  if (!sesion) {
    return (
      <MarcoAcceso titulo="El link ya no sirve">
        <p>Puede que haya vencido o que ya lo hayas usado. Pedí uno nuevo.</p>
        <Link to="/recuperar" className="font-semibold underline">
          Pedir otro link
        </Link>
      </MarcoAcceso>
    )
  }

  const enviar = form.handleSubmit(async ({ contrasena }) => {
    setError(null)
    const { error } = await supabase().auth.updateUser({ password: contrasena })
    if (error) setError(traducirError(error))
    else navigate('/app', { replace: true })
  })

  return (
    <MarcoAcceso titulo="Elegí tu contraseña nueva">
      {error && <Aviso>{error}</Aviso>}
      <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
        <Campo
          etiqueta="Contraseña nueva"
          error={errors.contrasena?.message}
          ayuda="Al menos 8 caracteres, con letras y números."
        >
          {(p) => (
            <Input
              {...p}
              type="password"
              autoComplete="new-password"
              {...form.register('contrasena')}
            />
          )}
        </Campo>
        <Campo etiqueta="Repetila" error={errors.repetir?.message}>
          {(p) => (
            <Input
              {...p}
              type="password"
              autoComplete="new-password"
              {...form.register('repetir')}
            />
          )}
        </Campo>
        <Button type="submit" ancho="completo" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando…' : 'Guardar contraseña'}
        </Button>
      </form>
    </MarcoAcceso>
  )
}
