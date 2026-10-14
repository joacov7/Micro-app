import { useState } from 'react'
import { useParams } from 'react-router'
import { formatARS } from '@/lib/format'
import { traducirError } from '@/platform/contract'
import { Button } from '@/ui/button'
import { buttonVariants } from '@/ui/button-variants'
import { Aviso, Campo, Textarea } from '@/ui/campo'
import { useResponderPublico, useVistaPublica, type VistaPublica } from '../api'
import { numeroPresupuesto } from '../calculos'
import { Documento } from '../componentes'
import { descargarPdf } from '../pdf'
import { linkWhatsApp } from '../whatsapp'

const fecha = (d: string) =>
  new Date(d).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })

/** Lo que ve el cliente final al abrir el link. No requiere cuenta. */
export function PresupuestoPublicoPage() {
  const { token } = useParams()
  const vista = useVistaPublica(token)

  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col gap-4 px-4 py-5">
      {vista.isPending ? (
        <p role="status" className="text-muted-foreground">
          Cargando presupuesto…
        </p>
      ) : vista.isError ? (
        <Aviso>{traducirError(vista.error)}</Aviso>
      ) : !vista.data ? (
        <div className="flex flex-col gap-2 py-10">
          <h1 className="text-3xl font-bold">Este presupuesto no está disponible</h1>
          <p className="text-muted-foreground">
            Revisá que el link esté completo. Si el problema sigue, pedile a quien te lo mandó que
            te lo envíe de nuevo.
          </p>
        </div>
      ) : (
        <Contenido token={token!} vista={vista.data} />
      )}
    </div>
  )
}

function Contenido({ token, vista }: { token: string; vista: VistaPublica }) {
  const { presupuesto: p, emisor, con_marca: conMarca, es_del_negocio: esDelNegocio } = vista
  const responder = useResponderPublico(token)
  const [paso, setPaso] = useState<'inicio' | 'confirmar' | 'rechazar'>('inicio')
  const [motivo, setMotivo] = useState('')
  const [errorPdf, setErrorPdf] = useState<string | null>(null)
  const numero = numeroPresupuesto(p.numero)
  const puedeResponder = (p.estado === 'enviado' || p.estado === 'visto') && !esDelNegocio
  const escribirNegocio = (texto: string) => linkWhatsApp(emisor.telefono, texto)

  const pdf = async () => {
    setErrorPdf(null)
    try {
      await descargarPdf(p, emisor, { conMarca })
    } catch {
      setErrorPdf('No pudimos generar el PDF. Volvé a probar en unos segundos.')
    }
  }

  return (
    <>
      <header className="flex flex-col gap-1">
        <p className="text-muted-foreground text-sm">Presupuesto de</p>
        <h1 className="text-3xl font-bold">{emisor.nombre}</h1>
      </header>

      {esDelNegocio && (
        <Aviso tipo="info">
          Vista previa: así ve tu cliente este presupuesto. Abrirlo vos no lo marca como visto.
        </Aviso>
      )}

      {p.estado === 'aceptado' && (
        <Aviso tipo="exito">
          <strong>Presupuesto aceptado</strong>
          {p.respondido_el ? ` el ${fecha(p.respondido_el)}` : ''}. {emisor.nombre} ya puede verlo
          en su panel.
        </Aviso>
      )}
      {p.estado === 'rechazado' && (
        <Aviso tipo="info">
          Este presupuesto fue rechazado. Si cambiaste de idea, escribile a {emisor.nombre}.
        </Aviso>
      )}
      {p.estado === 'vencido' && (
        <Aviso tipo="info">
          Este presupuesto venció el {fecha(p.vence_el)}. Pedile a {emisor.nombre} uno actualizado.
        </Aviso>
      )}
      {responder.isError && <Aviso>{traducirError(responder.error)}</Aviso>}

      <Documento p={p} emisor={emisor} />
      {conMarca && (
        <p className="text-muted-foreground text-center text-xs">Hecho con Presupuestá</p>
      )}

      <div className="flex flex-col gap-2">
        {puedeResponder && paso === 'inicio' && (
          <>
            <Button ancho="completo" onClick={() => setPaso('confirmar')}>
              Aceptar presupuesto
            </Button>
            <Button variant="borde" ancho="completo" onClick={() => setPaso('rechazar')}>
              No me interesa
            </Button>
          </>
        )}

        {puedeResponder && paso === 'confirmar' && (
          <div className="bg-card flex flex-col gap-3 rounded-lg border p-4">
            <p>
              ¿Confirmás que aceptás el presupuesto N.º {numero} por{' '}
              <strong>{formatARS(p.total)}</strong>?
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="borde" onClick={() => setPaso('inicio')}>
                Volver
              </Button>
              <Button
                disabled={responder.isPending}
                onClick={() => responder.mutate({ respuesta: 'aceptar' })}
              >
                Sí, acepto
              </Button>
            </div>
          </div>
        )}

        {puedeResponder && paso === 'rechazar' && (
          <div className="bg-card flex flex-col gap-3 rounded-lg border p-4">
            <Campo etiqueta="¿Querés contarle por qué? (opcional)">
              {(prop) => (
                <Textarea
                  {...prop}
                  maxLength={500}
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Ej.: conseguí otro precio, lo dejo para más adelante…"
                />
              )}
            </Campo>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="borde" onClick={() => setPaso('inicio')}>
                Volver
              </Button>
              <Button
                variant="marca"
                disabled={responder.isPending}
                onClick={() => responder.mutate({ respuesta: 'rechazar', motivo })}
              >
                Enviar respuesta
              </Button>
            </div>
          </div>
        )}

        {emisor.telefono && !esDelNegocio && (
          <a
            href={escribirNegocio(
              p.estado === 'aceptado'
                ? `Hola, acepté el presupuesto N.º ${numero}. ¿Cuándo podemos coordinar?`
                : `Hola, tengo una consulta sobre el presupuesto N.º ${numero}.`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({
              variant: p.estado === 'aceptado' ? 'accion' : 'borde',
              ancho: 'completo',
            })}
          >
            {p.estado === 'aceptado' ? 'Coordinar por WhatsApp' : 'Consultar por WhatsApp'}
          </a>
        )}
        <Button variant="borde" ancho="completo" onClick={pdf}>
          Descargar PDF
        </Button>
        {errorPdf && <Aviso>{errorPdf}</Aviso>}
      </div>
    </>
  )
}
