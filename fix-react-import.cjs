const fs = require('fs');
let code = fs.readFileSync('vite.config.ts', 'utf-8');

// if externalized react somehow?
code = code.replace(
  /external: \['react', 'react-dom'\]/, 
  'external: []'
);

fs.writeFileSync('vite.config.ts', code);
