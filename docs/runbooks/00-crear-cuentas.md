# Runbook 00 — Crear las cuentas del proyecto

Para: el dueño del proyecto (no hace falta programar).
Tiempo estimado: 1 a 2 horas, se puede hacer en varias veces.
Costo: $0. Ninguno de estos servicios pide tarjeta para el plan gratuito; si alguno la pide, frená y avisá antes de cargarla.

**Regla de oro:** las claves que aparecen en estos pasos **nunca** se pegan en el chat, en un archivo del repositorio ni en un mensaje. Solo van en "Secrets" de GitHub (paso 6) o en el panel del servicio.

Usá el mismo email para todas las cuentas y activá la verificación en dos pasos donde se ofrezca.

---

## Paso 1 — Repositorio privado (D-15)

1. Entrá a https://github.com/joacov7/Micro-app
2. **Settings** (arriba a la derecha del repositorio) → **General** → bajá hasta **Danger Zone**.
3. **Change repository visibility** → **Make private** → confirmá escribiendo el nombre del repositorio.

✅ Listo cuando: el repositorio muestra la etiqueta "Private" al lado del nombre.

## Paso 2 — Supabase (base de datos y login)

1. Entrá a https://supabase.com → **Start your project** → registrate con GitHub.
2. Creá una organización llamada `Presupuesta`, plan **Free**.
3. Creá el primer proyecto:
   - Nombre: `presupuesta-pruebas`
   - Contraseña de la base: tocá **Generate a password** y guardala en tu gestor de contraseñas (por ejemplo el de Google o Bitwarden).
   - Región: **South America (São Paulo)** — es la más cercana a Argentina.
4. Repetí para el segundo proyecto: `presupuesta-prod`, misma región, **otra** contraseña.
5. En cada proyecto, andá a **Project Settings → API** y anotá en tu gestor de contraseñas:
   - **Project URL**
   - **anon public key**
   - **service_role key** (esta es secreta: es la llave maestra)
6. En cada proyecto: **Authentication → Providers → Email**: dejá activado "Confirm email".

✅ Listo cuando: tenés dos proyectos y sus tres datos guardados en el gestor de contraseñas.

## Paso 3 — Cloudflare (publicación del sitio)

1. Entrá a https://dash.cloudflare.com/sign-up y creá la cuenta (plan Free).
2. Por ahora no hace falta nada más. La conexión con GitHub la hacemos juntos en el incremento 9, cuando haya algo para publicar.

✅ Listo cuando: podés entrar al panel de Cloudflare.

## Paso 4 — Sentry (aviso de errores)

1. Entrá a https://sentry.io/signup/ → plan **Developer** (gratis).
2. Cuando pregunte la plataforma, elegí **React**. Nombre del proyecto: `presupuesta`.
3. Anotá el **DSN** que te muestra (empieza con `https://`) en el gestor de contraseñas.
4. En **Settings → Account → Notifications**, verificá que las alertas lleguen a tu email.

✅ Listo cuando: tenés el DSN guardado.

## Paso 5 — Brevo (emails)

1. Entrá a https://www.brevo.com → **Sign up free**.
2. Completá los datos del negocio. Si pregunta, el uso es "emails transaccionales".
3. **SMTP & API → API Keys → Generate a new API key**, nombre `presupuesta`. Guardala en el gestor de contraseñas.

✅ Listo cuando: tenés la API key guardada.

## Paso 6 — Cargar las claves en GitHub

1. En el repositorio: **Settings → Secrets and variables → Actions → New repository secret**.
2. Creá uno por cada fila (nombre exacto, valor desde tu gestor de contraseñas):

| Nombre del secreto | Valor |
|---|---|
| `SUPABASE_PRUEBAS_URL` | Project URL de presupuesta-pruebas |
| `SUPABASE_PRUEBAS_ANON_KEY` | anon public key de presupuesta-pruebas |
| `SUPABASE_PRUEBAS_SERVICE_KEY` | service_role key de presupuesta-pruebas |
| `SUPABASE_PRUEBAS_DB_PASSWORD` | contraseña de la base de presupuesta-pruebas |
| `SUPABASE_PROD_URL` | Project URL de presupuesta-prod |
| `SUPABASE_PROD_ANON_KEY` | anon public key de presupuesta-prod |
| `SUPABASE_PROD_SERVICE_KEY` | service_role key de presupuesta-prod |
| `SUPABASE_PROD_DB_PASSWORD` | contraseña de la base de presupuesta-prod |
| `SENTRY_DSN` | DSN de Sentry |
| `BREVO_API_KEY` | API key de Brevo |

✅ Listo cuando: los 10 secretos aparecen en la lista (GitHub no muestra los valores, es normal).

---

## Checklist final

- [ ] Repositorio privado
- [ ] Supabase: 2 proyectos en São Paulo
- [ ] Cloudflare: cuenta creada
- [ ] Sentry: proyecto React y DSN
- [ ] Brevo: API key
- [ ] 10 secretos cargados en GitHub

Cuando termines, avisá "cuentas listas". Nunca mandes las claves por el chat.

## Si algo sale mal

- **Un servicio pide tarjeta:** no la cargues; avisá cuál y en qué pantalla.
- **Pegaste una clave en un lugar equivocado** (chat, archivo, mensaje): avisá enseguida. Se regenera desde el panel del servicio y se reemplaza en GitHub; la vieja deja de funcionar.
- **Supabase no deja crear el segundo proyecto:** el plan gratuito permite 2 proyectos activos por cuenta; revisá que no haya uno viejo creado antes.
