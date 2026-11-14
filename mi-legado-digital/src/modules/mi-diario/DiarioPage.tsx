import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Aviso, Hoja, Titulo } from '../../design-system/ui'
import type { Memory, MemoryKind } from '../../lib/dominio'
import { listarRecuerdos } from '../../lib/recuerdos'
import { TarjetaRecuerdo } from '../mi-memoria/TarjetaRecuerdo'

const FILTROS: { nombre: string; tipos?: MemoryKind[] }[] = [
  { nombre: 'Todo' },
  { nombre: 'Momentos', tipos: ['moment'] },
  { nombre: 'Lo que sabía hacer', tipos: ['recipe', 'remedy', 'saying', 'craft'] },
  { nombre: 'Sus palabras', tipos: ['phrase'] },
  { nombre: 'Lo que quiero que sepan', tipos: ['reassurance'] },
]

export function DiarioPage() {
  const [filtro, setFiltro] = useState(0)
  const [recuerdos, setRecuerdos] = useState<Memory[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setRecuerdos(null)
    listarRecuerdos({ tipos: FILTROS[filtro].tipos }).then(setRecuerdos).catch((e) => setError(e.message))
  }, [filtro])

  return (
    <div className="aparecer">
      <Titulo antetitulo="Tu registro" sub="Todo lo que has guardado, del más reciente al más antiguo." accion={<Link to="/nuevo" className="inline-flex items-center gap-2 rounded-full bg-terracota px-5 py-3 text-[15px] font-medium text-hoja hover:bg-terracota-hondo">Guardar un momento</Link>}>Mi Diario</Titulo>
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {FILTROS.map((f, i) => (
          <button key={f.nombre} onClick={() => setFiltro(i)} aria-pressed={filtro === i}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${filtro === i ? 'border-tinta bg-tinta text-hoja' : 'border-linea bg-hoja/70 text-tinta-suave hover:text-tinta'}`}>
            {f.nombre}
          </button>
        ))}
      </div>
      {error && <Aviso tono="error">{error}</Aviso>}
      <Hoja>
        {recuerdos === null && !error && <p className="text-tinta-suave">Cargando…</p>}
        {recuerdos?.length === 0 && (
          <p className="py-6 text-center text-tinta-suave">
            Todavía no hay nada aquí. <Link to="/nuevo" className="text-terracota underline">Guarda tu primer momento</Link>.
          </p>
        )}
        {recuerdos?.map((r) => <TarjetaRecuerdo key={r.id} r={r} />)}
      </Hoja>
    </div>
  )
}
