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

## D-13 — Desarrollar en paralelo con la validación
- **Fecha:** 2026-10-12
- **Estado:** Aprobada el 2026-10-12 (pedido explícito)
- **Decisión:** arrancar el desarrollo sin esperar el resultado de las 6 semanas de validación. Modifica D-02.
- **Riesgo aceptado:** invertir tiempo en algo que quizás no se pague. Mitigación: los incrementos 1 y 2 (esqueleto y plataforma) se reutilizan si se cambia a Órdenes de trabajo; al terminar la validación se revisa el plan.

## D-14 — Vite + React estático en lugar de Next.js
- **Fecha:** 2026-10-12
- **Estado:** Aprobada el 2026-10-12
- **Recomendación:** aplicación estática (Vite + React + TypeScript) en Cloudflare Pages, con la lógica y la seguridad en Supabase (RLS y funciones SQL). Modifica `CLAUDE.md` §5.
- **Alternativas:** Next.js en Cloudflare Workers (el plan gratuito permite 10 ms de CPU por solicitud y el renderizado en servidor suele superarlo); Next.js en Netlify (300 créditos al mes, el sitio se pausa al agotarlos).
- **Motivo:** es la única opción que entra en planes gratuitos con uso comercial sin riesgo de cortes. Ver `docs/04-arquitectura.md` §1.

## D-15 — Repositorio privado
- **Fecha:** 2026-10-12
- **Estado:** Aprobada el 2026-10-12
- **Recomendación:** pasar `joacov7/Micro-app` a privado antes de subir código. Hoy es público.
- **Motivo:** expone la estrategia y el código a competidores, y los backups no pueden guardarse en un repositorio público. GitHub Free da 2.000 minutos de Actions por mes en privados.

## D-16 — Invoify: tomar ideas, no código; PDF en el dispositivo con jsPDF
- **Fecha:** 2026-10-13
- **Estado:** Aprobada el 2026-10-13 (se aprobó evaluarlo; esta es la conclusión de la evaluación)
- **Evaluación:** [Invoify](https://github.com/al1abb/invoify) tiene licencia MIT (verificada en su archivo LICENSE, último cambio 24/08/2026). Genera el PDF en un servidor con Puppeteer (Chromium) a partir de plantillas HTML de Next.js.
- **Decisión:** no copiar código. Su forma de generar el PDF requiere un servidor, que no tenemos ni entra en los planes gratuitos (D-14). Se tomaron solo ideas de diseño del documento (encabezado, cliente, tabla de detalle, totales, condiciones).
- **Alternativa elegida:** jsPDF + jspdf-autotable (MIT), que generan el PDF en el celular o la computadora del usuario. Se cargan solo al tocar "Descargar PDF".
