import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
      workbox: {
        maximumFileSizeToCacheInBytes: 30 * 1024 * 1024
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 15 * 1024 * 1024
      },
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
        manifest: {
          name: 'Docscraft',
          short_name: 'Docscraft',
          description: 'The creative document writing journey',
          theme_color: '#ffffff',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
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
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
