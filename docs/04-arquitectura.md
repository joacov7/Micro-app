# 04 — Arquitectura técnica

Fecha: 2026-10-12
Fase: 4 (sin código)

Convención: **[Hecho]** con fuente y fecha · **[Hipótesis]** a validar.

---

## 1. Decisión principal: aplicación estática + Supabase

**[Hecho]** El plan gratuito de Cloudflare Workers permite 10 ms de CPU por solicitud. Cloudflare indica que la autenticación y el renderizado en servidor suelen usar 10–20 ms, y al excederlo devuelve el error 1102. [Límites de Workers](https://developers.cloudflare.com/workers/platform/limits/) · [Error 1102](https://developers.cloudflare.com/support/troubleshooting/http-status-codes/cloudflare-1xxx-errors/error-1102/) (consultado 2026-10-12)

**Conclusión:** Next.js con renderizado en servidor sobre el plan gratuito de Cloudflare sería frágil. Netlify gratis tiene 300 créditos al mes y pausa el sitio al agotarlos (`01-auditoria.md`). Vercel gratis no permite uso comercial.

**Arquitectura elegida:**

```
Navegador (React)  ──HTTPS──▶  Supabase
  │                             ├─ Auth (login, sesiones, recuperación)
  │ archivos estáticos           ├─ Postgres + Row Level Security (los datos y los permisos)
  ▼                             ├─ Funciones SQL (operaciones sensibles y link público)
Cloudflare Pages                └─ Edge Functions (solo lo que necesite secretos: emails, Mercado Pago)
(solo sirve HTML/JS/CSS)
                                GitHub Actions: CI, backups, tareas diarias
                                Sentry: errores y disponibilidad
```

- **[Hecho, fuentes de terceros]** En Cloudflare Pages, los archivos estáticos se sirven sin límite de solicitudes ni de transferencia en el plan gratuito, sin restricción comercial. Límites: 500 builds por mes, 20.000 archivos, 25 MiB por archivo. [vpsranking](https://vpsranking.com/serverless/cloudflare-pages/) · [agentdeals](https://agentdeals.dev/hosting-free-tier-comparison-2026)
- **[Hecho, fuentes de terceros]** Supabase gratis incluye 500.000 invocaciones de Edge Functions por mes. [designrevision](https://designrevision.com/blog/supabase-pricing.md)
- **Ventajas:** no hay servidor propio; Cloudflare no ejecuta código, así que no hay límite de CPU que alcanzar; toda la seguridad vive en la base de datos (RLS), que es el lugar más difícil de saltear.
- **Desventaja:** el sitio público es una aplicación de una sola página, con SEO más limitado. Aceptable: la venta es directa (D-02). Si más adelante importa el SEO, las páginas públicas se pueden prerenderizar.

**Cambia respecto de `CLAUDE.md` §5:** Vite + React en lugar de Next.js. Sigue siendo el stack de React más común y lo mantiene cualquier desarrollador. Registrado como D-14.

## 2. Stack

| Pieza | Elección | Licencia | Motivo |
|---|---|---|---|
| Lenguaje | TypeScript | Apache 2.0 | Tipos que atrapan errores antes de publicar |
| Interfaz | React + Vite | MIT | Estándar, compila a archivos estáticos |
| Rutas | React Router | MIT | Estándar |
| Datos en el cliente | TanStack Query | MIT | Caché, reintentos y estados de carga sin código propio |
| Formularios y validación | React Hook Form + Zod | MIT | Zod valida igual en el cliente; la base valida de nuevo |
| Estilos y componentes | Tailwind CSS + shadcn/ui | MIT | Componentes copiados al repo, sin dependencia de un proveedor |
| PDF | jsPDF + jspdf-autotable | MIT | Se genera en el dispositivo del usuario: costo cero de servidor |
| Base, auth, funciones | Supabase (Postgres 15+) | Apache 2.0 (cliente) | Plan gratuito suficiente; RLS |
| Pruebas | Vitest, Playwright, pgTAP | MIT / Apache 2.0 / PostgreSQL | Unidad, punta a punta y permisos en la base |
| Calidad | Oxlint, Prettier | MIT | Oxlint es el linter que trae la plantilla oficial de Vite |
| Dependencias | Dependabot | Servicio integrado de GitHub | Actualizaciones automáticas, sin servicios extra |
| Errores | Sentry SDK | MIT (SDK) | Plan gratuito |
| Email | Brevo (D-08) | — | 300 por día gratis |
| Hosting | Cloudflare Pages | — | Estáticos sin límite |

Cada dependencia se registra en `docs/licencias.md` al incorporarla.

### Plantillas evaluadas (construir o adaptar)

| Plantilla | Licencia | Encaje | Decisión |
|---|---|---|---|
| Next.js SaaS Starter (Vercel) | MIT | Pensada para Next.js con servidor y Stripe | No: el servidor no entra en el plan gratuito y Stripe no cobra en Argentina |
| Open SaaS (Wasp) | MIT | Framework Wasp, poco conocido en Argentina | No: viola "nada exótico" |
| Makerkit / Supastarter | Pagas | — | No: prohibido por costo cero |

**Decisión:** construir sobre Vite + Supabase, copiando patrones documentados de Supabase (auth, RLS multi-tenant) y componentes de shadcn/ui. La parte reutilizable de una plantilla (login, organizaciones) es chica en esta arquitectura porque Supabase Auth ya la resuelve.

## 3. Módulos y límites

```
src/
  platform/        Plataforma: auth, organización, planes, permisos, cuenta, admin
    contract.ts    ← ÚNICA interfaz que usan las apps
  apps/
    presupuestos/  App 1: pantallas, consultas, PDF, pruebas
  site/            Sitio público y páginas legales
  ui/              Componentes compartidos (shadcn/ui adaptados)
supabase/
  migrations/      Cambios de base de datos versionados
  tests/           Pruebas de permisos (pgTAP)
```

**Contrato de micro-app** (`platform/contract.ts` + funciones SQL):
- `useCurrentOrg()`: organización activa y rol del usuario.
- `can(key)` / `limit(key)`: permisos y límites del plan (`presupuestos.seguimiento`, `presupuestos.por_mes`).
- `recordUsage(key)`: registro de uso para los límites.
- Una app **no** lee tablas de plataforma ni de otras apps. Sus tablas llevan prefijo propio (`pres_`) y siempre `org_id`.
- La base hace cumplir los límites (función `entitlement(org, key)`), no solo la interfaz.

**Segunda app:** se copia `apps/presupuestos` como esqueleto, se agrega su prefijo de tablas y sus permisos en `plan_entitlements`.

## 4. Modelo de datos

### Plataforma
| Tabla | Campos principales |
|---|---|
| `organizations` | id, nombre, rubro, teléfono, logo_path, created_at |
| `memberships` | org_id, user_id, rol (`owner` / `member`) |
| `profiles` | user_id, nombre, `is_platform_admin` |
| `apps` | id (slug), nombre, estado (`publicada` / `oculta` / `retirada`), descripción |
| `plans` | id, app_id, nombre, precio_ars, intervalo, activo |
| `plan_entitlements` | plan_id, clave, valor (número o sí/no) |
| `subscriptions` | id, org_id, app_id, plan_id, estado (`prueba` / `activa` / `pago_pendiente` / `en_gracia` / `suspendida` / `cancelada`), vence_el, proveedor, ref_proveedor |
| `payments` | id, org_id, subscription_id, monto, moneda, estado, proveedor, **id_pago_proveedor único**, pagado_el, cargado_por |
| `usage_counters` | org_id, clave, período, cantidad |
| `audit_log` | quién, organización, acción, datos, cuándo |

El índice único en `id_pago_proveedor` hace que registrar dos veces el mismo pago (manual o por webhook) no duplique nada.

### App Presupuestador
| Tabla | Campos principales |
|---|---|
| `pres_clientes` | id, org_id, nombre, telefono, notas |
| `pres_items` | id, org_id, nombre, unidad, precio, categoría, activo |
| `pres_presupuestos` | id, org_id, número (correlativo por organización), cliente_id, estado, descuento_pct, subtotal, total, validez_dias, condiciones, **token_publico** (aleatorio de 128 bits), enviado_el, visto_el, respondido_el, motivo_rechazo |
| `pres_presupuesto_items` | id, presupuesto_id, org_id, descripción, unidad, cantidad, precio_unitario (copia del precio al emitir) |
| `pres_contador` | org_id, último_número (con bloqueo de fila para no repetir números) |

- Montos en `numeric(14,2)`, nunca en coma flotante.
- Un trigger recalcula subtotal y total desde los ítems: el total guardado no depende de lo que mande el navegador.

## 5. Permisos y seguridad

- **RLS en todas las tablas.** Regla base: una fila es visible y editable solo si su `org_id` está en las membresías del usuario.
- **Administración:** las tablas de planes, pagos y apps solo se modifican con `is_platform_admin`, verificado en la base. La ruta `/admin` además lo comprueba, pero la seguridad real está en la base.
- **Link público:** el cliente final no tiene usuario. Accede solo por funciones SQL (`ver_presupuesto(token)`, `responder_presupuesto(token, respuesta)`) que devuelven ese presupuesto y nada más. El token es impredecible (128 bits); las tablas no son accesibles en forma anónima.
- **"Visto":** lo registra `ver_presupuesto` solo la primera vez y si quien lo abre no es miembro de la organización.
- **Límites de solicitudes:** Supabase Auth trae límites para login, registro y recuperación. Las funciones públicas registran intentos por token y bloquean ráfagas.
- **Secretos:** claves de servicio solo en Edge Functions y GitHub Actions (secretos cifrados). El navegador solo recibe la clave pública, que sin RLS no da acceso a nada.
- **Validación:** Zod en el cliente; restricciones `check`, `not null` y funciones en la base.
- **Errores:** Sentry con datos personales filtrados (sin emails, nombres ni montos de clientes finales).
- **Pruebas de aislamiento:** pgTAP crea dos organizaciones y verifica que ninguna lea ni modifique datos de la otra, en cada tabla. Corren en CI en cada cambio.
- **Repositorio:** hoy es **público**. Debe pasar a privado antes de subir código (D-15): expone la lógica de negocio y los backups no pueden ir a un repositorio público.

## 6. Pagos (D-06: manual primero)

**Etapa 1 (hasta 10–20 clientes):**
1. El cliente paga con un link de Mercado Pago creado a mano.
2. El administrador ve el pago en su cuenta de Mercado Pago.
3. En /admin carga el número de operación (`id_pago_proveedor`, único), el monto y activa el plan hasta una fecha.
4. Una tarea diaria pasa a `en_gracia` las suscripciones vencidas y, a los 7 días, a Gratis. Avisos por email antes de cada cambio.

**Etapa 2 (automatización, cuando haya ~15 clientes o si la carga manual supera 1 hora por mes):**
- Suscripciones de Mercado Pago (`/preapproval`) creadas desde una Edge Function.
- Webhook en Edge Function: valida la firma, consulta el pago en la API de Mercado Pago (nunca confía en el contenido del aviso) y lo registra con el mismo índice único.
- Conciliación diaria: compara pagos de Mercado Pago de las últimas 72 horas contra `payments`.
- **Pendiente de probar en el entorno de pruebas:** cuándo aplica un cambio de monto en una suscripción activa (`01-auditoria.md` §3.6).

Nunca se guardan datos de tarjetas: el cobro ocurre en las pantallas de Mercado Pago.

## 7. Entornos

| Entorno | Base | Sitio | Uso |
|---|---|---|---|
| Local | Supabase CLI en Docker | Vite en la computadora | Desarrollo |
| Pruebas | Proyecto Supabase 1 (gratis) | Cloudflare Pages, rama `develop` o vista previa por PR | Probar antes de publicar; datos ficticios |
| Producción | Proyecto Supabase 2 (gratis) | Cloudflare Pages, rama `master` | Clientes reales |

Las migraciones se aplican primero en pruebas y después en producción, desde GitHub Actions.

## 8. Automatizaciones de mantenimiento

| Tarea | Herramienta | Frecuencia |
|---|---|---|
| Lint, typecheck, pruebas, build | GitHub Actions | Cada cambio |
| Pruebas de permisos (pgTAP) con Supabase local | GitHub Actions (Docker) | Cada cambio |
| Actualizar dependencias (menores se aplican solas si pasa CI) | Dependabot | Semanal |
| Backup de la base (pg_dump cifrado, se conservan 30 días) | GitHub Actions | Diario |
| Prueba de restauración del backup | GitHub Actions | Mensual |
| Vencimientos (presupuestos y suscripciones) | `pg_cron` en Supabase | Diario |
| Mantener activo el proyecto de pruebas | GitHub Actions | Cada 3 días |
| Errores y disponibilidad con alerta por email | Sentry | Continuo |

**[Hecho]** GitHub Free da 2.000 minutos por mes de Actions en repositorios privados. [Documentación de GitHub](https://docs.github.com/en/enterprise-server@3.17/get-started/learning-about-github/githubs-plans) · Estimado de uso: 400–700 minutos por mes **[Hipótesis]**.

## 9. Qué pasa si nadie lo atiende durante 3 meses

| Componente | Mantenimiento | Si nadie lo atiende 3 meses |
|---|---|---|
| Cloudflare Pages | Ninguno | Sigue sirviendo el sitio. |
| Supabase producción | Ninguno con uso diario | Funciona. Si nadie usa la app 7 días, se pausa [Hecho]; con clientes activos no ocurre. |
| Supabase pruebas | Tarea anti-pausa | Si la tarea falla, se pausa; se reactiva desde el panel (runbook). No afecta a clientes. |
| Backups | Automático | Siguen corriendo. Si fallan, Sentry avisa por email. |
| Dependencias | Dependabot | Se acumulan PR de actualizaciones mayores sin aplicar. Riesgo de seguridad bajo-medio. |
| Cobros manuales (etapa 1) | Cargar pagos | **Los planes vencen y los clientes pasan a Gratis** sin perder datos. Es el punto que más requiere atención. |
| Cobros automáticos (etapa 2) | Ninguno | Siguen cobrando y conciliando. |
| Emails | Ninguno | Funcionan mientras haya menos de 300 por día. |
| Términos de los servicios gratuitos | Revisar cada 6 meses | Riesgo de cambio sin aviso; runbook de revisión. |

## 10. Plan de pruebas

**Automáticas (CI):**
- Unidad: cálculo de totales, descuentos y redondeos; formato de montos; armado del mensaje de WhatsApp.
- Base (pgTAP): aislamiento entre organizaciones en cada tabla; administración solo para administradores; link público solo devuelve su presupuesto; el trigger de totales ignora totales enviados por el cliente; números correlativos sin repetir con creación simultánea; pago con id duplicado rechazado; límites del plan Gratis.
- Punta a punta (Playwright, celular y escritorio): registro, login, recuperación; crear presupuesto; ver y aceptar como cliente; aumento masivo; llegar al límite del plan Gratis; activación manual desde admin; vencimiento y pase a Gratis.

**Manuales antes de lanzar:**
- PDF en Android y iPhone, y abrirlo en WhatsApp.
- Link en WhatsApp de Android y iPhone.
- Restaurar un backup en el proyecto de pruebas.
- Corte de red durante la carga de un presupuesto.

## 11. Legal (estado)

Ver `01-auditoria.md` §4. Antes de cobrar:
- Borradores de términos, privacidad y cancelación (se redactan en el incremento del sitio público) **para revisar con un abogado**.
- Botones de arrepentimiento y de baja (D-11).
- Ley 25.326: los comercios cargan datos de sus clientes; la organización es responsable de esos datos y la plataforma actúa como encargada del tratamiento. Verificar con el abogado si corresponde inscribir la base.
- Facturación: factura C manual (D-10).

## 12. Riesgos

| Riesgo | Mitigación |
|---|---|
| Lógica en funciones SQL, menos conocida que el código de servidor | Funciones cortas, documentadas y con pruebas pgTAP. |
| Supabase cambia el plan gratuito | Postgres estándar: se migra a otro proveedor con un backup. |
| Generar el PDF en celulares viejos | Prueba manual en Android de gama baja; ítems limitados a 100 por presupuesto. |
| El repositorio es público hoy | D-15: pasarlo a privado antes del primer código. |
| Pagos manuales olvidados | Aviso por email al administrador 5 días antes de cada vencimiento. |
