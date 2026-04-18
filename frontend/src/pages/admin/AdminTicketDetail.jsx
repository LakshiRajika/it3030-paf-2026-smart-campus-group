import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ticketAPI, userAPI } from '../../services/api';
import { message } from 'antd';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Send, Clock, MapPin, User, Save } from 'lucide-react';
import dayjs from 'dayjs';

const statuses = ['OPEN', 'IN_PROGRESS', 'ON_HOLD', 'RESOLVED', 'CLOSED'];
const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const statusColors = {
  OPEN: 'bg-blue-100 text-blue-700', IN_PROGRESS: 'bg-purple-100 text-purple-700',
  ON_HOLD: 'bg-yellow-100 text-yellow-700', RESOLVED: 'bg-green-100 text-green-700',
  CLOSED: 'bg-gray-100 text-gray-600',
};

export default function AdminTicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [updateForm, setUpdateForm] = useState({ status: '', assignedTo: '', priority: '', resolutionNotes: '' });

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    try {
      const [ticketRes, usersRes] = await Promise.all([ticketAPI.getById(id), userAPI.getAll()]);
      const t = ticketRes.data.data;
      setTicket(t);
      setUpdateForm({ status: t.status, assignedTo: t.assignedTo || '', priority: t.priority, resolutionNotes: t.resolutionNotes || '' });
      setTechnicians((usersRes.data.data || []).filter(u => ['TECHNICIAN', 'ADMIN', 'MANAGER'].includes(u.role)));
    } catch { message.error('Failed to load ticket'); navigate(-1); }
    finally { setLoading(false); }
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const res = await ticketAPI.update(id, updateForm);
      setTicket(res.data.data);
      message.success('Ticket updated successfully');
    } catch (err) { message.error(err.response?.data?.message || 'Failed to update'); }
    finally { setSaving(false); }
  };

  const addComment = async () => {
    if (!comment.trim()) { message.warning('Enter a comment'); return; }
    setSending(true);
    try {
      const res = await ticketAPI.addComment(id, comment);
      setTicket(res.data.data);
      setComment('');
      message.success('Comment added');
    } catch (err) { message.error(err.response?.data?.message || 'Failed'); }
    finally { setSending(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent"></div></div>;
  if (!ticket) return null;

  return (
    <div className="max-w-4xl space-y-5">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-800 font-medium">
        <ArrowLeft size={18} /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-5">
          <div className="card-glass">
            <div className="flex items-start justify-between mb-3">
              <h1 className="text-xl font-bold text-primary-900">{ticket.title}</h1>
              <span className={`badge-status ${statusColors[ticket.status]}`}>{ticket.status?.replace('_', ' ')}</span>
            </div>
            <div className="flex gap-4 text-xs text-gray-500 mb-4">
              <span className="flex items-center gap-1"><User size={13} /> {ticket.reporterName}</span>
              <span className="flex items-center gap-1"><Clock size={13} /> {dayjs(ticket.createdAt).format('MMM D, YYYY h:mm A')}</span>
              <span className="flex items-center gap-1"><MapPin size={13} /> {ticket.location}</span>
            </div>
            <div className="bg-surface-50 rounded-xl p-4">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
            </div>
            <div className="grid grid-cols-4 gap-3 mt-4 text-xs">
              <div className="bg-purple-50 rounded-lg p-2.5"><span className="text-gray-500 block">Category</span><span className="font-semibold">{ticket.category || 'N/A'}</span></div>
              <div className="bg-purple-50 rounded-lg p-2.5"><span className="text-gray-500 block">Building</span><span className="font-semibold">{ticket.building || 'N/A'}</span></div>
              <div className="bg-purple-50 rounded-lg p-2.5"><span className="text-gray-500 block">Floor</span><span className="font-semibold">{ticket.floor}</span></div>
              <div className="bg-purple-50 rounded-lg p-2.5"><span className="text-gray-500 block">Room</span><span className="font-semibold">{ticket.roomNumber || 'N/A'}</span></div>
            </div>
          </div>

          {/* Comments */}
          <div className="card-glass">
            <h3 className="font-semibold text-primary-900 mb-3">Comments ({ticket.comments?.length || 0})</h3>
            <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
              {(!ticket.comments || ticket.comments.length === 0) ? (
                <p className="text-center text-gray-400 text-sm py-4">No comments</p>
              ) : (
                ticket.comments.map(c => (
                  <div key={c.id} className={`p-3 rounded-xl ${c.userId === user?.id ? 'bg-primary-50 ml-6' : 'bg-surface-50 mr-6'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-gray-700">{c.userName}</span>
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{c.userRole}</span>
                      <span className="text-[10px] text-gray-400 ml-auto">{dayjs(c.createdAt).format('MMM D, h:mm A')}</span>
                    </div>
                    <p className="text-sm text-gray-700">{c.content}</p>
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <input value={comment} onChange={e => setComment(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addComment()}
                className="flex-1 px-4 py-2.5 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm"
                placeholder="Add a comment..." />
              <button onClick={addComment} disabled={sending} className="btn-primary px-4 disabled:opacity-60"><Send size={18} /></button>
            </div>
          </div>
        </div>

        {/* Sidebar - Update */}
        <div className="card-glass h-fit">
          <h3 className="font-semibold text-primary-900 mb-4">Update Ticket</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Status</label>
              <select value={updateForm.status} onChange={e => setUpdateForm({ ...updateForm, status: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-purple-200 text-sm bg-white">
                {statuses.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Priority</label>
              <select value={updateForm.priority} onChange={e => setUpdateForm({ ...updateForm, priority: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-purple-200 text-sm bg-white">
                {priorities.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Assign To</label>
              <select value={updateForm.assignedTo} onChange={e => setUpdateForm({ ...updateForm, assignedTo: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-purple-200 text-sm bg-white">
                <option value="">Unassigned</option>
                {technicians.map(t => <option key={t.id} value={t.id}>{t.firstName} {t.lastName} ({t.role})</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Resolution Notes</label>
              <textarea value={updateForm.resolutionNotes} onChange={e => setUpdateForm({ ...updateForm, resolutionNotes: e.target.value })}
                rows={3} className="w-full px-3 py-2.5 rounded-xl border border-purple-200 text-sm resize-none"
                placeholder="Add resolution notes..." />
            </div>
            <button onClick={handleUpdate} disabled={saving}
              className="w-full btn-primary flex items-center justify-center gap-2 text-sm disabled:opacity-60">
              <Save size={16} /> {saving ? 'Saving...' : 'Update Ticket'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
