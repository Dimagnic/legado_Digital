import { NavLink, Link, Outlet } from 'react-router-dom'

const DESTINOS = [
  { a: '/', nombre: 'Mi Espacio' },
  { a: '/diario', nombre: 'Mi Diario' },
  { a: '/historia', nombre: 'Mi Historia' },
  { a: '/buscar', nombre: 'Buscar' },
  { a: '/privacidad', nombre: 'Privacidad' },
]

const enlace = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-3 py-2 text-[15px] ${isActive ? 'bg-tinta text-hoja' : 'text-tinta-suave hover:text-tinta'}`

export function Marco() {
  return (
    <div className="min-h-dvh pb-24 md:pb-0">
      <header className="sticky top-0 z-10 border-b border-linea/70 bg-papel/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-3">
          <Link to="/" className="flex items-center gap-2 font-serif text-lg">
            <img src="/favicon.svg" alt="" className="h-7 w-7" /> Mi Legado
          </Link>
          <nav aria-label="Principal" className="hidden gap-1 md:flex">
            {DESTINOS.map((d) => <NavLink key={d.a} to={d.a} end={d.a === '/'} className={enlace}>{d.nombre}</NavLink>)}
          </nav>
          <Link to="/nuevo" className="rounded-full bg-terracota px-4 py-2 text-sm font-medium text-hoja hover:bg-terracota-hondo">Guardar un momento</Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-10 md:py-14">
        <Outlet />
      </main>

      <nav aria-label="Principal" className="fixed inset-x-0 bottom-0 z-10 flex justify-around border-t border-linea bg-hoja/95 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 backdrop-blur md:hidden">
        {DESTINOS.map((d) => (
          <NavLink key={d.a} to={d.a} end={d.a === '/'} className={({ isActive }) => `px-2 py-1 text-xs ${isActive ? 'font-semibold text-terracota' : 'text-tinta-suave'}`}>
            {d.nombre.replace('Mi ', '')}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
