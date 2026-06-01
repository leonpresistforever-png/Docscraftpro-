import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { 
  Settings, User, Shield, CreditCard, Zap, 
  Download, Moon, Sun, Palette, Globe, 
  Key, Database, BarChart3, ChevronRight 
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';

export function PreferencesPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('appearance');
  const [isExporting, setIsExporting] = useState(false);

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: <Palette className="w-4 h-4" /> },
    { id: 'account', label: 'Account & Security', icon: <User className="w-4 h-4" /> },
    { id: 'data', label: 'Data & Export', icon: <Database className="w-4 h-4" /> },
  ];

  const handleExportZIP = async () => {
      if (!user) return;
      setIsExporting(true);
      try {
        const q = query(collection(db, 'documents'), where('ownerId', '==', user.uid));
        const snapshot = await getDocs(q);
        const zip = new JSZip();
        
        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            let content = data.content || '';
            const fileContent = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
            const fileName = `${data.title || 'Untitled'}_${docSnap.id}.json`;
            zip.file(fileName, fileContent);
        });

        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, 'workspace_export.zip');
      } catch (err) {
        console.error(err);
      } finally {
        setIsExporting(false);
      }
  };

  const handleExportJSON = async () => {
      if (!user) return;
      setIsExporting(true);
      try {
        const q = query(collection(db, 'documents'), where('ownerId', '==', user.uid));
        const snapshot = await getDocs(q);
        const allData = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));

        const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
        saveAs(blob, 'workspace_snapshot.json');
      } catch (err) {
        console.error(err);
      } finally {
        setIsExporting(false);
      }
  };

  const handleExportPDF = async () => {
      if (!user) return;
      setIsExporting(true);
      try {
        const q = query(collection(db, 'documents'), where('ownerId', '==', user.uid));
        const snapshot = await getDocs(q);
        const doc = new jsPDF();
        let yOffset = 20;

        doc.setFontSize(20);
        doc.text("DocCraft Workspace Export", 20, yOffset);
        yOffset += 15;

        let index = 0;
        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const title = data.title || 'Untitled';
            
            if (index > 0) doc.addPage();
            yOffset = 20;
            
            doc.setFontSize(16);
            doc.text(title, 20, yOffset);
            yOffset += 10;
            
            doc.setFontSize(10);
            let contentText = "";
            let parsed = data.content;
            if (typeof parsed === 'string') {
               // Try to strip html simply
               contentText = parsed.replace(/<[^>]*>?/gm, '');
            } else if (parsed && parsed.content) {
               // roughly extract text from PM schema
               contentText = JSON.stringify(parsed);
               // Very crude text representation
            }
            
            const lines = doc.splitTextToSize(contentText.substring(0, 5000) + (contentText.length > 5000 ? '...' : ''), 170);
            doc.text(lines, 20, yOffset);
            
            index++;
        });

        doc.save('workspace_export.pdf');
      } catch (err) {
        console.error(err);
      } finally {
        setIsExporting(false);
      }
  };

  return (
    <div className="flex h-screen bg-dc-bg-page font-sans text-dc-text">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto p-8 md:p-12 lg:p-16">
        <div className="max-w-4xl mx-auto">
          <header className="mb-12">
            <h1 className="text-3xl font-bold font-serif mb-2">Workspace Preferences</h1>
            <p className="text-gray-500">Manage your account, appearance, and AI configuration.</p>
          </header>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Nav Tabs */}
            <nav className="w-full md:w-64 shrink-0 flex flex-col gap-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id 
                    ? 'bg-white shadow-sm text-dc-gold border border-dc-border' 
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  {activeTab === tab.id && <ChevronRight className="ml-auto w-4 h-4 opacity-50" />}
                </button>
              ))}
            </nav>

            {/* Content Area */}
            <div className="flex-1 space-y-6">
              
              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-dc-border p-8 shadow-sm space-y-8">
                  <div>
                    <h2 className="text-lg font-bold mb-4">Theme Settings</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <button className="flex flex-col items-center gap-3 p-4 rounded-xl border-2 border-dc-gold bg-yellow-50/50">
                        <div className="w-full aspect-video bg-white rounded-lg border border-gray-200 shadow-sm flex items-center justify-center">
                          <Sun className="w-8 h-8 text-dc-gold" />
                        </div>
                        <span className="text-sm font-bold">Light Mode</span>
                      </button>
                      <button className="flex flex-col items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-gray-300">
                        <div className="w-full aspect-video bg-gray-900 rounded-lg shadow-sm flex items-center justify-center">
                          <Moon className="w-8 h-8 text-gray-500" />
                        </div>
                        <span className="text-sm font-medium text-gray-500">Dark Mode (Coming Soon)</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-bold mb-4">Accent Color</h2>
                    <div className="flex flex-wrap gap-4">
                      {['#D4AF37', '#3B82F6', '#10B981', '#EC4899', '#8B5CF6', '#1A1A1A'].map(color => (
                        <button 
                          key={color}
                          className="w-10 h-10 rounded-full border-2 border-white shadow-sm ring-2 ring-transparent hover:ring-gray-200 transition-all"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Account Tab */}
              {activeTab === 'account' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-dc-border p-8 shadow-sm space-y-8">
                  <div>
                    <h2 className="text-lg font-bold mb-4">Account Details</h2>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                        <User className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="font-bold">{user?.email}</p>
                        <p className="text-sm text-gray-500">Free Tier Account</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100">
                    <h2 className="text-lg font-bold mb-2 text-red-600">Danger Zone</h2>
                    <p className="text-sm text-gray-500 mb-6">Irreversible and destructive actions.</p>
                    
                    <div className="space-y-4">
                      <button 
                        className="flex items-center gap-3 w-full p-4 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors text-left"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete all permanent sessions and local data? This cannot be undone.')) {
                            localStorage.clear();
                            sessionStorage.clear();
                            window.location.reload();
                          }
                        }}
                      >
                        <Shield className="w-5 h-5 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-sm">Delete Permanent Session</p>
                          <p className="text-xs text-red-500 opacity-80">Clears all local storage, preferences, and permanent sessions on this device.</p>
                        </div>
                      </button>
                      <button 
                        className="flex items-center gap-3 w-full p-4 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors text-left"
                        onClick={() => {
                          alert('Please contact support to completely delete your account from servers.');
                        }}
                      >
                        <User className="w-5 h-5 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-sm">Delete Account</p>
                          <p className="text-xs text-red-500 opacity-80">Permanently delete your account and cloud data.</p>
                        </div>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Data Tab */}
              {activeTab === 'data' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-dc-border p-8 shadow-sm space-y-8">
                  <div>
                    <h2 className="text-lg font-bold mb-2">Bulk Export & Backup</h2>
                    <p className="text-sm text-gray-500 mb-6">Archive your entire workspace or individual collections.</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button onClick={handleExportZIP} disabled={isExporting} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-dc-gold hover:bg-yellow-50 transition-all text-left disabled:opacity-50">
                        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                           <Download className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold">Workspace ZIP</p>
                          <p className="text-[10px] text-gray-500">All docs as Markdown/JSON</p>
                        </div>
                      </button>
                      <button onClick={handleExportPDF} disabled={isExporting} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-dc-gold hover:bg-yellow-50 transition-all text-left disabled:opacity-50">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                           <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold">Consolidated PDF</p>
                          <p className="text-[10px] text-gray-500">Merge all into one book</p>
                        </div>
                      </button>
                      <button onClick={handleExportJSON} disabled={isExporting} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-dc-gold hover:bg-yellow-50 transition-all text-left disabled:opacity-50">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                           <Database className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold">JSON Snapshot</p>
                          <p className="text-[10px] text-gray-500">Portability for other apps</p>
                        </div>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function FileText({ className }: { className?: string }) {
  return (
     <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
  );
}
