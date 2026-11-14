import type { ComponentType, SVGProps } from 'react'
import type { MemoryKind } from '../lib/dominio'
import { IconoCorazon, IconoHilo, IconoHoja, IconoOlla, IconoOnda, IconoPluma, IconoSobre } from './Iconos'

type Icono = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>

/** Cada tipo de recuerdo tiene su ícono y su color, para reconocerlo de un vistazo. */
export const ESTILO_TIPO: Record<MemoryKind, { Icono: Icono; fondo: string; tinta: string }> = {
  moment: { Icono: IconoPluma, fondo: 'bg-terracota-claro', tinta: 'text-terracota-hondo' },
  recipe: { Icono: IconoOlla, fondo: 'bg-salvia-claro', tinta: 'text-salvia' },
  remedy: { Icono: IconoHoja, fondo: 'bg-salvia-claro', tinta: 'text-salvia' },
  saying: { Icono: IconoHilo, fondo: 'bg-salvia-claro', tinta: 'text-salvia' },
  craft: { Icono: IconoCorazon, fondo: 'bg-salvia-claro', tinta: 'text-salvia' },
  reassurance: { Icono: IconoSobre, fondo: 'bg-miel-claro', tinta: 'text-[#8a6620]' },
  phrase: { Icono: IconoOnda, fondo: 'bg-miel-claro', tinta: 'text-[#8a6620]' },
}

export function InsigniaTipo({ kind, size = 40 }: { kind: MemoryKind; size?: number }) {
  const { Icono, fondo, tinta } = ESTILO_TIPO[kind]
  return (
    <span className={`inline-grid shrink-0 place-items-center rounded-2xl ${fondo} ${tinta}`} style={{ width: size, height: size }}>
      <Icono size={Math.round(size * 0.5)} />
    </span>
  )
}
