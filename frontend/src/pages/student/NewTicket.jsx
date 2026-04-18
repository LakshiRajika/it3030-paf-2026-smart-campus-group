import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketAPI } from '../../services/api';
import { message } from 'antd';
import { Wrench, FileText, MapPin, Building2, Layers, AlertTriangle } from 'lucide-react';

const categories = ['Electrical', 'Plumbing', 'HVAC', 'Furniture', 'IT Equipment', 'Cleaning', 'Structural', 'Other'];
const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export default function NewTicket() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    title: '', description: '', category: '', location: '',
    building: '', floor: 0, roomNumber: '', priority: 'MEDIUM',
  });

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.location.trim()) e.location = 'Location is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) { message.warning('Please fix validation errors'); return; }
    setSubmitting(true);
    try {
      await ticketAPI.create(form);
      message.success('Ticket submitted successfully!');
      navigate('/dashboard/tickets');
    } catch (err) { message.error(err.response?.data?.message || 'Failed to submit ticket'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="page-title">Report Maintenance Issue</h1>

      <form onSubmit={handleSubmit} className="card-glass space-y-4">
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Title <span className="text-red-400">*</span></label>
          <div className="relative">
            <FileText size={16} className="absolute left-3 top-3 text-gray-400" />
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              className={`w-full pl-9 pr-4 py-2.5 rounded-xl border ${errors.title ? 'border-red-400' : 'border-purple-200'} focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm`}
              placeholder="Brief summary of the issue" />
          </div>
          {errors.title && <p className="text-red-500 text-[11px] mt-0.5">{errors.title}</p>}
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Description <span className="text-red-400">*</span></label>
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
            rows={4} className={`w-full px-4 py-2.5 rounded-xl border ${errors.description ? 'border-red-400' : 'border-purple-200'} focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm resize-none`}
            placeholder="Describe the issue in detail..." />
          {errors.description && <p className="text-red-500 text-[11px] mt-0.5">{errors.description}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Category</label>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm bg-white">
              <option value="">Select category</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Priority</label>
            <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm bg-white">
              {priorities.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Location <span className="text-red-400">*</span></label>
          <div className="relative">
            <MapPin size={16} className="absolute left-3 top-3 text-gray-400" />
            <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
              className={`w-full pl-9 pr-4 py-2.5 rounded-xl border ${errors.location ? 'border-red-400' : 'border-purple-200'} focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm`}
              placeholder="e.g., Block A, 2nd Floor, Room 201" />
          </div>
          {errors.location && <p className="text-red-500 text-[11px] mt-0.5">{errors.location}</p>}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Building</label>
            <input value={form.building} onChange={e => setForm({ ...form, building: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm"
              placeholder="Block A" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Floor</label>
            <input type="number" value={form.floor} onChange={e => setForm({ ...form, floor: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2.5 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Room No.</label>
            <input value={form.roomNumber} onChange={e => setForm({ ...form, roomNumber: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm"
              placeholder="201" />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3">
          <button type="button" onClick={() => navigate('/dashboard/tickets')} className="btn-secondary text-sm">Cancel</button>
          <button type="submit" disabled={submitting} className="btn-primary text-sm disabled:opacity-60">
            {submitting ? 'Submitting...' : 'Submit Ticket'}
          </button>
        </div>
      </form>
    </div>
  );
}
