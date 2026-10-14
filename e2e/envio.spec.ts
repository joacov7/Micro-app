import { expect, test } from '@playwright/test'
import { crearCuentaConNegocio, crearPresupuesto } from './ayudas.ts'

test.beforeEach(async ({ context }) => {
  // WhatsApp no se abre de verdad en las pruebas: se responde una página vacía.
  await context.route(/^https:\/\/wa\.me\//, (route) => route.fulfill({ body: 'WhatsApp' }))
})

test('envía por WhatsApp, el cliente abre el link y acepta', async ({ page, browser }, info) => {
  await crearCuentaConNegocio(page, info)
  await crearPresupuesto(page, {
    cliente: 'Laura Giménez',
    telefono: '11 4000-1111',
    item: 'Instalación completa',
    precio: '250.000',
  })

  // Enviar: abre WhatsApp con el número del cliente y el link
  const [whatsapp] = await Promise.all([
    page.waitForEvent('popup'),
    page.getByRole('button', { name: 'Enviar por WhatsApp' }).click(),
  ])
  await whatsapp.waitForURL(/^https:\/\/wa\.me\/5491140001111\?text=/)
  const mensaje = decodeURIComponent(new URL(whatsapp.url()).searchParams.get('text') ?? '')
  expect(mensaje).toContain('Hola Laura, te paso el presupuesto N.º 0001')
  await whatsapp.close()

  await expect(page.getByText('Enviado', { exact: true })).toBeVisible()
  const link = await page.getByLabel('Link para tu cliente').inputValue()
  expect(mensaje).toContain(link)
  expect(link).toMatch(/\/p\/[0-9a-f]{32}$/)
  await expect(page.getByRole('link', { name: 'Editar' })).toBeHidden()

  // Vista previa del negocio: no cuenta como visto
  const [previa] = await Promise.all([
    page.waitForEvent('popup'),
    page.getByRole('link', { name: 'Ver lo que recibe tu cliente' }).click(),
  ])
  await expect(previa.getByText('Vista previa')).toBeVisible()
  await expect(previa.getByRole('button', { name: 'Aceptar presupuesto' })).toBeHidden()
  await previa.close()
  await page.reload()
  await expect(page.getByText('Tu cliente todavía no lo abrió.')).toBeVisible()

  // El cliente (sin cuenta, otro navegador) abre el link y acepta
  const cliente = await (await browser.newContext()).newPage()
  await cliente.goto(link)
  await expect(cliente.getByRole('heading', { name: 'Electricidad Prueba' })).toBeVisible()
  await expect(cliente.getByRole('article')).toContainText('$ 250.000')
  await cliente.getByRole('button', { name: 'Aceptar presupuesto' }).click()
  await expect(cliente.getByText('¿Confirmás que aceptás el presupuesto N.º 0001')).toBeVisible()
  await cliente.getByRole('button', { name: 'Sí, acepto' }).click()
  await expect(cliente.getByText('Presupuesto aceptado')).toBeVisible()
  await expect(cliente.getByRole('button', { name: 'Aceptar presupuesto' })).toBeHidden()

  // El negocio lo ve aceptado
  await page.reload()
  await expect(page.getByText('Aceptado', { exact: true })).toBeVisible()
  await page
    .getByRole('navigation', { name: 'Secciones' })
    .getByRole('link', { name: 'Presupuestos' })
    .click()
  await expect(page.getByRole('list', { name: 'Tus presupuestos' })).toContainText('Aceptado')
  await expect(page.getByText('Aceptados este mes')).toBeVisible()
  await expect(page.locator('p', { hasText: '$ 250.000' }).first()).toBeVisible()

  // Duplicar para un trabajo parecido
  await page
    .getByRole('list', { name: 'Tus presupuestos' })
    .getByRole('link', { name: /N\.º 0001/ })
    .click()
  await page.getByRole('button', { name: 'Duplicar con precios actuales' }).click()
  await expect(page.getByRole('heading', { name: 'Editar N.º 0002' })).toBeVisible()
})

test('el cliente rechaza con un motivo y el negocio lo ve', async ({ page, browser }, info) => {
  await crearCuentaConNegocio(page, info)
  await crearPresupuesto(page, { cliente: 'Diego', item: 'Cambio de tablero', precio: '95.000' })

  // Sin teléfono del cliente, WhatsApp deja elegir el contacto
  const [whatsapp] = await Promise.all([
    page.waitForEvent('popup'),
    page.getByRole('button', { name: 'Enviar por WhatsApp' }).click(),
  ])
  await whatsapp.waitForURL(/^https:\/\/wa\.me\/\?text=/)
  await whatsapp.close()
  const link = await page.getByLabel('Link para tu cliente').inputValue()

  const cliente = await (await browser.newContext()).newPage()
  await cliente.goto(link)
  await cliente.getByRole('button', { name: 'No me interesa' }).click()
  await cliente.getByLabel('¿Querés contarle por qué? (opcional)').fill('Conseguí otro precio')
  await cliente.getByRole('button', { name: 'Enviar respuesta' }).click()
  await expect(cliente.getByText('Este presupuesto fue rechazado.')).toBeVisible()

  await page.reload()
  await expect(page.getByText('Rechazado', { exact: true })).toBeVisible()
  await expect(page.getByText('Motivo del rechazo: Conseguí otro precio')).toBeVisible()
})

test('el negocio registra una respuesta recibida por teléfono', async ({ page }, info) => {
  await crearCuentaConNegocio(page, info)
  await crearPresupuesto(page, { cliente: 'Marcos', item: 'Visita', precio: '20.000' })
  const [whatsapp] = await Promise.all([
    page.waitForEvent('popup'),
    page.getByRole('button', { name: 'Enviar por WhatsApp' }).click(),
  ])
  await whatsapp.close()
  await page.getByRole('button', { name: 'Me respondió por otro medio' }).click()
  await page.getByRole('button', { name: 'Lo aceptó', exact: true }).click()
  await expect(page.getByText('Aceptado', { exact: true })).toBeVisible()
})

test('un link inválido muestra un mensaje claro', async ({ page }) => {
  await page.goto('/p/0123456789abcdef0123456789abcdef')
  await expect(
    page.getByRole('heading', { name: 'Este presupuesto no está disponible' }),
  ).toBeVisible()
})
