# Fase 3 y 4: diseño funcional, visual y arquitectura técnica

Leé `CLAUDE.md`, `docs/02-oportunidades.md` y `docs/decisiones.md` antes de empezar.

App aprobada para el primer lanzamiento: **___**
Resultado de la validación comercial: **___** (resumen de entrevistas, compromisos obtenidos y aprendizajes)

**En esta fase no escribas código de la aplicación, no instales dependencias, no crees bases de datos ni despliegues nada.** Solo podés crear documentos y, si ayuda, un prototipo visual estático (HTML) fuera del código de la aplicación.

## 1. Construir o adaptar

Compará al menos 3 plantillas SaaS gratuitas y open source (licencia MIT o Apache) compatibles con el stack de `CLAUDE.md`. Por ejemplo: Next.js SaaS Starter (Vercel), Open SaaS (Wasp) u otras vigentes.

Para cada una: funciones incluidas, calidad del código, mantenimiento activo, licencia, compatibilidad con organizaciones y roles, y esfuerzo para reemplazar Stripe por Mercado Pago.

Recomendá partir de una, o construir desde cero si ninguna conviene, y justificá la decisión.

## 2. Alcance del MVP

Separá en tres listas:

- **Plataforma, desde el día 1:** solo lo que la primera app necesita para venderse y cobrarse.
- **App, MVP:** funciones mínimas que validó la investigación.
- **Más adelante:** todo lo demás, con el motivo para postergarlo.

## 3. Diseño funcional

- Mapa del sitio: páginas públicas, panel del cliente y panel de administración.
- Flujos principales, paso a paso: registro → prueba → uso → pago → renovación → cancelación, recuperación de contraseña, falta de pago y suspensión, y alta de una app nueva desde administración.
- Primer uso de la app (onboarding): cómo llega el cliente a su primer resultado útil en menos de 5 minutos.
- Pantallas clave con su contenido y acciones.

## 4. Diseño visual

- 2 o 3 direcciones de identidad visual: nombre de marca sugerido, paleta, tipografías gratuitas y tono de los textos.
- Sistema de diseño basado en shadcn/ui: componentes base, estados (vacío, cargando, error) y criterios para celular.
- Estética SaaS profesional, rápida y confiable. Sin animaciones innecesarias ni decoración que afecte la velocidad.
- Opcional: prototipo HTML estático de la página de inicio, la ficha de la app y el panel del cliente.

## 5. Arquitectura técnica

- Diagrama de módulos: sitio público, usuarios y organizaciones, catálogo, suscripciones, permisos, apps y administración.
- Contrato de micro-app: qué interfaz de la plataforma usa una app y qué no puede hacer.
- Modelo de datos: tablas, relaciones y políticas de seguridad por organización.
- Roles y permisos: plataforma (administrador) y organización (dueño, empleado).
- Integración con Mercado Pago: modalidad elegida, flujo de cobro, webhooks, idempotencia, conciliación diaria, estados, reintentos, cancelación, actualización de precios por inflación y activación manual para fundadores.
- Entornos: local, pruebas y producción, todos gratuitos.
- Automatizaciones de mantenimiento: CI, actualización de dependencias, monitoreo, alertas, backups, conciliación y prevención de pausas por inactividad.
- Tabla de "qué pasa si nadie lo atiende durante 3 meses", por componente.

## 6. Monetización de la app

- Planes: gratis limitado y/o prueba con duración definida, plan básico y plan superior.
- Qué incluye cada plan y sus límites exactos.
- Qué límite empuja a pasar al plan pago y por qué.
- Precio en ARS, precio fundador, descuento anual y política de actualización por inflación.
- Proyección simple con 10, 50 y 100 clientes: ingresos, comisiones de Mercado Pago y en qué punto se superan los planes gratuitos.

## 7. Plan de pruebas

Pruebas automáticas para: registro e inicio de sesión, recuperación de contraseña, aislamiento de datos entre organizaciones, permisos de administración, contratación y confirmación de pago (con el entorno de pruebas de Mercado Pago), webhooks duplicados o falsos, renovación, cancelación, suspensión por falta de pago, cálculos comerciales de la app, generación de documentos y uso en celular.

Indicá qué se prueba automáticamente y qué manualmente.

## 8. Plan de implementación

Dividí el desarrollo en incrementos pequeños. Para cada uno: objetivo, qué incluye, cómo se verifica y en qué orden va. El primer incremento debe ser el esqueleto con CI funcionando.

## 9. Legal

Estado verificado de los requisitos de la sección 11 de `CLAUDE.md`, con fuentes, y borradores de términos, privacidad y política de cancelación marcados como "a revisar".

## Entregables

- `docs/03-diseno.md`
- `docs/04-arquitectura.md`
- `docs/05-plan-de-implementacion.md`
- Actualización de `docs/decisiones.md`

Al terminar, dame un resumen corto en el chat con las decisiones que necesito aprobar. **Fase 5: esperá mi autorización explícita antes de implementar.**
