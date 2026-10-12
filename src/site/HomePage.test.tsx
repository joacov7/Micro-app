import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import { Proveedores } from '@/proveedores'
import { routes } from '@/router'

function renderRuta(ruta: string) {
  const router = createMemoryRouter(routes, { initialEntries: [ruta] })
  render(
    <Proveedores>
      <RouterProvider router={router} />
    </Proveedores>,
  )
}

describe('sitio público', () => {
  it('muestra la propuesta de valor en el inicio', () => {
    renderRuta('/')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'No pierdas más trabajos por presupuestos sin respuesta',
    )
    expect(screen.getByRole('link', { name: 'Crear cuenta gratis' })).toHaveAttribute(
      'href',
      '/registro',
    )
  })

  it('muestra una página de error amable en rutas inexistentes', () => {
    renderRuta('/no-existe')
    expect(screen.getByRole('heading', { name: 'No encontramos esta página' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ir al inicio' })).toHaveAttribute('href', '/')
  })
})
