import { expect, type Page, type TestInfo } from '@playwright/test'

// Requiere Supabase local (npx supabase start). Los emails se leen desde Mailpit.
const MAILPIT = process.env.MAILPIT_URL ?? 'http://127.0.0.1:54324'

export async function linkDelUltimoEmail(para: string, asunto: RegExp): Promise<string> {
  for (let intento = 0; intento < 30; intento++) {
    const r = await fetch(`${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:${para}`)}`)
    const { messages } = (await r.json()) as { messages: Array<{ ID: string; Subject: string }> }
    const msg = messages.find((m) => asunto.test(m.Subject))
    if (msg) {
      const detalle = (await (await fetch(`${MAILPIT}/api/v1/message/${msg.ID}`)).json()) as {
        HTML: string
      }
      const link = /href="([^"]+\/auth\/v1\/verify[^"]+)"/.exec(detalle.HTML)?.[1]
      if (link) return link.replaceAll('&amp;', '&')
    }
    await new Promise((res) => setTimeout(res, 500))
  }
  throw new Error(`No llegó el email "${asunto}" a ${para}`)
}

export async function entrar(page: Page, email: string, contrasena: string) {
  await page.goto('/entrar')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Contraseña').fill(contrasena)
  await page.getByRole('button', { name: 'Entrar' }).click()
}

export function emailUnico(info: TestInfo, prefijo = 'prueba') {
  return `${prefijo}-${info.project.name}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@ejemplo.test`
}

/** Crea una cuenta confirmada con su negocio y deja la sesión iniciada en /app. */
export async function crearCuentaConNegocio(
  page: Page,
  info: TestInfo,
  negocio = { nombre: 'Electricidad Prueba', rubro: 'Electricista' },
) {
  const email = emailUnico(info)
  await page.goto('/registro')
  await page.getByLabel('Tu nombre').fill('Persona de Prueba')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Contraseña').fill('obra2026')
  await page.getByRole('button', { name: 'Crear cuenta' }).click()
  await expect(page.getByRole('heading', { name: 'Revisá tu email' })).toBeVisible()
  await page.goto(await linkDelUltimoEmail(email, /confirm/i))
  await page.getByLabel('Nombre del negocio').fill(negocio.nombre)
  await page.getByLabel('Rubro').selectOption(negocio.rubro)
  await page.getByRole('button', { name: 'Empezar' }).click()
  await expect(page.getByRole('heading', { name: 'Presupuestos', level: 1 })).toBeVisible()
  return { email, contrasena: 'obra2026' }
}
