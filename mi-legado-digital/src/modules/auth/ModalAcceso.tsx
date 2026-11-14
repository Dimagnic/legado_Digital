import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { IconoCorreo, IconoFlecha, IconoOjo, IconoX } from '../../design-system/Iconos'
import { Marca } from '../../design-system/Logo'
import { Aviso, Boton, Campo, Entrada } from '../../design-system/ui'
import { contrasenaValida, crearCuenta, entrarConContrasena, entrarConEnlace, enviarRecuperacion, revisarContrasena } from '../../lib/cuenta'

export type VistaAcceso = 'inicio' | 'crear' | 'entrar' | 'olvide' | 'enlace' | 'revisa'

interface Props {
  abierto: boolean
  /** Recorrido inicial; p. ej. ['inicio', 'entrar'] abre en "entrar" con regreso a "inicio". */
  recorrido?: VistaAcceso[]
  onCerrar: () => void
}

/**
 * Modal de acceso. Guarda el recorrido como una pila para que la flecha
 * de regreso siempre lleve a la pantalla anterior.
 */
export function ModalAcceso({ abierto, recorrido = ['inicio'], onCerrar }: Props) {
  const [pila, setPila] = useState<VistaAcceso[]>(recorrido)
  const clave = recorrido.join('>')
  const [correo, setCorreo] = useState('')
  const [aviso, setAviso] = useState<{ titulo: string; texto: string } | null>(null)
  const panel = useRef<HTMLDivElement>(null)
  const vista = pila[pila.length - 1]

  const ir = (v: VistaAcceso) => setPila((p) => [...p, v])
  const atras = () => setPila((p) => (p.length > 1 ? p.slice(0, -1) : p))
  const avisar = (titulo: string, texto: string) => { setAviso({ titulo, texto }); ir('revisa') }

  // Reinicia al abrir, bloquea el scroll del fondo y maneja Escape / Tab
  useEffect(() => {
    if (!abierto) return
    setPila(clave.split('>') as VistaAcceso[])
    const previo = document.activeElement as HTMLElement | null
    document.body.style.overflow = 'hidden'
    const teclas = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar()
      if (e.key === 'Tab' && panel.current) {
        const f = panel.current.querySelectorAll<HTMLElement>('button, a, input, [tabindex]:not([tabindex="-1"])')
        const primero = f[0], ultimo = f[f.length - 1]
        if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo?.focus() }
        else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero?.focus() }
      }
    }
    document.addEventListener('keydown', teclas)
    return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', teclas); previo?.focus() }
  }, [abierto, clave, onCerrar])

  // Lleva el foco al primer campo de cada pantalla
  useEffect(() => {
    if (!abierto) return
    const t = setTimeout(() => panel.current?.querySelector<HTMLElement>('input, [data-foco]')?.focus(), 60)
    return () => clearTimeout(t)
  }, [vista, abierto])

  if (!abierto) return null

  const titulos: Record<VistaAcceso, string> = {
    inicio: 'Tu historia empieza aquí',
    crear: 'Crea tu cuenta',
    entrar: 'Qué gusto verte de nuevo',
    olvide: 'Recupera tu contraseña',
    enlace: 'Entra sin contraseña',
    revisa: aviso?.titulo ?? 'Revisa tu correo',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" role="presentation">
      <div className="absolute inset-0 bg-tinta/45 backdrop-blur-[3px] aparecer" onClick={onCerrar} aria-hidden />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-acceso"
        className="aparecer relative max-h-[94dvh] w-full overflow-y-auto rounded-t-[32px] border border-linea/80 bg-hoja shadow-elevada sm:max-w-[460px] sm:rounded-[32px]"
      >
        {/* Barra superior: regreso · marca · cerrar */}
        <div className="sticky top-0 z-10 flex items-center justify-between bg-hoja/95 px-4 pb-2 pt-4 backdrop-blur">
          {pila.length > 1 ? (
            <button type="button" onClick={atras} aria-label="Regresar a la pantalla anterior"
              className="grid h-10 w-10 place-items-center rounded-full text-tinta transition-colors hover:bg-papel-hondo">
              <IconoFlecha size={20} className="rotate-180" />
            </button>
          ) : <span className="h-10 w-10" />}
          <span className="mx-auto h-1.5 w-10 rounded-full bg-linea sm:hidden" aria-hidden />
          <button type="button" onClick={onCerrar} aria-label="Cerrar"
            className="grid h-10 w-10 place-items-center rounded-full text-tinta-suave transition-colors hover:bg-papel-hondo hover:text-tinta">
            <IconoX size={20} />
          </button>
        </div>

        <div key={vista} className="aparecer px-7 pb-8 pt-1 sm:px-9 sm:pb-9">
          <Marca size={44} />
          <h2 id="titulo-acceso" className="mt-5 text-[30px] leading-tight">{titulos[vista]}</h2>

          {vista === 'inicio' && <Inicio onCrear={() => ir('crear')} onEntrar={() => ir('entrar')} />}
          {vista === 'crear' && (
            <Crear correo={correo} setCorreo={setCorreo} onEntrar={() => ir('entrar')}
              onListo={(conf) => conf ? avisar('Confirma tu correo', `Te enviamos un enlace a ${correo}. Ábrelo para activar tu cuenta y empezar.`) : onCerrar()} />
          )}
          {vista === 'entrar' && (
            <Entrar correo={correo} setCorreo={setCorreo} onOlvide={() => ir('olvide')} onEnlace={() => ir('enlace')} onCrear={() => ir('crear')} onListo={onCerrar} />
          )}
          {vista === 'olvide' && (
            <SoloCorreo correo={correo} setCorreo={setCorreo} boton="Enviar enlace de recuperación"
              texto="Escribe tu correo y te enviaremos un enlace para crear una contraseña nueva. Tus recuerdos no se tocan."
              accion={enviarRecuperacion}
              onListo={() => avisar('Revisa tu correo', `Si existe una cuenta con ${correo}, recibirás un enlace para crear una contraseña nueva. Puede tardar un par de minutos.`)} />
          )}
          {vista === 'enlace' && (
            <SoloCorreo correo={correo} setCorreo={setCorreo} boton="Enviarme el enlace"
              texto="Te mandamos un enlace de un solo uso. Ábrelo en este mismo dispositivo y entrarás directo."
              accion={entrarConEnlace}
              onListo={() => avisar('Revisa tu correo', `Te enviamos un enlace a ${correo}. Ábrelo en este dispositivo para entrar.`)} />
          )}
          {vista === 'revisa' && (
            <div className="mt-4 space-y-6">
              <div className="flex gap-4 rounded-2xl bg-salvia-claro/70 p-5">
                <IconoCorreo size={26} className="shrink-0 text-salvia" />
                <p className="text-[15px] text-tinta">{aviso?.texto}</p>
              </div>
              <p className="text-sm text-tinta-suave">¿No llegó? Revisa la carpeta de spam o promociones.</p>
              <Boton data-foco className="w-full" variante="suave" onClick={onCerrar}>Entendido</Boton>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Inicio({ onCrear, onEntrar }: { onCrear: () => void; onEntrar: () => void }) {
  return (
    <div className="mt-3">
      <p className="text-tinta-suave">Un lugar privado para guardar lo que viviste, lo que aprendiste y lo que quieres que sepan quienes amas.</p>
      <div className="mt-8 space-y-3">
        <Boton data-foco className="w-full" onClick={onCrear}>Crear una cuenta</Boton>
        <Boton className="w-full" variante="suave" onClick={onEntrar}>Ya tengo una cuenta</Boton>
      </div>
      <p className="mt-6 text-center text-sm text-tinta-suave">Empieza gratis. Sin tarjeta.</p>
    </div>
  )
}

function CampoContrasena({ valor, setValor, etiqueta = 'Contraseña', autoComplete, mostrarReglas = false }: {
  valor: string; setValor: (v: string) => void; etiqueta?: string; autoComplete: string; mostrarReglas?: boolean
}) {
  const [ver, setVer] = useState(false)
  const id = useId()
  const r = revisarContrasena(valor)
  const regla = (ok: boolean, t: string) => (
    <li className={`flex items-center gap-1.5 ${ok ? 'text-salvia' : 'text-tinta-suave'}`}>
      <span aria-hidden className={`grid h-4 w-4 place-items-center rounded-full text-[10px] ${ok ? 'bg-salvia text-hoja' : 'border border-linea'}`}>{ok ? '✓' : ''}</span>{t}
    </li>
  )
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-tinta">{etiqueta}</label>
      <span className="relative mt-2 block">
        <Entrada id={id} type={ver ? 'text' : 'password'} required autoComplete={autoComplete} value={valor} onChange={(e) => setValor(e.target.value)} className="pr-12" />
        <button type="button" onClick={() => setVer((v) => !v)} aria-label={ver ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          className="absolute inset-y-0 right-2 my-auto grid h-9 w-9 place-items-center rounded-full text-tinta-suave hover:text-tinta">
          <IconoOjo size={19} tachado={ver} />
        </button>
      </span>
      {mostrarReglas && (
        <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-[13px]" aria-live="polite">
          {regla(r.largo, '8 caracteres')}{regla(r.letra, 'Una letra')}{regla(r.numero, 'Un número')}
        </ul>
      )}
    </div>
  )
}

function Formulario({ onSubmit, error, children }: { onSubmit: (e: FormEvent) => void; error: string | null; children: ReactNode }) {
  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-5" noValidate>
      {children}
      {error && <Aviso tono="error">{error}</Aviso>}
    </form>
  )
}

function useEnvio() {
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const ejecutar = async (fn: () => Promise<void>) => {
    setError(null); setEnviando(true)
    try { await fn() } catch (e) { setError((e as Error).message) } finally { setEnviando(false) }
  }
  return { enviando, error, setError, ejecutar }
}

function Crear({ correo, setCorreo, onEntrar, onListo }: { correo: string; setCorreo: (v: string) => void; onEntrar: () => void; onListo: (requiereConfirmacion: boolean) => void }) {
  const [nombre, setNombre] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [acepto, setAcepto] = useState(false)
  const { enviando, error, setError, ejecutar } = useEnvio()

  const enviar = (e: FormEvent) => {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(correo)) return setError('Escribe un correo válido.')
    if (!contrasenaValida(contrasena)) return setError('Tu contraseña necesita 8 caracteres, una letra y un número.')
    if (contrasena !== confirmar) return setError('Las contraseñas no coinciden.')
    if (!acepto) return setError('Para continuar, acepta el aviso de privacidad.')
    ejecutar(async () => { const r = await crearCuenta(nombre, correo, contrasena); onListo(r.requiereConfirmacion) })
  }

  return (
    <Formulario onSubmit={enviar} error={error}>
      <Campo etiqueta="¿Cómo te gusta que te llamen?"><Entrada autoComplete="given-name" value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={80} /></Campo>
      <Campo etiqueta="Correo"><Entrada type="email" required autoComplete="email" value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="nombre@correo.com" /></Campo>
      <CampoContrasena valor={contrasena} setValor={setContrasena} autoComplete="new-password" mostrarReglas />
      <CampoContrasena valor={confirmar} setValor={setConfirmar} etiqueta="Confirma tu contraseña" autoComplete="new-password" />
      <label className="flex items-start gap-3 text-sm text-tinta-suave">
        <input type="checkbox" checked={acepto} onChange={(e) => setAcepto(e.target.checked)} className="mt-0.5 h-4 w-4 accent-terracota" />
        <span>Acepto el aviso de privacidad. Mis recuerdos son míos, privados y no se usan para entrenar IA.</span>
      </label>
      <Boton type="submit" className="w-full" disabled={enviando}>{enviando ? 'Creando tu cuenta…' : 'Crear mi cuenta'}</Boton>
      <p className="text-center text-sm text-tinta-suave">¿Ya tienes cuenta? <button type="button" onClick={onEntrar} className="font-medium text-terracota hover:underline">Entra aquí</button></p>
    </Formulario>
  )
}

function Entrar({ correo, setCorreo, onOlvide, onEnlace, onCrear, onListo }: {
  correo: string; setCorreo: (v: string) => void; onOlvide: () => void; onEnlace: () => void; onCrear: () => void; onListo: () => void
}) {
  const [contrasena, setContrasena] = useState('')
  const { enviando, error, setError, ejecutar } = useEnvio()
  const enviar = (e: FormEvent) => {
    e.preventDefault()
    if (!correo || !contrasena) return setError('Escribe tu correo y tu contraseña.')
    ejecutar(async () => { await entrarConContrasena(correo, contrasena); onListo() })
  }
  return (
    <Formulario onSubmit={enviar} error={error}>
      <Campo etiqueta="Correo"><Entrada type="email" required autoComplete="email" value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="nombre@correo.com" /></Campo>
      <CampoContrasena valor={contrasena} setValor={setContrasena} autoComplete="current-password" />
      <div className="-mt-2 text-right">
        <button type="button" onClick={onOlvide} className="text-sm font-medium text-terracota hover:underline">¿Olvidaste tu contraseña?</button>
      </div>
      <Boton type="submit" className="w-full" disabled={enviando}>{enviando ? 'Entrando…' : 'Entrar'}</Boton>
      <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-tinta-suave"><span className="h-px flex-1 bg-linea" />o<span className="h-px flex-1 bg-linea" /></div>
      <Boton type="button" variante="suave" className="w-full" onClick={onEnlace}><IconoCorreo size={18} /> Entrar con un enlace a mi correo</Boton>
      <p className="text-center text-sm text-tinta-suave">¿Primera vez aquí? <button type="button" onClick={onCrear} className="font-medium text-terracota hover:underline">Crea una cuenta</button></p>
    </Formulario>
  )
}

function SoloCorreo({ correo, setCorreo, texto, boton, accion, onListo }: {
  correo: string; setCorreo: (v: string) => void; texto: string; boton: string; accion: (c: string) => Promise<void>; onListo: () => void
}) {
  const { enviando, error, setError, ejecutar } = useEnvio()
  const enviar = (e: FormEvent) => {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(correo)) return setError('Escribe un correo válido.')
    ejecutar(async () => { await accion(correo); onListo() })
  }
  return (
    <Formulario onSubmit={enviar} error={error}>
      <p className="-mt-2 text-tinta-suave">{texto}</p>
      <Campo etiqueta="Correo"><Entrada type="email" required autoComplete="email" value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="nombre@correo.com" /></Campo>
      <Boton type="submit" className="w-full" disabled={enviando}>{enviando ? 'Enviando…' : boton}</Boton>
    </Formulario>
  )
}
