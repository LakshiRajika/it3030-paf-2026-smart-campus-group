import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Ticket, 
  MapPin, 
  Calendar, 
  Settings, 
  Users, 
  ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { user, hasRole } = useAuth();

    const modules = [
        { 
          title: 'Maintenance Hub', 
          desc: 'Report and track facility maintenance tickets.', 
          icon: Ticket, 
          link: '/tickets', 
          color: 'bg-indigo-600',
          author: 'Maintenance Module' 
        },
        { 
          title: 'Facility Booking', 
          desc: 'Reserve classrooms, labs, and sports facilities.', 
          icon: Calendar, 
          link: '/bookings', 
          color: 'bg-emerald-600',
          author: 'Booking Module' 
        },
        { 
          title: 'Campus Map', 
          desc: 'Interactive navigation and points of interest.', 
          icon: MapPin, 
          link: '/facilities', 
          color: 'bg-amber-500', 
          author: 'Infrastructure Module'
        },
        { 
          title: 'Safety & Security', 
          desc: 'Emergency alerts and security protocols.', 
          icon: ShieldCheck, 
          link: '/dashboard', 
          color: 'bg-rose-600',
          author: 'Security Module' 
        },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
            {/* Hero Section */}
            <div className="text-center space-y-4 max-w-3xl mx-auto">
                <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-tight">
                    Smart Campus <span className="text-indigo-600">Operations</span> Hub
                </h1>
                <p className="text-slate-500 text-xl font-medium">
                    Integrated management platform for a smarter, more efficient campus environment.
                </p>
                <div className="flex items-center justify-center gap-2 pt-4">
                  <span className="px-4 py-2 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-100 uppercase tracking-widest">
                      Welcome, {user?.email.split('@')[0]}
                  </span>
                  {hasRole('ADMIN') && (
                    <span className="px-4 py-2 bg-rose-50 text-rose-700 text-xs font-bold rounded-full border border-rose-100 uppercase tracking-widest">
                        Admin Access
                    </span>
                  )}
                </div>
            </div>

            {/* Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {modules.map((mod, idx) => (
                    <Link 
                      key={idx} 
                      to={mod.link}
                      className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col items-center text-center space-y-6"
                    >
                        <div className={`w-16 h-16 ${mod.color} rounded-[1.5rem] flex items-center justify-center text-white shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform duration-500`}>
                            <mod.icon className="w-8 h-8" />
                        </div>
                        <div className="space-y-2">
                             <h3 className="text-xl font-bold text-slate-900">{mod.title}</h3>
                             <p className="text-slate-500 text-sm leading-relaxed">{mod.desc}</p>
                        </div>
                        <div className="pt-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">
                              Explore Module
                            </span>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Admin Quick Links */}
            {hasRole('ADMIN') && (
              <div className="bg-slate-900 rounded-[3rem] p-10 text-white overflow-hidden relative group">
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                      <div className="space-y-2">
                          <h2 className="text-3xl font-black tracking-tight">System Administration</h2>
                          <p className="text-slate-400 font-medium">Manage cross-module roles, system parameters and global analytics.</p>
                      </div>
                      <div className="flex gap-4">
                          <Link to="/admin/analytics" className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-bold hover:bg-slate-100 transition-all flex items-center gap-2">
                              <Users className="w-5 h-5" />
                              User Access
                          </Link>
                          <Link to="/dashboard" className="px-6 py-3 bg-white/10 text-white rounded-2xl font-bold hover:bg-white/20 transition-all flex items-center gap-2 border border-white/10">
                              <Settings className="w-5 h-5" />
                              Global Log
                          </Link>
                      </div>
                  </div>
                  {/* Decorative Gradient */}
                  <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600 blur-[150px] opacity-20 -translate-y-1/2 translate-x-1/2 rounded-full"></div>
              </div>
            )}
        </div>
    );
};

export default Dashboard;
