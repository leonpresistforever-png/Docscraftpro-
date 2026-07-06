import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Bot, Sparkles, Tag, Loader2, Play } from 'lucide-react';
import { motion } from 'motion/react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { decryptData } from '../lib/encryption';
import { useAuth } from '../context/AuthContext';

// We import the worker using Vite's worker import
import NlpWorker from '../workers/nlp.worker.ts?worker';

export function AutonomousAgentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);
  const [summaryProgress, setSummaryProgress] = useState<{status: string, file: string, progress: number} | null>(null);
  const [classProgress, setClassProgress] = useState<{status: string, file: string, progress: number} | null>(null);
  const [isLoadingDoc, setIsLoadingDoc] = useState(true);

  const workerRef = useRef<Worker | null>(null);
  const textTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const analyzeText = useCallback((newText: string) => {
    if (!workerRef.current || newText.trim().length < 20) {
      if (newText.trim().length === 0) {
        setSummary('');
        setTags([]);
      }
      return;
    }

    setIsSummarizing(true);
    setIsClassifying(true);
    
    workerRef.current.postMessage({ type: 'summarize', text: newText });
    workerRef.current.postMessage({ type: 'classify', text: newText });
  }, []);

  // Load existing doc contents 
  useEffect(() => {
    async function fetchDoc() {
      if (!id || !user) {
        setIsLoadingDoc(false);
        return;
      }
      try {
        const docSnap = await getDoc(doc(db, 'documents', id));
        if (docSnap.exists()) {
           const data = docSnap.data();
           const decryptedContent = decryptData(data.content || '');
           
           // Strip HTML tags for processing since Tiptap stores HTML
           const tempDiv = document.createElement('div');
           tempDiv.innerHTML = decryptedContent;
           const plainText = tempDiv.textContent || tempDiv.innerText || '';
           
           setText(plainText);
           // Autonomous analysis disabled to prevent crashes
        }
      } catch (e) {
        console.error("Failed to load doc", e);
      } finally {
        setIsLoadingDoc(false);
      }
    }
    fetchDoc();
  }, [id, user]);

  useEffect(() => {
    workerRef.current = new NlpWorker();

    workerRef.current.onmessage = (event) => {
      const { status, type, result, file, progress } = event.data;
      
      if (status === 'complete') {
        if (type === 'summarize') {
          setSummary(result);
          setIsSummarizing(false);
          setSummaryProgress(null);
        } else if (type === 'classify') {
          setTags(result);
          setIsClassifying(false);
          setClassProgress(null);
        }
      } else if (status === 'progress') {
        if (type === 'summarize') setSummaryProgress({ status, file, progress });
        if (type === 'classify') setClassProgress({ status, file, progress });
      } else if (status === 'error') {
        console.error(`NLP Error (${type}):`, event.data.error);
        if (type === 'summarize') setIsSummarizing(false);
        if (type === 'classify') setIsClassifying(false);
      }
    };

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
      if (textTimeoutRef.current) {
        clearTimeout(textTimeoutRef.current);
      }
    };
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    // Auto-analysis timeout removed to prevent continuous background crashes
  };

  const handleManualTrigger = () => {
    if (textTimeoutRef.current) clearTimeout(textTimeoutRef.current);
    analyzeText(text);
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col font-sans">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 px-6 py-4 flex items-center shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(`/doc/${id}/summarize`)}
            className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-black"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-500" />
            <h1 className="text-lg font-bold text-gray-800 tracking-tight">Autonomous Docs Agent</h1>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto w-full">
        {/* Left Side: Editor */}
        <div className="flex-[1.5] bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
          <div className="bg-gray-100/50 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
             <div className="text-sm font-medium text-gray-600">Document Text</div>
             <button 
               onClick={handleManualTrigger}
               disabled={isSummarizing || isClassifying || text.length < 20}
               className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
             >
               {isSummarizing || isClassifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
               Analyze Now
             </button>
          </div>
          <textarea
            value={text}
            onChange={handleTextChange}
            placeholder="Type or paste your document content here. The autonomous background agent has been disabled for stability. Click 'Analyze Now' when ready."
            className="flex-1 p-6 text-gray-800 focus:outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Right Side: Insights */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Summary Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-4 text-indigo-600">
              <Sparkles className="w-5 h-5" />
              <h2 className="text-lg font-semibold text-gray-800">Live Summary</h2>
            </div>
            
            <div className="flex-1 min-h-[150px] relative">
              {isSummarizing && !summary && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                  <div className="text-sm">
                    {summaryProgress ? `Loading Model: ${summaryProgress.file} (${Math.round(summaryProgress.progress)}%)` : 'Summarizing...'}
                  </div>
                </div>
              )}
              {!isSummarizing && !summary && text.length < 20 && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm text-center">
                  Start typing to generate a live summary.
                </div>
              )}
              {summary && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-gray-600 leading-relaxed"
                >
                  {summary}
                  {isSummarizing && <Loader2 className="w-4 h-4 animate-spin text-indigo-400 inline-block ml-2" />}
                </motion.div>
              )}
            </div>
          </div>

          {/* Tags Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-4 text-emerald-600">
              <Tag className="w-5 h-5" />
              <h2 className="text-lg font-semibold text-gray-800">Suggested Tags</h2>
            </div>
            
            <div className="min-h-[100px] relative">
               {isClassifying && tags.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                  <div className="text-sm">
                   {classProgress ? `Loading Model: ${classProgress.file} (${Math.round(classProgress.progress)}%)` : 'Classifying...'}
                  </div>
                </div>
              )}
              {!isClassifying && tags.length === 0 && text.length < 20 && (
                 <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm text-center">
                  Start typing to generate live tags.
                </div>
              )}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, idx) => (
                    <motion.span 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      key={tag}
                      className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium border border-emerald-100"
                    >
                      {tag}
                    </motion.span>
                  ))}
                  {isClassifying && <Loader2 className="w-5 h-5 animate-spin text-emerald-400 inline" />}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
