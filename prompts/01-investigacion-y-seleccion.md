# Fase 1 y 2: auditoría, investigación y selección de la primera app

Leé `CLAUDE.md` antes de empezar. Sus reglas aplican a esta fase.

**En esta fase no escribas código, no instales dependencias, no crees bases de datos ni despliegues nada.** Solo podés crear los documentos indicados abajo.

## 1. Auditoría breve

Inspeccioná el repositorio: estructura, archivos, estado de Git y documentación. Si está vacío o casi vacío, decilo en pocas líneas y enfocate en las decisiones iniciales que hacen falta.

Verificá también que la sección "Contexto personal" de `CLAUDE.md` esté completa. Si falta algo que afecte la selección, preguntámelo antes de seguir.

## 2. Verificación del costo cero

Antes de evaluar ideas, verificá en las fuentes oficiales vigentes:

- Planes gratuitos de hosting (Netlify, Cloudflare Pages y Vercel): si permiten uso comercial y qué límites tienen.
- Plan gratuito de Supabase (o alternativa): límites, pausa por inactividad y backups.
- Email transaccional gratuito: al menos 2 opciones con sus límites.
- Monitoreo de errores y de disponibilidad gratuitos.
- Mercado Pago: modalidades de cobro recurrente disponibles en Argentina, comisiones vigentes, requisitos para usarlas y si se puede modificar el monto de una suscripción activa.

Entregá una tabla por servicio: plan gratuito, ¿permite uso comercial?, límites, a partir de qué volumen hay que pagar, fuente y fecha.

## 3. Diez oportunidades de micro-SaaS

Investigá y proponé 10 ideas que cumplan:

- Clientes: comercios y pequeñas empresas de Argentina.
- Problema frecuente, concreto y fácil de demostrar.
- Desarrollo posible con el stack de `CLAUDE.md` y dentro de los planes gratuitos.
- Sin IA con costo por uso.
- Potencial de suscripción mensual y de venderse a muchos clientes.
- Soporte y mantenimiento bajos.
- Se pueden conseguir los primeros clientes por venta directa.

Incluí una herramienta de presupuestos y pedidos para comercios como una de las 10. Evaluala **con los mismos criterios que las demás**, sin trato preferencial.

Para cada idea:

1. Nombre provisional.
2. Cliente objetivo (rubro y tamaño).
3. Problema que resuelve y cómo lo resuelven hoy.
4. Solución propuesta.
5. Competidores y alternativas concretas en Argentina, con link y precio.
6. Quejas frecuentes de usuarios de esas alternativas, si encontrás reseñas.
7. Diferenciación.
8. Funciones mínimas del MVP.
9. Precio mensual hipotético en ARS.
10. Complejidad técnica (1 a 5).
11. ¿Entra en los planes gratuitos con 100 clientes? ¿Qué límite se alcanza primero?
12. Carga de mantenimiento y soporte esperada.
13. Dificultad para conseguir clientes.
14. Riesgos principales.
15. Cómo conseguir los primeros 10 clientes.

Marcá cada afirmación como **[Hecho]** (con fuente y fecha) o **[Hipótesis]**.

## 4. Matriz comparativa

Puntuá cada idea de 1 a 5 en cada criterio, con estos pesos:

| Criterio | Peso |
|---|---|
| Demanda potencial | 25% |
| Facilidad de venta (incluye mis contactos de `CLAUDE.md`) | 25% |
| Facilidad técnica | 15% |
| Velocidad de lanzamiento | 15% |
| Rentabilidad dentro de los planes gratuitos | 10% |
| Bajo mantenimiento y soporte | 10% |

Justificá cada puntaje en una línea. Si creés que los pesos deberían ser otros, proponelo, pero mostrá primero el resultado con estos.

## 5. Selección

- Elegí las 3 mejores y explicá por qué.
- Recomendá **una** para el primer lanzamiento.
- Explicá por qué no elegiste las otras dos.

## 6. Plan de validación de la app recomendada

Antes de programar, ¿cómo comprobamos que alguien pagaría?

- Segmento inicial y perfil del cliente ideal.
- Landing de validación con lista de espera o preventa a precio fundador, hecha con herramientas gratuitas.
- Mensaje de primer contacto por WhatsApp y email.
- Guion de entrevista para descubrir el problema (sin vender) y guion de demostración.
- Oferta para clientes fundadores.
- Indicadores y **umbrales numéricos** para decidir. Proponé valores; como referencia, en 6 semanas: 30 contactos, 10 entrevistas o demos y 3 compromisos de pago. Si no se alcanzan, se ajusta o se cambia de idea.
- Costo de adquisición estimado, en tiempo y dinero.

## 7. Decisiones que necesito aprobar

Listá cada decisión pendiente, con tu recomendación y la alternativa.

## Entregables

- `docs/01-auditoria.md`: auditoría y verificación de costo cero.
- `docs/02-oportunidades.md`: las 10 ideas, la matriz, la selección y el plan de validación.
- `docs/decisiones.md`: decisiones propuestas, marcadas como pendientes de aprobación.

Al terminar, dame en el chat un resumen de no más de 15 líneas con la recomendación y las decisiones que necesito tomar. Después esperá mi aprobación.
