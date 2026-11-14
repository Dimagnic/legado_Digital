import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { PROCEDENCIA, type Provenance } from '../lib/dominio'

type Variante = 'principal' | 'suave' | 'texto'

export function Boton({ variante = 'principal', className = '', ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: Variante }) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[15px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
  const estilos: Record<Variante, string> = {
    principal: 'bg-terracota text-hoja hover:bg-terracota-hondo',
    suave: 'bg-hoja text-tinta border border-linea hover:bg-papel-hondo',
    texto: 'text-terracota hover:text-terracota-hondo px-2',
  }
  return <button className={`${base} ${estilos[variante]} ${className}`} {...p} />
}

export function Campo({ etiqueta, ayuda, children }: { etiqueta: string; ayuda?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-tinta">{etiqueta}</span>
      {ayuda && <span className="mt-0.5 block text-sm text-tinta-suave">{ayuda}</span>}
      <span className="mt-2 block">{children}</span>
    </label>
  )
}

const caja = 'w-full rounded-xl border border-linea bg-hoja px-4 py-3 text-[16px] text-tinta placeholder:text-tinta-suave/60 focus:border-terracota focus:outline-none'

export function Entrada(p: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...p} className={`${caja} ${p.className ?? ''}`} />
}

export function AreaTexto(p: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...p} className={`${caja} min-h-40 resize-y font-serif text-[18px] leading-relaxed ${p.className ?? ''}`} />
}

export function Hoja({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-linea bg-hoja p-6 shadow-[0_1px_0_rgba(43,36,32,0.04)] ${className}`}>{children}</div>
}

export function Procedencia({ p }: { p: Provenance }) {
  const ia = p === 'ai_interpretation'
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs ${ia ? 'bg-miel/15 text-tinta' : 'bg-salvia/12 text-salvia'}`}>
      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${ia ? 'bg-miel' : 'bg-salvia'}`} />
      {PROCEDENCIA[p]}
    </span>
  )
}

export function Aviso({ children, tono = 'info' }: { children: ReactNode; tono?: 'info' | 'error' }) {
  return (
    <p role={tono === 'error' ? 'alert' : 'status'} className={`rounded-xl px-4 py-3 text-sm ${tono === 'error' ? 'bg-terracota/10 text-terracota-hondo' : 'bg-salvia/10 text-salvia'}`}>
      {children}
    </p>
  )
}

export function Titulo({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <header className="mb-8">
      <h1 className="text-[32px] leading-tight md:text-[40px]">{children}</h1>
      {sub && <p className="mt-2 max-w-xl text-tinta-suave">{sub}</p>}
    </header>
  )
}
