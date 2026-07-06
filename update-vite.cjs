const fs = require('fs');
let code = fs.readFileSync('vite.config.ts', 'utf-8');

code = code.replace("import path from 'path';", "import path from 'path';\nimport { VitePWA } from 'vite-plugin-pwa';");
code = code.replace("tailwindcss()", `tailwindcss(),
      VitePWA({
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
      })`);

fs.writeFileSync('vite.config.ts', code);
