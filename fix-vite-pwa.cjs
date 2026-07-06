const fs = require('fs');
let code = fs.readFileSync('vite.config.ts', 'utf-8');

code = code.replace(
  /VitePWA\(\{/, 
  "VitePWA({\n      workbox: {\n        maximumFileSizeToCacheInBytes: 15 * 1024 * 1024\n      },"
);

fs.writeFileSync('vite.config.ts', code);
