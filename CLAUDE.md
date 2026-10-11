# Plataforma de micro-apps SaaS

Este archivo contiene las reglas permanentes del proyecto. Aplican a todas las fases y a todas las sesiones de trabajo. Cada fase tiene su propio prompt en `prompts/`.

## 1. Qué estamos construyendo

Un negocio de software por suscripción formado por dos partes:

1. **La plataforma comercial**: sitio público con catálogo, registro, cobro de suscripciones, panel del cliente y panel de administración. Es común a todas las apps.
2. **Las micro-apps**: herramientas web para comercios y pequeñas empresas de Argentina. Cada una resuelve un problema concreto y frecuente. La primera se elige en la fase 2.

Objetivo económico: ingresos recurrentes con suscripciones mensuales, costos casi nulos y trabajo operativo que no crezca con la cantidad de clientes.

Mercado inicial: Argentina. Otros países quedan para más adelante.

## 2. Contexto personal (completar antes de empezar)

- Horas semanales disponibles: ___
- Nivel técnico: ___ (¿puedo leer y modificar código TypeScript sin ayuda?)
- Situación fiscal: ___ (monotributo categoría __ / otra)
- Rubros donde tengo contactos directos: ___
- Conocimiento de dominio o ventajas propias: ___
- Plazo objetivo para el primer cliente pago: ___
- Agent Core: ___ (explicar qué es o eliminar esta línea)

Si algún dato está vacío, preguntalo antes de tomar decisiones que dependan de él.

## 3. Prioridades (en este orden)

1. **Vender de verdad.** Validar con clientes reales antes de construir. Una idea interesante no es demanda comprobada.
2. **Seguridad e integridad de los datos.** Tiene prioridad sobre la velocidad.
3. **Mantenimiento casi automático.** El sistema tiene que funcionar sin intervención diaria y sin depender de Claude Code.
4. **Costo cero.** Ver sección 4.
5. **Simplicidad.** La solución más simple que cumpla los puntos anteriores.

## 4. Restricción de costo cero

- Usar solo servicios con plan gratuito **que permita uso comercial**. Verificar los términos actuales de cada plan, con link y fecha de consulta.
- Puntos conocidos que hay que verificar:
  - El plan Hobby de Vercel no permite uso comercial. Evaluar Netlify o Cloudflare Pages.
  - El plan gratuito de Supabase pausa los proyectos inactivos y no incluye backups automáticos. Hay que resolver los backups por cuenta propia, por ejemplo con GitHub Actions.
  - GitHub Actions tiene minutos gratuitos limitados en repositorios privados.
- No usar plantillas, librerías ni servicios pagos.
- Costos aceptables porque no son pagos por adelantado:
  - Comisiones de Mercado Pago, que se descuentan de cada venta.
  - Dominio propio: opcional y solo al lanzar. Hasta entonces se usa el subdominio gratuito del hosting.
- Para cada servicio, indicar sus límites gratuitos y **a partir de qué volumen** habría que pagar. Ningún gasto se incorpora sin mi aprobación.
- Diseñar para quedar cómodamente dentro de los límites gratuitos hasta tener ingresos que cubran el primer gasto.

## 5. Stack de referencia (a confirmar en la fase 4)

- Next.js con TypeScript.
- PostgreSQL con autenticación administrada (Supabase o una alternativa gratuita equivalente).
- Hosting gratuito que permita uso comercial.
- Mercado Pago para cobrar en pesos.
- Email transaccional con plan gratuito.
- Componentes de interfaz: shadcn/ui con Tailwind.
- GitHub para el código y la integración continua (CI).

Elegir un stack estándar y muy conocido, que cualquier desarrollador full-stack de Argentina pueda mantener. Nada exótico.

## 6. Arquitectura

- **Monolito modular**: un solo proyecto, con módulos de límites claros. Nada de microservicios, colas ni sistemas distribuidos sin una necesidad demostrada.
- **Multi-tenant por organización**: el cliente que paga y es dueño de los datos es la **organización** (el comercio), no el usuario. Una organización puede tener varios usuarios con roles (dueño, empleado).
- **Planes separados de permisos**: cada plan habilita un conjunto de funciones y límites. Las micro-apps consultan "¿esta organización puede hacer X?", nunca "¿qué plan tiene?".
- **Contrato de micro-app**: cada app es un módulo con su propio código, sus propias tablas y sus pruebas. Usa la plataforma solo a través de una interfaz definida: usuario, organización, permisos y registro de uso. Una app no accede a las tablas de otra.
- **Primera app como plantilla**: se estructura de forma que la segunda app se cree copiando su esqueleto.
- **Plataforma dimensionada para la primera app**: construir solo lo que esa app necesita, preparado para sumar la segunda. Nada de funciones de plataforma "por si acaso".

## 7. Pagos y suscripciones

- El acceso pago se otorga **solo** cuando el servidor confirma el pago con Mercado Pago. Nunca porque el navegador informe un pago exitoso.
- Validar la autenticidad de cada webhook.
- Operaciones idempotentes: un mismo aviso de pago procesado dos veces no duplica nada.
- Estados de suscripción explícitos: prueba, activa, pago pendiente, en gracia, suspendida, cancelada.
- Reglas transparentes ante falta de pago, por ejemplo días de gracia antes de suspender.
- Conciliación diaria automática contra Mercado Pago para detectar avisos perdidos.
- Historial completo de transacciones.
- Nunca almacenar datos de tarjetas.
- Política de actualización de precios por inflación, compatible con cómo Mercado Pago permite modificar suscripciones activas.
- Antes de implementar, verificar en la documentación oficial vigente las modalidades de cobro recurrente disponibles y sus requisitos.
- Para los primeros clientes fundadores se acepta la activación manual desde el panel de administración, con link de pago o transferencia. Indicar a partir de cuántos clientes conviene automatizar.

## 8. Seguridad

- Validación de todas las entradas en el servidor.
- Permisos verificados en el servidor y en la base de datos (Row Level Security o equivalente), no solo ocultando botones.
- Aislamiento total de datos entre organizaciones, con pruebas automáticas que lo verifiquen.
- Sesiones seguras y límite de solicitudes en login, registro, recuperación de contraseña y pagos.
- Registro de errores sin datos personales ni secretos.
- Ningún secreto, token ni contraseña en el repositorio. Usar variables de entorno y un `.env.example` sin valores reales.
- Backups automáticos y un procedimiento de restauración probado.
- No usar datos reales de clientes en desarrollo ni en pruebas.
- No afirmar que algo es seguro solo porque compila o pasan las pruebas básicas.

## 9. Mantenimiento autónomo

El sistema debe operar con mínima intervención y sin depender de Claude Code para el día a día.

- Solo servicios administrados, sin servidores propios que mantener.
- Todo lo comercial se gestiona desde el panel de administración, sin tocar código: precios, planes, cupones, productos, activar o suspender clientes.
- Cobros, renovaciones, reintentos, vencimiento de pruebas y suspensiones totalmente automáticos.
- CI en GitHub: lint, typecheck, pruebas y build obligatorios antes de publicar.
- Dependencias actualizadas automáticamente con Renovate o Dependabot. Las actualizaciones menores se aplican solas solo si pasan las pruebas.
- Monitoreo gratuito con alertas por email: errores de la aplicación, sitio caído y webhooks de pago fallidos.
- Tareas programadas gratuitas, por ejemplo con GitHub Actions: conciliación de pagos, backups y lo necesario para que los servicios gratuitos no se pausen.
- Runbooks en `docs/runbooks/`, escritos en lenguaje simple para alguien que no programa, para los incidentes más probables. Por ejemplo: "un cliente pagó y no tiene acceso", "el sitio no carga", "Mercado Pago no envía avisos", "restaurar un backup".
- Para cada componente, documentar qué mantenimiento requiere, con qué frecuencia y **qué pasa si nadie lo atiende durante 3 meses**.

## 10. Reutilización y licencias

- No construir desde cero lo que ya existe resuelto y probado.
- Solo reutilizar código con licencia MIT, Apache 2.0 o similar. Nada de AGPL, Elastic, BSL ni código propietario.
- Registrar cada componente de terceros y su licencia en `docs/licencias.md`.
- Los competidores sirven de referencia en funciones, precios y flujos. No copiar sus textos, marcas ni diseño visual.
- Verificar que cada recurso recomendado siga mantenido a la fecha.

## 11. Requisitos legales de Argentina (verificar, no asumir)

- Ley 25.326 de protección de datos personales.
- Normativa de defensa del consumidor para servicios contratados online, por ejemplo el botón de arrepentimiento y el botón de baja. Confirmar qué está vigente.
- Términos del servicio, política de privacidad y política de cancelación.
- Cómo facturarles a mis clientes según mi situación fiscal. Puede ser manual al principio.

Para cada punto, citar la fuente oficial y su fecha. Marcar lo que conviene revisar con un abogado o contador.

## 12. Reglas de trabajo

- Se trabaja por fases. No se avanza a la siguiente sin mi autorización explícita.
- Distinguir siempre **hechos verificados** (con fuente y fecha) de **hipótesis**.
- Cada fase se entrega como documento en `docs/`. Las decisiones se registran en `docs/decisiones.md` con fecha, alternativas consideradas y motivo.
- Cambios pequeños y verificables. Si aparece un error crítico, frenar e informar.
- No modificar nada fuera del alcance aprobado.
- Git: trabajar en una rama de trabajo. Se puede hacer commit y push de esa rama para no perder trabajo. Nunca push a `main`, merge ni despliegue a producción sin mi autorización.
- Si algo es ambiguo y cambia el resultado, preguntar en vez de suponer.

## 13. Definición de "terminado"

Una tarea está terminada solo si:

- Pasan lint, typecheck, build y pruebas, y se muestra el resultado.
- Hay pruebas que cubren lo nuevo, incluidos permisos y aislamiento de datos cuando corresponde.
- Funciona en celular.
- Está documentada: qué cambió, qué variables de entorno necesita y cómo revertirlo.
- Se informan los riesgos pendientes.

No declarar terminado nada que no se haya probado.

## 14. Fuera de alcance (por ahora)

- Apps móviles nativas.
- Marketplace o apps de terceros.
- Multi-idioma y cobro en otras monedas.
- Facturación electrónica, inventario avanzado y contabilidad dentro de las apps.
- IA con costo por uso.
- Publicidad como fuente de ingresos.
