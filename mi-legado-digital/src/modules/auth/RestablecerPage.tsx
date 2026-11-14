import { useId, useState, type FormEvent } from 'react'
import { IconoOjo } from '../../design-system/Iconos'
import { Marca } from '../../design-system/Logo'
import { Aviso, Boton, Campo, Entrada } from '../../design-system/ui'
import { cambiarContrasena, contrasenaValida, revisarContrasena } from '../../lib/cuenta'

/** Se abre desde el enlace de "Olvidé mi contraseña". */
export function RestablecerPage({ conSesion, onListo }: { conSesion: boolean; onListo: () => void }) {
  const [nueva, setNueva] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [ver, setVer] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [estado, setEstado] = useState<'form' | 'guardando' | 'listo'>('form')
  const r = revisarContrasena(nueva)
  const id = useId()

  async function guardar(e: FormEvent) {
    e.preventDefault()
    if (!contrasenaValida(nueva)) return setError('Tu contraseña necesita 8 caracteres, una letra y un número.')
    if (nueva !== confirmar) return setError('Las contraseñas no coinciden.')
    setError(null)
    setEstado('guardando')
    try {
      await cambiarContrasena(nueva)
      setEstado('listo')
    } catch (err) {
      setError((err as Error).message)
      setEstado('form')
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center px-5 py-12">
      <div className="aparecer w-full max-w-[460px] rounded-[32px] border border-linea/80 bg-hoja p-8 shadow-elevada sm:p-10">
        <Marca size={44} />
        {!conSesion ? (
          <>
            <h1 className="mt-5 text-[30px] leading-tight">Este enlace ya no es válido</h1>
            <p className="mt-3 text-tinta-suave">Los enlaces de recuperación duran poco y sirven una sola vez. Pide uno nuevo desde “¿Olvidaste tu contraseña?”.</p>
            <Boton className="mt-8 w-full" onClick={onListo}>Volver al inicio</Boton>
          </>
        ) : estado === 'listo' ? (
          <>
            <h1 className="mt-5 text-[30px] leading-tight">Listo, tu contraseña cambió</h1>
            <p className="mt-3 text-tinta-suave">Ya puedes seguir guardando tu historia.</p>
            <Boton className="mt-8 w-full" onClick={onListo}>Ir a mi espacio</Boton>
          </>
        ) : (
          <form onSubmit={guardar} className="space-y-5" noValidate>
            <h1 className="mt-5 text-[30px] leading-tight">Crea una contraseña nueva</h1>
            <div>
              <label htmlFor={id} className="block text-sm font-medium">Contraseña nueva</label>
              <span className="relative mt-2 block">
                <Entrada id={id} type={ver ? 'text' : 'password'} autoComplete="new-password" value={nueva} onChange={(e) => setNueva(e.target.value)} className="pr-12" />
                <button type="button" onClick={() => setVer((v) => !v)} aria-label={ver ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute inset-y-0 right-2 my-auto grid h-9 w-9 place-items-center rounded-full text-tinta-suave hover:text-tinta">
                  <IconoOjo size={19} tachado={ver} />
                </button>
              </span>
              <ul className="mt-2.5 flex flex-wrap gap-x-4 text-[13px]">
                <li className={r.largo ? 'text-salvia' : 'text-tinta-suave'}>{r.largo ? '✓' : '·'} 8 caracteres</li>
                <li className={r.letra ? 'text-salvia' : 'text-tinta-suave'}>{r.letra ? '✓' : '·'} Una letra</li>
                <li className={r.numero ? 'text-salvia' : 'text-tinta-suave'}>{r.numero ? '✓' : '·'} Un número</li>
              </ul>
            </div>
            <Campo etiqueta="Confírmala">
              <Entrada type={ver ? 'text' : 'password'} autoComplete="new-password" value={confirmar} onChange={(e) => setConfirmar(e.target.value)} />
            </Campo>
            {error && <Aviso tono="error">{error}</Aviso>}
            <Boton type="submit" className="w-full" disabled={estado === 'guardando'}>{estado === 'guardando' ? 'Guardando…' : 'Guardar contraseña'}</Boton>
          </form>
        )}
      </div>
    </main>
  )
}
