import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { Proveedores } from '@/proveedores'
import { router } from '@/router'
import './index.css'

const root = document.getElementById('root')
if (!root) throw new Error('Falta el elemento #root en index.html')

createRoot(root).render(
  <StrictMode>
    <Proveedores>
      <RouterProvider router={router} />
    </Proveedores>
  </StrictMode>,
)
