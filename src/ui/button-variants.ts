import { cva } from 'class-variance-authority'

// Basado en el Button de shadcn/ui (MIT), adaptado a los tokens del proyecto.
export const buttonVariants = cva(
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 text-[15px] font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        accion: 'bg-accent text-accent-foreground hover:brightness-95',
        marca: 'bg-primary text-primary-foreground hover:opacity-90',
        borde: 'border border-border bg-card text-foreground hover:bg-muted',
        peligro: 'bg-destructive text-destructive-foreground hover:opacity-90',
      },
      ancho: { auto: '', completo: 'w-full' },
    },
    defaultVariants: { variant: 'accion', ancho: 'auto' },
  },
)
