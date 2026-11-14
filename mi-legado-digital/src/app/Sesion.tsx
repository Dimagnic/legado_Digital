import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface EstadoSesion {
  sesion: Session | null
  cargando: boolean
}

const Ctx = createContext<EstadoSesion>({ sesion: null, cargando: true })

export function ProveedorSesion({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<EstadoSesion>({ sesion: null, cargando: true })
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setEstado({ sesion: data.session, cargando: false }))
    const { data } = supabase.auth.onAuthStateChange((_e, sesion) => setEstado({ sesion, cargando: false }))
    return () => data.subscription.unsubscribe()
  }, [])
  return <Ctx.Provider value={estado}>{children}</Ctx.Provider>
}

export const useSesion = () => useContext(Ctx)
