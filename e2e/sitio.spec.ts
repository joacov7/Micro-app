import { expect, test } from '@playwright/test'

test('el inicio carga y muestra la propuesta de valor', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('No pierdas más trabajos')
  await expect(page).toHaveTitle('Presupuestá')
})

test('la página no se desborda horizontalmente', async ({ page }) => {
  await page.goto('/')
  const desborde = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(desborde).toBeLessThanOrEqual(0)
})

test('una ruta inexistente muestra la página de error', async ({ page }) => {
  await page.goto('/esto-no-existe')
  await expect(page.getByRole('heading', { name: 'No encontramos esta página' })).toBeVisible()
  await page.getByRole('link', { name: 'Ir al inicio' }).click()
  await expect(page).toHaveURL('/')
})
