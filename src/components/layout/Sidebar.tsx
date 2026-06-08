import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, Search, Settings, Plus, FileText, Pin, 
  LogOut, ChevronLeft, ChevronRight, LayoutDashboard,
  CheckSquare, MoreHorizontal, Edit2, Trash2, ArrowLeft, Brain, Clock, BarChart3, ShieldCheck, Box, Network, Archive, Crown, PenTool
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useAuth } from '@/src/context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, where, onSnapshot, orderBy, updateDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { isSemanticSearchEnabled, indexDocuments } from '../../lib/useOramaSearch';

// --- Types ---
interface Document {
  id: string;
  title: string;
  content: string;
  type?: string;
  tags?: string[];
  isPinned: boolean;
  isArchived?: boolean;
  updatedAt: string | any;
}

export function Sidebar({ defaultCollapsed = false }: { defaultCollapsed?: boolean }) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMenuDocId, setActiveMenuDocId] = useState<string | null>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Auto-collapse sidebar on smaller screens
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
        setIsCollapsed(true);
      }
    };
    handleResize(); // Invoke on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // --- Task 1: Transition from Mock to Live Data ---
  useEffect(() => {
    if (!user) return;
    
    setIsLoading(true);
    
    // Fetch user documents safely by user ID only to avoid composite index requirements
    const q = query(
      collection(db, 'documents'),
      where('ownerId', '==', user.uid)
    );
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      let docsData = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          title: data.title || 'Untitled Document',
          content: data.content || '',
          tags: data.tags || [],
          isPinned: !!data.isPinned,
          isArchived: !!data.isArchived,
          isStarred: !!data.isStarred,
          isShared: !!data.isShared,
          updatedAt: data.updatedAt
        };
      });
      
      // Filter non-archived documents client-side
      docsData = docsData.filter(d => !d.isArchived);
      
      // Sort client-side by updatedAt descending
      docsData.sort((a, b) => {
        const t1 = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : (a.updatedAt?.seconds ? a.updatedAt.seconds * 1000 : 0);
        const t2 = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : (b.updatedAt?.seconds ? b.updatedAt.seconds * 1000 : 0);
        return t2 - t1;
      });
      
      setDocuments(docsData);
      setIsLoading(false);
      
      if (isSemanticSearchEnabled()) {
        try {
          await indexDocuments(docsData.map(d => ({
            id: d.id,
            title: d.title,
            content: d.content,
            tags: d.tags?.join(', ') || ''
          })));
        } catch (e) {
          console.error("Failed to index docs", e);
        }
      }
    }, (error) => {
      console.error("Failed to fetch documents:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // --- Derived State ---
  const pinnedDocs = documents.filter(doc => doc.isPinned);
  const regularDocs = documents.filter(doc => !doc.isPinned);

  // --- Task 3: Functional Logic Definitions ---
  
  // 1. Search Functionality
  const handleOpenSearch = () => {
    setIsSearchModalOpen(true);
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    const q = searchQuery.toLowerCase();
    
    const results = documents.filter(doc => 
      doc.title.toLowerCase().includes(q) || 
      (doc.content && doc.content.toLowerCase().includes(q))
    ).map(doc => ({
      id: doc.id,
      title: doc.title,
      type: doc.type,
      snippet: doc.content?.substring(0, 100) || '',
      score: 1
    }));
    
    setSearchResults(results);
    setIsSearching(false);
  }, [searchQuery, documents]);

  // 2. User Profile Functionality
  const handleProfileClick = () => {
    console.log("Opening Account/Workspace Dropdown...");
  };

  // 3. New Page Creation
  const handleCreateNewPage = async () => {
    if (!user) return;
    try {
      const newDocRef = doc(collection(db, 'documents'));
      await setDoc(newDocRef, {
        title: 'Untitled Document',
        content: '',
        ownerId: user.uid,
        isPinned: false,
        isArchived: false,
        isStarred: false,
        isShared: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      // Automatically route user to the newly created document
      navigate(`/doc/${newDocRef.id}`);
    } catch (error) {
      console.error("Error creating document:", error);
    }
  };

  // Document Specific Actions (Rename, Delete, Pin Toggle)
  const togglePin = async (docId: string, currentPinState: boolean, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await updateDoc(doc(db, 'documents', docId), {
        isPinned: !currentPinState,
        updatedAt: serverTimestamp()
      });
      setActiveMenuDocId(null);
    } catch (err) {
      console.error("Failed to pin/unpin", err);
    }
  };

  const archiveDocumentAction = async (docId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await updateDoc(doc(db, 'documents', docId), {
        isArchived: true,
        isPinned: false, // Unpin when archiving
        updatedAt: serverTimestamp()
      });
      setActiveMenuDocId(null);
      // Route away if archiving the active document
      if (location.pathname === `/doc/${docId}`) {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error("Failed to archive document", err);
    }
  };

  const toggleDocMenu = (e: React.MouseEvent, docId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveMenuDocId(prev => prev === docId ? null : docId);
  };

  // --- Render Document Item Helper ---
  const renderDocumentItem = (docItem: Document, icon: React.ReactNode) => {
    const isActive = location.pathname === `/doc/${docItem.id}`;
    
    return (
      <div className="relative group">
        <Link 
          to={`/doc/${docItem.id}`} 
          className={cn(
            "flex items-center gap-3 px-2 py-1.5 rounded text-[13px] transition-colors w-full", 
            isActive ? "bg-[#EAE6DF] text-gray-900 font-medium" : "text-gray-600 hover:bg-gray-100"
          )}
        >
          <div className="shrink-0 flex justify-center w-5">
            {isActive ? <div className="text-gray-600">{icon}</div> : <div className="text-gray-400 group-hover:text-gray-600 transition-colors">{icon}</div>}
          </div>
          {!isCollapsed && <span className="truncate flex-1">{docItem.title}</span>}
          
          {/* Options Trigger */}
          {!isCollapsed && (
            <button 
              onClick={(e) => toggleDocMenu(e, docItem.id)}
              className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-gray-200 rounded transition-all text-gray-500"
            >
              <MoreHorizontal size={14} />
            </button>
          )}
        </Link>

        {/* Hover State Option Menu '...' */}
        <AnimatePresence>
          {activeMenuDocId === docItem.id && !isCollapsed && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute right-0 top-8 w-40 bg-white border border-[#EAE6DF] shadow-lg rounded-md overflow-hidden z-50 flex flex-col py-1"
            >
              <button 
                onClick={(e) => togglePin(docItem.id, docItem.isPinned, e)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 text-left"
              >
                <Pin size={12} className={docItem.isPinned ? "text-[#D4AF37]" : "text-gray-400"} />
                {docItem.isPinned ? "Unpin" : "Pin to top"}
              </button>
              <button 
                onClick={async (e) => { 
                  e.preventDefault(); 
                  e.stopPropagation(); 
                  setActiveMenuDocId(null); 
                  const newTitle = prompt("Rename Document", docItem.title);
                  if (newTitle && newTitle.trim() && newTitle.trim() !== docItem.title) {
                    try {
                      await updateDoc(doc(db, 'documents', docItem.id), {
                        title: newTitle.trim(),
                        updatedAt: serverTimestamp()
                      });
                    } catch (err) {
                      console.error("Failed to rename document", err);
                    }
                  }
                }}
                className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 text-left"
              >
                <Edit2 size={12} className="text-gray-400" />
                Rename
              </button>
              <div className="h-px bg-[#EAE6DF] my-1"></div>
              <Link 
                 to={`/history/${docItem.id}`}
                 className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 text-left"
               >
                 <Clock size={12} className="text-gray-400" />
                 Version History
               </Link>
              <button 
                onClick={(e) => archiveDocumentAction(docItem.id, e)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 text-left"
              >
                <Trash2 size={12} />
                Delete
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <>
      <motion.div 
        animate={{ width: isCollapsed ? 70 : 250 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="bg-[#FAF9F6] border-r border-[#EAE6DF] h-screen flex flex-col font-sans relative shrink-0 z-50 text-[#1a1a1a]"
    >
      {/* Resizer Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 bg-white border border-[#EAE6DF] shadow-sm rounded-full p-1 text-gray-500 hover:text-[#D4AF37] transition-colors z-10"
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Header Actions */}
      <div className={cn("p-4 flex items-center justify-between", isCollapsed && "justify-center")}>
        <Link to="/" className="text-gray-400 hover:text-gray-800 transition-colors" title="Back to Landing">
          <ArrowLeft size={18} />
        </Link>
      </div>

      {/* Top Profile Area (Clickable) */}
      <button 
        onClick={handleProfileClick}
        className={cn(
          "pt-2 pb-4 px-4 flex items-center shrink-0 hover:bg-gray-100 transition-colors cursor-pointer text-left focus:outline-none w-full", 
          isCollapsed && "justify-center px-0"
        )}
      >
        <div className={cn(
          "w-8 h-8 rounded shrink-0 border overflow-hidden flex items-center justify-center relative",
          "bg-gradient-to-br from-[#1a1a1a] to-[#333] border-black"
        )}>
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover z-10" />
          ) : (
            <div className="text-white text-xs font-bold z-10">{user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}</div>
          )}
        </div>
        {!isCollapsed && (
          <div className="flex flex-col ml-3 overflow-hidden">
            <span className="font-semibold text-sm truncate w-full">{user?.displayName || 'User'}</span>
            <span className="text-[10px] text-gray-500 truncate w-full uppercase tracking-wider">User</span>
          </div>
        )}
      </button>

      <div className="flex-1 overflow-y-auto overflow-x-hidden pt-2 scrollbar-hide flex flex-col gap-6" onClick={() => setActiveMenuDocId(null)}>
        
        {/* Universal Actions */}
        <div className="flex flex-col gap-0.5 px-3">
          <Link
            to="/dashboard"
            title="Dashboard"
            className="flex items-center gap-3 px-2 py-1.5 rounded text-[13px] text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <div className="shrink-0 flex justify-center w-5"><LayoutDashboard size={16} /></div>
            {!isCollapsed && <span className="truncate">Dashboard</span>}
          </Link>
          <Link
            to="/models"
            title="Model Library"
            className="flex items-center gap-3 px-2 py-1.5 rounded text-[13px] text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <div className="shrink-0 flex justify-center w-5"><Box size={16} /></div>
            {!isCollapsed && <span className="truncate flex-1">Model Library</span>}
          </Link>
          <Link
            to="/logic-mapper"
            title="Logic Mapper"
            className="flex items-center gap-3 px-2 py-1.5 rounded text-[13px] text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <div className="shrink-0 flex justify-center w-5"><Network size={16} /></div>
            {!isCollapsed && <span className="truncate flex-1">Logic Mapper</span>}
          </Link>
          <Link
            to="/saved-archive"
            title="Open Saved Docs Archive"
            className="flex items-center gap-3 px-2 py-1.5 rounded text-[13px] text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <div className="shrink-0 flex justify-center w-5"><Archive size={16} /></div>
            {!isCollapsed && <span className="truncate flex-1">Saved Docs Archive</span>}
          </Link>
          <Link
            to="/tools/sign-pdf"
            title="Sign PDF"
            className="flex items-center gap-3 px-2 py-1.5 rounded text-[13px] text-blue-600 hover:bg-blue-50 font-semibold transition-colors mt-1 border border-blue-100"
          >
            <div className="shrink-0 flex justify-center w-5"><PenTool size={16} /></div>
            {!isCollapsed && <span className="truncate flex-1">Sign PDF</span>}
          </Link>
          <button 
            onClick={handleOpenSearch}
            title="Search" 
            className="flex items-center gap-3 px-2 py-1.5 rounded text-[13px] text-gray-600 hover:bg-gray-100 w-full text-left transition-colors"
          >
            <div className="shrink-0 flex justify-center w-5"><Search size={16} /></div>
            {!isCollapsed && <span className="truncate">Quick Find</span>}
          </button>
          <button 
            onClick={handleCreateNewPage}
            title="New page" 
            className="flex items-center gap-3 px-2 py-1.5 rounded text-[13px] text-gray-600 hover:bg-gray-100 w-full text-left transition-colors font-medium border border-transparent hover:border-[#EAE6DF]"
          >
            <div className="shrink-0 flex justify-center w-5"><Plus size={16} /></div>
            {!isCollapsed && <span className="truncate text-[#D4AF37]">New page</span>}
          </button>
        </div>

        {/* Pinned Section */}
        <div className="px-3">
            {!isCollapsed && <h3 className="px-2 text-[11px] font-bold tracking-wider text-gray-400 mb-1 uppercase">Pinned</h3>}
            {isLoading ? (
              !isCollapsed && <div className="px-2 py-1.5 text-xs text-gray-400 animate-pulse">Loading...</div>
            ) : pinnedDocs.length === 0 ? (
              !isCollapsed && (
               <div className="px-2 py-3 text-[12px] text-gray-400 text-center border-2 border-dashed border-[#EAE6DF] rounded-md mt-1 italic">
                 Pin your important docs.
               </div>
              )
            ) : (
              <div className="flex flex-col gap-0.5">
                {pinnedDocs.map((doc, i) => (
                  <div key={doc.id || `pinned-${i}`}>
                    {renderDocumentItem(doc, <Pin size={14} className={location.pathname === `/doc/${doc.id}` ? "text-[#D4AF37]" : "text-gray-400"} />)}
                  </div>
                ))}
              </div>
            )}
        </div>

        {/* Private Vault */}
        <div className="px-3 mb-6">
            {!isCollapsed && <h3 className="px-2 text-[11px] font-bold tracking-wider text-gray-400 mb-1 uppercase">Private Vault</h3>}
            {isLoading ? (
              !isCollapsed && <div className="px-2 py-1.5 text-xs text-gray-400 animate-pulse">Loading...</div>
            ) : regularDocs.length === 0 ? (
              !isCollapsed && (
               <div className="px-2 py-3 text-[12px] text-gray-400 text-center border-2 border-dashed border-[#EAE6DF] rounded-md mt-1">
                 No documents found.
               </div>
              )
            ) : (
              <div className="flex flex-col gap-0.5">
                {regularDocs.map((doc, i) => (
                  <div key={doc.id || `regular-${i}`}>
                    {renderDocumentItem(doc, <FileText size={14} />)}
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className={"border-t border-[#EAE6DF] bg-white/50 backdrop-blur-sm"}>
        <div className="flex flex-col gap-0.5 px-3 py-4">
          <Link to="/preferences" title="Preferences" className="flex items-center gap-3 px-2 py-1.5 rounded text-[13px] text-gray-500 hover:text-gray-900 transition-colors">
            <div className="shrink-0 flex justify-center w-5"><Settings size={16} /></div>
            {!isCollapsed && <span className="truncate">Preferences</span>}
          </Link>
          <Link to="/trash" title="Trash" className="flex items-center gap-3 px-2 py-1.5 rounded text-[13px] text-gray-500 hover:text-gray-900 transition-colors">
            <div className="shrink-0 flex justify-center w-5"><Trash2 size={16} /></div>
            {!isCollapsed && <span className="truncate">Trash</span>}
          </Link>
          <button 
            onClick={logout}
            title="Log Out"
            className="flex items-center gap-3 px-2 py-1.5 rounded text-[13px] text-gray-500 hover:text-red-600 transition-colors mt-2"
          >
            <div className="shrink-0 flex justify-center w-5"><LogOut size={16} /></div>
            {!isCollapsed && <span>Log Out</span>}
          </button>
        </div>
      </div>
    </motion.div>

      <AnimatePresence>
        {isSearchModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
               onClick={() => setIsSearchModalOpen(false)}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col"
            >
              <div className="flex items-center border-b border-gray-100 px-4 py-3">
                <Search className="w-5 h-5 text-gray-400 mr-3" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Find documents..."
                  className="flex-1 bg-transparent border-none outline-none text-gray-800 placeholder-gray-400 font-medium"
                  autoFocus
                />
                <button onClick={() => setIsSearchModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-100 px-2 py-1 rounded text-xs ml-2">ESC</button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto">
                {isSearching ? (
                  <div className="p-8 text-center text-gray-400">Searching...</div>
                ) : searchResults.length > 0 ? (
                  <div className="p-2 space-y-1">
                    {searchResults.map(res => (
                      <div 
                        key={res.id} 
                        onClick={() => {
                          navigate(`/doc/${res.id}`);
                          setIsSearchModalOpen(false);
                        }}
                        className="p-3 hover:bg-indigo-50 rounded-lg cursor-pointer transition-colors group"
                      >
                        <h4 className="font-semibold text-gray-900 group-hover:text-indigo-700">{res.title}</h4>
                        {res.content && (
                          <p className="text-xs text-gray-500 line-clamp-2 mt-1">{res.content}</p>
                        )}
                        {res.tags && (
                          <p className="text-[10px] text-indigo-400 uppercase tracking-wider mt-2 font-bold">{res.tags}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : searchQuery ? (
                   <div className="p-8 text-center text-gray-500">No results found for "{searchQuery}"</div>
                ) : (
                  <div className="p-8 text-center text-gray-400 text-sm">Start typing to search your documents...</div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
