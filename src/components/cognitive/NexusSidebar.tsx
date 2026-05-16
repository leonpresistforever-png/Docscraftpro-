import React, { useState, useRef } from 'react';
import { Activity, Cpu, Network, Zap, Hexagon, Database, Radio, Menu, X, Upload, Settings2, Code, User, Command, Trash2, Brain, Layers, Sparkles } from 'lucide-react';
import { NexusLogo } from '../ui/NexusLogo';
import { CustomTool, NexusTier } from '../../pages/NexusAiPage';

interface NexusSidebarProps {
  profilePic?: string | null;
  setProfilePic?: (pic: string | null) => void;
  instructions?: string;
  setInstructions?: (inst: string) => void;
  tools?: CustomTool[];
  setTools?: (tools: CustomTool[]) => void;
  model?: NexusTier;
  setModel?: (m: NexusTier) => void;
  credits?: number;
}

import { useNavigate } from 'react-router-dom';

export function NexusSidebar({ profilePic, setProfilePic, instructions, setInstructions, tools = [], setTools, model = 'flash', setModel, credits = 0 }: NexusSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [telemetryOpen, setTelemetryOpen] = useState(false);
  const navigate = useNavigate();
  // local state fallback for testing or standalone usage
  const [localProfilePic, setLocalProfilePic] = useState<string | null>(null);

  const currentProfilePic = profilePic !== undefined ? profilePic : localProfilePic;
  const handleProfilePicUpdate = setProfilePic || setLocalProfilePic;
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [editingTool, setEditingTool] = useState<CustomTool | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleProfilePicUpdate(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTool = () => {
     setEditingTool({
        id: Math.random().toString(36).substr(2, 9),
        name: 'my_tool',
        description: 'Does something useful.',
        endpoint: 'https://api.example.com/v1/data',
        method: 'POST',
        headers: '{\n  "Authorization": "Bearer YOUR_API_KEY",\n  "Content-Type": "application/json"\n}',
        schema: '{\n  "type": "object",\n  "properties": {\n    "query": { "type": "string" }\n  }\n}'
     });
  };

  const saveTool = () => {
     if (editingTool && setTools) {
        const exists = tools.find(t => t.id === editingTool.id);
        if (exists) {
           setTools(tools.map(t => t.id === editingTool.id ? editingTool : t));
        } else {
           setTools([...tools, editingTool]);
        }
     }
     setEditingTool(null);
  };

  const deleteTool = (id: string, e: React.MouseEvent) => {
     e.stopPropagation();
     if (setTools) {
        setTools(tools.filter(t => t.id !== id));
     }
  };

  return (
    <>
      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed top-6 right-8 z-[260] w-12 h-12 bg-white/40 backdrop-blur-md border border-white/50 rounded-full flex items-center justify-center text-gray-700 shadow-sm hover:bg-white/60 hover:shadow-md transition-all pointer-events-auto"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Main Customization Sidebar */}
      <div 
        className={`fixed inset-y-0 right-0 w-[400px] bg-white/40 backdrop-[blur(40px)] border-l border-white/50 shadow-2xl z-[270] transform transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <Settings2 className="w-5 h-5 text-gray-500" />
              <h2 className="text-sm tracking-[0.2em] uppercase font-bold text-gray-700">Model Customization</h2>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-800 transition-colors p-2 bg-white/30 rounded-full">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Profile Picture Upload */}
          <div className="mb-10 flex flex-col items-center">
             <div className="relative group cursor-pointer mb-4" onClick={() => fileInputRef.current?.click()}>
               <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 border-2 border-white/60 shadow-lg flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105">
                 {currentProfilePic ? (
                   <img src={currentProfilePic} alt="Nexus Profile" className="w-full h-full object-cover" />
                 ) : (
                   <div className="w-14 h-14 bg-white/50 rounded-2xl p-1 shadow-sm border border-gray-200">
                     <NexusLogo />
                   </div>
                 )}
                 <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                   <Upload className="w-5 h-5 text-white" />
                 </div>
               </div>
               <input 
                 type="file" 
                 ref={fileInputRef}
                 onChange={handleImageUpload}
                 accept="image/*"
                 className="hidden"
               />
             </div>
             <div className="text-center">
               <h3 className="text-lg font-medium text-gray-800 tracking-tight">Nexus Identity</h3>
               <p className="text-[11px] text-gray-500 uppercase tracking-widest mt-1">Tap to customize avatar</p>
             </div>
          </div>

          {/* Instructions Config */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Command className="w-4 h-4 text-gray-500" />
              <h3 className="text-xs uppercase tracking-widest font-bold text-gray-600">Base Instructions</h3>
            </div>
            <textarea 
              value={instructions}
              onChange={(e) => setInstructions?.(e.target.value)}
              placeholder="Define rules, tone, and directives for Nexus..."
              className="w-full h-32 bg-white/50 border border-white/60 rounded-2xl p-4 text-sm font-light text-gray-700 placeholder:text-gray-400 outline-none focus:ring-4 focus:ring-black/5 focus:bg-white/70 transition-all resize-none shadow-inner"
            />
          </div>

          {/* Model Reasoning */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-4 h-4 text-gray-500" />
              <h3 className="text-xs uppercase tracking-widest font-bold text-gray-600">Model Reasoning</h3>
            </div>
            
            <div className="space-y-3">
              {[
                 { id: 'flash', label: 'Nexus Flash', desc: 'Basic rapid execution.', icon: <Zap className="w-4 h-4"/> },
                 { id: 'reasoning', label: 'Nexus Reasoning', desc: 'Analysis and suggestions.', icon: <Layers className="w-4 h-4"/> },
                 { id: 'complex', label: 'Nexus Complex Thinking', desc: 'Multi-agent orchestration.', icon: <Network className="w-4 h-4"/> },
                 { id: 'pro', label: 'Nexus Pro', desc: 'Maximum computational power.', icon: <Cpu className="w-4 h-4"/> }
              ].map(m => (
                 <div 
                   key={m.id} 
                   onClick={() => setModel && setModel(m.id as NexusTier)}
                   className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${model === m.id ? 'bg-white border-black/10 shadow-md transform scale-[1.02]' : 'bg-white/30 border-transparent hover:bg-white/50 text-gray-500'}`}
                 >
                   <div className={`w-8 h-8 rounded-full flex items-center justify-center ${model === m.id ? 'bg-black text-white' : 'bg-black/5 text-gray-500'}`}>
                      {m.icon}
                   </div>
                   <div>
                      <h4 className={`text-sm font-bold ${model === m.id ? 'text-gray-800' : 'text-gray-600'}`}>{m.label}</h4>
                      <p className="text-[10px] text-gray-400">{m.desc}</p>
                   </div>
                 </div>
              ))}
            </div>
          </div>

          {/* Functions Addon */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-gray-500" />
                <h3 className="text-xs uppercase tracking-widest font-bold text-gray-600">Functions</h3>
              </div>
            </div>
            
            {tools.length > 0 && (
               <div className="space-y-3 mb-4">
                 {tools.map(tool => (
                    <div key={tool.id} onClick={() => setEditingTool(tool)} className="p-4 bg-white/40 border border-white/60 rounded-xl hover:bg-white/60 transition-colors cursor-pointer flex justify-between shadow-sm group">
                       <div>
                         <p className="text-xs font-bold text-gray-700 font-mono">{tool.name}</p>
                         <p className="text-[10px] text-gray-500 line-clamp-1 max-w-[200px]">{tool.description}</p>
                       </div>
                       <button onClick={(e) => deleteTool(tool.id, e)} className="text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                 ))}
               </div>
            )}

            <div onClick={handleAddTool} className="p-5 border border-dashed border-gray-400/50 rounded-2xl bg-white/20 hover:bg-white/40 transition-colors flex flex-col items-center justify-center text-center cursor-pointer group">
               <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm">
                 <span className="text-lg text-gray-500 leading-none">+</span>
               </div>
               <p className="text-sm font-medium text-gray-600">Add Custom Tool</p>
               <p className="text-[10px] text-gray-400 mt-1 max-w-[200px]">Define schema to give Nexus API access</p>
            </div>
          </div>

          {/* Telemetry Trigger */}
          <div className="">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs uppercase tracking-widest font-bold text-gray-600">Diagnostics</h3>
            </div>
            <button 
              onClick={() => setTelemetryOpen(true)}
              className="w-full p-4 bg-gray-800 hover:bg-gray-900 border border-gray-700 rounded-2xl flex items-center justify-between transition-colors shadow-lg group"
            >
              <div className="flex items-center gap-3">
                <Activity className="w-4 h-4 text-green-400 animate-pulse" />
                <span className="text-sm font-medium text-gray-100">System Telemetry</span>
              </div>
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                 <span className="text-xs text-gray-300">→</span>
              </div>
            </button>
          </div>

        </div>
      </div>

      {/* Editing Tool Modal */}
      {editingTool && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[290] flex items-center justify-center p-4">
           <div className="bg-[#FAF9F6] border border-white max-w-lg w-full rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-black/5 flex justify-between items-center bg-white/50">
                 <h3 className="font-bold tracking-tight text-gray-800">Configure Tool API</h3>
                 <button onClick={() => setEditingTool(null)} className="p-2 hover:bg-black/5 rounded-full"><X className="w-4 h-4"/></button>
              </div>
              <div className="p-6 overflow-y-auto space-y-4 flex-1">
                 <div>
                   <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-1 block">Function Name</label>
                   <input value={editingTool.name} onChange={e => setEditingTool({...editingTool, name: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-black/5 outline-none" placeholder="e.g. get_weather"/>
                 </div>
                 <div>
                   <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-1 block">Description</label>
                   <input value={editingTool.description} onChange={e => setEditingTool({...editingTool, description: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-black/5 outline-none" placeholder="What does it do?"/>
                 </div>
                 <div className="flex gap-3">
                   <div className="w-1/3">
                     <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-1 block">Method</label>
                     <select value={editingTool.method} onChange={e => setEditingTool({...editingTool, method: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-black/5 outline-none font-bold">
                       <option value="GET">GET</option>
                       <option value="POST">POST</option>
                     </select>
                   </div>
                   <div className="w-2/3">
                     <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-1 block">Endpoint URL</label>
                     <input value={editingTool.endpoint} onChange={e => setEditingTool({...editingTool, endpoint: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-black/5 outline-none" placeholder="https://api..."/>
                   </div>
                 </div>
                 <div>
                   <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-1 block">Headers (JSON)</label>
                   <textarea value={editingTool.headers} onChange={e => setEditingTool({...editingTool, headers: e.target.value})} className="w-full h-24 bg-white border border-gray-200 rounded-xl p-3 text-sm font-mono text-gray-600 focus:ring-2 focus:ring-black/5 outline-none resize-none" placeholder="{ Authorization: 'Bearer xxx' }"/>
                 </div>
                 <div>
                   <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-1 block">Arguments Schema (JSON)</label>
                   <textarea value={editingTool.schema} onChange={e => setEditingTool({...editingTool, schema: e.target.value})} className="w-full h-32 bg-white border border-gray-200 rounded-xl p-3 text-sm font-mono text-gray-600 focus:ring-2 focus:ring-black/5 outline-none resize-none" placeholder='{ "type": "object", "properties": { ... } }'/>
                 </div>
              </div>
              <div className="p-6 border-t border-black/5 bg-white/50 flex justify-end">
                 <button onClick={saveTool} className="px-6 py-3 bg-gray-900 text-white font-bold rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-sm">Save Function</button>
              </div>
           </div>
        </div>
      )}

      {/* Secondary Telemetry Sidebar */}
      <div 
        className={`fixed inset-y-0 right-0 w-[340px] bg-white/50 backdrop-blur-[50px] border-l border-white/60 shadow-2xl z-[280] transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col mix-blend-luminosity ${telemetryOpen ? 'translate-x-[0px]' : 'translate-x-full'}`}
      >
        <div className="p-8 flex-1 overflow-y-auto no-scrollbar">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-black/5">
            <div className="flex items-center gap-3">
              <Hexagon className="w-5 h-5 text-gray-500 animate-pulse-slow" />
              <h3 className="text-xs tracking-[0.2em] uppercase font-bold text-gray-700">Live Telemetry</h3>
            </div>
            <button onClick={() => setTelemetryOpen(false)} className="text-gray-400 hover:text-gray-800 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Metric 0: Quota */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2 text-gray-600">
                <Database className="w-4 h-4" />
                <span className="text-xs font-medium tracking-wider uppercase">Available Credits</span>
              </div>
              <span className="text-[10px] font-bold text-[#D4AF37]">{Math.floor(credits)}</span>
            </div>
            <div className="w-full h-1 bg-white/50 rounded-full overflow-hidden">
              <div 
                className={`h-full ${credits < 10 ? 'bg-gradient-to-r from-red-400 to-red-600' : 'bg-gradient-to-r from-[#D4AF37] to-[#996A00]'} rounded-full shadow-[0_0_10px_rgba(212,175,55,0.5)]`}
                style={{ width: `${Math.min((credits / 150) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Metric 1 */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2 text-gray-600">
                <Cpu className="w-4 h-4" />
                <span className="text-xs font-medium tracking-wider uppercase">Neural Load</span>
              </div>
              <span className="text-[10px] font-bold text-gray-400">42%</span>
            </div>
            <div className="w-full h-1 bg-white/50 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-gray-400 to-gray-600 w-[42%] rounded-full shadow-[0_0_10px_rgba(156,163,175,0.5)]"></div>
            </div>
          </div>

          {/* Active Modules Map */}
          <div className="flex-1">
            <h4 className="text-[10px] tracking-[0.2em] uppercase text-gray-500 font-bold mb-4">Active Modules</h4>
            <div className="space-y-3">
              
              <div className="p-3 bg-white/60 border border-white/80 rounded-2xl flex items-start gap-3 hover:bg-white/80 transition-colors cursor-default shadow-sm">
                <div className="p-2 bg-gradient-to-br from-gray-100 to-white rounded-xl shadow-inner text-gray-500">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-[11px] font-bold tracking-wider uppercase text-gray-700 mb-0.5">WebGL Renderer</h5>
                  <p className="text-[10px] text-gray-500 leading-tight">60 FPS target locked. Instanced processing active.</p>
                </div>
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400 mt-2 shadow-[0_0_5px_rgba(74,222,128,0.5)] animate-pulse"></div>
              </div>

              <div className="p-3 bg-white/60 border border-white/80 rounded-2xl flex items-start gap-3 hover:bg-white/80 transition-colors cursor-default shadow-sm">
                <div className="p-2 bg-gradient-to-br from-gray-100 to-white rounded-xl shadow-inner text-gray-500">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-[11px] font-bold tracking-wider uppercase text-gray-700 mb-0.5">Vector Vault</h5>
                  <p className="text-[10px] text-gray-500 leading-tight">Indexed context synchronized and ready.</p>
                </div>
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400 mt-2 shadow-[0_0_5px_rgba(74,222,128,0.5)] animate-pulse" style={{ animationDelay: '300ms' }}></div>
              </div>

              <div className="p-3 bg-white/30 border border-white/50 rounded-2xl flex items-start gap-3 opacity-70">
                <div className="p-2 bg-white/50 rounded-xl text-gray-500">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-[11px] font-bold tracking-wider uppercase text-gray-600 mb-0.5">Global Relay</h5>
                  <p className="text-[10px] text-gray-500 leading-tight">Waiting for network broadcast signal.</p>
                </div>
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-gray-300 mt-2"></div>
              </div>

            </div>
          </div>

          {/* Footer Data */}
          <div className="mt-8 pt-4 border-t border-black/5 flex justify-between items-center">
            <div className="flex items-center gap-1.5 opacity-60">
               <Activity className="w-3.5 h-3.5 text-gray-500" />
               <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">Node 04-X</span>
            </div>
            <span className="text-[9px] uppercase tracking-[0.2em] text-gray-400">Online</span>
          </div>

        </div>
      </div>
      
      {/* Overlay backdrop when either sidebar is open (optional, keeps focus) */}
      {(isOpen || telemetryOpen) && (
        <div 
          className="fixed inset-0 bg-white/10 backdrop-[blur(1px)] z-[255] transition-opacity duration-500 pointer-events-auto"
          onClick={() => {
            setTelemetryOpen(false);
            setIsOpen(false);
          }}
        />
      )}
    </>
  );
}
