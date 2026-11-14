import { supabase } from './supabase'
import { huellaSha256, rutaOriginal, type DatePrecision, type EntryKind, type LifeStage, type Memory, type MemoryKind, type Profile } from './dominio'

const BUCKET = 'originals'

async function usuarioId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) throw new Error('Tu sesión terminó. Vuelve a entrar.')
  return data.user.id
}

function falla(error: { message: string } | null, contexto: string): void {
  if (error) throw new Error(`${contexto}: ${error.message}`)
}

// ---------- Perfil y etapas ----------
export async function obtenerPerfil(): Promise<Profile | null> {
  const id = await usuarioId()
  const { data, error } = await supabase.from('profiles').select('id, display_name, birth_year, onboarded_at').eq('id', id).maybeSingle()
  falla(error, 'No pude leer tu perfil')
  return data
}

export async function completarBienvenida(nombre: string, anio: number | null, etapas: string[]): Promise<void> {
  const id = await usuarioId()
  const { error } = await supabase
    .from('profiles')
    .update({ display_name: nombre.trim() || null, birth_year: anio, onboarded_at: new Date().toISOString() })
    .eq('id', id)
  falla(error, 'No pude guardar tu perfil')
  if (etapas.length) {
    const { error: e2 } = await supabase.from('life_stages').insert(etapas.map((name, i) => ({ name, sort_order: i })))
    falla(e2, 'No pude guardar tus etapas')
  }
}

export async function listarEtapas(): Promise<LifeStage[]> {
  const { data, error } = await supabase.from('life_stages').select('id, name, starts_on, ends_on, sort_order').order('sort_order')
  falla(error, 'No pude leer tus etapas')
  return data ?? []
}

// ---------- Recuerdos ----------
export interface NuevoRecuerdo {
  kind: MemoryKind
  title: string
  story: string
  occurred_on: string | null
  occurred_precision: DatePrecision
  stage_id: string | null
  details?: Record<string, unknown>
}

/** Guarda el texto original como entrada inmutable y el recuerdo que la cita. */
export async function crearRecuerdo(nuevo: NuevoRecuerdo, archivo?: { blob: Blob; tipo: EntryKind; duracionMs?: number }): Promise<string> {
  const owner = await usuarioId()

  const { data: entrada, error: e1 } = await supabase
    .from('entries')
    .insert({ kind: archivo?.tipo ?? 'text', body: nuevo.story || null })
    .select('id')
    .single()
  falla(e1, 'No pude guardar tu entrada')

  let assetId: string | null = null
  if (archivo) {
    const datos = await archivo.blob.arrayBuffer()
    const sha256 = await huellaSha256(datos)
    const id = crypto.randomUUID()
    const mime = archivo.blob.type || 'application/octet-stream'
    const ruta = rutaOriginal(owner, id, mime)
    const { error: eSubida } = await supabase.storage.from(BUCKET).upload(ruta, archivo.blob, { contentType: mime, upsert: false })
    falla(eSubida, 'No pude subir el archivo original')
    const { error: eAsset } = await supabase.from('assets').insert({
      id,
      entry_id: entrada!.id,
      storage_path: ruta,
      mime_type: mime,
      size_bytes: archivo.blob.size,
      sha256,
      duration_ms: archivo.duracionMs ?? null,
    })
    falla(eAsset, 'No pude registrar el archivo original')
    assetId = id
  }

  const { data: recuerdo, error: e2 } = await supabase
    .from('memories')
    .insert({
      kind: nuevo.kind,
      title: nuevo.title.trim(),
      story: nuevo.story.trim() || null,
      details: nuevo.details ?? {},
      occurred_on: nuevo.occurred_on,
      occurred_precision: nuevo.occurred_precision,
      stage_id: nuevo.stage_id,
      provenance: archivo ? 'original_file' : 'user_direct',
      is_sealed: nuevo.kind === 'reassurance',
    })
    .select('id')
    .single()
  falla(e2, 'No pude guardar tu recuerdo')

  const fuentes: Array<{ memory_id: string; entry_id?: string; asset_id?: string }> = [
    { memory_id: recuerdo!.id, entry_id: entrada!.id },
  ]
  if (assetId) fuentes.push({ memory_id: recuerdo!.id, asset_id: assetId })
  const { error: e3 } = await supabase.from('memory_sources').insert(fuentes)
  falla(e3, 'No pude enlazar las fuentes del recuerdo')
  return recuerdo!.id
}

export async function editarRecuerdo(id: string, cambios: Partial<Pick<Memory, 'title' | 'story' | 'occurred_on' | 'occurred_precision' | 'stage_id'>>) {
  const { error } = await supabase.from('memories').update(cambios).eq('id', id)
  falla(error, 'No pude guardar los cambios')
}

const CAMPOS = 'id, owner_id, kind, title, story, details, occurred_on, occurred_precision, stage_id, provenance, verification_status, is_sealed, is_demo, created_at, updated_at'

export async function listarRecuerdos(opciones: { limite?: number; tipos?: MemoryKind[] } = {}): Promise<Memory[]> {
  let q = supabase.from('memories').select(CAMPOS).is('deleted_at', null).order('created_at', { ascending: false })
  if (opciones.tipos) q = q.in('kind', opciones.tipos)
  if (opciones.limite) q = q.limit(opciones.limite)
  const { data, error } = await q
  falla(error, 'No pude leer tus recuerdos')
  return (data ?? []) as Memory[]
}

export async function buscarRecuerdos(texto: string): Promise<Memory[]> {
  const { data, error } = await supabase
    .from('memories')
    .select(CAMPOS)
    .is('deleted_at', null)
    .textSearch('search', texto, { type: 'websearch', config: 'spanish' })
    .limit(50)
  falla(error, 'No pude buscar')
  return (data ?? []) as Memory[]
}

export interface Fuente {
  id: string
  entry: { id: string; kind: EntryKind; body: string | null; recorded_at: string } | null
  asset: { id: string; mime_type: string; size_bytes: number; sha256: string; storage_path: string; duration_ms: number | null } | null
}

export async function obtenerRecuerdo(id: string): Promise<{ recuerdo: Memory; fuentes: Fuente[]; cambios: number }> {
  const [{ data: recuerdo, error: e1 }, { data: fuentes, error: e2 }, { count, error: e3 }] = await Promise.all([
    supabase.from('memories').select(CAMPOS).eq('id', id).single(),
    supabase
      .from('memory_sources')
      .select('id, entry:entries(id, kind, body, recorded_at), asset:assets(id, mime_type, size_bytes, sha256, storage_path, duration_ms)')
      .eq('memory_id', id),
    supabase.from('memory_revisions').select('id', { count: 'exact', head: true }).eq('memory_id', id),
  ])
  falla(e1, 'No encontré ese recuerdo')
  falla(e2, 'No pude leer sus fuentes')
  falla(e3, 'No pude leer su historial')
  return { recuerdo: recuerdo as Memory, fuentes: (fuentes ?? []) as unknown as Fuente[], cambios: count ?? 0 }
}

/** Enlace temporal (5 minutos) para escuchar o ver un original privado. */
export async function enlaceOriginal(ruta: string): Promise<string> {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(ruta, 300)
  falla(error, 'No pude abrir el archivo')
  return data!.signedUrl
}

export async function almacenamientoUsado(): Promise<number> {
  const { data, error } = await supabase.from('assets').select('size_bytes')
  falla(error, 'No pude calcular tu almacenamiento')
  return (data ?? []).reduce((s, a) => s + Number(a.size_bytes), 0)
}

// ---------- Consentimientos ----------
export async function consentimientosActivos(): Promise<string[]> {
  const { data, error } = await supabase.from('consents').select('kind').is('revoked_at', null)
  falla(error, 'No pude leer tus permisos')
  return (data ?? []).map((c) => c.kind as string)
}

export async function cambiarConsentimiento(kind: string, otorgar: boolean): Promise<void> {
  if (otorgar) {
    const { error } = await supabase.from('consents').insert({ kind, text_version: '2026-11-v1' })
    falla(error, 'No pude guardar tu permiso')
  } else {
    const { error } = await supabase.from('consents').update({ revoked_at: new Date().toISOString() }).eq('kind', kind).is('revoked_at', null)
    falla(error, 'No pude retirar tu permiso')
  }
}

// ---------- Exportación (todo lo que es tuyo, en un formato abierto) ----------
export async function exportarTodo(): Promise<Blob> {
  const tablas = ['profiles', 'life_stages', 'entries', 'assets', 'transcripts', 'memories', 'memory_sources', 'memory_revisions', 'tags', 'memory_tags', 'voice_highlights', 'consents', 'audit_log']
  const contenido: Record<string, unknown> = {
    formato: 'mi-legado-digital/export',
    version: 1,
    exportado_en: new Date().toISOString(),
    nota: 'Los archivos originales se descargan aparte desde los enlaces de cada asset (válidos 1 hora).',
  }
  for (const t of tablas) {
    const { data, error } = await supabase.from(t).select('*')
    falla(error, `No pude exportar ${t}`)
    contenido[t] = data
  }
  const assets = (contenido.assets as { storage_path: string }[]) ?? []
  const enlaces: Record<string, string> = {}
  for (const a of assets) {
    const { data } = await supabase.storage.from(BUCKET).createSignedUrl(a.storage_path, 3600)
    if (data) enlaces[a.storage_path] = data.signedUrl
  }
  contenido.enlaces_originales = enlaces
  return new Blob([JSON.stringify(contenido, null, 2)], { type: 'application/json' })
}
