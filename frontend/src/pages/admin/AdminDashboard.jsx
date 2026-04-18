import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI, bookingAPI, ticketAPI } from '../../services/api';
import { message } from 'antd';
import { Users, CalendarDays, Wrench, Building2, Clock, CheckCircle, XCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import dayjs from 'dayjs';

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-700', APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700', OPEN: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-purple-100 text-purple-700', RESOLVED: 'bg-green-100 text-green-700',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, b, t] = await Promise.all([dashboardAPI.getStats(), bookingAPI.getAll(), ticketAPI.getAll()]);
        setStats(s.data.data);
        setRecentBookings((b.data.data || []).slice(0, 5));
        setRecentTickets((t.data.data || []).slice(0, 5));
      } catch { message.error('Failed to load dashboard'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent"></div></div>;

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'bg-primary-500', link: '/admin/users' },
    { label: 'Pending Bookings', value: stats?.pendingBookings || 0, icon: Clock, color: 'bg-yellow-500', link: '/admin/bookings' },
    { label: 'Open Tickets', value: stats?.openTickets || 0, icon: AlertTriangle, color: 'bg-accent-orange', link: '/admin/tickets' },
    { label: 'Total Facilities', value: stats?.totalFacilities || 0, icon: Building2, color: 'bg-accent-teal', link: '/admin/facilities' },
    { label: 'Approved Bookings', value: stats?.approvedBookings || 0, icon: CheckCircle, color: 'bg-green-500', link: '/admin/bookings' },
    { label: 'Resolved Tickets', value: stats?.resolvedTickets || 0, icon: CheckCircle, color: 'bg-emerald-500', link: '/admin/tickets' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="page-title">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map(s => (
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
            <Link to="/admin/bookings" className="text-xs text-primary-600 font-medium flex items-center gap-1">View All <ArrowRight size={14} /></Link>
          </div>
          <div className="space-y-2">
            {recentBookings.map(b => (
              <div key={b.id} className="flex items-center gap-3 p-3 bg-surface-50 rounded-xl">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{b.facilityName}</p>
                  <p className="text-[11px] text-gray-500">{b.userName} • {dayjs(b.startTime).format('MMM D, h:mm A')}</p>
                </div>
                <span className={`badge-status ${statusColors[b.status]}`}>{b.status}</span>
              </div>
            ))}
            {recentBookings.length === 0 && <p className="text-center text-gray-400 text-sm py-6">No bookings yet</p>}
          </div>
        </div>

        {/* Recent Tickets */}
        <div className="card-glass">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-primary-900">Recent Tickets</h3>
            <Link to="/admin/tickets" className="text-xs text-primary-600 font-medium flex items-center gap-1">View All <ArrowRight size={14} /></Link>
          </div>
          <div className="space-y-2">
            {recentTickets.map(t => (
              <Link to={`/admin/tickets/${t.id}`} key={t.id} className="flex items-center gap-3 p-3 bg-surface-50 rounded-xl hover:bg-purple-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{t.title}</p>
                  <p className="text-[11px] text-gray-500">{t.reporterName} • {t.location}</p>
                </div>
                <span className={`badge-status ${statusColors[t.status]}`}>{t.status?.replace('_', ' ')}</span>
              </Link>
            ))}
            {recentTickets.length === 0 && <p className="text-center text-gray-400 text-sm py-6">No tickets yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
