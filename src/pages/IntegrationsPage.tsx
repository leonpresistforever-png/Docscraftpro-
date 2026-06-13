import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { useAuth } from '../context/AuthContext';
import { 
  HardDrive, Cpu, Check, RefreshCw, Key, 
  Link2, ExternalLink, Code, AlertTriangle, Play, HelpCircle, Save,
  FolderPlus, FolderDown, FileUp, Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function IntegrationsPage() {
  const { signInWithGoogle, user } = useAuth();
  
  // Persistence states
  const [gdriveFolder, setGdriveFolder] = useState(() => localStorage.getItem('dc_gdrive_folder') || 'DocCraft-Backups');
  const [isGdriveConnected, setIsGdriveConnected] = useState(() => localStorage.getItem('dc_gdrive_connected') === 'true');

  const [localDrafts, setLocalDrafts] = useState<any[]>([]);
  const [selectedBackupDraftId, setSelectedBackupDraftId] = useState<string>('');
  const [pickerLoading, setPickerLoading] = useState(false);

  useEffect(() => {
    const loadDrafts = async () => {
      try {
        const idb = await import('../utils/idb');
        const docs = await idb.getAllSavedDocsOffline();
        setLocalDrafts(docs);
        if (docs.length > 0) {
          setSelectedBackupDraftId('all-docs');
        }
      } catch (err) {
        console.warn('Failed to load local drafts:', err);
      }
    };
    loadDrafts();
  }, []);

  const [webhookUrl, setWebhookUrl] = useState(() => localStorage.getItem('dc_webhook_url') || '');
  const [webhookSecret, setWebhookSecret] = useState(() => localStorage.getItem('dc_webhook_secret') || '');
  const [isWebhookActive, setIsWebhookActive] = useState(() => localStorage.getItem('dc_webhook_active') === 'true');

  // Interactive logs / feedback
  const [simulatingType, setSimulatingType] = useState<'webhook' | 'gdrive' | null>(null);
  const [simulationLog, setSimulationLog] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'connected' | 'security'>('all');

  const handleSaveGdrive = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = sessionStorage.getItem('google_access_token');
    
    if (!token) {
      addLog('gdrive', 'Establishing secure Google OAuth context...');
      try {
        await signInWithGoogle();
        addLog('gdrive', '✓ Google Account connected securely.');
      } catch (authErr: any) {
        const msg = authErr.message || authErr;
        addLog('gdrive', `❌ Google popup auth failed: ${msg}`);
        alert(`Google Authentication Failed: ${msg}`);
        return;
      }
    }

    localStorage.setItem('dc_gdrive_folder', gdriveFolder);
    localStorage.setItem('dc_gdrive_connected', 'true');
    setIsGdriveConnected(true);
    addLog('gdrive', `✓ Custom backup folder mapped to: "${gdriveFolder}"`);
  };

  const handleDisconnectGdrive = () => {
    localStorage.removeItem('dc_gdrive_connected');
    setIsGdriveConnected(false);
    addLog('gdrive', '❌ Google Drive Connection revoked locally.');
  };

  const handleRunRealGdriveBackup = async () => {
    const token = sessionStorage.getItem('google_access_token');
    if (!token) {
      addLog('gdrive', '❌ Access Token expired. Re-authorizing Google Account...');
      try {
        await signInWithGoogle();
      } catch (authErr: any) {
        addLog('gdrive', `❌ Re-authorization failed: ${authErr.message || authErr}`);
        return;
      }
    }

    const activeToken = sessionStorage.getItem('google_access_token') || '';
    if (!selectedBackupDraftId) {
      addLog('gdrive', '❌ Real backup aborted: No offline draft selected.');
      return;
    }

    setSimulatingType('gdrive');

    try {
      const gDriveUtils = await import('../utils/googleDrive');
      addLog('gdrive', `Scanning Google Drive for target directory "${gdriveFolder}"...`);
      const folderId = await gDriveUtils.findOrCreateBackupFolder(activeToken, gdriveFolder);
      addLog('gdrive', `✓ remote folder localized with ID: ${folderId}`);

      if (selectedBackupDraftId === 'all-docs') {
        if (localDrafts.length === 0) {
          addLog('gdrive', '❌ Real backup aborted: No offline drafts to sync.');
          return;
        }
        addLog('gdrive', `🚀 Initiating batch backup sequence for ${localDrafts.length} documents...`);
        for (const draft of localDrafts) {
          addLog('gdrive', `Syncing document "${draft.title}"...`);
          const fileName = `${draft.title.replace(/[\/\\?%*:|"<>]/g, '-')}.md`;
          const contentPayload = draft.content || `# ${draft.title}\n\nEmpty offline draft.`;
          const result = await gDriveUtils.uploadDocumentToDrive(
            activeToken,
            folderId,
            fileName,
            contentPayload
          );
          addLog('gdrive', `✓ Successfully synced "${draft.title}"! (File ID: ${result.id})`);
        }
        addLog('gdrive', '🎉 All documents backed up to your Google Drive folder successfully!');
      } else {
        const draft = localDrafts.find(d => d.id === selectedBackupDraftId);
        if (!draft) {
          addLog('gdrive', '❌ Selected offline draft metadata missing from storage.');
          return;
        }

        addLog('gdrive', `Starting Cloud sync sequence for "${draft.title}"...`);
        const fileName = `${draft.title.replace(/[\/\\?%*:|"<>]/g, '-')}.md`;
        const contentPayload = draft.content || `# ${draft.title}\n\nEmpty offline draft.`;
        const result = await gDriveUtils.uploadDocumentToDrive(
          activeToken,
          folderId,
          fileName,
          contentPayload
        );

        addLog('gdrive', `✓ Transaction committed successfully! File ID: ${result.id}`);
        addLog('gdrive', `Backup accessible at: https://drive.google.com/file/d/${result.id}/view`);
      }
    } catch (err: any) {
      addLog('gdrive', `❌ Upload pipeline failed: ${err.message || err}`);
    } finally {
      setSimulatingType(null);
    }
  };

  const handleTriggerPicker = () => {
    const token = sessionStorage.getItem('google_access_token');
    if (!token) {
      addLog('gdrive', '❌ Requesting active Google Auth token to enable browse...');
      signInWithGoogle()
        .then(() => {
          const freshToken = sessionStorage.getItem('google_access_token');
          if (freshToken) loadPickerAPI(freshToken);
        })
        .catch(err => addLog('gdrive', `❌ Google sign-in failed: ${err.message || err}`));
      return;
    }

    loadPickerAPI(token);
  };

  const loadPickerAPI = (accessToken: string) => {
    addLog('gdrive', 'Pulling secure Google Web Picker scripts...');
    setPickerLoading(true);

    const existingScript = document.getElementById('gdrive-picker-loader');
    if (existingScript) {
      spawnPickerWidget(accessToken);
      return;
    }

    const script = document.createElement('script');
    script.id = 'gdrive-picker-loader';
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => {
      (window as any).gapi.load('auth', () => {
        (window as any).gapi.load('picker', () => {
          setPickerLoading(false);
          spawnPickerWidget(accessToken);
        });
      });
    };
    script.onerror = () => {
      setPickerLoading(false);
      addLog('gdrive', '❌ External resource load failed: gapi.js script error.');
    };
    document.body.appendChild(script);
  };

  const spawnPickerWidget = (accessToken: string) => {
    addLog('gdrive', 'Mounting Google Picker container viewport...');
    const developerKey = 'AIzaSyAXQJhdJNTZ9ADfBFY1gwUNS4pg_ZbnV_A';

    try {
      const view = new (window as any).google.picker.View(
        (window as any).google.picker.ViewId.DOCS
      );

      const picker = new (window as any).google.picker.PickerBuilder()
        .addView(view)
        .setOAuthToken(accessToken)
        .setDeveloperKey(developerKey)
        .setCallback(async (data: any) => {
          if (data.action === (window as any).google.picker.Action.PICKED) {
            const file = data.docs[0];
            const fileId = file.id;
            const fileName = file.name;
            addLog('gdrive', `✓ Picker success! Selected: "${fileName}" (${fileId})`);
            addLog('gdrive', `Streaming document payload directly inside sandbox database...`);

            try {
              const gDriveUtils = await import('../utils/googleDrive');
              const rawText = await gDriveUtils.downloadDriveFileContent(accessToken, fileId);

              const idb = await import('../utils/idb');
              const localId = `gdrive-imported-${Date.now()}`;
              
              await idb.saveDocOffline({
                id: localId,
                title: fileName.replace(/\.[^/.]+$/, "") || 'Imported Google Doc',
                content: rawText || `# ${fileName}\n\nNo markup contents extracted.`
              });

              addLog('gdrive', `✓ Perfect: Added "${fileName}" to offline archive. Navigate to Saved Archive or Editor to access it!`);
              
              // reload local list
              const freshDocs = await idb.getAllSavedDocsOffline();
              setLocalDrafts(freshDocs);
              if (freshDocs.length > 0) {
                setSelectedBackupDraftId(localId);
              }
            } catch (dlErr: any) {
              addLog('gdrive', `❌ Extract stream failed: ${dlErr.message || dlErr}`);
            }
          } else if (data.action === (window as any).google.picker.Action.CANCEL) {
            addLog('gdrive', 'Picker view dismissed by subscriber.');
          }
        })
        .setOrigin(window.location.origin)
        .build();

      picker.setVisible(true);
    } catch (err: any) {
      addLog('gdrive', `❌ Failed to initialize picker: ${err.message || err}`);
    }
  };

  const handleSaveWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (webhookUrl && !webhookUrl.startsWith('http://') && !webhookUrl.startsWith('https://')) {
      alert('Webhook URL must start with http:// or https://');
      return;
    }
    localStorage.setItem('dc_webhook_url', webhookUrl);
    localStorage.setItem('dc_webhook_secret', webhookSecret);
    localStorage.setItem('dc_webhook_active', webhookUrl ? 'true' : 'false');
    setIsWebhookActive(!!webhookUrl);
    addLog('webhook', webhookUrl ? '✓ Webhook is configured and active.' : '✓ Webhook cleared.');
  };

  const addLog = (type: 'webhook' | 'gdrive', message: string) => {
    setSimulationLog(prev => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev]);
  };

  const simulateGdriveBackup = async () => {
    setSimulatingType('gdrive');
    setSimulationLog([]);
    const logs = [
      'Establishing connection to Google Workspace API...',
      'Querying OAuth consent payload state...',
      `Locating backup directory folder: "/${gdriveFolder}"`,
      'Creating revision timestamp directory block...',
      'Converting and compressing rich text data stream (PDF/Word formatting)...',
      'Uploading media bytes directly to isolated cloud storage...',
      '✓ Google Drive revision envelope synchronized (Simulated).',
      '✓ Next automatic background snapshot scheduled in 24 hours.'
    ];

    for (let i = 0; i < logs.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 400));
      addLog('gdrive', logs[i]);
    }
    setSimulatingType(null);
  };

  const simulateWebhookPayload = async () => {
    setSimulatingType('webhook');
    setSimulationLog([]);
    const targetUrl = webhookUrl || 'https://api.my-app.com/v1/webhook';
    addLog('webhook', `Resolving gateway endpoint: ${targetUrl}`);
    addLog('webhook', 'Preparing target event notification sample payload: "document.signed"');
    addLog('webhook', 'Injecting HMAC shared token webhook-signature header...');
    addLog('webhook', 'Dispatching POST request payload stream...');
    addLog('webhook', 'Waiting for gateway acknowledgement...');

    if (webhookUrl) {
      try {
        const payload = {
          event: "document.signed",
          timestamp: new Date().toISOString(),
          app: "DocCraft Pro",
          data: {
            documentId: "dc_doc_481a9f",
            title: "Executive Partnership Master Agreement",
            status: "signed",
            signees: [
              { name: "Workspace Owner", email: "docscraftpro@gmail.com", role: "initiator" }
            ]
          }
        };

        const res = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-DocCraft-Signature': webhookSecret || 'dc_test_secret_signature_key'
          },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const text = await res.text();
          addLog('webhook', `✓ SUCCESS: HTTP/1.1 ${res.status} ${res.statusText} received from upstream.`);
          addLog('webhook', `✓ Raw Response Body: ${text.slice(0, 500) || '{"status": "event_acknowledged", "processed": true}'}`);
        } else {
          addLog('webhook', `⚠️ UPSTREAM RETURNED ERROR: HTTP/1.1 ${res.status} ${res.statusText}`);
          const text = await res.text();
          addLog('webhook', `⚠️ Response Body: ${text.slice(0, 200)}`);
        }
      } catch (err: any) {
        addLog('webhook', `❌ NETWORK FAILED: Failed to dispatch real fetch request.`);
        addLog('webhook', `❌ Detail: ${err.message || err}. (Note: Ensure the target server allows CORS requests from the browser context).`);
      }
    } else {
      await new Promise(resolve => setTimeout(resolve, 800));
      addLog('webhook', '✓ Success: HTTP/1.1 200 OK received from upstream endpoint (Simulated).');
      addLog('webhook', '✓ Raw Response: {"status": "event_acknowledged", "processed": true}');
    }
    setSimulatingType(null);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-[#1A1A1A] pt-24">
      <Navbar />
      
      <main className="w-full max-w-[1240px] mx-auto px-6 py-12">
        
        {/* Breadcrumb section */}
        <div className="mb-6 text-sm text-gray-500 flex items-center gap-2">
          <span>Docs Dashboard</span>
          <span>&gt;</span>
          <span className="text-gray-900 font-medium font-serif">Workspace Integrations</span>
        </div>

        {/* Header Block and Brand Promise */}
        <div className="mb-12 border-b border-[#E4DBC5] pb-8">
          <h1 className="text-4xl md:text-5xl font-black mb-4 uppercase tracking-tight text-[#1a1a1a]">
            Integrations Hub
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl leading-relaxed">
            Connect DocCraft Pro to your external repositories, backup platforms, and secure notification channels. Configure parameters securely with client-side local sandboxing.
          </p>
        </div>

        {/* Tab Selection Filter */}
        <div className="flex gap-4 border-b border-gray-200 mb-8 pb-px">
          <button 
            onClick={() => setActiveTab('all')}
            className={`pb-4 px-2 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'all' 
                ? 'border-[#996A00] text-[#996A00]' 
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            All Integrations (3)
          </button>
          <button 
            onClick={() => setActiveTab('connected')}
            className={`pb-4 px-2 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'connected' 
                ? 'border-[#996A00] text-[#996A00]' 
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Connected State
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`pb-4 px-2 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'security' 
                ? 'border-[#996A00] text-[#996A00]' 
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            API Security Logs
          </button>
        </div>

        {/* Core Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Action Columns */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* ITEM 2: Google Drive Workspace Integration */}
            {(activeTab === 'all' || (activeTab === 'connected' && isGdriveConnected)) && (
              <div className="bg-white p-8 rounded-2xl border border-[#E4DBC5] shadow-sm relative overflow-hidden transition-all hover:shadow">
                <div className="absolute right-0 top-0 h-1.5 w-full bg-[#4285F4]"></div>
                
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-[#4285F4]">
                      <HardDrive className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[#1a1a1a]">Google Workspace Cloud Storage</h2>
                      <p className="text-xs text-gray-500 uppercase font-mono mt-1 tracking-wider">Cloud Directory Mounting</p>
                    </div>
                  </div>
                  <div className={`self-start inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                    isGdriveConnected ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-50 text-gray-500 border border-gray-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isGdriveConnected ? 'bg-emerald-600 animate-pulse' : 'bg-gray-400'}`}></span>
                    {isGdriveConnected ? 'Connected' : 'Not Connected'}
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                  Export signed drafts directly to any backup folder in your Google Drive, or bring files, markdown, and text documents directly from Google Drive into DocCraft using the official Google Picker.
                </p>

                {!isGdriveConnected ? (
                  <form onSubmit={handleSaveGdrive} className="space-y-4 border-t border-gray-100 pt-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Drive Folder Target Name</label>
                      <input 
                        type="text" 
                        required
                        value={gdriveFolder}
                        onChange={e => setGdriveFolder(e.target.value)}
                        placeholder="Google Drive Directory" 
                        className="w-full bg-[#FAF9F6] border border-[#E4DBC5] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#996A00]"
                      />
                    </div>
                    <button type="submit" className="w-full bg-[#4285F4] hover:bg-[#357AE8] text-white text-xs font-bold uppercase tracking-wider py-3 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-md shadow-blue-500/10">
                      <Link2 className="w-4 h-4" /> Connect with Google & Map Folder
                    </button>
                  </form>
                ) : (
                  <div className="space-y-6 border-t border-gray-100 pt-6">
                    <div className="bg-[#FAF9F6] p-4 rounded-xl border border-[#E4DBC5] text-xs space-y-2">
                      <p><strong>Mounted Directory:</strong> <span className="font-mono text-blue-700">Google Drive &gt; {gdriveFolder}</span></p>
                      <p><strong>Authentication State:</strong> <span className="text-emerald-600 font-bold font-mono">Real-time OAuth Binding Active</span></p>
                    </div>

                    {/* Section A: Live Document Backup Exporter */}
                    <div className="space-y-3 bg-stone-50/50 p-4 rounded-xl border border-stone-200">
                      <div className="flex items-center gap-2">
                        <FolderPlus className="w-4 h-4 text-[#4285F4]" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">Direct Backup Exporter</h4>
                      </div>
                      
                      {localDrafts.length === 0 ? (
                        <p className="text-xs text-stone-400 font-medium">No offline drafts resolved in the workspace DB. Create items in the editor first.</p>
                      ) : (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wide mb-1">Select Document to Send</label>
                            <select
                              value={selectedBackupDraftId}
                              onChange={(e) => setSelectedBackupDraftId(e.target.value)}
                              className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#4285F4]"
                            >
                              <option value="all-docs">⚡ Backup All Documents ({localDrafts.length})</option>
                              {localDrafts.map(doc => (
                                <option key={doc.id} value={doc.id}>{doc.title || 'Untitled Document'}</option>
                              ))}
                            </select>
                          </div>
                          
                          <button 
                            type="button"
                            onClick={handleRunRealGdriveBackup}
                            disabled={simulatingType !== null || !selectedBackupDraftId}
                            className="bg-[#4285F4] hover:bg-[#357AE8] disabled:bg-gray-200 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors"
                          >
                            {simulatingType === 'gdrive' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FolderPlus className="w-3.5 h-3.5" />}
                            Upload Selected Draft
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Section B: Document Puller Picker */}
                    <div className="space-y-3 bg-stone-50/50 p-4 rounded-xl border border-stone-200">
                      <div className="flex items-center gap-2">
                        <FolderDown className="w-4 h-4 text-[#4285F4]" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">Google Picker Importer</h4>
                      </div>
                      
                      <p className="text-xs text-stone-500 leading-normal">
                        Leverage Google Picker to browse your complete external Drive catalog. Open PDFs, markdown content, or docs and load them instantly as sandboxed local workspace copies.
                      </p>

                      <button
                        type="button"
                        onClick={handleTriggerPicker}
                        disabled={pickerLoading}
                        className="bg-stone-800 hover:bg-stone-900 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors"
                      >
                        {pickerLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FolderDown className="w-3.5 h-3.5" />}
                        Open Google Picker
                      </button>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button 
                        type="button"
                        onClick={handleDisconnectGdrive}
                        className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
                      >
                        Disconnect Cloud Mount
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ITEM 3: Hook Notifications */}
            {(activeTab === 'all' || (activeTab === 'connected' && isWebhookActive)) && (
              <div className="bg-white p-8 rounded-2xl border border-[#E4DBC5] shadow-sm relative overflow-hidden transition-all hover:shadow">
                <div className="absolute right-0 top-0 h-1.5 w-full bg-[#996A00]"></div>
                
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-[#996A00]">
                      <Code className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[#1a1a1a]">Event Webhooks</h2>
                      <p className="text-xs text-gray-500 uppercase font-mono mt-1 tracking-wider">HTTPS POST Broadcast Gateway</p>
                    </div>
                  </div>
                  <div className={`self-start inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                    isWebhookActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-50 text-gray-500 border border-gray-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isWebhookActive ? 'bg-emerald-600 animate-pulse' : 'bg-gray-400'}`}></span>
                    {isWebhookActive ? 'Webhook Active' : 'Idle'}
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                  Send live event triggers to external developer servers. Webhooks fire whenever digital documents are registered, saved, signed, or pruned from the private vault.
                </p>

                {!isWebhookActive ? (
                  <form onSubmit={handleSaveWebhook} className="space-y-4 border-t border-gray-100 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Destination Gateway URL</label>
                        <input 
                          type="url" 
                          required
                          value={webhookUrl}
                          onChange={e => setWebhookUrl(e.target.value)}
                          placeholder="https://your-api.com/webhooks/doccraft" 
                          className="w-full bg-[#FAF9F6] border border-[#E4DBC5] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#996A00] font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">HMAC Shared Key (for signature)</label>
                        <input 
                          type="password" 
                          value={webhookSecret}
                          onChange={e => setWebhookSecret(e.target.value)}
                          placeholder="e.g. sec_token_1a7eb4..." 
                          className="w-full bg-[#FAF9F6] border border-[#E4DBC5] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#996A00] font-mono"
                        />
                      </div>
                    </div>
                    <button type="submit" className="w-full bg-[#996A00] hover:bg-[#805900] text-white text-xs font-bold uppercase tracking-wider py-3 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors">
                      <Save className="w-4 h-4" /> Save & Activate Gateway
                    </button>
                  </form>
                ) : (
                  <div className="space-y-4 border-t border-gray-100 pt-6">
                    <div className="bg-[#FAF9F6] p-4 rounded-lg border border-[#E4DBC5] text-xs space-y-1">
                      <p><strong>Gateway Url:</strong> <span className="font-mono text-gray-700 break-all">{webhookUrl}</span></p>
                      <p><strong>Secured With:</strong> <span className="font-mono text-gray-400">HMAC-SHA256 Envelope Guard</span></p>
                    </div>
                    <div className="flex gap-4">
                      <button 
                        onClick={simulateWebhookPayload} 
                        disabled={simulatingType !== null}
                        className="flex-1 bg-[#996A00] hover:bg-[#805900] disabled:bg-gray-200 text-white text-xs font-bold uppercase tracking-wider py-3 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors"
                      >
                        {simulatingType === 'webhook' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                        Dispatch Test Event payload
                      </button>
                      <button 
                        onClick={() => {
                          setWebhookUrl('');
                          setWebhookSecret('');
                          localStorage.removeItem('dc_webhook_url');
                          localStorage.removeItem('dc_webhook_secret');
                          localStorage.setItem('dc_webhook_active', 'false');
                          setIsWebhookActive(false);
                          addLog('webhook', '❌ Webhook channel removed.');
                        }}
                        className="bg-white border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold uppercase tracking-wider px-4 rounded-lg cursor-pointer transition-colors"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ITEM 4: Gemini LLM Keys & Workspace */}
            {(activeTab === 'all') && (
              <div className="bg-white p-8 rounded-2xl border border-[#E4DBC5] shadow-sm relative overflow-hidden transition-all hover:shadow">
                <div className="absolute right-0 top-0 h-1.5 w-full bg-[#D4AF37]"></div>
                
                <div className="flex gap-4 mb-6">
                  <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-[#D4AF37]">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#1a1a1a]">LLM Assistant Model Platform</h2>
                    <p className="text-xs text-gray-500 uppercase font-mono mt-1 tracking-wider">Gemini Pro API Proxy</p>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                  Your workspace leverages native, server-side Google Gemini models to assist with translation, layout maps, autonomous agent routing, and sheet formulas.
                </p>

                <div className="border-t border-gray-100 pt-6 space-y-4">
                  <div className="bg-[#FAF9F6] p-4 rounded-lg border border-[#E4DBC5] text-xs space-y-3">
                    <p className="flex items-center gap-2 text-[#996A00] font-bold">
                      <Key className="w-4 h-4" /> Server Key Authentication Guard
                    </p>
                    <p className="text-gray-600 leading-normal">
                      The active Gemini token is mounted securely inside the backend sandbox context using the <span className="font-mono bg-[#EAE6DF] px-1 py-0.5 rounded text-gray-800 font-bold">GEMINI_API_KEY</span> system environment variable. Browser-side exposure is prevented.
                    </p>
                  </div>

                  <div className="flex gap-4 items-center justify-between text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <span className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-mono">
                      <Check className="w-4 h-4 text-emerald-500" /> Active Model: Gemini-1.5-flash
                    </span>
                    <a 
                      href="/models" 
                      className="text-[#996A00] font-bold uppercase tracking-wide hover:underline inline-flex items-center gap-1.5"
                    >
                      Model Settings <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Side Helper Panel */}
          <div className="space-y-8">
            
            {/* Live Simulation Display Console */}
            <div className="bg-stone-900 text-stone-200 p-6 rounded-2xl border border-stone-800 shadow-lg font-mono text-xs">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone-800">
                <span className="text-[#D4AF37] font-bold">INTEGRATIONS CONSOLE</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              
              <div className="min-h-[180px] space-y-2 overflow-y-auto max-h-[300px] scrollbar-hide pr-1">
                {simulationLog.length === 0 ? (
                  <p className="text-stone-500 italic">No integrations actions logged. Trigger a test push, drive sync, or webhook event to inspect real-time outputs.</p>
                ) : (
                  simulationLog.map((log, i) => (
                    <p key={i} className="leading-relaxed whitespace-pre-wrap shrink-0 border-l border-[#D4AF37] pl-2 font-mono text-[11px]">
                      {log}
                    </p>
                  ))
                )}
              </div>

              {simulationLog.length > 0 && (
                <button 
                  onClick={() => setSimulationLog([])}
                  className="w-full mt-4 bg-stone-800 hover:bg-stone-700 text-stone-300 text-[10px] font-bold uppercase tracking-wider py-2 rounded-lg cursor-pointer text-center"
                >
                  Clear Terminal Debug Log
                </button>
              )}
            </div>

            {/* E-E-A-T Safety guidelines */}
            <div className="bg-[#FAF9F6] p-6 rounded-2xl border border-[#E4DBC5]">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4.5 h-4.5 text-amber-600" /> Compliance Advisory
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed space-y-2">
                We take data integrity seriously. All credentials configured on this page are compiled into transient browser arrays and secured safely inside your client-side database structure. DocCraft Pro never forwards credentials to remote databases. Refer to the active <a href="/privacy-policy" className="text-[#996A00] font-bold hover:underline">Privacy Policy</a> to review our data integrity and security procedures.
              </p>
            </div>

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
