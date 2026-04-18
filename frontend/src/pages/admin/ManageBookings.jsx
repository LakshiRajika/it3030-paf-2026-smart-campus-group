import { useState, useEffect } from 'react';
import { bookingAPI } from '../../services/api';
import { message, Modal, Input } from 'antd';
import { CalendarDays, Check, X, Trash2, Clock, Users, MapPin } from 'lucide-react';
import dayjs from 'dayjs';

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  APPROVED: 'bg-green-100 text-green-700 border-green-200',
  REJECTED: 'bg-red-100 text-red-700 border-red-200',
  CANCELLED: 'bg-gray-100 text-gray-600 border-gray-200',
};

export default function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try { const res = await bookingAPI.getAll(); setBookings(res.data.data || []); }
    catch { message.error('Failed to load bookings'); }
    finally { setLoading(false); }
  };

  const handleApprove = (id) => {
    Modal.confirm({
      title: 'Approve Booking',
      content: <Input.TextArea placeholder="Admin remarks (optional)" id="approveRemarks" rows={2} />,
      okText: 'Approve',
      onOk: async () => {
        try {
          const remarks = document.getElementById('approveRemarks')?.value || '';
          await bookingAPI.approve(id, remarks);
          message.success('Booking approved successfully');
          fetchBookings();
        } catch (err) { message.error(err.response?.data?.message || 'Failed to approve'); }
      }
    });
  };

  const handleReject = (id) => {
    let reason = '';
    Modal.confirm({
      title: 'Reject Booking',
      content: <Input.TextArea placeholder="Rejection reason (required)" onChange={e => reason = e.target.value} rows={3} />,
      okText: 'Reject',
      okButtonProps: { danger: true },
      onOk: async () => {
        if (!reason.trim()) { message.warning('Rejection reason is required'); throw new Error('required'); }
        try {
          await bookingAPI.reject(id, reason);
          message.success('Booking rejected');
          fetchBookings();
        } catch (err) { if (err.message !== 'required') message.error(err.response?.data?.message || 'Failed to reject'); throw err; }
      }
    });
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Delete Booking',
      content: 'This action cannot be undone.',
      okText: 'Delete',
      okButtonProps: { danger: true },
      onOk: async () => {
        try { await bookingAPI.delete(id); message.success('Booking deleted'); fetchBookings(); }
        catch { message.error('Failed to delete'); }
      }
    });
  };

  const filtered = filter === 'ALL' ? bookings : bookings.filter(b => b.status === filter);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent"></div></div>;

  return (
    <div className="space-y-5">
      <h1 className="page-title">Manage Bookings</h1>

      <div className="flex gap-2 flex-wrap">
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${filter === s ? 'bg-primary-600 text-white shadow-md' : 'bg-white text-gray-600 border border-purple-200 hover:bg-purple-50'}`}>
            {s} {s !== 'ALL' && `(${bookings.filter(b => b.status === s).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card-glass py-16 text-center"><CalendarDays size={48} className="mx-auto mb-3 text-gray-300" /><p className="text-gray-500">No bookings found</p></div>
      ) : (
        <div className="space-y-3">
          {filtered.map(b => (
            <div key={b.id} className="card-glass">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CalendarDays size={22} className="text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-sm font-semibold text-gray-800">{b.facilityName}</h3>
                    <span className={`badge-status border ${statusColors[b.status]}`}>{b.status}</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-1"><span className="font-medium">Purpose:</span> {b.purpose}</p>
                  <div className="flex gap-4 text-[11px] text-gray-500 flex-wrap">
                    <span className="flex items-center gap-1"><Users size={12} /> {b.userName}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {dayjs(b.startTime).format('MMM D, h:mm A')} - {dayjs(b.endTime).format('h:mm A')}</span>
                    <span className="flex items-center gap-1"><Users size={12} /> {b.expectedAttendees} attendees</span>
                  </div>
                  {b.description && <p className="text-[11px] text-gray-400 mt-1 italic">"{b.description}"</p>}
                  {b.rejectionReason && <p className="text-[11px] text-red-500 mt-1">Rejection: {b.rejectionReason}</p>}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {b.status === 'PENDING' && (
                    <>
                      <button onClick={() => handleApprove(b.id)} className="p-2 bg-green-100 hover:bg-green-200 rounded-lg transition-colors" title="Approve">
                        <Check size={16} className="text-green-700" />
                      </button>
                      <button onClick={() => handleReject(b.id)} className="p-2 bg-red-100 hover:bg-red-200 rounded-lg transition-colors" title="Reject">
                        <X size={16} className="text-red-700" />
                      </button>
                    </>
                  )}
                  <button onClick={() => handleDelete(b.id)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors" title="Delete">
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
