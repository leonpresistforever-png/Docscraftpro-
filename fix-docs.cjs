const fs = require('fs');
let code = fs.readFileSync('src/pages/docs/DocsOverviewPage.tsx', 'utf-8');

const newContent = `
        <div className="prose prose-slate max-w-none space-y-12">
          <div className="min-h-[300px] flex flex-col justify-center">
             <p className="text-xl text-slate-600 leading-loose">
               Welcome to the Docscraft Overview. This platform represents a paradigm shift in how we approach document creation, 
               moving away from rigid paginated layouts to fluid, infinite canvases powered by real-time collaboration and robust artificial intelligence.
             </p>
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent my-24"></div>

          <div className="min-h-[400px]">
            <h2 className="text-3xl font-black mb-8 text-slate-900 tracking-tight">The Core Philosophy</h2>
            <p className="text-lg text-slate-600 leading-loose mb-8">
              At the heart of Docscraft lies the belief that tools should adapt to the writer, not the other way around. 
              Our architecture is fundamentally designed around block-based editing. Every paragraph, image, and list is a distinct entity that can be dragged, transformed, and referenced.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-16">
              <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-xl font-bold mb-4">Fluid Modularity</h3>
                <p className="text-slate-600 leading-relaxed">Break your documents down into their atomic components. Restructure entire articles in seconds by dragging and dropping conceptual blocks rather than copying and pasting strings of text.</p>
              </div>
              <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-xl font-bold mb-4">Uncompromising Privacy</h3>
                <p className="text-slate-600 leading-relaxed">Your keystrokes belong to you. With optional end-to-end encryption and local-first persistence models, Docscraft guarantees that sensitive enterprise IP never falls into the wrong hands.</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center my-32">
             <div className="w-24 h-1 bg-indigo-200 rounded-full"></div>
          </div>

          <div className="min-h-[400px]">
             <h2 className="text-3xl font-black mb-8 text-slate-900 tracking-tight">Built for Scale</h2>
             <p className="text-lg text-slate-600 leading-loose">
               Whether you are a solo entrepreneur drafting a business plan or an enterprise organization maintaining thousands of standard operating procedures, Docscraft scales effortlessly. 
               Our underlying CRDT (Conflict-free Replicated Data Type) engine ensures that hundreds of users can edit the same document simultaneously without ever encountering a merge conflict.
               <br/><br/>
               Furthermore, the integrated DocCraft Agent serves as a constant companion. It can summarize long research notes, suggest structural improvements, or even write boilerplate code directly within your technical documentation.
             </p>
          </div>

          <div className="w-full h-px border-b border-dashed border-slate-300 my-24"></div>
          
          <div className="min-h-[300px]">
             <h2 className="text-2xl font-bold mb-6">Where to go from here?</h2>
             <ul className="space-y-4 list-disc pl-6 text-slate-600">
               <li>Navigate to the <strong className="text-indigo-600">Getting Started</strong> section to set up your first workspace.</li>
               <li>Explore the <strong className="text-indigo-600">Blocks & Formatting</strong> guide to master our rich text engine.</li>
               <li>Learn how to optimize your workflow in the <strong className="text-indigo-600">Keyboard Shortcuts</strong> directory.</li>
             </ul>
          </div>
        </div>
`;

code = code.replace(/<p className="text-lg text-slate-600 mb-8">[\s\S]*?<\/p>/, newContent);

fs.writeFileSync('src/pages/docs/DocsOverviewPage.tsx', code);
console.log("Updated Docs Overview");
