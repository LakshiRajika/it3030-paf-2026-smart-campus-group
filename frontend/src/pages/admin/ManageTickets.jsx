import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ticketAPI } from '../../services/api';
import { message, Modal } from 'antd';
import { Wrench, Trash2, ExternalLink } from 'lucide-react';
import dayjs from 'dayjs';

const statusColors = {
  OPEN: 'bg-blue-100 text-blue-700', IN_PROGRESS: 'bg-purple-100 text-purple-700',
  ON_HOLD: 'bg-yellow-100 text-yellow-700', RESOLVED: 'bg-green-100 text-green-700',
  CLOSED: 'bg-gray-100 text-gray-600',
};
const priorityColors = { LOW: 'text-green-600', MEDIUM: 'text-yellow-600', HIGH: 'text-orange-600', URGENT: 'text-red-600' };

export default function ManageTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => { fetchTickets(); }, []);

  const fetchTickets = async () => {
    try { const res = await ticketAPI.getAll(); setTickets(res.data.data || []); }
    catch { message.error('Failed to load tickets'); }
    finally { setLoading(false); }
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Delete Ticket', content: 'This cannot be undone.', okText: 'Delete', okButtonProps: { danger: true },
      onOk: async () => {
        try { await ticketAPI.delete(id); message.success('Ticket deleted'); fetchTickets(); }
        catch { message.error('Failed to delete'); }
      }
    });
  };

  const filtered = filter === 'ALL' ? tickets : tickets.filter(t => t.status === filter);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent"></div></div>;

  return (
    <div className="space-y-5">
      <h1 className="page-title">Manage Tickets</h1>

      <div className="flex gap-2 flex-wrap">
        {['ALL', 'OPEN', 'IN_PROGRESS', 'ON_HOLD', 'RESOLVED', 'CLOSED'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${filter === s ? 'bg-primary-600 text-white shadow-md' : 'bg-white text-gray-600 border border-purple-200 hover:bg-purple-50'}`}>
            {s.replace('_', ' ')} {s !== 'ALL' && `(${tickets.filter(t => t.status === s).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card-glass py-16 text-center"><Wrench size={48} className="mx-auto mb-3 text-gray-300" /><p className="text-gray-500">No tickets found</p></div>
      ) : (
        <div className="space-y-3">
          {filtered.map(t => (
            <div key={t.id} className="card-glass">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Wrench size={20} className="text-accent-orange" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-sm font-semibold text-gray-800">{t.title}</h3>
                    <span className={`badge-status ${statusColors[t.status]}`}>{t.status?.replace('_', ' ')}</span>
                    <span className={`text-[10px] font-semibold ${priorityColors[t.priority]}`}>● {t.priority}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mb-1">{t.description}</p>
                  <div className="flex gap-4 text-[11px] text-gray-400 flex-wrap">
                    <span>By: {t.reporterName}</span>
                    <span>📍 {t.location}</span>
                    <span>🕐 {dayjs(t.createdAt).format('MMM D, YYYY')}</span>
                    <span>💬 {t.comments?.length || 0}</span>
                    {t.assignedToName && <span>👷 {t.assignedToName}</span>}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Link to={`/admin/tickets/${t.id}`} className="p-2 bg-primary-100 hover:bg-primary-200 rounded-lg transition-colors" title="View Details">
                    <ExternalLink size={16} className="text-primary-700" />
                  </Link>
                  <button onClick={() => handleDelete(t.id)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors" title="Delete">
                    <Trash2 size={16} className="text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
