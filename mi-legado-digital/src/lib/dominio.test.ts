import { describe, expect, it } from 'vitest'
import { construirFecha, fechaHumana, huellaSha256, rutaOriginal, tamanoHumano } from './dominio'
import { PREGUNTAS_REFLEXION, preguntaDelDia } from './preguntas'

describe('fechas honestas', () => {
  it('no inventa precisión que la persona no dio', () => {
    expect(fechaHumana('1987-01-01', 'year')).toBe('1987')
    expect(fechaHumana('1980-01-01', 'decade')).toBe('Los años 1980')
    expect(fechaHumana('1987-01-01', 'approx')).toBe('Hacia 1987')
    expect(fechaHumana(null, 'day')).toBe('Sin fecha')
  })
  it('muestra el día completo solo cuando se conoce', () => {
    expect(fechaHumana('1995-06-14', 'day')).toBe('14 de junio de 1995')
    expect(fechaHumana('1995-06-01', 'month')).toBe('junio de 1995')
  })
  it('construye la fecha según la precisión elegida', () => {
    expect(construirFecha('decade', { anio: '1987' })).toEqual({ occurred_on: '1980-01-01', occurred_precision: 'decade' })
    expect(construirFecha('day', { anio: '2001', mes: '2', dia: '31' })).toEqual({ occurred_on: '2001-02-28', occurred_precision: 'day' })
    expect(construirFecha('year', { anio: 'abc' })).toEqual({ occurred_on: null, occurred_precision: 'unknown' })
  })
})

describe('integridad de originales', () => {
  it('calcula una huella SHA-256 estable', async () => {
    const datos = new TextEncoder().encode('Mi abuela tostaba los chiles en comal')
    const h = await huellaSha256(datos.buffer as ArrayBuffer)
    expect(h).toMatch(/^[0-9a-f]{64}$/)
    expect(await huellaSha256(datos.buffer as ArrayBuffer)).toBe(h)
  })
  it('guarda cada archivo en la carpeta de su dueño', () => {
    expect(rutaOriginal('u1', 'a1', 'audio/webm;codecs=opus')).toBe('u1/a1.webm')
    expect(rutaOriginal('u1', 'a2', 'image/jpeg')).toBe('u1/a2.jpg')
  })
  it('muestra tamaños legibles', () => {
    expect(tamanoHumano(2048)).toBe('2 KB')
    expect(tamanoHumano(5 * 1024 ** 2)).toBe('5.0 MB')
  })
})

describe('preguntas', () => {
  it('cambian cada día y no se repiten dentro del mismo día', () => {
    const hoy = new Date(2026, 10, 13, 8)
    expect(preguntaDelDia(hoy)).toBe(preguntaDelDia(new Date(2026, 10, 13, 22)))
    expect(preguntaDelDia(hoy)).not.toBe(preguntaDelDia(new Date(2026, 10, 14, 8)))
    expect(PREGUNTAS_REFLEXION).toContain(preguntaDelDia(hoy))
  })
})
