# Registro de decisiones

Cada decisión tiene fecha, estado, alternativas y motivo.

Estados: **Pendiente** (necesita aprobación) · **Aprobada** · **Rechazada**.

---

## D-01 — Primera app: Presupuestador
- **Fecha:** 2026-10-11
- **Estado:** Aprobada el 2026-10-11
- **Recomendación:** Presupuestador para oficios y comercios, vendido como "no pierdas presupuestos" y no como generador de PDF.
- **Alternativas:** Órdenes de trabajo (2.ª, validar en paralelo) y Libreta de fiado (3.ª).
- **Motivo:** el mayor puntaje de la matriz (4,30); la más simple de mantener sin programar; construye el núcleo que reutilizan las otras finalistas. Ver `docs/02-oportunidades.md`.

## D-02 — Validar antes de construir
- **Fecha:** 2026-10-11
- **Estado:** Aprobada el 2026-10-11
- **Recomendación:** 6 semanas de validación (entrevistas, prototipo y preventa) con meta de 3 pagos anticipados antes de la fase 3 de implementación.
- **Alternativa:** construir el MVP directamente.
- **Motivo:** existen alternativas gratuitas. Hay que confirmar que alguien paga por el seguimiento antes de invertir meses.

## D-03 — Segmento inicial
- **Fecha:** 2026-10-11
- **Estado:** Aprobada el 2026-10-11
- **Recomendación:** oficios e instaladores con más de 5 presupuestos por mes. En paralelo, servicios técnicos para validar Órdenes de trabajo.
- **Alternativa:** comercios que cotizan a pedido (corralones, imprentas).

## D-04 — Hosting: Cloudflare (provisorio)
- **Fecha:** 2026-10-11
- **Estado:** Aprobada el 2026-10-11 (provisoria, se confirma en la fase 4)
- **Recomendación:** Cloudflare Workers con OpenNext.
- **Alternativas:** Netlify Free (300 créditos, pausa del sitio si se agotan) y Vercel Hobby (descartado: no permite uso comercial).
- **Pendiente de verificar:** términos comerciales de Cloudflare y compatibilidad de Next.js.

## D-05 — WhatsApp solo por enlaces wa.me
- **Fecha:** 2026-10-11
- **Estado:** Aprobada el 2026-10-11
- **Recomendación:** no usar la API de WhatsApp Business (cobra por mensaje). Usar enlaces "click to chat", gratuitos.
- **Consecuencia:** el envío no es automático; el comercio toca un botón para mandar el mensaje.

## D-06 — Cobro a fundadores manual
- **Fecha:** 2026-10-11
- **Estado:** Aprobada el 2026-10-11
- **Recomendación:** hasta unos 10–20 clientes, link de pago de Mercado Pago y activación manual desde el panel. Las suscripciones automáticas (`/preapproval`) se implementan después.
- **Motivo:** permite empezar a cobrar antes y reduce el riesgo técnico inicial.

## D-07 — Monitoreo solo con Sentry
- **Fecha:** 2026-10-11
- **Estado:** Aprobada el 2026-10-11
- **Recomendación:** Sentry Developer (errores, disponibilidad y tareas programadas) y descartar UptimeRobot, cuyo uso comercial en el plan gratuito es dudoso.

## D-08 — Email: Brevo hasta tener dominio
- **Fecha:** 2026-10-11
- **Estado:** Aprobada el 2026-10-11 (provisoria, se confirma en la fase 4)
- **Recomendación:** Brevo Free (300 emails por día). Reevaluar Resend al comprar dominio.

## D-09 — Backups propios
- **Fecha:** 2026-10-11
- **Estado:** Aprobada el 2026-10-11
- **Recomendación:** exportación diaria con GitHub Actions a almacenamiento gratuito, con restauración probada antes de lanzar. Pasar a Supabase Pro (USD 25/mes) cuando los ingresos lo cubran.

## D-10 — Facturación manual
- **Fecha:** 2026-10-11
- **Estado:** Aprobada el 2026-10-11
- **Recomendación:** factura C manual en ARCA para cada cobro hasta unos 20 clientes. Consultar con un contador la categoría de monotributo y si conviene automatizar después.

## D-11 — Botones de arrepentimiento y de baja
- **Fecha:** 2026-10-11
- **Estado:** Aprobada el 2026-10-11
- **Recomendación:** implementarlos igual, aunque no sea seguro que apliquen. Consultar con un abogado antes de cobrar.

## D-12 — Agent Core
- **Fecha:** 2026-10-11
- **Estado:** Pendiente
- **Pregunta abierta:** ¿qué es Agent Core y tiene relación con este proyecto? Si no, se elimina la mención de `CLAUDE.md`.
