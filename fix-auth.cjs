const fs = require('fs');
let code = fs.readFileSync('src/pages/SettingsPage.tsx', 'utf-8');

code = code.replace("import { db, auth } from '../lib/firebase';", "import { db } from '../lib/firebase';");

fs.writeFileSync('src/pages/SettingsPage.tsx', code);
