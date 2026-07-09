import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        workbox: {
          maximumFileSizeToCacheInBytes: 50 * 1024 * 1024
        },
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
        manifest: {
          name: 'Docscraft Pro Workspace',
          short_name: 'Docscraft Pro',
          description: 'High-Performance Sovereign Agent workspace with local sandbox compiler',
          theme_color: '#FDFBF7',
          background_color: '#FDFBF7',
          display: 'standalone',
          start_url: '/',
          orientation: 'any',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'maskable'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            }
          ]
        }
      })
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        'pdf-lib': 'pdf-lib/cjs/index.js',
      },
    },
    build: {
      sourcemap: false,
      minify: false,
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        external: ['url'],
        onwarn(warning, warn) {
          if (warning.code === 'EVAL' && warning.id?.includes('onnxruntime-web')) return;
          warn(warning);
        },
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/pdf-lib') || id.includes('node_modules/pdfjs-dist')) {
              return 'pdf-utils';
            }
          }
        }
      }
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
