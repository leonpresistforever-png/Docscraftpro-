import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ArrowLeft, Upload, Loader2, PenTool, Type, FileImage, Download, X, Save } from 'lucide-react';
import { Sidebar } from '../components/layout/Sidebar';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';
import SignatureCanvas from 'react-signature-canvas';
import Draggable from 'react-draggable';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;

export function SignPDFPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const sigCanvasRef = useRef<any>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [pdfDocProxy, setPdfDocProxy] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageScale, setPageScale] = useState(1.2);

  const [activeTab, setActiveTab] = useState<'draw' | 'type' | 'upload'>('draw');
  const [typedName, setTypedName] = useState('John Doe');
  const [typedInitials, setTypedInitials] = useState('JD');
  const [selectedFont, setSelectedFont] = useState('font-signature-1');
  const [sigColor, setSigColor] = useState('#3b82f6');
  
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [sigPosition, setSigPosition] = useState({ x: 50, y: 50 });
  const [sigSize, setSigSize] = useState({ width: 200, height: 80 });

  const [isProcessing, setIsProcessing] = useState(false);
  const [pdfDimensions, setPdfDimensions] = useState({ width: 0, height: 0 });

  const [hasDrawn, setHasDrawn] = useState(false);

  // Handle PDF Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPdfFile(file);
      setIsProcessing(true);
      
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      setPdfBytes(bytes);

      try {
        const loadingTask = pdfjsLib.getDocument({ data: bytes });
        const pdf = await loadingTask.promise;
        setTotalPages(pdf.numPages);
        setCurrentPage(1);
        setPdfDocProxy(pdf); // Setting this triggers the useEffect
      } catch (err) {
        console.error("Error loading PDF:", err);
        alert("Failed to load PDF. It might be corrupted or encrypted.");
        setPdfFile(null);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const renderPage = async (pdf: pdfjsLib.PDFDocumentProxy, pageNum: number) => {
    try {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: pageScale });
      
      const canvas = pdfCanvasRef.current;
      if (!canvas) return;
      const context = canvas.getContext('2d');
      if (!context) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      setPdfDimensions({ width: viewport.width, height: viewport.height });

      await page.render({ canvasContext: context, viewport } as any).promise;
    } catch (err) {
      console.error("Error rendering page:", err);
    }
  };

  useEffect(() => {
    if (pdfDocProxy) {
      setTimeout(() => {
        renderPage(pdfDocProxy, currentPage);
      }, 0);
    }
  }, [pdfDocProxy, currentPage, pageScale]);

  // Handle Signature Creation
  const handleClearSignature = () => {
    sigCanvasRef.current?.clear();
    setSignatureDataUrl(null);
    setHasDrawn(false);
  };

  const handleApplyDraw = () => {
    if (sigCanvasRef.current?.isEmpty()) {
      alert("Please draw a signature first.");
      return;
    }
    const dataUrl = sigCanvasRef.current?.getCanvas().toDataURL('image/png');
    if (dataUrl) {
      setSignatureDataUrl(dataUrl);
      // Reset position so it appears centered
      setSigPosition({ x: 50, y: 50 });
    }
  };

  const handleApplyType = () => {
    if (!typedName) return;
    
    // Create an offscreen canvas to render text
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 150;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Different fonts
      let fontStr = '48px cursive';
      if (selectedFont === 'font-signature-1') fontStr = 'italic 48px "Brush Script MT", cursive';
      if (selectedFont === 'font-signature-2') fontStr = 'oblique 48px "Courier New", monospace';
      if (selectedFont === 'font-signature-3') fontStr = 'italic 52px "Times New Roman", serif';
      if (selectedFont === 'font-signature-4') fontStr = '50px fantasy';

      ctx.font = fontStr;
      ctx.fillStyle = sigColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(typedName, canvas.width / 2, canvas.height / 2);
      
      setSignatureDataUrl(canvas.toDataURL('image/png'));
      setSigPosition({ x: 50, y: 50 });
    }
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setSignatureDataUrl(event.target?.result as string);
        setSigPosition({ x: 50, y: 50 });
      };
      reader.readAsDataURL(file);
    }
  };

  const getModifiedPdfBytes = async (): Promise<Uint8Array | null> => {
    if (!pdfBytes || !signatureDataUrl) return null;
    setIsProcessing(true);

    try {
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages = pdfDoc.getPages();
      const pageToEdit = pages[currentPage - 1]; // 0-indexed

      let processedDataUrl = signatureDataUrl;

      // Convert SVG or unknown types to PNG via canvas to avoid pdf-lib crash
      if (!signatureDataUrl.includes('image/png') && !signatureDataUrl.includes('image/jpeg')) {
         const img = new Image();
         img.src = signatureDataUrl;
         await new Promise((resolve) => { img.onload = resolve; });
         const canvas = document.createElement('canvas');
         canvas.width = img.naturalWidth || sigSize.width;
         canvas.height = img.naturalHeight || sigSize.height;
         const ctx = canvas.getContext('2d');
         ctx?.drawImage(img, 0, 0);
         processedDataUrl = canvas.toDataURL('image/png');
      }

      // Convert data URL to buffer
      const res = await fetch(processedDataUrl);
      const imageBytes = await res.arrayBuffer();

      let image;
      if (processedDataUrl.includes('image/png')) {
        image = await pdfDoc.embedPng(imageBytes);
      } else if (processedDataUrl.includes('image/jpeg')) {
        image = await pdfDoc.embedJpg(imageBytes);
      } else {
        alert("Unsupported signature image format");
        setIsProcessing(false);
        return null;
      }

      const { width: pdfPageWidth, height: pdfPageHeight } = pageToEdit.getSize();
      
      // Calculate position mappings
      // React-draggable gives x,y from top-left of canvas
      // PDF-Lib uses x,y from bottom-left of page
      const canvasEl = pdfCanvasRef.current;
      const renderedWidth = canvasEl ? canvasEl.clientWidth : pdfDimensions.width;
      const renderedHeight = canvasEl ? canvasEl.clientHeight : pdfDimensions.height;

      const scaleX = pdfPageWidth / renderedWidth;
      const scaleY = pdfPageHeight / renderedHeight;

      const pdfX = sigPosition.x * scaleX;
      // In PDF, Y is measured from the bottom
      const pdfY = pdfPageHeight - ((sigPosition.y + sigSize.height) * scaleY);
      
      const pdfWidth = sigSize.width * scaleX;
      const pdfHeight = sigSize.height * scaleY;

      pageToEdit.drawImage(image, {
        x: pdfX,
        y: pdfY,
        width: pdfWidth,
        height: pdfHeight,
      });

      const modifiedPdfBytes = await pdfDoc.save();
      return modifiedPdfBytes;
    } catch (err) {
      console.error(err);
      alert("Failed to embed signature.");
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    const bytes = await getModifiedPdfBytes();
    if (bytes) {
      const blob = new Blob([bytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `signed_${pdfFile?.name || 'document.pdf'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  };

  const handleSaveToArchive = async () => {
    const bytes = await getModifiedPdfBytes();
    if (bytes) {
      const { savePdfOffline } = await import('../utils/idb');
      const id = Date.now().toString();
      await savePdfOffline(id, `signed_${pdfFile?.name || 'document.pdf'}`, bytes.buffer as ArrayBuffer);
      alert('Saved to your Archive!');
    }
  };

  return (
    <div className="flex h-screen bg-[#FAFAFA] font-sans text-gray-900 w-full overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col relative h-screen">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <PenTool className="w-5 h-5 text-purple-600" />
              Sign PDF
            </h1>
          </div>
          {signatureDataUrl && (
             <div className="flex items-center gap-3">
               <button 
                  onClick={handleSaveToArchive}
                  disabled={isProcessing}
                  className="py-2 px-5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold rounded-lg shadow-sm flex items-center gap-2"
               >
                 {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                 Save Doc
               </button>
               <button 
                  onClick={handleDownload}
                  disabled={isProcessing}
                  className="py-2 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-md flex items-center gap-2"
               >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Download Signed PDF
               </button>
             </div>
          )}
        </header>

        <main className="flex-1 overflow-hidden flex flex-col lg:flex-row relative">
          
          {/* PDF Viewer Area */}
          <div className="flex-1 min-w-0 min-h-0 bg-[#e5e7eb] overflow-auto relative flex items-start justify-center p-4 lg:p-8">
            {!pdfFile ? (
              <div className="h-full w-full max-w-2xl border-2 border-dashed border-gray-300 rounded-2xl bg-white flex flex-col items-center justify-center p-12 text-center mt-10 hover:border-purple-400 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                 <div className="w-20 h-20 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                    <Upload className="w-10 h-10" />
                 </div>
                 <h3 className="text-xl font-bold text-gray-800 mb-2">Upload your PDF here</h3>
                 <p className="text-gray-500 mb-6">Drag and drop your file, or click to browse</p>
                 <button className="px-6 py-3 bg-white border border-gray-200 shadow-sm rounded-xl font-medium hover:bg-gray-50">Select PDF File</button>
                 <input type="file" ref={fileInputRef} className="hidden" accept="application/pdf" onChange={handleFileUpload} />
              </div>
            ) : (
              <div className="relative shadow-xl bg-white border border-gray-200 inline-block max-w-[100%] max-h-[100%]">
                 <canvas ref={pdfCanvasRef} className="block max-w-full h-auto" />
                 
                 {signatureDataUrl && (
                   <Draggable 
                      nodeRef={dragRef}
                      bounds="parent" 
                      defaultPosition={{ x: 50, y: 50 }} 
                      onStop={(e, data) => setSigPosition({ x: data.x, y: data.y })}
                   >
                      <div 
                         ref={dragRef}
                         style={{ 
                            width: sigSize.width, 
                            height: sigSize.height, 
                            border: '1px dashed #2563eb',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)'
                         }} 
                         className="absolute cursor-move flex items-center justify-center group touch-none"
                      >
                         <img src={signatureDataUrl} alt="Signature" className="w-full h-full object-contain pointer-events-none" />
                         
                         {/* Simple Resize Handle */}
                         <div 
                            className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-600 rounded-full cursor-se-resize shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                            onMouseDown={(e) => {
                               // basic resizer logic
                               e.stopPropagation();
                               const startX = e.clientX;
                               const startY = e.clientY;
                               const startW = sigSize.width;
                               const startH = sigSize.height;

                               const doDrag = (dragEvent: MouseEvent) => {
                                  const newW = startW + dragEvent.clientX - startX;
                                  const newH = startH + dragEvent.clientY - startY;
                                  setSigSize({ width: Math.max(50, newW), height: Math.max(20, newH) });
                               };
                               const stopDrag = () => {
                                  document.removeEventListener('mousemove', doDrag);
                                  document.removeEventListener('mouseup', stopDrag);
                               };
                               document.addEventListener('mousemove', doDrag);
                               document.addEventListener('mouseup', stopDrag);
                            }}
                         />
                         
                         {/* Remove btn */}
                         <button 
                            className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-sm"
                            onClick={() => setSignatureDataUrl(null)}
                         ><X className="w-3 h-3" /></button>
                      </div>
                   </Draggable>
                 )}
              </div>
            )}
          </div>

          {/* Right Sidebar for Signature Controls */}
          {pdfFile && (
            <div className="w-full lg:w-[320px] xl:w-[400px] h-[50vh] lg:h-auto shrink-0 border-t lg:border-t-0 lg:border-l border-gray-200 bg-white shadow-xl z-20 flex flex-col">
              <div className="p-4 lg:p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-800">Create Signature</h2>
                
                {/* Pagination Controls */}
                <div className="mt-4 flex items-center justify-between bg-gray-50 p-2 rounded-lg border border-gray-200">
                   <button 
                      disabled={currentPage <= 1} 
                      onClick={() => setCurrentPage(p => p - 1)}
                      className="px-3 py-1 bg-white border border-gray-200 rounded shadow-sm text-sm disabled:opacity-50"
                   >Prev</button>
                   <span className="text-sm font-medium">Page {currentPage} of {totalPages}</span>
                   <button 
                      disabled={currentPage >= totalPages} 
                      onClick={() => setCurrentPage(p => p + 1)}
                      className="px-3 py-1 bg-white border border-gray-200 rounded shadow-sm text-sm disabled:opacity-50"
                   >Next</button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-200">
                 <button 
                    onClick={() => setActiveTab('draw')}
                    className={`flex-1 py-4 flex justify-center items-center gap-2 border-b-2 transition-colors ${activeTab === 'draw' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}
                 >
                    <PenTool className="w-5 h-5" />
                 </button>
                 <button 
                    onClick={() => setActiveTab('type')}
                    className={`flex-1 py-4 flex justify-center items-center gap-2 border-b-2 transition-colors ${activeTab === 'type' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}
                 >
                    <span className="font-bold text-lg leading-none">AC</span>
                 </button>
                 <button 
                    onClick={() => setActiveTab('upload')}
                    className={`flex-1 py-4 flex justify-center items-center gap-2 border-b-2 transition-colors ${activeTab === 'upload' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}
                 >
                    {/* Stamp icon from reference */}
                    <div className="w-5 h-5 border-2 rounded-t-lg border-current relative">
                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-current" />
                       <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-1 bg-current" />
                    </div>
                 </button>
              </div>

              {/* Tab Contents */}
              <div className="p-6 flex-1 overflow-y-auto">
                 
                 {activeTab === 'draw' && (
                    <div className="flex flex-col gap-4">
                       <p className="text-sm text-gray-500 font-medium">Draw your signature here</p>
                       <div className="border border-gray-200 rounded-xl bg-[#f8fafc] h-[200px] relative flex items-center justify-center overflow-hidden">
                          {!hasDrawn && (
                             <div className="absolute text-gray-400 font-medium text-lg pointer-events-none z-0">
                                Draw your signature here
                             </div>
                          )}
                          <SignatureCanvas 
                             ref={sigCanvasRef}
                             penColor={sigColor}
                             onBegin={() => setHasDrawn(true)}
                             canvasProps={{ className: "w-full h-full cursor-crosshair relative z-10 touch-none" }}
                          />
                          <button onClick={handleClearSignature} className="absolute top-3 right-3 z-20 text-xs font-semibold text-gray-400 hover:text-gray-700 bg-white px-2 py-1 rounded shadow-sm border border-gray-100">Clear</button>
                       </div>

                       <div className="flex justify-center gap-3 mt-2">
                           {['#000000', '#dc2626', '#16a34a', '#3b82f6', '#1e3a8a', '#ffffff'].map(c => (
                               <button 
                                   key={c}
                                   onClick={() => setSigColor(c)}
                                   className={`w-8 h-8 rounded-full border-2 ${sigColor === c ? 'border-gray-400 scale-110 shadow-sm' : 'border-transparent block shadow-sm bg-clip-padding'}`}
                                   style={{ backgroundColor: c, outline: c === '#ffffff' ? '1px solid #e5e7eb' : 'none' }}
                                   title={`Colour: ${c}`}
                               />
                           ))}
                       </div>
                       
                       <button onClick={handleApplyDraw} className="w-full py-3 bg-[#e11d48] hover:bg-red-700 text-white font-bold rounded-xl shadow-md mt-4 transition-colors">Apply</button>
                    </div>
                 )}

                 {activeTab === 'type' && (
                    <div className="flex flex-col gap-4">
                       <div>
                         <label className="block text-sm font-bold text-gray-700 mb-1">Full name:</label>
                         <input type="text" value={typedName} onChange={(e) => setTypedName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 ring-blue-500 focus:border-blue-500 outline-none" />
                       </div>
                       <div>
                         <label className="block text-sm font-bold text-gray-700 mb-1">Initials:</label>
                         <input type="text" value={typedInitials} onChange={(e) => setTypedInitials(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 ring-blue-500 focus:border-blue-500 outline-none" />
                       </div>

                       <div className="mt-2 border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                          {['font-signature-1', 'font-signature-2', 'font-signature-3', 'font-signature-4'].map((fontId, i) => (
                             <label key={fontId} className={`flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedFont === fontId ? 'bg-gray-50/50' : ''}`}>
                                <div className="flex items-center justify-center shrink-0">
                                   <input 
                                     type="radio" 
                                     name="signature-font" 
                                     checked={selectedFont === fontId} 
                                     onChange={() => setSelectedFont(fontId)}
                                     className="w-4 h-4 accent-[#10b981]"
                                   />
                                </div>
                                <span className="text-2xl text-gray-800 tracking-wide" style={{ 
                                   fontFamily: 
                                     i === 0 ? '"Brush Script MT", cursive' : 
                                     i === 1 ? '"Courier New", monospace' : 
                                     i === 2 ? '"Times New Roman", serif' : 'fantasy',
                                   fontStyle: i === 0 || i === 2 ? 'italic' : 'normal'
                                }}>
                                   {typedName || 'Your Name'}
                                </span>
                             </label>
                          ))}
                       </div>
                       <div className="flex justify-center gap-3">
                           {['#000000', '#dc2626', '#16a34a', '#3b82f6', '#1e3a8a', '#ffffff'].map(c => (
                               <button 
                                   key={c}
                                   onClick={() => setSigColor(c)}
                                   className={`w-8 h-8 rounded-full border-2 ${sigColor === c ? 'border-gray-400 scale-110 shadow-sm' : 'border-transparent block shadow-sm bg-clip-padding'}`}
                                   style={{ backgroundColor: c, outline: c === '#ffffff' ? '1px solid #e5e7eb' : 'none' }}
                                   title={`Colour: ${c}`}
                               />
                           ))}
                       </div>
                       <button onClick={handleApplyType} className="w-full py-3 bg-[#e11d48] hover:bg-red-700 text-white font-bold rounded-xl shadow-md mt-4 transition-colors">Apply</button>
                    </div>
                 )}

                 {activeTab === 'upload' && (
                    <div className="flex flex-col gap-4 text-center">
                       <div className="border border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors py-12 px-6 flex flex-col items-center justify-center cursor-pointer relative" onClick={() => document.getElementById('stamp-upload')?.click()}>
                          <div className="border border-red-600 text-red-600 rounded-lg px-4 py-2 font-bold mb-4 bg-white/50 inline-block pointer-events-none">
                             Upload company stamp
                          </div>
                          <p className="text-gray-400 mb-2 font-medium">or drop file here</p>
                          <p className="text-xs text-gray-400">Accepted formats: <strong className="text-gray-500">PNG</strong>, <strong className="text-gray-500">JPG</strong> and <strong className="text-gray-500">SVG</strong></p>
                          <input type="file" id="stamp-upload" className="hidden" accept=".png,.jpg,.jpeg,.svg" onChange={handleSignatureUpload} />
                       </div>
                    </div>
                 )}

              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
