import { useCallback, useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { Marco } from './app/Marco'
import { ProveedorSesion, useSesion } from './app/Sesion'
import type { Profile } from './lib/dominio'
import { obtenerPerfil } from './lib/recuerdos'
import { supabaseConfigurado, urlConfigurada, urlValida } from './lib/supabase'
import { BienvenidaPage } from './modules/auth/BienvenidaPage'
import { PortadaPage } from './modules/auth/PortadaPage'
import { RestablecerPage } from './modules/auth/RestablecerPage'
import { CuentaPage } from './modules/cuenta/CuentaPage'
import { PlanesPage } from './modules/cuenta/PlanesPage'
import { BuscarPage } from './modules/buscar/BuscarPage'
import { DiarioPage } from './modules/mi-diario/DiarioPage'
import { NuevoRecuerdoPage } from './modules/mi-diario/NuevoRecuerdoPage'
import { MiEspacioPage } from './modules/mi-espacio/MiEspacioPage'
import { HistoriaPage } from './modules/mi-historia/HistoriaPage'
import { RecuerdoPage } from './modules/mi-memoria/RecuerdoPage'
import { PrivacidadPage } from './modules/privacidad/PrivacidadPage'

function Espera() {
  return <div className="grid min-h-dvh place-items-center text-tinta-suave">Un momento…</div>
}

function Rutas() {
  const { sesion, cargando } = useSesion()
  const { pathname } = useLocation()
  const navegar = useNavigate()
  const [perfil, setPerfil] = useState<Profile | null | undefined>(undefined)

  const cargarPerfil = useCallback(() => {
    obtenerPerfil().then(setPerfil).catch(() => setPerfil(null))
  }, [])

  useEffect(() => {
    if (sesion) cargarPerfil()
    else setPerfil(undefined)
  }, [sesion, cargarPerfil])

  if (cargando) return <Espera />
  if (pathname === '/restablecer') return <RestablecerPage conSesion={Boolean(sesion)} onListo={() => navegar('/', { replace: true })} />
  if (!sesion) return <PortadaPage />
  if (perfil === undefined) return <Espera />
  if (!perfil?.onboarded_at) return <BienvenidaPage nombreInicial={perfil?.display_name ?? ''} onListo={cargarPerfil} />

  return (
    <Routes>
      <Route element={<Marco />}>
        <Route index element={<MiEspacioPage perfil={perfil} />} />
        <Route path="diario" element={<DiarioPage />} />
        <Route path="nuevo" element={<NuevoRecuerdoPage />} />
        <Route path="recuerdo/:id" element={<RecuerdoPage />} />
        <Route path="historia" element={<HistoriaPage />} />
        <Route path="buscar" element={<BuscarPage />} />
        <Route path="privacidad" element={<PrivacidadPage />} />
        <Route path="planes" element={<PlanesPage />} />
        <Route path="cuenta" element={<CuentaPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

function SinConfigurar() {
  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <h1 className="text-3xl">Falta conectar Supabase</h1>
      {urlConfigurada && !urlValida && (
        <p className="mt-4 rounded-xl bg-terracota/10 p-4 text-terracota-hondo">
          La variable <code>VITE_SUPABASE_URL</code> tiene <code>{urlConfigurada}</code>, pero debe ser la dirección de tu proyecto de Supabase, con la forma <code>https://xxxx.supabase.co</code>.
        </p>
      )}
      <p className="mt-4 text-tinta-suave">
        Copia <code>.env.example</code> como <code>.env.local</code> y escribe la URL de tu proyecto y la clave pública (anon o publishable). Nunca uses la clave <em>service_role</em> aquí.
      </p>
    </main>
  )
}

export default function App() {
  if (!supabaseConfigurado) return <SinConfigurar />
  return (
    <ProveedorSesion>
      <BrowserRouter>
        <Rutas />
      </BrowserRouter>
    </ProveedorSesion>
  )
}
