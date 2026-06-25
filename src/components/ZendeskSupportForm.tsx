import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, Loader2, Paperclip, X } from 'lucide-react';

export function ZendeskSupportForm() {
  const { user, userData } = useAuth();
  
  const [formData, setFormData] = useState({
    email: user?.email || '',
    subject: '',
    description: '',
    platform: 'web'
  });

  const [attachments, setAttachments] = useState<{ name: string; size: number }[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleFiles = (files: File[]) => {
    const valid = Array.from(files).filter(f => f.size <= 2.5 * 1024 * 1024).map(f => ({ name: f.name, size: f.size }));
    setAttachments(prev => [...prev, ...valid]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    // Simulate network delay
    setTimeout(() => setStatus('success'), 1500);
  };

  if (status === 'success') {
    return (
      <div className="w-full bg-white p-8 rounded border border-gray-200">
        <h2 className="text-2xl font-semibold mb-4 text-[#2f3941]">Request Successfully Submitted</h2>
        <p className="text-[#68737d] mb-6">Your request was successfully submitted. You will receive a confirmation email shortly.</p>
        <button onClick={() => setStatus('idle')} className="text-sm border border-gray-300 rounded px-4 py-2 hover:bg-gray-50 text-[#2f3941]">
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto font-sans">
      <h1 className="text-[28px] font-semibold text-[#2f3941] mb-8 font-serif">Submit a request</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-[#2f3941] mb-1">Your email address</label>
          <input 
            type="email" 
            required
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
            className="w-full px-3 py-2.5 rounded text-sm text-[#2f3941] border border-[#d8dcde] hover:border-[#a2aab0] focus:border-[#1f73b7] focus:ring-1 focus:ring-[#1f73b7] outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#2f3941] mb-1">Subject</label>
          <input 
            type="text" 
            required
            value={formData.subject}
            onChange={e => setFormData({...formData, subject: e.target.value})}
            className="w-full px-3 py-2.5 rounded text-sm text-[#2f3941] border border-[#d8dcde] hover:border-[#a2aab0] focus:border-[#1f73b7] focus:ring-1 focus:ring-[#1f73b7] outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#2f3941] mb-1">Description</label>
          <p className="text-[13px] text-[#68737d] mb-2">Please enter the details of your request. A member of our support staff will respond as soon as possible.</p>
          <textarea 
            required
            rows={5}
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            className="w-full px-3 py-2.5 rounded text-sm text-[#2f3941] border border-[#d8dcde] hover:border-[#a2aab0] focus:border-[#1f73b7] focus:ring-1 focus:ring-[#1f73b7] outline-none transition-colors resize-y"
          />
        </div>

        <div>
           <label className="block text-sm font-semibold text-[#2f3941] mb-1">Platform</label>
           <select 
             value={formData.platform}
             onChange={e => setFormData({...formData, platform: e.target.value})}
             className="w-full px-3 py-2.5 rounded text-sm text-[#2f3941] border border-[#d8dcde] bg-white hover:border-[#a2aab0] focus:border-[#1f73b7] outline-none appearance-none cursor-pointer"
           >
             <option value="web">Web Application</option>
             <option value="mac">macOS Desktop</option>
             <option value="windows">Windows Desktop</option>
             <option value="ios">iOS / iPadOS</option>
           </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#2f3941] mb-1">Attachments</label>
          <div 
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={e => { e.preventDefault(); setIsDragging(false); handleFiles(Array.from(e.dataTransfer.files)); }}
            className={`w-full border rounded border-[#d8dcde] relative overflow-hidden transition-colors ${isDragging ? 'bg-[#f8f9fa] border-[#1f73b7]' : 'bg-white'}`}
          >
             <div className="px-4 py-8 flex flex-col items-center justify-center text-sm text-[#1f73b7] cursor-pointer hover:underline">
                <span className="flex items-center gap-2"><Paperclip className="w-4 h-4" /> Add file or drop files here</span>
                <input 
                  type="file" 
                  multiple 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={e => e.target.files && handleFiles(Array.from(e.target.files))} 
                />
             </div>
          </div>
          
          {attachments.length > 0 && (
             <div className="mt-3 space-y-2">
               {attachments.map((file, i) => (
                  <div key={i} className="flex justify-between items-center bg-[#f8f9fa] px-3 py-2 rounded text-sm text-[#2f3941] border border-[#d8dcde]">
                    <div className="flex items-center gap-2">
                       <FileText className="w-4 h-4 text-[#68737d]" />
                       {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                    <button type="button" onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))} className="text-[#68737d] hover:text-[#2f3941]">
                       <X className="w-4 h-4" />
                    </button>
                  </div>
               ))}
             </div>
          )}
        </div>

        <button 
           type="submit" 
           disabled={status === 'submitting'}
           className="px-6 py-2.5 bg-[#141414] text-white rounded font-medium text-sm hover:bg-[#2f3941] transition-colors disabled:opacity-75 flex items-center justify-center gap-2"
        >
          {status === 'submitting' && <Loader2 className="w-4 h-4 animate-spin" />}
          Submit
        </button>
      </form>
    </div>
  );
}
