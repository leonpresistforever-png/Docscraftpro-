import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Loader2, FileText, Download, Trash2, File as FileIcon } from 'lucide-react';
import { Sidebar } from '../components/layout/Sidebar';
import { getAllSavedPdfs, deleteSavedPdf, getAllSavedDocsOffline, deleteSavedDocOffline } from '../utils/idb';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export default function SavedArchive() {
  const navigate = useNavigate();
  const [savedDocs, setSavedDocs] = useState<any[]>([]);
  const [savedPdfs, setSavedPdfs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDocs = async () => {
      if (!user) return;
      try {
        setIsLoading(true);
        // Fetch IDB Docs
        const idbDocs = await getAllSavedDocsOffline();
        setSavedDocs(idbDocs.sort((a, b) => b.savedOfflineAt - a.savedOfflineAt));

        // Fetch IDB PDFs
        const pdfData = await getAllSavedPdfs();
        setSavedPdfs(pdfData.map(pdf => ({ ...pdf, type: 'pdf' })).sort((a, b) => b.createdAt - a.createdAt));

      } catch (error) {
        console.error("Error fetching saved docs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocs();
  }, [user]);

  const handleDownloadPdf = (pdf: any) => {
    const blob = new Blob([pdf.data], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = pdf.name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  };

  const handleDeletePdf = async (id: string) => {
    if (confirm('Are you sure you want to delete this PDF?')) {
      await deleteSavedPdf(id);
      setSavedPdfs(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleDeleteDoc = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this specific Document from archive?')) {
      await deleteSavedDocOffline(id);
      setSavedDocs(prev => prev.filter(d => d.id !== id));
    }
  };

  return (
    <div className="flex h-screen bg-[#FFFDF5] text-gray-900 w-full overflow-hidden font-sans relative">
      <Sidebar />
      <div className="flex-1 w-full relative overflow-y-auto">
        
        {/* Animated Background - White Golden Watery Color */}
        <div className="fixed inset-0 pointer-events-none z-0 opacity-40">
           <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-r from-yellow-100 to-amber-200 blur-3xl mix-blend-multiply animate-pulse" style={{ animationDuration: '8s' }}></div>
           <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-l from-white to-orange-100 blur-3xl mix-blend-multiply animate-pulse" style={{ animationDuration: '10s' }}></div>
           <div className="absolute top-[30%] left-[30%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-t from-yellow-50 to-white blur-3xl opacity-50 mix-blend-overlay animate-pulse" style={{ animationDuration: '6s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-8 py-16 relative z-10">
          <div className="mb-12">
             <h1 className="text-4xl font-bold tracking-tight text-gray-800 mb-2">Saved Archive</h1>
             <p className="text-gray-500 text-lg">Easily access your archived documents and saved offline PDFs.</p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
            </div>
          ) : (
            <div className="space-y-16">
               
               {/* Archived Cloud Docs */}
               <section>
                 <h2 className="text-2xl font-bold text-gray-700 mb-6 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-gray-400" />
                    Offline Documents
                 </h2>
                 {savedDocs.length === 0 ? (
                    <div className="bg-white/50 backdrop-blur border border-yellow-100/50 rounded-2xl p-8 text-center text-gray-500">
                       No offline documents saved.
                    </div>
                 ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                       {savedDocs.map(doc => (
                         <div onClick={() => navigate(`/editor/${doc.id}`)} key={doc.id} className="relative group bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/40 shadow-sm hover:shadow flex flex-col transition-all cursor-pointer">
                            <button 
                               onClick={(e) => handleDeleteDoc(e, doc.id)}
                               className="absolute top-4 right-4 p-2 bg-red-50 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"
                            >
                               <Trash2 className="w-4 h-4" />
                            </button>
                            <h3 className="font-bold text-gray-800 text-lg mb-2 pr-8 truncate">{doc.title || 'Untitled Document'}</h3>
                            <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-1">
                               {doc.content?.startsWith('ENC_V1_') ? 'Secure encrypted document...' : (doc.content?.replace(/<[^>]*>?/gm, '') || 'No content...')}
                            </p>
                            <div className="text-xs text-gray-400 pt-4 border-t border-gray-100">
                              {new Date(doc.savedOfflineAt).toLocaleDateString()}
                            </div>
                         </div>
                       ))}
                    </div>
                 )}
               </section>
               
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
