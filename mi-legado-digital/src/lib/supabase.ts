import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
// Solo la clave pública (anon / publishable). Nunca la service_role en el navegador.
const key = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY) as
  | string
  | undefined

/** La URL debe ser la del proyecto de Supabase (https://<id>.supabase.co), no la del sitio. */
export const urlValida = Boolean(url && /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(url.trim()))
export const supabaseConfigurado = Boolean(urlValida && key)
export const urlConfigurada = url ?? ''

export const supabase: SupabaseClient = supabaseConfigurado
  ? createClient(url!.trim(), key!.trim(), { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } })
  : (null as unknown as SupabaseClient)
