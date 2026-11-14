import { useEffect, useState } from 'react'
import { IconoCheck, IconoSobre } from '../../design-system/Iconos'
import { Aviso, Boton, Titulo } from '../../design-system/ui'
import { tamanoHumano } from '../../lib/dominio'
import { ESTADO, PLANES, ahorroAnual, miUso, precioMxn, type MiUso, type Plan } from '../../lib/planes'

export function BarraUso({ uso }: { uso: MiUso }) {
  const pct = uso.storage_limit ? Math.min(100, (uso.storage_used / uso.storage_limit) * 100) : 0
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="text-tinta-suave">Almacenamiento</span>
        <span><strong>{tamanoHumano(uso.storage_used)}</strong> <span className="text-tinta-suave">de {tamanoHumano(uso.storage_limit)}</span></span>
      </div>
      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-papel-hondo" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
        <div className={`h-full rounded-full ${pct > 90 ? 'bg-terracota' : 'bg-salvia'}`} style={{ width: `${Math.max(pct, 1.5)}%` }} />
      </div>
    </div>
  )
}

export function PlanesPage() {
  const [anual, setAnual] = useState(true)
  const [uso, setUso] = useState<MiUso | null>(null)
  const [elegido, setElegido] = useState<Plan | null>(null)

  useEffect(() => {
    miUso().then(setUso).catch(() => setUso(null))
  }, [])

  return (
    <div className="aparecer">
      <Titulo antetitulo="Planes y suscripción" sub="Empieza gratis y crece cuando tu historia lo necesite. Nada se borra por falta de pago.">
        Un lugar para toda una vida
      </Titulo>

      {uso && (
        <div className="mb-10 grid gap-6 rounded-3xl border border-linea/80 bg-hoja p-6 shadow-hoja md:grid-cols-[auto_1fr] md:items-center md:p-8">
          <div>
            <p className="etiqueta text-tinta-suave">Tu plan</p>
            <p className="mt-1 font-serif text-[28px]">{PLANES.find((p) => p.id === uso.plan_id)?.nombre}</p>
            <span className="mt-1 inline-block rounded-full bg-salvia-claro px-3 py-0.5 text-xs font-medium text-salvia">{ESTADO[uso.status]}</span>
          </div>
          <BarraUso uso={uso} />
        </div>
      )}

      <div className="mb-8 flex justify-center">
        <div role="radiogroup" aria-label="Forma de pago" className="inline-flex rounded-full border border-linea bg-hoja p-1">
          {[{ v: false, t: 'Mensual' }, { v: true, t: 'Anual · 2 meses gratis' }].map((o) => (
            <button key={o.t} role="radio" aria-checked={anual === o.v} onClick={() => setAnual(o.v)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${anual === o.v ? 'bg-tinta text-hoja' : 'text-tinta-suave'}`}>
              {o.t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {PLANES.map((p) => {
          const actual = uso?.plan_id === p.id
          const precio = anual ? p.anualMxn : p.mensualMxn
          return (
            <article key={p.id} className={`relative flex flex-col rounded-[28px] p-7 md:p-8 ${p.destacado ? 'bg-tinta text-papel shadow-elevada' : 'border border-linea/80 bg-hoja shadow-hoja'}`}>
              {p.destacado && <span className="absolute -top-3 left-7 rounded-full bg-terracota px-3 py-1 text-xs font-semibold text-hoja">El más elegido</span>}
              <h2 className="text-[28px]">{p.nombre}</h2>
              <p className={`mt-1 ${p.destacado ? 'text-papel/70' : 'text-tinta-suave'}`}>{p.para}</p>
              <p className="mt-6 flex items-baseline gap-2">
                <span className="font-serif text-[44px] leading-none">{precioMxn(precio)}</span>
                {precio > 0 && <span className={p.destacado ? 'text-papel/70' : 'text-tinta-suave'}>{anual ? '/ año' : '/ mes'}</span>}
              </p>
              {anual && precio > 0 && <p className={`mt-1 text-sm ${p.destacado ? 'text-papel/70' : 'text-tinta-suave'}`}>Ahorras {ahorroAnual(p)} meses</p>}
              <ul className="mt-6 flex-1 space-y-3 text-[15px]">
                {p.incluye.map((i) => (
                  <li key={i} className="flex gap-2.5"><IconoCheck size={18} className={`mt-0.5 shrink-0 ${p.destacado ? 'text-[#a9c4ad]' : 'text-salvia'}`} />{i}</li>
                ))}
              </ul>
              <div className="mt-8">
                {actual ? (
                  <p className={`rounded-full border py-3 text-center text-sm font-medium ${p.destacado ? 'border-papel/30' : 'border-linea'}`}>Tu plan actual</p>
                ) : p.mensualMxn === 0 ? (
                  <p className="py-3 text-center text-sm text-tinta-suave">Siempre disponible</p>
                ) : (
                  <Boton className="w-full" variante={p.destacado ? 'principal' : 'suave'} onClick={() => setElegido(p)}>Elegir {p.nombre}</Boton>
                )}
              </div>
            </article>
          )
        })}
      </div>

      {elegido && (
        <div className="mt-6">
          <Aviso>
            Los pagos en línea se activan muy pronto. Cuando estén listos podrás contratar {elegido.nombre} aquí mismo. Mientras tanto, sigues con todo lo de tu plan actual.
          </Aviso>
        </div>
      )}

      <section id="regalo" className="mt-16 grid gap-8 rounded-[32px] bg-terracota p-8 text-hoja md:grid-cols-[1fr_auto] md:items-center md:p-12">
        <div>
          <IconoSobre size={34} />
          <h2 className="mt-4 text-[34px] leading-tight md:text-[42px]">Regala una historia</h2>
          <p className="mt-3 max-w-xl text-hoja/85">Un año de Mi Historia para tus papás o tus abuelos, con una tarjeta y las primeras preguntas para su entrevista. El regalo que se queda para siempre.</p>
        </div>
        <span className="rounded-full bg-hoja/15 px-5 py-3 text-center text-sm font-medium">Disponible al activar los pagos</span>
      </section>

      <section className="mt-16 grid gap-6 md:grid-cols-3">
        {[
          ['Garantía de permanencia', 'Si tu suscripción vence, tu cuenta pasa a solo lectura. Puedes ver y descargar todo. Nada se borra por falta de pago.'],
          ['Sin letras chiquitas', 'Precios en pesos con IVA incluido. Cancelas cuando quieras, desde tu cuenta.'],
          ['Tus datos, tuyos', 'Exporta todos tus recuerdos y archivos originales en cualquier momento, en cualquier plan.'],
        ].map(([t, d]) => (
          <div key={t} className="rounded-3xl border border-linea/80 p-6">
            <h3 className="text-[22px]">{t}</h3>
            <p className="mt-2 text-tinta-suave">{d}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
