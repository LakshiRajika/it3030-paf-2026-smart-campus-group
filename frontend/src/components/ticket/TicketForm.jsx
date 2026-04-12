import React, { useState } from 'react';

const StatusBadge = ({ status }) => {
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
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyles(status)}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

const TicketForm = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    location: '',
    description: '',
    category: 'FACILITY',
    priority: 'MEDIUM',
    preferredContact: '',
  });
  const [files, setFiles] = useState([]);

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Location</label>
          <input 
            type="text" 
            placeholder="e.g. Block A, Room 302"
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            required
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Category</label>
          <select 
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none bg-white"
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
          >
            <option value="FACILITY">Facility</option>
            <option value="HARDWARE">Hardware</option>
            <option value="SOFTWARE">Software</option>
            <option value="NETWORK">Network</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700">Description</label>
        <textarea 
          rows="4"
          placeholder="Detailed description of the issue..."
          className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          required
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
        ></textarea>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Priority</label>
          <div className="flex gap-4">
            {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((p) => (
              <label key={p} className="flex flex-1 items-center justify-center cursor-pointer">
                <input 
                  type="radio" 
                  name="priority" 
                  className="peer hidden" 
                  checked={formData.priority === p}
                  onChange={() => setFormData({...formData, priority: p})}
                />
                <span className="w-full py-2 text-center text-xs font-bold rounded-lg border border-slate-200 peer-checked:border-indigo-600 peer-checked:bg-indigo-50 peer-checked:text-indigo-600 transition-all">
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
            placeholder="Email or Phone number"
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            value={formData.preferredContact}
            onChange={(e) => setFormData({...formData, preferredContact: e.target.value})}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700">Attachments (Max 3)</label>
        <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-indigo-400 transition-colors cursor-pointer relative">
          <input 
            type="file" 
            multiple 
            accept="image/*"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={handleFileChange}
          />
          <div className="space-y-2">
            <svg className="w-8 h-8 mx-auto text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <p className="text-sm text-slate-500 font-medium">
              {files.length > 0 ? `${files.length} file(s) selected` : 'Click or drag and drop to upload images'}
            </p>
          </div>
        </div>
      </div>

      <button 
        type="submit" 
        disabled={isLoading}
        className={`w-full py-3 rounded-xl bg-indigo-600 text-white font-bold text-lg shadow-lg hover:bg-indigo-700 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {isLoading ? (
          <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : null}
        Create Incident Ticket
      </button>
    </form>
  );
};

export { TicketForm, StatusBadge };
