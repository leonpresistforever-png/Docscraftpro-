import React, { useState, useRef, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import { Mic, Loader2, StopCircle, AlertCircle, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { encryptData, decryptData } from '../lib/encryption';

interface RobotDictatorProps {
  editor: Editor | null;
}

type RobotStatus = 'idle' | 'initializing' | 'recording' | 'processing' | 'error';

export function RobotDictator({ editor }: RobotDictatorProps) {
  const [status, setStatus] = useState<RobotStatus>('idle');
  const [liveTranscript, setLiveTranscript] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [speechKey, setSpeechKey] = useState("");
  const [reasoningKey, setReasoningKey] = useState("");
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const storedSpeech = localStorage.getItem('dictator_speech_key');
    if (storedSpeech) {
      try { setSpeechKey(decryptData(storedSpeech)); } catch (e) { setSpeechKey(storedSpeech); }
    }
    const storedReason = localStorage.getItem('dictator_reason_key');
    if (storedReason) {
      try { setReasoningKey(decryptData(storedReason)); } catch (e) { setReasoningKey(storedReason); }
    }
  }, []);

  const handleSpeechKeyChange = (val: string) => {
    setSpeechKey(val);
    if (val) localStorage.setItem('dictator_speech_key', encryptData(val));
    else localStorage.removeItem('dictator_speech_key');
  };

  const handleReasoningKeyChange = (val: string) => {
    setReasoningKey(val);
    if (val) localStorage.setItem('dictator_reason_key', encryptData(val));
    else localStorage.removeItem('dictator_reason_key');
  };

  const startRecording = async () => {
    try {
      if (!editor) {
        setErrorMessage("Editor not ready");
        setStatus('error');
        return;
      }
      
      setStatus('initializing');
      setErrorMessage("");
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setErrorMessage("Microphone access is not supported or blocked by browser settings.");
        setStatus('error');
        return;
      }
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (err: any) {
        setErrorMessage(err.message === 'Permission denied' ? "Microphone access denied. Please allow in browser." : "Error accessing microphone.");
        setStatus('error');
        return;
      }
      streamRef.current = stream;

      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          if (audioBlob.size === 0) {
             setStatus('idle');
             setLiveTranscript("");
             return;
          }
          
          setLiveTranscript("Uploading dictation...");
          
          const headers: Record<string, string> = { 'Content-Type': 'application/octet-stream' };
          if (speechKey) headers['x-custom-assembly-key'] = speechKey;

          const uploadRes = await fetch('/api/assembly/transcribe', {
            method: 'POST',
            headers,
            body: audioBlob
          });
          
          if (!uploadRes.ok) {
            const errText = await uploadRes.text();
            throw new Error(`Failed to upload: ${errText}`);
          }
          
          const { transcriptId } = await uploadRes.json();
          if (!transcriptId) {
             throw new Error("No transcript ID returned from server.");
          }

          setLiveTranscript("Transcribing audio...");
          
          let transcriptText = "";
          while (true) {
             const pollHeaders: Record<string, string> = {};
             if (speechKey) pollHeaders['x-custom-assembly-key'] = speechKey;
             
             const pollRes = await fetch(`/api/assembly/poll/${transcriptId}`, { headers: pollHeaders });
             const pollData = await pollRes.json();
             
             if (!pollRes.ok) {
                 throw new Error(pollData.error || "Failed to poll transcription status.");
             }
             
             if (pollData.status === 'completed') {
                transcriptText = pollData.text;
                break;
             } else if (pollData.status === 'error') {
                throw new Error("Transcription failed: " + pollData.error);
             }
             // Wait before polling again
             await new Promise(r => setTimeout(r, 2000));
          }
          
          if (!transcriptText || transcriptText.trim() === '') {
             setStatus('idle');
             setLiveTranscript("");
             return;
          }
          
          setLiveTranscript("Polishing and arranging facts...");
          
          // Pass it to Gemini
          const aiRes = await fetch('/api/ai/process-transcript', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: transcriptText, customApiKey: reasoningKey })
          });
          
          const aiData = await aiRes.json();
          if (aiData.correctedText) {
            editor?.chain().focus('end').insertContent(aiData.correctedText).run();
          } else {
            editor?.chain().focus('end').insertContent(transcriptText).run();
          }
          
          setStatus('idle');
          setLiveTranscript("");
        } catch (err: any) {
          setErrorMessage(err.message || "Failed to process audio");
          setStatus('error');
        }
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;

      setStatus('recording');
      setLiveTranscript("Listening... (Speak now)");

    } catch (e: any) {
      console.error(e);
      setErrorMessage(e.message || "Unknown error occurred.");
      setStatus('error');
    }
  };

  const stopRecording = async () => {
    setStatus('processing');
    setLiveTranscript("Uploading audio...");

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
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
        <div className="bg-white/90 backdrop-blur border border-dc-gold/30 shadow-xl rounded-2xl p-4 w-64 animate-in fade-in slide-in-from-bottom flex flex-col gap-2">
           <div className="flex items-center gap-2 mb-1 text-dc-gold">
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
           className="absolute -top-10 right-0 z-50 p-2 bg-white/80 backdrop-blur border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 transition-colors"
        >
           <Settings className="w-4 h-4 text-gray-500" />
        </button>

        {showSettings && (
           <div className="absolute bottom-[110%] right-[-10px] w-72 bg-white shadow-2xl border border-gray-100 rounded-xl p-4 z-[9999] animate-in fade-in slide-in-from-bottom flex flex-col gap-3">
              <div className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-1">Robot API Settings</div>
              <div className="space-y-1">
                 <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Speech-to-Text API Key</label>
                 <input 
                    type="password"
                    placeholder="AssemblyAI Key (Optional)"
                    value={speechKey}
                    onChange={(e) => handleSpeechKeyChange(e.target.value)}
                    autoComplete="off"
                    className="w-full text-xs border border-gray-200 rounded p-1.5 focus:border-blue-400 outline-none bg-gray-50/50"
                 />
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">AI Reasoning API Key</label>
                 <input 
                    type="password"
                    placeholder="Gemini Key (Optional)"
                    value={reasoningKey}
                    onChange={(e) => handleReasoningKeyChange(e.target.value)}
                    autoComplete="off"
                    className="w-full text-xs border border-gray-200 rounded p-1.5 focus:border-blue-400 outline-none bg-gray-50/50"
                 />
                 <p className="text-[9px] text-gray-400 mt-1 leading-tight">Provide keys here to run fully locally, bypassing default endpoints.</p>
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
