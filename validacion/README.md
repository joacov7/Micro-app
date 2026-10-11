# Material de validación comercial

Herramientas para las 6 semanas de validación (ver `docs/02-oportunidades.md` §4). No forman parte de la aplicación.

## `prototipo-presupuestador.html`

Prototipo navegable para mostrar en las demos. **No es el producto**: los datos son de ejemplo y nada se guarda.

- Versión publicada: https://claude.ai/artifact/TuYXv3J7tx7rShehMp6NAt (privada; compartila desde el menú Share si querés mandarla).
- También se puede abrir este archivo en el navegador del celular.

**Antes de cada demo:** en "Mi negocio", escribí el nombre y rubro del negocio de la persona. Así se ve con su marca.

**Recorrido sugerido (guion de demo, 5 minutos):**
1. Inicio: mostrar el aviso "2 clientes vieron tu presupuesto y no contestaron". Es el gancho principal.
2. "Nuevo": cargar el nombre de un cliente real de la persona y ajustar cantidades.
3. "Generar presupuesto" → ver el documento con su marca.
4. "Enviar por WhatsApp" → mostrar el mensaje ya escrito.
5. "Ver lo que recibe el cliente" → "Aceptar presupuesto" → volver: queda marcado como aceptado.
6. "Precios" → aumentar 10% los materiales en un toque.
7. Cierre con la oferta de cliente fundador.

"Reiniciar" (arriba) vuelve todo a los datos de ejemplo.

Los textos dicen "En la versión real..." donde el prototipo simula algo: abrir WhatsApp, descargar el PDF y subir el logo.

## `seguimiento-validacion.xlsx`

Planilla para registrar contactos y entrevistas. El Tablero calcula el avance contra las metas y la decisión según la regla.

- Se puede abrir en Excel o subir a Google Sheets (Archivo → Importar).
- Celdas amarillas: fecha de inicio y metas, editables.
- La fila 2 (gris, "EJEMPLO") muestra el formato y no se cuenta.

**Importante:** una vez completada tiene datos personales de terceros (teléfonos, opiniones). Guardá la copia completa fuera del repositorio. Las copias que terminen en `-completa.xlsx` están excluidas por `.gitignore`.
