import { buttonVariants } from '@/ui/button-variants'

const beneficios = [
  {
    titulo: 'Sabé quién vio tu presupuesto',
    texto:
      'Te avisamos cuando el cliente lo abre y si pasaron días sin respuesta. Escribile en el momento justo.',
  },
  {
    titulo: 'Que lo acepte desde el celular',
    texto:
      'Le llega un link por WhatsApp con tu presupuesto y un botón para aceptarlo. Sin papeles ni idas y vueltas.',
  },
  {
    titulo: 'Precios al día en un toque',
    texto:
      '¿Aumentaron los materiales? Actualizá toda tu lista con un porcentaje. Lo ya enviado no cambia.',
  },
]

const anio = new Date().getFullYear()

export function HomePage() {
  return (
    <div className="mx-auto flex min-h-full max-w-3xl flex-col px-4 py-6 sm:px-6">
      <header className="flex items-center gap-3">
        <div
          aria-hidden="true"
          className="bg-primary font-display text-primary-foreground grid size-10 place-items-center rounded-md text-lg font-bold"
        >
          P
        </div>
        <span className="font-display text-2xl font-semibold">Presupuestá</span>
      </header>

      <main className="flex flex-1 flex-col gap-10 py-12">
        <section className="flex flex-col gap-4">
          <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            Para electricistas, gasistas e instaladores
          </p>
          <h1 className="text-4xl leading-tight font-bold sm:text-5xl">
            No pierdas más trabajos por presupuestos sin respuesta
          </h1>
          <p className="text-muted-foreground max-w-[60ch] text-lg">
            Armá presupuestos profesionales en 2 minutos desde el celular, mandalos por WhatsApp y
            seguí cada uno hasta que te digan que sí.
          </p>
          <div>
            <a href="#fundadores" className={buttonVariants({ variant: 'accion' })}>
              Quiero ser cliente fundador
            </a>
          </div>
        </section>

        <section aria-labelledby="beneficios" className="flex flex-col gap-4">
          <h2 id="beneficios" className="text-2xl font-semibold">
            Lo que cambia en tu día
          </h2>
          <ul className="grid gap-3 sm:grid-cols-3">
            {beneficios.map((b) => (
              <li key={b.titulo} className="bg-card rounded-lg border p-4">
                <h3 className="text-lg font-semibold">{b.titulo}</h3>
                <p className="text-muted-foreground mt-1">{b.texto}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="fundadores" className="bg-primary text-primary-foreground rounded-lg p-5">
          <h2 className="text-2xl font-semibold">Estamos sumando los primeros 10 clientes</h2>
          <p className="mt-2 opacity-90">
            Los clientes fundadores pagan la mitad de por vida a cambio de contarnos qué les sirve.
            Muy pronto vas a poder anotarte acá.
          </p>
        </section>
      </main>

      <footer className="text-muted-foreground border-t py-4 text-sm">
        © {anio} Presupuestá · Versión en construcción
      </footer>
    </div>
  )
}
