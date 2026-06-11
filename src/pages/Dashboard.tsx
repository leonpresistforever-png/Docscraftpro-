import { rotatePDF, addWatermark, addPageNumbers } from '../utils/PDFEngine';
import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Button } from '../components/ui/Button';
import { 
  FileText, Wand2, Music, Video, Image as ImageIcon, Search, LayoutTemplate, MoreHorizontal, 
  FilePlus, RefreshCw, Upload, Globe, X, RotateCw, ListOrdered, Droplets, Crop, Edit3, 
  LayoutList, Unlock, Lock, PenTool, Ban, SplitSquareHorizontal, FileImage, FileType2, 
  Presentation, FileSpreadsheet, Code, ShieldCheck, ArrowRight, Star, Share2,
  Clock, Loader2, ArrowUpRight, CheckCircle2, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { usePremium } from '../context/PremiumContext';
import { formatDistanceToNow } from 'date-fns';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { encryptData, decryptData } from '../lib/encryption';

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPremium } = usePremium();
  const [documents, setDocuments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'starred' | 'shared'>('all');

  // Workbench Modal state
  const [workbenchOpen, setWorkbenchOpen] = useState(false);
  const [workbenchTool, setWorkbenchTool] = useState<'Upload to Doc' | 'Rotate PDF' | 'Add Watermark' | 'Add Page Numbers' | 'Sign PDF'>('Upload to Doc');
  const [workbenchFile, setWorkbenchFile] = useState<File | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [isDirectUploadMode, setIsDirectUploadMode] = useState(false);

  // Workbench configurations
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [rotationAngle, setRotationAngle] = useState(90);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    
    const q = query(
      collection(db, 'documents'),
      where('ownerId', '==', user.uid)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let docsData = snapshot.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          content: data.content ? decryptData(data.content) : '',
          date: data.updatedAt ? (typeof data.updatedAt.toDate === 'function' ? data.updatedAt.toDate() : new Date(data.updatedAt)) : new Date()
        };
      });
      
      // Sort client-side by date descending
      docsData.sort((a, b) => b.date.getTime() - a.date.getTime());
      
      setDocuments(docsData);
    }, (error) => {
      console.error("Dashboard failed to listen to documents:", error);
    });

    return () => unsubscribe();
  }, [user]);

  const toggleStar = async (e: any, docId: string, currentStatus: boolean) => {
    e.stopPropagation();
    try {
       await updateDoc(doc(db, 'documents', docId), { isStarred: !currentStatus });
    } catch (err) {
       console.error("Failed to toggle star", err);
    }
  };

  const shareDoc = async (e: any, d: any) => {
    e.stopPropagation();
    const newSharedState = !d.isShared;
    try {
      await updateDoc(doc(db, 'documents', d.id), { isShared: newSharedState });
      const shareUrl = window.location.origin + '/doc/' + d.id;
      if (navigator.share) {
         await navigator.share({
            title: d.title,
            text: 'Check out this document',
            url: shareUrl
         });
      } else {
         try {
           await navigator.clipboard.writeText(shareUrl);
           alert(newSharedState ? "Document is now shared! Public link copied to clipboard." : "Document is now private.");
         } catch (clipErr) {
           alert(`Public link: ${shareUrl}\n(Please copy this URL)`);
         }
      }
    } catch (err) {
      console.error("Failed to share", err);
    }
  };

  const quickActions = [
    { icon: <FilePlus className="w-5 h-5" />, label: 'New Document', href: '/doc/new' },
    { icon: <Globe className="w-5 h-5" />, label: 'Translate PDF', href: '/media' },
    { icon: <Upload className="w-5 h-5" />, label: 'Upload & Extract', action: () => {
        setIsDirectUploadMode(true);
        handleSelectFileInputClick();
    } },
  ];

  const workbenchToolsList = [
    { name: 'Upload to Doc', desc: 'OCR scanning converts layout PDF directly to fully editable interactive docs.', icon: <FileText className="w-6 h-6 text-indigo-500" /> },
    { name: 'Sign PDF', desc: 'Securely draw, design, and overlay legal-grade initials or signature streams.', icon: <PenTool className="w-6 h-6 text-amber-500" /> },
    { name: 'Rotate PDF', desc: 'Correct tilted page configurations with quick rotation parameters.', icon: <RotateCw className="w-6 h-6 text-pink-500" /> },
    { name: 'Add Watermark', desc: 'Incorporate continuous secure diagonal watermark lettering blocks.', icon: <Droplets className="w-6 h-6 text-blue-500" /> },
    { name: 'Add Page Numbers', desc: 'Sequence and inject precise formatting headers automatically.', icon: <ListOrdered className="w-6 h-6 text-green-500" /> },
    { name: 'Image Typography', desc: 'Write custom highly customizable text layers directly embedded onto PNG/JPG image pixels perfectly.', icon: <FileType2 className="w-6 h-6 text-orange-500" /> }
  ];

  const handleToolClick = (toolName: string) => {
    if (toolName === 'Sign PDF') {
      navigate('/tools/sign-pdf');
      return;
    }
    if (toolName === 'Image Typography') {
      navigate('/tools/write-text-on-image');
      return;
    }
    setWorkbenchTool(toolName as any);
    setWorkbenchFile(null); // Reset file selection
    setWorkbenchOpen(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        setWorkbenchFile(file);
      } else {
        alert("Please drop a valid PDF file.");
      }
    }
  };

  const handleSelectFileInputClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const autoProcessAndExtractFile = async (file: File) => {
    setIsProcessingFile(true);
    try {
      let extractedText = '';
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
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((item: any) => item.str).join(' ') + '\n\n';
        }
        extractedText = text;
      } else if (file.name.endsWith('.docx')) {
        const mammoth = await import('mammoth');
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        extractedText = result.value;
      } else {
        extractedText = await file.text();
      }

      const newDocRef = doc(collection(db, 'documents'));
      
      const title = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      const htmlContent = `<h1>${title}</h1>` + extractedText.split('\n\n').map(p => p.trim() ? `<p>${p.trim()}</p>` : '').join('');

      await setDoc(newDocRef, {
        title: title,
        content: encryptData(htmlContent || `<h1>${title}</h1><p>Start writing...</p>`),
        ownerId: user?.uid,
        isPinned: false,
        isArchived: false,
        isStarred: false,
        isShared: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      navigate(`/doc/${newDocRef.id}`);
    } catch (err: any) {
      console.error("Auto extraction failed:", err);
      alert("Failed to extract content: " + err.message);
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (isDirectUploadMode) {
        setIsDirectUploadMode(false);
        await autoProcessAndExtractFile(file);
      } else {
        setWorkbenchFile(file);
      }
    }
  };

  const handleExecuteTool = async () => {
    if (!workbenchFile) return;
    setIsProcessingFile(true);
    try {
      if (workbenchTool === 'Upload to Doc') {
        const pdfjsLib = await import('pdfjs-dist');
        const pdfjsVersion = (pdfjsLib as any).version || '4.10.38';
        try {
          pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
        } catch (e) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.mjs`;
        }
        const arrayBuffer = await workbenchFile.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((item: any) => item.str).join(' ') + '\n\n';
        }
        const newDocRef = doc(collection(db, 'documents'));
        await setDoc(newDocRef, {
           title: workbenchFile.name.replace('.pdf', ''),
           content: encryptData(text),
           ownerId: user?.uid,
           isPinned: false,
           isArchived: false,
           isStarred: false,
           isShared: false,
           createdAt: serverTimestamp(),
           updatedAt: serverTimestamp()
        });
        setWorkbenchOpen(false);
        navigate(`/doc/${newDocRef.id}`);
        return;
      }

      let resultBlob: Blob | null = null;
      let filename = workbenchFile.name;
      
      if (workbenchTool === 'Rotate PDF') {
         resultBlob = await rotatePDF(workbenchFile, rotationAngle);
         filename = `rotated_${workbenchFile.name}`;
      } else if (workbenchTool === 'Add Watermark') {
         resultBlob = await addWatermark(workbenchFile, watermarkText);
         filename = `watermarked_${workbenchFile.name}`;
      } else if (workbenchTool === 'Add Page Numbers') {
         resultBlob = await addPageNumbers(workbenchFile);
         filename = `numbered_${workbenchFile.name}`;
      }
      
      if (resultBlob) {
         const link = document.createElement('a');
         link.href = URL.createObjectURL(resultBlob);
         link.download = filename;
         link.click();
         setTimeout(() => URL.revokeObjectURL(link.href), 1000);
         setWorkbenchOpen(false);
      }
    } catch (err: any) {
      console.error(err);
      alert("Failed to process the PDF document: " + err.message);
    } finally {
      setIsProcessingFile(false);
    }
  };

  const filteredDocuments = documents.filter(doc => {
      if (activeTab === 'starred') return doc.isStarred;
      if (activeTab === 'shared') return doc.isShared;
      return true;
  });

  return (
    <div className="flex h-screen bg-dc-bg-page font-sans text-dc-text relative overflow-x-hidden">
      <input type="file" ref={fileInputRef} hidden onChange={handleFileSelected} accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown,application/zip" />
      <Sidebar />
      <main className="flex-1 overflow-y-auto relative bg-[#FAF9F6]">
        
        {/* Dynamic decorative backdrop glows */}
        <div className="absolute top-[5%] right-[5%] w-[450px] h-[450px] rounded-full bg-[#D4AF37]/5 blur-[120px] pointer-events-none z-0 animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[20%] left-[10%] w-[500px] h-[500px] rounded-full bg-indigo-500/4 blur-[140px] pointer-events-none z-0 animate-pulse" style={{ animationDuration: '12s' }} />

        <div className="w-full max-w-[1400px] mx-auto p-12 relative z-10">
          
          {/* TopBar Area */}
          <header className="flex justify-between items-center mb-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl font-serif font-bold tracking-tight mb-2">Welcome back, {user?.displayName ? user.displayName.split(' ')[0] : 'Crafter'}</h1>
              <p className="text-lg text-dc-text-muted">Ready to craft pro-grade documents today?</p>
            </motion.div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search your documents..." 
                  className="w-80 min-w-[320px] bg-white border border-dc-border rounded-full py-3 pl-12 pr-6 outline-none focus:border-dc-gold transition-colors shadow-sm"
                />
              </div>
              <Button variant="gold" size="lg" onClick={() => navigate('/doc/new')} className="rounded-full shadow-md font-bold px-8">
                + Create
              </Button>
            </div>
          </header>

          <section className="mb-16">
            <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
              {quickActions.map((action, i) => (
                <motion.button 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  whileHover={{ scale: 1.04, y: -4 }}
                  key={i}
                  onClick={() => action.href ? navigate(action.href) : (action.action && action.action())}
                  className="flex items-center gap-3 bg-white border border-dc-border rounded-xl px-6 py-4 min-w-[200px] hover:shadow-md transition-all flex-shrink-0 group cursor-pointer"
                >
                  <div className="text-gray-500 group-hover:text-dc-gold transition-colors">
                    {action.icon}
                  </div>
                  <span className="font-semibold text-sm whitespace-nowrap">{action.label}</span>
                </motion.button>
              ))}
            </div>
          </section>

          {/* Secure PDF Workbench Section */}
          <section className="mb-16 bg-white border border-dc-border rounded-2xl p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-serif font-bold tracking-tight">Secure PDF Workbench</h2>
                <p className="text-sm text-dc-text-muted mt-1">Convert, sign, watermark, and modify layout documents safely.</p>
              </div>
              <span className="text-xs uppercase tracking-widest font-extrabold bg-[#FDFCF8] border border-dc-gold/40 text-dc-gold px-3 py-1 rounded-full">
                Professional Tools
              </span>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {workbenchToolsList.map((tool, idx) => (
                <div 
                  key={idx}
                  onClick={() => handleToolClick(tool.name)}
                  className="bg-[#FDFCF8]/40 border border-dc-border p-6 rounded-xl hover:bg-white hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="mb-4 p-3 bg-white border border-dc-border inline-block rounded-xl group-hover:border-dc-gold transition-colors">
                      {tool.icon}
                    </div>
                    <h3 className="font-bold text-base text-gray-900 group-hover:text-dc-gold transition-colors flex items-center gap-1.5">
                      {tool.name} <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <p className="text-xs text-dc-text-muted leading-relaxed mt-2">{tool.desc}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-[11px] font-mono text-gray-400 group-hover:text-dc-gold transition-colors pt-4 border-t border-dc-border/30">
                    <span>SECURE PROCESSOR</span>
                    <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex justify-between items-center mb-8 border-b border-dc-border pb-4">
              <h2 className="text-2xl font-bold font-serif">Recent Documents</h2>
              <div className="flex gap-4 text-sm font-medium">
                <button onClick={() => setActiveTab('all')} className={`pb-1 border-b-2 ${activeTab === 'all' ? 'text-dc-gold border-dc-gold' : 'text-dc-text-muted border-transparent hover:text-dc-text'}`}>All Documents</button>
                <button onClick={() => setActiveTab('starred')} className={`pb-1 border-b-2 ${activeTab === 'starred' ? 'text-dc-gold border-dc-gold' : 'text-dc-text-muted border-transparent hover:text-dc-text'}`}>Starred</button>
                <button onClick={() => setActiveTab('shared')} className={`pb-1 border-b-2 ${activeTab === 'shared' ? 'text-dc-gold border-dc-gold' : 'text-dc-text-muted border-transparent hover:text-dc-text'}`}>Shared</button>
              </div>
            </div>

            <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
              {filteredDocuments.length === 0 && (
                <p className="text-dc-text-muted">No documents found.</p>
              )}
              {filteredDocuments.map((doc, i) => (
                <div onClick={() => navigate(`/doc/${doc.id}`)} key={doc.id || `fallback-${i}`} className="bg-white border border-dc-border rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col min-h-[220px]">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-xl bg-blue-50 text-blue-500">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-1.5 opacity-100">
                      <button 
                        onClick={(e) => shareDoc(e, doc)} 
                        className={`p-1.5 rounded-lg border transition-all duration-200 cursor-pointer ${doc.isShared ? 'bg-blue-50 border-blue-200 text-blue-500 hover:bg-blue-100' : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100'}`}
                        title={doc.isShared ? 'Shared (Public)' : 'Private'}
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={(e) => toggleStar(e, doc.id, doc.isStarred)} 
                        className={`p-1.5 rounded-lg border transition-all duration-200 cursor-pointer ${doc.isStarred ? 'bg-yellow-50 border-yellow-200 text-yellow-500 hover:bg-yellow-100' : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100'}`}
                        title={doc.isStarred ? 'Starred' : 'Unstarred'}
                      >
                        <Star className={`w-3.5 h-3.5 ${doc.isStarred ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-2 pr-4">{doc.title}</h3>
                  <div className="flex gap-2 mb-auto">
                    <span className="text-[11px] uppercase tracking-wider font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                      DOC
                    </span>
                    {doc.isStarred && <span className="text-[11px] uppercase tracking-wider font-bold bg-yellow-50 text-yellow-600 px-2 py-0.5 rounded">Starred</span>}
                  </div>
                  <div className="mt-6 pt-4 border-t border-dc-border flex items-center justify-between text-sm text-gray-400">
                    <span>Edited {formatDistanceToNow(doc.date)} ago</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* State-of-the-art PDF Workbench Pop-up Dialog with Continuous Glowing Neon/Golden Rim Lighting */}
      {workbenchOpen && (
        <div className="fixed inset-0 z-[120000] flex flex-col items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200 px-4">
          
          {/* Inner Content Structure Wrapper with Premium Snake continuous golden rim glow */}
          <div className="relative p-[2px] overflow-hidden rounded-3xl bg-slate-950 shadow-[0_0_50px_rgba(234,179,8,0.25)] w-full max-w-[550px] animate-in zoom-in-95 duration-200">
            
            {/* Snake Rotating Rim Light Continuous Neon Tracker */}
            <div 
              className="absolute top-1/2 left-1/2 w-[300%] h-[300%] bg-[conic-gradient(from_0deg,transparent_30%,#eab308_40%,#ffd700_50%,#ebd342_60%,transparent_70%)]"
              style={{
                animation: 'snake-rotate 3.5s linear infinite',
                transform: 'translate(-50%, -50%)',
                mixBlendMode: 'screen'
              }}
            />

            {/* Main Modal Glass Content Body */}
            <div className="relative z-10 bg-slate-900/95 backdrop-blur-lg rounded-[22px] flex flex-col text-white p-8">
              
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-yellow-500/10 text-yellow-400 rounded-xl border border-yellow-500/20">
                    <FileText className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold tracking-wide text-slate-100 uppercase font-sans">{workbenchTool}</h3>
                    <p className="text-[10px] text-yellow-400/80 font-bold uppercase tracking-wider mt-0.5">Secure Document Optimizer</p>
                  </div>
                </div>
                <button 
                  onClick={() => setWorkbenchOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-all focus:outline-none cursor-pointer"
                >
                  <X className="w-5 h-5"/>
                </button>
              </div>

              {/* Drag and Drop sandbox zone */}
              {!workbenchFile ? (
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={handleSelectFileInputClick}
                  className={`border-2 border-dashed rounded-2xl p-10 text-center flex flex-col items-center justify-center gap-4 transition-all duration-300 cursor-pointer ${
                    dragOver ? 'border-yellow-400 bg-yellow-500/10 scale-95 shadow-inner' : 'border-slate-700 hover:border-yellow-500/40 bg-slate-950/40 hover:bg-slate-950/70'
                  }`}
                >
                  <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 group-hover:border-yellow-500/30">
                    <Upload className="w-8 h-8 text-yellow-500 animate-bounce" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-200">Drag & Drop PDF document here</p>
                    <p className="text-[11px] text-slate-400 mt-1">or click to browse your storage files</p>
                  </div>
                  <span className="text-[9px] uppercase font-bold tracking-widest bg-slate-900 border border-slate-800 text-slate-400 px-3 py-1 rounded-full">
                    ONLY .PDF FORMAT
                  </span>
                </div>
              ) : (
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4 relative animate-in fade-in-50">
                  <button 
                    onClick={() => setWorkbenchFile(null)}
                    className="absolute top-4 right-4 p-1 text-slate-400 hover:text-red-400 transition-colors"
                    title="Remove File"
                  >
                    <X className="w-4 h-4"/>
                  </button>
                  
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-950/40 border border-red-500/20 text-red-400 rounded-2xl shrink-0">
                      <FileText className="w-8 h-8" />
                    </div>
                    <div className="overflow-hidden pr-6">
                      <h4 className="font-extrabold text-sm text-slate-100 truncate">{workbenchFile.name}</h4>
                      <p className="text-[11px] font-mono text-slate-400 mt-1 uppercase">
                        {(workbenchFile.size / (1024 * 1024)).toFixed(2)} MB • Secure Document Memory
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 text-[10px] bg-slate-900 border border-slate-800 text-emerald-400 px-3 py-1.5 rounded-xl font-mono uppercase font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    File Loaded & Encrypted
                  </div>
                </div>
              )}

              {/* Dynamic tool choices rendering inside popup workbench */}
              {workbenchFile && (
                <div className="mt-6 space-y-4 border-t border-slate-800/80 pt-6 animate-in slide-in-from-bottom-2 duration-200">
                  
                  {workbenchTool === 'Add Watermark' && (
                    <div className="space-y-2">
                      <label className="text-xs uppercase font-extrabold tracking-wider text-slate-300">Watermark Text Overlay</label>
                      
                      {/* continuous golden rim styling input */}
                      <div className="relative p-[1.5px] overflow-hidden rounded-xl bg-slate-950">
                        <div 
                          className="absolute top-1/2 left-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_45%,#eab308_50%,transparent_55%)]"
                          style={{
                            animation: 'snake-rotate 4s linear infinite',
                            transform: 'translate(-50%, -50%)',
                          }}
                        />
                        <input 
                          type="text" 
                          value={watermarkText} 
                          onChange={(e) => setWatermarkText(e.target.value)}
                          placeholder="CONFIDENTIAL"
                          className="relative z-10 w-full bg-slate-900 border-none outline-none font-bold text-sm text-white px-4 py-3 rounded-[10px] focus:ring-0"
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 leading-normal font-sans">
                        Inserts high-visibility semi-transparent gray watermarking across all layout pages tilted at 45°.
                      </p>
                    </div>
                  )}

                  {workbenchTool === 'Rotate PDF' && (
                    <div className="space-y-2">
                      <label className="text-xs uppercase font-extrabold tracking-wider text-slate-300">Rotation Parameter</label>
                      <div className="flex gap-2.5">
                        {[90, 180, 270].map((angle) => (
                          <button
                            key={angle}
                            type="button"
                            onClick={() => setRotationAngle(angle)}
                            className={`flex-1 py-3 text-xs font-mono font-bold uppercase rounded-xl border transition-all ${
                              rotationAngle === angle 
                                ? 'bg-yellow-500/15 border-yellow-500 text-yellow-400' 
                                : 'bg-slate-950/50 border-slate-850 text-slate-400 hover:border-slate-700 hover:text-white'
                            }`}
                          >
                            Rotate {angle}°
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-500 leading-normal font-sans">
                        Sets the target global rotation alignment degrees clockwise for all page streams.
                      </p>
                    </div>
                  )}

                  {workbenchTool === 'Add Page Numbers' && (
                    <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl space-y-1">
                      <p className="text-xs font-bold text-yellow-500 uppercase tracking-widest">Formatter Node Active</p>
                      <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                        Engine will inject styled footers "Page X of Y" dynamically, matching absolute margins automagically.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Action trigger button */}
              {workbenchFile && (
                <div className="mt-8 border-t border-slate-800/80 pt-6">
                  {isProcessingFile ? (
                    <button 
                      disabled
                      className="w-full bg-[#ebd342]/10 border border-[#ebd342]/30 text-[#ebd342] font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl flex items-center justify-center gap-3"
                    >
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Decrypting & Reassembling Blob...
                    </button>
                  ) : (
                    /* Continuous flowing snake border matching native print */
                    <div className="relative p-[2px] overflow-hidden rounded-xl bg-slate-950 shadow-[0_0_15px_rgba(234,179,8,0.3)] hover:shadow-[0_0_22px_rgba(234,179,8,0.5)] transition-all duration-300">
                      <div 
                        className="absolute top-1/2 left-1/2 w-[250%] h-[250%] bg-[conic-gradient(from_0deg,transparent_35%,#eab308_45%,#ffffff_55%,#facc15_65%,transparent_75%)]"
                        style={{
                          animation: 'snake-rotate 2.5s linear infinite',
                          transform: 'translate(-50%, -50%)',
                        }}
                      />
                      <button 
                        onClick={handleExecuteTool}
                        className="relative z-10 w-full px-5 py-3.5 bg-slate-950 font-extrabold text-white rounded-[10px] hover:bg-slate-900 cursor-pointer opacity-95 transition-all text-xs tracking-widest uppercase flex items-center justify-center gap-2"
                      >
                        <Wand2 className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        Execute Core File Process
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Sleek Glassmorphic Processing Overlay */}
      {isDirectUploadMode === false && isProcessingFile && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[9999] flex flex-col items-center justify-center animate-fade-in">
          <div className="relative flex items-center justify-center w-28 h-28 mb-6">
            <div className="absolute inset-0 border-4 border-t-yellow-400 border-r-indigo-500 border-b-cyan-500 border-l-purple-500 rounded-full animate-spin" style={{ animationDuration: '1s' }}></div>
            <FileText className="w-12 h-12 text-yellow-400 animate-pulse" />
          </div>
          <h3 className="text-2xl font-bold text-white font-serif tracking-tight mb-2">
            Extracting Document Contents...
          </h3>
          <p className="text-slate-400 text-sm max-w-sm text-center font-medium leading-relaxed">
            Please wait while the processor core parses layout structure and creates your fully editable document.
          </p>
        </div>
      )}

    </div>
  )
}
