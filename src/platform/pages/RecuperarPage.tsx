import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { Button } from '@/ui/button'
import { Aviso, Campo, Input } from '@/ui/campo'
import { traducirError } from '../errores'
import { recuperarEsquema, type Recuperar } from '../esquemas'
import { supabase } from '../supabase'
import { MarcoAcceso } from './MarcoAcceso'

export function RecuperarPage() {
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const form = useForm<Recuperar>({ resolver: zodResolver(recuperarEsquema) })
  const { errors, isSubmitting } = form.formState

  const enviar = form.handleSubmit(async ({ email }) => {
    setError(null)
    const { error } = await supabase().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/nueva-clave`,
    })
    if (error) setError(traducirError(error))
    else setEnviado(true)
  })

  if (enviado) {
    return (
      <MarcoAcceso titulo="Revisá tu email">
        {/* Mismo mensaje exista o no la cuenta: no revela qué emails están registrados. */}
        <p>Si hay una cuenta con ese email, te llegó un link para elegir una contraseña nueva.</p>
        <Link to="/entrar" className="text-sm font-semibold underline">
          Volver a entrar
        </Link>
      </MarcoAcceso>
    )
  }

  return (
    <MarcoAcceso titulo="Recuperá tu contraseña">
      <p className="text-muted-foreground">Te mandamos un link para elegir una nueva.</p>
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
        <Button type="submit" ancho="completo" disabled={isSubmitting}>
          {isSubmitting ? 'Enviando…' : 'Mandarme el link'}
        </Button>
      </form>
      <Link to="/entrar" className="text-sm font-semibold underline">
        Volver a entrar
      </Link>
    </MarcoAcceso>
  )
}
