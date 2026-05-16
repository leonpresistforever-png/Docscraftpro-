const fs = require('fs');
const lock = JSON.parse(fs.readFileSync('./package-lock.json', 'utf-8'));
const pkg = {
  name: "react-example", // fallback
  version: "0.0.0",
  type: "module",
  scripts: {
    "dev": "tsx server.ts",
    "build": "tsc && vite build",
    "lint": "tsc --noEmit",
    "start": "NODE_ENV=production node --import tsx server.ts",
    "preview": "vite preview"
  },
  dependencies: {},
  devDependencies: {}
};
if (lock.packages && lock.packages['']) {
  pkg.dependencies = lock.packages[''].dependencies || {};
  pkg.devDependencies = lock.packages[''].devDependencies || {};
}
// Also preserve qrcode.react
pkg.dependencies['qrcode.react'] = '^4.2.0';

fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2));
console.log("Restored package.json");
