import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { IconoCamara, IconoConversacion, IconoFlecha, IconoMicrofono, IconoOlla, IconoPluma, IconoSobre } from '../../design-system/Iconos'
import { Marca } from '../../design-system/Logo'
import { Hoja } from '../../design-system/ui'
import { tamanoHumano, type Memory, type Profile } from '../../lib/dominio'
import { preguntaDelDia } from '../../lib/preguntas'
import { almacenamientoUsado, listarRecuerdos } from '../../lib/recuerdos'
import { TarjetaRecuerdo } from '../mi-memoria/TarjetaRecuerdo'

function saludo() {
  const h = new Date().getHours()
  return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches'
}

const FORMAS = [
  { a: '/nuevo?modo=escribir', nombre: 'Escribir', Icono: IconoPluma },
  { a: '/nuevo?modo=voz', nombre: 'Hablar', Icono: IconoMicrofono },
  { a: '/nuevo?modo=foto', nombre: 'Una foto', Icono: IconoCamara },
]

const CORAZON = [
  {
    a: '/nuevo?modo=entrevista',
    antetitulo: 'Pregúntale mientras puedas',
    titulo: 'Graba una conversación con alguien que amas',
    texto: 'Te damos preguntas suaves. Lo más valioso será la tarde que pasen juntos.',
    Icono: IconoConversacion,
    estilo: 'bg-terracota text-hoja',
    sub: 'text-hoja/80',
    ante: 'text-hoja/75',
  },
  {
    a: '/nuevo?tipo=recipe',
    antetitulo: 'Lo que sabía hacer',
    titulo: 'Una receta, un remedio, un dicho',
    texto: 'Para que en tu familia se siga haciendo como se hacía.',
    Icono: IconoOlla,
    estilo: 'bg-salvia-claro text-tinta',
    sub: 'text-tinta-suave',
    ante: 'text-salvia',
  },
  {
    a: '/nuevo?tipo=reassurance',
    antetitulo: 'Lo que quiero que sepan',
    titulo: 'Un mensaje de paz para quienes se quedan',
    texto: 'Queda sellado y privado. Tú decides cuándo y para quién.',
    Icono: IconoSobre,
    estilo: 'bg-miel-claro text-tinta',
    sub: 'text-tinta-suave',
    ante: 'text-[#8a6620]',
  },
]

export function MiEspacioPage({ perfil }: { perfil: Profile | null }) {
  const [recientes, setRecientes] = useState<Memory[] | null>(null)
  const [usado, setUsado] = useState<number | null>(null)

  useEffect(() => {
    listarRecuerdos({ limite: 5 }).then(setRecientes).catch(() => setRecientes([]))
    almacenamientoUsado().then(setUsado).catch(() => setUsado(null))
  }, [])

  const hoy = new Date().toLocaleDateString('es-419', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="space-y-16 md:space-y-20">
      {/* Pregunta del día */}
      <section className="aparecer relative overflow-hidden rounded-[32px] border border-linea/80 bg-hoja px-6 py-10 shadow-hoja md:px-14 md:py-16">
        <Marca size={260} className="pointer-events-none absolute -right-16 -top-10 opacity-[0.06] md:-right-6 md:top-auto md:-bottom-16" />
        <p className="etiqueta text-tinta-suave first-letter:uppercase">{hoy}</p>
        <p className="mt-4 text-[17px] text-tinta-suave">{saludo()}{perfil?.display_name ? `, ${perfil.display_name}` : ''}. Hoy te preguntamos:</p>
        <h1 className="mt-3 max-w-3xl text-[34px] leading-[1.1] md:text-[56px]">
          <span className="text-terracota">“</span>{preguntaDelDia()}<span className="text-terracota">”</span>
        </h1>
        <div className="mt-9 flex flex-wrap gap-3">
          {FORMAS.map(({ a, nombre, Icono }, i) => (
            <Link key={a} to={a}
              className={`inline-flex items-center gap-2.5 rounded-full px-5 py-3 text-[15px] font-medium transition-all active:scale-[0.98] ${i === 0 ? 'bg-terracota text-hoja shadow-[0_6px_16px_-8px_rgba(180,83,42,0.7)] hover:bg-terracota-hondo' : 'border border-linea bg-papel/60 hover:bg-papel-hondo'}`}>
              <Icono size={19} /> {nombre}
            </Link>
          ))}
        </div>
        <p className="mt-5 text-sm text-tinta-suave">Puedes saltarla. Mañana habrá otra.</p>
      </section>

      {/* Experiencias del corazón */}
      <section className="aparecer-2">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="etiqueta text-terracota">Para quienes amas</p>
            <h2 className="mt-2 text-[30px] md:text-[38px]">Lo que de verdad se extraña</h2>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {CORAZON.map((c) => (
            <Link key={c.a} to={c.a} className={`group flex min-h-[260px] flex-col justify-between rounded-[28px] p-7 transition-transform hover:-translate-y-0.5 ${c.estilo}`}>
              <div>
                <c.Icono size={30} />
                <p className={`etiqueta mt-6 ${c.ante}`}>{c.antetitulo}</p>
                <h3 className="mt-2 text-[24px] leading-tight">{c.titulo}</h3>
                <p className={`mt-3 ${c.sub}`}>{c.texto}</p>
              </div>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium">
                Empezar <IconoFlecha size={17} className="transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Recientes */}
      <section className="aparecer-3 grid gap-8 md:grid-cols-[1fr_280px]">
        <div>
          <div className="mb-5 flex items-baseline justify-between">
            <h2 className="text-[30px]">Lo más reciente</h2>
            <Link to="/diario" className="inline-flex items-center gap-1.5 text-sm font-medium text-terracota">Ver mi diario <IconoFlecha size={16} /></Link>
          </div>
          <Hoja>
            {recientes === null && <p className="text-tinta-suave">Cargando…</p>}
            {recientes?.length === 0 && (
              <div className="py-6 text-center">
                <Marca size={56} className="mx-auto opacity-80" />
                <p className="mt-4 font-serif text-xl">Aquí irá creciendo tu historia.</p>
                <p className="mt-1 text-tinta-suave">No hay prisa. Un recuerdo a la vez.</p>
              </div>
            )}
            {recientes?.map((r) => <TarjetaRecuerdo key={r.id} r={r} />)}
          </Hoja>
        </div>
        <aside className="space-y-4">
          <div className="rounded-3xl border border-linea/80 p-6">
            <p className="etiqueta text-tinta-suave">Tus promesas</p>
            <ul className="mt-4 space-y-3 text-[15px]">
              <li>Nunca escucharás palabras que no se dijeron.</li>
              <li>Nada se comparte sin tu permiso.</li>
              <li>Tu memoria no se borra por falta de pago.</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-linea/80 p-6 text-sm text-tinta-suave">
            {usado !== null && <p>Archivos guardados: <strong className="text-tinta">{tamanoHumano(usado)}</strong></p>}
            <Link to="/privacidad" className="mt-2 inline-block font-medium text-terracota">Tu privacidad y tus datos</Link>
          </div>
        </aside>
      </section>
    </div>
  )
}
