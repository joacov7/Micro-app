import type { ReactNode } from 'react'
import { Link } from 'react-router'

/** Marco común de las pantallas de registro, ingreso y recuperación. */
export function MarcoAcceso({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-sm flex-col gap-6 px-4 py-8">
      <Link to="/" className="flex items-center gap-3 self-start">
        <span
          aria-hidden="true"
          className="bg-primary font-display text-primary-foreground grid size-9 place-items-center rounded-md font-bold"
        >
          P
        </span>
        <span className="font-display text-xl font-semibold">Presupuestá</span>
      </Link>
      <main className="flex flex-col gap-5">
        <h1 className="text-3xl font-bold">{titulo}</h1>
        {children}
      </main>
    </div>
  )
}
