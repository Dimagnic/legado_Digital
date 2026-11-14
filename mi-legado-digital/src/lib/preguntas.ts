// Preguntas suaves y omitibles. Nunca presionan hacia recuerdos dolorosos.

export const PREGUNTAS_REFLEXION = [
  '¿Qué momento de hoy te gustaría recordar dentro de diez años?',
  '¿Qué aprendiste recientemente?',
  '¿Hay alguna experiencia que haya cambiado tu manera de pensar?',
  '¿Qué consejo le darías a tu versión de hace veinte años?',
  '¿Qué persona dejó una huella importante en tu vida?',
  '¿Qué te gustaría que tu familia comprendiera de ti?',
  '¿Qué sueño todavía deseas cumplir?',
  '¿Qué significa para ti haber llegado hasta aquí?',
  '¿Qué comida te regresa a tu infancia?',
  '¿Qué dicho repetían en tu casa?',
]

/** Para el modo entrevista: preguntas que un hijo o nieto puede hacerle a alguien que ama. */
export const PREGUNTAS_ENTREVISTA = [
  '¿Cómo era la casa donde creciste?',
  '¿Qué juegos jugabas de niña o de niño?',
  '¿Cómo conociste a la persona que más amaste?',
  '¿Qué fue lo más difícil que te tocó vivir y cómo salimos adelante?',
  '¿De qué estás más orgulloso u orgullosa?',
  '¿Qué receta te gustaría que nunca se perdiera?',
  '¿Qué te hubiera gustado que alguien te dijera a mi edad?',
  '¿Qué quieres que sepamos de ti que nunca nos has contado?',
]

/** La misma pregunta durante todo el día, y otra mañana: sin repetición insistente. */
export function preguntaDelDia(fecha = new Date(), lista = PREGUNTAS_REFLEXION): string {
  const dia = Math.floor(Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()) / 86_400_000)
  return lista[dia % lista.length]
}
