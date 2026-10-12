import { Link } from 'react-router'
import { buttonVariants } from '@/ui/button-variants'

export function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col justify-center gap-4 px-4 py-12">
      <h1 className="text-3xl font-bold">No encontramos esta página</h1>
      <p className="text-muted-foreground">
        Puede que el enlace esté mal escrito o que la página ya no exista.
      </p>
      <div>
        <Link to="/" className={buttonVariants({ variant: 'marca' })}>
          Ir al inicio
        </Link>
      </div>
    </main>
  )
}
