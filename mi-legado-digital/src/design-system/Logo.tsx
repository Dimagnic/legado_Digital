/**
 * Marca de Mi Legado Digital: anillos de árbol (los años vividos), la semilla
 * en el centro (lo esencial de una persona) y un brote que crece a través de
 * ellos (lo que permanece y sigue vivo en otros).
 */
export function Marca({ size = 40, claro = false, className = '' }: { size?: number; claro?: boolean; className?: string }) {
  const tinta = claro ? '#F6F1E7' : '#2B2420'
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} className={className} role="img" aria-label="Mi Legado Digital">
      <g fill="none" stroke={tinta} strokeLinecap="round">
        <path d="M68.5 24.79A46 46 0 1 1 51.5 24.79" strokeWidth="4" />
        <path d="M68.5 34.08A34 34 0 1 1 51.5 34.08" strokeWidth="4.5" />
        <path d="M68.5 43.71A22 22 0 1 1 51.5 43.71" strokeWidth="5" />
      </g>
      <path d="M60 57V18" stroke="#5F7A64" strokeWidth="4" strokeLinecap="round" />
      <circle cx="60" cy="64" r="7.5" fill="#B4532A" />
      <g transform="translate(60 14) scale(0.95)">
        <path d="M0 6C1 -6 13 -14 28 -12C26 2 14 10 0 6Z" fill="#5F7A64" />
        <path d="M0 12C-2 2 -12 -4 -24 -2C-22 9 -12 15 0 12Z" fill="#8AA48E" />
      </g>
    </svg>
  )
}

export function Logo({ size = 36, claro = false, conLema = false }: { size?: number; claro?: boolean; conLema?: boolean }) {
  return (
    <span className="inline-flex items-center gap-3">
      <Marca size={size} claro={claro} />
      <span className="flex flex-col leading-none">
        <span className={`font-serif text-[21px] font-semibold tracking-[-0.01em] ${claro ? 'text-papel' : 'text-tinta'}`}>Mi Legado</span>
        <span className={`mt-1 text-[10px] font-semibold uppercase tracking-[0.32em] ${claro ? 'text-papel/70' : 'text-terracota'}`}>Digital</span>
        {conLema && <span className={`mt-3 font-serif text-sm italic ${claro ? 'text-papel/80' : 'text-tinta-suave'}`}>Pregúntale hoy. Guárdalo para siempre.</span>}
      </span>
    </span>
  )
}
