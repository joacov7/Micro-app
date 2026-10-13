import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { traducirError, useOrganizacionActual, usePermiso } from '@/platform/contract'
import { Button } from '@/ui/button'
import { buttonVariants } from '@/ui/button-variants'
import { Aviso } from '@/ui/campo'
import { useAjustes, useBorrarPresupuesto, usePresupuesto } from '../api'
import { numeroPresupuesto } from '../calculos'
import { Documento, EtiquetaEstado } from '../componentes'
import { descargarPdf } from '../pdf'
import type { Emisor } from '../tipos'

export function DetallePresupuestoPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: org } = useOrganizacionActual()
  const orgId = org!.id
  const presupuesto = usePresupuesto(orgId, id)
  const ajustes = useAjustes(orgId)
  const sinMarca = usePermiso(orgId, 'presupuestos.sin_marca')
  const borrar = useBorrarPresupuesto(orgId)
  const [confirmarBorrado, setConfirmarBorrado] = useState(false)
  const [generando, setGenerando] = useState(false)
  const [errorPdf, setErrorPdf] = useState<string | null>(null)

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

  const pdf = async () => {
    setErrorPdf(null)
    setGenerando(true)
    try {
      await descargarPdf(p, emisor, { conMarca: sinMarca.data !== 1 })
    } catch {
      setErrorPdf(
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

      <Documento p={p} emisor={emisor} />

      {errorPdf && <Aviso>{errorPdf}</Aviso>}
      {borrar.isError && <Aviso>{traducirError(borrar.error)}</Aviso>}

      <div className="flex flex-col gap-2">
        <Button ancho="completo" onClick={pdf} disabled={generando}>
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
        {esBorrador &&
          (confirmarBorrado ? (
            <div className="flex flex-col gap-2 rounded-md border p-3">
              <p className="text-sm">Se borra este borrador. No se puede deshacer.</p>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="borde" onClick={() => setConfirmarBorrado(false)}>
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
            <Button variant="borde" ancho="completo" onClick={() => setConfirmarBorrado(true)}>
              Borrar borrador
            </Button>
          ))}
        <p className="text-muted-foreground text-sm">
          Muy pronto: enviarlo por WhatsApp con un link para que tu cliente lo acepte desde el
          celular.
        </p>
      </div>
    </>
  )
}
