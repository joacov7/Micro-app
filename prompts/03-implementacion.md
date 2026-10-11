# Fase 6: implementación incremental

Leé `CLAUDE.md`, `docs/04-arquitectura.md`, `docs/05-plan-de-implementacion.md` y `docs/decisiones.md` antes de empezar.

Incremento a implementar ahora: **___** (número y nombre según el plan)

## Reglas para este incremento

- Implementá **solo** este incremento. Si descubrís que falta algo de otro, anotalo y preguntá.
- Rama de trabajo: `___`. Podés hacer commit y push de esta rama. No hagas push a `main`, merge ni despliegue a producción.
- Antes de escribir código, decime en pocas líneas qué vas a hacer y qué archivos vas a tocar.
- Cambios pequeños, con commits frecuentes y mensajes claros.
- Si aparece un error crítico o una decisión no prevista en la arquitectura, frená y preguntá.
- Cumplí la "Definición de terminado" de `CLAUDE.md`.
- Si agregás una dependencia, verificá su licencia y registrala en `docs/licencias.md`.
- Si el incremento crea algo que requiere mantenimiento, actualizá el runbook correspondiente en `docs/runbooks/`.

## Al terminar el incremento, entregá

1. Resumen de los cambios.
2. Archivos creados y modificados.
3. Resultado de lint, typecheck, build y pruebas (salida real, no un resumen optimista).
4. Revisión de seguridad del incremento: permisos, aislamiento, validación y secretos.
5. Variables de entorno nuevas, también agregadas a `.env.example` sin valores reales.
6. Riesgos pendientes.
7. Cómo revertir este incremento.
8. Actualización de `docs/decisiones.md` si se tomó alguna decisión.

Después esperá mi aprobación antes del siguiente incremento.

---

# Fase 7: revisión antes de producción

Usá este bloque cuando todos los incrementos del MVP estén terminados.

No despliegues nada. Entregá en `docs/06-revision-produccion.md`:

1. Resumen de lo construido frente al alcance aprobado.
2. Resultado completo de build, typecheck y pruebas.
3. Revisión de seguridad completa: permisos, aislamiento entre organizaciones, webhooks, sesiones, límites de solicitudes, secretos y dependencias con vulnerabilidades conocidas.
4. Prueba de punta a punta del ciclo de pago en el entorno de pruebas de Mercado Pago: alta, pago, renovación, rechazo, suspensión y cancelación.
5. Prueba de restauración de un backup.
6. Verificación de que cada servicio usado está en plan gratuito con uso comercial permitido y de cuánto margen queda.
7. Monitoreo y alertas funcionando (provocar un error de prueba y confirmar que llega la alerta).
8. Lista de variables de entorno de producción.
9. Estado de los requisitos legales.
10. Runbooks completos.
11. Plan de lanzamiento gradual: primero clientes fundadores, con criterios para abrir al público.
12. Procedimiento de reversión si algo sale mal.
13. Riesgos pendientes, ordenados por gravedad.

Esperá mi autorización explícita antes de cualquier despliegue a producción.
