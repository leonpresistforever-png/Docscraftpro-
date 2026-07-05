const fs = require('fs');
let code = fs.readFileSync('src/pages/EditorPage.tsx', 'utf-8');

if (!code.includes('import { Node, mergeAttributes')) {
  code = code.replace("import { useEditor, EditorContent } from '@tiptap/react';", "import { useEditor, EditorContent, NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';\nimport { Node, mergeAttributes } from '@tiptap/core';");
  fs.writeFileSync('src/pages/EditorPage.tsx', code);
  console.log("Fixed imports");
}
