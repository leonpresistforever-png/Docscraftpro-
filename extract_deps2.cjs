const fs = require('fs');
const path = require('path');

const deps = new Set();
function scan(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      scan(full);
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
}
scan('./src');
scan('./server.ts');
const depsArr = Array.from(deps);
console.log(depsArr.join(' '));
