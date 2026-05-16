import fs from 'fs';
import path from 'path';

function walk(dir: string, callback: (filepath: string) => void) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(dirPath);
  });
}

walk('./src', (filepath) => {
  if (filepath.endsWith('.tsx') || filepath.endsWith('.ts')) {
    let content = fs.readFileSync(filepath, 'utf8');
    let changed = false;

    // Special match for ProfileMenu since it uses updateProfile from mockDb directly
    if (filepath.includes('ProfileMenu.tsx')) {
       if (content.includes("from '../../lib/mockDb'")) {
           content = content.replace("import { updateProfile } from '../../lib/mockDb';", "import { updateProfile } from 'firebase/auth';");
           changed = true;
       }
    }

    if (content.match(/import \{.*\} from '(\.\.|\.\.\/\.\.)\/lib\/mockDb';/)) {
        // replace occurrences of firestore methods from mockDb to firebase/firestore
        const importMatch1 = content.match(/import \{([^}]+)\} from '\.\.\/lib\/mockDb';/);
        if (importMatch1 && importMatch1[1].includes('collection')) {
            content = content.replace(importMatch1[0], `import {${importMatch1[1]}} from 'firebase/firestore';`);
            changed = true;
        }

        const importMatch2 = content.match(/import \{([^}]+)\} from '\.\.\/\.\.\/lib\/mockDb';/);
        if (importMatch2 && importMatch2[1].includes('collection')) {
            content = content.replace(importMatch2[0], `import {${importMatch2[1]}} from 'firebase/firestore';`);
            changed = true;
        }

        content = content.replace(/import \{ db \} from '\.\.\/lib\/mockDb';/g, "import { db } from '../lib/firebase';");
        content = content.replace(/import \{ db \} from '\.\.\/\.\.\/lib\/mockDb';/g, "import { db } from '../../lib/firebase';");
        changed = true;
    }

    if (changed) {
      fs.writeFileSync(filepath, content, 'utf8');
      console.log('Restored', filepath);
    }
  }
});
