const fs = require('fs');
let code = fs.readFileSync('vite.config.ts', 'utf-8');

// The first script didn't work because we had an error matching the string
code = code.replace(
  /VitePWA\(\{/, 
  "VitePWA({\n      workbox: {\n        maximumFileSizeToCacheInBytes: 30 * 1024 * 1024\n      },"
);

fs.writeFileSync('vite.config.ts', code);
