import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { 
  Clock, GitBranch, RotateCcw, ChevronLeft, 
  ArrowLeft, Search, FileText, User, 
  Calendar, CheckCircle, AlertCircle
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, orderBy, getDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Button } from '../components/ui/Button';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

interface Snapshot {
  id: string;
  content: string;
  title: string;
  version: number;
  createdAt: any;
}

export function HistoryPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [selectedSnapshot, setSelectedSnapshot] = useState<Snapshot | null>(null);
  const [docTitle, setDocTitle] = useState('Document Name');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !id) return;

    const fetchData = async () => {
      try {
        // Get primary doc
        const docSnap = await getDoc(doc(db, 'documents', id));
        if (docSnap.exists()) {
          setDocTitle(docSnap.data().title);
        }

        // Get snapshots
        const q = query(
          collection(db, 'documents', id, 'history'),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const snaps = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
        setSnapshots(snaps);
        if (snaps.length > 0) {
          setSelectedSnapshot(snaps[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, user]);

  const handleRestore = async () => {
    if (!selectedSnapshot || !id) return;
    
    // In a real app we update the main doc
    navigate(`/doc/${id}`);
  };

  return (
    <div className="flex h-screen bg-[#FAF9F6] font-sans text-dc-text overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="px-8 py-6 border-b border-dc-border bg-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
             <button onClick={() => navigate(`/doc/${id}`)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
               <ArrowLeft className="w-5 h-5" />
             </button>
             <div>
                <h1 className="text-xl font-bold font-serif text-gray-900 leading-tight">Version Timeline</h1>
                <p className="text-[10px] uppercase font-bold tracking-widest text-[#D4AF37]">{docTitle}</p>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <Button variant="outline" size="sm">
                <Search className="w-4 h-4 mr-2" /> Search Snapshots
             </Button>
             <Button variant="gold" size="sm" disabled={!selectedSnapshot} onClick={handleRestore}>
                <RotateCcw className="w-4 h-4 mr-2" /> Restore Version
             </Button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
           {/* Timeline Sidebar */}
           <div className="w-80 border-r border-dc-border bg-gray-50/50 flex flex-col shrink-0 overflow-y-auto">
              {isLoading ? (
                <div className="p-8 text-center text-gray-400 animate-pulse">Loading timeline...</div>
              ) : snapshots.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                   <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-20" />
                   <p className="text-sm font-medium">No historical snapshots yet.</p>
                </div>
              ) : (
                <div className="p-4 space-y-2">
                   {snapshots.map((snap, i) => (
                     <button 
                       key={snap.id}
                       onClick={() => setSelectedSnapshot(snap)}
                       className={`w-full p-4 rounded-2xl border text-left transition-all ${
                         selectedSnapshot?.id === snap.id 
                         ? 'bg-white border-[#D4AF37] shadow-xl ring-1 ring-[#D4AF37]' 
                         : 'bg-transparent border-transparent hover:bg-white hover:border-gray-200'
                       }`}
                     >
                        <div className="flex items-center justify-between mb-1">
                           <span className={`text-[10px] font-bold uppercase tracking-wider ${selectedSnapshot?.id === snap.id ? 'text-[#D4AF37]' : 'text-gray-400'}`}>
                              Version {snap.version || snapshots.length - i}
                           </span>
                           <Clock className="w-3.5 h-3.5 text-gray-300" />
                        </div>
                        <p className="text-sm font-bold text-gray-800 mb-1">
                           {snap.createdAt ? (typeof snap.createdAt.toDate === 'function' ? format(snap.createdAt.toDate(), 'MMM d, HH:mm') : format(new Date(snap.createdAt), 'MMM d, HH:mm')) : 'Recently Saved'}
                        </p>
                        <div className="flex items-center gap-1.5">
                           <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="w-2.5 h-2.5 text-gray-500" />
                           </div>
                           <span className="text-[10px] text-gray-400 font-medium">Auto-Snapshot by Bot</span>
                        </div>
                     </button>
                   ))}
                </div>
              )}
           </div>

           {/* Preview Panel */}
           <div className="flex-1 bg-white p-12 md:p-20 overflow-y-auto relative bg-dots-grid">
              <AnimatePresence mode="wait">
                {selectedSnapshot ? (
                  <motion.div 
                    key={selectedSnapshot.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="max-w-3xl mx-auto space-y-8"
                  >
                    <header className="border-b border-gray-100 pb-8 flex items-center justify-between">
                       <div>
                          <h2 className="text-3xl font-bold font-serif mb-2">{selectedSnapshot.title || docTitle}</h2>
                          <div className="flex items-center gap-4">
                             <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                                <Calendar className="w-3.5 h-3.5" />
                                {selectedSnapshot.createdAt ? (typeof selectedSnapshot.createdAt.toDate === 'function' ? format(selectedSnapshot.createdAt.toDate(), 'MMMM d, yyyy') : format(new Date(selectedSnapshot.createdAt), 'MMMM d, yyyy')) : 'Live Edit'}
                             </div>
                             <div className="flex items-center gap-2 text-xs font-bold text-dc-gold uppercase tracking-widest">
                                <CheckCircle className="w-3.5 h-3.5" /> Checked Out
                             </div>
                          </div>
                       </div>
                    </header>

                    <div 
                       className="prose prose-dc max-w-none text-gray-800 leading-relaxed opacity-80"
                       dangerouslySetInnerHTML={{ __html: selectedSnapshot.content }}
                    />
                  </motion.div>
                ) : !isLoading && (
                  <div className="h-full flex items-center justify-center text-gray-400">
                     <p className="font-medium">Select a version from the timeline to preview.</p>
                  </div>
                )}
              </AnimatePresence>
           </div>
        </div>
      </main>
    </div>
  );
}
