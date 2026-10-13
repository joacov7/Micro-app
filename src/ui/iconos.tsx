import type { SVGProps } from 'react'

// Íconos de trazo simples (sin dependencias). Siempre decorativos: el texto acompaña.
const base = (p: SVGProps<SVGSVGElement>) => ({
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  ...p,
})

export const IconoInicio = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M4 11l8-6 8 6v9H4z" />
    <path d="M10 20v-5h4v5" />
  </svg>
)
export const IconoPrecios = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M3 7l9-4 9 4-9 4-9-4z" />
    <path d="M3 7v10l9 4 9-4V7M12 11v10" />
  </svg>
)
export const IconoClientes = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 4.5a3.5 3.5 0 010 7M21 20c0-2.6-1.6-4.8-4-5.6" />
  </svg>
)
export const IconoNegocio = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M4 9l1-5h14l1 5M4 9h16v11H4zM9 20v-6h6v6" />
  </svg>
)
export const IconoNuevo = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <rect x="4" y="3" width="16" height="18" rx="2" />
    <path d="M12 8v8M8 12h8" />
  </svg>
)
