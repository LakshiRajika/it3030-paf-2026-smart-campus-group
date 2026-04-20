import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck2, Wrench, Building2, Clock3, Loader } from 'lucide-react';
import bookingService from '../../services/bookingService';
import ticketService from '../../services/ticketService';
import resourceService from '../../services/resourceService';

const RANGE_OPTIONS = [
  { id: '7d', label: 'Last 7 days', days: 7 },
  { id: '30d', label: 'Last 30 days', days: 30 },
  { id: 'all', label: 'All time', days: null },
];

const adminModules = [
  {
    title: 'Manage Bookings',
    description: 'Review, approve, and reject all booking requests.',
    icon: CalendarCheck2,
    link: '/admin/bookings',
    badge: 'Module B',
    color: 'bg-indigo-600',
  },
  {
    title: 'Manage Tickets',
    description: 'Track maintenance incidents and assign updates.',
    icon: Wrench,
    link: '/admin/tickets',
    badge: 'Module C',
    color: 'bg-emerald-600',
  },
  {
    title: 'Manage Resources',
    description: 'Maintain facilities and assets catalogue records.',
    icon: Building2,
    link: '/admin/resources',
    badge: 'Module A',
    color: 'bg-amber-500',
  },
];

const AdminDashboard = () => {
  const [resources, setResources] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('30d');

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError('');
      try {
        const [resourcesData, bookingsData, ticketsData] = await Promise.all([
          resourceService.getAll(),
          bookingService.getAllBookings(),
          ticketService.getAllTickets(),
        ]);
        setResources(resourcesData || []);
        setBookings(bookingsData || []);
        setTickets(ticketsData || []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load admin analytics.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const filteredBookings = useMemo(() => {
    if (dateRange === 'all') return bookings;
    const selected = RANGE_OPTIONS.find((option) => option.id === dateRange);
    if (!selected?.days) return bookings;
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - selected.days + 1);

    return bookings.filter((booking) => {
      const value = booking.date || booking.createdAt;
      if (!value) return false;
      const bookingDate = booking.date ? new Date(`${booking.date}T00:00:00`) : new Date(value);
      if (Number.isNaN(bookingDate.getTime())) return false;
      return bookingDate >= start;
    });
  }, [bookings, dateRange]);

  const filteredTickets = useMemo(() => {
    if (dateRange === 'all') return tickets;
    const selected = RANGE_OPTIONS.find((option) => option.id === dateRange);
    if (!selected?.days) return tickets;
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - selected.days + 1);

    return tickets.filter((ticket) => {
      if (!ticket.createdAt) return false;
      const createdAt = new Date(ticket.createdAt);
      if (Number.isNaN(createdAt.getTime())) return false;
      return createdAt >= start;
    });
  }, [tickets, dateRange]);

  const pendingBookings = useMemo(
    () => filteredBookings.filter((booking) => booking.status === 'PENDING').length,
    [filteredBookings]
  );

  const approvedBookings = useMemo(
    () => filteredBookings.filter((booking) => booking.status === 'APPROVED').length,
    [filteredBookings]
  );

  const rejectedBookings = useMemo(
    () => filteredBookings.filter((booking) => booking.status === 'REJECTED').length,
    [filteredBookings]
  );

  const openTickets = useMemo(
    () => filteredTickets.filter((ticket) => ['OPEN', 'IN_PROGRESS'].includes(ticket.status)).length,
    [filteredTickets]
  );

  const topResources = useMemo(() => {
    const usageCount = new Map();
    filteredBookings.forEach((booking) => {
      const resourceName = booking.resourceName || booking.resourceId || 'Unknown Resource';
      usageCount.set(resourceName, (usageCount.get(resourceName) || 0) + 1);
    });

    return Array.from(usageCount.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filteredBookings]);

  const peakHours = useMemo(() => {
    const hourUsage = new Map();
    filteredBookings.forEach((booking) => {
      const hourKey = booking.startTime ? booking.startTime.slice(0, 2) : null;
      if (!hourKey) return;
      hourUsage.set(hourKey, (hourUsage.get(hourKey) || 0) + 1);
    });

    return Array.from(hourUsage.entries())
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filteredBookings]);

  const peakHourMax = useMemo(() => {
    if (!peakHours.length) return 1;
    return Math.max(...peakHours.map((item) => item.count), 1);
  }, [peakHours]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-10">
        <span className="inline-flex px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100 uppercase tracking-wider">
          Admin Portal
        </span>
        <h1 className="mt-3 text-3xl font-black text-slate-900 tracking-tight">Admin Dashboard</h1>
        <p className="mt-2 text-slate-500">
          Central access for administrative operations in the Smart Campus system.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Analytics Range:</span>
        {RANGE_OPTIONS.map((option) => (
          <button
            key={option.id}
            onClick={() => setDateRange(option.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
              dateRange === option.id
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
      <p className="mb-6 text-xs font-semibold text-slate-500">
        Showing analytics for:{' '}
        <span className="text-indigo-700">
          {RANGE_OPTIONS.find((option) => option.id === dateRange)?.label || 'Selected range'}
        </span>
      </p>

      {error && (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700 text-sm font-semibold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          title="Total Resources"
          value={resources.length}
          subtitle="Facilities and assets available (all time)"
          tone="indigo"
          loading={loading}
        />
        <StatCard
          title="Pending Bookings"
          value={pendingBookings}
          subtitle="In selected date range"
          tone="amber"
          loading={loading}
        />
        <StatCard
          title="Open Tickets"
          value={openTickets}
          subtitle="OPEN + IN_PROGRESS in selected range"
          tone="emerald"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <StatCard
          title="Approved Bookings"
          value={approvedBookings}
          subtitle="Approved within selected range"
          tone="indigo"
          loading={loading}
        />
        <StatCard
          title="Rejected Bookings"
          value={rejectedBookings}
          subtitle="Rejected within selected range"
          tone="amber"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-black text-slate-900">Top Resources</h2>
          <p className="text-sm text-slate-500 mt-1">Most frequently booked resources in selected range</p>
          <div className="mt-5 space-y-3">
            {loading ? (
              <div className="text-slate-500 text-sm flex items-center gap-2">
                <Loader className="w-4 h-4 animate-spin" />
                Loading usage data...
              </div>
            ) : topResources.length === 0 ? (
              <p className="text-slate-400 text-sm">No booking records available yet.</p>
            ) : (
              topResources.map((item, index) => (
                <div key={`${item.name}-${index}`} className="flex items-center justify-between border border-slate-100 rounded-xl px-4 py-3">
                  <span className="font-semibold text-slate-800">{item.name}</span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {item.count} bookings
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Clock3 className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-black text-slate-900">Peak Booking Hours</h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">Busiest hours based on booking start times in selected range</p>
          <div className="mt-5 space-y-3">
            {loading ? (
              <div className="text-slate-500 text-sm flex items-center gap-2">
                <Loader className="w-4 h-4 animate-spin" />
                Loading hourly data...
              </div>
            ) : peakHours.length === 0 ? (
              <p className="text-slate-400 text-sm">No booking time data available yet.</p>
            ) : (
              peakHours.map((item) => (
                <div key={item.hour} className="flex items-center justify-between border border-slate-100 rounded-xl px-4 py-3">
                  <div className="w-full">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-slate-800">
                        {item.hour}:00 - {String((Number(item.hour) + 1) % 24).padStart(2, '0')}:00
                      </span>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                        {item.count} bookings
                      </span>
                    </div>
                    <div className="mt-2 h-2.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-amber-500"
                        style={{ width: `${Math.max(8, (item.count / peakHourMax) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {adminModules.map((module) => (
          <Link
            key={module.title}
            to={module.link}
            className="group bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1"
          >
            <div className={`w-12 h-12 rounded-xl ${module.color} text-white flex items-center justify-center`}>
              <module.icon className="w-6 h-6" />
            </div>
            <div className="mt-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{module.badge}</span>
              <h2 className="mt-1 text-xl font-bold text-slate-900">{module.title}</h2>
              <p className="mt-2 text-sm text-slate-500">{module.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, subtitle, tone, loading }) => {
  const toneStyles = {
    indigo: 'bg-indigo-50 border-indigo-100 text-indigo-700',
    amber: 'bg-amber-50 border-amber-100 text-amber-700',
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-700',
  };

  return (
    <div className={`rounded-2xl border p-4 ${toneStyles[tone] || toneStyles.indigo}`}>
      <p className="text-xs font-bold uppercase tracking-wider opacity-80">{title}</p>
      <p className="mt-1 text-3xl font-black">
        {loading ? <Loader className="w-6 h-6 animate-spin" /> : value}
      </p>
      <p className="mt-2 text-xs font-semibold opacity-80">{subtitle}</p>
    </div>
  );
};

export default AdminDashboard;
