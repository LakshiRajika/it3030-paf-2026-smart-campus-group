import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Ticket, 
  MapPin, 
  Calendar, 
  Settings, 
  Users, 
  ShieldCheck,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { user, hasRole } = useAuth();
    const isAdmin = hasRole('ADMIN');

    const modules = [
        { 
          title: 'Facility Booking', 
          desc: 'Reserve classrooms, labs, and sports facilities instantly.', 
          icon: Calendar, 
          link: '/bookings', 
          color: 'from-emerald-500 to-teal-400',
          shadow: 'shadow-emerald-200'
        },
        { 
          title: 'Maintenance Hub', 
          desc: 'Report and track facility maintenance tickets.', 
          icon: Ticket, 
          link: '/tickets', 
          color: 'from-indigo-500 to-blue-400',
          shadow: 'shadow-indigo-200'
        },
        { 
          title: 'Campus Map', 
          desc: 'Interactive navigation and points of interest.', 
          icon: MapPin, 
          link: '/facilities', 
          color: 'from-amber-500 to-orange-400', 
          shadow: 'shadow-amber-200'
        },
        { 
          title: 'Safety & Security', 
          desc: 'Emergency alerts and security protocols.', 
          icon: ShieldCheck, 
          link: '/dashboard', 
          color: 'from-rose-500 to-pink-400',
          shadow: 'shadow-rose-200'
        },
    ];

    const stats = [
      { label: 'Active Bookings', value: '3', icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-100' },
      { label: 'Pending Tickets', value: '1', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
      { label: 'Resolved Issues', value: '12', icon: CheckCircle2, color: 'text-indigo-600', bg: 'bg-indigo-100' },
      { label: 'System Status', value: 'Optimal', icon: TrendingUp, color: 'text-teal-600', bg: 'bg-teal-100' }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
            
            {/* Welcome Banner */}
            <div className="relative rounded-3xl overflow-hidden bg-white shadow-sm border border-slate-200">
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-100/50 via-fuchsia-100/50 to-transparent blur-3xl rounded-full translate-x-1/3 -translate-y-1/3" />
              <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    Live Dashboard
                  </div>
                  <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                    Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-600">{user?.name || user?.email.split('@')[0]}</span>
                  </h1>
                  <p className="text-slate-500 text-lg">Here's what's happening around the campus today.</p>
                </div>
                {isAdmin && (
                  <div className="px-6 py-3 bg-slate-900 text-white rounded-2xl flex items-center gap-3 shadow-lg shadow-slate-200">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <div>
                      <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Access Level</div>
                      <div className="font-bold">Administrator</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                      <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">{stat.label}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Modules Grid */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Quick Access</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {modules.map((mod, idx) => (
                      <Link 
                        key={idx} 
                        to={mod.link}
                        className="group relative bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col h-full"
                      >
                          <div className={`absolute inset-0 bg-gradient-to-br ${mod.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                          
                          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${mod.color} flex items-center justify-center text-white shadow-lg ${mod.shadow} group-hover:scale-110 transition-transform duration-300 mb-6`}>
                              <mod.icon className="w-7 h-7" />
                          </div>
                          
                          <div className="flex-grow space-y-2 relative z-10">
                               <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{mod.title}</h3>
                               <p className="text-slate-500 text-sm leading-relaxed">{mod.desc}</p>
                          </div>
                          
                          <div className="pt-6 relative z-10 flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-indigo-600 transition-colors">
                                Open Module
                              </span>
                              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                                <TrendingUp className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                              </div>
                          </div>
                      </Link>
                  ))}
              </div>
            </div>

            {/* Admin Section */}
            {isAdmin && (
              <div className="bg-slate-900 rounded-3xl p-8 md:p-10 text-white overflow-hidden relative group mt-8 shadow-xl">
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-gradient-to-bl from-indigo-500/20 via-fuchsia-500/10 to-transparent blur-[80px] rounded-full translate-x-1/3 -translate-y-1/3" />
                  
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                      <div className="space-y-3">
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium text-white uppercase tracking-wider">
                            <AlertCircle className="w-3 h-3 text-rose-400" />
                            Admin Controls
                          </div>
                          <h2 className="text-3xl font-black tracking-tight text-white">System Administration</h2>
                          <p className="text-slate-400 font-medium max-w-xl">Manage users, analyze system usage, and monitor overall health of the Smart Campus platform.</p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                          <Link to="/admin/analytics" className="px-6 py-4 bg-white text-slate-900 rounded-2xl font-bold hover:bg-slate-100 transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                              <Users className="w-5 h-5" />
                              Manage Users
                          </Link>
                          <Link to="/admin/analytics" className="px-6 py-4 bg-white/10 text-white rounded-2xl font-bold hover:bg-white/20 transition-all flex items-center justify-center gap-3 border border-white/10 backdrop-blur-md">
                              <Settings className="w-5 h-5" />
                              System Settings
                          </Link>
                      </div>
                  </div>
              </div>
            )}
        </div>
    );
};

export default Dashboard;
