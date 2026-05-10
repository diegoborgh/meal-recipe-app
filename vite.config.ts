import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';

// PWA + service worker config lives here at the build boundary so runtime code
// in src/pwa/ stays focused on registration. Workbox runtime caching strategies
// are tuned for this app: precache the shell, runtime-cache Spoonacular images.
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [
    react(),
    VitePWA({
      // 'prompt' = surface the update via in-app UI (UpdateBanner) instead
      // of silently swapping mid-session. See src/pwa/register.ts.
      registerType: 'prompt',
      injectRegister: false, // we register manually in src/pwa/register.ts
      includeAssets: ['favicon.svg', 'icons/*.png', 'splash/*.png'],
      manifest: {
        name: 'Skillet — Come into the kitchen',
        short_name: 'Skillet',
        description: 'A local-first meal recipe PWA. Come into the kitchen.',
        lang: 'en',
        dir: 'ltr',
        theme_color: '#C0502B',
        background_color: '#F6F1E8',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        categories: ['food', 'lifestyle', 'utilities'],
        // App shortcuts — long-press the home-screen icon (Android / Chrome
        // OS) to jump straight into a feature. iOS doesn't honor these yet
        // but it's a no-op there.
        shortcuts: [
          {
            name: 'Search recipes',
            short_name: 'Search',
            description: 'Find recipes by name or filters',
            url: '/search',
            icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
          },
          {
            name: 'Saved recipes',
            short_name: 'Saved',
            description: 'Your cookbook',
            url: '/favorites',
            icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
          },
          {
            name: "What's in my fridge",
            short_name: 'Fridge',
            description: 'Find recipes from ingredients on hand',
            url: '/fridge',
            icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
          },
        ],
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
        // Don't precache images — they're CDN-hosted and cached at runtime via the rules below.
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            // Spoonacular CDN images — cap to ~50MB / ~30 days, LRU.
            urlPattern: ({ url }) => url.hostname.includes('spoonacular') && /\.(png|jpe?g|webp|avif)$/i.test(url.pathname),
            handler: 'CacheFirst',
            options: {
              cacheName: 'spoonacular-images',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Google Fonts stylesheet
            urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com',
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-stylesheets' },
          },
          {
            // Google Fonts files
            urlPattern: ({ url }) => url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // Note: /api/spoonacular responses are intentionally NOT runtime-cached.
          // The Vercel edge cache handles that layer; client-side cache is in-memory only.
        ],
      },
      devOptions: {
        enabled: false, // SW off in dev to avoid churn; flip to true to test offline locally
      },
    }),
  ],
  server: {
    port: 5173,
  },
});
