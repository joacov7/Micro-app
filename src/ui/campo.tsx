import { useId, type ComponentProps, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

const claseControl =
  'min-h-11 w-full min-w-0 rounded-md border border-input bg-card px-3 text-base text-foreground placeholder:text-muted-foreground aria-[invalid=true]:border-destructive'

type CampoProps = {
  etiqueta: string
  error?: string
  ayuda?: ReactNode
  children: (props: {
    id: string
    'aria-invalid': boolean
    'aria-describedby'?: string
  }) => ReactNode
}

/** Etiqueta + control + ayuda + error, conectados para lectores de pantalla. */
export function Campo({ etiqueta, error, ayuda, children }: CampoProps) {
  const id = useId()
  const idDesc = error ? `${id}-error` : ayuda ? `${id}-ayuda` : undefined
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {etiqueta}
      </label>
      {children({ id, 'aria-invalid': !!error, 'aria-describedby': idDesc })}
      {error ? (
        <p id={`${id}-error`} className="text-destructive text-sm">
          {error}
        </p>
      ) : ayuda ? (
        <p id={`${id}-ayuda`} className="text-muted-foreground text-sm">
          {ayuda}
        </p>
      ) : null}
    </div>
  )
}

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return <input className={cn(claseControl, className)} {...props} />
}

export function Select({ className, ...props }: ComponentProps<'select'>) {
  return <select className={cn(claseControl, className)} {...props} />
}

export function Aviso({
  tipo = 'error',
  children,
}: {
  tipo?: 'error' | 'exito' | 'info'
  children: ReactNode
}) {
  const estilos = {
    error: 'border-destructive/40 bg-destructive/10 text-destructive',
    exito: 'border-estado-aceptado/40 bg-estado-aceptado/10 text-estado-aceptado',
    info: 'border-border bg-muted text-foreground',
  }[tipo]
  return (
    <div
      role={tipo === 'error' ? 'alert' : 'status'}
      className={cn('rounded-md border p-3 text-sm', estilos)}
    >
      {children}
    </div>
  )
}
