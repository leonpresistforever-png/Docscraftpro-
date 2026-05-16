import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, Timestamp, deleteDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { X, Clock, MessageSquare, Search, Edit, Trash2, Pin } from 'lucide-react';

interface ChatSession {
  id: string;
  title: string;
  appType: string;
  messages: string;
  ownerId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface ChatHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  appType: 'ai_sheets' | 'nexus' | 'summarize';
  userId: string | undefined;
  onSelectSession: (messages: any[], sessionId: string) => void;
}

export function ChatHistoryDrawer({ isOpen, onClose, appType, userId, onSelectSession }: ChatHistoryDrawerProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!userId || !isOpen) return;

    const q = query(
      collection(db, 'chat_sessions'),
      where('ownerId', '==', userId),
      where('appType', '==', appType)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ChatSession[];
      // Sort on client side to avoid needing composite index
      data.sort((a, b) => {
         if ((a as any).isPinned && !(b as any).isPinned) return -1;
         if (!(a as any).isPinned && (b as any).isPinned) return 1;
         const tA = a.updatedAt?.toMillis?.() || 0;
         const tB = b.updatedAt?.toMillis?.() || 0;
         return tB - tA;
      });
      setSessions(data);
    }, (error) => {
      console.error('Error fetching history:', error);
    });

    return () => unsubscribe();
  }, [userId, appType, isOpen]);

  const filteredSessions = sessions.filter(session => 
    session.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black/20 z-40"
            onClick={onClose}
          />
          <motion.div 
            initial={{ x: '100%' }} 
            animate={{ x: 0 }} 
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-80 bg-white shadow-2xl z-50 flex flex-col border-l border-gray-100"
          >
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2 text-gray-800">
                <Clock className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold">History</h3>
              </div>
              <div className="flex items-center gap-2">
                 <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg">
                   <X className="w-5 h-5" />
                 </button>
              </div>
            </div>
            
            <div className="p-4 border-b border-gray-100 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for chats"
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors"
                />
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    onSelectSession([], `${appType}_${Date.now()}`);
                    onClose();
                  }}
                  className="flex-1 flex items-center gap-2 text-gray-800 hover:bg-gray-100 p-2 rounded-xl transition-colors font-medium text-sm"
                >
                  <Edit className="w-4 h-4" />
                  New chat
                </button>
                <button 
                  onClick={async (e) => {
                     e.stopPropagation();
                     setSessions([]);
                     try {
                        await Promise.all(sessions.map(s => deleteDoc(doc(db, 'chat_sessions', s.id))));
                     } catch(error) {
                        console.error("Failed to delete all", error);
                     }
                  }}
                  className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                  title="Delete all history"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredSessions.length === 0 ? (
                <div className="text-center text-gray-500 mt-10 text-sm">
                  {searchQuery ? "No matches found." : "No history found."}
                </div>
              ) : (
                <>
                  {filteredSessions.map(session => (
                    <div key={session.id} className="relative group w-full text-left p-3 rounded-xl hover:bg-purple-50 transition-colors border border-transparent hover:border-purple-100 flex flex-col gap-1 cursor-pointer">
                    <div 
                      onClick={() => {
                        try {
                          const parsed = JSON.parse(session.messages);
                          onSelectSession(parsed, session.id);
                          onClose();
                        } catch (e) {
                          console.error('Failed to parse messages', e);
                        }
                      }}
                      className="font-medium text-gray-800 text-sm flex items-center pr-12 gap-2"
                    >
                      {(session as any).isPinned ? <Pin className="w-4 h-4 text-purple-600 shrink-0" fill="currentColor"/> : <MessageSquare className="w-4 h-4 text-gray-400 shrink-0" />}
                      <span className="truncate">{session.title || 'Untitled Session'}</span>
                    </div>
                    <div className="text-xs text-gray-400 ml-6">
                      {session.updatedAt ? new Date(session.updatedAt.toMillis()).toLocaleString() : ''}
                    </div>

                    <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white/80 backdrop-blur pb-1 pl-1 rounded-bl-lg">
                        <button 
                          onClick={(e) => {
                              e.stopPropagation();
                              updateDoc(doc(db, 'chat_sessions', session.id), { 
                                isPinned: !(session as any).isPinned,
                                updatedAt: serverTimestamp() 
                              });
                          }}
                          className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                          title={(session as any).isPinned ? "Unpin chat" : "Pin chat"}
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={(e) => {
                              e.stopPropagation();
                              deleteDoc(doc(db, 'chat_sessions', session.id));
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete chat"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                  </div>
                ))}
                

                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
