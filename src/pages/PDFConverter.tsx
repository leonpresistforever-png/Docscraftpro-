import React, { useRef, useState, useEffect } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Button } from '../components/ui/Button';
import { 
  UploadCloud, FileText, ArrowRight, Download, Sparkles, Settings, Trash2, 
  RefreshCw, CheckCircle, Eye, EyeOff, Layout, FileCode, Check, FileSpreadsheet,
  Layers, Database, FileBox, Play, Globe, HelpCircle, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import { getSlidesToken, createGoogleSlidePresentation, signInForGoogleSlides } from '../utils/googleSlides';
import { getSheetsToken, createGoogleSheet, signInForGoogleSheets } from '../utils/googleSheets';

// Define the file format configuration
interface FileFormat {
  id: string;
  name: string;
  extension: string;
  category: 'document' | 'spreadsheet' | 'presentation' | 'image' | 'code' | 'archive';
  mimeType: string;
}

const SUPPORTED_FORMATS: FileFormat[] = [
  { id: 'pdf', name: 'Fixed Portable Document', extension: 'pdf', category: 'document', mimeType: 'application/pdf' },
  { id: 'docx', name: 'Word Processing Document', extension: 'docx', category: 'document', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
  { id: 'html', name: 'Interactive Webpage', extension: 'html', category: 'code', mimeType: 'text/html' },
  { id: 'pptx', name: 'PowerPoint Presentation', extension: 'pptx', category: 'presentation', mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' },
  { id: 'txt', name: 'Plain Text File', extension: 'txt', category: 'document', mimeType: 'text/plain' },
  { id: 'jpg', name: 'JPEG Image', extension: 'jpg', category: 'image', mimeType: 'image/jpeg' },
  { id: 'png', name: 'PNG Image', extension: 'png', category: 'image', mimeType: 'image/png' },
  { id: 'excel', name: 'Excel Spreadsheet', extension: 'xlsx', category: 'spreadsheet', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
  { id: 'zip', name: 'ZIP Compressed Archive', extension: 'zip', category: 'archive', mimeType: 'application/zip' },
  { id: 'csv', name: 'Comma Separated Values', extension: 'csv', category: 'spreadsheet', mimeType: 'text/csv' },
  { id: 'ods', name: 'OpenDocument Spreadsheet', extension: 'ods', category: 'spreadsheet', mimeType: 'application/vnd.oasis.opendocument.spreadsheet' },
  { id: 'odp', name: 'OpenDocument Presentation', extension: 'odp', category: 'presentation', mimeType: 'application/vnd.oasis.opendocument.presentation' },
  { id: 'odr', name: 'OpenDocument Report', extension: 'odt', category: 'document', mimeType: 'application/vnd.oasis.opendocument.text' },
  { id: 'rtf', name: 'Rich Text Format', extension: 'rtf', category: 'document', mimeType: 'application/rtf' },
  { id: 'xml', name: 'Extensible Markup Language', extension: 'xml', category: 'code', mimeType: 'application/xml' }
];

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  file: File;
  text: string | null;
  status: 'pending' | 'parsing' | 'completed' | 'error';
}

interface BYOKConfig {
  provider: 'gemini' | 'openai' | 'anthropic';
  apiKey: string;
  modelName: string;
}

export function PDFConverter() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Basic states
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [sourceText, setSourceText] = useState<string>('');
  const [targetFormatId, setTargetFormatId] = useState<string>('pdf');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isParsingFiles, setIsParsingFiles] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [convertedResult, setConvertedResult] = useState<string>('');
  const [externalExportUrl, setExternalExportUrl] = useState<string>('');
  const [showKey, setShowKey] = useState<boolean>(false);
  const [showLogs, setShowLogs] = useState<boolean>(true);
  
  // Integration Tokens
  const [googleSlidesToken, setGoogleSlidesToken] = useState<string | null>(getSlidesToken());
  const [googleSheetsToken, setGoogleSheetsToken] = useState<string | null>(getSheetsToken());

  // New States for Dynamic Format Dropdown & Sync Tasks
  const [isFormatDropdownOpen, setIsFormatDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isSyncingSlides, setIsSyncingSlides] = useState(false);
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);

  // Helper parsers for sync
  const parseResultToSlides = (text: string) => {
    const lines = text.split('\n');
    const slides: { heading: string, bullets: string[] }[] = [];
    let currentHeading = customTitle || "Compiled Presentation";
    let currentBullets: string[] = [];
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;
      if (trimmed.startsWith('#') || trimmed.startsWith('Slide') || trimmed.toUpperCase().startsWith('HEADER:')) {
        if (currentBullets.length > 0 || currentHeading !== (customTitle || "Compiled Presentation")) {
          slides.push({ heading: currentHeading, bullets: currentBullets });
        }
        currentHeading = trimmed.replace(/^#+\s*/, '').replace(/^Slide\s*\d*:\s*/i, '');
        currentBullets = [];
      } else {
        currentBullets.push(trimmed.replace(/^[-*•]\s*/, ''));
      }
    });
    
    if (currentBullets.length > 0 || slides.length === 0) {
      slides.push({ heading: currentHeading, bullets: currentBullets.length > 0 ? currentBullets : ["Compiled content slide."] });
    }
    
    return slides;
  };

  const parseResultToSheets = (text: string) => {
    const lines = text.split('\n');
    const rows: string[][] = [];
    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;
      const cells = trimmed.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''));
      rows.push(cells);
    });
    if (rows.length === 0) {
      rows.push(["Compiled Content"], [text]);
    }
    return rows;
  };

  const isPresetModel = (provider: string, modelName: string) => {
    if (provider === 'gemini') return ['gemini-2.5-flash', 'gemini-1.5-pro', 'gemini-2.5-pro'].includes(modelName);
    if (provider === 'openai') return ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'].includes(modelName);
    if (provider === 'anthropic') return ['claude-3-5-sonnet', 'claude-3-opus', 'claude-3-5-haiku'].includes(modelName);
    return false;
  };

  // Auto layout option (AI decides everything)
  const [autoLayoutMode, setAutoLayoutMode] = useState<boolean>(true);
  const [customTitle, setCustomTitle] = useState<string>('');

  // BYOK Configuration
  const [config, setConfig] = useState<BYOKConfig>(() => {
    const saved = localStorage.getItem('docscraft_byok_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return {
      provider: 'gemini',
      apiKey: '',
      modelName: 'gemini-2.5-flash'
    };
  });

  // Sync config
  useEffect(() => {
    localStorage.setItem('docscraft_byok_config', JSON.stringify(config));
  }, [config]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const handleProviderChange = (provider: 'gemini' | 'openai' | 'anthropic') => {
    let defaultModel = '';
    if (provider === 'gemini') defaultModel = 'gemini-2.5-flash';
    else if (provider === 'openai') defaultModel = 'gpt-4o';
    else if (provider === 'anthropic') defaultModel = 'claude-3-5-sonnet';
    
    setConfig(prev => ({
      ...prev,
      provider,
      modelName: defaultModel
    }));
  };

  // Extract content from any file
  const parseSingleFile = async (uploaded: UploadedFile): Promise<string> => {
    const file = uploaded.file;
    
    if (file.name.endsWith('.pdf')) {
      const pdfjsLib = await import('pdfjs-dist');
      const pdfjsVersion = (pdfjsLib as any).version || '4.10.38';
      try {
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
      } catch (e) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.mjs`;
      }
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let extractedText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        extractedText += content.items.map((item: any) => item.str).join(' ') + '\n\n';
      }
      return extractedText;
    } else if (file.name.endsWith('.png') || file.name.endsWith('.jpg') || file.name.endsWith('.jpeg')) {
      return `[IMAGE: ${file.name}] Transcribing image structures using multi-modal context core. Ready to extract textual and aesthetic data.`;
    } else {
      // General Text, CSV, HTML, XML, Markdown reading
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve((e.target?.result as string) || '');
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
      });
    }
  };

  // Upload handlers
  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected) return;

    const newFiles: UploadedFile[] = Array.from(selected).map(f => {
      const sizeStr = f.size > 1024 * 1024 
        ? `${(f.size / (1024 * 1024)).toFixed(2)} MB` 
        : `${(f.size / 1024).toFixed(1)} KB`;
        
      return {
        id: Math.random().toString(36).substring(2, 9),
        name: f.name,
        size: sizeStr,
        file: f,
        text: null,
        status: 'pending'
      };
    });

    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  // Background parsing of files
  useEffect(() => {
    const parsePending = async () => {
      const pending = uploadedFiles.filter(f => f.status === 'pending');
      if (pending.length === 0) return;

      setIsParsingFiles(true);
      addLog(`Initiated multi-format decoder cores for ${pending.length} incoming streams...`);

      for (const fileObj of pending) {
        setUploadedFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'parsing' } : f));
        addLog(`Analyzing file schema: ${fileObj.name}`);
        try {
          const text = await parseSingleFile(fileObj);
          setUploadedFiles(prev => prev.map(f => f.id === fileObj.id ? { 
            ...f, 
            status: 'completed', 
            text: text 
          } : f));
          addLog(`Successful decode: ${fileObj.name} (${text.length} extracted characters)`);
        } catch (err: any) {
          console.error(err);
          setUploadedFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'error' } : f));
          addLog(`Parsing failed for ${fileObj.name}: ${err.message || err}`);
        }
      }
      setIsParsingFiles(false);
    };

    parsePending();
  }, [uploadedFiles]);

  const handleRemoveFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
    addLog(`Purged stream ${id} from memory canvas.`);
  };

  // Main Conversion Action
  const handleConvert = async () => {
    if (uploadedFiles.length === 0 && !sourceText.trim()) {
      alert("Please upload at least one document or enter text context to convert.");
      return;
    }

    const uncompleted = uploadedFiles.filter(f => f.status !== 'completed');
    if (uncompleted.length > 0) {
      alert("Please wait for all uploaded files to finish parsing.");
      return;
    }

    if (!config.apiKey.trim()) {
      alert("Bring Your Own Key (BYOK) system requires a valid API Key. Please insert your key in the configurations panel.");
      return;
    }

    setIsProcessing(true);
    setConvertedResult('');
    setExternalExportUrl('');
    setLogs([]);
    addLog("Activating Bidirectional Multi-Format Conversion Core...");
    addLog(`Target Model Gateway: ${config.provider.toUpperCase()} (${config.modelName})`);
    
    // Assemble text context
    let rawContext = sourceText.trim() ? `[MANUAL USER TEXT]:\n${sourceText.trim()}\n\n` : '';
    uploadedFiles.forEach((f, idx) => {
      rawContext += `\n--- BEGIN ATTACHMENT ${idx + 1}: ${f.name} ---\n`;
      rawContext += f.text || '';
      rawContext += `\n--- END ATTACHMENT ${idx + 1}: ${f.name} ---\n`;
    });

    const targetFormat = SUPPORTED_FORMATS.find(f => f.id === targetFormatId) || SUPPORTED_FORMATS[0];
    addLog(`Converting context streams into target format: ${targetFormat.name} (.${targetFormat.extension})`);

    const promptText = `You are the master core compiler of Agent Studio. Your task is to transform and convert the following context documents into the target format: "${targetFormat.name} (.${targetFormat.extension})".

${autoLayoutMode ? 'AUTO MODE: Analyze the input context, deduce the optimal title, structure, layout rules, and headings on your own.' : `CUSTOM MANIFEST: Use the following title: "${customTitle || 'Untitled Converted Document'}"`}

INSTRUCTIONS BY FORMAT CATEGORY:
1. CODE / HTML / XML: Return valid, robust, beautifully styled code with responsive viewport structures. If HTML, write complete single-page interactive layouts with gorgeous inline or CSS styling (using clean colors and typography).
2. SPREADSHEETS / CSV / EXCEL / ODS: Compile raw data, logs, metrics, or factual paragraphs into structured table values with columns and rows. Format strictly as standard CSV text so we can parse it.
3. PRESENTATIONS / SLIDES / ODP: Format as slide-by-slide titles and bullet-point content outlines, structured clearly so we can render pages.
4. WORD / TEXT / RTF / ODT: Provide rich professional prose with high-end typography formatting, logical sub-headers, and structured bullet points.
5. NO WRAPPERS: Do not add conversational sentences like "Here is your converted file". Respond strictly with the formatted data.
6. NO EMOJIS: Ensure professional design representation.

CONTEXT DOCUMENTS:
${rawContext}

Target Compiled Output:`;

    try {
      let responseText = "";

      if (config.provider === 'gemini') {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.modelName}:generateContent?key=${config.apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: { temperature: 0.1, topP: 0.95 }
          })
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err?.error?.message || `HTTP error ${response.status}`);
        }
        const data = await response.json();
        responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      } else if (config.provider === 'openai') {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`
          },
          body: JSON.stringify({
            model: config.modelName,
            messages: [
              { role: "system", content: "You are the ultimate file compilation engine." },
              { role: "user", content: promptText }
            ],
            temperature: 0.1
          })
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err?.error?.message || `HTTP error ${response.status}`);
        }
        const data = await response.json();
        responseText = data?.choices?.[0]?.message?.content || "";
      } else if (config.provider === 'anthropic') {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': config.apiKey,
            'anthropic-version': '2023-06-01',
            'dangerously-allow-the-api-key-in-the-browser': 'true'
          },
          body: JSON.stringify({
            model: config.modelName,
            max_tokens: 4000,
            messages: [{ role: "user", content: promptText }]
          })
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err?.error?.message || `HTTP error ${response.status}`);
        }
        const data = await response.json();
        responseText = data?.content?.[0]?.text || "";
      }

      if (!responseText) {
        throw new Error("Did not receive a response from the designated gateway.");
      }

      // Cleanup Markdown wrappers if code returned
      let cleaned = responseText;
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```[a-zA-Z]*\n/, '').replace(/\n```$/, '');
      }

      setConvertedResult(cleaned);
      addLog("Compilation finalized successfully.");
      addLog(`Result payload: ${cleaned.length} bytes.`);

      // Check for Google Slides integration triggered
      if (targetFormat.category === 'presentation' && googleSlidesToken) {
        addLog("Syncing with slide presentations integration service...");
        try {
          const slideId = await createGoogleSlidePresentation(
            customTitle || "Converted Slide Deck",
            [{ heading: customTitle || "Converted Slide Deck", bullets: [cleaned] }],
            googleSlidesToken
          );
          const link = `https://docs.google.com/presentation/d/${slideId}/edit`;
          setExternalExportUrl(link);
          addLog(`Google Slides Workspace created natively: ${link}`);
        } catch (slideErr: any) {
          addLog(`Slides service skipped: ${slideErr.message}`);
        }
      }

      // Check for Google Sheets integration triggered
      if (targetFormat.category === 'spreadsheet' && googleSheetsToken) {
        addLog("Syncing with spreadsheets database integration service...");
        try {
          // Parse CSV text into raw array rows
          const rows: string[][] = cleaned
            .split('\n')
            .map(line => line.split(',').map(cell => cell.trim().replace(/^"|"$/g, '')));
            
          const sheetUrl = await createGoogleSheet(
            customTitle || "Converted Sheet Dataset",
            rows,
            googleSheetsToken
          );
          setExternalExportUrl(sheetUrl);
          addLog(`Google Sheets Workspace created natively: ${sheetUrl}`);
        } catch (sheetErr: any) {
          addLog(`Sheets service skipped: ${sheetErr.message}`);
        }
      }

    } catch (err: any) {
      console.error(err);
      addLog(`Compilation interrupted: ${err.message || err}`);
      alert(`Conversion Failed: ${err.message || err}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Real client-side format triggers and downloads
  const handleDownload = async () => {
    if (!convertedResult) return;

    const targetFormat = SUPPORTED_FORMATS.find(f => f.id === targetFormatId) || SUPPORTED_FORMATS[0];
    const baseName = customTitle ? customTitle.replace(/[^a-zA-Z0-9]/g, '_') : 'converted_document';
    const filename = `${baseName}.${targetFormat.extension}`;

    addLog(`Downloading finalized asset: ${filename}`);

    if (targetFormatId === 'pdf') {
      const doc = new jsPDF();
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(11);
      const splitText = doc.splitTextToSize(convertedResult, 170);
      let y = 20;
      splitText.forEach((line: string) => {
        if (y > 275) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, 20, y);
        y += 6;
      });
      doc.save(filename);
      return;
    }

    if (targetFormatId === 'png' || targetFormatId === 'jpg') {
      // Draw document to a physical canvas and download
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = 800;
          canvas.height = 600;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, 800, 600);
          
          ctx.fillStyle = '#000000';
          ctx.font = '16px monospace';
          ctx.fillText(customTitle || "CONVERTED WORKSPACE CANVAS", 40, 50);
          
          ctx.font = '12px sans-serif';
          const lines = convertedResult.split('\n').slice(0, 30);
          let y = 90;
          lines.forEach(l => {
            ctx.fillText(l.substring(0, 95), 40, y);
            y += 16;
          });

          const dataUrl = canvas.toDataURL(targetFormatId === 'jpg' ? 'image/jpeg' : 'image/png');
          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = filename;
          link.click();
        }
      }
      return;
    }

    // Standard raw text / document formats download
    const blob = new Blob([convertedResult], { type: targetFormat.mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSyncToSlides = async () => {
    if (!convertedResult) return;
    if (!googleSlidesToken) {
      alert("Please link Google Slides first.");
      return;
    }
    setIsSyncingSlides(true);
    addLog("Syncing current canvas with Google Slides service...");
    try {
      const slidesData = parseResultToSlides(convertedResult);
      const slideId = await createGoogleSlidePresentation(
        customTitle || "Converted Slide Deck",
        slidesData,
        googleSlidesToken
      );
      const url = `https://docs.google.com/presentation/d/${slideId}/edit`;
      setExternalExportUrl(url);
      addLog(`Sync Successful! Google Slides created: ${url}`);
      window.open(url, '_blank');
    } catch (err: any) {
      addLog(`Google Slides sync failure: ${err.message}`);
      alert(`Sync Failed: ${err.message}`);
    } finally {
      setIsSyncingSlides(false);
    }
  };

  const handleSyncToSheets = async () => {
    if (!convertedResult) return;
    if (!googleSheetsToken) {
      alert("Please link Google Sheets first.");
      return;
    }
    setIsSyncingSheets(true);
    addLog("Syncing current canvas with Google Sheets service...");
    try {
      const sheetData = parseResultToSheets(convertedResult);
      const sheetUrl = await createGoogleSheet(
        customTitle || "Converted Sheet Dataset",
        sheetData,
        googleSheetsToken
      );
      setExternalExportUrl(sheetUrl);
      addLog(`Sync Successful! Google Sheet created: ${sheetUrl}`);
      window.open(sheetUrl, '_blank');
    } catch (err: any) {
      addLog(`Google Sheets sync failure: ${err.message}`);
      alert(`Sync Failed: ${err.message}`);
    } finally {
      setIsSyncingSheets(false);
    }
  };

  // Authenticate Google Workspace integrations
  const handleAuthSlides = async () => {
    try {
      addLog("Requesting presentation OAuth security token...");
      const token = await signInForGoogleSlides();
      setGoogleSlidesToken(token);
      addLog("Google Slides API successfully linked.");
    } catch (err: any) {
      alert("Authentication error: " + err.message);
    }
  };

  const handleAuthSheets = async () => {
    try {
      addLog("Requesting spreadsheets OAuth security token...");
      const token = await signInForGoogleSheets();
      setGoogleSheetsToken(token);
      addLog("Google Sheets API successfully linked.");
    } catch (err: any) {
      alert("Authentication error: " + err.message);
    }
  };

  return (
    <div className="flex h-screen bg-neutral-950 font-sans text-neutral-200">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Header - Strictly Black and White */}
        <header className="px-10 py-6 border-b border-neutral-800 flex justify-between items-center bg-neutral-950 shrink-0">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-widest text-white">
              AI Conversion Engine
            </h1>
            <p className="text-xs text-neutral-500 font-medium tracking-tight mt-0.5">
              Bidirectional Multi-Format Workspace & Compiler Core
            </p>
          </div>
          <div className="flex items-center gap-4">
            
            {/* BYOK Toggle */}
            <button 
              onClick={() => setShowKey(!showKey)}
              className="px-4 py-2 border border-neutral-800 hover:border-neutral-700 bg-neutral-900 rounded-lg text-xs font-semibold uppercase tracking-wider text-neutral-300 transition"
            >
              Configure API Keys
            </button>
            
            <button 
              onClick={() => setShowLogs(!showLogs)}
              className="px-4 py-2 border border-neutral-800 hover:border-neutral-700 bg-neutral-900 rounded-lg text-xs font-semibold uppercase tracking-wider text-neutral-400 transition"
            >
              {showLogs ? 'Hide Engine Logs' : 'Show Engine Logs'}
            </button>
          </div>
        </header>

        {/* Workspace Panels */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left panel: Upload and Settings */}
          <div className="w-[450px] border-r border-neutral-800 flex flex-col h-full bg-neutral-950 overflow-y-auto shrink-0 select-none">
            
            {/* BYOK Area */}
            <AnimatePresence>
              {showKey && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="p-6 border-b border-neutral-800 bg-neutral-900/40 overflow-hidden"
                >
                  <h3 className="text-xs font-black uppercase tracking-widest text-white mb-4">
                    Bring Your Own Key (BYOK)
                  </h3>
                  
                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block text-[10px] uppercase text-neutral-400 font-bold tracking-wider mb-1.5">
                        Provider Gateway
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['gemini', 'openai', 'anthropic'] as const).map(prov => (
                          <button
                            key={prov}
                            onClick={() => handleProviderChange(prov)}
                            className={`py-2 border rounded-md font-bold uppercase transition ${
                              config.provider === prov 
                                ? 'bg-white text-black border-white' 
                                : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                            }`}
                          >
                            {prov}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase text-neutral-400 font-bold tracking-wider mb-1.5">
                        API Authorization Key
                      </label>
                      <input
                        type="password"
                        placeholder="Paste private API Key..."
                        value={config.apiKey}
                        onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                        className="w-full bg-neutral-950 border border-neutral-800 focus:border-neutral-700 rounded-lg p-2.5 outline-none text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase text-neutral-400 font-bold tracking-wider mb-1.5">
                        Target Model / Schema Preset
                      </label>
                      <select
                        value={
                          isPresetModel(config.provider, config.modelName) ? config.modelName : 'custom'
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val !== 'custom') {
                            setConfig(prev => ({ ...prev, modelName: val }));
                          } else {
                            const defaultCustom = config.provider === 'gemini' ? 'gemini-2.5-pro-custom' : config.provider === 'openai' ? 'gpt-4-custom' : 'claude-3-custom';
                            setConfig(prev => ({ ...prev, modelName: defaultCustom }));
                          }
                        }}
                        className="w-full bg-neutral-950 border border-neutral-800 focus:border-neutral-700 rounded-lg p-2.5 outline-none text-white text-xs font-semibold mb-2"
                      >
                        {config.provider === 'gemini' && (
                          <>
                            <option value="gemini-2.5-flash">Gemini 2.5 Flash (Latest Speed)</option>
                            <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Context)</option>
                            <option value="gemini-2.5-pro">Gemini 2.5 Pro (Latest Reasoning)</option>
                          </>
                        )}
                        {config.provider === 'openai' && (
                          <>
                            <option value="gpt-4o">GPT-4o (Omni Reasoning)</option>
                            <option value="gpt-4o-mini">GPT-4o-mini (Speed Preset)</option>
                            <option value="gpt-4-turbo">GPT-4 Turbo (Legacy Pro)</option>
                          </>
                        )}
                        {config.provider === 'anthropic' && (
                          <>
                            <option value="claude-3-5-sonnet">Claude 3.5 Sonnet (Latest Pro)</option>
                            <option value="claude-3-opus">Claude 3.0 Opus (Complex Reasoning)</option>
                            <option value="claude-3-5-haiku">Claude 3.5 Haiku (Fast Target)</option>
                          </>
                        )}
                        <option value="custom">Custom Model Name...</option>
                      </select>

                      {!isPresetModel(config.provider, config.modelName) && (
                        <input
                          type="text"
                          placeholder="Type custom model name..."
                          value={config.modelName}
                          onChange={(e) => setConfig(prev => ({ ...prev, modelName: e.target.value }))}
                          className="w-full bg-neutral-950 border border-neutral-800 focus:border-neutral-700 rounded-lg p-2.5 outline-none text-white font-mono text-xs mt-1 animate-in fade-in duration-200"
                        />
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="p-8 space-y-8">
              
              {/* Document Source Streams */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-white mb-4">
                  1. Input Sources (Supports Side-By-Side Merge)
                </h3>
                
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border border-dashed border-neutral-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-neutral-900/30 hover:border-neutral-700 transition"
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    multiple 
                    className="hidden" 
                    onChange={handleFilesChange}
                  />
                  <UploadCloud className="w-8 h-8 text-neutral-500 mb-3 animate-pulse" />
                  <p className="text-xs font-bold text-neutral-300">Drag or Upload Source Files</p>
                  <p className="text-[10px] text-neutral-500 font-medium tracking-tight mt-1">
                    Upload multiple files to merge/compile side-by-side
                  </p>
                </div>

                {/* File List */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                    {uploadedFiles.map(fileObj => (
                      <div 
                        key={fileObj.id} 
                        className="flex items-center justify-between p-3 border border-neutral-800 rounded-xl bg-neutral-900/30"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileText className="w-4 h-4 text-neutral-400 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs text-neutral-200 font-bold truncate">{fileObj.name}</p>
                            <p className="text-[10px] text-neutral-500 font-medium">{fileObj.size}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {fileObj.status === 'parsing' && <RefreshCw className="w-3.5 h-3.5 text-neutral-400 animate-spin" />}
                          {fileObj.status === 'completed' && <CheckCircle className="w-3.5 h-3.5 text-neutral-400" />}
                          <button 
                            onClick={() => handleRemoveFile(fileObj.id)}
                            className="p-1 text-neutral-500 hover:text-white transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Textbox source */}
                <div className="mt-6">
                  <label className="block text-[10px] uppercase text-neutral-500 font-bold tracking-wider mb-2">
                    Or Enter Text Directly
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Enter manual workspace text, outline, or markdown content to compile..."
                    value={sourceText}
                    onChange={(e) => setSourceText(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-neutral-700 rounded-xl p-3 outline-none text-xs text-white resize-none"
                  />
                </div>
              </div>

              {/* Target Format Area */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-white mb-4">
                  2. Select Target Format
                </h3>
                
                <div className="relative">
                  <button
                    onClick={() => setIsFormatDropdownOpen(!isFormatDropdownOpen)}
                    className="w-full bg-neutral-950 border border-neutral-800 hover:border-neutral-700 rounded-xl p-3.5 flex items-center justify-between text-xs text-white font-bold transition group duration-200 cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-850 text-[10px] rounded text-neutral-300 uppercase">
                        {(SUPPORTED_FORMATS.find(fmt => fmt.id === targetFormatId) || SUPPORTED_FORMATS[0]).extension}
                      </span>
                      <span>{(SUPPORTED_FORMATS.find(fmt => fmt.id === targetFormatId) || SUPPORTED_FORMATS[0]).name}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform duration-300 ${isFormatDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isFormatDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 right-0 mt-2 bg-neutral-950 border border-neutral-850 rounded-xl shadow-2xl overflow-hidden z-50 p-2 max-h-80 overflow-y-auto"
                      >
                        {/* Categories Tab Filters */}
                        <div className="flex gap-1 overflow-x-auto pb-2 border-b border-neutral-900 mb-2 scrollbar-none">
                          {['all', 'document', 'spreadsheet', 'presentation', 'image', 'code', 'archive'].map(cat => (
                            <button
                              key={cat}
                              onClick={() => setSelectedCategory(cat)}
                              className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shrink-0 transition cursor-pointer ${selectedCategory === cat ? 'bg-white text-neutral-950' : 'text-neutral-400 hover:text-white bg-neutral-900/40'}`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>

                        {/* Format List Grid */}
                        <div className="grid grid-cols-1 gap-1">
                          {SUPPORTED_FORMATS
                            .filter(fmt => selectedCategory === 'all' || fmt.category === selectedCategory)
                            .map(fmt => (
                              <button
                                key={fmt.id}
                                onClick={() => {
                                  setTargetFormatId(fmt.id);
                                  setIsFormatDropdownOpen(false);
                                }}
                                className={`w-full text-left p-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition cursor-pointer ${targetFormatId === fmt.id ? 'bg-white/10 text-white' : 'text-neutral-400 hover:text-white hover:bg-neutral-900'}`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <span className="px-1.5 py-0.5 bg-neutral-900 border border-neutral-850 text-[10px] rounded text-neutral-300 uppercase">
                                    {fmt.extension}
                                  </span>
                                  <span>{fmt.name}</span>
                                </div>
                                {targetFormatId === fmt.id && <Check className="w-3.5 h-3.5 text-white animate-in zoom-in-50 duration-150" />}
                              </button>
                            ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Design & Title Rules */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-white mb-4">
                  3. Stylist Studio & Layout Rules
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                    <span className="text-xs text-neutral-400">Let AI Decide Title & Styles</span>
                    <button
                      onClick={() => setAutoLayoutMode(!autoLayoutMode)}
                      className={`w-12 h-6 rounded-full transition relative ${autoLayoutMode ? 'bg-white' : 'bg-neutral-800'}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-neutral-950 absolute top-1 transition-all ${autoLayoutMode ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>

                  {!autoLayoutMode && (
                    <div className="animate-in fade-in duration-200">
                      <label className="block text-[10px] uppercase text-neutral-500 font-bold tracking-wider mb-1.5">
                        Custom Title Heading
                      </label>
                      <input
                        type="text"
                        placeholder="CONSOLIDATED DOSSIER"
                        value={customTitle}
                        onChange={(e) => setCustomTitle(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 focus:border-neutral-700 rounded-lg p-2.5 outline-none text-xs text-white"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Google Integration Services */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-white mb-4">
                  4. Enterprise Integrations
                </h3>
                
                <div className="space-y-3">
                  <div className="p-4 border border-neutral-800 rounded-xl bg-neutral-900/10 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">Google Slides</p>
                      <p className="text-[10px] text-neutral-500 font-medium">Export presentation targets directly to drive</p>
                    </div>
                    {googleSlidesToken ? (
                      <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 flex items-center gap-1">
                        <Check className="w-3 h-3 text-white" /> Linked
                      </span>
                    ) : (
                      <button 
                        onClick={handleAuthSlides}
                        className="px-3 py-1.5 bg-white text-black hover:bg-neutral-200 rounded text-[10px] font-bold uppercase tracking-wider"
                      >
                        Link
                      </button>
                    )}
                  </div>

                  <div className="p-4 border border-neutral-800 rounded-xl bg-neutral-900/10 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">Google Sheets</p>
                      <p className="text-[10px] text-neutral-500 font-medium">Create and link database spreadsheets natively</p>
                    </div>
                    {googleSheetsToken ? (
                      <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 flex items-center gap-1">
                        <Check className="w-3 h-3 text-white" /> Linked
                      </span>
                    ) : (
                      <button 
                        onClick={handleAuthSheets}
                        className="px-3 py-1.5 bg-white text-black hover:bg-neutral-200 rounded text-[10px] font-bold uppercase tracking-wider"
                      >
                        Link
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Primary Compile Action */}
              <Button
                variant="outline"
                onClick={handleConvert}
                disabled={isProcessing || isParsingFiles}
                className="w-full border-neutral-700 bg-white hover:bg-neutral-200 text-black font-black uppercase tracking-widest py-6 text-sm transition"
              >
                {isProcessing ? 'Compiling File...' : 'Compile & Convert'}
              </Button>

            </div>
          </div>

          {/* Right panel: Results and Logs */}
          <div className="flex-1 flex flex-col h-full bg-neutral-950">
            
            {/* View Canvas Output */}
            <div className="flex-1 p-8 overflow-y-auto flex flex-col min-h-0">
              
              <div className="flex justify-between items-center mb-4 select-none shrink-0">
                <h3 className="text-xs font-black uppercase tracking-widest text-white">
                  Compiler Canvas Output
                </h3>
                {convertedResult && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {googleSlidesToken && (
                      <button
                        onClick={handleSyncToSlides}
                        disabled={isSyncingSlides}
                        className="px-3.5 py-2 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-lg text-xs font-bold uppercase tracking-wider text-blue-400 hover:text-blue-300 flex items-center gap-1.5 transition cursor-pointer"
                      >
                        {isSyncingSlides ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Syncing Slides...
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 text-blue-500" /> Sync to Slides
                          </>
                        )}
                      </button>
                    )}
                    {googleSheetsToken && (
                      <button
                        onClick={handleSyncToSheets}
                        disabled={isSyncingSheets}
                        className="px-3.5 py-2 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-lg text-xs font-bold uppercase tracking-wider text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition cursor-pointer"
                      >
                        {isSyncingSheets ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Syncing Sheets...
                          </>
                        ) : (
                          <>
                            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" /> Sync to Sheets
                          </>
                        )}
                      </button>
                    )}
                    {externalExportUrl && (
                      <a 
                        href={externalExportUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5 transition"
                      >
                        Open Workspace Target <Globe className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={handleDownload}
                      className="px-4 py-2 bg-white hover:bg-neutral-200 text-black rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer"
                    >
                      Download ready file <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Visual Frame */}
              <div className="flex-1 border border-neutral-800 rounded-2xl bg-neutral-900/20 p-8 font-mono text-xs overflow-y-auto leading-relaxed relative min-h-[300px]">
                {isProcessing ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-950/80 backdrop-blur-sm">
                    <Sparkles className="w-8 h-8 text-neutral-300 animate-pulse mb-3" />
                    <p className="text-xs font-bold tracking-widest uppercase text-white animate-pulse">
                      Synthesizing and compiles format targets...
                    </p>
                  </div>
                ) : convertedResult ? (
                  <div className="whitespace-pre-wrap text-neutral-300">{convertedResult}</div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center opacity-30 text-center">
                    <Layers className="w-10 h-10 mb-4 text-neutral-400" />
                    <p className="text-sm font-bold uppercase tracking-widest text-white mb-1">Compiler Canvas Empty</p>
                    <p className="text-xs max-w-sm text-neutral-400 leading-normal">
                      Upload your source documents or type your context instructions. Click Compile to stream compiled format structures here.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Hidden canvas for image export */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Logs Area */}
            <AnimatePresence>
              {showLogs && (
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: '220px' }}
                  exit={{ height: 0 }}
                  className="border-t border-neutral-800 bg-neutral-950 flex flex-col h-[220px] overflow-hidden shrink-0"
                >
                  <div className="px-8 py-3 border-b border-neutral-800 bg-neutral-950 flex justify-between items-center shrink-0 select-none">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5" /> Engine Telemetry Logs
                    </h3>
                    <button 
                      onClick={() => setLogs([])}
                      className="text-[9px] uppercase font-bold text-neutral-500 hover:text-neutral-300 transition"
                    >
                      Clear Telemetry
                    </button>
                  </div>

                  <div className="flex-1 p-6 overflow-y-auto font-mono text-[10px] text-neutral-400 space-y-1.5 bg-neutral-950 selection:bg-neutral-800">
                    {logs.length === 0 ? (
                      <p className="text-neutral-600 italic">No telemetry data recorded.</p>
                    ) : (
                      logs.map((log, index) => (
                        <p key={index} className="leading-tight truncate">
                          {log}
                        </p>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>

      </div>
    </div>
  );
}
