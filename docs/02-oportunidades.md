# 02 — Oportunidades de micro-SaaS, comparación y selección

Fecha: 2026-10-11
Fase: 2 (sin código)

Convención: **[Hecho]** = verificado con fuente y fecha · **[Hipótesis]** = supuesto a validar.

> **Sobre los precios.** No se encontraron precios publicados en ARS de los competidores locales: la mayoría no publica tarifas o solo lo hace para otros países. Por eso todos los precios de este documento son **[Hipótesis]** y se expresan en su **equivalente aproximado en USD**. Se convierten a ARS al tipo de cambio del momento de la validación, y se ajustan con lo que digan los clientes en las entrevistas.

> **Limitación de la investigación.** Las búsquedas web no reemplazan revisar Google Play, la App Store y los grupos de comerciantes. La primera tarea de la validación es completar la lista de competidores de las 3 ideas finalistas.

---

## 1. Las 10 ideas

### Idea 1 — Presupuestador para oficios y comercios
1. **Nombre provisional:** Presupuestá (presupuestos profesionales en 2 minutos).
2. **Cliente:** oficios e instaladores (electricistas, gasistas, plomeros, aire acondicionado, durlock, aberturas), y comercios que cotizan a pedido (corralones, imprentas, carpinterías). De 1 a 10 personas.
3. **Problema:** arman presupuestos en Word o Excel, en papel o en un mensaje de WhatsApp. Pierden tiempo, se ven poco profesionales, no saben qué presupuestos siguen abiertos y los precios quedan desactualizados por los aumentos. [Hipótesis]
4. **Solución:** catálogo propio de ítems y precios, presupuesto en el celular, PDF con logo, enlace para que el cliente lo vea y lo **acepte online**, envío por WhatsApp (wa.me), estados (enviado, visto, aceptado, rechazado), recordatorio de seguimiento y **actualización masiva de precios por porcentaje**.
5. **Competidores:** [Hecho] Yo Facturo (generador de PDF gratuito y un sistema para oficios con presupuesto, factura y aprobación por WhatsApp), Servidos.ar (generador gratuito en ARS y USD), Orçafy (app con compras dentro de la app) y Factura Creador. También Word, Excel y los talonarios. [Yo Facturo](https://yo-facturo.com/electricistas/), [Generador Yo Facturo](https://yo-facturo.com/herramientas/generador-presupuesto-pdf/), [Servidos.ar](https://servidos.ar/generador-presupuestos), [Orçafy](https://apps.apple.com/ar/app/or%C3%A7afy-presupuestos-en-pdf/id6749516385)
6. **Quejas de usuarios:** no se encontraron reseñas. A relevar en las entrevistas.
7. **Diferenciación:** los generadores gratuitos solo hacen el PDF. El valor pago está en el **seguimiento** (cuándo lo vio el cliente, si lo aceptó, recordatorios para no perder ventas) y en el **catálogo con precios actualizables**. Frente a Yo Facturo, que es un sistema completo con facturación, la diferencia es la simplicidad y el foco. [Hipótesis]
8. **MVP:** configuración del negocio (logo, datos), clientes, catálogo de ítems, presupuesto con cantidades, descuentos y totales, PDF, enlace público con botón "Aceptar", envío por wa.me, estados, historial y aumento masivo por porcentaje.
9. **Precio:** [Hipótesis] gratis hasta 5 presupuestos por mes; plan pago de USD 6–10/mes.
10. **Complejidad técnica:** 2/5.
11. **¿Entra en el plan gratuito con 100 clientes?** Sí. Los PDF se generan al pedirlos, no se guardan. El primer límite sería la base de datos, muy lejos.
12. **Mantenimiento y soporte:** bajo. Sin integraciones externas salvo Mercado Pago.
13. **Dificultad de venta:** media-baja. El beneficio se demuestra en 2 minutos.
14. **Riesgos:** competencia gratuita (el cliente puede pensar "para el PDF ya tengo una gratis"); disposición a pagar baja en oficios. [Hipótesis]
15. **Primeros 10 clientes:** contactos de oficios y comercios. Demo en persona armando un presupuesto real del propio cliente. Oferta fundador.

### Idea 2 — Agenda de turnos online con recordatorios
1. **Nombre:** Turnero.
2. **Cliente:** peluquerías, barberías, centros de estética, consultorios y profesionales independientes.
3. **Problema:** coordinan turnos por WhatsApp, a toda hora, y los clientes faltan sin avisar.
4. **Solución:** página de reservas, agenda por profesional, confirmación y recordatorio.
5. **Competidores:** [Hecho] AgendaPro (levantó USD 35 millones y se expande en Argentina; prueba gratis de 7 días), Yo Facturo (agenda en el plan Básico), Booksy (USD 29,99/mes), Calendly y Google Calendar. [AgendaPro AR](https://finder.techleap.nl/news/feed/agendapro-raises-35m-expands-in-argentina), [Yo Facturo](https://yo-facturo.com/blog/software-turnos-peluqueria-consultorio/), [Zenoti](https://www.zenoti.com/es/thecheckin/best-barber-shop-appointment-software)
6. **Quejas:** a relevar.
7. **Diferenciación:** difícil. Los competidores tienen mucho capital y producto maduro.
8. **MVP:** servicios con duración, profesionales, horarios, reservas, cancelaciones y recordatorios.
9. **Precio:** [Hipótesis] USD 10–20/mes.
10. **Complejidad:** 3/5 (disponibilidad, superposición de turnos, cambios de horario).
11. **Plan gratuito:** sí, pero los recordatorios automáticos por WhatsApp **cuestan por mensaje** (ver `01-auditoria.md` §3.7). Solo email o wa.me manual.
12. **Mantenimiento:** medio. Los errores de agenda generan reclamos inmediatos.
13. **Venta:** media-alta. La demanda existe, pero el cliente ya tiene opciones conocidas.
14. **Riesgos:** competidores fuertes; el recordatorio por WhatsApp, que es lo que más se valora, rompe el costo cero.
15. **Primeros 10:** contactos de estética. Difícil competir sin el recordatorio automático.

### Idea 3 — Catálogo online con pedidos por WhatsApp
1. **Nombre:** Pedilo.
2. **Cliente:** comercios minoristas y gastronomía con delivery o take away.
3. **Problema:** responden "¿qué tenés y cuánto sale?" uno por uno.
4. **Solución:** catálogo web con carrito que arma el pedido en un mensaje de WhatsApp.
5. **Competidores:** [Hecho] Pedix (más de 3.000 tiendas, sin comisión por venta), Tiendanube (plan Inicial **gratis** en Argentina), Meniu y el catálogo gratuito de WhatsApp Business. [Pedix](https://infonegocios.info/default/vender-por-whatsapp-es-mas-facil-pedix-acelera-el-proceso-catalogo-virtual-y-ventas-centralizadas), [Tiendanube](https://ayuda.tiendanube.com/es_ES/sobre-tiendanube/que-costo-tiene-tiendanube)
6. **Quejas:** a relevar.
7. **Diferenciación:** baja frente a opciones gratuitas y consolidadas.
8. **MVP:** productos, categorías, carrito, mensaje de WhatsApp y horarios.
9. **Precio:** [Hipótesis] USD 5–10/mes.
10. **Complejidad:** 2/5.
11. **Plan gratuito:** las imágenes de productos consumen almacenamiento y transferencia. Es el primer límite.
12. **Mantenimiento:** bajo-medio (imágenes, carga de productos).
13. **Venta:** alta dificultad por competencia gratuita.
14. **Riesgos:** Tiendanube gratis.
15. **Primeros 10:** solo con un nicho muy específico.

### Idea 4 — Menú digital QR para gastronomía
1. **Nombre:** MenúQR.
2. **Cliente:** bares, cafeterías y restaurantes.
3. **Problema:** imprimir cartas cada vez que cambian los precios.
4. **Solución:** menú web con QR, editable desde el celular.
5. **Competidores:** [Hecho] QueResto (Buenos Aires), Meniu (MXN 169/mes) y muchos generadores gratuitos. [QueResto](https://gust.com/companies/queresto-com), [Meniu](https://meniuapp.com/en/blog/alternativa-gratuita-pedix-tienda-en-linea)
6. **Quejas:** a relevar.
7. **Diferenciación:** muy baja. Es un producto commodity.
8. **MVP:** categorías, platos, precios, fotos y QR.
9. **Precio:** [Hipótesis] USD 3–6/mes.
10. **Complejidad:** 1/5.
11. **Plan gratuito:** sí.
12. **Mantenimiento:** muy bajo.
13. **Venta:** difícil cobrar por algo que se consigue gratis.
14. **Riesgos:** precio cercano a cero.
15. **Primeros 10:** complemento de otra app, no producto principal.

### Idea 5 — Libreta digital de fiado y cuentas corrientes
1. **Nombre:** Cuentas Claras.
2. **Cliente:** almacenes, despensas, corralones, distribuidoras chicas y comercios de barrio que venden a cuenta.
3. **Problema:** registran deudas en un cuaderno. Hay errores, discusiones con clientes y no saben cuánto les deben en total. [Hecho] El fiado se concentra entre el 20 y el 30 de cada mes y afecta sobre todo a jubilados y clientes habituales. [Canal 12 Misiones](https://www.canal12misiones.com/?p=671662)
4. **Solución:** clientes con saldo, registro de ventas a cuenta y pagos, límite de crédito, resumen por cliente y **enlace o mensaje por wa.me con el saldo y los movimientos**.
5. **Competidores:** [Hecho] La búsqueda web **no encontró un producto argentino dedicado**; aparecen productos bancarios y billeteras que no resuelven esto. Las alternativas reales son el cuaderno, Excel y los módulos de cuenta corriente de los sistemas de gestión. **Revisar Google Play antes de concluir** (probablemente existan apps genéricas). [Búsqueda: CB Insights / Fiado App es otra cosa](https://www.cbinsights.com/compare/fiado-app-vs-waynimvil)
6. **Quejas:** a relevar.
7. **Diferenciación:** simplicidad (más simple que un sistema de gestión) y el resumen enviado al cliente, que reduce las discusiones. [Hipótesis]
8. **MVP:** clientes, movimientos (deuda y pago), saldo, límite, resumen compartible y alertas de clientes atrasados.
9. **Precio:** [Hipótesis] USD 4–8/mes. Los almacenes tienen baja disposición a pagar; los corralones y distribuidoras, más.
10. **Complejidad:** 2/5.
11. **Plan gratuito:** sí.
12. **Mantenimiento:** bajo. Errores de saldo serían graves, pero se previenen con pruebas.
13. **Venta:** media. El problema se entiende al instante; la duda es si pagan.
14. **Riesgos:** baja disposición a pagar en almacenes; resistencia a cambiar el cuaderno; datos sensibles de deudas de terceros (Ley 25.326).
15. **Primeros 10:** comercios de barrio conocidos, ofreciendo cargar el cuaderno actual en la primera visita.

### Idea 6 — Órdenes de trabajo y seguimiento de reparaciones
1. **Nombre:** Taller al Día.
2. **Cliente:** servicio técnico de celulares y computadoras, electrodomésticos, bicicleterías, relojerías, talleres chicos y tapiceros.
3. **Problema:** reciben equipos con papelitos, pierden el registro, el cliente llama para preguntar "¿ya está?" y no hay constancia de lo que se recibió ni de lo que se acordó.
4. **Solución:** orden de ingreso con número, datos del equipo, falla y presupuesto; comprobante PDF o enlace para el cliente; **página de estado** donde el cliente ve el avance; aviso "listo para retirar" por wa.me; historial.
5. **Competidores:** [Hecho] RemOnline y Orderry (internacionales, precio a pedido), Technical Service Management (USD 240/año con 300 órdenes por mes), Excel y talonarios. No se encontró una solución local con precio publicado. [Appvizer RemOnline](https://www.appvizer.es/organizacion-planificacion/softwareparatalleres/remonline), [Comparasoftware TSM](https://www.comparasoftware.com/gestion-servicio-tecnico-en), [Orderry](https://www.comparasoftware.com/orderry)
6. **Quejas:** a relevar. [Hipótesis] Los competidores internacionales son complejos y caros para un taller de 1 a 3 personas.
7. **Diferenciación:** simple, en español rioplatense, en pesos, pensado para el celular, con página de estado y WhatsApp.
8. **MVP:** clientes, órdenes, estados configurables, comprobante con número, página de estado pública, aviso por wa.me, presupuesto de la reparación e historial por cliente.
9. **Precio:** [Hipótesis] USD 8–12/mes.
10. **Complejidad:** 2/5. Comparte casi todo con la idea 1 (clientes, ítems, documento, enlace, estados).
11. **Plan gratuito:** sí. Las fotos del equipo serían opcionales y comprimidas.
12. **Mantenimiento:** bajo.
13. **Venta:** media-baja. El dolor del "¿ya está?" es concreto y diario. [Hipótesis]
14. **Riesgos:** nicho más chico que la idea 1; algunos talleres ya usan un sistema de gestión.
15. **Primeros 10:** contactos de servicios y oficios; servicios técnicos de celulares de la zona (son muchos y fáciles de visitar).

### Idea 7 — Tarjeta de fidelización digital
1. **Nombre:** Sellito.
2. **Cliente:** cafeterías, heladerías, peluquerías y estética.
3. **Problema:** las tarjetas de cartón se pierden y no hay datos de los clientes.
4. **Solución:** tarjeta de sellos digital con QR y premio al completarla.
5. **Competidores:** [Hecho] Loyalz (startup argentina, más de 1.500 comercios), Qamarero, Loyapp y Oappso. [Loyalz](https://infonegocios.info/amp/enfoque/loyalz-la-startup-argentina-que-les-da-a-las-cafeterias-y-restaurantes-la-misma-tecnologia-de-fidelizacion-que-tiene-starbucks), [Qamarero](https://qamarero.com/loyalty/)
6. **Quejas:** a relevar.
7. **Diferenciación:** baja frente a Loyalz.
8. **MVP:** tarjeta, sellos con QR, premios y lista de clientes.
9. **Precio:** [Hipótesis] USD 8–15/mes.
10. **Complejidad:** 3/5 (flujo del lado del consumidor y prevención de fraude con los sellos).
11. **Plan gratuito:** sí.
12. **Mantenimiento:** medio.
13. **Venta:** media. El retorno es difícil de demostrar.
14. **Riesgos:** competidor local con tracción.
15. **Primeros 10:** cafeterías conocidas.

### Idea 8 — Lista de precios con actualización masiva
1. **Nombre:** ListaYa.
2. **Cliente:** distribuidoras, mayoristas chicos y comercios que envían listas de precios a revendedores.
3. **Problema:** cada aumento de proveedor obliga a rehacer la lista en Excel y reenviarla en PDF. [Hipótesis] Depende del ritmo de la inflación.
4. **Solución:** productos por proveedor y rubro, aumento por porcentaje, lista pública por enlace siempre actualizada y PDF.
5. **Competidores:** Excel, sistemas de gestión, Tiendanube y Pedix.
6. **Quejas:** a relevar.
7. **Diferenciación:** media. Se superpone con la idea 3.
8. **MVP:** productos, proveedores, aumentos masivos, lista pública y PDF.
9. **Precio:** [Hipótesis] USD 6–10/mes.
10. **Complejidad:** 2/5.
11. **Plan gratuito:** sí.
12. **Mantenimiento:** bajo.
13. **Venta:** media.
14. **Riesgos:** si la inflación baja, el dolor se reduce.
15. **Primeros 10:** distribuidoras del rubro minorista.

### Idea 9 — Gift cards y vouchers digitales
1. **Nombre:** Regalá.
2. **Cliente:** estética, spa, gastronomía.
3. **Problema:** vender regalos en fechas especiales sin vouchers de papel.
4. **Solución:** el consumidor compra un voucher online y el comercio lo valida.
5. **Competidores:** vouchers de papel y algunas plataformas de regalos.
6. **Quejas:** a relevar.
7. **Diferenciación:** media.
8. **MVP:** vouchers, cobro al consumidor, validación y vencimientos.
9. **Precio:** [Hipótesis] comisión por venta o USD 5–10/mes.
10. **Complejidad:** 4/5. El cobro va al comercio: requiere integrar Mercado Pago **de cada comercio** y asumir responsabilidad frente a consumidores.
11. **Plan gratuito:** sí.
12. **Mantenimiento:** medio-alto (reclamos de consumidores).
13. **Venta:** media. La demanda es estacional.
14. **Riesgos:** responsabilidad legal frente a consumidores, estacionalidad.
15. **Primeros 10:** antes del Día de la Madre o de fin de año.

### Idea 10 — Cierre de caja diario y control de gastos
1. **Nombre:** CajaFácil.
2. **Cliente:** comercios minoristas y gastronomía sin sistema de punto de venta.
3. **Problema:** no saben cuánto ganaron en el día ni en qué se fue la plata.
4. **Solución:** carga rápida de ingresos por medio de pago y de gastos, cierre diario y resumen mensual.
5. **Competidores:** sistemas de punto de venta (por ejemplo Fudo en gastronomía), Excel, cuaderno y apps de finanzas personales.
6. **Quejas:** a relevar.
7. **Diferenciación:** baja frente a los puntos de venta.
8. **MVP:** movimientos, categorías, cierre y reportes.
9. **Precio:** [Hipótesis] USD 4–8/mes.
10. **Complejidad:** 2/5.
11. **Plan gratuito:** sí.
12. **Mantenimiento:** bajo.
13. **Venta:** difícil. Requiere disciplina diaria del cliente, y si no la tiene, cancela.
14. **Riesgos:** abandono alto.
15. **Primeros 10:** comercios sin punto de venta.

---

## 2. Matriz comparativa

Escala de 1 a 5 (5 = mejor). Todas las puntuaciones son **[Hipótesis]** basadas en la investigación anterior.

| # | Idea | Demanda (25%) | Venta (25%) | Técnica (15%) | Velocidad (15%) | Rentabilidad (10%) | Mantenimiento (10%) | **Total** |
|---|---|---|---|---|---|---|---|---|
| 1 | Presupuestador | 4 | 4 | 5 | 5 | 3 | 5 | **4,30** |
| 6 | Órdenes de trabajo | 4 | 4 | 4 | 4 | 4 | 4 | **4,00** |
| 5 | Libreta de fiado | 4 | 4 | 4 | 4 | 3 | 4 | **3,90** |
| 2 | Turnos online | 5 | 3 | 3 | 3 | 4 | 3 | 3,60 |
| 8 | Lista de precios | 3 | 3 | 4 | 4 | 3 | 4 | 3,40 |
| 4 | Menú QR | 3 | 2 | 5 | 5 | 1 | 5 | 3,35 |
| 3 | Catálogo WhatsApp | 4 | 2 | 4 | 4 | 2 | 4 | 3,30 |
| 7 | Fidelización | 3 | 3 | 3 | 3 | 3 | 4 | 3,10 |
| 10 | Cierre de caja | 3 | 2 | 4 | 4 | 2 | 4 | 3,05 |
| 9 | Gift cards | 2 | 3 | 3 | 3 | 2 | 3 | 2,65 |

**Justificación de los puntajes clave:**
- **Presupuestador, técnica y velocidad 5:** es un CRUD con PDF y enlace público, sin integraciones externas.
- **Presupuestador, rentabilidad 3:** existen generadores gratuitos que empujan el precio para abajo.
- **Órdenes de trabajo, rentabilidad 4:** el dolor es diario y los competidores cobran en dólares; tolera un precio más alto.
- **Fiado, demanda 4:** el problema es masivo, pero la disposición a pagar en almacenes es dudosa. [Hipótesis]
- **Turnos, demanda 5 y venta 3:** es el problema más conocido, pero tiene competidores con mucho capital y el recordatorio automático rompe el costo cero.
- **Catálogo y menú QR, venta 2:** hay alternativas gratuitas consolidadas (Tiendanube Inicial, WhatsApp Business).
- **Gift cards, técnica 3 y demanda 2:** requiere cobrar en nombre de cada comercio, con responsabilidad frente a consumidores; la demanda es estacional.

Los pesos de la matriz se mantienen como estaban definidos. Con otros pesos razonables, los tres primeros lugares no cambian.

---

## 3. Selección

### Top 3
1. **Presupuestador** (4,30).
2. **Órdenes de trabajo** (4,00).
3. **Libreta de fiado** (3,90).

**Lo más importante:** las tres comparten el mismo núcleo: **clientes, ítems con precio, un documento con número y estado, un enlace público y un aviso por wa.me**. Construir la primera deja hecho el 60–70% de la segunda y la tercera. [Hipótesis] Eso convierte la plataforma en una **suite para comercios y oficios**, y cada app nueva cuesta mucho menos.

### Recomendación para el primer lanzamiento: **Presupuestador**

**Por qué:**
- Es la más rápida y simple de construir y mantener, algo clave porque no programás.
- Se demuestra en 2 minutos con un presupuesto real del propio cliente.
- Encaja con dos de tus cuatro redes de contactos: oficios y comercio minorista.
- Construye el núcleo que reutilizan las otras dos finalistas.

**Condición:** la competencia gratuita es real. El producto **no puede venderse como "generador de PDF"**. Tiene que venderse como "**no pierdas presupuestos**": seguimiento, aceptación online, recordatorios y precios actualizados. Si en la validación los clientes solo valoran el PDF, se cambia a Órdenes de trabajo.

**Por qué no las otras dos (por ahora):**
- **Órdenes de trabajo:** muy buena candidata, con precio potencial más alto y menos competencia local. Queda segunda porque el nicho es más chico y el ingreso de equipos requiere más trabajo de producto (estados configurables, fotos). **Se valida en paralelo**: si da mejores señales que el presupuestador, se elige esta.
- **Libreta de fiado:** la disposición a pagar en almacenes es la gran duda, y maneja datos de deudas de terceros, que son más sensibles. Conviene como tercera app, con la plataforma ya probada.

---

## 4. Plan de validación

### 4.1 Segmento inicial
- **Primario:** oficios e instaladores que hacen **más de 5 presupuestos por mes**: electricistas, gasistas, aire acondicionado, aberturas, durlock y pintura.
- **Secundario:** comercios que cotizan a pedido (corralones, imprentas, carpinterías).
- **En paralelo (para Órdenes de trabajo):** servicios técnicos de celulares y electrodomésticos.

### 4.2 Perfil del cliente ideal
- Trabaja por su cuenta o con hasta 5 personas.
- Hoy cotiza por WhatsApp, Word, Excel o talonario.
- Pierde trabajos porque no hace seguimiento, o tarda en cotizar.
- Usa el celular todo el día. Ya paga algo de software o servicios (Mercado Pago, un sistema de facturación).

### 4.3 Validación sin escribir código
1. **Semanas 1–2, entrevistas de problema.** Sin mostrar producto. El objetivo es entender cómo cotizan hoy y cuánto les cuesta.
2. **Semanas 3–4, prototipo.** Con un prototipo navegable (se puede hacer en la fase 3), mostrar el flujo y pedir un compromiso.
3. **Semanas 5–6, preventa.** Link de pago de Mercado Pago por **3 meses a precio fundador**, con devolución garantizada si el producto no se entrega en la fecha prometida.

### 4.4 Mensaje de primer contacto (WhatsApp)

> Hola [nombre], ¿cómo va? Te escribo porque estoy armando una herramienta para que [electricistas / instaladores / etc.] hagan presupuestos más rápido y no pierdan trabajos por falta de seguimiento. Todavía no vendo nada: estoy hablando con gente del rubro para entender cómo lo hacen hoy. ¿Tenés 15 minutos esta semana para que te haga unas preguntas? Me sirve muchísimo.

### 4.5 Guion de entrevista (sin vender)
1. ¿Cuántos presupuestos hacés por semana?
2. Contame el último presupuesto que hiciste, paso a paso. ¿Con qué lo hiciste? ¿Cuánto tardaste?
3. ¿Cómo se lo mandaste al cliente?
4. De los presupuestos que mandás, ¿cuántos se concretan? ¿Sabés por qué se caen los otros?
5. ¿Hacés seguimiento? ¿Cómo te acordás?
6. ¿Cómo actualizás los precios cuando aumentan los materiales?
7. ¿Probaste alguna app o programa para esto? ¿Por qué lo dejaste?
8. ¿Pagás hoy por alguna herramienta para tu trabajo? ¿Cuánto?
9. Si algo te resolviera [el problema que más mencionó], ¿cuánto valdría para vos por mes?

Se registra cada entrevista en una planilla: rubro, presupuestos por semana, herramienta actual, dolor principal, disposición a pagar y nivel de interés de 1 a 5.

### 4.6 Guion de demostración (semanas 3–4)
1. "Pasame un presupuesto que hayas hecho la semana pasada." Lo cargamos en vivo, en menos de 2 minutos.
2. Se genera el PDF con su logo.
3. Se envía por WhatsApp a su propio número; abre el enlace y lo acepta.
4. Se muestra el panel: "estos 3 presupuestos los vio el cliente y no contestó, ¿lo llamamos?".
5. Aumento de 10% a todos los materiales en un clic.
6. Cierre: "¿Te sirve? Estoy tomando 10 clientes fundadores a [precio] de por vida."

### 4.7 Oferta para clientes fundadores
- **50% de descuento de por vida** mientras mantengan la suscripción.
- A cambio: una charla de feedback de 15 minutos cada dos semanas durante los primeros 2 meses.
- Acceso anticipado y prioridad en las funciones que piden.
- Pago: link de Mercado Pago por 3 meses por adelantado. Activación manual. Devolución si no se entrega en la fecha prometida.

### 4.8 Indicadores y umbrales (6 semanas)

| Indicador | Meta | Si no se alcanza |
|---|---|---|
| Contactos realizados | 30 | Revisar el mensaje o el canal |
| Entrevistas completadas | 12 | Revisar el segmento |
| Entrevistados con el dolor fuerte (interés 4–5) | 6 de 12 | Cambiar a Órdenes de trabajo |
| Pidieron ver la demo o probar | 6 | Revisar la propuesta de valor |
| **Pagos anticipados (preventa)** | **3** | **Ajustar o cambiar de idea** |

**Regla de decisión:**
- **3 o más pagos:** se pasa a la fase 3 con el presupuestador.
- **1 o 2 pagos, con señales fuertes:** se ajusta (precio, segmento o propuesta) y se repiten 2 semanas.
- **0 pagos:** se valida Órdenes de trabajo con el mismo proceso.

### 4.9 Costo de adquisición estimado
- **Dinero:** cero, salvo traslados. [Hipótesis]
- **Tiempo:** unas 30–40 horas en 6 semanas (contactos, entrevistas, demos, seguimiento), dentro de tus 10–20 horas semanales.
- **Para los primeros 10 clientes:** unas 3–4 horas por cliente cerrado, si la tasa de conversión de entrevista a pago ronda el 25%. [Hipótesis]
