import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AreaTexto, Aviso, Boton, Campo, Entrada, Hoja, Titulo } from '../../design-system/ui'
import { IconoCamara, IconoConversacion, IconoMicrofono, IconoPluma } from '../../design-system/Iconos'
import { InsigniaTipo } from '../../design-system/tipos'
import { TIPOS_RECUERDO, construirFecha, type DatePrecision, type LifeStage, type MemoryKind } from '../../lib/dominio'
import { PREGUNTAS_ENTREVISTA, preguntaDelDia } from '../../lib/preguntas'
import { crearRecuerdo, listarEtapas } from '../../lib/recuerdos'
import { Grabadora, type Grabacion } from './Grabadora'

type Modo = 'escribir' | 'voz' | 'foto' | 'entrevista'

export function NuevoRecuerdoPage() {
  const [params] = useSearchParams()
  const nav = useNavigate()
  const [modo, setModo] = useState<Modo>((params.get('modo') as Modo) ?? 'escribir')
  const [kind, setKind] = useState<MemoryKind>((params.get('tipo') as MemoryKind) ?? 'moment')
  const [titulo, setTitulo] = useState('')
  const [relato, setRelato] = useState('')
  const [precision, setPrecision] = useState<DatePrecision>('unknown')
  const [anio, setAnio] = useState('')
  const [mes, setMes] = useState('')
  const [dia, setDia] = useState('')
  const [etapa, setEtapa] = useState('')
  const [etapas, setEtapas] = useState<LifeStage[]>([])
  const [grabacion, setGrabacion] = useState<Grabacion | null>(null)
  const [foto, setFoto] = useState<File | null>(null)
  const [pregunta, setPregunta] = useState(0)
  const [consentimiento, setConsentimiento] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listarEtapas().then(setEtapas).catch(() => setEtapas([]))
  }, [])

  const necesitaArchivo = modo === 'voz' || modo === 'entrevista' || modo === 'foto'
  const archivoListo = modo === 'foto' ? Boolean(foto) : Boolean(grabacion)
  const puedeGuardar = titulo.trim().length > 0 && (!necesitaArchivo || archivoListo) && (modo !== 'entrevista' || consentimiento)

  async function guardar(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setGuardando(true)
    try {
      const fecha = construirFecha(precision, { anio, mes, dia })
      const archivo =
        modo === 'foto' && foto
          ? { blob: foto, tipo: 'photo' as const }
          : grabacion
            ? { blob: grabacion.blob, tipo: modo === 'entrevista' ? ('interview' as const) : ('voice' as const), duracionMs: grabacion.duracionMs }
            : undefined
      const id = await crearRecuerdo(
        {
          kind,
          title: titulo,
          story: relato,
          ...fecha,
          stage_id: etapa || null,
          details: modo === 'entrevista' ? { entrevista: true, consentimiento_verbal_solicitado: true } : {},
        },
        archivo,
      )
      nav(`/recuerdo/${id}`, { replace: true })
    } catch (err) {
      setError((err as Error).message)
      setGuardando(false)
    }
  }

  const modos = [
    { id: 'escribir' as Modo, nombre: 'Escribir', Icono: IconoPluma },
    { id: 'voz' as Modo, nombre: 'Hablar', Icono: IconoMicrofono },
    { id: 'foto' as Modo, nombre: 'Una foto', Icono: IconoCamara },
    { id: 'entrevista' as Modo, nombre: 'Preguntarle a alguien', Icono: IconoConversacion },
  ]
  const Paso = ({ n, t }: { n: number; t: string }) => (
    <p className="mb-5 flex items-center gap-3 font-serif text-[22px]"><span className="grid h-8 w-8 place-items-center rounded-full bg-tinta font-sans text-sm text-hoja">{n}</span>{t}</p>
  )

  return (
    <form onSubmit={guardar} className="aparecer mx-auto max-w-3xl space-y-6">
      <Titulo antetitulo="Nuevo recuerdo" sub="No tienes que ordenarlo antes. Cuéntalo como te salga; después puedes editarlo.">Guardar un momento</Titulo>

      <Hoja>
      <Paso n={1} t="¿Cómo quieres guardarlo?" />
      <div role="tablist" aria-label="Cómo quieres guardarlo" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {modos.map((m) => (
          <button
            key={m.id}
            type="button"
            role="tab"
            aria-selected={modo === m.id}
            onClick={() => { setModo(m.id); if (m.id === 'entrevista' && !titulo) setTitulo('Conversación con ') }}
            className={`flex flex-col items-start gap-3 rounded-2xl border p-4 text-left text-[15px] font-medium transition-colors ${modo === m.id ? 'border-tinta bg-tinta text-hoja' : 'border-linea bg-papel/50 text-tinta hover:bg-papel-hondo'}`}
          >
            <m.Icono size={24} />
            {m.nombre}
          </button>
        ))}
      </div>

      {modo === 'entrevista' && (
        <div className="space-y-4 rounded-2xl bg-papel-hondo p-6">
          <h2 className="text-2xl">Pregúntale mientras puedas</h2>
          <p className="text-tinta-suave">
            Siéntate con alguien que amas y conversen. Antes de empezar, pregúntale en la grabación: <em>“¿Me das permiso de guardar esta plática?”</em>
          </p>
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" checked={consentimiento} onChange={(e) => setConsentimiento(e.target.checked)} className="mt-1 h-4 w-4 accent-terracota" />
            <span>La persona entrevistada aceptó que se grabe y se guarde esta conversación.</span>
          </label>
          <div className="rounded-xl bg-hoja p-5">
            <p className="text-xs uppercase tracking-wide text-tinta-suave">Pregunta {pregunta + 1} de {PREGUNTAS_ENTREVISTA.length}</p>
            <p className="mt-2 font-serif text-xl leading-snug">{PREGUNTAS_ENTREVISTA[pregunta]}</p>
            <div className="mt-4 flex gap-2">
              <Boton type="button" variante="suave" disabled={pregunta === 0} onClick={() => setPregunta((p) => p - 1)}>Anterior</Boton>
              <Boton type="button" variante="suave" disabled={pregunta === PREGUNTAS_ENTREVISTA.length - 1} onClick={() => setPregunta((p) => p + 1)}>Otra pregunta</Boton>
            </div>
          </div>
        </div>
      )}

      {(modo === 'voz' || (modo === 'entrevista' && consentimiento)) && <Grabadora onListo={setGrabacion} />}

      {modo === 'foto' && (
        <Campo etiqueta="Fotografía" ayuda="Se guarda el archivo original sin modificarlo.">
          <Entrada type="file" accept="image/*" onChange={(e) => setFoto(e.target.files?.[0] ?? null)} />
        </Campo>
      )}

      </Hoja>

      <Hoja>
      <Paso n={2} t="¿Qué es?" />
      <fieldset>
        <legend className="sr-only">¿Qué es?</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {(Object.keys(TIPOS_RECUERDO) as MemoryKind[]).map((k) => (
            <label key={k} className={`flex cursor-pointer gap-3 rounded-2xl border p-3.5 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-terracota ${kind === k ? 'border-terracota bg-terracota-claro/50' : 'border-linea bg-papel/40 hover:bg-papel-hondo/60'}`}>
              <input type="radio" name="tipo" value={k} checked={kind === k} onChange={() => setKind(k)} className="sr-only" />
              <InsigniaTipo kind={k} size={38} />
              <span>
                <span className="block font-medium">{TIPOS_RECUERDO[k].nombre}</span>
                <span className="block text-sm text-tinta-suave">{TIPOS_RECUERDO[k].ayuda}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      </Hoja>

      <Hoja className="space-y-7">
      <Paso n={3} t="Cuéntalo" />
      <Campo etiqueta="Ponle un nombre">
        <Entrada value={titulo} onChange={(e) => setTitulo(e.target.value)} maxLength={160} placeholder={kind === 'recipe' ? 'El mole de la abuela' : 'El día que…'} required />
      </Campo>

      <Campo etiqueta={modo === 'escribir' ? 'Cuéntalo' : 'Notas (opcional)'} ayuda={modo === 'escribir' ? preguntaDelDia() : undefined}>
        <AreaTexto value={relato} onChange={(e) => setRelato(e.target.value)} placeholder="Escribe con tus palabras…" />
      </Campo>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">¿Cuándo fue? <span className="font-normal text-tinta-suave">Basta con lo que recuerdes.</span></legend>
        <div className="flex flex-wrap gap-2">
          <select value={precision} onChange={(e) => setPrecision(e.target.value as DatePrecision)} className="rounded-xl border border-linea bg-hoja px-3 py-3">
            <option value="unknown">No sé / no importa</option>
            <option value="approx">Más o menos en un año</option>
            <option value="decade">En una década</option>
            <option value="year">En un año exacto</option>
            <option value="month">En un mes</option>
            <option value="day">En un día exacto</option>
          </select>
          {precision !== 'unknown' && <Entrada aria-label="Año" inputMode="numeric" placeholder="Año" value={anio} onChange={(e) => setAnio(e.target.value)} className="w-28" />}
          {(precision === 'month' || precision === 'day') && <Entrada aria-label="Mes" inputMode="numeric" placeholder="Mes" value={mes} onChange={(e) => setMes(e.target.value)} className="w-24" />}
          {precision === 'day' && <Entrada aria-label="Día" inputMode="numeric" placeholder="Día" value={dia} onChange={(e) => setDia(e.target.value)} className="w-24" />}
        </div>
      </fieldset>

      {etapas.length > 0 && (
        <Campo etiqueta="Etapa de tu vida (opcional)">
          <select value={etapa} onChange={(e) => setEtapa(e.target.value)} className="w-full rounded-xl border border-linea bg-hoja px-3 py-3">
            <option value="">Sin etapa</option>
            {etapas.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </Campo>
      )}

      </Hoja>

      {kind === 'reassurance' && <Aviso>Este mensaje queda sellado y privado. Por ahora solo tú lo ves; más adelante podrás elegir a quién y cuándo entregarlo.</Aviso>}
      {error && <Aviso tono="error">{error}</Aviso>}

      <div className="sticky bottom-24 z-10 flex items-center gap-3 rounded-full border border-linea bg-hoja/95 p-2 shadow-elevada backdrop-blur md:bottom-6">
        <Boton type="submit" className="flex-1 sm:flex-none" disabled={!puedeGuardar || guardando}>{guardando ? 'Guardando…' : 'Guardar recuerdo'}</Boton>
        <Boton type="button" variante="texto" onClick={() => nav(-1)}>Cancelar</Boton>
      </div>
    </form>
  )
}
