import { useCallback, useState } from 'react'
import { IconoCandado, IconoConversacion, IconoOlla, IconoSobre } from '../../design-system/Iconos'
import { Logo, Marca } from '../../design-system/Logo'
import { Boton } from '../../design-system/ui'
import { Pie } from '../../design-system/Pie'
import { ModalAcceso, type VistaAcceso } from './ModalAcceso'

const RAZONES = [
  { Icono: IconoConversacion, t: 'Pregúntale mientras puedas', d: 'Graba conversaciones con quienes amas, con preguntas que abren el corazón.' },
  { Icono: IconoOlla, t: 'Lo que sabía hacer', d: 'Recetas, remedios y dichos, para que se sigan haciendo como se hacían.' },
  { Icono: IconoSobre, t: 'Lo que quiero que sepan', d: 'Mensajes de paz para quienes se quedan, sellados y privados.' },
  { Icono: IconoCandado, t: 'Solo tuyo', d: 'Privado por diseño. Nunca entrenamos IA con tus recuerdos.' },
]

/** Portada pública: presenta la plataforma y abre el modal de acceso. */
export function PortadaPage() {
  const [recorrido, setRecorrido] = useState<VistaAcceso[] | null>(null)
  const cerrar = useCallback(() => setRecorrido(null), [])

  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 md:px-8">
        <Logo size={40} />
        <button onClick={() => setRecorrido(['inicio', 'entrar'])} className="rounded-full px-4 py-2 text-[15px] font-medium text-tinta hover:bg-papel-hondo">
          Ya tengo una cuenta
        </button>
      </header>

      <main className="mx-auto max-w-6xl px-5 md:px-8">
        <section className="relative grid items-center gap-10 py-10 md:grid-cols-[1.2fr_1fr] md:py-20">
          <div className="aparecer">
            <p className="etiqueta text-terracota">Pregúntale hoy. Guárdalo para siempre.</p>
            <h1 className="mt-5 text-[44px] leading-[1.02] md:text-[72px]">Una vida no debería desaparecer sin dejar huella.</h1>
            <p className="mt-6 max-w-xl text-[18px] text-tinta-suave">
              Guarda tu historia con tu propia voz: lo que viviste, lo que aprendiste y lo que quieres que sepan quienes amas.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Boton onClick={() => setRecorrido(['inicio', 'crear'])} className="px-7">Crear una cuenta gratis</Boton>
              <Boton variante="suave" onClick={() => setRecorrido(['inicio', 'entrar'])}>Ya tengo una cuenta</Boton>
            </div>
            <p className="mt-4 text-sm text-tinta-suave">Sin tarjeta. Exporta todo cuando quieras.</p>
          </div>
          <div className="aparecer-2 relative mx-auto grid aspect-square w-full max-w-[420px] place-items-center rounded-full bg-hoja shadow-elevada">
            <Marca size={300} className="max-w-[72%]" />
          </div>
        </section>

        <section className="aparecer-3 grid gap-4 pb-6 sm:grid-cols-2 lg:grid-cols-4">
          {RAZONES.map(({ Icono, t, d }) => (
            <div key={t} className="rounded-3xl border border-linea/80 bg-hoja/70 p-6">
              <Icono size={26} className="text-terracota" />
              <h2 className="mt-4 text-[21px] leading-snug">{t}</h2>
              <p className="mt-2 text-[15px] text-tinta-suave">{d}</p>
            </div>
          ))}
        </section>
      </main>

      <Pie publico onEntrar={() => setRecorrido(['inicio'])} />
      <ModalAcceso abierto={recorrido !== null} recorrido={recorrido ?? ['inicio']} onCerrar={cerrar} />
    </div>
  )
}
