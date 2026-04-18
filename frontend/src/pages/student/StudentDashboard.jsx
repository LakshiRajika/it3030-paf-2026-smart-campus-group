import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingAPI, ticketAPI, facilityAPI, notificationAPI } from '../../services/api';
import { CalendarDays, Wrench, Building2, Bell, ArrowRight, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import dayjs from 'dayjs';

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-600',
  OPEN: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-purple-100 text-purple-700',
  RESOLVED: 'bg-green-100 text-green-700',
  CLOSED: 'bg-gray-100 text-gray-600',
};

export default function StudentDashboard() {
  const [bookings, setBookings] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [b, t, f, n] = await Promise.all([
          bookingAPI.getMy(), ticketAPI.getMy(), facilityAPI.getAvailable(), notificationAPI.getUnreadCount()
        ]);
        setBookings(b.data.data || []);
        setTickets(t.data.data || []);
        setFacilities(f.data.data || []);
        setUnreadCount(n.data.data?.count || 0);
      } catch {} finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent"></div></div>;

  const stats = [
    { label: 'My Bookings', value: bookings.length, icon: CalendarDays, color: 'bg-primary-500', link: '/dashboard/bookings' },
    { label: 'My Tickets', value: tickets.length, icon: Wrench, color: 'bg-accent-orange', link: '/dashboard/tickets' },
    { label: 'Available Rooms', value: facilities.length, icon: Building2, color: 'bg-accent-teal', link: '/dashboard/bookings/new' },
    { label: 'Notifications', value: unreadCount, icon: Bell, color: 'bg-accent-pink', link: '#' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Link to={s.link} key={s.label} className="stat-card hover:shadow-card-hover group">
            <div className={`w-12 h-12 ${s.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <s.icon size={22} className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-900">{s.value}</p>
              <p className="text-xs text-gray-500 font-medium">{s.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="card-glass">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-primary-900">Recent Bookings</h3>
            <Link to="/dashboard/bookings" className="text-xs text-primary-600 font-medium flex items-center gap-1 hover:text-primary-800">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          {bookings.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-sm">
              <CalendarDays size={40} className="mx-auto mb-2 opacity-40" />
              No bookings yet. <Link to="/dashboard/bookings/new" className="text-primary-600 font-medium">Create one!</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.slice(0, 4).map(b => (
                <div key={b.id} className="flex items-center gap-3 p-3 bg-surface-50 rounded-xl">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <CalendarDays size={18} className="text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{b.facilityName}</p>
                    <p className="text-[11px] text-gray-500">{dayjs(b.startTime).format('MMM D, YYYY h:mm A')}</p>
                  </div>
                  <span className={`badge-status ${statusColors[b.status]}`}>{b.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Tickets */}
        <div className="card-glass">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-primary-900">Recent Tickets</h3>
            <Link to="/dashboard/tickets" className="text-xs text-primary-600 font-medium flex items-center gap-1 hover:text-primary-800">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          {tickets.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-sm">
              <Wrench size={40} className="mx-auto mb-2 opacity-40" />
              No tickets yet. <Link to="/dashboard/tickets/new" className="text-primary-600 font-medium">Report an issue!</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.slice(0, 4).map(t => (
                <Link to={`/dashboard/tickets/${t.id}`} key={t.id} className="flex items-center gap-3 p-3 bg-surface-50 rounded-xl hover:bg-purple-50 transition-colors">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Wrench size={18} className="text-accent-orange" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{t.title}</p>
                    <p className="text-[11px] text-gray-500">{t.location} • {dayjs(t.createdAt).format('MMM D')}</p>
                  </div>
                  <span className={`badge-status ${statusColors[t.status]}`}>{t.status?.replace('_', ' ')}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Available Facilities */}
      <div className="card-glass">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-primary-900">Available Facilities</h3>
          <Link to="/dashboard/bookings/new" className="text-xs text-primary-600 font-medium flex items-center gap-1 hover:text-primary-800">
            Book Now <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {facilities.slice(0, 6).map(f => (
            <div key={f.id} className="p-4 bg-surface-50 rounded-xl border border-purple-100/50">
              <div className="flex items-start justify-between mb-2">
                <div className="w-9 h-9 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Building2 size={18} className="text-primary-600" />
                </div>
                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Available</span>
              </div>
              <h4 className="text-sm font-semibold text-gray-800">{f.name}</h4>
              <p className="text-[11px] text-gray-500 mt-0.5">{f.location}</p>
              <p className="text-[11px] text-gray-400">Capacity: {f.capacity}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
