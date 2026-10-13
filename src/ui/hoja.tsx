import { useEffect, useId, useRef, type ReactNode } from 'react'

/**
 * Hoja modal: sube desde abajo en el celular y se centra en la computadora.
 * Se cierra con Escape o tocando afuera, y devuelve el foco al elemento anterior.
 */
export function Hoja({
  titulo,
  abierta,
  onCerrar,
  children,
}: {
  titulo: string
  abierta: boolean
  onCerrar: () => void
  children: ReactNode
}) {
  const idTitulo = useId()
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!abierta) return
    const anterior = document.activeElement as HTMLElement | null
    const primero = panel.current?.querySelector<HTMLElement>('input, select, textarea, button')
    primero?.focus()
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar()
    }
    document.addEventListener('keydown', alTeclear)
    return () => {
      document.removeEventListener('keydown', alTeclear)
      anterior?.focus()
    }
  }, [abierta, onCerrar])

  if (!abierta) return null
  return (
    <div
      className="fixed inset-0 z-30 flex items-end justify-center bg-black/45 sm:items-center"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCerrar()
      }}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        className="bg-card flex max-h-[90dvh] w-full max-w-md flex-col gap-4 overflow-y-auto rounded-t-2xl p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:rounded-2xl"
      >
        <h2 id={idTitulo} className="text-2xl font-semibold">
          {titulo}
        </h2>
        {children}
      </div>
    </div>
  )
}
