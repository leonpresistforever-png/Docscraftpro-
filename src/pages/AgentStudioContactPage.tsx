import React, { useState } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Mail, ArrowRight, MessageSquare, Bot } from 'lucide-react';
import { motion } from 'motion/react';

export function AgentStudioContactPage() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleEmailClick = (e: React.FormEvent) => {
    e.preventDefault();
    const mailtoUrl = `mailto:leonpresistforever@gmail.com?subject=${encodeURIComponent(subject || 'Agent Studio Inquiry')}&body=${encodeURIComponent(message)}`;
    window.location.href = mailtoUrl;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      <Navbar />

      <main className="flex-grow flex items-center justify-center pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-slate-100"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Bot className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-2">Agent Studio Support</h2>
            <p className="text-slate-500 text-lg">Report bugs, request features, or connect with our engineering team.</p>
          </div>

          <form onSubmit={handleEmailClick} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="subject" className="block text-sm font-bold text-slate-700 mb-1">Subject</label>
                <input
                  id="subject"
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 text-slate-900 transition-all outline-none"
                  placeholder="e.g. Issue with code compilation"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-bold text-slate-700 mb-1">Message Details</label>
                <textarea
                  id="message"
                  required
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 text-slate-900 transition-all outline-none resize-none"
                  placeholder="Describe your issue or request in detail..."
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center items-center gap-2 py-4 px-6 border border-transparent rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 font-bold text-lg shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98]"
            >
              <Mail className="w-5 h-5" />
              Open Gmail to Send
              <ArrowRight className="w-5 h-5 ml-1" />
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm text-slate-500 border-t border-slate-100 pt-6">
            By clicking above, your default email client (like Gmail) will open to send the message directly to <span className="font-semibold text-slate-700">leonpresistforever@gmail.com</span>.
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
