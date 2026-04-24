import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import ticketService from '../services/ticketService';
import { LayoutDashboard, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Analytics = () => {
    const [data, setData] = useState(null);
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const [stats, techs] = await Promise.all([
                ticketService.getAnalytics(),
                ticketService.getTechnicians()
            ]);
            setData(stats);
            setTechnicians(techs);
        } catch (error) {
            console.error("Error fetching analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    );

    if (!data) return <div className="text-center py-20">Failed to load analytics data.</div>;

    const statusData = Object.keys(data.statusDistribution).map(key => ({
        name: key.replace('_', ' '),
        value: data.statusDistribution[key]
    }));

    const categoryData = Object.keys(data.categoryDistribution).map(key => ({
        name: key,
        count: data.categoryDistribution[key]
    }));

    const technicianData = Object.keys(data.technicianWorkload || {}).map(id => {
        const tech = technicians.find(t => t.id === id);
        return {
            name: tech ? (tech.name || tech.email.split('@')[0]) : 'Unknown',
            tickets: data.technicianWorkload[id]
        };
    });

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <LayoutDashboard className="w-8 h-8 text-indigo-600" />
                        Campus Health Analytics
                    </h1>
                    <p className="text-slate-500 mt-1">Real-time performance and SLA tracking across campus facilities.</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global SLA</p>
                        <p className="text-xl font-black text-emerald-500">94.2%</p>
                    </div>
                    <TrendingUp className="w-6 h-6 text-emerald-500" />
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Total Tickets</p>
                    <p className="text-3xl font-black text-slate-900">{data.totalTickets}</p>
                    <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
                        <span className="text-emerald-500 font-bold">+12%</span> vs last month
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Avg. Resolution</p>
                    <p className="text-3xl font-black text-slate-900">{data.avgResolutionTimeHours.toFixed(1)}h</p>
                    <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
                        <span className="text-amber-500 font-bold">-2h</span> optimization target
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Open Issues</p>
                    <p className="text-3xl font-black text-amber-500">{data.statusDistribution.OPEN || 0}</p>
                    <div className="mt-2 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-500" />
                        <span className="text-[10px] text-slate-400">Needs attention</span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Success Rate</p>
                    <p className="text-3xl font-black text-emerald-500">88%</p>
                    <div className="mt-2 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-500" />
                        <span className="text-[10px] text-slate-400">First-time resolution</span>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Status Distribution */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-8">Incident Status Distribution</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category Breakdown */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-8">Tickets by Category</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={categoryData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                <Tooltip 
                                    cursor={{fill: '#f8fafc'}}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Technician Workload */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-8 flex items-center gap-2">
                    Technician Workload
                    <span className="text-xs font-normal text-slate-400 font-sans tracking-normal">Number of assigned tickets per specialist</span>
                </h3>
                <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={technicianData} layout="vertical" margin={{ left: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                            <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                            <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 'bold'}} width={100} />
                            <Tooltip 
                                cursor={{fill: '#f8fafc'}}
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                            />
                            <Bar dataKey="tickets" fill="#8b5cf6" radius={[0, 8, 8, 0]} barSize={30} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
