import { useEffect, useRef, useState } from 'react'
import { Boton } from '../../design-system/ui'

export interface Grabacion {
  blob: Blob
  duracionMs: number
}

/**
 * Grabación siempre voluntaria y visible: el micrófono solo se enciende al tocar
 * "Empezar a grabar" y se apaga por completo al detener. No hay escucha ambiental.
 */
export function Grabadora({ onListo }: { onListo: (g: Grabacion | null) => void }) {
  const [estado, setEstado] = useState<'inactivo' | 'grabando' | 'listo' | 'error'>('inactivo')
  const [segundos, setSegundos] = useState(0)
  const [url, setUrl] = useState<string | null>(null)
  const grabador = useRef<MediaRecorder | null>(null)
  const inicio = useRef(0)
  const trozos = useRef<Blob[]>([])

  useEffect(() => {
    if (estado !== 'grabando') return
    const t = setInterval(() => setSegundos(Math.floor((Date.now() - inicio.current) / 1000)), 250)
    return () => clearInterval(t)
  }, [estado])

  useEffect(() => () => {
    grabador.current?.stream.getTracks().forEach((t) => t.stop())
    if (url) URL.revokeObjectURL(url)
  }, [url])

  async function empezar() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'].find((m) => MediaRecorder.isTypeSupported(m))
      const r = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined)
      trozos.current = []
      r.ondataavailable = (e) => e.data.size && trozos.current.push(e.data)
      r.onstop = () => {
        stream.getTracks().forEach((t) => t.stop()) // apaga el micrófono de verdad
        const blob = new Blob(trozos.current, { type: r.mimeType })
        const duracionMs = Date.now() - inicio.current
        setUrl(URL.createObjectURL(blob))
        setEstado('listo')
        onListo({ blob, duracionMs })
      }
      grabador.current = r
      inicio.current = Date.now()
      setSegundos(0)
      r.start(1000)
      setEstado('grabando')
    } catch {
      setEstado('error')
    }
  }

  function detener() {
    grabador.current?.stop()
  }

  function descartar() {
    if (url) URL.revokeObjectURL(url)
    setUrl(null)
    setEstado('inactivo')
    onListo(null)
  }

  const mmss = `${Math.floor(segundos / 60)}:${String(segundos % 60).padStart(2, '0')}`

  return (
    <div className="rounded-2xl border border-linea bg-papel p-5">
      {estado === 'inactivo' && (
        <Boton type="button" onClick={empezar}>
          <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-hoja" /> Empezar a grabar
        </Boton>
      )}
      {estado === 'grabando' && (
        <div className="flex flex-wrap items-center gap-4" role="status" aria-live="polite">
          <span className="flex items-center gap-2 font-medium text-terracota">
            <span aria-hidden className="h-3 w-3 animate-pulse rounded-full bg-terracota" /> Grabando · {mmss}
          </span>
          <Boton type="button" variante="suave" onClick={detener}>Detener</Boton>
          <span className="w-full text-sm text-tinta-suave">El micrófono está encendido solo mientras ves este aviso.</span>
        </div>
      )}
      {estado === 'listo' && url && (
        <div className="space-y-3">
          <audio controls src={url} className="w-full" />
          <Boton type="button" variante="texto" onClick={descartar}>Descartar y volver a grabar</Boton>
        </div>
      )}
      {estado === 'error' && (
        <p className="text-sm text-terracota-hondo">
          No pude usar el micrófono. Revisa el permiso del navegador; si prefieres, también puedes escribir.
        </p>
      )}
    </div>
  )
}
