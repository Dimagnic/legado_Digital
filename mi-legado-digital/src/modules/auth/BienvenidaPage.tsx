import { useState, type FormEvent } from 'react'
import { Aviso, Boton, Campo, Entrada } from '../../design-system/ui'
import { ETAPAS_SUGERIDAS } from '../../lib/dominio'
import { Marca } from '../../design-system/Logo'
import { completarBienvenida } from '../../lib/recuerdos'

/** Tres preguntas suaves y omitibles. */
export function BienvenidaPage({ onListo, nombreInicial = '' }: { onListo: () => void; nombreInicial?: string }) {
  const [nombre, setNombre] = useState(nombreInicial)
  const [anio, setAnio] = useState('')
  const [etapas, setEtapas] = useState<string[]>(ETAPAS_SUGERIDAS)
  const [nueva, setNueva] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  async function continuar(e: FormEvent) {
    e.preventDefault()
    setGuardando(true)
    try {
      const n = Number(anio)
      await completarBienvenida(nombre, Number.isInteger(n) && n > 1900 ? n : null, etapas)
      onListo()
    } catch (err) {
      setError((err as Error).message)
      setGuardando(false)
    }
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-14">
      <form onSubmit={continuar} className="aparecer space-y-8">
        <header>
          <Marca size={64} />
          <h1 className="mt-6 text-[40px] leading-tight">Te damos la bienvenida</h1>
          <p className="mt-3 text-tinta-suave">Este es un lugar para tu historia. Todo lo de esta pantalla es opcional.</p>
        </header>
        <Campo etiqueta="¿Cómo te gusta que te llamen?">
          <Entrada value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={80} />
        </Campo>
        <Campo etiqueta="¿En qué año naciste?" ayuda="Solo sirve para ordenar tu línea de vida.">
          <Entrada inputMode="numeric" value={anio} onChange={(e) => setAnio(e.target.value)} className="w-32" />
        </Campo>
        <fieldset>
          <legend className="text-sm font-medium">¿Cómo divides tu vida?</legend>
          <p className="mt-0.5 text-sm text-tinta-suave">Quita, agrega o nombra las etapas a tu manera: “Cuando vivía en Puebla”, “Los años del taller”…</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {etapas.map((e) => (
              <li key={e} className="flex items-center gap-1 rounded-full border border-linea bg-hoja py-1 pl-4 pr-2">
                {e}
                <button type="button" aria-label={`Quitar ${e}`} onClick={() => setEtapas((s) => s.filter((x) => x !== e))} className="rounded-full px-2 text-tinta-suave hover:text-terracota">×</button>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex gap-2">
            <Entrada value={nueva} onChange={(e) => setNueva(e.target.value)} placeholder="Nueva etapa" maxLength={60} />
            <Boton type="button" variante="suave" onClick={() => { if (nueva.trim() && !etapas.includes(nueva.trim())) setEtapas((s) => [...s, nueva.trim()]); setNueva('') }}>Agregar</Boton>
          </div>
        </fieldset>
        {error && <Aviso tono="error">{error}</Aviso>}
        <Boton type="submit" disabled={guardando}>{guardando ? 'Guardando…' : 'Empezar'}</Boton>
      </form>
    </main>
  )
}
