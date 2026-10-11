# 01 — Auditoría y verificación de costo cero

Fecha: 2026-10-11
Fase: 1 (sin código)

Convención: **[Hecho]** = verificado con fuente y fecha · **[Hipótesis]** = supuesto a validar.

---

## 1. Estado del repositorio

| Aspecto | Estado |
|---|---|
| Código | No hay. Repositorio nuevo. |
| Historial Git | Un commit en `master` con `CLAUDE.md` y `prompts/`. |
| Dependencias, pruebas, CI | No existen. |
| Documentación | `CLAUDE.md` (reglas permanentes) y prompts por fase. |
| Secretos expuestos | Ninguno. |
| Relación con otros proyectos | Ninguna detectada. "Agent Core" sigue sin definir en `CLAUDE.md`. |

**Conclusión:** se trata como implementación nueva. No hay nada que reutilizar ni que proteger.

## 2. Contexto personal registrado

- 10 a 20 horas semanales.
- **No programa.** Esto refuerza dos requisitos: todo lo comercial tiene que manejarse desde paneles, y las tareas de mantenimiento tienen que estar documentadas en runbooks o poder hacerlas un freelancer.
- Monotributo (falta la categoría).
- Contactos en comercio minorista, gastronomía, servicios/oficios y salud/estética.

**Implicancia:** como los contactos cubren los cuatro rubros, la facilidad de venta depende más del tipo de problema que del rubro.

---

## 3. Verificación de los servicios gratuitos

Todas las consultas se hicieron el 2026-10-11.

### 3.1 Hosting

| Servicio | Plan gratuito | ¿Uso comercial? | Límites relevantes | Se paga a partir de | Fuente |
|---|---|---|---|---|---|
| **Vercel Hobby** | Sí | **No.** [Hecho] La documentación del plan Hobby lo restringe a uso personal no comercial, y la guía de uso justo exige Pro para uso comercial. En julio de 2026 la guía se reescribió y la restricción no aparece en el texto nuevo, pero la página del plan Hobby la mantiene. | — | Desde el primer cliente (Pro: USD 20/mes) | [Plan Hobby](https://vercel.com/docs/plans/hobby), [Uso justo](https://vercel.com/docs/limits/fair-use-guidelines) |
| **Netlify Free** | Sí | [Hipótesis] Sitios de terceros dicen que sí. La página oficial de precios no lo aclara. | [Hecho] 300 créditos. Cada deploy a producción consume 15 créditos, cada GB de transferencia 20, y cada 10.000 solicitudes 2. Al agotarse, el sitio se pausa. | Personal: USD 9/mes con 1.000 créditos | [Precios Netlify](https://www.netlify.com/pricing/), [netli.fyi](https://netli.fyi/blog/netlify-free-plan-limits-2026) |
| **Cloudflare Workers/Pages** | Sí | [Hipótesis] Fuentes de terceros dicen que no hay restricción comercial. Hay que confirmarlo en los términos de Cloudflare. | [Hecho, fuentes de terceros] 100.000 solicitudes por día y 10 ms de CPU por solicitud en Workers, 500 builds por mes. Next.js se despliega con el adaptador OpenNext. | Workers Paid: unos USD 5/mes | [flaviocopes (sept. 2026)](https://flaviocopes.com/hosting-free-tiers.md), [eastondev](https://eastondev.com/blog/es/posts/dev/20260526-cloudflare-free-limits/) |

**Análisis:**
- Vercel queda descartado por la restricción comercial.
- En Netlify, 300 créditos alcanzan para unos 20 deploys por mes sin ningún tráfico. Con actualizaciones automáticas de dependencias, eso se agota rápido y el sitio queda pausado. Es un riesgo directo para la operación sin intervención.
- **Recomendación provisoria: Cloudflare (Workers con OpenNext).** Tiene los límites más holgados para una app B2B con pocos usuarios. Pendiente: confirmar los términos comerciales y que Next.js funcione bien con OpenNext. Se decide en la fase 4.

### 3.2 Base de datos y autenticación

| Servicio | Plan gratuito | Límites | Pausa | Backups | Pago | Fuente |
|---|---|---|---|---|---|---|
| **Supabase Free** | Sí | [Hecho] Base de datos de 500 MB, 50.000 usuarios activos por mes, 5 GB de transferencia, 1 GB de archivos, 2 proyectos activos. | [Hecho] Se pausa tras 1 semana sin actividad. | [Hecho] **No incluidos.** | Pro desde USD 25/mes | [supabase.com/pricing](https://supabase.com/pricing) |

**Análisis:**
- Con 2 proyectos alcanza para tener pruebas y producción separados.
- 500 MB alcanzan para cientos de comercios con presupuestos de texto. [Hipótesis] Los PDF no se guardan: se generan cuando se piden.
- **Pausa:** en producción, el uso diario la evita. En el proyecto de pruebas hace falta una tarea programada que lo mantenga activo.
- **Backups:** hay que resolverlos por cuenta propia. Opción: una exportación diaria de la base con GitHub Actions, guardada en almacenamiento gratuito (Cloudflare R2 tiene 10 GB gratis; a verificar). La restauración se prueba antes de lanzar.

### 3.3 Email transaccional

| Servicio | Plan gratuito | Límites | Observación | Fuente |
|---|---|---|---|---|
| **Brevo** | Sí | [Hecho] 300 emails por día, sin acumular. | Los emails gratuitos llevan la marca "Sent with Brevo". | [Ayuda Brevo](https://help.brevo.com/hc/en-us/articles/208580669) |
| **Resend** | Sí | [Hecho, fuentes de terceros] 3.000 emails por mes y 100 por día, 1 dominio. | Requiere dominio propio verificado para enviar a terceros. [Hipótesis] | [userjot](https://userjot.com/blog/resend-pricing-in-2025), [agentdeals](https://agentdeals.dev/brevo-vs-resend) |

**Análisis:** el volumen previsto es bajo: registro, recuperación de contraseña, avisos de pago y alertas. Cualquiera de los dos alcanza para más de 100 clientes. Resend probablemente necesite dominio propio, así que hasta comprarlo conviene Brevo. Se decide en la fase 4.

### 3.4 Monitoreo

| Servicio | Plan gratuito | Límites | Uso comercial | Fuente |
|---|---|---|---|---|
| **Sentry Developer** | Sí | [Hecho] 5.000 errores por mes, 1 usuario, 1 monitor de disponibilidad y 1 monitor de tareas programadas. | [Hipótesis] Permitido. Hay que confirmarlo en los términos. | [costbench](https://costbench.com/software/developer-tools/sentry/free-plan/) |
| **UptimeRobot Free** | Sí | 50 monitores | **Dudoso.** [Hecho] Desde fines de 2024 el plan gratuito se restringió a uso no comercial. Un competidor afirma que en mayo de 2026 se volvió a permitir, pero no se pudo confirmar. | [notifier.so](https://notifier.so/guides/uptimerobot-alternative/), [host-tracker](https://www.host-tracker.com/blog/uptimerobot-alternative) |

**Recomendación:** usar **solo Sentry**. Cubre errores, disponibilidad y tareas programadas con un servicio menos. Una tarea de GitHub Actions puede servir de segundo control de disponibilidad.

### 3.5 GitHub

- [Hecho] GitHub Actions da minutos gratuitos limitados en repositorios privados. Hay que confirmar la cifra vigente; históricamente fueron 2.000 minutos por mes.
- [Hipótesis] CI, backups, conciliación y tareas para evitar pausas usarían menos de 600 minutos por mes. Se calcula en la fase 4.

### 3.6 Mercado Pago

| Tema | Resultado | Fuente |
|---|---|---|
| Cobro recurrente | [Hecho] Existen las **Suscripciones** (`/preapproval`), con plan asociado (`preapproval_plan`) o sin plan. La suscripción se puede crear con pago autorizado o pendiente. | [Suscripciones con pago autorizado](https://www.mercadopago.com.ar/developers/es/docs/subscriptions/integration-configuration/subscription-no-associated-plan/authorized-payments), [Referencia](https://www.mercadopago.com.ar/developers/en/reference/online-payments/subscriptions/overview) |
| Cambiar el monto de una suscripción activa | [Hecho] Se puede, enviando el nuevo valor en `auto_recurring.transaction_amount`. También se puede pausar, cancelar y reactivar. **[Hipótesis]** No está documentado si el cambio aplica al próximo cobro ni si se avisa al suscriptor. Hay que probarlo en el entorno de pruebas. | [Gestión de suscripciones](https://www.mercadopago.com.ar/developers/es/docs/subscriptions/subscription-management), [PUT preapproval](https://www.mercadopago.com.ar/developers/en/reference/subscriptions/_preapproval_id/put) |
| Comisiones | [Hecho, fuentes no oficiales y contradictorias] Para cobros online, la comisión baja cuanto más tarda la acreditación: alrededor de 6,3–6,5% con acreditación inmediata y alrededor de 3% a 30 días, más IVA. **No se verificó la tarifa específica de Suscripciones.** | [iProfesional (jul. 2026)](https://www.iprofesional.com/tecnologia/386153-mercado-pago-que-debes-saber-sobre-comisiones-plazos-y-montos), [mercado.com.ar](https://mercado.com.ar/protagonistas/mercado-pago-amplia-las-opciones-de-cobro-para-los-vendedores-online) |
| Requisitos | [Hipótesis] Cuenta de Mercado Pago del vendedor con datos fiscales, credenciales de prueba y de producción, y URL pública para webhooks. Se confirma en la fase 4. | — |

**Implicancia:** para los primeros clientes fundadores alcanza con un **link de pago** y activación manual desde el panel. Las suscripciones automáticas se implementan cuando el volumen lo justifique (ver `docs/decisiones.md`).

### 3.7 WhatsApp

- [Hecho, fuentes de terceros] La API oficial de WhatsApp Business cobra por mensaje. Para Argentina se informan entre USD 0,0075 y 0,026 por mensaje de utilidad y entre 0,045 y 0,062 por mensaje de marketing. Desde el 1/10/2026 también se cobrarían las respuestas dentro de la ventana de 24 horas. [Blog Mercately](https://blog.mercately.com/?p=30248), [Zernio](https://zernio.com/blog/whatsapp-business-api-pricing), [Meta](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing)
- **Esto viola la regla de costo cero.** Decisión de diseño: usar solo **enlaces "click to chat" (wa.me)**, que son gratuitos. El comercio toca un botón y WhatsApp abre el mensaje ya escrito. El envío no es automático, pero cuesta cero y no requiere aprobación de Meta.

### 3.8 Costos que no son pagos por adelantado

| Concepto | Cuándo | Monto |
|---|---|---|
| Comisión de Mercado Pago | En cada cobro | ~3–6,5% + IVA según el plazo de acreditación [a verificar] |
| Dominio `.com.ar` | Opcional, al lanzar | Arancel anual de NIC Argentina [a verificar] |
| Monotributo | Ya existente | Según categoría |

### 3.9 Primeros límites que se alcanzarían

| Servicio | Primer límite | Con cuántos clientes (estimado) |
|---|---|---|
| Supabase | 500 MB de base de datos | [Hipótesis] Más de 500 comercios si no se guardan archivos |
| Cloudflare | 100.000 solicitudes por día | [Hipótesis] Más de 1.000 comercios activos |
| Brevo | 300 emails por día | [Hipótesis] Más de 300 comercios, salvo envíos masivos |
| Sentry | 5.000 errores por mes | Depende de la calidad, no de los clientes |
| GitHub Actions | Minutos mensuales | Depende de la frecuencia de cambios |

**Conclusión:** el stack gratuito alcanza con amplitud para validar el producto y llegar a 100 clientes. La primera inversión probable será **Supabase Pro (USD 25/mes)**, por los backups administrados y para eliminar la pausa, cuando haya ingresos que la cubran.

---

## 4. Requisitos legales detectados (se profundizan en la fase 4)

| Norma | Qué exige | Aplicación | Fuente |
|---|---|---|---|
| Res. SC 424/2020: botón de arrepentimiento | Un enlace visible en los sitios que venden productos o servicios online para revocar la compra. | [Hipótesis] Aplica si el cliente es consumidor final. Un monotributista que compra para su negocio puede quedar comprendido. **Consultar con un abogado.** Implementarlo igual cuesta poco. | [argentina.gob.ar](https://www.argentina.gob.ar/node/220493) |
| Res. SC 316/2018: botón de baja | Un enlace destacado en la página de inicio para dar de baja el servicio, sin registro previo ni otros trámites. Se amplió por disposiciones posteriores (por ejemplo 745/2020 y 357/2021). | [Hipótesis] La lista de rubros no menciona expresamente el software por suscripción. Se recomienda implementarlo igual por buena práctica y menor riesgo. | [abogados.com.ar](https://abogados.com.ar/disposicion-n3572021-de-la-direccion-nacional-de-defensa-del-consumidor-y-arbitraje-del-consumo-nuevos-rubros-deberan-incluir-el-boton-de-baja-en-sus-paginas-web/28412), [Beccar Varela](https://beccarvarela.com/novedades/disposicion-n357-2021-de-la-direccion-nacional-de-defensa-del-consumidor-y-arbitraje-del-consumo/) |
| Res. SC 271/2020 | Publicar los contratos de adhesión en la página principal. | [Hipótesis] Aplica a los términos del servicio. | [mdzol](https://www.mdzol.com/dinero/2020/9/8/ya-rige-la-obligacion-de-publicar-los-contratos-el-boton-de-baja-103767.html) |
| Ley 25.326 | Protección de datos personales. Los comercios cargan datos de sus propios clientes. | Requiere política de privacidad y medidas de seguridad. Verificar si corresponde registrar bases de datos. | A verificar en la fase 4 |
| Facturación (monotributo) | Factura C por cada cobro. | Manual con hasta unos 20 clientes. Después conviene automatizarla. | A verificar con un contador |

---

## 5. Riesgos detectados

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Un servicio gratuito cambia sus condiciones | Alto | Usar servicios estándar y reemplazables. Revisar los términos cada 6 meses (runbook). |
| Supabase sin backups en el plan gratuito | Alto | Backup diario propio y restauración probada antes de lanzar. |
| Depender de una persona que no programa | Alto | Paneles, runbooks, stack estándar y un presupuesto de contingencia para un freelancer cuando haya ingresos. |
| Monto de la suscripción y la inflación | Medio | Probar el cambio de monto en el entorno de pruebas. Política de precios publicada. |
| Comisión de Mercado Pago sobre precios bajos | Medio | Incorporarla al precio. Ofrecer cobro anual o a 30 días. |
| Normativa de consumo | Medio | Implementar ambos botones y consultar con un abogado antes de cobrar. |

## 6. Recursos sin verificar (a completar en la fase 4)

- Términos comerciales de Cloudflare y de Sentry.
- Tarifa específica de Mercado Pago para Suscripciones.
- Minutos vigentes de GitHub Actions en repositorios privados.
- Arancel de NIC Argentina.
- Comportamiento del cambio de monto en una suscripción activa.
