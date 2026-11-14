import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Hoja } from '../../design-system/ui'
import { tamanoHumano, type Memory, type Profile } from '../../lib/dominio'
import { preguntaDelDia } from '../../lib/preguntas'
import { almacenamientoUsado, listarRecuerdos } from '../../lib/recuerdos'
import { TarjetaRecuerdo } from '../mi-memoria/TarjetaRecuerdo'

function saludo() {
  const h = new Date().getHours()
  return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches'
}

export function MiEspacioPage({ perfil }: { perfil: Profile | null }) {
  const [recientes, setRecientes] = useState<Memory[]>([])
  const [usado, setUsado] = useState<number | null>(null)

  useEffect(() => {
    listarRecuerdos({ limite: 4 }).then(setRecientes).catch(() => setRecientes([]))
    almacenamientoUsado().then(setUsado).catch(() => setUsado(null))
  }, [])

  const pregunta = preguntaDelDia()

  return (
    <div className="aparecer space-y-10">
      <header>
        <p className="text-tinta-suave">{saludo()}{perfil?.display_name ? `, ${perfil.display_name}` : ''}.</p>
        <h1 className="mt-3 max-w-2xl text-[34px] leading-tight md:text-[44px]">{pregunta}</h1>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/nuevo" className="rounded-full bg-terracota px-5 py-2.5 font-medium text-hoja hover:bg-terracota-hondo">Responder</Link>
          <Link to="/nuevo?modo=voz" className="rounded-full border border-linea bg-hoja px-5 py-2.5 font-medium hover:bg-papel-hondo">Mejor lo digo en voz</Link>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <Link to="/nuevo?modo=entrevista" className="group rounded-2xl bg-papel-hondo p-6 hover:bg-linea/60">
          <p className="text-xs uppercase tracking-wide text-terracota">Pregúntale mientras puedas</p>
          <h2 className="mt-2 text-2xl group-hover:text-terracota">Graba una conversación con alguien que amas</h2>
          <p className="mt-2 text-tinta-suave">Te damos preguntas suaves. Lo más valioso será la tarde que pasen juntos.</p>
        </Link>
        <Link to="/nuevo?tipo=recipe" className="group rounded-2xl bg-papel-hondo p-6 hover:bg-linea/60">
          <p className="text-xs uppercase tracking-wide text-salvia">Lo que sabía hacer</p>
          <h2 className="mt-2 text-2xl group-hover:text-terracota">Una receta, un remedio, un dicho</h2>
          <p className="mt-2 text-tinta-suave">Para que en tu familia se siga haciendo como se hacía.</p>
        </Link>
      </section>

      <section>
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="text-2xl">Lo más reciente</h2>
          <Link to="/diario" className="text-sm text-terracota">Ver todo</Link>
        </div>
        <Hoja>
          {recientes.length === 0 ? (
            <p className="py-4 text-tinta-suave">Aquí aparecerán tus recuerdos. No hay prisa.</p>
          ) : (
            recientes.map((r) => <TarjetaRecuerdo key={r.id} r={r} />)
          )}
        </Hoja>
      </section>

      <footer className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-tinta-suave">
        {usado !== null && <span>Archivos guardados: {tamanoHumano(usado)}</span>}
        <Link to="/privacidad" className="underline">Tu privacidad y tus datos</Link>
      </footer>
    </div>
  )
}
