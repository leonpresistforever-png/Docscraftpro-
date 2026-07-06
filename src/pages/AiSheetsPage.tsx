import React, { useState, useRef, useEffect } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Button } from '../components/ui/Button';
import { 
  Send, X, ChevronDown, Edit2, Grid, Plus, Wrench, BicepsFlexed, Mic, 
  Settings, Key, Download, Image as ImageIcon, FileText, Check, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth } from '../lib/firebase';
import { collection, query, where, getDocs, getDoc, orderBy, setDoc, doc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { ChatHistoryDrawer } from '../components/ChatHistoryDrawer';
import { usePremium } from '../context/PremiumContext';
import { encryptData, decryptData } from '../lib/encryption';

interface SheetData {
  headers: string[];
  rows: any[][];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sheetData?: SheetData;
  isGenerating?: boolean;
}

export function AiSheetsPage() {
  const { user, userData } = useAuth();
  const { handleAction } = usePremium();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  // API Settings
  const baseUrl = import.meta.env.VITE_CUSTOM_AI_BASE_URL || 'https://models.inference.ai.azure.com/chat/completions';
  const modelName = import.meta.env.VITE_CUSTOM_AI_MODEL_NAME || 'gpt-4o';
  
  const [selectedSheet, setSelectedSheet] = useState<SheetData | null>(null);
  
  // Settings state
  const [showSettings, setShowSettings] = useState(false);
  const [customKey, setCustomKey] = useState(() => localStorage.getItem('AIS_CUSTOM_KEY') || '');
  
  // History capability
  const [sessionId, setSessionId] = useState<string>(() => `ais_${Date.now()}`);
  const [showHistory, setShowHistory] = useState(false);

  // Sheet Edit Mode
  const [isEditingSheet, setIsEditingSheet] = useState(false);

  // Modes
  const modes = ['Auto', 'Fast Placement', 'Deep Organization', 'Creative Draft'];
  const [currentMode, setCurrentMode] = useState(modes[0]);
  const [showModes, setShowModes] = useState(false);
  
  // Documents
  const [showDocs, setShowDocs] = useState(false);
  const [availableDocs, setAvailableDocs] = useState<any[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [selectedDocText, setSelectedDocText] = useState<string>('');
  const [loadingDocs, setLoadingDocs] = useState(false);
  
  // Attachments
  const [attachments, setAttachments] = useState<File[]>([]);
  const attachmentUrls = React.useMemo(() => {
    const map: Record<string, string> = {};
    attachments.forEach(f => {
       map[f.name] = URL.createObjectURL(f);
    });
    return map;
  }, [attachments]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (messages.length > 0 && user?.uid) {
       saveSession();
    }
  }, [messages]);

  const saveSession = async () => {
    if (!user?.uid || messages.length === 0) return;
    try {
       const sessionRef = doc(db, 'chat_sessions', sessionId);
       const titleMsg = messages.find(m => m.role === 'user');
       const title = titleMsg ? titleMsg.content.slice(0, 50) + (titleMsg.content.length > 50 ? '...' : '') : 'New Session';
       
       const snapshot = await getDoc(sessionRef);
       if (!snapshot.exists()) {
          await setDoc(sessionRef, {
             title,
             appType: 'ai_sheets',
             messages: JSON.stringify(messages),
             ownerId: user?.uid,
             updatedAt: serverTimestamp(),
             createdAt: serverTimestamp(),
          });
       } else {
          await setDoc(sessionRef, {
             title,
             appType: 'ai_sheets',
             messages: JSON.stringify(messages),
             ownerId: user?.uid,
             updatedAt: serverTimestamp(),
          }, { merge: true });
       }
    } catch (error: any) {
       console.error("Failed to save session:", error);
       if (error.message && error.message.includes("Missing or insufficient permissions")) {
         console.error('Firestore Error: ', { error: error.message, operationType: 'write', path: 'chat_sessions' });
       }
    }
  };

  const fetchDocs = async () => {
    if (!user?.uid) return;
    setLoadingDocs(true);
    try {
      const q = query(
        collection(db, 'documents'),
        where('ownerId', '==', user?.uid)
      );
      const snapshot = await getDocs(q);
      const docsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
      
      // Sort client-side by updatedAt descending
      docsData.sort((a, b) => {
        const t1 = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : (a.updatedAt?.seconds ? a.updatedAt.seconds * 1000 : 0);
        const t2 = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : (b.updatedAt?.seconds ? b.updatedAt.seconds * 1000 : 0);
        return t2 - t1;
      });
      
      setAvailableDocs(docsData);
    } catch (err) {
      console.error("Error fetching docs", err);
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleSelectDoc = (doc: any) => {
    if (selectedDocId === doc.id) {
       setSelectedDocId(null);
       setSelectedDocText('');
    } else {
       setSelectedDocId(doc.id);
       setSelectedDocText(doc.content || "Empty Document");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...newFiles].slice(0, 20)); // Max 20 images
    }
  };

  const renderCell = (cellValue: any): string => {
     let strVal = String(cellValue);
     
     attachments.forEach(file => {
        const url = attachmentUrls[file.name];
        if (url) {
            strVal = strVal.split(`src="${file.name}"`).join(`src="${url}"`);
            strVal = strVal.split(`src='${file.name}'`).join(`src='${url}'`);
            
            const escapedName = file.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`(^|[^"'])${escapedName}`, 'g');
            strVal = strVal.replace(regex, `$1<img src="${url}" alt="${file.name}" class="h-16 rounded object-contain inline-block m-1 cursor-pointer hover:opacity-80 transition-opacity mx-auto" />`);
        }
     });

     return strVal;
  }

  const handleSend = async () => {
    if (!input.trim() && attachments.length === 0) return;
    if (loading) return;

    handleAction('sheets', async () => {
      const compiledMessage = input + 
        (attachments.length > 0 ? `\n\n[Attached Images: ${attachments.map(f => f.name).join(', ')}. To place an attached image in the sheet, write its EXACT filename inside the cell or use <img src="EXACT_FILENAME" />]` : '') +
        (selectedDocText ? `\n\n[Context from connected Document: "${selectedDocText}"]` : '');

      const displayMessage = input || "(Sending Attachments...)";
      
      setInput('');
      // We intentionally do not clear attachments so they can still render in the UI
      // If you prefer clearing, we'd need to store them elsewhere. Let's keep them across the session.
      
      setMessages(prev => [...prev, { role: 'user', content: displayMessage }]);
      setLoading(true);

      setMessages(prev => [
        ...prev, 
        { role: 'assistant', content: '', isGenerating: true }
      ]);

      try {
        let systemPrompt = `You are an advanced AI specialized in generating highly organized, RICH data sheets. You MUST respond with a valid JSON object ONLY. DO NOT output conversational text before or after the JSON.
The JSON must have this exact structure:
{
  "headers": ["Header1", "Header2"],
  "rows": [
    ["Row1Col1", "Row1Col2"]
  ]
}

CRITICAL CAPABILITIES:
- Inside the JSON cells, you have FULL POWER to use HTML to make the sheet beautiful and functional. Always escape quotes properly inside JSON strings.
- Highlighting/Background Colors: use <mark style="background-color: yellow; color: black; padding: 2px 4px; border-radius: 4px;">highlighted text</mark> freely. You can use any color like red, green, blue, yellow, purple, gold, or black. Ensure the text color contrasts well.
- Text Colors: use <span style="color: red/green/blue/purple/pink/white/black">colored text</span>.
- Fonts: use <span style="font-family: 'Arial'/'Courier New'/'Georgia'/'Times New Roman'/'Verdana'/'Trebuchet MS'/'Impact'/'Comic Sans MS'">different fonts</span> to distinguish info.
- Headings/Bold/Points: Use <h1>, <h2>, <h3>, <h4>, <b>, <strong> inside cells for BIG heading titles, points, and structural hierarchy. Feel free to use large stylized headings.
- Links & Sources: For sources or references ALWAYS include actual active links. Format links CLEANLY: <a href="SRC_URL" target="_blank" style="color: #7C3AED; text-decoration: underline;">Source Name/Link Text</a>. If there are multiple sources, put them in a clean <ul><li><a...>...</a></li></ul> list.
- Real Images: DO NOT guess or hallucinate image URLs as they will break. INSTEAD, use these reliable methods for images:
  1. For generic objects/concepts: Use <img src="https://image.pollinations.ai/prompt/YOUR_SEARCH_QUERY?width=200&height=200&nologo=true" style="height: 64px; border-radius: 8px; object-fit: cover; cursor: pointer;" />
  2. For companies: Use <img src="https://logo.clearbit.com/COMPANY_DOMAIN.com" style="height: 64px; border-radius: 8px; object-fit: contain; cursor: pointer;" />
  3. For specific people: Use <img src="https://ui-avatars.com/api/?name=PERSON_NAME&background=random" style="height: 64px; border-radius: 8px; cursor: pointer;" />
- Uploaded Images: If the prompt includes Attached Images, ALWAYS use them when asked by writing their exact filename or <img src="EXACT_FILENAME" />.
- Emojis: Use Emojis freely to make it highly visual.

Remember: Output ONLY valid JSON containing the "headers" and "rows" arrays. No markdown backticks unless strictly wrapping the JSON.`;
        
        if (currentMode === 'Fast Placement') {
           systemPrompt += " MODE: Fast Placement. Just output the JSON table. Do not overthink. Place items quickly.";
        } else if (currentMode === 'Deep Organization') {
           systemPrompt += " MODE: Deep Organization. Try to categorize thoroughly, identify missing links, and create a highly robust and detailed table.";
        }

        const response = await fetch('/api/proxy/chat/json', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            baseUrl,
            apiKey: customKey,
            modelName, 
            messages: [
              {
                role: 'system',
                content: systemPrompt
              },
              ...messages.filter(m => !m.isGenerating).map(m => ({ role: m.role, content: m.content })),
              { role: 'user', content: compiledMessage }
            ],
            temperature: currentMode === 'Creative Draft' ? 0.7 : 0.2,
            max_tokens: 4096
          })
        });

        if (!response.ok) {
          throw new Error('API Error: ' + response.statusText);
        }

        const data = await response.json();
        const aiContent = data.choices[0].message.content;

        // Extract JSON more robustly
        let rawJsonStr = '';
        const jsonMatch = aiContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
        
        if (jsonMatch) {
           rawJsonStr = jsonMatch[1].trim();
        } else {
           const startIndex = aiContent.indexOf('{');
           const endIndex = aiContent.lastIndexOf('}');
           if (startIndex !== -1 && endIndex !== -1) {
              rawJsonStr = aiContent.substring(startIndex, endIndex + 1);
           }
        }
        
        let sheetData: SheetData | undefined;
        let cleanContent = aiContent;

        if (rawJsonStr) {
          try {
            sheetData = JSON.parse(rawJsonStr);
            cleanContent = aiContent.replace(/```(?:json)?\s*[\s\S]*?\s*```/i, '').replace(rawJsonStr, '').trim();
            if (!cleanContent) cleanContent = 'Here is your generated sheet.';
          } catch (e) {
            console.error("Failed to parse sheet data", e);
            
            // Fallback parsing (attempt to sanitize issues)
            try {
               // In case JSON needs some cleanup from newlines or unescaped quotes...
               // This is a naive cleanup but might save some mildly broken JSON.
               const sanitized = rawJsonStr.replace(/[\u0000-\u001F]+/g, ' '); 
               sheetData = JSON.parse(sanitized);
               cleanContent = 'Here is your generated sheet.';
            } catch (e2) {
               console.error("Fallback JSON parsing failed", e2);
            }
          }
        }

        setMessages(prev => {
          const newMsgs = [...prev];
          const newAssistantMsg = {
            role: 'assistant' as const,
            content: cleanContent || 'Here is your generated sheet.',
            sheetData,
            isGenerating: false
          };
          newMsgs[newMsgs.length - 1] = newAssistantMsg;
          return newMsgs;
        });

      } catch (err: any) {
        console.error(err);
        setMessages(prev => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1] = {
            role: 'assistant',
            content: `Error: ${err.message}. Please check your API key & setup.`,
            isGenerating: false
          };
          return newMsgs;
        });
      } finally {
        setLoading(false);
      }
    });
  };

  const handleExportCSV = (sheet: SheetData) => {
    // Helper to strip HTML tags for clean CSV export
    const stripHtml = (html: string) => {
       const tmp = document.createElement("DIV");
       tmp.innerHTML = String(html);
       return tmp.textContent || tmp.innerText || "";
    };

    let csvContent = "";
    csvContent += sheet.headers.map(h => `"${stripHtml(h).replace(/"/g, '""')}"`).join(",") + "\n";
    sheet.rows.forEach(rowArray => {
      let row = rowArray.map(item => `"${stripHtml(item).replace(/"/g, '""')}"`).join(",");
      csvContent += row + "\n";
    });

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "ai_sheet.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex bg-[#FAF9F6] h-screen overflow-hidden w-full flex-1">
      <Sidebar />
      <div className="flex-1 flex flex-col relative bg-white h-screen overflow-hidden">
        
        {/* Header */}
        <header className="h-16 border-b border-purple-100 flex items-center justify-between px-6 bg-white shrink-0 z-20 shadow-sm relative">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-[#D4AF37] bg-clip-text text-transparent flex items-center gap-2">
              <Grid className="w-5 h-5 text-purple-600" />
              AI Sheets
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowHistory(true)}
              className="p-2 text-gray-500 hover:bg-purple-50 hover:text-purple-600 rounded-xl transition-colors"
              title="History"
            >
              <Clock className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setShowSettings(true)}
              className="p-2 text-gray-500 hover:bg-purple-50 hover:text-purple-600 rounded-xl transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto px-6 py-12 scroll-smooth">
          {messages.length === 0 ? (
            <div className="w-full max-w-7xl mx-auto mt-12 bg-gradient-to-br from-white to-purple-50 p-10 rounded-3xl border border-purple-100 shadow-[0_10px_40px_rgba(147,51,234,0.05)]">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight tracking-tight">
                Unleash the Power of <br/>
                <span className="bg-gradient-to-r from-purple-600 to-[#D4AF37] bg-clip-text text-transparent">AI Sheets</span>
              </h2>
              <ul className="space-y-6 text-gray-600 text-lg">
                <li className="flex items-start gap-4">
                  <div className="w-2 h-2 mt-2 rounded-full bg-purple-500 shrink-0 shadow-[0_0_10px_rgba(147,51,234,0.5)]"></div>
                  Auto-find companies, people, papers, products, or anything.
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-2 h-2 mt-2 rounded-full bg-[#D4AF37] shrink-0 shadow-[0_0_10px_rgba(212,175,55,0.5)]"></div>
                  Transform your existing data into powerful insights and visuals.
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 shrink-0 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                  Attach images for quick bulk-placement, auto-search from documents.
                </li>
              </ul>
            </div>
          ) : (
            <div className="max-w-[1400px] w-full mx-auto space-y-8 pb-40">
              {messages.map((msg, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`w-full max-w-[95%] xl:max-w-[90%] rounded-3xl p-6 shadow-sm overflow-hidden break-words ${
                      msg.role === 'user' 
                        ? 'bg-purple-600 text-white shadow-purple-200' 
                        : 'bg-white border border-purple-100 shadow-[0_5px_20px_rgba(147,51,234,0.04)] text-gray-800'
                    }`}
                  >
                    {msg.isGenerating ? (
                      <div className="flex items-center gap-3 text-purple-500 font-medium tracking-wide">
                        <Grid className="w-5 h-5 animate-spin opacity-50" />
                        Generating Sheet...
                      </div>
                    ) : (
                      <>
                        <div className="whitespace-pre-wrap leading-relaxed">
                          {msg.content}
                        </div>
                        {msg.sheetData && (
                          <div 
                            onClick={() => setSelectedSheet(msg.sheetData!)}
                            className="mt-6 border border-purple-200 rounded-2xl p-4 flex items-center justify-between bg-purple-50/50 cursor-pointer hover:bg-purple-50 transition-all hover:scale-[1.01] hover:shadow-md group"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-purple-600 group-hover:text-[#D4AF37] transition-colors border border-purple-100">
                                <Grid className="w-6 h-6" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">Data Sheet Ready</h4>
                                <p className="text-sm text-gray-500">Click to open & edit</p>
                              </div>
                            </div>
                            <Button className="bg-white border-2 border-purple-100 text-purple-600 hover:bg-purple-50 rounded-xl px-4 font-medium opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                              View Data
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent pointer-events-none pb-8 z-20">
          <div className="max-w-[1400px] mx-auto relative pointer-events-auto w-full">
            
            {/* Input Overlay (Attachments) */}
            <AnimatePresence>
               {attachments.length > 0 && (
                  <motion.div
                    initial={{opacity:0, y:10}}
                    animate={{opacity:1, y:0}}
                    exit={{opacity:0, scale:0.95}}
                    className="absolute bottom-[calc(100%+10px)] left-0 bg-white/95 backdrop-blur shadow-lg border border-purple-100 p-3 rounded-2xl flex gap-2 overflow-x-auto max-w-full"
                  >
                     {attachments.map((file, i) => (
                        <div key={i} className="relative group shrink-0">
                           <img src={URL.createObjectURL(file)} alt={file.name} className="w-14 h-14 object-cover rounded-xl border border-gray-200" />
                           <button 
                             onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
                             className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                           >
                             <X className="w-3 h-3" />
                           </button>
                        </div>
                     ))}
                  </motion.div>
               )}
            </AnimatePresence>

            {/* Input Overlay (Docs) */}
            <AnimatePresence>
               {showDocs && (
                  <motion.div
                    initial={{opacity:0, y:10}}
                    animate={{opacity:1, y:0}}
                    exit={{opacity:0, scale:0.95}}
                    className="absolute bottom-[calc(100%+10px)] left-0 bg-white shadow-xl border border-purple-100 p-4 rounded-3xl w-80 max-h-80 flex flex-col"
                  >
                     <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                        <span className="font-semibold text-sm text-gray-800 flex items-center gap-2">
                           <FileText className="w-4 h-4 text-purple-600"/>
                           Select Context Doc
                        </span>
                        <button onClick={() => setShowDocs(false)} className="text-gray-400 hover:text-gray-800">
                           <X className="w-4 h-4" />
                        </button>
                     </div>
                     <div className="flex-1 overflow-y-auto space-y-2">
                        {loadingDocs ? (
                           <div className="text-sm text-center text-gray-500 py-4">Loading docs...</div>
                        ) : availableDocs.length === 0 ? (
                           <div className="text-sm text-center text-gray-500 py-4">No documents found.</div>
                        ) : availableDocs.map(doc => (
                           <div 
                             key={doc.id}
                             onClick={() => handleSelectDoc(doc)}
                             className={`p-3 rounded-xl border cursor-pointer text-sm transition-all flex items-center justify-between ${selectedDocId === doc.id ? 'bg-purple-50 border-purple-300 text-purple-800 font-medium' : 'bg-gray-50 border-transparent hover:bg-gray-100 text-gray-700'}`}
                           >
                              <span className="truncate pr-2">{doc.title}</span>
                              {selectedDocId === doc.id && <Check className="w-4 h-4 text-purple-600" />}
                           </div>
                        ))}
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>

            <div className={`bg-white/80 backdrop-blur-xl border ${selectedDocId ? 'border-purple-400' : 'border-purple-100'} rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.06)] overflow-hidden transition-all focus-within:shadow-[0_10px_40px_rgba(147,51,234,0.15)] focus-within:border-purple-300 relative`}>
              
              {/* Top Bar inside input */}
              <div 
                 onClick={() => setShowModes(!showModes)}
                 className="bg-gradient-to-r from-purple-50/50 to-[#D4AF37]/5 px-6 py-3 border-b border-purple-50 flex justify-between items-center text-sm font-medium text-purple-800 cursor-pointer hover:bg-purple-50/80 transition-colors"
               >
                <span className="flex items-center gap-2">
                  <Grid className="w-4 h-4 opacity-70" />
                  Mode: <span className="text-[#D4AF37] font-bold">{currentMode}</span>
                  {selectedDocId && (
                     <span className="ml-2 text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        <FileText className="w-3 h-3" /> Attached Context
                     </span>
                  )}
                </span>
                <ChevronDown className="w-4 h-4 opacity-50" />
              </div>

              {/* Modes popover */}
              <AnimatePresence>
                 {showModes && (
                    <motion.div 
                       initial={{opacity: 0, y: -5}}
                       animate={{opacity: 1, y: 0}}
                       exit={{opacity: 0, y: -5}}
                       className="absolute top-12 left-4 bg-white border border-gray-100 shadow-xl rounded-xl z-10 w-48 py-2 pointer-events-auto"
                    >
                       {modes.map(mode => (
                          <div 
                            key={mode} 
                            onClick={() => { setCurrentMode(mode); setShowModes(false); }}
                            className={`px-4 py-2 text-sm cursor-pointer hover:bg-purple-50 flex items-center gap-2 ${currentMode === mode ? 'text-purple-600 font-semibold bg-purple-50/50' : 'text-gray-700'}`}
                           >
                              {currentMode === mode && <Check className="w-3 h-3" />}
                              {mode}
                          </div>
                       ))}
                    </motion.div>
                 )}
              </AnimatePresence>

              {/* Textarea */}
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask anything, create anything..."
                className="w-full bg-transparent px-6 py-4 text-gray-800 placeholder-gray-400 focus:outline-none resize-none min-h-[80px]"
                rows={1}
              />

              {/* Bottom Actions */}
              <div className="px-5 py-3 flex items-center justify-between pb-4">
                <div className="flex items-center gap-2 pointer-events-auto">
                  
                  {/* File Upload Hidden Input */}
                  <input 
                     type="file" 
                     className="hidden" 
                     ref={fileInputRef} 
                     multiple 
                     accept="image/*"
                     onChange={handleFileSelect}
                  />

                  <button 
                     onClick={() => fileInputRef.current?.click()}
                     title="Attach Images"
                     className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:text-purple-600 hover:border-purple-200 hover:bg-purple-50 transition-all"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                  <button 
                     onClick={() => {
                        setShowDocs(!showDocs);
                        if (!showDocs && availableDocs.length === 0) fetchDocs();
                     }}
                     title="Select Context Document"
                     className={`w-10 h-10 flex items-center justify-center rounded-full border transition-all ${selectedDocId ? 'border-purple-400 text-purple-600 bg-purple-50/50' : 'border-gray-200 text-gray-400 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200'}`}
                  >
                    <Wrench className="w-4 h-4" />
                  </button>
                  <button 
                     onClick={() => setShowModes(!showModes)}
                     title="Change AI Mode"
                     className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:text-[#D4AF37] hover:border-[#D4AF37]/30 hover:bg-[#D4AF37]/10 transition-all"
                  >
                    <BicepsFlexed className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button className="w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:text-purple-600 transition-colors pointer-events-auto">
                    <Mic className="w-5 h-5" />
                  </button>
                  <Button 
                    onClick={handleSend} 
                    disabled={(!input.trim() && attachments.length === 0) || loading}
                    className="bg-black hover:bg-gray-800 text-white rounded-full px-6 py-2.5 flex items-center gap-2 shadow-md transition-all disabled:opacity-50 pointer-events-auto"
                  >
                    <span className="font-semibold">||| Speak</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sheet Viewer Modal */}
        <AnimatePresence>
          {selectedSheet && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6"
            >
              <motion.div 
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-white w-full max-w-6xl h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-purple-100"
              >
                <div className="px-8 py-5 border-b border-gray-100 flex flex-wrap gap-4 items-center justify-between bg-gradient-to-r from-purple-50/50 to-[#D4AF37]/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                      <Grid className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">AI Sheet</h3>
                      <p className="text-xs text-gray-500">View, edit, or export</p>
                    </div>
                  </div>
                  
                  {/* Preferences Toolbar */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Button 
                      onClick={() => setIsEditingSheet(!isEditingSheet)}
                      className={`px-4 py-2 flex items-center gap-2 rounded-xl border transition-all font-medium ${isEditingSheet ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                    >
                      {isEditingSheet ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                      {isEditingSheet ? 'Done Editing' : 'Customize'}
                    </Button>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button onClick={(e) => { e.stopPropagation(); handleExportCSV(selectedSheet); }} className="bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-xl px-4 py-2 flex items-center gap-2 shadow-sm transition-all font-medium">
                      <Download className="w-4 h-4" /> Export CSV
                    </Button>
                    <button 
                      onClick={() => setSelectedSheet(null)}
                      className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className={`flex-1 overflow-auto p-8 bg-[#FAF9F6]`}>
                  <div className={`rounded-2xl shadow-[0_5px_20px_rgba(0,0,0,0.03)] border overflow-x-auto bg-white border-gray-100`}>
                    <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead>
                        <tr className={`bg-purple-50/50 border-purple-100 border-b`}>
                          {selectedSheet.headers.map((header, i) => (
                            <th key={i} className={`px-6 py-4 text-sm font-semibold text-purple-900 whitespace-nowrap`}>
                              {isEditingSheet ? (
                                <div 
                                   contentEditable
                                   suppressContentEditableWarning
                                   className="border border-transparent focus:border-purple-500 hover:border-purple-300 focus:outline-none focus:bg-white p-1 rounded inline-block min-w-[50px] transition-all"
                                   onBlur={(e) => {
                                     const newHeaders = [...selectedSheet.headers];
                                     newHeaders[i] = e.target.innerHTML;
                                     setSelectedSheet({ ...selectedSheet, headers: newHeaders });
                                   }}
                                   dangerouslySetInnerHTML={{ __html: String(header) }}
                                />
                              ) : (
                                header
                              )}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-700">
                        {selectedSheet.rows.map((row, i) => (
                          <tr key={i} className={`group hover:bg-purple-50/30`}>
                            {row.map((cell, j) => (
                              <td key={j} className={`px-6 max-w-[500px] break-words py-4 text-sm align-top`}>
                                {isEditingSheet ? (
                                  <div 
                                    contentEditable
                                    suppressContentEditableWarning
                                    className="min-h-[40px] border border-transparent hover:border-purple-300 focus:border-purple-500 focus:outline-none focus:bg-white p-1 rounded transition-colors"
                                    onBlur={(e) => {
                                      const newRows = [...selectedSheet.rows];
                                      newRows[i] = [...newRows[i]];
                                      newRows[i][j] = e.target.innerHTML;
                                      setSelectedSheet({ ...selectedSheet, rows: newRows });
                                    }}
                                    dangerouslySetInnerHTML={{ __html: String(cell) }}
                                  />
                                ) : (
                                  <div 
                                    className="ai-cell-content text-sm max-w-none [&_a]:text-purple-600 [&_a:hover]:underline [&_img]:inline-block [&_img]:rounded-md [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4"
                                    dangerouslySetInnerHTML={{ __html: renderCell(cell) }}
                                    onClick={(e) => {
                                       const target = e.target as HTMLElement;
                                       if (target.tagName === 'IMG') {
                                          e.stopPropagation();
                                          window.open((target as HTMLImageElement).src, '_blank');
                                       } else if (target.tagName === 'A') {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          window.open((target as HTMLAnchorElement).href, '_blank', 'noopener,noreferrer');
                                       }
                                    }}
                                  />
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                        {isEditingSheet && (
                          <tr className="hover:bg-purple-50/10">
                            <td colSpan={selectedSheet.headers.length} className="px-6 py-4 text-center">
                              <button 
                                onClick={() => {
                                  setSelectedSheet({ ...selectedSheet, rows: [...selectedSheet.rows, Array(selectedSheet.headers.length).fill('')] })
                                }}
                                className="text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-5 py-2.5 rounded-xl transition-colors border-2 border-dashed border-purple-200 inline-flex items-center gap-2"
                              >
                                <Plus className="w-4 h-4" /> Add Row
                              </button>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {showSettings && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setShowSettings(false)}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                title="Cancel"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                  <Key className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Custom API Settings</h3>
                  <p className="text-sm text-gray-500">Configure your model credentials</p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Custom OpenAI-Compatible Key</label>
                  <input
                    type="password"
                    value={customKey}
                    onChange={(e) => setCustomKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all placeholder:text-gray-400"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <Button 
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-xl py-3"
                    onClick={async () => {
                       localStorage.setItem('AIS_CUSTOM_KEY', customKey);
                       if (customKey) {
                         localStorage.setItem('samba_custom_key', encryptData(customKey));
                         localStorage.setItem('dictator_reason_key', encryptData(customKey));
                         if (user?.uid) {
                           try {
                             await setDoc(doc(db, 'users', user.uid, 'config', 'byok'), {
                               key: encryptData(customKey),
                               updatedAt: serverTimestamp()
                             });
                             await setDoc(doc(db, 'users', user.uid, 'config', 'dictator_key'), {
                               key: encryptData(customKey),
                               updatedAt: serverTimestamp()
                             });
                           } catch (e) {
                             console.warn("Failed to sync secure BYOK key everywhere:", e);
                           }
                         }
                         alert("API Key synced successfully across all agents!");
                       } else {
                         localStorage.removeItem('samba_custom_key');
                         localStorage.removeItem('dictator_reason_key');
                         if (user?.uid) {
                           try {
                             await setDoc(doc(db, 'users', user.uid, 'config', 'byok'), { key: "", updatedAt: serverTimestamp() });
                             await setDoc(doc(db, 'users', user.uid, 'config', 'dictator_key'), { key: "", updatedAt: serverTimestamp() });
                           } catch (e) {}
                         }
                         alert("API Key wiped everywhere.");
                       }
                       setShowSettings(false);
                    }}
                  >
                    Save Settings
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        <ChatHistoryDrawer 
          isOpen={showHistory} 
          onClose={() => setShowHistory(false)} 
          appType="ai_sheets" 
          userId={user?.uid} 
          onSelectSession={(pastMessages, selectedSessionId) => {
             setMessages(pastMessages);
             setSessionId(selectedSessionId);
          }} 
        />

      </div>
    </div>
  );
}
