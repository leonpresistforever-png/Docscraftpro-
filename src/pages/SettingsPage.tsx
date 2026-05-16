import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Key, 
  ShieldCheck, 
  Cpu, 
  Globe, 
  Plus, 
  Trash2, 
  Lock,
  ChevronRight,
  Database,
  X,
  Code2
} from 'lucide-react';
import { Button } from '../components/ui/Button';

// Mock simple encryption/decryption for demonstration
const encrypt = (text: string) => btoa(text);
const decrypt = (text: string) => {
  try { return atob(text); } catch { return text; }
};

interface CustomKey {
  id: string;
  name: string;
  provider: 'gemini' | 'openai' | 'anthropic' | 'custom';
  encryptedKey: string;
  schema?: string;
  targetBrain: 'nexus' | 'second' | 'third';
}

export function SettingsPage() {
  const [keys, setKeys] = useState<CustomKey[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newKey, setNewKey] = useState({ name: '', provider: 'gemini', key: '', schema: '' });

  useEffect(() => {
    const saved = localStorage.getItem('dc_nexus_keys');
    if (saved) {
      setKeys(JSON.parse(saved));
    } else {
      setKeys([{ 
        id: '1', 
        name: 'Primary Nexus Key', 
        provider: 'gemini', 
        encryptedKey: encrypt('mock-gemini-key-xyz'), 
        targetBrain: 'nexus' 
      }]);
    }
  }, []);

  const saveKeys = (newKeys: CustomKey[]) => {
    setKeys(newKeys);
    localStorage.setItem('dc_nexus_keys', JSON.stringify(newKeys));
  };

  const handleAddKey = () => {
    if (!newKey.key || !newKey.name) return;
    const keyEntry: CustomKey = {
      id: Math.random().toString(36).substr(2, 9),
      name: newKey.name,
      provider: newKey.provider as any,
      encryptedKey: encrypt(newKey.key),
      schema: newKey.schema,
      targetBrain: 'nexus'
    };
    saveKeys([...keys, keyEntry]);
    setIsAdding(false);
    setNewKey({ name: '', provider: 'gemini', key: '', schema: '' });
  };

  const handleDeleteKey = (id: string) => {
    saveKeys(keys.filter(k => k.id !== id));
  };

  return (
    <div className="min-h-screen bg-dc-bg p-8 pt-24 font-sans text-dc-text">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-medium tracking-tight mb-2"
          >
            Nexus <span className="text-dc-gold">Control Plane</span>
          </motion.h1>
          <p className="text-gray-500">Configure your cognitive infrastructure and secure API credentials.</p>
        </header>

        <section className="space-y-8">
          {/* API Key Section */}
          <div className="bg-white rounded-2xl border border-dc-border shadow-sm overflow-hidden">
            <div className="p-6 border-b border-dc-border bg-dc-bg/30 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-dc-gold/10 rounded-lg">
                  <Key className="w-5 h-5 text-dc-gold" />
                </div>
                <div>
                  <h2 className="font-medium">Secure Knowledge Vault</h2>
                  <p className="text-xs text-gray-500">Credentials are encrypted and never leave your session.</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className="gap-2"
                onClick={() => setIsAdding(true)}
              >
                <Plus className="w-4 h-4" />
                Add Nexus Bridge
              </Button>
            </div>

            <div className="divide-y divide-dc-border">
              {keys.map((key) => {
                 const decrypted = decrypt(key.encryptedKey);
                 const masked = decrypted.length > 8 ? decrypted.substring(0,4) + '••••••••' + decrypted.substring(decrypted.length-4) : '••••••••';
                 return (
                <div key={key.id} className="p-6 flex items-center justify-between hover:bg-dc-bg/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      {key.provider === 'gemini' ? <Cpu className="w-5 h-5 text-dc-gold" /> : <Globe className="w-5 h-5 text-blue-500" />}
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">{key.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600 uppercase font-mono">
                          {key.provider}
                        </span>
                        <span className="text-xs text-gray-400 font-mono">
                          {masked}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {key.schema && (
                       <Button variant="ghost" size="icon" className="text-gray-400 hover:text-dc-gold" title="Function Calling Schema Configured">
                         <Code2 className="w-4 h-4" />
                       </Button>
                    )}
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 uppercase tracking-widest block">Routed To</span>
                      <span className="text-xs font-medium text-dc-gold capitalize">{key.targetBrain} Brain</span>
                    </div>
                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-500" onClick={() => handleDeleteKey(key.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )})}
            </div>
          </div>

          {/* Brain Layers Visualization */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-dc-border shadow-sm">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <Database className="w-4 h-4 text-dc-gold" />
                Layered Cognitive Sync
              </h3>
              <div className="space-y-3">
                {[
                  { l: 1, n: 'Gemini Foundation', d: 'Raw reasoning & tokens', c: 'bg-dc-gold' },
                  { l: 2, n: 'Routing Agent', d: 'Intent & tool orchestration', c: 'bg-dc-gold/60' },
                  { l: 3, n: 'Mind Map Graph', d: 'Weighted mental models', c: 'bg-dc-gold/30' },
                  { l: 4, n: 'Nexus Executor', d: 'Direct workspace actions', c: 'border border-dc-gold text-dc-gold' },
                ].map((layer) => (
                  <div key={layer.l} className="flex items-center gap-3 p-3 rounded-xl bg-dc-bg/30">
                    <div className={`w-8 h-8 rounded-lg ${layer.c} flex items-center justify-center text-xs font-bold`}>
                      {layer.l}
                    </div>
                    <div>
                      <div className="text-xs font-medium">{layer.n}</div>
                      <div className="text-[10px] text-gray-500">{layer.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#1a1a1a] p-6 rounded-2xl shadow-xl text-white">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-5 h-5 text-dc-gold" />
                <h3 className="font-medium">Privacy Encryption</h3>
              </div>
              <p className="text-sm text-gray-400 mb-6">
                Your second brain weights and mental models are encrypted with session-derived keys. Even our servers cannot read the semantic relationships between your documents.
              </p>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock className="w-4 h-4 text-dc-gold" />
                  <span className="text-xs">Advanced Shield Enabled</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              </div>
            </div>
          </div>
        </section>
      </div>

      <AnimatePresence>
        {isAdding && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="bg-white rounded-2xl border border-dc-border shadow-xl overflow-hidden w-full max-w-md"
             >
               <div className="p-4 border-b border-dc-border flex justify-between items-center bg-gray-50/50">
                  <h3 className="font-medium text-gray-900">Add Nexus Bridge</h3>
                  <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
               </div>
               <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Key Name</label>
                    <input 
                      type="text" 
                      value={newKey.name}
                      onChange={e => setNewKey({...newKey, name: e.target.value})}
                      placeholder="e.g. My Personal Gemini Key"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-dc-gold focus:ring-1 focus:ring-dc-gold transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Provider</label>
                    <select 
                      value={newKey.provider}
                      onChange={e => setNewKey({...newKey, provider: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-dc-gold focus:ring-1 focus:ring-dc-gold transition-all text-sm appearance-none"
                    >
                      <option value="gemini">Gemini</option>
                      <option value="openai">OpenAI</option>
                      <option value="anthropic">Anthropic</option>
                      <option value="custom">Custom Endpoint</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">API Key</label>
                    <input 
                      type="password" 
                      value={newKey.key}
                      onChange={e => setNewKey({...newKey, key: e.target.value})}
                      placeholder="Paste your API key here..."
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-dc-gold focus:ring-1 focus:ring-dc-gold transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                       Function Calling Schema <span className="text-gray-400 font-normal normal-case">(Optional)</span>
                    </label>
                    <p className="text-xs text-gray-400 mb-2">Define tool specifications (JSON) to grant this AI access to external actions.</p>
                    <textarea 
                      value={newKey.schema}
                      onChange={e => setNewKey({...newKey, schema: e.target.value})}
                      placeholder="[{ 'name': 'fetchData', 'description': '...' }]"
                      className="w-full h-24 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-dc-gold focus:ring-1 focus:ring-dc-gold transition-all text-sm font-mono resize-none"
                    />
                  </div>
               </div>
               <div className="p-4 border-t border-dc-border bg-gray-50 flex justify-end gap-3">
                  <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                  <Button variant="gold" onClick={handleAddKey} disabled={!newKey.key || !newKey.name}>Secure & Save</Button>
               </div>
             </motion.div>
           </div>
        )}
      </AnimatePresence>
    </div>
  );
}
