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

Requisitos: Node.js 22 (ver `.nvmrc`).

```bash
npm ci                # instala dependencias exactas
cp .env.example .env.local   # completar cuando haya Supabase (incremento 2)
npm run dev           # abre la app en http://localhost:5173
```

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run check` | Todo lo que corre CI: lint, formato, tipos, pruebas y build |
| `npm run test` | Pruebas unitarias (Vitest) |
| `npm run test:e2e` | Pruebas de punta a punta en celular y escritorio (Playwright) |
| `npm run format` | Ordena el formato del código |
| `npm run build` | Genera el sitio estático en `dist/` |

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
e2e/               Pruebas de punta a punta
docs/              Documentación del negocio, arquitectura y operación
validacion/        Material de validación comercial (no es parte de la app)
```

## Reglas para contribuir

- Nunca subir claves: van en `.env.local` (local) o en los secretos de GitHub.
- Todo cambio pasa por CI. Lo que no pasa `npm run check` no se fusiona.
- Cada dependencia nueva se registra en `docs/licencias.md` (solo MIT, Apache 2.0 o similares).
