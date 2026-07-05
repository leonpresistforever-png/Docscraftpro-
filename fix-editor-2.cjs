const fs = require('fs');
let code = fs.readFileSync('src/pages/EditorPage.tsx', 'utf-8');
code = code.replace("DividerBlock,", "// DividerBlock,");
code = code.replace("SignatureBlock,", "// SignatureBlock,");
fs.writeFileSync('src/pages/EditorPage.tsx', code);
