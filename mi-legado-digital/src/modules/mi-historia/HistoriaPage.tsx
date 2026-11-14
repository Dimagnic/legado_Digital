import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Titulo } from '../../design-system/ui'
import { fechaHumana, type LifeStage, type Memory } from '../../lib/dominio'
import { listarEtapas, listarRecuerdos } from '../../lib/recuerdos'

/** Línea de vida: por etapas que la persona eligió y, dentro de cada una, por fecha. */
export function HistoriaPage() {
  const [etapas, setEtapas] = useState<LifeStage[]>([])
  const [recuerdos, setRecuerdos] = useState<Memory[]>([])

  useEffect(() => {
    listarEtapas().then(setEtapas).catch(() => {})
    listarRecuerdos().then(setRecuerdos).catch(() => {})
  }, [])

  const porFecha = (a: Memory, b: Memory) => (a.occurred_on ?? '9999').localeCompare(b.occurred_on ?? '9999')
  const grupos = [
    ...etapas.map((e) => ({ id: e.id, nombre: e.name, items: recuerdos.filter((r) => r.stage_id === e.id).sort(porFecha) })),
    { id: 'sin', nombre: 'Aún sin etapa', items: recuerdos.filter((r) => !r.stage_id).sort(porFecha) },
  ].filter((g) => g.items.length > 0)

  return (
    <div className="aparecer">
      <Titulo sub="Tu vida ordenada como tú la dividiste. Las fechas muestran solo lo que recuerdas con certeza.">Mi Historia</Titulo>
      {grupos.length === 0 && <p className="text-tinta-suave">Cuando guardes recuerdos, aquí irá apareciendo el hilo de tu vida.</p>}
      <ol className="relative space-y-12 border-l border-linea pl-8">
        {grupos.map((g) => (
          <li key={g.id}>
            <span aria-hidden className="absolute -left-[5px] mt-3 h-2.5 w-2.5 rounded-full bg-terracota" />
            <h2 className="text-2xl">{g.nombre}</h2>
            <ul className="mt-4 space-y-4">
              {g.items.map((r) => (
                <li key={r.id}>
                  <Link to={`/recuerdo/${r.id}`} className="group block">
                    <span className="text-sm text-tinta-suave">{fechaHumana(r.occurred_on, r.occurred_precision)}</span>
                    <span className="block font-serif text-lg group-hover:text-terracota">{r.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  )
}
