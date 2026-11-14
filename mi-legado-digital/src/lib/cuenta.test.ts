import { describe, expect, it } from 'vitest'
import { contrasenaValida, mensajeAuth, revisarContrasena } from './cuenta'
import { PLANES, ahorroAnual, precioMxn } from './planes'

describe('contraseñas', () => {
  it('pide 8 caracteres con letras y números', () => {
    expect(contrasenaValida('abc123')).toBe(false)
    expect(contrasenaValida('abcdefgh')).toBe(false)
    expect(contrasenaValida('recuerdo2026')).toBe(true)
    expect(revisarContrasena('ñandú123')).toEqual({ largo: true, letra: true, numero: true })
  })
})

describe('mensajes de error en español', () => {
  it('traduce los errores comunes', () => {
    expect(mensajeAuth({ code: 'invalid_credentials' })).toMatch(/no coinciden/)
    expect(mensajeAuth({ message: 'Email not confirmed' })).toMatch(/confirma/)
    expect(mensajeAuth({ code: 'user_already_exists' })).toMatch(/Ya existe/)
    expect(mensajeAuth(null)).toMatch(/Algo salió mal/)
  })
})

describe('planes', () => {
  it('el plan gratuito existe y los precios se muestran en pesos', () => {
    expect(PLANES[0].mensualMxn).toBe(0)
    expect(precioMxn(0)).toBe('Gratis')
    expect(precioMxn(79)).toMatch(/79/)
  })
  it('el pago anual ahorra dos meses', () => {
    expect(ahorroAnual(PLANES[1])).toBe(2)
    expect(ahorroAnual(PLANES[2])).toBe(2)
  })
})
