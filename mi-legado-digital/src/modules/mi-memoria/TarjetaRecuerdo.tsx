import { Link } from 'react-router-dom'
import { TIPOS_RECUERDO, fechaHumana, type Memory } from '../../lib/dominio'

export function TarjetaRecuerdo({ r }: { r: Memory }) {
  return (
    <Link to={`/recuerdo/${r.id}`} className="group block border-b border-linea py-5 last:border-0">
      <p className="text-xs uppercase tracking-wide text-tinta-suave">
        {TIPOS_RECUERDO[r.kind].nombre} · {fechaHumana(r.occurred_on, r.occurred_precision)}
        {r.is_sealed && ' · Sellado'}
        {r.is_demo && ' · Demostración'}
      </p>
      <h3 className="mt-1 text-xl group-hover:text-terracota">{r.title}</h3>
      {r.story && !r.is_sealed && <p className="mt-1 line-clamp-2 text-tinta-suave">{r.story}</p>}
    </Link>
  )
}
