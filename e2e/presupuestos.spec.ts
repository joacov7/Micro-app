import { readFile } from 'node:fs/promises'
import { expect, test } from '@playwright/test'
import { crearCuentaConNegocio } from './ayudas.ts'

test('arma, guarda, descarga, edita y borra presupuestos', async ({ page }, info) => {
  await crearCuentaConNegocio(page, info)
  const nav = page.getByRole('navigation', { name: 'Secciones' })

  // Precios de ejemplo para elegir
  await nav.getByRole('link', { name: 'Precios' }).click()
  await page.getByRole('button', { name: 'Cargar ejemplos de Electricista' }).click()
  await expect(page.getByText('Cargamos 9 ítems de ejemplo')).toBeVisible()

  // Validaciones al guardar vacío
  await nav.getByRole('link', { name: 'Nuevo' }).click()
  await expect(page.getByRole('heading', { name: 'Nuevo presupuesto' })).toBeVisible()
  await page.getByRole('button', { name: 'Guardar', exact: true }).click()
  await expect(page.getByText('Escribí el nombre del cliente.')).toBeVisible()
  await expect(page.getByText('Agregá al menos un ítem.')).toBeVisible()

  // Cliente nuevo
  await page.getByLabel('Nombre del cliente').fill('Laura Giménez')
  await page.getByLabel('WhatsApp del cliente (opcional)').fill('11 4000-1111')

  // Ítems de la lista (tocar dos veces suma cantidad)
  await page.getByRole('button', { name: '+ Agregar de mis precios' }).click()
  const hoja = page.getByRole('dialog', { name: 'Mis precios' })
  await hoja.getByRole('button', { name: /Boca de luz \(mano de obra\)/ }).click()
  await hoja.getByRole('button', { name: /Boca de luz \(mano de obra\)/ }).click()
  await hoja.getByRole('button', { name: /Cable unipolar/ }).click()
  await expect(hoja.getByText('Agregaste 3 ítems.')).toBeVisible()
  await hoja.getByRole('button', { name: 'Listo' }).click()
  await expect(page.getByLabel('Cantidad del ítem 1')).toHaveValue('2')
  await page.getByLabel('Cantidad del ítem 1').fill('6')

  // Ítem libre con precio en formato argentino
  await page.getByRole('button', { name: '+ Ítem libre' }).click()
  await page.getByLabel('Ítem 3', { exact: true }).fill('Canaleta 20 x 10')
  await page.getByLabel('Cantidad del ítem 3').fill('3')
  await page.getByLabel('Precio por u. ($)').last().fill('1.250,50')

  // 6 × 18.000 + 68.000 + 3 × 1.250,50 = 179.751,50 ; −10% = 161.776,35
  await page.getByLabel('Descuento (%)').fill('10')
  await expect(page.getByTestId('total-editor')).toHaveText('$ 161.776,35')
  await page.getByRole('button', { name: 'Guardar', exact: true }).click()

  // Detalle
  await expect(page.getByRole('heading', { name: 'N.º 0001' })).toBeVisible()
  const doc = page.getByRole('article', { name: 'Presupuesto N.º 0001' })
  await expect(doc).toContainText('Laura Giménez')
  await expect(doc).toContainText('Canaleta 20 x 10')
  await expect(doc).toContainText('$ 161.776,35')

  // PDF
  const [descarga] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Descargar PDF' }).click(),
  ])
  expect(descarga.suggestedFilename()).toBe('Presupuesto-0001-Laura-Gimenez.pdf')
  const pdf = await readFile((await descarga.path())!)
  expect(pdf.subarray(0, 5).toString()).toBe('%PDF-')
  expect(pdf.length).toBeGreaterThan(2000)

  // Edición: sin descuento; el número no cambia
  await page.getByRole('link', { name: 'Editar' }).click()
  await expect(page.getByRole('heading', { name: 'Editar N.º 0001' })).toBeVisible()
  await page.getByLabel('Descuento (%)').fill('0')
  await page.getByRole('button', { name: 'Guardar', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'N.º 0001' })).toBeVisible()
  await expect(page.getByRole('article')).toContainText('$ 179.751,50')

  // El cliente quedó guardado y se puede elegir en el siguiente
  await nav.getByRole('link', { name: 'Nuevo' }).click()
  await page.getByLabel('Nombre del cliente').fill('lau')
  await page
    .getByRole('list', { name: 'Clientes que coinciden' })
    .getByRole('button', { name: /Laura Giménez/ })
    .click()
  await expect(page.getByRole('button', { name: 'Cambiar' })).toBeVisible()
  await page.getByRole('button', { name: '+ Ítem libre' }).click()
  await page.getByLabel('Ítem 1', { exact: true }).fill('Visita técnica')
  await page.getByLabel('Precio por u. ($)').fill('20.000')
  await page.getByRole('button', { name: 'Guardar', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'N.º 0002' })).toBeVisible()

  // Inicio: lista y total del mes
  await nav.getByRole('link', { name: 'Presupuestos' }).click()
  const lista = page.getByRole('list', { name: 'Tus presupuestos' })
  await expect(lista.getByRole('link')).toHaveCount(2)
  await expect(page.getByText('$ 199.751,50')).toBeVisible()

  // Borrar un borrador
  await lista.getByRole('link', { name: /N\.º 0002/ }).click()
  await page.getByRole('button', { name: 'Borrar borrador' }).click()
  await page.getByRole('button', { name: 'Sí, borrar' }).click()
  await expect(lista.getByRole('link')).toHaveCount(1)
  await expect(lista).toContainText('N.º 0001 · Laura Giménez')
})
