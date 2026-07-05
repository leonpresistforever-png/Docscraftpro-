const fs = require('fs');
let code = fs.readFileSync('src/pages/EditorPage.tsx', 'utf-8');

const newExtensions = `
const DividerBlock = Node.create({
  name: 'dividerBlock',
  group: 'block',
  atom: true,
  addAttributes() {
    return {
      type: { default: 'horizontal' },
      color: { default: '#e5e7eb' },
      thickness: { default: 2 }
    }
  },
  parseHTML() {
    return [{ tag: 'div[data-type="divider"]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'divider' })]
  },
  addNodeView() {
    return ReactNodeViewRenderer(({ node, updateAttributes }) => {
      const isVertical = node.attrs.type === 'vertical';
      return (
        <NodeViewWrapper className="flex justify-center items-center my-4 group relative w-full overflow-visible">
          <div 
            style={{ 
              backgroundColor: node.attrs.color,
              height: isVertical ? '100px' : \`\${node.attrs.thickness}px\`,
              width: isVertical ? \`\${node.attrs.thickness}px\` : '100%',
              margin: isVertical ? '0 auto' : '0'
            }} 
            className="rounded-full shadow-sm"
          />
          {/* Controls visible on hover */}
          <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 bg-white shadow-md border rounded p-1 flex gap-1 z-10 transition-opacity">
            <button onClick={() => updateAttributes({ type: isVertical ? 'horizontal' : 'vertical' })} className="text-[10px] bg-slate-100 hover:bg-slate-200 px-1 rounded">Flip</button>
            <input type="color" value={node.attrs.color} onChange={e => updateAttributes({ color: e.target.value })} className="w-4 h-4 p-0 border-0 rounded cursor-pointer" />
            <input type="number" min="1" max="10" value={node.attrs.thickness} onChange={e => updateAttributes({ thickness: Number(e.target.value) })} className="w-8 text-[10px] border rounded px-1" />
          </div>
        </NodeViewWrapper>
      )
    })
  }
});

const SignatureBlock = Node.create({
  name: 'signatureBlock',
  group: 'block',
  atom: true,
  addAttributes() {
    return {
      signedName: { default: '' },
      date: { default: '' }
    }
  },
  parseHTML() {
    return [{ tag: 'div[data-type="signature"]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'signature' })]
  },
  addNodeView() {
    return ReactNodeViewRenderer(({ node, updateAttributes }) => {
      return (
        <NodeViewWrapper className="my-8 w-full max-w-sm ml-auto border border-slate-200 p-4 rounded-lg bg-slate-50/50 flex flex-col gap-4 relative group">
          <div className="text-[10px] text-slate-400 uppercase font-bold absolute -top-2 bg-white px-2 left-4">Legal Signature</div>
          <div className="flex flex-col gap-1">
             <input type="text" placeholder="Signer Name" value={node.attrs.signedName} onChange={e => updateAttributes({ signedName: e.target.value })} className="bg-transparent border-b border-slate-300 focus:border-indigo-500 outline-none font-serif text-lg py-1 italic" />
          </div>
          <div className="flex flex-col gap-1">
             <input type="date" value={node.attrs.date} onChange={e => updateAttributes({ date: e.target.value })} className="bg-transparent border-b border-slate-300 focus:border-indigo-500 outline-none text-xs py-1" />
          </div>
        </NodeViewWrapper>
      )
    })
  }
});
`;

if (!code.includes('DividerBlock')) {
  // Find where extensions are defined
  const marker = "const MangaPanel = Node.create({";
  code = code.replace(marker, newExtensions + '\n' + marker);
  
  // Add to editor extensions array
  const extMarker = "MangaPanel,";
  code = code.replace(extMarker, "MangaPanel,\n      DividerBlock,\n      SignatureBlock,");

  // Add slash commands for them
  const slashMenuRegex = /id: 'manga',[\s\S]*?\},/g;
  const match = code.match(slashMenuRegex);
  if (match) {
    const slashAdd = `id: 'divider',
        title: 'Smart Divider',
        description: 'Add a customizable divider',
        icon: <Layout className="w-4 h-4" />,
        command: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).insertContent({ type: 'dividerBlock' }).run();
        }
      },
      {
        id: 'signature',
        title: 'Legal Signature',
        description: 'Add a signature block for contracts',
        icon: <PenTool className="w-4 h-4" />,
        command: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).insertContent({ type: 'signatureBlock' }).run();
        }
      },`;
    code = code.replace(match[0], match[0] + '\n      {\n        ' + slashAdd);
  }
  
  fs.writeFileSync('src/pages/EditorPage.tsx', code);
  console.log("Added extensions");
}
