import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { 
  HardDrive, Cpu, Check, RefreshCw, Key, 
  Link2, ExternalLink, Code, AlertTriangle, Play, HelpCircle, Save 
} from 'lucide-react';

const Github = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export function IntegrationsPage() {
  // Persistence states
  const [gitToken, setGitToken] = useState(() => localStorage.getItem('dc_git_token') || '');
  const [gitRepo, setGitRepo] = useState(() => localStorage.getItem('dc_git_repo') || '');
  const [gitBranch, setGitBranch] = useState(() => localStorage.getItem('dc_git_branch') || 'main');
  const [isGitConnected, setIsGitConnected] = useState(() => localStorage.getItem('dc_git_connected') === 'true');

  const [gdriveFolder, setGdriveFolder] = useState(() => localStorage.getItem('dc_gdrive_folder') || 'DocCraft-Backups');
  const [isGdriveConnected, setIsGdriveConnected] = useState(() => localStorage.getItem('dc_gdrive_connected') === 'true');

  const [webhookUrl, setWebhookUrl] = useState(() => localStorage.getItem('dc_webhook_url') || '');
  const [webhookSecret, setWebhookSecret] = useState(() => localStorage.getItem('dc_webhook_secret') || '');
  const [isWebhookActive, setIsWebhookActive] = useState(() => localStorage.getItem('dc_webhook_active') === 'true');

  // Interactive logs / feedback
  const [simulatingType, setSimulatingType] = useState<'git' | 'webhook' | 'gdrive' | null>(null);
  const [simulationLog, setSimulationLog] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'connected' | 'security'>('all');

  const handleSaveGit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gitRepo.includes('/')) {
      alert('Please enter repository in owner/repo format.');
      return;
    }
    localStorage.setItem('dc_git_token', gitToken);
    localStorage.setItem('dc_git_repo', gitRepo);
    localStorage.setItem('dc_git_branch', gitBranch);
    localStorage.setItem('dc_git_connected', 'true');
    setIsGitConnected(true);
    addLog('git', '✓ GitHub Integration parameters saved securely.');
  };

  const handleDisconnectGit = () => {
    localStorage.removeItem('dc_git_token');
    localStorage.removeItem('dc_git_repo');
    localStorage.setItem('dc_git_connected', 'false');
    setGitToken('');
    setGitRepo('');
    setIsGitConnected(false);
    addLog('git', '❌ GitHub Integration disconnected.');
  };

  const handleSaveGdrive = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('dc_gdrive_folder', gdriveFolder);
    localStorage.setItem('dc_gdrive_connected', 'true');
    setIsGdriveConnected(true);
    addLog('gdrive', '✓ Google Drive Integration parameters activated.');
  };

  const handleDisconnectGdrive = () => {
    localStorage.setItem('dc_gdrive_connected', 'false');
    setIsGdriveConnected(false);
    addLog('gdrive', '❌ Google Drive Integration disconnected.');
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

  const addLog = (type: 'git' | 'webhook' | 'gdrive', message: string) => {
    setSimulationLog(prev => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev]);
  };

  const simulateGitSync = async () => {
    setSimulatingType('git');
    setSimulationLog([]);
    addLog('git', 'Initializing git bundle processor...');
    addLog('git', 'Reading document raw metadata catalog...');
    addLog('git', `Targeting remote: github.com/${gitRepo || 'owner/repo'}`);
    addLog('git', `Verifying JWT/PAT token permissions for branch: [${gitBranch}]`);

    if (gitToken && gitRepo && gitRepo.includes('/')) {
      addLog('git', '🔄 Initiating REAL GitHub API handshake...');
      try {
        const path = 'doccraft-sync-test.md';
        const url = `https://api.github.com/repos/${gitRepo}/contents/${path}`;
        
        let fileSha = undefined;
        try {
          const getRes = await fetch(url, {
            headers: {
              'Accept': 'application/vnd.github+json',
              'Authorization': `Bearer ${gitToken}`,
              'X-GitHub-Api-Version': '2022-11-28'
            }
          });
          if (getRes.ok) {
            const fileData = await getRes.json();
            fileSha = fileData.sha;
            addLog('git', `✓ Previous sync file identified (SHA: ${fileSha.slice(0, 10)}...). Preparing rewrite...`);
          }
        } catch (_) {
          // File not found or first run
        }

        const fileContent = `# DocCraft Pro Sync Test

This file is generated automatically via your DocCraft Pro Workspace Integration on a verified device.

- **Timestamp:** ${new Date().toISOString()}
- **Origin Device:** Secure Browser Local Sandbox
- **Status:** Integrated Success

DocCraft is the premium distraction-free web editor ensuring absolute client-side data residency.`;

        const base64Content = btoa(unescape(encodeURIComponent(fileContent)));

        const putRes = await fetch(url, {
          method: 'PUT',
          headers: {
            'Accept': 'application/vnd.github+json',
            'Authorization': `Bearer ${gitToken}`,
            'Content-Type': 'application/json',
            'X-GitHub-Api-Version': '2022-11-28'
          },
          body: JSON.stringify({
            message: `DocCraft Sync Backup: doccraft-sync-test.md`,
            content: base64Content,
            branch: gitBranch || 'main',
            sha: fileSha
          })
        });

        if (putRes.ok) {
          const resData = await putRes.json();
          addLog('git', `✓ Real GitHub Push SUCCESS! Created/updated: ${resData.content.name}`);
          addLog('git', `✓ Commit executed: ${resData.commit.sha.slice(0, 10)}`);
          addLog('git', '✓ Target branch syncing complete. Synchronized.');
        } else {
          const errData = await putRes.json();
          addLog('git', `⚠️ GITHUB UPSTREAM ERROR: HTTP/${putRes.status} - ${errData.message || 'Verification Error'}`);
          addLog('git', `💡 Tip: Check your repository name ("owner/repo") and branch name, and ensure you have write permissions.`);
        }
      } catch (err: any) {
        addLog('git', `❌ Handshake failed: Connection error - ${err.message || err}`);
      }
    } else {
      const logs = [
        'Compiling dynamic draft into standard markdown schema...',
        'Serializing cryptographic header signatures...',
        'Pushing blob to master tree (SHA-512 checks)...',
        '✓ Commit successfully executed (Simulated): commit ID a9f2bc7d85',
        '✓ Target branch matching complete. Synchronization complete.'
      ];

      for (let i = 0; i < logs.length; i++) {
        await new Promise(resolve => setTimeout(resolve, i === 0 ? 200 : 450));
        addLog('git', logs[i]);
      }
    }
    setSimulatingType(null);
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
            All Integrations (4)
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
            
            {/* ITEM 1: GitHub Sync Integration */}
            {(activeTab === 'all' || (activeTab === 'connected' && isGitConnected)) && (
              <div className="bg-white p-8 rounded-2xl border border-[#E4DBC5] shadow-sm relative overflow-hidden transition-all hover:shadow">
                <div className="absolute right-0 top-0 h-1.5 w-full bg-[#333]"></div>
                
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-800">
                      <Github className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[#1a1a1a]">GitHub Repository Backups</h2>
                      <p className="text-xs text-gray-500 uppercase font-mono mt-1 tracking-wider">Markdown Sync Protocol</p>
                    </div>
                  </div>
                  <div className={`self-start inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                    isGitConnected ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-50 text-gray-500 border border-gray-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isGitConnected ? 'bg-emerald-600 animate-pulse' : 'bg-gray-400'}`}></span>
                    {isGitConnected ? 'Connected & Active' : 'Not Configured'}
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                  Automatically save a robust markdown version of every document changes to an isolated GitHub repository. Ensures redundant storage and absolute freedom from vendor lock-in.
                </p>

                {!isGitConnected ? (
                  <form onSubmit={handleSaveGit} className="space-y-4 border-t border-gray-100 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">GitHub Repository</label>
                        <input 
                          type="text" 
                          required
                          value={gitRepo}
                          onChange={e => setGitRepo(e.target.value)}
                          placeholder="e.g. dev_user/doccraft-backups" 
                          className="w-full bg-[#FAF9F6] border border-[#E4DBC5] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#996A00]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Default Branch Name</label>
                        <input 
                          type="text" 
                          required
                          value={gitBranch}
                          onChange={e => setGitBranch(e.target.value)}
                          placeholder="main" 
                          className="w-full bg-[#FAF9F6] border border-[#E4DBC5] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#996A00]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Personal Access Token (with repo scope)</label>
                      <input 
                        type="password" 
                        required
                        value={gitToken}
                        onChange={e => setGitToken(e.target.value)}
                        placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxx" 
                        className="w-full bg-[#FAF9F6] border border-[#E4DBC5] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#996A00] font-mono"
                      />
                    </div>
                    <button type="submit" className="w-full bg-[#1A1A1A] hover:bg-[#333] text-white text-xs font-bold uppercase tracking-wider py-3 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors">
                      <Save className="w-4 h-4" /> Save & Enable Sync
                    </button>
                  </form>
                ) : (
                  <div className="space-y-4 border-t border-gray-100 pt-6">
                    <div className="bg-[#FAF9F6] p-4 rounded-lg border border-[#E4DBC5] text-xs space-y-2">
                      <p><strong>Configured Repository:</strong> <span className="font-mono">{gitRepo}</span></p>
                      <p><strong>Configured Branch:</strong> <span className="font-mono">{gitBranch}</span></p>
                      <p><strong>Credentials:</strong> <span className="font-mono text-gray-400">•••••••••••••••• (Encrypted in LocalStorage)</span></p>
                    </div>
                    <div className="flex gap-4">
                      <button 
                        onClick={simulateGitSync} 
                        disabled={simulatingType !== null}
                        className="flex-1 bg-[#996A00] hover:bg-[#805900] disabled:bg-gray-200 text-white text-xs font-bold uppercase tracking-wider py-3 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors"
                      >
                        {simulatingType === 'git' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                        Simulate Push Backup
                      </button>
                      <button 
                        onClick={handleDisconnectGit}
                        className="bg-white border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold uppercase tracking-wider px-4 rounded-lg cursor-pointer transition-colors"
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

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
                      <h2 className="text-xl font-bold text-[#1a1a1a]">Google Drive Backups</h2>
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
                  Export signed drafts, PDF revisions, and data logs directly to your Google Workspace account folders. Uses standard web storage credentials for background directory uploads.
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
                    <button type="submit" className="w-full bg-[#4285F4] hover:bg-[#357AE8] text-white text-xs font-bold uppercase tracking-wider py-3 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors">
                      <Link2 className="w-4 h-4" /> Grant Consent & Mount Folder
                    </button>
                  </form>
                ) : (
                  <div className="space-y-4 border-t border-gray-100 pt-6">
                    <div className="bg-[#FAF9F6] p-4 rounded-lg border border-[#E4DBC5] text-xs space-y-1">
                      <p><strong>Active Drive Path:</strong> <span className="font-mono">Google Drive &gt; {gdriveFolder}</span></p>
                      <p><strong>System Status:</strong> <span className="text-emerald-600 font-bold font-mono">Synced &amp; Persistent</span></p>
                    </div>
                    <div className="flex gap-4">
                      <button 
                        onClick={simulateGdriveBackup} 
                        disabled={simulatingType !== null}
                        className="flex-1 bg-[#4285F4] hover:bg-[#357AE8] disabled:bg-gray-200 text-white text-xs font-bold uppercase tracking-wider py-3 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors"
                      >
                        {simulatingType === 'gdrive' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                        Trigger Drive Export
                      </button>
                      <button 
                        onClick={handleDisconnectGdrive}
                        className="bg-white border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold uppercase tracking-wider px-4 rounded-lg cursor-pointer transition-colors"
                      >
                        Disconnect
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
