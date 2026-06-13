import React, { useState, useRef, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import { Mic, Loader2, StopCircle, AlertCircle, Settings, X, Sparkles, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { encryptData, decryptData } from '../lib/encryption';
import { directLlmCall } from '../lib/gemini';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface RobotDictatorProps {
  editor: Editor | null;
  onOpenVoiceDoc?: () => void;
  localEngine?: any;
  useLocalModel?: boolean;
}

type RobotStatus = 'idle' | 'initializing' | 'recording' | 'processing' | 'error';

export function RobotDictator({ editor, onOpenVoiceDoc, localEngine, useLocalModel }: RobotDictatorProps) {
  const { user } = useAuth();
  const [status, setStatus] = useState<RobotStatus>('idle');
  const [liveTranscript, setLiveTranscript] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [reasoningKey, setReasoningKey] = useState("");
  const [customModel, setCustomModel] = useState("qwen-2.5-1.5b-instruct");
  const [dictatorMode, setDictatorMode] = useState<'normal' | 'ai'>('ai');
  
  const recognitionRef = useRef<any>(null);
  const stopCallbackRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const loadKeys = async () => {
      const storedReason = localStorage.getItem('dictator_reason_key');
      if (storedReason) {
        try { setReasoningKey(decryptData(storedReason)); } catch (e) { setReasoningKey(storedReason); }
      }
      
      if (user?.uid) {
        try {
          const secretSnap = await getDoc(doc(db, 'users', user.uid, 'config', 'dictator_key'));
          if (secretSnap.exists() && secretSnap.data()?.key) {
            try {
              setReasoningKey(decryptData(secretSnap.data().key));
            } catch (e) {
              setReasoningKey(secretSnap.data().key);
            }
          }
        } catch (e) {
          console.warn("Could not read secure dictator key from Cloud DB:", e);
        }
      }

      const storedModel = localStorage.getItem('dictator_custom_model');
      if (storedModel) {
        setCustomModel(storedModel);
      }
      const storedMode = localStorage.getItem('dictator_mode');
      if (storedMode === 'normal' || storedMode === 'ai') {
        setDictatorMode(storedMode);
      }
    };

    loadKeys();
  }, [user]);

  const handleCustomModelChange = (val: string) => {
    setCustomModel(val || "qwen-2.5-1.5b-instruct");
    localStorage.setItem('dictator_custom_model', val);
  };

  const handleReasoningKeyChange = async (val: string) => {
    setReasoningKey(val);
  };
  
  const handleSaveAndSyncKey = async () => {
    const val = reasoningKey;
    localStorage.setItem('AIS_CUSTOM_KEY', val);
    if (val) {
      localStorage.setItem('dictator_reason_key', encryptData(val));
      localStorage.setItem('samba_custom_key', encryptData(val));
      if (user?.uid) {
        try {
          await setDoc(doc(db, 'users', user.uid, 'config', 'dictator_key'), {
            key: encryptData(val),
            updatedAt: serverTimestamp()
          });
          await setDoc(doc(db, 'users', user.uid, 'config', 'byok'), {
            key: encryptData(val),
            updatedAt: serverTimestamp()
          });
        } catch (e) {
          console.warn("Failed to store unified keys to Cloud DB:", e);
        }
      }
      alert('API Key synced across agents successfully!');
    } else {
      localStorage.removeItem('dictator_reason_key');
      localStorage.removeItem('samba_custom_key');
      localStorage.removeItem('AIS_CUSTOM_KEY');
      if (user?.uid) {
        try {
          await setDoc(doc(db, 'users', user.uid, 'config', 'dictator_key'), {
            key: "",
            updatedAt: serverTimestamp()
          });
          await setDoc(doc(db, 'users', user.uid, 'config', 'byok'), {
            key: "",
            updatedAt: serverTimestamp()
          });
        } catch (e) {
          console.warn("Failed to delete keys from Cloud DB:", e);
        }
      }
      alert('Agents API key wiped everywhere.');
    }
  };

  const handleDictatorModeChange = (val: 'normal' | 'ai') => {
    setDictatorMode(val);
    localStorage.setItem('dictator_mode', val);
  };

  const startRecording = async () => {
    try {
      if (!editor) {
        setErrorMessage("Editor not ready");
        setStatus('error');
        return;
      }
      
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
         setErrorMessage("Web Speech API is not supported in this browser. Please use Chrome or Edge.");
         setStatus('error');
         return;
      }

      setStatus('initializing');
      setErrorMessage("");
      
      const recon = new SpeechRecognition();
      recon.continuous = true;
      recon.interimResults = true;
      recon.lang = 'en-US';
      
      let finalCaptured = "";
      
      recon.onstart = () => {
        setStatus('recording');
        setLiveTranscript("Listening... (Speak now)");
      };
      
      recon.onerror = (e: any) => {
        console.error("Native Speech Recognition Error", e);
        setStatus('error');
        if (e.error === 'not-allowed') {
          setErrorMessage("Microphone permission denied inside the preview pane’s iframe. Click 'Open in New Tab' ↗️ in the top right to enable microphone!");
        } else {
          setErrorMessage(`Speech recognition error: ${e.error}`);
        }
      };
      
      recon.onend = () => {
        // finished
      };
      
      recon.onresult = (evt: any) => {
        let interim = "";
        for (let i = evt.resultIndex; i < evt.results.length; ++i) {
          if (evt.results[i].isFinal) {
            finalCaptured += evt.results[i][0].transcript + " ";
          } else {
            interim += evt.results[i][0].transcript;
          }
        }
        setLiveTranscript((finalCaptured + interim).trim() || "Listening...");
      };
      
      recognitionRef.current = recon;
      recon.start();
      
      stopCallbackRef.current = async () => {
         try {
           recon.stop();
         } catch(e) {}
         
         const transcriptText = finalCaptured.trim();
         if (!transcriptText) {
            setStatus('idle');
            setLiveTranscript("");
            return;
         }
         
         // 1. Normal Mode - paste exactly what they said directly in the editor and stop
         if (dictatorMode === 'normal') {
            editor?.chain().focus('end').insertContent(`<p>${transcriptText}</p>`).run();
            setStatus('idle');
            setLiveTranscript("");
            return;
         }

         setStatus('processing');
         
         // 2. AI Mode - generate comprehensive document
         // A. If Local WebLLM Qwen 1.5B model is available, use it directly for 100% free offline execution!
         if ((useLocalModel || !reasoningKey) && localEngine) {
            setLiveTranscript("Refining long detailed document offline...");
            try {
               const response = await localEngine.chat.completions.create({
                 messages: [
                   { 
                     role: 'user', 
                     content: `As an expert technical creator and AI Assistant, write a very comprehensive, long, highly detailed, well-structured professional document on the topic: "${transcriptText}".
Requirements:
- Elaborate thoroughly (minimum 4 large sections).
- Use professional HTML typography including headings (<h1>, <h2>), paragraphs, lists, and inline colors.
- Highlight crucial words using transparent highlighted <mark> tags (e.g. style="background: rgba(212, 175, 55, 0.2); border-radius: 4px; padding: 2px;").
- Create beautiful data comparison index tables where applicable.
- Return ONLY valid raw HTML code without markdown code block wraps.` 
                   }
                 ],
                 max_tokens: 1024
               });
               let refined = response.choices[0]?.message?.content || transcriptText;
               // Clean markdown wraps from local model output if present
               if (refined.startsWith('```html')) {
                 refined = refined.substring(7);
               } else if (refined.startsWith('```')) {
                 refined = refined.substring(3);
               }
               if (refined.endsWith('```')) {
                 refined = refined.substring(0, refined.length - 3);
               }
               refined = refined.trim();
               editor?.chain().focus('end').insertContent(refined).run();
               setStatus('idle');
               setLiveTranscript("");
               return;
            } catch (err: any) {
               console.error("Local polishing failed, resorting to backup server processor:", err);
            }
         }

         // B. Fall back to cloud API / Server processor
         setLiveTranscript("Structuring long rich document with AI Brain...");
         try {
            let correctedText = "";
            let success = false;

            // Try server-side first
            try {
               const aiRes = await fetch('/api/ai/process-transcript', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({ 
                   text: transcriptText, 
                   customApiKey: reasoningKey,
                   customModel: customModel
                 })
               });
               
               const contentType = aiRes.headers.get("content-type") || "";
               if (aiRes.ok && contentType.includes("application/json")) {
                 const aiText = await aiRes.text();
                 const aiData = JSON.parse(aiText);
                 if (aiData.correctedText) {
                   correctedText = aiData.correctedText;
                   success = true;
                 }
               }
            } catch (serverErr) {
               console.warn("Server-side transcription processing failed, testing client direct fallback...", serverErr);
            }

            // Direct browser-side LLM call fallback using BYOK key (for setups with no Node backend like Vercel deployments)
            if (!success) {
               if (!reasoningKey) {
                 throw new Error("Server API call failed. To run AI features directly in the browser, please provide a BYOK API key in the Robot settings!");
               }

               const systemInstruction = `You are an expert technical writer and AI assistant helping a user build a comprehensive document from their dictated thoughts.
Take the provided raw voice transcript, research the core concepts, and structure it into a highly refined document.
Please do the following:
1. Understand the core concepts described and elaborate on them logically.
2. Structure the output with a clear, engaging Title.
3. Use semantic HTML tags (<h1>, <h2>, <h3>, <p>, <ul>, <li>, <strong>, <mark>) to build comprehensive sections that make the information flow seamlessly. Use <mark> to highlight key concepts.
4. Correct any grammar mistakes and rearrange facts so they are clear and structured.
5. Include a "Resources & Context" section at the end if there is relevant information to share (especially from the provided Context below).
6. CRITICAL: Only output the raw, valid HTML document. Do not include markdown formatting, code blocks (such as HTML blocks), or conversational filler like "Here is the document...". The output must be purely clean HTML ready to be injected.`;
               
               const resultText = await directLlmCall({
                 prompt: "Transcript:\n" + transcriptText,
                 systemInstruction,
                 customApiKey: reasoningKey,
                 customModel: customModel,
                 isComplex: true
               });

               correctedText = resultText;
               // Standard format cleaning
               if (correctedText.startsWith('```html')) {
                 correctedText = correctedText.substring(7);
               } else if (correctedText.startsWith('```')) {
                 correctedText = correctedText.substring(3);
               }
               if (correctedText.endsWith('```')) {
                 correctedText = correctedText.substring(0, correctedText.length - 3);
               }
               correctedText = correctedText.trim();
               success = true;
            }

            if (correctedText) {
               editor?.chain().focus('end').insertContent(correctedText).run();
            } else {
               editor?.chain().focus('end').insertContent(transcriptText).run();
            }
            setStatus('idle');
            setLiveTranscript("");
         } catch(e: any) {
            console.warn("AI processing error, pasting raw transcript directly:", e);
            editor?.chain().focus('end').insertContent(`<p>${transcriptText}</p>`).run();
            setStatus('idle');
            setLiveTranscript("");
         }
      };

    } catch (e: any) {
      console.error(e);
      setErrorMessage(e.message || "Unknown error occurred.");
      setStatus('error');
    }
  };

  const stopRecording = async () => {
    if (stopCallbackRef.current) {
      await stopCallbackRef.current();
      stopCallbackRef.current = null;
      return;
    }
    setStatus('idle');
    setLiveTranscript("");
  };
  
  const handleClick = async (e: React.MouseEvent) => {
    console.log("Robot clicked! Current status:", status);
    e.preventDefault();
    e.stopPropagation();
    try {
      if (status === 'error') {
         setStatus('idle');
         setErrorMessage("");
         return;
      }
      if (status === 'idle') {
          await startRecording();
      } else if (status === 'recording' || status === 'initializing') {
          await stopRecording();
      }
    } catch (err: any) {
      console.error("Click handler error:", err);
      setErrorMessage(err.message || 'Unknown error');
      setStatus('error');
    }
  };

  const isRecording = status === 'recording' || status === 'initializing';
  const isProcessing = status === 'processing';

  return (
    <div className="fixed bottom-8 right-8 z-[999] flex flex-col items-center gap-3">
      {/* Live transcript bubble */}
      {(status !== 'idle' && status !== 'error' && liveTranscript) && (
        <div className="bg-white/90 backdrop-blur border border-indigo-200/50 shadow-xl rounded-2xl p-4 w-64 animate-in fade-in slide-in-from-bottom flex flex-col gap-2">
           <div className="flex items-center gap-2 mb-1 text-indigo-600">
             {isProcessing ? <Loader2 className="w-4 h-4 animate-spin"/> : <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
             <span className="text-[10px] uppercase font-bold tracking-wider">
                {isProcessing ? 'AI Formatting...' : status === 'initializing' ? 'Connecting...' : 'Live Dictation'}
             </span>
           </div>
           <p className="text-sm font-medium text-gray-800 leading-relaxed italic">
             "{liveTranscript}"
           </p>
        </div>
      )}
      
      {/* Error bubble */}
      {status === 'error' && (
        <div className="bg-red-50 backdrop-blur border border-red-200 shadow-xl rounded-2xl p-4 w-64 animate-in fade-in slide-in-from-bottom flex flex-col gap-2">
           <div className="flex items-center gap-2 text-red-600 mb-1">
             <AlertCircle className="w-4 h-4" />
             <span className="text-[10px] uppercase font-bold tracking-wider">Dictation Error</span>
           </div>
           <p className="text-xs font-medium text-red-800 leading-relaxed">
             {errorMessage}
           </p>
           <button onClick={() => setStatus('idle')} className="text-xs text-red-600 underline text-left mt-1">Dismiss</button>
        </div>
      )}

      {/* Robot Head */}
      <div className="relative">
        <button 
           onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }}
           className="absolute -top-10 right-0 z-50 p-2 bg-white/80 backdrop-blur border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 transition-colors focus:outline-none cursor-pointer"
           title="Voice to Document Text Settings"
        >
           <Settings className="w-4 h-4 text-gray-500" />
        </button>

        {showSettings && (
           <div className="absolute bottom-[110%] right-[-10px] w-72 bg-white shadow-2xl border border-gray-100 rounded-xl p-4 z-[9999] animate-in fade-in slide-in-from-bottom flex flex-col gap-3">
              {/* "Cut" (Close) Button */}
              <button 
                 onClick={() => setShowSettings(false)}
                 className="absolute top-3.5 right-3.5 p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors focus:outline-none cursor-pointer"
                 title="Close"
              >
                 <X className="w-4 h-4" />
              </button>

              <div className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-1 pr-6 flex items-center gap-1.5 border-b border-gray-100 pb-1.5">
                 <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
                 Voice to Document Settings
              </div>

              {/* Dual Mode Selector */}
              <div className="space-y-1.5">
                 <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Voice to Document Text Mode</label>
                 <div className="grid grid-cols-2 gap-1 bg-gray-100 p-1 rounded-lg">
                    <button 
                       type="button"
                       onClick={() => handleDictatorModeChange('normal')}
                       className={`py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${dictatorMode === 'normal' ? 'bg-white shadow-sm text-indigo-700' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                       Normal Text
                    </button>
                    <button 
                       type="button"
                       onClick={() => handleDictatorModeChange('ai')}
                       className={`py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer flex items-center justify-center gap-1 ${dictatorMode === 'ai' ? 'bg-white shadow-sm text-indigo-700' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                       <Sparkles className="w-3 h-3 text-indigo-500" />
                       AI Document
                    </button>
                 </div>
                 <p className="text-[10px] text-gray-400 font-medium">
                    {dictatorMode === 'normal' 
                      ? "Direct mode: user speech writes straight to document raw." 
                      : "AI mode: automatically designs detailed formatted layout pages."
                    }
                 </p>
              </div>

              <div className="space-y-1">
                 <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">AI Reasoning API Key (BYOK)</label>
                 <div className="flex gap-2">
                   <input 
                      type="password"
                      placeholder={reasoningKey ? "••••••••••••••••" : "Provide your custom API key"}
                      value={reasoningKey}
                      onChange={(e) => handleReasoningKeyChange(e.target.value)}
                      autoComplete="off"
                      className="flex-1 text-xs border border-gray-200 rounded p-1.5 focus:border-blue-400 outline-none bg-gray-50/50"
                   />
                   <button 
                      type="button" 
                      onClick={handleSaveAndSyncKey}
                      className="px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded transition-colors whitespace-nowrap"
                   >
                     Save & Sync
                   </button>
                 </div>
                 {reasoningKey && (
                    <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded p-1.5 text-[10px] text-blue-700 font-bold mt-1.5">
                       <span className="flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          Secure Custom Key Loaded
                       </span>
                       <button 
                          type="button"
                          onClick={() => {
                             handleReasoningKeyChange('');
                             handleSaveAndSyncKey();
                          }}
                          className="text-red-500 hover:text-red-700 underline text-[9px] uppercase font-bold focus:outline-none cursor-pointer"
                       >
                          Wipe Key
                       </button>
                    </div>
                 )}
              </div>

              <div className="space-y-1">
                 <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">AI Engine/Model</label>
                 <input 
                    type="text"
                    placeholder="custom model, e.g. gemini-3.5-flash"
                    value={customModel}
                    onChange={(e) => handleCustomModelChange(e.target.value)}
                    autoComplete="off"
                    className="w-full text-xs border border-gray-200 rounded p-1.5 focus:border-blue-400 outline-none bg-gray-50/50"
                 />
              </div>
           </div>
        )}

        <button 
          onClick={handleClick}
          disabled={status === 'processing'}
          className={`relative w-20 h-20 rounded-full group shadow-2xl transition-all duration-300 ${isRecording ? 'scale-110' : 'hover:scale-105'} disabled:opacity-50 pointer-events-auto cursor-pointer flex items-center justify-center`}
        >
        {/* Wavy RGB Rim Lighting wrapper */}
        <div className="absolute inset-0 rounded-full pointer-events-none">
           {(status === 'recording' || status === 'initializing') ? (
             <>
               <div className="absolute -inset-3 rounded-full border-[4px] border-red-500 blur-md opacity-80 animate-[spin_2s_linear_infinite]" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}/>
               <div className="absolute -inset-4 rounded-full border-[3px] border-pink-500 blur-sm opacity-60 animate-[spin_3s_linear_infinite_reverse]" style={{ clipPath: 'polygon(50% 0%, 100% 15%, 100% 85%, 50% 100%, 0% 85%, 0% 15%)' }}/>
               <div className="absolute -inset-2 rounded-full border-[5px] border-orange-500 blur-lg opacity-70 animate-[spin_4s_linear_infinite]" />
             </>
           ) : status === 'error' ? (
             <div className="absolute -inset-2 rounded-full bg-red-500 blur-md opacity-80 animate-pulse" />
           ) : (
             <>
               <div className="absolute -inset-2 rounded-full border-[3px] border-cyan-400 blur-sm opacity-30 group-hover:opacity-80 transition-opacity animate-[spin_6s_linear_infinite]" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}/>
               <div className="absolute -inset-3 rounded-full border-[3px] border-purple-500 blur-md opacity-20 group-hover:opacity-60 transition-opacity animate-[spin_8s_linear_infinite_reverse]" style={{ clipPath: 'polygon(50% 0%, 100% 15%, 100% 85%, 50% 100%, 0% 85%, 0% 15%)' }}/>
             </>
           )}
        </div>
        
        {/* Main Robot Head Sphere */}
        <div className={`absolute inset-0 rounded-full flex justify-center items-center overflow-hidden border-2 border-white/20 z-10 ${(status === 'recording' || status === 'initializing') ? 'bg-gray-900' : 'bg-gradient-to-b from-gray-700 to-gray-900'} shadow-inner pointer-events-none`}>
           {/* Eyes inner components */}
           <div className="absolute top-6 flex gap-4">
              {status === 'error' ? (
                 <>
                  <div className="w-3.5 h-[2px] bg-red-400 rotate-45 translate-x-1" />
                  <div className="w-3.5 h-[2px] bg-red-400 -rotate-45 -translate-x-1" />
                 </>
              ) : (
                 <>
                  <div className={`w-3 h-4 rounded-full transition-all ${isRecording ? 'bg-red-400 shadow-[0_0_12px_#f87171] h-1.5 translate-y-1' : 'bg-cyan-300 shadow-[0_0_8px_#67e8f9] animate-pulse'}`} />
                  <div className={`w-3 h-4 rounded-full transition-all ${isRecording ? 'bg-red-400 shadow-[0_0_12px_#f87171] h-1.5 translate-y-1' : 'bg-cyan-300 shadow-[0_0_8px_#67e8f9] animate-pulse'}`} />
                 </>
              )}
           </div>
           
           {/* Mouth */}
           <div className={`absolute bottom-4 w-8 transition-all bg-white/20 rounded-full ${status === 'recording' ? 'h-3.5 animate-pulse bg-red-400/90 shadow-[0_0_10px_#f87171]' : status === 'initializing' ? 'h-[2px] bg-yellow-400/80 w-5 animate-ping' : 'h-1.5 bg-cyan-300/40'}`} />
           
           {/* Icon Overlay */}
           {status === 'recording' ? (
             <StopCircle className="w-8 h-8 text-white/50 absolute drop-shadow-md backdrop-blur-sm z-20" />
           ) : status === 'initializing' ? (
             <Loader2 className="w-8 h-8 text-white/50 absolute drop-shadow-md backdrop-blur-sm z-20 animate-spin" />
           ) : (
             <Mic className="w-8 h-8 text-white/50 absolute drop-shadow-md backdrop-blur-sm z-20 opacity-0 group-hover:opacity-100 transition-opacity" />
           )}
        </div>
      </button>
      </div>
    </div>
  );
}
