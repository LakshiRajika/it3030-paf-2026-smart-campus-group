import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import bookingService from '../../services/bookingService';
import { 
    LayoutDashboard, Users, Calendar, CheckCircle, TrendingUp, 
    Download, ArrowLeft, Loader, BarChart3, PieChart as PieChartIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const BookingAnalytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const stats = await bookingService.getAnalytics();
            setData(stats);
        } catch (error) {
            console.error("Error fetching booking analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = async () => {
        setExporting(true);
        try {
            const bookings = await bookingService.getAllBookings();
            
            // Define CSV headers
            const headers = ['Booking ID', 'User Name', 'Resource', 'Date', 'Start Time', 'End Time', 'Status', 'Checked In'];
            
            // Format rows
            const rows = bookings.map(b => [
                b.id,
                b.userName,
                b.resourceName,
                b.date,
                b.startTime,
                b.endTime,
                b.status,
                b.checkedIn ? 'Yes' : 'No'
            ]);

            // Combine into CSV string
            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
            ].join('\n');

            // Download file
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `campus_bookings_report_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Export failed:", error);
        } finally {
            setExporting(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <Loader className="animate-spin text-indigo-600" size={40} />
            <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Assembling Dashboard...</p>
        </div>
    );

    if (!data) return (
        <div className="text-center py-20">
            <p className="text-slate-500">Failed to load analytics data.</p>
            <button onClick={fetchAnalytics} className="mt-4 text-indigo-600 font-bold">Try Again</button>
        </div>
    );

    const statusChartData = Object.keys(data.statusDistribution).map(key => ({
        name: key,
        value: data.statusDistribution[key]
    }));

    const resourceChartData = Object.keys(data.resourceUtilization)
        .map(key => ({
            name: key,
            count: data.resourceUtilization[key]
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8); // Top 8 resources

    const hourlyChartData = Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        time: `${i % 12 || 12}${i < 12 ? 'AM' : 'PM'}`,
        bookings: data.hourlyDistribution[i] || 0
    })).filter(h => h.hour >= 7 && h.hour <= 22); // Show 7 AM to 10 PM

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link to="/admin/bookings" className="p-2.5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all text-slate-500 hover:text-indigo-600">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            <BarChart3 className="w-8 h-8 text-indigo-600" />
                            Booking Strategy Center
                        </h1>
                        <p className="text-slate-500 mt-1">Resource utilization and occupancy analytics.</p>
                    </div>
                </div>
                
                <button 
                    onClick={handleExportCSV}
                    disabled={exporting}
                    className="bg-slate-900 text-white px-6 py-3 rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-200 font-bold text-sm disabled:opacity-50"
                >
                    {exporting ? <Loader className="animate-spin" size={16} /> : <Download size={16} />}
                    {exporting ? 'Generating Report...' : 'Export History (CSV)'}
                </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard 
                    label="Total Bookings" 
                    value={data.totalBookings} 
                    icon={Calendar} 
                    color="indigo" 
                    subtext="+8% from last week" 
                />
                <StatCard 
                    label="Approval Rate" 
                    value={`${data.approvalRate.toFixed(1)}%`} 
                    icon={CheckCircle} 
                    color="emerald" 
                    subtext="Healthy conversion" 
                />
                <StatCard 
                    label="Check-in Velocity" 
                    value={`${data.checkInRate.toFixed(1)}%`} 
                    icon={Users} 
                    color="amber" 
                    subtext="QR scan performance" 
                />
                <StatCard 
                    label="Growth Score" 
                    value="A+" 
                    icon={TrendingUp} 
                    color="purple" 
                    subtext="Resource demand high" 
                />
            </div>

            {/* Main Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Status Distribution */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <PieChartIcon className="w-5 h-5 text-indigo-500" />
                            Booking State Distribution
                        </h3>
                    </div>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusChartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {statusChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                                />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Resource Utilization */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500">
                    <h3 className="text-lg font-bold text-slate-800 mb-8">Most Utilized Resources</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={resourceChartData} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 'bold'}} width={100} />
                                <Tooltip 
                                    cursor={{fill: '#f8fafc'}}
                                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 10, 10, 0]} barSize={25} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Hourly Peak Times */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Peak Campus Activity</h3>
                        <p className="text-xs text-slate-400 mt-1">Average booking starts per hour of the day</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        <TrendingUp size={12} />
                        Peak at 10AM - 2PM
                    </div>
                </div>
                <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={hourlyChartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                            <Tooltip 
                                cursor={{fill: '#f8fafc'}}
                                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                            />
                            <Bar dataKey="bookings" fill="#6366f1" radius={[10, 10, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ label, value, icon: Icon, color, subtext }) => {
    const colorMap = {
        indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        amber: 'bg-amber-50 text-amber-600 border-amber-100',
        purple: 'bg-purple-50 text-purple-600 border-purple-100',
    };

    return (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-lg transition-all group">
            <div className={`w-12 h-12 rounded-2xl ${colorMap[color]} border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon size={22} />
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
            <p className="text-3xl font-black text-slate-900">{value}</p>
            <p className="text-[10px] text-slate-400 mt-2 font-medium">{subtext}</p>
        </div>
    );
};

export default BookingAnalytics;
