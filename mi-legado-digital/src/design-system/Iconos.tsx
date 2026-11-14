import type { SVGProps } from 'react'

/** Íconos de trazo fino, dibujados para la app (24×24). */
type P = SVGProps<SVGSVGElement> & { size?: number }

function Base({ size = 22, children, ...p }: P) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden {...p}>
      {children}
    </svg>
  )
}

export const IconoCasa = (p: P) => <Base {...p}><path d="M4 11.5 12 5l8 6.5" /><path d="M6 10v9h12v-9" /><path d="M10 19v-5h4v5" /></Base>
export const IconoLibro = (p: P) => <Base {...p}><path d="M12 6.5C10 5 7 4.5 4 5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V5c-3-.5-6 0-8 1.5Z" /><path d="M12 6.5v13" /></Base>
export const IconoHilo = (p: P) => <Base {...p}><path d="M5 4v16" /><circle cx="5" cy="7" r="1.6" fill="currentColor" /><circle cx="5" cy="13" r="1.6" fill="currentColor" /><path d="M9 7h10M9 13h7M9 19h9" /></Base>
export const IconoLupa = (p: P) => <Base {...p}><circle cx="11" cy="11" r="6" /><path d="m20 20-4.5-4.5" /></Base>
export const IconoCandado = (p: P) => <Base {...p}><rect x="5" y="10.5" width="14" height="9.5" rx="2" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /><path d="M12 14.5v2" /></Base>
export const IconoMas = (p: P) => <Base {...p}><path d="M12 5v14M5 12h14" /></Base>
export const IconoPluma = (p: P) => <Base {...p}><path d="M5 19c3-1 9-4 12.5-10.5C19 5.5 18 4 18 4s-1.5-1-4.5.5C7 8 6 14 5 19Z" /><path d="M5 19 13 11" /></Base>
export const IconoMicrofono = (p: P) => <Base {...p}><rect x="9" y="3.5" width="6" height="11" rx="3" /><path d="M6 11.5a6 6 0 0 0 12 0" /><path d="M12 17.5v3" /></Base>
export const IconoCamara = (p: P) => <Base {...p}><path d="M4 8.5h3l1.5-2.5h7L17 8.5h3V19H4z" /><circle cx="12" cy="13.5" r="3.2" /></Base>
export const IconoConversacion = (p: P) => <Base {...p}><path d="M4 6h10v7H8l-4 3z" /><path d="M14 9h6v7l-3-2h-5v-1" /></Base>
export const IconoOlla = (p: P) => <Base {...p}><path d="M4 10h16" /><path d="M5.5 10v6a3 3 0 0 0 3 3h7a3 3 0 0 0 3-3v-6" /><path d="M9 6.5c0-1 1-1.5 1-2.5M13 6.5c0-1 1-1.5 1-2.5" /><path d="M2.5 11.5h2M19.5 11.5h2" /></Base>
export const IconoSobre = (p: P) => <Base {...p}><rect x="3.5" y="6" width="17" height="12" rx="1.5" /><path d="m4 7 8 6 8-6" /></Base>
export const IconoOnda = (p: P) => <Base {...p}><path d="M4 12h1.5M8 8v8M11 5v14M14 9v6M17 7v10M20 11v2" /></Base>
export const IconoHoja = (p: P) => <Base {...p}><path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14" /><path d="M5 19 13 11" /></Base>
export const IconoFlecha = (p: P) => <Base {...p}><path d="M5 12h14M13 6l6 6-6 6" /></Base>
export const IconoCorazon = (p: P) => <Base {...p}><path d="M12 19s-7-4.4-7-9.5A3.8 3.8 0 0 1 12 7.3a3.8 3.8 0 0 1 7 2.2C19 14.6 12 19 12 19Z" /></Base>
export const IconoX = (p: P) => <Base {...p}><path d="M6 6l12 12M18 6 6 18" /></Base>
export const IconoCorreo = (p: P) => <Base {...p}><rect x="3.5" y="5.5" width="17" height="13" rx="2" /><path d="m4.5 7 7.5 6 7.5-6" /></Base>
export const IconoUsuario = (p: P) => <Base {...p}><circle cx="12" cy="8.5" r="3.5" /><path d="M5 19.5c1.2-3.3 3.8-5 7-5s5.8 1.7 7 5" /></Base>
export const IconoCheck = (p: P) => <Base {...p}><path d="m5 12.5 4.5 4.5L19 7.5" /></Base>
export function IconoOjo({ tachado = false, ...p }: P & { tachado?: boolean }) {
  return (
    <Base {...p}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
      {tachado && <path d="M4 4l16 16" />}
    </Base>
  )
}
