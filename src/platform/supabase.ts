import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

let cliente: SupabaseClient<Database> | null = null

/**
 * Cliente de Supabase. Usa solo la clave pública: lo que cada usuario puede ver o
 * hacer lo decide la base de datos con Row Level Security.
 */
export function supabase(): SupabaseClient<Database> {
  if (cliente) return cliente
  const url = import.meta.env.VITE_SUPABASE_URL
  const clave = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!url || !clave) {
    throw new Error(
      'Faltan VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY. Copiá .env.example como .env.local y completalos.',
    )
  }
  cliente = createClient<Database>(url, clave, {
    auth: {
      // Flujo implícito: el link del email funciona aunque se abra en otro navegador
      // (por ejemplo, el navegador interno de la app de Gmail en el celular).
      flowType: 'implicit',
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true,
    },
  })
  return cliente
}
