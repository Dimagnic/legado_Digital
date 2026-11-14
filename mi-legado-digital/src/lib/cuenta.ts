import { supabase } from './supabase'

/** Mensajes claros en español para los errores de Supabase Auth. */
export function mensajeAuth(error: { message?: string; code?: string } | null): string {
  const m = `${error?.code ?? ''} ${error?.message ?? ''}`.toLowerCase()
  if (m.includes('invalid login') || m.includes('invalid_credentials')) return 'El correo o la contraseña no coinciden.'
  if (m.includes('email not confirmed') || m.includes('email_not_confirmed')) return 'Primero confirma tu correo: revisa el enlace que te enviamos.'
  if (m.includes('already registered') || m.includes('user_already_exists')) return 'Ya existe una cuenta con ese correo. Entra con “Ya tengo una cuenta”.'
  if (m.includes('weak') || m.includes('password should')) return 'La contraseña es muy débil. Usa al menos 8 caracteres con letras y números.'
  if (m.includes('rate limit') || m.includes('over_email_send_rate_limit')) return 'Hiciste varios intentos seguidos. Espera un minuto y vuelve a intentar.'
  if (m.includes('same_password') || m.includes('different from the old')) return 'La nueva contraseña debe ser distinta a la anterior.'
  return 'Algo salió mal. Revisa tu conexión e inténtalo de nuevo.'
}

/** Requisitos mínimos de contraseña, mostrados en vivo. */
export function revisarContrasena(c: string) {
  return {
    largo: c.length >= 8,
    letra: /[a-záéíóúñ]/i.test(c),
    numero: /\d/.test(c),
  }
}
export const contrasenaValida = (c: string) => Object.values(revisarContrasena(c)).every(Boolean)

export async function crearCuenta(nombre: string, correo: string, contrasena: string) {
  const { data, error } = await supabase.auth.signUp({
    email: correo.trim(),
    password: contrasena,
    options: { emailRedirectTo: window.location.origin, data: { display_name: nombre.trim() } },
  })
  if (error) throw new Error(mensajeAuth(error))
  // Supabase no revela si el correo ya existía: devuelve un usuario sin identidades
  if (data.user && data.user.identities?.length === 0) throw new Error(mensajeAuth({ code: 'user_already_exists' }))
  return { requiereConfirmacion: !data.session }
}

export async function entrarConContrasena(correo: string, contrasena: string) {
  const { error } = await supabase.auth.signInWithPassword({ email: correo.trim(), password: contrasena })
  if (error) throw new Error(mensajeAuth(error))
}

export async function entrarConEnlace(correo: string) {
  const { error } = await supabase.auth.signInWithOtp({ email: correo.trim(), options: { emailRedirectTo: window.location.origin, shouldCreateUser: false } })
  if (error) throw new Error(mensajeAuth(error))
}

export async function enviarRecuperacion(correo: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(correo.trim(), { redirectTo: `${window.location.origin}/restablecer` })
  if (error) throw new Error(mensajeAuth(error))
}

export async function cambiarContrasena(nueva: string) {
  const { error } = await supabase.auth.updateUser({ password: nueva })
  if (error) throw new Error(mensajeAuth(error))
}
