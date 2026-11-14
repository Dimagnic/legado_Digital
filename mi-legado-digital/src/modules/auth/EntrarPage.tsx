import { useState, type FormEvent } from 'react'
import { Aviso, Boton, Campo, Entrada } from '../../design-system/ui'
import { supabase } from '../../lib/supabase'

export function EntrarPage() {
  const [correo, setCorreo] = useState('')
  const [estado, setEstado] = useState<'inicio' | 'enviando' | 'enviado'>('inicio')
  const [error, setError] = useState<string | null>(null)

  async function entrar(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setEstado('enviando')
    const { error } = await supabase.auth.signInWithOtp({ email: correo.trim(), options: { emailRedirectTo: window.location.origin } })
    if (error) {
      setError('No pude enviar el enlace. Revisa tu correo e inténtalo de nuevo.')
      setEstado('inicio')
    } else setEstado('enviado')
  }

  return (
    <main className="grid min-h-dvh place-items-center px-6 py-12">
      <div className="aparecer w-full max-w-md">
        <img src="/favicon.svg" alt="" className="h-12 w-12" />
        <h1 className="mt-6 text-[40px] leading-tight">Mi Legado Digital</h1>
        <p className="mt-3 font-serif text-xl text-tinta-suave">Pregúntale hoy. Guárdalo para siempre.</p>

        {estado === 'enviado' ? (
          <div className="mt-10"><Aviso>Te enviamos un enlace a <strong>{correo}</strong>. Ábrelo en este mismo dispositivo para entrar.</Aviso></div>
        ) : (
          <form onSubmit={entrar} className="mt-10 space-y-5">
            <Campo etiqueta="Tu correo" ayuda="Te enviaremos un enlace para entrar, sin contraseña.">
              <Entrada type="email" autoComplete="email" required value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="nombre@correo.com" />
            </Campo>
            {error && <Aviso tono="error">{error}</Aviso>}
            <Boton type="submit" className="w-full" disabled={estado === 'enviando'}>{estado === 'enviando' ? 'Enviando…' : 'Entrar'}</Boton>
            <p className="text-sm text-tinta-suave">Tus recuerdos son privados. Solo tú decides qué se guarda y con quién se comparte.</p>
          </form>
        )}
      </div>
    </main>
  )
}
