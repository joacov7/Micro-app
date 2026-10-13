import { expect, test } from '@playwright/test'
import { crearCuentaConNegocio } from './ayudas.ts'

test('carga precios de ejemplo, agrega, edita y quita ítems', async ({ page }, info) => {
  await crearCuentaConNegocio(page, info)
  await page
    .getByRole('navigation', { name: 'Secciones' })
    .getByRole('link', { name: 'Precios' })
    .click()
  await expect(page.getByRole('heading', { name: 'Mis precios' })).toBeVisible()

  // Ejemplos del rubro
  await page.getByRole('button', { name: 'Cargar ejemplos de Electricista' }).click()
  await expect(page.getByText('Cargamos 9 ítems de ejemplo')).toBeVisible()
  await expect(page.getByRole('button', { name: /Boca de luz \(mano de obra\)/ })).toBeVisible()

  // Alta con precio en formato argentino
  await page.getByRole('button', { name: 'Agregar' }).click()
  const hoja = page.getByRole('dialog', { name: 'Nuevo ítem' })
  await hoja.getByLabel('Nombre').fill('Llave de luz')
  await hoja.getByLabel('Precio ($)').fill('mucho')
  await hoja.getByRole('button', { name: 'Guardar' }).click()
  await expect(hoja.getByText('Escribí un precio válido')).toBeVisible()
  await hoja.getByLabel('Precio ($)').fill('3.500,50')
  await hoja.getByRole('button', { name: 'Guardar' }).click()
  await expect(hoja).toBeHidden()
  const fila = page.getByRole('button', { name: /Llave de luz/ })
  await expect(fila).toContainText('$ 3.500,5')

  // Nombre repetido
  await page.getByRole('button', { name: 'Agregar' }).click()
  await page.getByRole('dialog').getByLabel('Nombre').fill('llave de luz')
  await page.getByRole('dialog').getByLabel('Precio ($)').fill('100')
  await page.getByRole('dialog').getByRole('button', { name: 'Guardar' }).click()
  await expect(page.getByRole('dialog').getByRole('alert')).toContainText(
    'Ya tenés un ítem con ese nombre.',
  )
  await page.keyboard.press('Escape')

  // Edición
  await fila.click()
  await page.getByRole('dialog', { name: 'Editar ítem' }).getByLabel('Precio ($)').fill('4.000')
  await page.getByRole('dialog').getByRole('button', { name: 'Guardar' }).click()
  await expect(fila).toContainText('$ 4.000')

  // Búsqueda y filtro
  await page.getByLabel('Buscar').fill('llave')
  await expect(page.getByRole('button', { name: /Boca de luz/ })).toBeHidden()
  await page.getByLabel('Buscar').fill('')
  await page.getByRole('button', { name: 'Mano de obra', exact: true }).click()
  await expect(page.getByRole('button', { name: /Llave de luz/ })).toBeHidden()
  await page.getByRole('button', { name: 'Todas' }).click()

  // Quitar de la lista
  await fila.click()
  await page.getByRole('button', { name: 'Quitar de mi lista' }).click()
  await page.getByRole('button', { name: 'Sí, quitar' }).click()
  await expect(page.getByRole('button', { name: /Llave de luz/ })).toBeHidden()

  // Persiste al recargar
  await page.reload()
  await expect(page.getByRole('button', { name: /Boca de luz \(mano de obra\)/ })).toBeVisible()
})

test('agrega, edita y borra clientes', async ({ page }, info) => {
  await crearCuentaConNegocio(page, info)
  await page
    .getByRole('navigation', { name: 'Secciones' })
    .getByRole('link', { name: 'Clientes' })
    .click()
  await expect(page.getByText('Todavía no tenés clientes cargados')).toBeVisible()

  await page.getByRole('button', { name: 'Agregar el primero' }).click()
  const hoja = page.getByRole('dialog', { name: 'Nuevo cliente' })
  await hoja.getByLabel('Nombre').fill('Laura Giménez')
  await hoja.getByLabel('WhatsApp').fill('11 4000-1111')
  await hoja.getByLabel('Email (opcional)').fill('laura@')
  await hoja.getByRole('button', { name: 'Guardar' }).click()
  await expect(hoja.getByText('Revisá el email.')).toBeVisible()
  await hoja.getByLabel('Email (opcional)').fill('')
  await hoja.getByRole('button', { name: 'Guardar' }).click()
  await expect(page.getByRole('button', { name: /Laura Giménez/ })).toContainText('11 4000-1111')

  await page.getByRole('button', { name: /Laura Giménez/ }).click()
  await page.getByRole('dialog').getByLabel('Notas (opcional)').fill('Obra en Rivadavia 2140')
  await page.getByRole('dialog').getByRole('button', { name: 'Guardar' }).click()
  await expect(page.getByRole('dialog')).toBeHidden()

  await page.getByRole('button', { name: /Laura Giménez/ }).click()
  await expect(page.getByRole('dialog').getByLabel('Notas (opcional)')).toHaveValue(
    'Obra en Rivadavia 2140',
  )
  await page.getByRole('button', { name: 'Borrar cliente' }).click()
  await page.getByRole('button', { name: 'Sí, borrar' }).click()
  await expect(page.getByText('Todavía no tenés clientes cargados')).toBeVisible()
})

test('edita los datos del negocio y las condiciones', async ({ page }, info) => {
  await crearCuentaConNegocio(page, info)
  await page
    .getByRole('navigation', { name: 'Secciones' })
    .getByRole('link', { name: 'Negocio' })
    .click()

  await page.getByLabel('Nombre del negocio').fill('Electricidad Romero')
  await page.getByLabel('WhatsApp del negocio').fill('11 5555-0000')
  await page.getByLabel('Validez (días)').fill('0')
  await page.getByRole('button', { name: 'Guardar cambios' }).click()
  await expect(page.getByText('Al menos 1 día.')).toBeVisible()
  await page.getByLabel('Validez (días)').fill('10')
  await page.getByLabel('Forma de pago').fill('50% de anticipo, saldo al terminar.')
  await page.getByRole('button', { name: 'Guardar cambios' }).click()
  await expect(page.getByText('Listo, guardamos los cambios.')).toBeVisible()
  await expect(page.getByRole('banner')).toContainText('Electricidad Romero')

  await page.reload()
  await expect(page.getByLabel('Validez (días)')).toHaveValue('10')
  await expect(page.getByLabel('Forma de pago')).toHaveValue('50% de anticipo, saldo al terminar.')

  // El inicio refleja el paso completado
  await page
    .getByRole('navigation', { name: 'Secciones' })
    .getByRole('link', { name: 'Presupuestos' })
    .click()
  await expect(
    page.getByRole('link', { name: /Completá los datos de tu negocio \(hecho\)/ }),
  ).toBeVisible()
})
