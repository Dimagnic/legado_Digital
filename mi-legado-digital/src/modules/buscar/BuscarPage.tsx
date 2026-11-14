import { useState, type FormEvent } from 'react'
import { Aviso, Boton, Entrada, Hoja, Titulo } from '../../design-system/ui'
import type { Memory } from '../../lib/dominio'
import { buscarRecuerdos } from '../../lib/recuerdos'
import { TarjetaRecuerdo } from '../mi-memoria/TarjetaRecuerdo'

export function BuscarPage() {
  const [texto, setTexto] = useState('')
  const [resultados, setResultados] = useState<Memory[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function buscar(e: FormEvent) {
    e.preventDefault()
    if (!texto.trim()) return
    setError(null)
    try {
      setResultados(await buscarRecuerdos(texto))
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <div className="aparecer">
      <Titulo sub="Busca por palabras: un nombre, un lugar, una comida.">Buscar</Titulo>
      <form onSubmit={buscar} className="mb-6 flex gap-2">
        <Entrada value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Por ejemplo: mole, Oaxaca, mi papá" aria-label="Buscar en mis recuerdos" />
        <Boton type="submit">Buscar</Boton>
      </form>
      {error && <Aviso tono="error">{error}</Aviso>}
      {resultados && (
        <Hoja>
          {resultados.length === 0 ? <p className="text-tinta-suave">No encontré recuerdos con esas palabras.</p> : resultados.map((r) => <TarjetaRecuerdo key={r.id} r={r} />)}
        </Hoja>
      )}
    </div>
  )
}
