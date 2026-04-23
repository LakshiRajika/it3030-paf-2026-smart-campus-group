import React, { useState } from 'react';
import { analyzeDescription } from '../../utils/aiAssistant';

const StatusBadge = ({ status, isEscalated }) => {
  const getStatusStyles = (status) => {
    switch (status) {
      case 'OPEN':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'IN_PROGRESS':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'RESOLVED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'CLOSED':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'REJECTED':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="relative inline-block">
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyles(status)}`}>
        {status.replace('_', ' ')}
      </span>
      {isEscalated && (
        <div className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </div>
      )}
    </div>
  );
};

const TicketForm = ({ onSubmit, isLoading, initialData }) => {
  const [formData, setFormData] = useState(initialData || {
    location: '',
    description: '',
    category: 'FACILITY',
    priority: 'MEDIUM',
    preferredContact: '',
  });
  const [files, setFiles] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAiPulse, setShowAiPulse] = useState(false);

  const handleAiAnalyze = () => {
    if (!formData.description || formData.description.length < 10) {
      alert('Please enter a longer description for AI analysis.');
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate complex "AI Processing" time to wow the user
    setTimeout(() => {
      const suggestion = analyzeDescription(formData.description);
      if (suggestion) {
        setFormData(prev => ({
          ...prev,
          category: suggestion.category,
          priority: suggestion.priority
        }));
        setShowAiPulse(true);
        setTimeout(() => setShowAiPulse(false), 2000);
      }
      setIsAnalyzing(false);
    }, 1200);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData, files);
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files).slice(0, 3);
    setFiles(selectedFiles);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2 relative">
        <div className="flex justify-between items-center">
          <label className="text-sm font-semibold text-slate-700">Description</label>
          {formData.description.length > 20 && (
            <button 
              type="button"
              onClick={handleAiAnalyze}
              className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all px-3 py-1 rounded-full border
                ${isAnalyzing 
                  ? 'animate-pulse text-indigo-600 border-indigo-200 bg-indigo-50' 
                  : 'text-indigo-500 border-indigo-100 hover:border-indigo-300 hover:bg-slate-50'}`}
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
              </svg>
              {isAnalyzing ? 'Analyzing...' : 'Smart Auto-Fill (AI)'}
            </button>
          )}
        </div>
        <textarea 
          rows="4"
          placeholder="Describe the issue... (e.g. 'The projector in Block B room 201 is flickering and showing a red tint')"
          className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 outline-none transition-all
            ${showAiPulse ? 'border-emerald-400 ring-4 ring-emerald-50 bg-emerald-50/20' : 'border-slate-200'}`}
          required
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
        ></textarea>
        {showAiPulse && (
          <div className="absolute top-10 right-3 bg-emerald-500 text-white text-[9px] px-2.5 py-1 rounded-full font-black animate-bounce shadow-lg shadow-emerald-200">
            🤖 AI SUGGESTED!
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Location</label>
          <input 
            type="text" 
            placeholder="e.g. Block A, Room 302"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            required
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Category</label>
          <div className="relative">
            <select 
              className={`w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-white transition-all
                ${showAiPulse ? 'border-emerald-400 bg-emerald-50 text-emerald-900 font-bold' : 'border-slate-200'}`}
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              <option value="FACILITY">Facility / Plumbing</option>
              <option value="HARDWARE">Hardware / Equipment</option>
              <option value="SOFTWARE">Software / IT Services</option>
              <option value="NETWORK">Wi-Fi / Network</option>
              <option value="OTHER">Other</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Priority</label>
          <div className="flex gap-2">
            {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((p) => (
              <label key={p} className="flex-1 cursor-pointer">
                <input 
                  type="radio" 
                  name="priority" 
                  className="peer hidden" 
                  checked={formData.priority === p}
                  onChange={() => setFormData({...formData, priority: p})}
                />
                <span className={`block w-full py-2.5 text-center text-[10px] font-black rounded-xl border transition-all uppercase tracking-wider
                  ${showAiPulse && formData.priority === p 
                    ? 'border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-100 scale-105' 
                    : 'border-slate-100 bg-slate-50 text-slate-400 peer-checked:border-indigo-600 peer-checked:bg-indigo-600 peer-checked:text-white peer-checked:shadow-lg peer-checked:shadow-indigo-100'}`}>
                  {p}
                </span>
              </label>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Contact Method</label>
          <input 
            type="text" 
            placeholder="Email or Phone (e.g. 077...)"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            value={formData.preferredContact}
            onChange={(e) => setFormData({...formData, preferredContact: e.target.value})}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700">Attachments (Max 3)</label>
        <div className="group relative border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center hover:border-indigo-400 transition-all cursor-pointer bg-slate-50/50 hover:bg-white">
          <input 
            type="file" 
            multiple 
            accept="image/*"
            className="absolute inset-0 opacity-0 cursor-pointer z-10"
            onChange={handleFileChange}
          />
          <div className="space-y-3">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-slate-900 font-bold">
                {files.length > 0 ? `${files.length} Images Selected` : 'Upload Evidence'}
              </p>
              <p className="text-xs text-slate-400 mt-1">Tap to browse or drag images here</p>
            </div>
          </div>
        </div>
      </div>

      <button 
        type="submit" 
        disabled={isLoading}
        className={`w-full py-4 rounded-2xl bg-slate-900 text-white font-black text-sm uppercase tracking-widest shadow-2xl shadow-slate-200 hover:bg-indigo-600 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {isLoading ? (
          <div className="animate-spin h-5 w-5 border-2 border-white/20 border-t-white rounded-full"></div>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        )}
        {initialData ? 'Update Incident Report' : 'Submit Incident Report'}
      </button>
    </form>
  );
};

export { TicketForm, StatusBadge };
