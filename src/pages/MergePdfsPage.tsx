import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Shield, Check, Copy, Info, Cpu, Loader2, UploadCloud, 
  Trash2, Eye, EyeOff, FileText, Download, Play, RefreshCw, Sparkles, Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import ReactMarkdown from 'react-markdown';

interface PDFFile {
  id: string;
  name: string;
  size: string;
  file: File;
  pagesCount: number | null;
  text: string | null;
  status: 'pending' | 'parsing' | 'completed' | 'error';
}

interface BYOKConfig {
  provider: 'gemini' | 'openai' | 'anthropic';
  apiKey: string;
  modelName: string;
}

export function MergePdfsPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isParsingFiles, setIsParsingFiles] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [mergedMarkdown, setMergedMarkdown] = useState<string>('');
  const [showKey, setShowKey] = useState<boolean>(false);
  
  // Layout & Styling Studio States
  const [highlightColor, setHighlightColor] = useState<'yellow' | 'green' | 'pink' | 'blue' | 'none'>('yellow');
  const [fontSizePreset, setFontSizePreset] = useState<'normal' | 'large' | 'compact'>('normal');
  const [fontFamilyPreset, setFontFamilyPreset] = useState<'serif' | 'sans' | 'mono'>('serif');
  const [separatorStyle, setSeparatorStyle] = useState<'solid' | 'dashed' | 'double' | 'none'>('solid');
  const [separatorColor, setSeparatorColor] = useState<'stone' | 'amber' | 'emerald' | 'blue'>('stone');
  const [enableCheckmarks, setEnableCheckmarks] = useState<boolean>(true);
  const [documentTitle, setDocumentTitle] = useState<string>('CONSOLIDATED STUDY REPORT');
  
  // BYOK Configuration from localStorage
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

  // Sync config to localStorage
  useEffect(() => {
    localStorage.setItem('docscraft_byok_config', JSON.stringify(config));
  }, [config]);

  // Set default model when provider changes
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

  // Add system log line
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  // Extract PDF Text
  const parsePdfFile = async (pdfFile: PDFFile): Promise<{ text: string; pages: number }> => {
    const pdfjsLib = await import('pdfjs-dist');
    const pdfjsVersion = (pdfjsLib as any).version || '4.10.38';
    
    try {
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
    } catch (e) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.mjs`;
    }

    const arrayBuffer = await pdfFile.file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let extractedText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      extractedText += content.items.map((item: any) => item.str).join(' ') + '\n\n';
    }

    return {
      text: extractedText,
      pages: pdf.numPages
    };
  };

  // Handle PDF upload
  const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    const newFiles: PDFFile[] = [];
    const limit = 10;
    const currentCount = files.length;
    const remainingSlots = limit - currentCount;

    if (remainingSlots <= 0) {
      alert("Maximum file upload limit of 10 reached.");
      return;
    }

    const filesToProcess = Array.from(selectedFiles).slice(0, remainingSlots);

    for (const f of filesToProcess) {
      if (!f.name.endsWith('.pdf')) {
        alert(`${f.name} is not a valid PDF file.`);
        continue;
      }
      
      const sizeStr = f.size > 1024 * 1024 
        ? `${(f.size / (1024 * 1024)).toFixed(2)} MB` 
        : `${(f.size / 1024).toFixed(1)} KB`;

      newFiles.push({
        id: Math.random().toString(36).substr(2, 9),
        name: f.name,
        size: sizeStr,
        file: f,
        pagesCount: null,
        text: null,
        status: 'pending'
      });
    }

    setFiles(prev => [...prev, ...newFiles]);
  };

  // Trigger parsing on pending files
  useEffect(() => {
    const parsePendingFiles = async () => {
      const pending = files.filter(f => f.status === 'pending');
      if (pending.length === 0) return;

      setIsParsingFiles(true);
      addLog(`Initiating raw parser engine for ${pending.length} documents...`);

      // First set all pending files to parsing status
      setFiles(prev => prev.map(f => pending.some(p => p.id === f.id) ? { ...f, status: 'parsing' } : f));

      await Promise.all(pending.map(async (pdfFile) => {
        addLog(`Accessing file array buffer: ${pdfFile.name}`);

        try {
          const result = await parsePdfFile(pdfFile);
          setFiles(prev => prev.map(f => f.id === pdfFile.id ? { 
            ...f, 
            status: 'completed', 
            text: result.text, 
            pagesCount: result.pages 
          } : f));
          addLog(`Extraction complete: ${pdfFile.name} (${result.pages} pages, ${result.text.length} characters)`);
        } catch (error) {
          console.error(error);
          setFiles(prev => prev.map(f => f.id === pdfFile.id ? { ...f, status: 'error' } : f));
          addLog(`Parser failure: ${pdfFile.name}. Verify document accessibility.`);
        }
      }));

      setIsParsingFiles(false);
    };

    parsePendingFiles();
  }, [files]);

  // Remove file
  const handleRemoveFile = (id: string) => {
    const targetFile = files.find(f => f.id === id);
    if (targetFile) {
      addLog(`Removed document from buffer: ${targetFile.name}`);
    }
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  // Execute synthesis
  const handleSynthesize = async () => {
    if (files.length < 2) {
      alert("A minimum of 2 PDF files must be uploaded to consolidate contexts.");
      return;
    }

    const uncompleted = files.filter(f => f.status !== 'completed');
    if (uncompleted.length > 0) {
      alert("Please wait for all documents to finish parsing before initiating synthesis.");
      return;
    }

    if (!config.apiKey.trim()) {
      alert("An API Key is required to utilize the Bring Your Own Key (BYOK) system.");
      return;
    }

    setIsProcessing(true);
    setLogs([]);
    addLog("Intelligent Context Synthesis Engine activated.");
    addLog(`Target Model Architecture: ${config.provider.toUpperCase()} (${config.modelName})`);
    
    try {
      // Assemble the comprehensive prompt
      let combinedDocumentsContext = "";
      files.forEach((pdf, index) => {
        combinedDocumentsContext += `\n\n--- BEGIN DOCUMENT ${index + 1}: ${pdf.name} ---\n`;
        combinedDocumentsContext += pdf.text;
        combinedDocumentsContext += `\n--- END DOCUMENT ${index + 1}: ${pdf.name} ---\n`;
      });

      addLog(`Consolidating facts... Processing ${files.length} context streams.`);
      
      const promptText = `Consolidate, merge, and synthesize the context of the following documents into one highly accurate, single, cohesive document.

IMPORTANT INSTRUCTIONS:
1. Do not leave out any critical facts, statistics, names, architectural details, technical parameters, or operational instructions.
2. Structure the merged context logically. Merge redundant points into cohesive paragraphs rather than listing them multiple times.
3. Organize the final output professionally using high-end Markdown typography. Use clean headers (h1, h2, h3), tables, bullet points, and clean blockquotes if necessary.
4. Do not insert any summary commentary or meta-text like "Here is the merged document". Output ONLY the fully synthesized document context.
5. STRICTLY FORBIDDEN: Do not output any emojis. Keep the writing tone completely formal, corporate, and precise.

DOCUMENTS CONTEXT TO MERGE:
${combinedDocumentsContext}

Consolidated Document:`;

      addLog(`Dispatching API payload to ${config.provider.toUpperCase()} gateway.`);

      let responseText = "";

      if (config.provider === 'gemini') {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.modelName}:generateContent?key=${config.apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: promptText }]
            }],
            generationConfig: {
              temperature: 0.1,
              topP: 0.95,
              maxOutputTokens: 8192,
            }
          })
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData?.error?.message || `HTTP error ${response.status}`);
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
              { role: "system", content: "You are an expert document engineering core. You merge multiple PDF contexts cleanly with zero omission of crucial technical or formal data." },
              { role: "user", content: promptText }
            ],
            temperature: 0.1
          })
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData?.error?.message || `HTTP error ${response.status}`);
        }

        const data = await response.json();
        responseText = data?.choices?.[0]?.message?.content || "";
      } else if (config.provider === 'anthropic') {
        // Direct Claude API via browser fetch (supports CORS for key-authenticated requests occasionally, or triggers proxy fallback)
        addLog("Note: Anthropic API requests from the browser might encounter local CORS policies depending on network headers. Sending payload...");
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
            max_tokens: 4090,
            messages: [
              { role: "user", content: promptText }
            ]
          })
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData?.error?.message || `HTTP error ${response.status}`);
        }

        const data = await response.json();
        responseText = data?.content?.[0]?.text || "";
      }

      if (!responseText) {
        throw new Error("Empty response received from the selected model provider gateway.");
      }

      setMergedMarkdown(responseText);
      addLog("Consolidation synthesis successfully finalized.");
      addLog(`Synthesized document scale: ${responseText.length} characters.`);
    } catch (err: any) {
      console.error(err);
      addLog(`Synthesis Engine interrupted: ${err.message || err}`);
      alert(`Synthesis Failed: ${err.message || err}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Export consolidated PDF using jsPDF
  const handleDownloadPDF = () => {
    if (!mergedMarkdown) return;
    
    addLog("Compiling consolidated PDF with custom styles...");
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Map Font Preset to actual pdf fonts
      let fontName = 'Times';
      if (fontFamilyPreset === 'sans') fontName = 'Helvetica';
      else if (fontFamilyPreset === 'mono') fontName = 'Courier';

      doc.setFont(fontName, 'normal');
      const pageHeight = doc.internal.pageSize.getHeight();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const maxLineWidth = pageWidth - (margin * 2);
      
      let cursorY = 25;

      // Map separator colors
      const colorMap = {
        stone: { r: 100, g: 116, b: 139 },
        amber: { r: 217, g: 119, b: 6 },
        emerald: { r: 5, g: 150, b: 105 },
        blue: { r: 37, g: 99, b: 235 }
      };
      const activeColor = colorMap[separatorColor] || colorMap.stone;

      // Draw custom highlighted title block if highlights are enabled
      if (highlightColor !== 'none') {
        const highlightColorMap = {
          yellow: { r: 254, g: 243, b: 199 },
          green: { r: 209, g: 250, b: 229 },
          pink: { r: 253, g: 224, b: 241 },
          blue: { r: 219, g: 234, b: 254 }
        };
        const hColor = highlightColorMap[highlightColor as keyof typeof highlightColorMap] || highlightColorMap.yellow;
        doc.setFillColor(hColor.r, hColor.g, hColor.b);
        // Draw soft highlight box for title
        doc.rect(margin - 2, cursorY - 6, maxLineWidth + 4, 15, 'F');
      }

      // Header Banner
      doc.setFontSize(fontSizePreset === 'large' ? 20 : fontSizePreset === 'compact' ? 15 : 18);
      doc.setFont(fontName, 'bold');
      // Set text color for header
      if (highlightColor !== 'none') {
        doc.setTextColor(30, 30, 30);
      } else {
        doc.setTextColor(activeColor.r, activeColor.g, activeColor.b);
      }
      doc.text(documentTitle.toUpperCase(), margin, cursorY + 2);
      cursorY += 12;

      doc.setFontSize(fontSizePreset === 'compact' ? 8 : 9);
      doc.setFont(fontName, 'normal');
      doc.setTextColor(115, 115, 115);
      doc.text(`DocCraft Synthesis Console • Consolidated Fact Output • ${new Date().toLocaleDateString()}`, margin, cursorY);
      cursorY += 6;

      // Draw Separator style
      if (separatorStyle !== 'none') {
        doc.setDrawColor(activeColor.r, activeColor.g, activeColor.b);
        doc.setLineWidth(separatorStyle === 'double' ? 0.35 : 0.5);
        if (separatorStyle === 'dashed') {
          doc.setLineDashPattern([2, 2], 0);
        } else {
          doc.setLineDashPattern([], 0);
        }

        if (separatorStyle === 'double') {
          doc.line(margin, cursorY, pageWidth - margin, cursorY);
          doc.line(margin, cursorY + 1.2, pageWidth - margin, cursorY + 1.2);
          cursorY += 8;
        } else {
          doc.line(margin, cursorY, pageWidth - margin, cursorY);
          cursorY += 7;
        }
      } else {
        cursorY += 4;
      }

      // Font size values
      const fontSizes = {
        compact: { title: 14, subtitle: 11, body: 9.5, spacing: 4.8 },
        normal: { title: 16, subtitle: 13, body: 11, spacing: 5.8 },
        large: { title: 19, subtitle: 15, body: 13, spacing: 7.2 }
      }[fontSizePreset];

      // Restore normal color for body
      doc.setTextColor(40, 40, 40);

      const markdownLines = mergedMarkdown.split('\n');

      for (let i = 0; i < markdownLines.length; i++) {
        let rawLine = markdownLines[i].trim();
        if (!rawLine && i !== 0 && markdownLines[i-1].trim()) {
          cursorY += fontSizes.spacing * 0.7; // empty line spacing
          continue;
        }

        let isHeading = false;
        let headingLevel = 0;
        let fontSize = fontSizes.body;
        let fontStyle = 'normal';
        let cleanText = rawLine;

        if (rawLine.startsWith('# ')) {
          isHeading = true;
          headingLevel = 1;
          fontSize = fontSizes.title;
          fontStyle = 'bold';
          cleanText = rawLine.substring(2);
          cursorY += fontSizes.spacing * 0.8;
        } else if (rawLine.startsWith('## ')) {
          isHeading = true;
          headingLevel = 2;
          fontSize = fontSizes.subtitle;
          fontStyle = 'bold';
          cleanText = rawLine.substring(3);
          cursorY += fontSizes.spacing * 0.6;
        } else if (rawLine.startsWith('### ')) {
          isHeading = true;
          headingLevel = 3;
          fontSize = fontSizes.body + 1;
          fontStyle = 'bold';
          cleanText = rawLine.substring(4);
          cursorY += fontSizes.spacing * 0.5;
        } else if (rawLine.startsWith('- ') || rawLine.startsWith('* ')) {
          cleanText = rawLine.substring(2);
          if (enableCheckmarks) {
            cleanText = `[✓]  ${cleanText}`;
          } else {
            cleanText = `•  ${cleanText}`;
          }
        }

        doc.setFontSize(fontSize);
        doc.setFont(fontName, fontStyle);

        // Highlight coloring for headings (if enabled)
        if (isHeading && highlightColor !== 'none' && headingLevel <= 2) {
          const highlightColorMap = {
            yellow: { r: 254, g: 252, b: 232 },
            green: { r: 240, g: 253, b: 244 },
            pink: { r: 253, g: 242, b: 248 },
            blue: { r: 239, g: 246, b: 255 }
          };
          const hColor = highlightColorMap[highlightColor as keyof typeof highlightColorMap] || highlightColorMap.yellow;
          doc.setFillColor(hColor.r, hColor.g, hColor.b);
          doc.rect(margin - 1, cursorY - fontSize/2.5 - 1.5, maxLineWidth + 2, fontSize/2.5 + 4, 'F');
          doc.setTextColor(activeColor.r, activeColor.g, activeColor.b);
        } else if (isHeading) {
          doc.setTextColor(30, 30, 30);
        } else {
          doc.setTextColor(60, 60, 60);
        }

        const wrappedLines = doc.splitTextToSize(cleanText, maxLineWidth);
        
        for (const line of wrappedLines) {
          if (cursorY > pageHeight - margin) {
            doc.addPage();
            cursorY = 20;
          }
          doc.text(line, margin, cursorY);
          cursorY += isHeading ? fontSizes.spacing * 1.15 : fontSizes.spacing;
        }
      }

      doc.save(`consolidated_synthesis_${Date.now()}.pdf`);
      addLog("Consolidated PDF file downloaded successfully with customized styles.");
    } catch (error: any) {
      console.error(error);
      addLog(`PDF compile error: ${error.message}`);
      alert("Unable to generate PDF. Copy output markdown instead.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E5E5E5] font-sans overflow-x-hidden selection:bg-[#E5E5E5] selection:text-[#0A0A0A]">
      
      {/* Top Header */}
      <header className="border-b border-[#222222] bg-[#0A0A0A] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')} 
              className="p-2 bg-[#161616] hover:bg-[#222222] border border-[#2A2A2A] rounded-xl text-neutral-400 hover:text-white transition-all active:scale-95"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-sm font-mono tracking-widest text-neutral-400 uppercase">Document Synthesis Core</h1>
              <p className="text-xs text-neutral-600 mt-0.5">Bring Your Own Key Platform</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <span className="text-[10px] font-mono text-neutral-500 block">System Connection Status</span>
              <span className="text-xs font-mono text-white">Consolidation Buffer Ready</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Intro */}
        <div className="mb-12 border-l border-white pl-6">
          <h2 className="text-4xl font-extrabold text-white tracking-tight uppercase font-mono">
            Intelligent PDF Fact Consolidation
          </h2>
          <p className="text-neutral-400 mt-2 max-w-3xl text-sm leading-relaxed">
            Consolidate high-density documents, overlapping clinical schemas, visual sheets, or technical papers into a single integrated output page. Select your private model client, enter your local API credentials, and merge multiple contexts into one cohesive file with zero facts omitted.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Side: BYOK, File Buffer & Logs */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* BYOK Area */}
            <div className="bg-[#111111] border border-[#222222] rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#222222]/10 blur-3xl rounded-full"></div>
              
              <div className="flex items-center gap-3 mb-6">
                <motion.div 
                  animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 0.9, 1] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400"
                >
                  <Sparkles className="w-5 h-5" />
                </motion.div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-sm font-mono uppercase tracking-widest">
                      Private API Setup
                    </h3>
                  </div>
                  <p className="text-xs text-neutral-500">Decentralized processing with client keys</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Model Provider */}
                <div>
                  <label className="text-xs text-neutral-400 font-mono block mb-2 uppercase">Core Engine Provider</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['gemini', 'openai', 'anthropic'] as const).map((prov) => (
                      <button
                        key={prov}
                        type="button"
                        onClick={() => handleProviderChange(prov)}
                        className={`py-2 px-3 text-xs font-mono rounded-xl border transition-all uppercase ${
                          config.provider === prov
                            ? 'bg-white text-black border-white font-extrabold'
                            : 'bg-[#161616] text-neutral-400 border-[#222222] hover:border-neutral-500'
                        }`}
                      >
                        {prov}
                      </button>
                    ))}
                  </div>
                </div>

                {/* API Key */}
                <div>
                  <label className="text-xs text-neutral-400 font-mono block mb-2 uppercase flex items-center justify-between">
                    <span>Private Access Credentials</span>
                    <span className="text-[10px] text-neutral-500">Stored on your client browser</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showKey ? "text" : "password"}
                      value={config.apiKey}
                      onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                      placeholder={`${config.provider.toUpperCase()} API Key`}
                      className="w-full bg-[#161616] border border-[#222222] hover:border-neutral-500 focus:border-white focus:outline-none rounded-xl py-2.5 pl-3.5 pr-12 text-sm font-mono text-white placeholder-neutral-700 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Fallback Model */}
                <div>
                  <label className="text-xs text-neutral-400 font-mono block mb-2 uppercase flex items-center justify-between">
                    <span>Engine Target Model</span>
                    <span className="text-[10px] text-neutral-500">Consolidated Fact Logic</span>
                  </label>
                  <input
                    type="text"
                    value={config.modelName}
                    onChange={(e) => setConfig(prev => ({ ...prev, modelName: e.target.value }))}
                    placeholder="e.g. gemini-2.5-flash, gpt-4o, claude-3-5-sonnet"
                    className="w-full bg-[#161616] border border-[#222222] hover:border-neutral-500 focus:border-white focus:outline-none rounded-xl py-2.5 px-3.5 text-sm font-mono text-white placeholder-neutral-700 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Upload Area */}
            <div className="bg-[#111111] border border-[#222222] rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white text-sm font-mono uppercase">Document Consolidation Slots</h3>
                <span className="text-[10px] font-mono text-neutral-500 uppercase">{files.length} / 10 limit</span>
              </div>

              {/* Drag Zone */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border border-dashed border-[#2F2F2F] hover:border-white rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer bg-[#141414]/50 hover:bg-[#161616]/80 transition-all"
              >
                <UploadCloud className="w-8 h-8 text-neutral-500 mb-3" />
                <span className="text-xs font-mono text-neutral-300 font-bold block uppercase">Upload PDF Document</span>
                <span className="text-[10px] text-neutral-600 mt-1">Accepts multiple PDF documents up to 10 max</span>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFilesChange}
                  multiple 
                  accept="application/pdf" 
                  className="hidden" 
                />
              </div>

              {/* Uploaded List */}
              <div className="mt-6 space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar">
                {files.length === 0 ? (
                  <div className="text-center py-6 text-xs text-neutral-600 font-mono uppercase">
                    Consolidation buffer is empty
                  </div>
                ) : (
                  files.map((file) => (
                    <div 
                      key={file.id} 
                      className="bg-[#161616] border border-[#222222] rounded-xl p-3.5 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-1.5 bg-[#222222] rounded-lg shrink-0">
                          <FileText className="w-4 h-4 text-white" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-white block truncate font-mono">{file.name}</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[9px] font-mono text-neutral-500">{file.size}</span>
                            {file.pagesCount !== null && (
                              <span className="text-[9px] font-mono text-neutral-400">• {file.pagesCount} Pages</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {file.status === 'parsing' && (
                          <Loader2 className="w-3.5 h-3.5 text-white animate-spin shrink-0" />
                        )}
                        {file.status === 'completed' && (
                          <Check className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        )}
                        {file.status === 'error' && (
                          <span className="text-[9px] font-mono text-red-500 bg-red-950/20 px-1.5 py-0.5 rounded uppercase font-bold border border-red-900/30">Failed</span>
                        )}
                        <button 
                          onClick={() => handleRemoveFile(file.id)}
                          className="p-1.5 hover:bg-[#222222] hover:text-white rounded-lg text-neutral-500 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* AI Layout & Styling Studio */}
            <div className="bg-[#111111] border border-[#222222] rounded-3xl p-6 relative overflow-hidden">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-[#1C1C1C] border border-[#2A2A2A] rounded-2xl text-white">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm font-mono uppercase">Layout & Styling Studio</h3>
                  <p className="text-xs text-neutral-500">Fine-tune PDF export formatting</p>
                </div>
              </div>

              <div className="space-y-4 text-xs font-mono">
                {/* Document Title */}
                <div>
                  <label className="text-neutral-400 block mb-2 uppercase text-[10px]">Document Heading Title</label>
                  <input
                    type="text"
                    value={documentTitle}
                    onChange={(e) => setDocumentTitle(e.target.value)}
                    placeholder="e.g. CONSOLIDATED STUDY REPORT"
                    className="w-full bg-[#161616] border border-[#222222] hover:border-neutral-500 focus:border-white focus:outline-none rounded-xl py-2 px-3 text-white transition-all"
                  />
                </div>

                {/* Font and Size preset */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-neutral-400 block mb-2 uppercase text-[10px]">Font Family</label>
                    <select
                      value={fontFamilyPreset}
                      onChange={(e) => setFontFamilyPreset(e.target.value as any)}
                      className="w-full bg-[#161616] border border-[#222222] focus:border-white focus:outline-none rounded-xl py-2 px-2.5 text-white cursor-pointer"
                    >
                      <option value="serif">Times (Classic Serif)</option>
                      <option value="sans">Helvetica (Swiss Sans)</option>
                      <option value="mono">Courier (Tech Mono)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-neutral-400 block mb-2 uppercase text-[10px]">Text Size Density</label>
                    <select
                      value={fontSizePreset}
                      onChange={(e) => setFontSizePreset(e.target.value as any)}
                      className="w-full bg-[#161616] border border-[#222222] focus:border-white focus:outline-none rounded-xl py-2 px-2.5 text-white cursor-pointer"
                    >
                      <option value="compact">9.5pt (Compact)</option>
                      <option value="normal">11.0pt (Normal)</option>
                      <option value="large">13.5pt (Large Text)</option>
                    </select>
                  </div>
                </div>

                {/* Divider Style and color */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-neutral-400 block mb-2 uppercase text-[10px]">Line Separator</label>
                    <select
                      value={separatorStyle}
                      onChange={(e) => setSeparatorStyle(e.target.value as any)}
                      className="w-full bg-[#161616] border border-[#222222] focus:border-white focus:outline-none rounded-xl py-2 px-2.5 text-white cursor-pointer"
                    >
                      <option value="solid">Solid Line</option>
                      <option value="dashed">Dashed Line</option>
                      <option value="double">Double Border</option>
                      <option value="none">No Divider</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-neutral-400 block mb-2 uppercase text-[10px]">Accent Color</label>
                    <select
                      value={separatorColor}
                      onChange={(e) => setSeparatorColor(e.target.value as any)}
                      className="w-full bg-[#161616] border border-[#222222] focus:border-white focus:outline-none rounded-xl py-2 px-2.5 text-white cursor-pointer"
                    >
                      <option value="stone">Slate Grey</option>
                      <option value="amber">Amber Gold</option>
                      <option value="emerald">Emerald Green</option>
                      <option value="blue">Electric Blue</option>
                    </select>
                  </div>
                </div>

                {/* Highlights and Checkmarks */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-neutral-400 block mb-2 uppercase text-[10px]">Highlight Color</label>
                    <select
                      value={highlightColor}
                      onChange={(e) => setHighlightColor(e.target.value as any)}
                      className="w-full bg-[#161616] border border-[#222222] focus:border-white focus:outline-none rounded-xl py-2 px-2.5 text-white cursor-pointer"
                    >
                      <option value="yellow">Amber Yellow</option>
                      <option value="green">Mint Green</option>
                      <option value="pink">Blush Pink</option>
                      <option value="blue">Sky Blue</option>
                      <option value="none">No Highlights</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-neutral-400 block mb-2 uppercase text-[10px]">Check Mark Bullets</label>
                    <div className="flex items-center h-8 mt-1">
                      <button
                        type="button"
                        onClick={() => setEnableCheckmarks(!enableCheckmarks)}
                        className={`w-full py-1.5 px-3 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all ${
                          enableCheckmarks 
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
                            : 'bg-[#161616] text-neutral-500 border-[#222222]'
                        }`}
                      >
                        {enableCheckmarks ? '✓ Active [✓]' : 'Standard Bullets'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Parsing Terminal Logs */}
            <div className="bg-[#111111] border border-[#222222] rounded-3xl p-6">
              <h3 className="font-bold text-white text-sm font-mono uppercase mb-4">Parser Operational Console</h3>
              <div className="bg-black border border-[#222222] p-4 rounded-xl font-mono text-[10px] text-neutral-400 h-[140px] overflow-y-auto custom-scrollbar space-y-1">
                {logs.length === 0 ? (
                  <span className="text-neutral-700">Console idle. Operational sequence not initialized...</span>
                ) : (
                  logs.map((log, idx) => (
                    <div key={idx} className="leading-relaxed whitespace-pre-wrap">{log}</div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Right Side: ConsolidatedFact Workspace Panel */}
          <div className="lg:col-span-7">
            <div className="bg-[#111111] border border-[#222222] rounded-3xl overflow-hidden flex flex-col min-h-[620px]">
              
              {/* Toolbar */}
              <div className="border-b border-[#222222] bg-[#141414] px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                  <span className="text-xs font-mono text-white uppercase tracking-wider font-extrabold">Synthesized Fact Stream</span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {mergedMarkdown && (
                    <button
                      onClick={handleDownloadPDF}
                      className="flex-1 sm:flex-initial py-2 px-4 bg-[#161616] border border-[#333333] hover:border-white text-white rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 uppercase active:scale-95"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Export Consolidated PDF
                    </button>
                  )}

                  <button
                    onClick={handleSynthesize}
                    disabled={isProcessing || isParsingFiles || files.length < 2}
                    className="flex-1 sm:flex-initial py-2 px-5 bg-white text-black hover:bg-neutral-200 disabled:bg-[#222222] disabled:text-neutral-500 rounded-xl text-xs font-black font-mono transition-all flex items-center justify-center gap-2 uppercase active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Merging Fact streams...
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-black" />
                        Merge Context with AI
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Workspace Sheet View */}
              <div className="p-6 md:p-8 flex-1 flex flex-col bg-[#0F0F0F] relative">
                {isProcessing ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-10">
                    <Loader2 className="w-12 h-12 text-white animate-spin mb-4" />
                    <span className="text-xs font-mono text-white uppercase tracking-wider font-bold">Synthesizing Fact Overlaps</span>
                    <span className="text-[10px] text-neutral-500 mt-1 max-w-xs text-center font-mono">Consolidating paragraphs, schemas, and statistics cleanly into one file structure...</span>
                  </div>
                ) : null}

                {mergedMarkdown ? (
                  <div className="prose prose-invert prose-sm max-w-none text-[#D4D4D4] h-[520px] overflow-y-auto custom-scrollbar pr-2 font-serif selection:bg-white selection:text-black">
                    <ReactMarkdown>{mergedMarkdown}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-[#161616] border border-[#2A2A2A] flex items-center justify-center text-neutral-500 mb-4">
                      <FileText className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-bold text-white uppercase tracking-wider font-mono">Consolidation Workspace Empty</span>
                    <p className="text-xs text-neutral-600 mt-2 max-w-sm mx-auto leading-relaxed">
                      Upload at least 2 PDF document files into the left slots, configure your private API credentials, and trigger consolidation synthesis to view the unified fact stream.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Feature breakdown section - monochrome, long page feel */}
        <section className="mt-28 pt-16 border-t border-[#1C1C1C] space-y-12">
          <div>
            <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest block mb-1">Architecture Overview</span>
            <h3 className="text-2xl font-bold uppercase tracking-tight text-white font-mono">No Fact-Loss Merging System</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-[#111111]/40 border border-[#1C1C1C] rounded-2xl">
              <span className="text-xs font-mono text-neutral-400 font-bold block mb-2 uppercase">Raw Text Tokenizer</span>
              <p className="text-xs text-neutral-500 leading-relaxed font-sans">
                Each document uploaded undergoes deep raw character parsing inside your local web worker space. Text components are safely structured and tokenized directly inside the client sandbox before being bundled as context targets.
              </p>
            </div>

            <div className="p-8 bg-[#111111]/40 border border-[#1C1C1C] rounded-2xl">
              <span className="text-xs font-mono text-neutral-400 font-bold block mb-2 uppercase">Deduplication Overlaps</span>
              <p className="text-xs text-neutral-500 leading-relaxed font-sans">
                The target neural model filters redundantly occurring parameters, structural descriptions, and metadata schemas. Context streams are synthesised into clear chronological paragraphs, reducing page count without sacrificing granular facts.
              </p>
            </div>

            <div className="p-8 bg-[#111111]/40 border border-[#1C1C1C] rounded-2xl">
              <span className="text-xs font-mono text-neutral-400 font-bold block mb-2 uppercase">Decentralized BYOK</span>
              <p className="text-xs text-neutral-500 leading-relaxed font-sans">
                DocCraft does not record, process, or proxy your private API keys or document texts. Your credentials route directly from the local browser to your selected model provider gateway. Privacy is maintained by architecture.
              </p>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
