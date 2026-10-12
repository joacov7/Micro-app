# Presupuestá

Plataforma de micro-apps SaaS para comercios y oficios de Argentina. La primera app es un **presupuestador**: presupuestos desde el celular, envío por WhatsApp, seguimiento de quién los vio y aceptación online.

- Reglas del proyecto: [`CLAUDE.md`](CLAUDE.md)
- Decisiones: [`docs/decisiones.md`](docs/decisiones.md)
- Arquitectura: [`docs/04-arquitectura.md`](docs/04-arquitectura.md)
- Plan por incrementos: [`docs/05-plan-de-implementacion.md`](docs/05-plan-de-implementacion.md)
- Runbooks (operación, en lenguaje simple): [`docs/runbooks/`](docs/runbooks/)

## Stack

Aplicación estática (Vite + React + TypeScript + Tailwind + shadcn/ui) servida por Cloudflare Pages. Datos, login y permisos en Supabase (Postgres con Row Level Security). Sin servidor propio. Detalle y motivos en `docs/04-arquitectura.md`.

## Correrlo en una computadora

Requisitos: Node.js 22 y Docker (para la base de datos local).

```bash
npm ci                # instala dependencias exactas
npm run db:start      # levanta Supabase local (base, login y emails de prueba)
npx supabase status -o env   # muestra API_URL y ANON_KEY para el paso siguiente
cp .env.example .env.local   # completar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
npm run dev           # abre la app en http://localhost:5173
```

Los emails (confirmación de cuenta, recuperar contraseña) no salen a internet en local: se ven en Mailpit, http://127.0.0.1:54324.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run check` | Todo lo que corre CI: lint, formato, tipos, pruebas y build |
| `npm run test` | Pruebas unitarias (Vitest) |
| `npm run test:e2e` | Pruebas de punta a punta en celular y escritorio (Playwright) |
| `npm run format` | Ordena el formato del código |
| `npm run build` | Genera el sitio estático en `dist/` |
| `npm run db:reset` | Recrea la base local aplicando todas las migraciones |
| `npm run db:test` | Pruebas de permisos y aislamiento de la base (pgTAP) |
| `npm run db:types` | Regenera los tipos TypeScript de la base después de una migración |

Si Playwright no puede descargar navegadores, se puede usar uno instalado con `PW_CHROMIUM_PATH=/ruta/a/chromium npm run test:e2e`.

## Estructura

```
src/
  platform/        Plataforma: acceso, organizaciones, planes, administración
  apps/
    presupuestos/  App 1 (cada app usa la plataforma solo a través de su contrato)
  site/            Sitio público
  ui/              Componentes compartidos (basados en shadcn/ui)
  lib/             Utilidades
supabase/
  migrations/      Cambios de la base de datos, en orden (nunca editar uno ya aplicado)
  tests/           Pruebas de permisos (pgTAP)
e2e/               Pruebas de punta a punta
docs/              Documentación del negocio, arquitectura y operación
validacion/        Material de validación comercial (no es parte de la app)
```

## Reglas para contribuir

- Nunca subir claves: van en `.env.local` (local) o en los secretos de GitHub.
- Todo cambio pasa por CI. Lo que no pasa `npm run check` no se fusiona.
- Toda tabla nueva lleva Row Level Security y pruebas de aislamiento (lo verifica `supabase/tests/rls_obligatorio.test.sql`).
- Cada dependencia nueva se registra en `docs/licencias.md` (solo MIT, Apache 2.0 o similares).
