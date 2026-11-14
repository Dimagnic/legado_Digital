import { Link } from 'react-router-dom'
import { IconoCandado } from '../../design-system/Iconos'
import { InsigniaTipo } from '../../design-system/tipos'
import { TIPOS_RECUERDO, fechaHumana, type Memory } from '../../lib/dominio'

export function TarjetaRecuerdo({ r }: { r: Memory }) {
  return (
    <Link to={`/recuerdo/${r.id}`} className="group flex gap-4 border-b border-linea/70 py-5 first:pt-0 last:border-0 last:pb-0">
      <InsigniaTipo kind={r.kind} />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2 text-[13px] text-tinta-suave">
          <span>{TIPOS_RECUERDO[r.kind].nombre}</span>
          <span aria-hidden>·</span>
          <span>{fechaHumana(r.occurred_on, r.occurred_precision)}</span>
          {r.is_sealed && <span className="inline-flex items-center gap-1 text-[#8a6620]"><IconoCandado size={13} /> Sellado</span>}
          {r.is_demo && <span className="rounded-full bg-miel-claro px-2 text-[11px]">Demostración</span>}
        </span>
        <span className="mt-1 block font-serif text-[21px] leading-snug transition-colors group-hover:text-terracota">{r.title}</span>
        {r.story && !r.is_sealed && <span className="mt-1 line-clamp-2 block text-tinta-suave">{r.story}</span>}
      </span>
    </Link>
  )
}
