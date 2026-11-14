import { useEffect, useState } from 'react'
import { Aviso, Boton, Hoja, Titulo } from '../../design-system/ui'
import { cambiarConsentimiento, consentimientosActivos, exportarTodo } from '../../lib/recuerdos'
import { supabase } from '../../lib/supabase'

const PERMISOS = [
  { kind: 'transcription', nombre: 'Transcribir mis grabaciones', ayuda: 'Tu audio se envía a un proveedor de transcripción solo para convertirlo en texto. El original nunca cambia.' },
  { kind: 'ai_processing', nombre: 'Sugerencias de IA', ayuda: 'La IA puede sugerir etiquetas y fechas. Todo aparece como “sugerido” hasta que tú lo confirmes.' },
]

export function PrivacidadPage() {
  const [activos, setActivos] = useState<string[]>([])
  const [mensaje, setMensaje] = useState<{ t: string; error?: boolean } | null>(null)
  const [exportando, setExportando] = useState(false)

  useEffect(() => {
    consentimientosActivos().then(setActivos).catch(() => {})
  }, [])

  async function alternar(kind: string) {
    const otorgar = !activos.includes(kind)
    try {
      await cambiarConsentimiento(kind, otorgar)
      setActivos((a) => (otorgar ? [...a, kind] : a.filter((k) => k !== kind)))
    } catch (e) {
      setMensaje({ t: (e as Error).message, error: true })
    }
  }

  async function exportar() {
    setExportando(true)
    try {
      const blob = await exportarTodo()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `mi-legado-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(a.href)
      setMensaje({ t: 'Listo. Descargaste todos tus datos en un formato abierto.' })
    } catch (e) {
      setMensaje({ t: (e as Error).message, error: true })
    } finally {
      setExportando(false)
    }
  }

  return (
    <div className="aparecer mx-auto max-w-2xl space-y-6">
      <Titulo antetitulo="Tus datos, tus reglas" sub="Lo que es tuyo sigue siendo tuyo. Aquí ves qué hacemos con tus datos y decides.">Tu privacidad</Titulo>

      <Hoja>
        <h2 className="text-xl">Qué guardamos y dónde</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-tinta-suave">
          <li>Tus textos y recuerdos se guardan en una base de datos donde solo tu cuenta puede leerlos.</li>
          <li>Tus audios y fotos se guardan como originales en un almacenamiento privado; nunca se reemplazan ni se modifican.</li>
          <li>Nadie de tu familia ve nada si tú no lo compartes.</li>
          <li>No usamos tus recuerdos para entrenar inteligencia artificial.</li>
          <li>El micrófono solo se enciende cuando tú tocas “Empezar a grabar”.</li>
        </ul>
      </Hoja>

      <Hoja>
        <h2 className="text-xl">Permisos</h2>
        <div className="mt-4 space-y-5">
          {PERMISOS.map((p) => (
            <label key={p.kind} className="flex items-start gap-3">
              <input type="checkbox" checked={activos.includes(p.kind)} onChange={() => alternar(p.kind)} className="mt-1 h-4 w-4 accent-terracota" />
              <span>
                <span className="block font-medium">{p.nombre}</span>
                <span className="block text-sm text-tinta-suave">{p.ayuda}</span>
              </span>
            </label>
          ))}
        </div>
      </Hoja>

      <Hoja>
        <h2 className="text-xl">Llévate todo</h2>
        <p className="mt-2 text-tinta-suave">Descarga tus recuerdos, su historial y enlaces a tus archivos originales en un archivo JSON abierto.</p>
        <Boton className="mt-4" variante="suave" onClick={exportar} disabled={exportando}>{exportando ? 'Preparando…' : 'Descargar mis datos'}</Boton>
      </Hoja>

      <Hoja>
        <h2 className="text-xl">Eliminar mi cuenta</h2>
        <p className="mt-2 text-tinta-suave">
          Esta función todavía no está construida: llegará en la siguiente entrega y borrará tus datos, archivos y copias derivadas. Mientras tanto, exporta tus datos cuando quieras.
        </p>
      </Hoja>

      {mensaje && <Aviso tono={mensaje.error ? 'error' : 'info'}>{mensaje.t}</Aviso>}
      <Boton variante="texto" onClick={() => supabase.auth.signOut()}>Cerrar sesión</Boton>
    </div>
  )
}
