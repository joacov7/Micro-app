# 03 — Diseño funcional y visual

Fecha: 2026-10-12
Fase: 3 (sin código)
App: **Presupuestador** (D-01). El desarrollo arranca en paralelo con la validación (D-13).

Referencia visual y de flujos: el prototipo `validacion/prototipo-presupuestador.html`.

---

## 1. Alcance del MVP

### Plataforma (desde el día 1)
- Registro, inicio de sesión, recuperación de contraseña.
- Organización (el negocio) creada al registrarse; el usuario queda como dueño.
- Planes y permisos: Gratis y Pro, con límites configurables desde administración.
- Activación manual del plan Pro desde el panel de administración (D-06).
- Panel de administración mínimo: organizaciones, plan de cada una, activar o suspender, historial de pagos cargados a mano.
- Sitio público: inicio, precios, términos, privacidad, cancelación, ayuda, botón de arrepentimiento y botón de baja (D-11).

### App Presupuestador (MVP)
- Mi negocio: nombre, rubro, teléfono, logo, validez y forma de pago por defecto.
- Mis precios: ítems con unidad, precio y categoría (Materiales, Mano de obra u otra).
- Aumento masivo por porcentaje, por categoría o para todos.
- Clientes: nombre, WhatsApp y notas. Se crean también al vuelo desde un presupuesto.
- Presupuestos: número correlativo por negocio, ítems con cantidades, descuento y totales automáticos.
- PDF con los datos del negocio, generado en el celular o la computadora.
- Link público para el cliente: ver, **aceptar** o rechazar.
- Envío por WhatsApp con mensaje ya escrito (D-05).
- Estados: borrador, enviado, visto, aceptado, rechazado, vencido.
- Avisos de seguimiento: "lo vio y no contestó hace más de 2 días".
- Panel de inicio: monto en juego, aceptados del mes, lista de presupuestos.

### Más adelante (y por qué)
| Función | Motivo para postergar |
|---|---|
| Suscripciones automáticas con Mercado Pago | D-06: manual hasta 10–20 clientes. |
| Varios usuarios por negocio (empleados) | El modelo de datos ya lo soporta; la pantalla para invitar se hace cuando un cliente lo pida. |
| Fotos en los ítems | Consume almacenamiento gratuito; no es necesario para vender. |
| Plantillas de presupuesto y textos guardados | Mejora de productividad; esperar feedback. |
| Convertir presupuesto en orden de trabajo | Es la segunda app; se hace cuando exista. |
| Facturación electrónica, stock | Fuera de alcance (`CLAUDE.md` §14). |

---

## 2. Mapa del sitio

```
Público
├── /                      Inicio (propuesta de valor, cómo funciona, precios, preguntas)
├── /precios               Planes Gratis y Pro
├── /ayuda                 Preguntas frecuentes y contacto por WhatsApp/email
├── /legal/terminos        Términos del servicio
├── /legal/privacidad      Política de privacidad
├── /legal/cancelacion     Política de cancelación y reembolsos
├── /arrepentimiento       Botón de arrepentimiento (formulario sin login)
├── /baja                  Botón de baja (formulario sin login)
├── /entrar · /registro · /recuperar
└── /p/:token              Presupuesto que ve el cliente final (sin login)

Panel del cliente (requiere login)
├── /app                   Inicio: avisos de seguimiento, montos y lista
├── /app/presupuestos/nuevo
├── /app/presupuestos/:id  Detalle, PDF, WhatsApp, estado
├── /app/precios           Mis precios y aumento masivo
├── /app/clientes
├── /app/negocio           Datos del negocio
└── /app/cuenta            Plan, pagos, contraseña, cancelar

Administración (solo administradores de la plataforma)
└── /admin                 Organizaciones, planes, activaciones, pagos, apps del catálogo
```

## 3. Flujos principales

**Alta y primer resultado (meta: menos de 5 minutos).**
Registro con email y contraseña → confirmar email → "¿Cómo se llama tu negocio?" y rubro → la lista de precios vacía ofrece cargar ítems de ejemplo del rubro (editables) → "Hacé tu primer presupuesto" → PDF y link listos.

**Presupuesto.**
Nuevo → cliente (elegir o crear) → agregar ítems de mis precios o escribir uno libre → cantidades y descuento → Generar → Detalle → Enviar por WhatsApp (abre WhatsApp con el mensaje y el link; el estado pasa a Enviado).

**Cliente final.**
Abre el link → se registra "visto" (solo la primera vez y solo si no es el dueño) → Aceptar o Rechazar (con motivo opcional) → el comercio ve el cambio en su panel.

**Seguimiento.**
Presupuesto visto hace más de 2 días sin respuesta → aparece en el aviso del inicio → "Escribirle" abre WhatsApp con un mensaje de seguimiento.

**Vencimiento.**
Al pasar la validez sin respuesta, el estado pasa a Vencido (tarea diaria). Se puede duplicar con precios actualizados.

**Aumento de precios.**
Mis precios → categoría y porcentaje → vista previa → Aplicar. Los presupuestos ya emitidos no cambian (guardan el precio del momento).

**Plan y pago (manual, D-06).**
El usuario llega al límite del plan Gratis → pantalla "Pasate a Pro" con el link de pago de Mercado Pago → el administrador verifica el pago en Mercado Pago → lo registra en /admin y activa el plan con fecha de vencimiento → aviso por email 5 días antes de vencer.

**Falta de pago.**
Vence el período → 7 días de gracia con aviso → pasa a Gratis. **Nunca se borran datos**: los presupuestos existentes se siguen viendo; solo se aplican los límites del plan Gratis a los nuevos.

**Baja.**
/app/cuenta → Cancelar → confirma → queda activo hasta el fin del período pagado. El botón de baja público permite pedirlo sin login (llega al administrador).

## 4. Pantallas clave

Las pantallas del panel siguen el prototipo: inicio con avisos y montos, formulario de presupuesto con totales visibles, documento tipo papel, vista del cliente con dos botones grandes, lista de precios con el aumento masivo arriba. Navegación inferior en celular (Presupuestos, Nuevo, Precios, Mi negocio); barra lateral en computadora.

Estados que toda pantalla debe resolver:
- **Vacío:** qué va a aparecer y un botón para crear el primero.
- **Cargando:** esqueleto de la lista, nunca pantalla en blanco.
- **Error:** qué pasó y qué hacer ("No hay conexión. Lo que cargaste está guardado en este equipo; reintentá cuando vuelva").

## 5. Identidad visual

**Nombre provisional:** Presupuestá. Antes de lanzar: verificar dominio `.com.ar` disponible y búsqueda en el registro de marcas del INPI.

**Dirección elegida:** la del prototipo, validada en las demos. Referencia al mundo del oficio: tinta azul de plano técnico y amarillo de señalización de obra, usado solo para la acción principal.

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `--brand` | #1F3A5F | #8DB3E8 | Marca, logo, botones secundarios |
| `--accent` | #F2B705 | #F2B705 | Acción principal (una por pantalla) |
| `--ink` | #16233A | #E7ECF3 | Texto |
| `--bg` / `--surface` | #F7F8FA / #FFFFFF | #121B2A / #1A2536 | Fondos |
| Estados | verde aceptado, azul enviado, ámbar visto, rojo rechazado | variantes claras | Etiquetas de estado |

**Tipografías (Google Fonts, licencia OFL):** Barlow Condensed para títulos y montos grandes; Barlow para texto. Números con cifras tabulares.

**Tono:** voseo rioplatense, directo, sin tecnicismos. Botones que dicen lo que hacen ("Enviar por WhatsApp", "Aplicar 10% a 8 ítems").

**Componentes:** shadcn/ui (MIT) sobre Tailwind, adaptados a estos tokens: botón, campo, selector, hoja inferior, toast, etiqueta de estado, tarjeta, tabla. Áreas táctiles de 44 px mínimo.

**Accesibilidad:** contraste AA, foco visible, funciona con letra agrandada del celular.

## 6. Monetización

Todos los precios son **[Hipótesis]** hasta terminar la validación. Se fijan en ARS al lanzar.

| | Gratis | Pro |
|---|---|---|
| Presupuestos por mes | 5 | Ilimitados |
| PDF y link para el cliente | Sí | Sí |
| Aceptación online | Sí | Sí |
| Saber cuándo lo vio el cliente y avisos de seguimiento | No | **Sí** |
| Aumento masivo de precios | No | Sí |
| Logo propio | No | Sí |
| Pie "Hecho con Presupuestá" | Sí | No |
| Precio | $0 | Equivalente a USD 8/mes (hipótesis) |

**Por qué pasar a Pro:** el límite de 5 presupuestos alcanza para probar, no para trabajar; y el seguimiento ("lo vio y no contestó") es lo que hace ganar trabajos.

- **Precio fundador:** 50% de por vida para los primeros 10.
- **Anual:** 12 meses al precio de 10.
- **Inflación:** revisión trimestral, aviso por email 30 días antes; los fundadores mantienen el 50% sobre el precio vigente.
- **Cupones:** código con porcentaje y vencimiento, cargado desde administración (se implementa con la automatización de cobros).

**Proyección simple** (precio USD 8, comisión Mercado Pago ~5% [hipótesis], todo en planes gratuitos):

| Clientes Pro | Ingreso bruto/mes | Comisión | Neto/mes | Costo de infraestructura |
|---|---|---|---|---|
| 10 (fundadores, 50%) | USD 40 | USD 2 | USD 38 | USD 0 |
| 50 | USD 400 | USD 20 | USD 380 | USD 0 (conviene Supabase Pro: USD 25) |
| 100 | USD 800 | USD 40 | USD 760 | USD 25–30 |

No incluye monotributo ni el tiempo de soporte.
