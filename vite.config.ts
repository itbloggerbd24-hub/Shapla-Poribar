import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        devOptions: {
          enabled: true,
          type: 'module',
        },
        includeAssets: [
          'favicon.svg',
          'apple-touch-icon.png',
          'pwa-192x192.png',
          'pwa-512x512.png',
          'pwa-maskable-512x512.png',
          'screenshot-wide.jpg',
          'screenshot-mobile.jpg',
        ],
        manifest: {
          id: '/',
          name: 'Shapla Poribar',
          short_name: 'Shapla',
          description: 'Place predictions on Shapla vs Poribar with Binance deposit and withdrawal wallet.',
          theme_color: '#020617',
          background_color: '#020617',
          display: 'standalone',
          display_override: ['window-controls-overlay', 'standalone', 'minimal-ui'],
          orientation: 'any',
          categories: ['games', 'entertainment'],
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
          screenshots: [
            {
              src: 'screenshot-wide.jpg',
              sizes: '1376x768',
              type: 'image/jpeg',
              form_factor: 'wide',
              label: 'Shapla Poribar Desktop & Tablet Arena',
            },
            {
              src: 'screenshot-mobile.jpg',
              sizes: '768x1376',
              type: 'image/jpeg',
              form_factor: 'narrow',
              label: 'Shapla Poribar Mobile Prediction Arena',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,jpg,svg,woff2}'],
          maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
          navigateFallback: 'index.html',
          navigateFallbackDenylist: [/^\/api\//],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
