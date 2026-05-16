const fs = require('fs');
const path = require('path');

const deps = new Set();
function scan(full) {
  if (!fs.existsSync(full)) return;
  if (fs.statSync(full).isDirectory()) {
    const files = fs.readdirSync(full);
    for (const file of files) {
      scan(path.join(full, file));
    }
  } else if (full.endsWith('.ts') || full.endsWith('.tsx') || full.endsWith('.js') || full.endsWith('.jsx')) {
    const p = fs.readFileSync(full, 'utf8');
    const regex = /from\s+['"]([^'.][^'"]+)['"]/g;
    let match;
    while ((match = regex.exec(p)) !== null) {
      let name = match[1];
      if (name.startsWith('@')) {
         name = name.split('/').slice(0, 2).join('/');
      } else {
         name = name.split('/')[0];
      }
      if (!['fs', 'path', 'url', 'crypto', 'child_process'].includes(name) && !name.startsWith('virtual:')) {
         deps.add(name);
      }
    }
  }
}
scan('./src');
scan('./server.ts');
const depsArr = Array.from(deps);

const pkg = {
  name: "react-example",
  private: true,
  type: "module",
  scripts: {
    "dev": "tsx server.ts",
    "build": "tsc && vite build",
    "start": "NODE_ENV=production node --import tsx server.ts"
  },
  dependencies: {}
};
depsArr.forEach(d => {
  pkg.dependencies[d] = 'latest';
});

// Write to package.json
fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2));
console.log("Written dependencies: " + depsArr.join(', '));
