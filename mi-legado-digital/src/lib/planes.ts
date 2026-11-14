import { supabase } from './supabase'

export type PlanId = 'semilla' | 'mi_historia' | 'familia'
export type EstadoSuscripcion = 'active' | 'trialing' | 'past_due' | 'read_only' | 'canceled'

export interface Plan {
  id: PlanId
  nombre: string
  para: string
  mensualMxn: number
  anualMxn: number
  incluye: string[]
  destacado?: boolean
}

/** Refleja la tabla public.plans (migración 0002). Precios propuestos, en pesos mexicanos. */
export const PLANES: Plan[] = [
  {
    id: 'semilla',
    nombre: 'Semilla',
    para: 'Para empezar a guardar tu historia',
    mensualMxn: 0,
    anualMxn: 0,
    incluye: ['Recuerdos escritos sin límite', '1 GB para voz y fotos', '30 minutos de transcripción al mes', 'Exporta todo cuando quieras'],
  },
  {
    id: 'mi_historia',
    nombre: 'Mi Historia',
    para: 'Para guardar una vida completa',
    mensualMxn: 79,
    anualMxn: 790,
    destacado: true,
    incluye: ['Todo lo de Semilla', '50 GB para voz, fotos y video', '10 horas de transcripción al mes', 'Entrevistas sin límite', 'Búsqueda inteligente (próximamente)'],
  },
  {
    id: 'familia',
    nombre: 'Familia',
    para: 'Para toda la familia, hasta 5 personas',
    mensualMxn: 159,
    anualMxn: 1590,
    incluye: ['Todo lo de Mi Historia', '200 GB compartidos', '25 horas de transcripción al mes', 'Hasta 5 cuentas', 'Recuerdos compartidos (próximamente)'],
  },
]

export const ESTADO: Record<EstadoSuscripcion, string> = {
  active: 'Activo',
  trialing: 'En prueba',
  past_due: 'Pago pendiente',
  read_only: 'Solo lectura',
  canceled: 'Cancelado',
}

export function precioMxn(n: number): string {
  return n === 0 ? 'Gratis' : new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n)
}

/** Meses que se ahorran al pagar anual. */
export function ahorroAnual(p: Plan): number {
  if (!p.mensualMxn) return 0
  return Math.round(((p.mensualMxn * 12 - p.anualMxn) / p.mensualMxn) * 10) / 10
}

export interface MiUso {
  plan_id: PlanId
  status: EstadoSuscripcion
  storage_used: number
  storage_limit: number
  transcription_minutes: number
}

export async function miUso(): Promise<MiUso | null> {
  const { data, error } = await supabase.rpc('my_usage')
  if (error) throw new Error('No pude leer tu plan')
  const fila = Array.isArray(data) ? data[0] : data
  return fila ? { ...fila, storage_used: Number(fila.storage_used), storage_limit: Number(fila.storage_limit) } : null
}
