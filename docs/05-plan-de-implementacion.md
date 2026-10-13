# 05 — Plan de implementación

Fecha: 2026-10-12

Incrementos chicos, cada uno verificable y con aprobación antes del siguiente (`CLAUDE.md` §12). Cada uno termina con la entrega descrita en `prompts/03-implementacion.md`.

La validación comercial sigue en paralelo (D-13). Al terminar las 6 semanas, se revisa el plan con lo aprendido.

---

## Incremento 0 — Cuentas y configuración (lo hacés vos, con guía)

Necesita tu cuenta y tus datos, así que no lo puedo hacer yo. Te doy los pasos uno por uno en `docs/runbooks/00-crear-cuentas.md`.

- Pasar el repositorio a privado (D-15).
- Crear cuenta en Supabase y dos proyectos: `presupuesta-pruebas` y `presupuesta-prod`.
- Crear cuenta en Cloudflare y conectar el repositorio a Cloudflare Pages.
- Crear cuenta en Sentry y en Brevo.
- Cargar las claves como secretos de GitHub (nunca en el código).

**Se verifica:** el checklist del runbook completo. **No bloquea** los incrementos 1 a 3, que funcionan en local y en CI.

## Incremento 1 — Esqueleto y CI ✅ (2026-10-12)

- Proyecto Vite + React + TypeScript, Tailwind, shadcn/ui con los tokens de `03-diseno.md`.
- ESLint, Prettier, Vitest, Playwright.
- GitHub Actions: lint, typecheck, pruebas y build en cada cambio.
- Dependabot.
- `README.md` con cómo correrlo, `.env.example`, `docs/licencias.md`.
- Página de inicio provisoria.

**Se verifica:** CI verde con una prueba de ejemplo; build genera archivos estáticos.

## Incremento 2 — Base de plataforma y acceso ✅ (2026-10-12)

- Migraciones: organizaciones, membresías, perfiles, apps, planes, permisos, suscripciones, pagos, uso, auditoría.
- RLS en todas las tablas y función `entitlement()`.
- Registro, login, recuperación de contraseña; creación de la organización al registrarse.
- Pruebas pgTAP de aislamiento y de administración, corriendo en CI con Supabase local.

**Se verifica:** pruebas de aislamiento verdes; un usuario no ve datos de otra organización.

## Incremento 3 — Mis precios, clientes y mi negocio ✅ (2026-10-13)

- Tablas `pres_items`, `pres_clientes` y `pres_ajustes` con RLS, topes por negocio y pruebas.
- Pantallas: Mis precios (alta, edición, quitar, búsqueda y filtro), Clientes, Mi negocio.
- Ítems de ejemplo por rubro: se cargan con un botón en la lista vacía (no automáticamente al crear el negocio, para que la plataforma no dependa de la app).
- Navegación del panel declarada por la app (`src/apps/presupuestos/manifiesto.tsx`), lista para copiar en la segunda app.
- **Pendiente:** subir el logo del negocio. Es una función del plan Pro y requiere almacenamiento de archivos; pasa al incremento 7.

## Incremento 4 — Presupuestos y PDF

- Tablas de presupuestos, ítems, contador; trigger de totales; numeración sin repetir.
- Pantallas: nuevo presupuesto, detalle, lista e inicio con montos.
- PDF generado en el dispositivo.
- Pruebas de cálculo (unidad) y de totales en la base.

## Incremento 5 — Link para el cliente y seguimiento

- Funciones públicas `ver_presupuesto` y `responder_presupuesto`.
- Página `/p/:token` con aceptar y rechazar.
- Envío por WhatsApp (wa.me) y estados.
- Avisos de seguimiento y vencimiento diario.

**Hito:** acá la app ya sirve para usarla con clientes fundadores en el entorno de pruebas.

## Incremento 6 — Aumento masivo de precios

- Aumento por porcentaje y categoría, con vista previa.
- Prueba: los presupuestos ya emitidos no cambian.

## Incremento 7 — Planes, límites y administración

- Planes Gratis y Pro con sus permisos.
- Límite de 5 presupuestos por mes en la base.
- Panel /admin: organizaciones, activar Pro con fecha de vencimiento, registrar pagos, suspender.
- Pantalla "Pasate a Pro" con el link de pago.
- Vencimiento automático, días de gracia y emails de aviso.

## Incremento 8 — Sitio público y legales

- Inicio, precios, ayuda.
- Borradores de términos, privacidad y cancelación (para revisión de un abogado).
- Botones de arrepentimiento y de baja.

## Incremento 9 — Operación

- Sentry con filtrado de datos personales.
- Backup diario y prueba mensual de restauración.
- Tarea anti-pausa del proyecto de pruebas.
- Publicación en Cloudflare Pages (pruebas y producción).
- Runbooks: cliente pagó y no tiene acceso, el sitio no carga, restaurar backup, proyecto pausado, revisar términos de los servicios.

## Fase 7 — Revisión antes de producción

Según `prompts/03-implementacion.md`. Recién después se habilita a clientes reales.

## Después del lanzamiento

- Automatizar cobros con Mercado Pago (etapa 2 de `04-arquitectura.md` §6).
- Invitar empleados.
- Segunda app (Órdenes de trabajo) copiando el esqueleto.
