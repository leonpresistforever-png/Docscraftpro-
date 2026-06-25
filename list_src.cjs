const fs = require('fs');
const path = require('path');

function listFiles(dir) {
  try {
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const fullPath = path.join(dir, file);
      const relativePath = path.relative('/app/applet', fullPath);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        console.log(`[DIR] ${relativePath}`);
        listFiles(fullPath);
      } else {
        console.log(`[FILE] ${relativePath} (${stat.size} bytes)`);
      }
    }
  } catch (err) {
    console.error(err);
  }
}

console.log('Listing files in /app/applet/src...');
listFiles('/app/applet/src');
