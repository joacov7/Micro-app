import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { Button } from '@/ui/button'
import { Aviso, Campo, Input } from '@/ui/campo'
import { traducirError } from '../errores'
import { entrarEsquema, type Entrar } from '../esquemas'
import { useSesion } from '../sesion-contexto'
import { supabase } from '../supabase'
import { MarcoAcceso } from './MarcoAcceso'

export function EntrarPage() {
  const { sesion } = useSesion()
  const navigate = useNavigate()
  const location = useLocation()
  const destino = (location.state as { desde?: string } | null)?.desde ?? '/app'
  const [error, setError] = useState<string | null>(null)
  const form = useForm<Entrar>({ resolver: zodResolver(entrarEsquema) })
  const { errors, isSubmitting } = form.formState

  if (sesion) return <Navigate to={destino} replace />

  const enviar = form.handleSubmit(async (datos) => {
    setError(null)
    const { error } = await supabase().auth.signInWithPassword({
      email: datos.email,
      password: datos.contrasena,
    })
    if (error) setError(traducirError(error))
    else navigate(destino, { replace: true })
  })

  return (
    <MarcoAcceso titulo="Entrá a tu cuenta">
      {error && <Aviso>{error}</Aviso>}
      <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
        <Campo etiqueta="Email" error={errors.email?.message}>
          {(p) => (
            <Input
              {...p}
              type="email"
              autoComplete="email"
              inputMode="email"
              {...form.register('email')}
            />
          )}
        </Campo>
        <Campo etiqueta="Contraseña" error={errors.contrasena?.message}>
          {(p) => (
            <Input
              {...p}
              type="password"
              autoComplete="current-password"
              {...form.register('contrasena')}
            />
          )}
        </Campo>
        <Button type="submit" ancho="completo" disabled={isSubmitting}>
          {isSubmitting ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>
      <div className="flex flex-col gap-2 text-sm">
        <Link to="/recuperar" className="font-semibold underline">
          Me olvidé la contraseña
        </Link>
        <p>
          ¿No tenés cuenta?{' '}
          <Link to="/registro" className="font-semibold underline">
            Creala gratis
          </Link>
        </p>
      </div>
    </MarcoAcceso>
  )
}
