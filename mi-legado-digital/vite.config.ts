/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'logo-marca.svg'],
      manifest: {
        name: 'Mi Legado Digital',
        short_name: 'Mi Legado',
        description: 'Una vida. Una historia. Una huella que merece permanecer.',
        lang: 'es-419',
        theme_color: '#F6F1E7',
        background_color: '#F6F1E7',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Nunca guardar en caché datos privados ni archivos de Supabase
        navigateFallbackDenylist: [/^\/auth/],
        runtimeCaching: [],
      },
    }),
  ],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
