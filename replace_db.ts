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

    if (filepath.includes('ProfileMenu.tsx')) {
       if (content.includes("from 'firebase/auth'")) {
           content = content.replace("import { updateProfile } from 'firebase/auth';", "import { updateProfile } from '../../lib/mockDb';");
           changed = true;
       }
    }

    if (content.match(/import \{.*\} from 'firebase\/firestore';/)) {
        const importMatch = content.match(/import \{([^}]+)\} from 'firebase\/firestore';/);
        if (importMatch && importMatch[1].includes('collection')) {
            const relPath = filepath.split('/').length > 3 ? "../../lib/mockDb" : "../lib/mockDb";
            content = content.replace(importMatch[0], `import {${importMatch[1]}} from '${relPath}';`);
            changed = true;
        }
    }

    if (content.includes("from '../lib/firebase'")) {
        content = content.replace(/import \{ db \} from '\.\.\/lib\/firebase';/g, "import { db } from '../lib/mockDb';");
        content = content.replace(/import \{ auth \} from '\.\.\/lib\/firebase';/g, "import { auth } from '../lib/mockDb';");
        changed = true;
    }
    if (content.includes("from '../../lib/firebase'")) {
        content = content.replace(/import \{ db \} from '\.\.\/\.\.\/lib\/firebase';/g, "import { db } from '../../lib/mockDb';");
        content = content.replace(/import \{ auth \} from '\.\.\/\.\.\/lib\/firebase';/g, "import { auth } from '../../lib/mockDb';");
        changed = true;
    }

    if (changed) {
      fs.writeFileSync(filepath, content, 'utf8');
      console.log('Updated to mockDb:', filepath);
    }
  }
});
