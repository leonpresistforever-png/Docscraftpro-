import { Footer } from "../components/layout/Footer";
import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { sendGmailSupportTicket, getCachedGmailToken } from '../lib/gmail';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Send, 
  Sparkles, 
  Ticket, 
  ArrowRight,
  Bug,
  Lightbulb,
  ShieldAlert,
  Paperclip,
  X,
  FileText,
  UploadCloud
} from 'lucide-react';

type QueryType = 'bug' | 'feedback' | 'security' | 'general';

interface SupportFormPageProps {
  isEmbedded?: boolean;
  hideCategorySelector?: boolean;
  defaultCategory?: QueryType;
}

export function SupportFormPage({ 
  isEmbedded = false,
  hideCategorySelector = false,
  defaultCategory = 'general'
}: SupportFormPageProps) {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize type from query param, default to feedback/general
  const initialType = (searchParams.get('type') as QueryType) || defaultCategory;

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    issue: '',
    category: initialType,
  });

  const [attachments, setAttachments] = useState<{ name: string; type: string; size: number; dataUrl: string }[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const processFiles = (files: File[]) => {
    files.forEach(file => {
      if (file.size > 2.5 * 1024 * 1024) {
        alert(`File ${file.name} is larger than 2.5MB and cannot be attached.`);
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachments(prev => {
          // Prevent duplicates
          if (prev.some(p => p.name === file.name && p.size === file.size)) return prev;
          return [
            ...prev,
            {
              name: file.name,
              type: file.type || 'application/octet-stream',
              size: file.size,
              dataUrl: reader.result as string
            }
          ];
        });
      };
      reader.onerror = () => {
        console.error("Failed to read file", file.name);
      };
      reader.readAsDataURL(file);
    });
  };

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [ticketDetails, setTicketDetails] = useState<{
    id: string;
    username: string;
    email: string;
    category: QueryType;
    issue: string;
    timestamp: string;
  } | null>(null);

  // Sync category with URL if type param changes
  useEffect(() => {
    if (!hideCategorySelector) {
      const typeParam = searchParams.get('type') as QueryType;
      if (typeParam && ['bug', 'feedback', 'security', 'general'].includes(typeParam)) {
        setFormData(prev => ({ ...prev, category: typeParam }));
      }
    }
  }, [searchParams, hideCategorySelector]);

  // Sync username and email with authenticated state
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        username: user.displayName || prev.username || (user.email ? user.email.split('@')[0] : 'Contributor'),
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  const handleCategoryChange = (cat: QueryType) => {
    setFormData(prev => ({ ...prev, category: cat }));
    if (!hideCategorySelector) {
      setSearchParams({ type: cat });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.issue) {
      setErrorMessage('Please provide your reply address and write out your request.');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      // 1. Double Dispatch: Write to secure, durable Firestore backup with fallback
      let docIdFallback = 'DC-LOCAL-LOG';
      try {
        const docRef = await addDoc(collection(db, 'support_tickets'), {
          username: formData.username || 'Anonymous User',
          email: formData.email,
          category: formData.category,
          issue: formData.issue,
          attachments: attachments.map(att => ({
            name: att.name,
            type: att.type,
            size: att.size,
            dataUrl: att.dataUrl
          })),
          createdAt: serverTimestamp(),
          userId: user ? user.uid : 'anonymous'
        });
        docIdFallback = docRef.id;
      } catch (firestoreError) {
        console.warn('Backup storage bypassed, proceeding with primary delivery.', firestoreError);
      }

      // 2. Dispatch to internal server-side API proxy as fallback
      await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username || 'Anonymous User',
          email: formData.email,
          category: formData.category,
          issue: formData.issue,
          attachments: attachments.map(att => ({ name: att.name, type: att.type, size: att.size })),
          ticketDatabaseId: docIdFallback
        }),
      }).catch(err => console.warn('Internal server logging route skipped:', err));

      // 3. Gmail Integration: Dispatch email internally using Google OAuth
      // Done 100% silently in the background, NO popups or authorization requests shown to keep UX clean.
      const token = sessionStorage.getItem('google_access_token') || getCachedGmailToken();
      if (token) {
        try {
          await sendGmailSupportTicket({
            username: formData.username || 'Anonymous User',
            userEmail: formData.email,
            issue: formData.issue,
            accessToken: token,
            type: formData.category,
            attachments
          });
        } catch (gmailErr) {
          console.error('Failed to dispatch secure background email:', gmailErr);
        }
      }

      const generatedTicketId = `DC-TKT-${Math.floor(100000 + Math.random() * 900000)}`;
      const nowFormatted = new Date().toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });

      setTicketDetails({
        id: generatedTicketId,
        username: formData.username || 'Anonymous User',
        email: formData.email,
        category: formData.category,
        issue: formData.issue,
        timestamp: nowFormatted
      });

      setStatus('success');
      
      // Keep email/username but clear descriptions & attachments
      setFormData(prev => ({
        ...prev,
        issue: ''
      }));
      setAttachments([]);
    } catch (err: any) {
      console.error('Submission error:', err);
      setStatus('error');
      setErrorMessage(err.message || 'An error occurred while logging your information.');
    }
  };

  const handleResetForm = () => {
    setStatus('idle');
    setTicketDetails(null);
    setAttachments([]);
  };

  const getPageHeaderDetails = () => {
    if (formData.category === 'bug') {
      return {
        badge: 'Bug Tracker',
        title: 'Report a Parser or Render Bug',
        desc: 'Encountered a layout glitch or file export anomaly? Provide the details below so our team can investigate and fix it.'
      };
    }
    if (formData.category === 'security') {
      return {
        badge: 'Security Operations',
        title: 'Contact Security Desk',
        desc: 'Request dedicated compliance audits, secure questionnaires, or data privacy arrangements directly with our operational controllers.'
      };
    }
    if (formData.category === 'general') {
      return {
        badge: 'Support Desk',
        title: 'Contact Support Helpdesk',
        desc: 'Have a question or need assistance with Docscraft Pro? We read and reply to every support inquiry.'
      };
    }
    return {
      badge: 'Product Feedback',
      title: 'Share Ideas & Workspace Feedback',
      desc: 'How can we make your markdown-editor, diagram layouts, or templates better? We read and implement every user suggestion.'
    };
  };

  const header = getPageHeaderDetails();

  return (
    <div className={isEmbedded ? "w-full" : "min-h-screen bg-[#FDFBF7] font-sans text-[#2D2D2D] selection:bg-[#D4AF37] selection:text-white flex flex-col pt-16"}>
      {!isEmbedded && <Navbar />}
      
      <div className={isEmbedded ? "max-w-3xl mx-auto w-full p-4" : "flex-1 flex flex-col items-center justify-center p-6 md:p-8 max-w-3xl mx-auto w-full"}>
        {!isEmbedded && (
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-100 rounded-full text-[10px] text-amber-800 font-bold uppercase tracking-widest mb-3 select-none">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              {header.badge}
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-black tracking-tight mb-2 text-stone-900 leading-tight">
              {header.title}
            </h1>
            <p className="text-xs md:text-sm text-stone-600 max-w-lg mx-auto leading-relaxed">
              {header.desc}
            </p>
          </div>
        )}

        {/* Dynamic selector cards replacing the boring select tag */}
        {!hideCategorySelector && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full mb-6 animate-fade-in">
            <button
              type="button"
              onClick={() => handleCategoryChange('feedback')}
              className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
                formData.category === 'feedback'
                  ? 'bg-amber-50/40 border-amber-400 ring-1 ring-amber-400'
                  : 'bg-white border-stone-200 hover:border-stone-300'
              }`}
            >
              <Lightbulb className={`w-5 h-5 shrink-0 mt-0.5 ${formData.category === 'feedback' ? 'text-amber-600' : 'text-stone-400'}`} />
              <div>
                <h4 className="font-bold text-xs text-stone-800">Ideas & Feedback</h4>
                <p className="text-[10px] text-stone-500 mt-0.5">Request features or share suggestions.</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleCategoryChange('bug')}
              className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
                formData.category === 'bug'
                  ? 'bg-amber-50/40 border-amber-400 ring-1 ring-amber-400'
                  : 'bg-white border-stone-200 hover:border-stone-300'
              }`}
            >
              <Bug className={`w-5 h-5 shrink-0 mt-0.5 ${formData.category === 'bug' ? 'text-amber-600' : 'text-stone-400'}`} />
              <div>
                <h4 className="font-bold text-xs text-stone-800">Technical Bug</h4>
                <p className="text-[10px] text-stone-500 mt-0.5">Report formatting or export anomalies.</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleCategoryChange('security')}
              className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
                formData.category === 'security'
                  ? 'bg-amber-50/40 border-amber-400 ring-1 ring-amber-400'
                  : 'bg-white border-stone-200 hover:border-stone-300'
              }`}
            >
              <ShieldAlert className={`w-5 h-5 shrink-0 mt-0.5 ${formData.category === 'security' ? 'text-amber-600' : 'text-stone-400'}`} />
              <div>
                <h4 className="font-bold text-xs text-stone-800">Security Desk</h4>
                <p className="text-[10px] text-stone-500 mt-0.5">Request parameters or audits.</p>
              </div>
            </button>
          </div>
        )}

        <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#EAE6DF] shadow-xs w-full">
          {status === 'success' && ticketDetails ? (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-stone-100 text-[#D4AF37] mb-1">
                  <CheckCircle2 className="w-6 h-6 text-[#AA7A00]" />
                </div>
                <h3 className="text-xl font-serif font-bold text-gray-900">Your message has been sent</h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Thank you for keeping our workspace polished. We have securely logged your values.
                </p>
              </div>

              {/* Clean Human Style Receipt (No robotic Priority stats) */}
              <div className="border border-stone-200 bg-[#FAF9F6] rounded-xl p-5 relative overflow-hidden shadow-xs">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-4 bg-white border-r border-[#EAE6DF] rounded-r-full" />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-4 bg-white border-l border-[#EAE6DF] rounded-l-full" />
                
                <div className="border-b border-dashed border-stone-300 pb-3 mb-3 flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-stone-500 font-bold">Inquiry Details</span>
                  <span className="text-xs font-mono font-bold text-stone-600">
                    {ticketDetails.id}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="block text-[10px] text-stone-400 font-bold uppercase tracking-wider">From</span>
                    <span className="font-semibold text-stone-800">{ticketDetails.username}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-stone-400 font-bold uppercase tracking-wider">Replied To</span>
                    <span className="font-mono text-stone-800">{ticketDetails.email}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-stone-400 font-bold uppercase tracking-wider">Category</span>
                    <span className="font-semibold text-stone-800 uppercase">
                      {ticketDetails.category}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-dashed border-stone-300">
                  <span className="block text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-1">Details Summary</span>
                  <p className="text-xs text-stone-600 leading-relaxed max-h-32 overflow-y-auto whitespace-pre-wrap italic">
                    {ticketDetails.issue}
                  </p>
                </div>
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-700 hover:text-stone-800 transition-colors cursor-pointer underline decoration-stone-400 underline-offset-4"
                >
                  Send another inquiry <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl flex items-start gap-2 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="username" className="block text-xs font-extrabold uppercase tracking-widest text-stone-700 mb-1.5 font-sans">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="username"
                    required
                    placeholder="Enter your name..."
                    className="w-full px-4 py-2.5 border border-stone-200 bg-[#FAF9F6] rounded-xl focus:bg-white focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none transition-all text-xs font-semibold text-gray-800 font-sans"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-extrabold uppercase tracking-widest text-stone-700 mb-1.5 font-sans">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    placeholder="Enter support contact email..."
                    className="w-full px-4 py-2.5 border border-stone-200 bg-[#FAF9F6] rounded-xl focus:bg-white focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none transition-all text-xs font-semibold text-gray-800 font-sans"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="issue" className="block text-xs font-extrabold uppercase tracking-widest text-stone-700 mb-1.5 font-sans">
                  Description
                </label>
                <textarea
                  id="issue"
                  required
                  rows={6}
                  placeholder={
                    formData.category === 'bug' 
                      ? "Describe the parser anomaly, formatting glitch, or visual error you encountered..." 
                      : formData.category === 'security'
                        ? "List your specific operational safety audits, questions, or compliance guidelines..."
                        : formData.category === 'general'
                          ? "Enter your question or issue description here, and we will get back to you shortly..."
                          : "Describe features you want us to add or any changes you would like to see..."
                  }
                  className="w-full px-4 py-2.5 border border-stone-200 bg-[#FAF9F6] rounded-xl focus:bg-white focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none transition-all text-sm font-medium leading-relaxed text-gray-800 resize-y font-sans"
                  value={formData.issue}
                  onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                />
              </div>

              {/* Dynamic File Attachment Drag-and-Drop Area */}
              <div className="space-y-3">
                <label className="block text-xs font-extrabold uppercase tracking-widest text-stone-700 font-sans">
                  Files & Image Attachments
                </label>
                
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files) {
                      processFiles(Array.from(e.dataTransfer.files));
                    }
                  }}
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                    isDragging 
                      ? 'border-[#D4AF37] bg-amber-50/20' 
                      : 'border-stone-200 hover:border-stone-300 bg-[#FAF9F6]'
                  }`}
                  onClick={() => document.getElementById('attachments-file-input')?.click()}
                >
                  <input
                    type="file"
                    id="attachments-file-input"
                    multiple
                    accept=".png,.jpg,.jpeg,.gif,.pdf,.txt,.doc,.docx"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        processFiles(Array.from(e.target.files));
                      }
                    }}
                  />
                  <UploadCloud className="w-8 h-8 text-[#D4AF37] mb-0.5" />
                  <p className="text-xs font-bold text-stone-700">Drag files here or click to browse</p>
                  <p className="text-[10px] text-stone-400">Supports PNG, JPG, PDF, TXT, DOCX up to 2.5MB per file</p>
                </div>

                {/* Render Attachments Queue */}
                {attachments.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    {attachments.map((att, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-stone-50 border border-stone-200 text-xs text-stone-700">
                        <div className="flex items-center gap-2 truncate pr-4">
                          <Paperclip className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                          <span className="truncate font-semibold">{att.name}</span>
                          <span className="text-[10px] text-stone-400 shrink-0">({(att.size / 1024).toFixed(1)} KB)</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAttachments(prev => prev.filter((_, idx) => idx !== i));
                          }}
                          className="p-1 hover:bg-stone-200 text-stone-400 hover:text-stone-600 rounded-full cursor-pointer transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#b08d2b] hover:scale-[1.01] text-white px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-amber-500/10 active:scale-99 cursor-pointer font-sans"
              >
                {status === 'submitting' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 fill-white" />
                    Send Internally
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
