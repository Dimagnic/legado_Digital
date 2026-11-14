import { useState, type FormEvent } from 'react'
import { Logo, Marca } from '../../design-system/Logo'
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
    <main className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      {/* Panel de marca */}
      <section className="relative hidden overflow-hidden bg-tinta p-14 text-papel lg:flex lg:flex-col lg:justify-between">
        <Logo size={44} claro />
        <Marca size={560} claro className="pointer-events-none absolute -bottom-40 -right-40 opacity-[0.07]" />
        <div className="relative max-w-lg">
          <p className="font-serif text-[46px] leading-[1.1]">
            Una vida no debería desaparecer sin dejar huella.
          </p>
          <p className="mt-6 text-lg text-papel/70">
            Guarda tu historia con tu propia voz: lo que viviste, lo que aprendiste y lo que quieres que sepan quienes amas.
          </p>
        </div>
        <p className="relative text-sm text-papel/50">Pregúntale hoy. Guárdalo para siempre.</p>
      </section>

      {/* Formulario */}
      <section className="flex items-center justify-center px-6 py-14">
        <div className="aparecer w-full max-w-md">
          <div className="lg:hidden">
            <Marca size={72} />
            <h1 className="mt-6 text-[40px] leading-[1.05]">Mi Legado <span className="text-terracota">Digital</span></h1>
            <p className="mt-3 font-serif text-xl italic text-tinta-suave">Pregúntale hoy. Guárdalo para siempre.</p>
          </div>
          <h2 className="hidden text-[40px] leading-tight lg:block">Bienvenido a tu espacio</h2>
          <p className="mt-2 hidden text-tinta-suave lg:block">Entra con tu correo. Sin contraseñas que recordar.</p>

          {estado === 'enviado' ? (
            <div className="mt-10 rounded-3xl border border-linea bg-hoja p-7 shadow-hoja">
              <p className="font-serif text-2xl">Revisa tu correo</p>
              <p className="mt-2 text-tinta-suave">Te enviamos un enlace a <strong className="text-tinta">{correo}</strong>. Ábrelo en este mismo dispositivo para entrar.</p>
              <Boton variante="texto" className="mt-3 -ml-2" onClick={() => setEstado('inicio')}>Usar otro correo</Boton>
            </div>
          ) : (
            <form onSubmit={entrar} className="mt-10 space-y-5">
              <Campo etiqueta="Tu correo" ayuda="Te enviaremos un enlace para entrar.">
                <Entrada type="email" autoComplete="email" required value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="nombre@correo.com" />
              </Campo>
              {error && <Aviso tono="error">{error}</Aviso>}
              <Boton type="submit" className="w-full" disabled={estado === 'enviando'}>{estado === 'enviando' ? 'Enviando…' : 'Entrar'}</Boton>
            </form>
          )}
          <ul className="mt-10 space-y-2 border-t border-linea pt-6 text-sm text-tinta-suave">
            <li>Tus recuerdos son privados: solo tú decides qué se comparte.</li>
            <li>No usamos tus recuerdos para entrenar inteligencia artificial.</li>
          </ul>
        </div>
      </section>
    </main>
  )
}
