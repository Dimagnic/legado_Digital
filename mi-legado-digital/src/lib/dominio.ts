// Tipos y reglas del dominio. Reflejan supabase/migrations/20261114000001_fundacion.sql

export type MemoryKind = 'moment' | 'recipe' | 'remedy' | 'saying' | 'craft' | 'reassurance' | 'phrase'
export type DatePrecision = 'day' | 'month' | 'year' | 'decade' | 'approx' | 'unknown'
export type Provenance = 'user_direct' | 'original_file' | 'third_party' | 'ai_interpretation' | 'unknown'
export type EntryKind = 'text' | 'voice' | 'photo' | 'video' | 'document' | 'interview'

export interface Memory {
  id: string
  owner_id: string
  kind: MemoryKind
  title: string
  story: string | null
  details: Record<string, unknown>
  occurred_on: string | null
  occurred_precision: DatePrecision
  stage_id: string | null
  provenance: Provenance
  verification_status: 'unconfirmed' | 'confirmed_by_owner' | 'disputed'
  is_sealed: boolean
  is_demo: boolean
  created_at: string
  updated_at: string
}

export interface LifeStage {
  id: string
  name: string
  starts_on: string | null
  ends_on: string | null
  sort_order: number
}

export interface Profile {
  id: string
  display_name: string | null
  birth_year: number | null
  onboarded_at: string | null
}

export const TIPOS_RECUERDO: Record<MemoryKind, { nombre: string; ayuda: string; grupo: 'vida' | 'saber' | 'corazon' }> = {
  moment: { nombre: 'Un momento', ayuda: 'Algo que viviste y quieres conservar', grupo: 'vida' },
  recipe: { nombre: 'Receta', ayuda: 'Cómo se hacía, con sus secretos', grupo: 'saber' },
  remedy: { nombre: 'Remedio', ayuda: 'Lo que se hacía para sanar o cuidar', grupo: 'saber' },
  saying: { nombre: 'Dicho', ayuda: 'Una frase que se repetía en casa', grupo: 'saber' },
  craft: { nombre: 'Oficio', ayuda: 'Algo que sabías hacer con las manos', grupo: 'saber' },
  reassurance: {
    nombre: 'Lo que quiero que sepan',
    ayuda: 'Un mensaje de tranquilidad para quienes se quedan. Queda sellado y privado.',
    grupo: 'corazon',
  },
  phrase: { nombre: 'Sus palabras', ayuda: 'Un fragmento de voz real que vale la pena volver a escuchar', grupo: 'corazon' },
}

export const PROCEDENCIA: Record<Provenance, string> = {
  user_direct: 'Contado por ti',
  original_file: 'De un archivo original',
  third_party: 'Testimonio de otra persona',
  ai_interpretation: 'Sugerido por IA, sin confirmar',
  unknown: 'Origen desconocido',
}

export const ETAPAS_SUGERIDAS = ['Infancia', 'Adolescencia', 'Juventud', 'Vida adulta', 'Madurez']

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

/** Fecha honesta: muestra solo la precisión que la persona dio. */
export function fechaHumana(fecha: string | null, precision: DatePrecision): string {
  if (!fecha || precision === 'unknown') return 'Sin fecha'
  const [a, m, d] = fecha.split('-').map(Number)
  switch (precision) {
    case 'day':
      return `${d} de ${MESES[m - 1]} de ${a}`
    case 'month':
      return `${MESES[m - 1]} de ${a}`
    case 'year':
      return `${a}`
    case 'decade':
      return `Los años ${Math.floor(a / 10) * 10}`
    case 'approx':
      return `Hacia ${a}`
  }
}

/** Convierte lo que la persona eligió en el formulario a fecha + precisión. */
export function construirFecha(
  precision: DatePrecision,
  partes: { anio?: string; mes?: string; dia?: string },
): { occurred_on: string | null; occurred_precision: DatePrecision } {
  const anio = Number(partes.anio)
  if (precision === 'unknown' || !Number.isInteger(anio) || anio < 1800 || anio > 2200) {
    return { occurred_on: null, occurred_precision: 'unknown' }
  }
  const pad = (n: number) => String(n).padStart(2, '0')
  const mes = Math.min(12, Math.max(1, Number(partes.mes) || 1))
  const diasDelMes = new Date(Date.UTC(anio, mes, 0)).getUTCDate()
  const dia = Math.min(diasDelMes, Math.max(1, Number(partes.dia) || 1))
  switch (precision) {
    case 'day':
      return { occurred_on: `${anio}-${pad(mes)}-${pad(dia)}`, occurred_precision: 'day' }
    case 'month':
      return { occurred_on: `${anio}-${pad(mes)}-01`, occurred_precision: 'month' }
    case 'decade':
      return { occurred_on: `${Math.floor(anio / 10) * 10}-01-01`, occurred_precision: 'decade' }
    default:
      return { occurred_on: `${anio}-01-01`, occurred_precision: precision }
  }
}

/** Huella SHA-256 en hexadecimal: prueba de que el original no cambió. */
export async function huellaSha256(datos: ArrayBuffer): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', datos)
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** Ruta en Storage: siempre dentro de la carpeta de la persona. */
export function rutaOriginal(ownerId: string, id: string, mime: string): string {
  const ext = mime.includes('webm') ? 'webm' : mime.includes('ogg') ? 'ogg' : mime.includes('mp4') ? 'm4a'
    : mime.includes('jpeg') ? 'jpg' : mime.includes('png') ? 'png' : mime.includes('heic') ? 'heic'
    : mime.includes('pdf') ? 'pdf' : 'bin'
  return `${ownerId}/${id}.${ext}`
}

export function tamanoHumano(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(0, Math.round(bytes / 1024))} KB`
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`
}
