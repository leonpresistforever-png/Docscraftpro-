import React, { useState } from 'react';
import { Navbar } from '../components/layout/Navbar';

export function SupportFormPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    issue: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setStatus('success');
        setFormData({ username: '', email: '', issue: '' });
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-[#2D2D2D] selection:bg-[#D4AF37] selection:text-white flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-3xl mx-auto w-full">
        <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight mb-6 text-center">
          Escalate an Issue
        </h1>
        <p className="text-lg text-gray-600 mb-12 text-center max-w-xl">
          Please fill out the form below detailing your issue. This will be routed internally to our human support team.
        </p>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-[#EAE6DF] w-full">
          {status === 'success' && (
            <div className="mb-6 p-4 bg-green-50 text-green-700 border border-green-200 rounded-xl text-center">
              Your issue has been submitted successfully. We will get back to you shortly!
            </div>
          )}
          {status === 'error' && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-center">
              There was an error submitting your form. Please try again.
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username or Full Name
            </label>
            <input
              type="text"
              id="username"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="mb-6">
            <label htmlFor="issue" className="block text-sm font-medium text-gray-700 mb-1">
              Describe your issue in detail
            </label>
            <textarea
              id="issue"
              required
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all resize-y"
              value={formData.issue}
              onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full flex items-center justify-center bg-[#D4AF37] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#b08d2b] transition-colors disabled:opacity-50"
          >
            {status === 'submitting' ? 'Submitting...' : 'Submit Issue'}
          </button>
        </form>
      </div>
    </div>
  );
}
