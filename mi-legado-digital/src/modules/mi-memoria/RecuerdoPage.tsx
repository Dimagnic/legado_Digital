import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AreaTexto, Aviso, Boton, Entrada, Hoja, Procedencia } from '../../design-system/ui'
import { InsigniaTipo } from '../../design-system/tipos'
import { TIPOS_RECUERDO, fechaHumana, tamanoHumano, type Memory } from '../../lib/dominio'
import { editarRecuerdo, enlaceOriginal, obtenerRecuerdo, type Fuente } from '../../lib/recuerdos'

function Original({ f }: { f: NonNullable<Fuente['asset']> }) {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    enlaceOriginal(f.storage_path).then(setUrl).catch(() => setUrl(null))
  }, [f.storage_path])
  return (
    <div className="space-y-2">
      {url && f.mime_type.startsWith('audio/') && <audio controls src={url} className="w-full" />}
      {url && f.mime_type.startsWith('image/') && <img src={url} alt="Fotografía original" className="max-h-[480px] w-full rounded-xl object-contain" />}
      <p className="text-xs text-tinta-suave">
        Archivo original · {tamanoHumano(f.size_bytes)} · huella <code title={f.sha256}>{f.sha256.slice(0, 12)}…</code>
      </p>
    </div>
  )
}

export function RecuerdoPage() {
  const { id } = useParams()
  const [datos, setDatos] = useState<{ recuerdo: Memory; fuentes: Fuente[]; cambios: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [editando, setEditando] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [relato, setRelato] = useState('')

  const cargar = () => obtenerRecuerdo(id!).then((d) => { setDatos(d); setTitulo(d.recuerdo.title); setRelato(d.recuerdo.story ?? '') }).catch((e) => setError(e.message))
  useEffect(() => { cargar() }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function guardar() {
    try {
      await editarRecuerdo(id!, { title: titulo, story: relato || null })
      setEditando(false)
      await cargar()
    } catch (e) {
      setError((e as Error).message)
    }
  }

  if (error) return <Aviso tono="error">{error}</Aviso>
  if (!datos) return <p className="text-tinta-suave">Cargando…</p>
  const { recuerdo: r, fuentes, cambios } = datos
  const originales = fuentes.filter((f) => f.asset).map((f) => f.asset!)
  const entradas = fuentes.filter((f) => f.entry).map((f) => f.entry!)

  return (
    <article className="aparecer mx-auto max-w-2xl">
      <Link to="/diario" className="text-sm text-tinta-suave hover:text-terracota">← Mi Diario</Link>
      <div className="mt-8 flex items-center gap-3">
        <InsigniaTipo kind={r.kind} size={44} />
        <p className="text-sm text-tinta-suave">{TIPOS_RECUERDO[r.kind].nombre} · {fechaHumana(r.occurred_on, r.occurred_precision)}</p>
      </div>
      {editando ? (
        <div className="mt-3 space-y-4">
          <Entrada value={titulo} onChange={(e) => setTitulo(e.target.value)} maxLength={160} />
          <AreaTexto value={relato} onChange={(e) => setRelato(e.target.value)} />
          <p className="text-sm text-tinta-suave">Tu texto original se conserva en las fuentes; aquí editas el recuerdo, y cada cambio queda en el historial.</p>
          <div className="flex gap-2">
            <Boton onClick={guardar} disabled={!titulo.trim()}>Guardar cambios</Boton>
            <Boton variante="texto" onClick={() => setEditando(false)}>Cancelar</Boton>
          </div>
        </div>
      ) : (
        <>
          <h1 className="mt-5 text-[40px] leading-[1.08] md:text-[52px]">{r.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Procedencia p={r.provenance} />
            {r.is_sealed && <span className="text-xs text-tinta-suave">Sellado · solo tú lo ves</span>}
            <Boton variante="texto" onClick={() => setEditando(true)}>Editar</Boton>
          </div>
          {originales.map((a) => <div key={a.id} className="mt-6"><Original f={a} /></div>)}
          {r.story && <p className="editorial mt-8 whitespace-pre-wrap first-letter:float-left first-letter:mr-2 first-letter:font-serif first-letter:text-[64px] first-letter:leading-[0.9] first-letter:text-terracota">{r.story}</p>}
        </>
      )}

      <Hoja className="mt-10">
        <h2 className="text-lg">De dónde viene este recuerdo</h2>
        <ul className="mt-3 space-y-2 text-sm text-tinta-suave">
          {entradas.map((e) => (
            <li key={e.id}>Registrado el {new Date(e.recorded_at).toLocaleDateString('es-419', { dateStyle: 'long' })} ({e.kind === 'text' ? 'escrito' : e.kind === 'interview' ? 'entrevista grabada' : e.kind === 'voice' ? 'voz' : 'archivo'})</li>
          ))}
          <li>{cambios} {cambios === 1 ? 'versión' : 'versiones'} en el historial; ninguna se borra.</li>
        </ul>
      </Hoja>
    </article>
  )
}
