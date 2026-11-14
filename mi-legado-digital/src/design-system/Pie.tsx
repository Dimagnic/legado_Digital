import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { IconoFlecha, IconoSobre } from './Iconos'
import { Logo } from './Logo'

/** Franja decorativa: anillos de vida y brotes, como un bordado que se repite. */
function Franja() {
  const patron = encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='56' height='28' viewBox='0 0 56 28'>` +
      `<rect width='56' height='28' fill='#F6F1E7'/>` +
      `<circle cx='14' cy='14' r='8' fill='none' stroke='#B4532A' stroke-width='2'/>` +
      `<circle cx='14' cy='14' r='3' fill='#B4532A'/>` +
      `<path d='M42 21V9' stroke='#5F7A64' stroke-width='2' stroke-linecap='round'/>` +
      `<path d='M42 10c1-4 4-6 8-5-1 4-4 6-8 5z' fill='#5F7A64'/>` +
      `<path d='M42 13c-1-3-4-5-7-4 1 3 4 5 7 4z' fill='#8AA48E'/>` +
      `<circle cx='0' cy='0' r='2' fill='#C99A3D'/><circle cx='56' cy='0' r='2' fill='#C99A3D'/>` +
      `<circle cx='0' cy='28' r='2' fill='#C99A3D'/><circle cx='56' cy='28' r='2' fill='#C99A3D'/>` +
      `<circle cx='28' cy='0' r='2' fill='#C99A3D'/><circle cx='28' cy='28' r='2' fill='#C99A3D'/>` +
      `</svg>`,
  )
  return (
    <div aria-hidden className="border-y-4 border-tinta">
      <div className="h-7 w-full" style={{ backgroundImage: `url("data:image/svg+xml,${patron}")`, backgroundSize: '56px 28px' }} />
    </div>
  )
}

function Columna({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-serif text-[22px] text-papel">{titulo}</h2>
      <div className="mt-5 space-y-3.5 text-[15px] text-papel/75">{children}</div>
    </div>
  )
}

const enlace = 'block transition-colors hover:text-papel'

/**
 * Pie de página. `publico` cambia los enlaces de la app por los de la portada.
 */
export function Pie({ publico = false, onEntrar }: { publico?: boolean; onEntrar?: () => void }) {
  const [verArriba, setVerArriba] = useState(false)
  useEffect(() => {
    const f = () => setVerArriba(window.scrollY > 600)
    f()
    window.addEventListener('scroll', f, { passive: true })
    return () => window.removeEventListener('scroll', f)
  }, [])

  return (
    <footer className={`mt-20 bg-tinta text-papel ${publico ? "" : "pb-24 md:pb-0"}`}>
      <Franja />
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 md:grid-cols-2 md:px-8 lg:grid-cols-[1.3fr_1fr_1fr_1.1fr]">
        <div>
          <Logo size={44} claro />
          <p className="mt-6 max-w-xs text-[15px] leading-relaxed text-papel/75">
            Una plataforma para preservar la historia de una vida con su propia voz, y compartirla con quienes amas.
          </p>
          <p className="mt-5 font-serif text-[17px] italic text-papel/90">Pregúntale hoy. Guárdalo para siempre.</p>
        </div>

        <Columna titulo="Tu historia">
          {publico ? (
            <>
              <button onClick={onEntrar} className={enlace}>Crear una cuenta</button>
              <button onClick={onEntrar} className={enlace}>Ya tengo una cuenta</button>
            </>
          ) : (
            <>
              <Link to="/" className={enlace}>Mi Espacio</Link>
              <Link to="/diario" className={enlace}>Mi Diario</Link>
              <Link to="/historia" className={enlace}>Mi Historia</Link>
              <Link to="/nuevo?modo=entrevista" className={enlace}>Pregúntale mientras puedas</Link>
              <Link to="/buscar" className={enlace}>Buscar</Link>
            </>
          )}
        </Columna>

        <Columna titulo="Tu cuenta">
          {publico ? (
            <>
              <p>Plan gratuito, sin tarjeta</p>
              <p>Planes desde $79 MXN al mes</p>
              <p>Exporta todo cuando quieras</p>
            </>
          ) : (
            <>
              <Link to="/planes" className={enlace}>Planes y suscripción</Link>
              <Link to="/cuenta" className={enlace}>Mi cuenta</Link>
              <Link to="/privacidad" className={enlace}>Privacidad y mis datos</Link>
              <Link to="/privacidad" className={enlace}>Descargar mis recuerdos</Link>
            </>
          )}
        </Columna>

        <div>
          <h2 className="font-serif text-[22px] text-papel">Regala una historia</h2>
          <div className="mt-5 rounded-3xl bg-papel p-5 text-tinta">
            <IconoSobre size={26} className="text-terracota" />
            <p className="mt-3 font-serif text-[19px] leading-snug">El mejor regalo para tus papás o tus abuelos: que su historia no se pierda.</p>
            {publico ? (
              <button onClick={onEntrar} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-terracota">Empieza gratis <IconoFlecha size={16} /></button>
            ) : (
              <Link to="/planes#regalo" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-terracota">Ver cómo regalar <IconoFlecha size={16} /></Link>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="border-t border-papel/15 py-8">
          <p className="max-w-3xl text-[13px] leading-relaxed text-papel/55">
            Tus recuerdos son privados y te pertenecen. No los vendemos ni los usamos para entrenar inteligencia artificial.
            Si tu suscripción vence, tu cuenta queda en solo lectura: nada se borra por falta de pago.
            Precios en pesos mexicanos con IVA incluido.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-5">
            <p className="text-sm text-papel/75">© {new Date().getFullYear()} Mi Legado Digital</p>
            {!publico && <Link to="/privacidad" className="text-sm text-papel/75 underline underline-offset-4 hover:text-papel">Aviso de privacidad</Link>}
            <span className="inline-flex items-center gap-3 rounded-full bg-hoja py-2 pl-5 pr-4 text-sm text-tinta">
              Diseñado por <img src="/cero-mas.png" alt="Cero+" className="h-6 w-auto" />
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        aria-label="Volver arriba"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-28 right-5 z-30 grid h-12 w-12 place-items-center rounded-full bg-tinta text-papel shadow-elevada ring-1 ring-papel/20 transition-all hover:bg-terracota md:bottom-8 md:right-8 ${verArriba ? 'opacity-100' : 'pointer-events-none translate-y-3 opacity-0'}`}
      >
        <IconoFlecha size={20} className="-rotate-90" />
      </button>
    </footer>
  )
}
