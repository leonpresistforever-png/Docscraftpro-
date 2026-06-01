import { rotatePDF, addWatermark, addPageNumbers } from '../utils/PDFEngine';
import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Button } from '../components/ui/Button';
import { 
  FileText, Wand2, Music, Video, Image as ImageIcon, Search, LayoutTemplate, MoreHorizontal, 
  FilePlus, RefreshCw, Upload, Globe, X, RotateCw, ListOrdered, Droplets, Crop, Edit3, 
  LayoutList, Unlock, Lock, PenTool, Ban, SplitSquareHorizontal, FileImage, FileType2, 
  Presentation, FileSpreadsheet, Code, ShieldCheck, ArrowRight, Star, Share2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

  // Modal State
  const [activeModal, setActiveModal] = useState<'creator' | 'convert' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentToolRef = useRef<string | null>(null);

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
    try {
      if (navigator.share) {
         await navigator.share({
            title: d.title,
            text: 'Check out this document',
            url: window.location.origin + '/doc/' + d.id
         });
         await updateDoc(doc(db, 'documents', d.id), { isShared: true });
      } else {
         alert(`Link: ${window.location.origin}/doc/${d.id}`);
      }
    } catch (err) { }
  };

  const quickActions = [
    { icon: <FilePlus className="w-5 h-5" />, label: 'New Document', href: '/doc/new' },
    { icon: <Globe className="w-5 h-5" />, label: 'Translate PDF', href: '/media' },
    { icon: <Upload className="w-5 h-5" />, label: 'Upload', action: () => handleToolClick('Upload to Doc') },
  ];

  const handleToolClick = (toolName: string) => {
    if (toolName === 'Sign PDF') {
      navigate('/tools/sign-pdf');
      return;
    }
    if (toolName === 'Rotate PDF' || toolName === 'Add Watermark' || toolName === 'Add Page Numbers' || toolName === 'Upload to Doc') {
       currentToolRef.current = toolName;
       if (fileInputRef.current) {
         fileInputRef.current.value = '';
         fileInputRef.current.click();
       }
       return;
    }
    alert(`The "${toolName}" tool is currently under construction. Check back soon for the full feature!`);
  };

  const handleToolFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     const currentTool = currentToolRef.current;
     
     if (!file || !currentTool) {
       if (fileInputRef.current) fileInputRef.current.value = '';
       return;
     }

     if (currentTool === 'Upload to Doc') {
         try {
           const pdfjsLib = await import('pdfjs-dist');
           pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
           const arrayBuffer = await file.arrayBuffer();
           const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
           let text = '';
           for (let i = 1; i <= pdf.numPages; i++) {
             const page = await pdf.getPage(i);
             const content = await page.getTextContent();
             text += content.items.map((item: any) => item.str).join(' ') + '\n\n';
           }
           const newDocRef = doc(collection(db, 'documents'));
           await setDoc(newDocRef, {
              title: file.name.replace('.pdf', ''),
              content: encryptData(text),
              ownerId: user?.uid,
              isPinned: false,
              isArchived: false,
              isStarred: false,
              isShared: false,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
           });
           navigate(`/doc/${newDocRef.id}`);
         } catch (err) {
            console.error('Upload extract error:', err);
            alert('Could not extract text from PDF.');
         } finally {
            currentToolRef.current = null;
         }
         return;
     }
     
     try {
        let resultBlob: Blob | null = null;
        let filename = file.name;
        
        if (currentTool === 'Rotate PDF') {
           resultBlob = await rotatePDF(file, 90);
           filename = `rotated_${file.name}`;
        } else if (currentTool === 'Add Watermark') {
           const watermarkText = prompt("Enter watermark text:", "CONFIDENTIAL") || "CONFIDENTIAL";
           resultBlob = await addWatermark(file, watermarkText);
           filename = `watermarked_${file.name}`;
        } else if (currentTool === 'Add Page Numbers') {
           resultBlob = await addPageNumbers(file);
           filename = `numbered_${file.name}`;
        }
        
        if (resultBlob) {
           // Attempt download
           try {
             const link = document.createElement('a');
             link.href = URL.createObjectURL(resultBlob);
             link.download = filename;
             link.click();
             setTimeout(() => URL.revokeObjectURL(link.href), 1000);
           } catch {
             // Ignore download errors
           }
        }
     } catch (error) {
       console.error(error);
       alert("Failed to process the PDF: " + error);
     } finally {
       currentToolRef.current = null;
       if (fileInputRef.current) fileInputRef.current.value = '';
     }
  };

  const filteredDocuments = documents.filter(doc => {
     if (activeTab === 'starred') return doc.isStarred;
     if (activeTab === 'shared') return doc.isShared;
     return true;
  });

  return (
    <div className="flex h-screen bg-dc-bg-page font-sans text-dc-text relative overflow-x-hidden">
      <input type="file" ref={fileInputRef} hidden onChange={handleToolFileChange} accept="application/pdf" />
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="w-full max-w-[1400px] mx-auto p-12">
          
          {/* TopBar Area */}
          <header className="flex justify-between items-center mb-12">
            <div>
              <h1 className="text-4xl font-serif font-bold tracking-tight mb-2">Welcome back, {user?.displayName ? user.displayName.split(' ')[0] : 'Crafter'}</h1>
              <p className="text-lg text-dc-text-muted">Ready to craft pro-grade documents today?</p>
            </div>
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
                <button 
                  key={i}
                  onClick={() => action.href ? navigate(action.href) : (action.action && action.action())}
                  className="flex items-center gap-3 bg-white border border-dc-border rounded-xl px-6 py-4 min-w-[200px] hover:shadow-md hover:-translate-y-1 transition-all flex-shrink-0 group"
                >
                  <div className="text-gray-500 group-hover:text-dc-gold transition-colors">
                    {action.icon}
                  </div>
                  <span className="font-semibold text-sm whitespace-nowrap">{action.label}</span>
                </button>
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
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => shareDoc(e, doc)} className="text-gray-400 hover:text-blue-500 p-1">
                        <Share2 className="w-5 h-5" />
                      </button>
                      <button onClick={(e) => toggleStar(e, doc.id, doc.isStarred)} className={`p-1 ${doc.isStarred ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'}`}>
                        <Star className={`w-5 h-5 ${doc.isStarred ? 'fill-current' : ''}`} />
                      </button>
                      <button className="text-gray-400 hover:text-gray-800 p-1">
                        <MoreHorizontal className="w-5 h-5" />
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

      {/* Modals removed as requested */}
    </div>
  )
}

