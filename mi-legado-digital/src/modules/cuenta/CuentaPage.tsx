import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useSesion } from '../../app/Sesion'
import { IconoFlecha } from '../../design-system/Iconos'
import { Aviso, Boton, Campo, Entrada, Hoja, Titulo } from '../../design-system/ui'
import { cambiarContrasena, contrasenaValida } from '../../lib/cuenta'
import { ESTADO, PLANES, miUso, type MiUso } from '../../lib/planes'
import { supabase } from '../../lib/supabase'
import { BarraUso } from './PlanesPage'

export function CuentaPage() {
  const { sesion } = useSesion()
  const [uso, setUso] = useState<MiUso | null>(null)
  const [nueva, setNueva] = useState('')
  const [msg, setMsg] = useState<{ t: string; error?: boolean } | null>(null)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    miUso().then(setUso).catch(() => setUso(null))
  }, [])

  async function cambiar(e: FormEvent) {
    e.preventDefault()
    if (!contrasenaValida(nueva)) return setMsg({ t: 'Usa al menos 8 caracteres, con una letra y un número.', error: true })
    setGuardando(true)
    try {
      await cambiarContrasena(nueva)
      setNueva('')
      setMsg({ t: 'Tu contraseña se actualizó.' })
    } catch (err) {
      setMsg({ t: (err as Error).message, error: true })
    } finally {
      setGuardando(false)
    }
  }

  const plan = PLANES.find((p) => p.id === uso?.plan_id)

  return (
    <div className="aparecer mx-auto max-w-3xl space-y-6">
      <Titulo antetitulo="Mi cuenta" sub={sesion?.user.email}>Tu cuenta</Titulo>

      <Hoja>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="etiqueta text-tinta-suave">Plan</p>
            <p className="mt-1 font-serif text-[26px]">{plan?.nombre ?? '—'}</p>
            {uso && <span className="text-sm text-salvia">{ESTADO[uso.status]}</span>}
          </div>
          <Link to="/planes" className="inline-flex items-center gap-2 rounded-full border border-linea px-5 py-2.5 text-sm font-medium hover:bg-papel-hondo">
            Ver planes <IconoFlecha size={16} />
          </Link>
        </div>
        {uso && <div className="mt-6"><BarraUso uso={uso} /></div>}
      </Hoja>

      <Hoja>
        <h2 className="text-[24px]">Contraseña</h2>
        <form onSubmit={cambiar} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Campo etiqueta="Contraseña nueva"><Entrada type="password" autoComplete="new-password" value={nueva} onChange={(e) => setNueva(e.target.value)} /></Campo>
          </div>
          <Boton type="submit" variante="suave" disabled={guardando}>{guardando ? 'Guardando…' : 'Cambiar'}</Boton>
        </form>
        {msg && <div className="mt-4"><Aviso tono={msg.error ? 'error' : 'info'}>{msg.t}</Aviso></div>}
      </Hoja>

      <Hoja>
        <h2 className="text-[24px]">Privacidad y datos</h2>
        <p className="mt-2 text-tinta-suave">Permisos, descarga de todos tus recuerdos y qué hacemos con tu información.</p>
        <Link to="/privacidad" className="mt-4 inline-flex items-center gap-2 font-medium text-terracota">Ir a privacidad <IconoFlecha size={16} /></Link>
      </Hoja>

      <Boton variante="texto" onClick={() => supabase.auth.signOut()}>Cerrar sesión</Boton>
    </div>
  )
}
