import { Link, NavLink, Outlet } from 'react-router-dom'
import { IconoCandado, IconoCasa, IconoHilo, IconoLibro, IconoLupa, IconoMas } from '../design-system/Iconos'
import { Logo, Marca } from '../design-system/Logo'

const DESTINOS = [
  { a: '/', nombre: 'Mi Espacio', corto: 'Inicio', Icono: IconoCasa },
  { a: '/diario', nombre: 'Mi Diario', corto: 'Diario', Icono: IconoLibro },
  { a: '/historia', nombre: 'Mi Historia', corto: 'Historia', Icono: IconoHilo },
  { a: '/buscar', nombre: 'Buscar', corto: 'Buscar', Icono: IconoLupa },
  { a: '/privacidad', nombre: 'Privacidad', corto: 'Privacidad', Icono: IconoCandado },
]

export function Marco() {
  return (
    <div className="flex min-h-dvh flex-col pb-28 md:pb-0">
      <header className="sticky top-0 z-20 border-b border-linea/60 bg-papel/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-3.5 md:px-8">
          <Link to="/" aria-label="Mi Legado Digital, inicio" className="shrink-0">
            <span className="md:hidden"><Logo size={34} /></span>
            <span className="hidden md:inline"><Logo size={40} /></span>
          </Link>
          <nav aria-label="Principal" className="hidden items-center gap-1 rounded-full border border-linea/80 bg-hoja/70 p-1 lg:flex">
            {DESTINOS.map((d) => (
              <NavLink key={d.a} to={d.a} end={d.a === '/'}
                className={({ isActive }) => `rounded-full px-4 py-2 text-[14px] font-medium transition-colors ${isActive ? 'bg-tinta text-hoja' : 'text-tinta-suave hover:text-tinta'}`}>
                {d.nombre}
              </NavLink>
            ))}
          </nav>
          <Link to="/privacidad" aria-label="Privacidad" className="grid h-10 w-10 place-items-center rounded-full border border-linea bg-hoja text-tinta-suave md:hidden">
            <IconoCandado size={19} />
          </Link>
          <Link to="/nuevo" className="hidden items-center gap-2 rounded-full bg-terracota px-5 py-2.5 text-sm font-medium text-hoja shadow-[0_6px_16px_-8px_rgba(180,83,42,0.7)] hover:bg-terracota-hondo md:inline-flex">
            <IconoMas size={18} /> Guardar un momento
          </Link>
        </div>
        {/* navegación de tableta */}
        <nav aria-label="Secciones" className="mx-auto hidden max-w-6xl gap-1 px-8 pb-3 md:flex lg:hidden">
          {DESTINOS.map((d) => (
            <NavLink key={d.a} to={d.a} end={d.a === '/'}
              className={({ isActive }) => `rounded-full px-3 py-1.5 text-[14px] ${isActive ? 'bg-tinta text-hoja' : 'text-tinta-suave hover:text-tinta'}`}>
              {d.nombre}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 md:px-8 md:py-16">
        <Outlet />
      </main>

      <footer className="mt-10 hidden border-t border-linea/70 md:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-8 py-8 text-sm text-tinta-suave">
          <span className="flex items-center gap-3"><Marca size={22} /> Una vida. Una historia. Una huella que merece permanecer.</span>
          <span>Tus recuerdos son tuyos · Nada se borra por falta de pago</span>
        </div>
      </footer>

      {/* Barra inferior en celular, con el botón central para guardar */}
      <nav aria-label="Principal" className="fixed inset-x-3 bottom-3 z-20 rounded-[28px] border border-linea/80 bg-hoja/95 px-2 pb-[max(env(safe-area-inset-bottom),6px)] pt-1.5 shadow-elevada backdrop-blur-md md:hidden">
        <ul className="grid grid-cols-5 items-end">
          {DESTINOS.slice(0, 2).map((d) => <ItemMovil key={d.a} {...d} />)}
          <li className="flex justify-center">
            <Link to="/nuevo" aria-label="Guardar un momento" className="-mt-7 grid h-14 w-14 place-items-center rounded-full bg-terracota text-hoja shadow-[0_10px_24px_-8px_rgba(180,83,42,0.8)] ring-4 ring-papel active:scale-95">
              <IconoMas size={26} />
            </Link>
          </li>
          {DESTINOS.slice(2, 4).map((d) => <ItemMovil key={d.a} {...d} />)}
        </ul>
      </nav>
    </div>
  )
}

function ItemMovil({ a, corto, Icono }: (typeof DESTINOS)[number]) {
  return (
    <li>
      <NavLink to={a} end={a === '/'} className={({ isActive }) => `flex flex-col items-center gap-0.5 py-1.5 text-[11px] font-medium ${isActive ? 'text-terracota' : 'text-tinta-suave'}`}>
        <Icono size={22} />
        {corto}
      </NavLink>
    </li>
  )
}
