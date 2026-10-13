import { expect, test } from '@playwright/test'
import { emailUnico, entrar, linkDelUltimoEmail } from './ayudas.ts'

test('el panel exige iniciar sesión', async ({ page }) => {
  await page.goto('/app')
  await expect(page).toHaveURL('/entrar')
  await expect(page.getByRole('heading', { name: 'Entrá a tu cuenta' })).toBeVisible()
})

test('registro, confirmación, alta del negocio y recuperación de contraseña', async ({
  page,
}, info) => {
  const email = emailUnico(info)

  // 1. Registro
  await page.goto('/registro')
  await page.getByLabel('Tu nombre').fill('Martín Prueba')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Contraseña').fill('corta')
  await page.getByRole('button', { name: 'Crear cuenta' }).click()
  await expect(page.getByText('Usá al menos 8 caracteres.')).toBeVisible()
  await page.getByLabel('Contraseña').fill('obra2026')
  await page.getByRole('button', { name: 'Crear cuenta' }).click()
  await expect(page.getByRole('heading', { name: 'Revisá tu email' })).toBeVisible()

  // 2. Sin confirmar no puede entrar
  await entrar(page, email, 'obra2026')
  await expect(page.getByRole('alert')).toContainText('Todavía no confirmaste tu email')

  // 3. Confirma desde el email y crea su negocio
  await page.goto(await linkDelUltimoEmail(email, /confirm/i))
  await expect(page.getByRole('heading', { name: 'Contanos de tu negocio' })).toBeVisible()
  await page.getByLabel('Nombre del negocio').fill('Electricidad Prueba')
  await page.getByLabel('Rubro').selectOption('Electricista')
  await page.getByRole('button', { name: 'Empezar' }).click()
  await expect(page.getByRole('heading', { name: 'Presupuestos', level: 1 })).toBeVisible()
  await expect(page.getByText('Plan Gratis: hasta 5 presupuestos por mes.')).toBeVisible()
  await expect(page.getByRole('banner')).toContainText('Electricidad Prueba')

  // 4. Sale y vuelve a entrar
  await page.getByRole('button', { name: 'Salir' }).click()
  await expect(page).toHaveURL('/')
  await entrar(page, email, 'equivocada1')
  await expect(page.getByRole('alert')).toContainText('El email o la contraseña no son correctos.')
  await entrar(page, email, 'obra2026')
  await expect(page.getByRole('heading', { name: 'Presupuestos', level: 1 })).toBeVisible()
  await page.getByRole('button', { name: 'Salir' }).click()

  // 5. Recupera la contraseña
  await page.goto('/recuperar')
  await page.getByLabel('Email').fill(email)
  await page.getByRole('button', { name: 'Mandarme el link' }).click()
  await expect(page.getByText('Si hay una cuenta con ese email')).toBeVisible()
  await page.goto(await linkDelUltimoEmail(email, /reset/i))
  await expect(page.getByRole('heading', { name: 'Elegí tu contraseña nueva' })).toBeVisible()
  await page.getByLabel('Contraseña nueva').fill('nueva2026')
  await page.getByLabel('Repetila').fill('nueva2026')
  await page.getByRole('button', { name: 'Guardar contraseña' }).click()
  await expect(page.getByRole('heading', { name: 'Presupuestos', level: 1 })).toBeVisible()

  // 6. La contraseña vieja ya no sirve; la nueva sí
  await page.getByRole('button', { name: 'Salir' }).click()
  await entrar(page, email, 'obra2026')
  await expect(page.getByRole('alert')).toBeVisible()
  await entrar(page, email, 'nueva2026')
  await expect(page.getByRole('heading', { name: 'Presupuestos', level: 1 })).toBeVisible()
})
