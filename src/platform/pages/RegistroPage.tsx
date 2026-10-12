import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate } from 'react-router'
import { Button } from '@/ui/button'
import { Aviso, Campo, Input } from '@/ui/campo'
import { traducirError } from '../errores'
import { registroEsquema, type Registro } from '../esquemas'
import { useSesion } from '../sesion-contexto'
import { supabase } from '../supabase'
import { MarcoAcceso } from './MarcoAcceso'

export function RegistroPage() {
  const { sesion } = useSesion()
  const [enviadoA, setEnviadoA] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const form = useForm<Registro>({ resolver: zodResolver(registroEsquema) })
  const { errors, isSubmitting } = form.formState

  if (sesion) return <Navigate to="/app" replace />

  const enviar = form.handleSubmit(async (datos) => {
    setError(null)
    const { error } = await supabase().auth.signUp({
      email: datos.email,
      password: datos.contrasena,
      options: { data: { nombre: datos.nombre }, emailRedirectTo: `${window.location.origin}/app` },
    })
    if (error) setError(traducirError(error))
    else setEnviadoA(datos.email)
  })

  if (enviadoA) {
    return (
      <MarcoAcceso titulo="Revisá tu email">
        <p>
          Te mandamos un link a <strong>{enviadoA}</strong> para confirmar tu cuenta. Abrilo desde
          este mismo celular o computadora.
        </p>
        <p className="text-muted-foreground text-sm">
          ¿No llegó? Revisá la carpeta de spam o promociones. Puede tardar un par de minutos.
        </p>
      </MarcoAcceso>
    )
  }

  return (
    <MarcoAcceso titulo="Creá tu cuenta">
      <p className="text-muted-foreground">
        Gratis, sin tarjeta. En 2 minutos hacés tu primer presupuesto.
      </p>
      {error && <Aviso>{error}</Aviso>}
      <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
        <Campo etiqueta="Tu nombre" error={errors.nombre?.message}>
          {(p) => <Input {...p} autoComplete="name" {...form.register('nombre')} />}
        </Campo>
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
        <Campo
          etiqueta="Contraseña"
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
        <Button type="submit" ancho="completo" disabled={isSubmitting}>
          {isSubmitting ? 'Creando cuenta…' : 'Crear cuenta'}
        </Button>
      </form>
      <p className="text-sm">
        ¿Ya tenés cuenta?{' '}
        <Link to="/entrar" className="font-semibold underline">
          Entrá
        </Link>
      </p>
    </MarcoAcceso>
  )
}
