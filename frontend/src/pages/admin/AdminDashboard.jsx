import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck2, Wrench, Building2, Clock3, Loader, TrendingUp, AlertCircle, ArrowRight, ShieldCheck, CheckCircle2, XCircle, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
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
    description: 'Review and approve requests.',
    icon: CalendarCheck2,
    link: '/admin/bookings',
    color: 'from-indigo-500 to-blue-500',
    shadow: 'shadow-indigo-200'
  },
  {
    title: 'Manage Tickets',
    description: 'Track maintenance incidents.',
    icon: Wrench,
    link: '/admin/tickets',
    color: 'from-emerald-500 to-teal-500',
    shadow: 'shadow-emerald-200'
  },
  {
    title: 'Manage Resources',
    description: 'Update facilities and assets.',
    icon: Building2,
    link: '/admin/resources',
    color: 'from-amber-500 to-orange-500',
    shadow: 'shadow-amber-200'
  },
];

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];

const AdminDashboard = () => {
  const [resources, setResources] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('30d');
  const [isExporting, setIsExporting] = useState(false);
  const dashboardRef = useRef(null);

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

  const pendingBookings = useMemo(() => filteredBookings.filter((booking) => booking.status === 'PENDING').length, [filteredBookings]);
  const approvedBookings = useMemo(() => filteredBookings.filter((booking) => booking.status === 'APPROVED').length, [filteredBookings]);
  const rejectedBookings = useMemo(() => filteredBookings.filter((booking) => booking.status === 'REJECTED').length, [filteredBookings]);
  const openTickets = useMemo(() => filteredTickets.filter((ticket) => ['OPEN', 'IN_PROGRESS'].includes(ticket.status)).length, [filteredTickets]);

  const topResources = useMemo(() => {
    const usageCount = new Map();
    filteredBookings.forEach((booking) => {
      const resourceName = booking.resourceName || booking.resourceId || 'Unknown Resource';
      usageCount.set(resourceName, (usageCount.get(resourceName) || 0) + 1);
    });

    return Array.from(usageCount.entries())
      .map(([name, count]) => ({ name, value: count }))
      .sort((a, b) => b.value - a.value)
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
      .map(([hour, count]) => ({ 
        name: `${hour}:00`, 
        Bookings: count 
      }))
      .sort((a, b) => parseInt(a.name) - parseInt(b.name));
  }, [filteredBookings]);

  const recentActivity = useMemo(() => {
    const pending = filteredBookings
        .filter(b => b.status === 'PENDING')
        .map(b => ({ id: b.id || b._id, type: 'booking', title: `Booking: ${b.resourceName || 'Resource'}`, date: b.createdAt || b.date, link: '/admin/bookings' }));
    
    const open = filteredTickets
        .filter(t => t.status === 'OPEN')
        .map(t => ({ id: t.id || t._id, type: 'ticket', title: `Ticket: ${t.title || 'Maintenance Issue'}`, date: t.createdAt, link: '/admin/tickets' }));
    
    return [...pending, ...open]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [filteredBookings, filteredTickets]);

  const handleExportPDF = async () => {
    if (!dashboardRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(dashboardRef.current, { 
        scale: 2, 
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`admin_report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('PDF Export Error:', err);
      setError('Failed to export PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fade-in" ref={dashboardRef}>
      
      {/* Premium Header */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/30 via-fuchsia-500/20 to-transparent blur-3xl rounded-full translate-x-1/3 -translate-y-1/3" />
        <div className="relative p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-wider border border-white/20">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Administrator Access
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">System Analytics</h1>
            <p className="text-slate-400 text-sm max-w-xl">
              Monitor campus resources, manage approvals, and track maintenance efficiency.
            </p>
          </div>
          
          <div className="flex flex-col gap-2 w-full md:w-auto">
            <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Date Range:</span>
                <button 
                    onClick={handleExportPDF}
                    disabled={isExporting}
                    className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors disabled:opacity-50"
                    data-html2canvas-ignore="true"
                >
                    {isExporting ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                    Export PDF
                </button>
            </div>
            <div className="flex bg-white/10 p-1 rounded-xl border border-white/10 backdrop-blur-md" data-html2canvas-ignore="true">
              {RANGE_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setDateRange(option.id)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    dateRange === option.id
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-4 text-rose-700 text-sm font-semibold flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            {error}
        </div>
      )}

      {/* Quick Actions (Moved to Top) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {adminModules.map((module) => (
          <Link
            key={module.title}
            to={module.link}
            className="group bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden flex items-center gap-5"
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${module.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${module.color} text-white flex items-center justify-center shadow-lg ${module.shadow} group-hover:scale-110 transition-transform duration-300`}>
              <module.icon className="w-7 h-7" />
            </div>
            <div className="relative z-10">
              <h2 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{module.title}</h2>
              <p className="text-sm text-slate-500">{module.description}</p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-300 absolute right-6 group-hover:text-indigo-500 transition-colors group-hover:translate-x-1" />
          </Link>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Resources" value={resources.length} icon={Building2} color="text-indigo-600" bg="bg-indigo-100" loading={loading} />
        <StatCard title="Pending Approvals" value={pendingBookings} icon={Clock3} color="text-amber-600" bg="bg-amber-100" loading={loading} alert={pendingBookings > 0} />
        <StatCard title="Open Tickets" value={openTickets} icon={Wrench} color="text-rose-600" bg="bg-rose-100" loading={loading} alert={openTickets > 0} />
        <StatCard title="Approved Bookings" value={approvedBookings} icon={CheckCircle2} color="text-emerald-600" bg="bg-emerald-100" loading={loading} />
        <StatCard title="Rejected" value={rejectedBookings} icon={XCircle} color="text-slate-600" bg="bg-slate-100" loading={loading} />
      </div>

      {/* Analytics & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Peak Booking Hours</h2>
                        <p className="text-sm text-slate-500 mt-1">Traffic distribution throughout the day</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-indigo-600" />
                    </div>
                </div>
                
                <div className="h-72 w-full">
                    {loading ? (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 gap-2"><Loader className="w-5 h-5 animate-spin" /> Loading...</div>
                    ) : peakHours.length === 0 ? (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">No data available</div>
                    ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={peakHours}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} />
                        <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                        <Bar dataKey="Bookings" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={30} />
                        </BarChart>
                    </ResponsiveContainer>
                    )}
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-8">Top Resources Distribution</h2>
                <div className="h-72 w-full flex items-center">
                    {loading ? (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 gap-2"><Loader className="w-5 h-5 animate-spin" /> Loading...</div>
                    ) : topResources.length === 0 ? (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">No data available</div>
                    ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                        <Pie
                            data={topResources}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {topResources.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                        </PieChart>
                    </ResponsiveContainer>
                    )}
                    
                    {!loading && topResources.length > 0 && (
                        <div className="w-1/2 pl-4 space-y-3">
                            {topResources.map((res, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[idx % COLORS.length]}} />
                                    <div className="flex-1 text-sm font-medium text-slate-700 truncate">{res.name}</div>
                                    <div className="text-sm font-bold text-slate-900">{res.value}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Requires Attention</h2>
            <p className="text-sm text-slate-500 mb-8">Recent pending bookings and open tickets.</p>
            
            <div className="flex-1 space-y-4">
                {loading ? (
                    <div className="flex items-center justify-center h-full text-slate-400 gap-2"><Loader className="w-5 h-5 animate-spin" /> Loading...</div>
                ) : recentActivity.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <div>
                            <div className="font-bold text-slate-900">All caught up!</div>
                            <div className="text-sm text-slate-500">No pending tasks at the moment.</div>
                        </div>
                    </div>
                ) : (
                    recentActivity.map((item, idx) => (
                        <Link 
                            key={idx} 
                            to={item.link}
                            className="block p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-100 transition-colors group"
                        >
                            <div className="flex items-start gap-3">
                                <div className={`mt-1 w-2 h-2 rounded-full ${item.type === 'booking' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                                <div className="flex-1">
                                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors line-clamp-1">{item.title}</h3>
                                    <p className="text-xs text-slate-500 mt-1">
                                        {new Date(item.date).toLocaleDateString()} at {new Date(item.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                            </div>
                        </Link>
                    ))
                )}
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-100">
                <Link to="/admin/bookings" className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center justify-center gap-2">
                    View All Activity <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </div>

      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color, bg, loading, alert }) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
      {alert && (
        <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/10 blur-xl rounded-bl-full" />
      )}
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${bg}`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div>
        <p className="mt-1 text-3xl font-black text-slate-900">
          {loading ? <Loader className="w-6 h-6 animate-spin text-slate-300" /> : value}
        </p>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-2">{title}</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
