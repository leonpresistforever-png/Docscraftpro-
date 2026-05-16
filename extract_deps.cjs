const fs = require('fs');
const cp = require('child_process');

// run grep
try {
  const result = cp.execSync("grep -rh \"^import\" src/ server.ts").toString();
  const importLines = result.split("\\n");
  const deps = new Set();
  
  importLines.forEach(line => {
    const match = line.match(/from\\s+['"]([^.'"][^'"]+)['"]/);
    if (match) {
      let pkgName = match[1];
      if (pkgName.startsWith('@')) {
        pkgName = pkgName.split('/').slice(0, 2).join('/');
      } else {
        pkgName = pkgName.split('/')[0];
      }
      // some built-in ignore
      if (!['fs', 'path', 'crypto', 'child_process', 'url'].includes(pkgName)) {
        deps.add(pkgName);
      }
    }
  });

  console.log(Array.from(deps).join(' '));
} catch (e) {
  console.log(e);
}
