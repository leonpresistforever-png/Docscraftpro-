const fs = require('fs');
let code = fs.readFileSync('src/pages/EditorPage.tsx', 'utf-8');
code = code.replace("node.nodeType === Node.ELEMENT_NODE", "node.nodeType === 1"); // 1 is ELEMENT_NODE
code = code.replace("const dividerBlock = new DividerBlock();", "// const dividerBlock = new DividerBlock();");
code = code.replace("const signatureBlock = new SignatureBlock();", "// const signatureBlock = new SignatureBlock();");
code = code.replace(/<DividerBlock \/>/g, "{/* <DividerBlock /> */}");
code = code.replace(/<SignatureBlock \/>/g, "{/* <SignatureBlock /> */}");
fs.writeFileSync('src/pages/EditorPage.tsx', code);
