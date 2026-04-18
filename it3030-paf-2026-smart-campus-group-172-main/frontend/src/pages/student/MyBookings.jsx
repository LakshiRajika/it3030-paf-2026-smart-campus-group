import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingAPI } from '../../services/api';
import { message, Modal } from 'antd';
import { CalendarDays, Plus, X, Clock, MapPin, Users } from 'lucide-react';
import dayjs from 'dayjs';

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  APPROVED: 'bg-green-100 text-green-700 border-green-200',
  REJECTED: 'bg-red-100 text-red-700 border-red-200',
  CANCELLED: 'bg-gray-100 text-gray-600 border-gray-200',
  COMPLETED: 'bg-blue-100 text-blue-700 border-blue-200',
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      const res = await bookingAPI.getMy();
      setBookings(res.data.data || []);
    } catch (err) {
      message.error('Failed to load bookings');
    } finally { setLoading(false); }
  };

  const handleCancel = (id) => {
    Modal.confirm({
      title: 'Cancel Booking',
      content: 'Are you sure you want to cancel this booking?',
      okText: 'Yes, Cancel',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await bookingAPI.cancel(id);
          message.success('Booking cancelled successfully');
          fetchBookings();
        } catch (err) { message.error(err.response?.data?.message || 'Failed to cancel'); }
      }
    });
  };

  const filtered = filter === 'ALL' ? bookings : bookings.filter(b => b.status === filter);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent"></div></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="page-title">My Bookings</h1>
        <Link to="/dashboard/bookings/new" className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={18} /> New Booking
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${filter === s ? 'bg-primary-600 text-white shadow-md' : 'bg-white text-gray-600 border border-purple-200 hover:bg-purple-50'}`}>
            {s}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card-glass py-16 text-center">
          <CalendarDays size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">No bookings found</p>
          <Link to="/dashboard/bookings/new" className="text-primary-600 text-sm font-medium mt-1 inline-block">Create your first booking</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(b => (
            <div key={b.id} className="card-glass">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-primary-100 rounded-xl flex items-center justify-center">
                    <CalendarDays size={20} className="text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-sm">{b.facilityName}</h3>
                    <p className="text-[11px] text-gray-500">{b.purpose}</p>
                  </div>
                </div>
                <span className={`badge-status border ${statusColors[b.status]}`}>{b.status}</span>
              </div>

              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex items-center gap-2"><Clock size={14} className="text-gray-400" /> {dayjs(b.startTime).format('MMM D, YYYY h:mm A')} - {dayjs(b.endTime).format('h:mm A')}</div>
                <div className="flex items-center gap-2"><Users size={14} className="text-gray-400" /> {b.expectedAttendees} attendees</div>
                {b.description && <p className="text-gray-500 italic">"{b.description}"</p>}
              </div>

              {b.rejectionReason && (
                <div className="mt-3 p-2 bg-red-50 rounded-lg text-xs text-red-600">
                  <span className="font-semibold">Rejection Reason:</span> {b.rejectionReason}
                </div>
              )}
              {b.adminRemarks && (
                <div className="mt-2 p-2 bg-green-50 rounded-lg text-xs text-green-600">
                  <span className="font-semibold">Admin Remarks:</span> {b.adminRemarks}
                </div>
              )}

              {(b.status === 'PENDING' || b.status === 'APPROVED') && (
                <div className="mt-4 pt-3 border-t border-purple-100 flex justify-end">
                  <button onClick={() => handleCancel(b.id)}
                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium">
                    <X size={14} /> Cancel Booking
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
