import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { 
  Trash2, RefreshCw, FileText, ChevronRight, 
  Search, HardDrive, AlertCircle, Trash 
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, where, onSnapshot, orderBy, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { format } from 'date-fns';

interface Document {
  id: string;
  title: string;
  updatedAt: any;
}

export function TrashPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    setIsLoading(true);
    
    // Query safely by ownerId only to bypass composite index constraints
    const q = query(
      collection(db, 'documents'),
      where('ownerId', '==', user.uid)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const now = new Date();
      const fifteenDaysMs = 15 * 24 * 60 * 60 * 1000;
      
      let docsData: Document[] = [];
      const docsToDelete: string[] = [];
      
      snapshot.docs.forEach(docSnap => {
        const data = docSnap.data();
        if (!data.isArchived) return; // Only process archived documents
        
        let docDate = new Date();
        if (data.updatedAt) {
           docDate = typeof data.updatedAt.toDate === 'function' ? data.updatedAt.toDate() : new Date(data.updatedAt);
        }
        
        // Auto-delete logic
        if (now.getTime() - docDate.getTime() > fifteenDaysMs) {
           // Delete immediately in background
           deleteDoc(doc(db, 'documents', docSnap.id)).catch(console.error);
        } else {
           docsData.push({
             id: docSnap.id,
             title: data.title || 'Untitled Document',
             updatedAt: data.updatedAt
           });
        }
      });
      
      // Sort client-side by updatedAt descending
      docsData.sort((a, b) => {
        const t1 = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : (a.updatedAt?.seconds ? a.updatedAt.seconds * 1000 : 0);
        const t2 = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : (b.updatedAt?.seconds ? b.updatedAt.seconds * 1000 : 0);
        return t2 - t1;
      });
      
      setDocuments(docsData);
      setIsLoading(false);
    }, (error) => {
      console.error(error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const restoreDocument = async (docId: string) => {
    try {
      await updateDoc(doc(db, 'documents', docId), {
        isArchived: false,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error(err);
    }
  };

  const permanentlyDelete = async (docId: string) => {
    if (!window.confirm("Permanently delete this document? This cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, 'documents', docId));
    } catch (err) {
      console.error(err);
    }
  };

  const emptyTrash = async () => {
    if (!window.confirm("Permanently delete ALL documents in the trash? This cannot be undone.")) return;
    try {
      await Promise.all(documents.map(d => deleteDoc(doc(db, 'documents', d.id))));
    } catch (err) {
      console.error("Failed to empty trash", err);
    }
  };

  return (
    <div className="flex h-screen bg-[#FAF9F6] font-sans text-dc-text">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto p-8 md:p-12 lg:p-16">
        <div className="max-w-5xl mx-auto">
          <header className="mb-12 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold font-serif mb-2 flex items-center gap-3">
                <Trash2 className="w-8 h-8 text-gray-400" /> Trash
              </h1>
              <p className="text-gray-500">Documents in the trash will be automatically deleted after 15 days.</p>
            </div>
            {documents.length > 0 && (
              <Button onClick={emptyTrash} variant="outline" className="text-red-500 border-red-100 hover:bg-red-50">
                 Empty Trash
              </Button>
            )}
          </header>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
               <RefreshCw className="w-8 h-8 animate-spin" />
               <p className="text-sm font-medium">Scanning archives...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-[#EAE6DF] border-dashed">
               <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-6">
                  <Trash className="w-8 h-8 text-gray-200" />
               </div>
               <h3 className="text-xl font-bold text-gray-800 mb-2">Trash is empty</h3>
               <p className="text-gray-500 text-sm">Deleted documents will appear here.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dc-border shadow-sm overflow-hidden">
               <div className="grid grid-cols-1 divide-y divide-gray-100">
                  {documents.map(doc => {
                    let docDate = new Date();
                    if (doc.updatedAt) {
                       docDate = typeof doc.updatedAt.toDate === 'function' ? doc.updatedAt.toDate() : new Date(doc.updatedAt);
                    }
                    const daysPassed = Math.floor((new Date().getTime() - docDate.getTime()) / (1000 * 60 * 60 * 24));
                    const daysLeft = Math.max(0, 15 - daysPassed);
                    
                    return (
                    <motion.div 
                      key={doc.id} 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="group flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                           <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 mb-0.5">{doc.title}</h4>
                          <div className="flex items-center gap-3 text-[11px] text-gray-400 font-medium uppercase tracking-wider">
                             <span>Deleted {doc.updatedAt ? (typeof doc.updatedAt.toDate === 'function' ? format(doc.updatedAt.toDate(), 'MMM d, yyyy') : format(new Date(doc.updatedAt), 'MMM d, yyyy')) : 'Recently'}</span>
                             <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                             <span className="text-orange-400 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> {daysLeft} days left
                             </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => restoreDocument(doc.id)}
                          className="border-dc-border hover:bg-white"
                        >
                          <RefreshCw className="w-3.5 h-3.5 mr-2" /> Restore
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => permanentlyDelete(doc.id)}
                          className="border-red-100 text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </motion.div>
                  )})}
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
