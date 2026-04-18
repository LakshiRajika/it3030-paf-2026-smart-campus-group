import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ticketAPI } from '../../services/api';
import { message } from 'antd';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Send, Clock, MapPin, User, AlertTriangle } from 'lucide-react';
import dayjs from 'dayjs';

const statusColors = {
  OPEN: 'bg-blue-100 text-blue-700', IN_PROGRESS: 'bg-purple-100 text-purple-700',
  ON_HOLD: 'bg-yellow-100 text-yellow-700', RESOLVED: 'bg-green-100 text-green-700',
  CLOSED: 'bg-gray-100 text-gray-600',
};

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => { fetchTicket(); }, [id]);

  const fetchTicket = async () => {
    try { const res = await ticketAPI.getById(id); setTicket(res.data.data); }
    catch { message.error('Failed to load ticket'); navigate(-1); }
    finally { setLoading(false); }
  };

  const addComment = async () => {
    if (!comment.trim()) { message.warning('Please enter a comment'); return; }
    setSending(true);
    try {
      const res = await ticketAPI.addComment(id, comment);
      setTicket(res.data.data);
      setComment('');
      message.success('Comment added');
    } catch (err) { message.error(err.response?.data?.message || 'Failed to add comment'); }
    finally { setSending(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent"></div></div>;
  if (!ticket) return null;

  return (
    <div className="max-w-3xl space-y-5">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-800 font-medium">
        <ArrowLeft size={18} /> Back to Tickets
      </button>

      <div className="card-glass">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-primary-900">{ticket.title}</h1>
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1"><Clock size={13} /> {dayjs(ticket.createdAt).format('MMM D, YYYY h:mm A')}</span>
              <span className="flex items-center gap-1"><MapPin size={13} /> {ticket.location}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <span className={`badge-status ${statusColors[ticket.status]}`}>{ticket.status?.replace('_', ' ')}</span>
            <span className="badge-status bg-orange-100 text-orange-700">{ticket.priority}</span>
          </div>
        </div>

        <div className="bg-surface-50 rounded-xl p-4 mb-4">
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-purple-50 rounded-lg p-3"><span className="text-gray-500 block mb-0.5">Category</span><span className="font-semibold text-gray-800">{ticket.category || 'N/A'}</span></div>
          <div className="bg-purple-50 rounded-lg p-3"><span className="text-gray-500 block mb-0.5">Building</span><span className="font-semibold text-gray-800">{ticket.building || 'N/A'}</span></div>
          <div className="bg-purple-50 rounded-lg p-3"><span className="text-gray-500 block mb-0.5">Floor</span><span className="font-semibold text-gray-800">{ticket.floor}</span></div>
          <div className="bg-purple-50 rounded-lg p-3"><span className="text-gray-500 block mb-0.5">Room</span><span className="font-semibold text-gray-800">{ticket.roomNumber || 'N/A'}</span></div>
        </div>

        {ticket.resolutionNotes && (
          <div className="mt-4 p-3 bg-green-50 rounded-xl border border-green-200">
            <p className="text-xs font-semibold text-green-700 mb-1">Resolution Notes</p>
            <p className="text-sm text-green-800">{ticket.resolutionNotes}</p>
          </div>
        )}
      </div>

      {/* Comments */}
      <div className="card-glass">
        <h3 className="font-semibold text-primary-900 mb-4">Comments ({ticket.comments?.length || 0})</h3>

        <div className="space-y-3 mb-4 max-h-80 overflow-y-auto">
          {(!ticket.comments || ticket.comments.length === 0) ? (
            <p className="text-center text-gray-400 text-sm py-6">No comments yet</p>
          ) : (
            ticket.comments.map(c => (
              <div key={c.id} className={`p-3 rounded-xl ${c.userId === user?.id ? 'bg-primary-50 ml-8' : 'bg-surface-50 mr-8'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 bg-primary-200 rounded-full flex items-center justify-center">
                    <User size={12} className="text-primary-700" />
                  </div>
                  <span className="text-xs font-semibold text-gray-700">{c.userName}</span>
                  <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{c.userRole}</span>
                  <span className="text-[10px] text-gray-400 ml-auto">{dayjs(c.createdAt).format('MMM D, h:mm A')}</span>
                </div>
                <p className="text-sm text-gray-700 pl-8">{c.content}</p>
              </div>
            ))
          )}
        </div>

        {ticket.status !== 'CLOSED' && (
          <div className="flex gap-2">
            <input value={comment} onChange={e => setComment(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && addComment()}
              className="flex-1 px-4 py-2.5 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm"
              placeholder="Write a comment..." />
            <button onClick={addComment} disabled={sending}
              className="btn-primary px-4 disabled:opacity-60">
              <Send size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
