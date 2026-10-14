import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { traducirError, useOrganizacionActual, usePermiso } from '@/platform/contract'
import { Button } from '@/ui/button'
import { buttonVariants } from '@/ui/button-variants'
import { Aviso } from '@/ui/campo'
import {
  useAjustes,
  useBorrarPresupuesto,
  useDuplicarPresupuesto,
  useMarcarEnviado,
  useMarcarRespuesta,
  usePresupuesto,
  useTokenPublico,
} from '../api'
import { numeroPresupuesto } from '../calculos'
import { Documento, EtiquetaEstado } from '../componentes'
import { descargarPdf } from '../pdf'
import { haceCuanto } from '../seguimiento'
import type { Emisor } from '../tipos'
import { linkPublico, linkWhatsApp, mensajeEnvio, mensajeSeguimiento } from '../whatsapp'

export function DetallePresupuestoPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: org } = useOrganizacionActual()
  const orgId = org!.id
  const presupuesto = usePresupuesto(orgId, id)
  const ajustes = useAjustes(orgId)
  const sinMarca = usePermiso(orgId, 'presupuestos.sin_marca')
  const borrar = useBorrarPresupuesto(orgId)
  const enviar = useMarcarEnviado(orgId)
  const responder = useMarcarRespuesta(orgId)
  const duplicar = useDuplicarPresupuesto(orgId)
  const enviado = !!presupuesto.data && presupuesto.data.estado !== 'borrador'
  const token = useTokenPublico(orgId, id ?? '', enviado)
  const [confirmar, setConfirmar] = useState<'borrar' | 'respuesta' | null>(null)
  const [generando, setGenerando] = useState(false)
  const [aviso, setAviso] = useState<string | null>(null)
  const [errorLocal, setErrorLocal] = useState<string | null>(null)
  const [ahora] = useState(() => new Date())

  if (presupuesto.isPending || ajustes.isPending) {
    return (
      <p role="status" className="text-muted-foreground">
        Cargando presupuesto…
      </p>
    )
  }
  if (presupuesto.isError) return <Aviso>{traducirError(presupuesto.error)}</Aviso>
  if (!presupuesto.data) {
    return (
      <Aviso>
        No encontramos ese presupuesto.{' '}
        <Link to="/app" className="underline">
          Volver al inicio
        </Link>
      </Aviso>
    )
  }

  const p = presupuesto.data
  const emisor: Emisor = {
    nombre: org!.nombre,
    rubro: org!.rubro,
    telefono: org!.telefono,
    notas_pie: ajustes.data?.notas_pie ?? null,
  }
  const esBorrador = p.estado === 'borrador'
  const esperandoRespuesta =
    p.estado === 'enviado' || p.estado === 'visto' || p.estado === 'vencido'
  // Volver a escribirle tiene sentido si ya lo vio o si pasó al menos un día del envío.
  const convieneSeguimiento =
    p.estado === 'visto' ||
    (p.estado === 'enviado' && !!p.enviado_el && haceCuanto(p.enviado_el, ahora) !== 'hoy')
  const link = token.data ? linkPublico(window.location.origin, token.data) : null
  const error = errorLocal ?? [borrar, enviar, responder, duplicar].find((m) => m.isError)?.error

  // Abre WhatsApp en una pestaña nueva. Se abre la ventana antes de esperar a la base
  // para que el navegador no la bloquee como ventana emergente.
  const enviarPorWhatsApp = async () => {
    setErrorLocal(null)
    const ventana = window.open('', '_blank')
    try {
      const codigo = await enviar.mutateAsync(p.id)
      const destino = linkWhatsApp(
        p.cliente_telefono,
        mensajeEnvio(p, emisor.nombre, linkPublico(window.location.origin, codigo)),
      )
      if (ventana) ventana.location.href = destino
      else window.location.href = destino
      setAviso('Listo. Te avisamos acá cuando tu cliente lo abra.')
    } catch {
      ventana?.close()
    }
  }

  const copiarLink = async () => {
    if (!link) return
    try {
      await navigator.clipboard.writeText(link)
      setAviso('Copiamos el link. Pegalo donde quieras mandarlo.')
    } catch {
      setAviso('No pudimos copiarlo solo: mantené apretado el link para copiarlo.')
    }
  }

  const pdf = async () => {
    setErrorLocal(null)
    setGenerando(true)
    try {
      await descargarPdf(p, emisor, { conMarca: sinMarca.data !== 1 })
    } catch {
      setErrorLocal(
        'No pudimos generar el PDF. Volvé a probar; si sigue fallando, actualizá la página.',
      )
    } finally {
      setGenerando(false)
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-3xl font-bold">N.º {numeroPresupuesto(p.numero)}</h1>
        <EtiquetaEstado estado={p.estado} />
      </div>

      {p.estado === 'enviado' && (
        <p className="text-muted-foreground text-sm">
          Enviado {p.enviado_el ? haceCuanto(p.enviado_el, ahora) : ''}. Tu cliente todavía no lo
          abrió.
        </p>
      )}
      {p.estado === 'visto' && p.visto_el && (
        <p className="text-muted-foreground text-sm">
          Tu cliente lo abrió {haceCuanto(p.visto_el, ahora)} y todavía no respondió.
        </p>
      )}

      {aviso && <Aviso tipo="exito">{aviso}</Aviso>}
      {error && <Aviso>{typeof error === 'string' ? error : traducirError(error)}</Aviso>}

      <div className="flex flex-col gap-2">
        {esBorrador && (
          <Button
            variant="accion"
            ancho="completo"
            disabled={enviar.isPending}
            onClick={enviarPorWhatsApp}
          >
            Enviar por WhatsApp
          </Button>
        )}
        {convieneSeguimiento && link && (
          <a
            href={linkWhatsApp(p.cliente_telefono, mensajeSeguimiento(p, link))}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: 'accion', ancho: 'completo' })}
          >
            Volver a escribirle por WhatsApp
          </a>
        )}
      </div>

      {link && (
        <div className="bg-card flex flex-col gap-1.5 rounded-lg border p-3">
          <label htmlFor="link-cliente" className="text-sm font-medium">
            Link para tu cliente
          </label>
          <div className="flex gap-2">
            <input
              id="link-cliente"
              readOnly
              value={link}
              onFocus={(e) => e.currentTarget.select()}
              className="bg-muted min-h-11 min-w-0 flex-1 rounded-md border px-3 text-sm"
            />
            <Button variant="borde" onClick={copiarLink}>
              Copiar
            </Button>
          </div>
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold underline"
          >
            Ver lo que recibe tu cliente
          </a>
        </div>
      )}

      <Documento p={p} emisor={emisor} />

      {p.estado === 'rechazado' && p.motivo_rechazo && (
        <Aviso tipo="info">Motivo del rechazo: {p.motivo_rechazo}</Aviso>
      )}

      <div className="flex flex-col gap-2">
        <Button variant="borde" ancho="completo" onClick={pdf} disabled={generando}>
          {generando ? 'Generando PDF…' : 'Descargar PDF'}
        </Button>

        {esBorrador && (
          <Link
            to={`/app/presupuestos/${p.id}/editar`}
            className={buttonVariants({ variant: 'marca', ancho: 'completo' })}
          >
            Editar
          </Link>
        )}

        {esperandoRespuesta &&
          (confirmar === 'respuesta' ? (
            <div className="flex flex-col gap-2 rounded-md border p-3">
              <p className="text-sm">¿Qué te respondió el cliente?</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="borde"
                  disabled={responder.isPending}
                  onClick={() =>
                    responder.mutate(
                      { id: p.id, respuesta: 'rechazar' },
                      { onSuccess: () => setConfirmar(null) },
                    )
                  }
                >
                  No lo aceptó
                </Button>
                <Button
                  disabled={responder.isPending}
                  onClick={() =>
                    responder.mutate(
                      { id: p.id, respuesta: 'aceptar' },
                      { onSuccess: () => setConfirmar(null) },
                    )
                  }
                >
                  Lo aceptó
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="borde" ancho="completo" onClick={() => setConfirmar('respuesta')}>
              Me respondió por otro medio
            </Button>
          ))}

        {!esBorrador && (
          <Button
            variant="borde"
            ancho="completo"
            disabled={duplicar.isPending}
            onClick={() =>
              duplicar.mutate(p.id, {
                onSuccess: (nuevo) => navigate(`/app/presupuestos/${nuevo}/editar`),
              })
            }
          >
            Duplicar con precios actuales
          </Button>
        )}

        {esBorrador &&
          (confirmar === 'borrar' ? (
            <div className="flex flex-col gap-2 rounded-md border p-3">
              <p className="text-sm">Se borra este borrador. No se puede deshacer.</p>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="borde" onClick={() => setConfirmar(null)}>
                  Cancelar
                </Button>
                <Button
                  variant="peligro"
                  disabled={borrar.isPending}
                  onClick={() =>
                    borrar.mutate(p.id, { onSuccess: () => navigate('/app', { replace: true }) })
                  }
                >
                  Sí, borrar
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="borde" ancho="completo" onClick={() => setConfirmar('borrar')}>
              Borrar borrador
            </Button>
          ))}
      </div>
    </>
  )
}
