import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ticketService from '../services/ticketService';
import { StatusBadge } from '../components/ticket/TicketForm';
import { useAuth } from '../context/AuthContext';
import { 
  Clock, 
  CheckCircle2, 
  Ticket as TicketIcon,
  ChevronRight,
  ClipboardList,
  AlertCircle
} from 'lucide-react';

const TechnicianTasks = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ open: 0, inProgress: 0, resolved: 0 });

  const { user } = useAuth();

  const fetchAssignedTickets = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await ticketService.getAssignedTickets(user.sub);
      setTickets(data);
      
      // Calculate stats from assigned tickets
      const counts = data.reduce((acc, t) => {
        if (t.status === 'OPEN') acc.open++;
        else if (t.status === 'IN_PROGRESS') acc.inProgress++;
        else if (t.status === 'RESOLVED' || t.status === 'CLOSED') acc.resolved++;
        return acc;
      }, { open: 0, inProgress: 0, resolved: 0 });
      
      setStats(counts);
    } catch (err) {
      console.error(err);
      alert('Failed to load your tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAssignedTickets();
  }, [fetchAssignedTickets]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header & Stats Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Technician Dashboard</h1>
          <p className="text-slate-500 font-medium">Manage and resolve your assigned facility tasks.</p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <div className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">To Do</p>
              <p className="text-lg font-black text-slate-900 leading-tight">{stats.open}</p>
            </div>
          </div>
          
          <div className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">In Progress</p>
              <p className="text-lg font-black text-slate-900 leading-tight">{stats.inProgress}</p>
            </div>
          </div>
          
          <div className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fixed</p>
              <p className="text-lg font-black text-slate-900 leading-tight">{stats.resolved}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-2">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          My Assigned Tasks
          <span className="bg-indigo-50 text-indigo-600 text-xs px-2 py-0.5 rounded-full">{tickets.length}</span>
        </h2>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-slate-100 animate-pulse h-64 rounded-2xl shadow-sm border border-slate-200"></div>
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
          <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <CheckCircle2 className="w-10 h-10 text-emerald-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">All Caught Up!</h3>
          <p className="text-slate-500">You don't have any assigned tasks at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map((ticket) => (
            <div 
              key={ticket.id} 
              className={`group bg-white rounded-3xl p-6 shadow-sm border transition-all duration-300 hover:shadow-xl hover:-translate-y-1
                ${ticket.priority === 'CRITICAL' ? 'border-rose-100' : 'border-slate-100'}
              `}
            >
              <div className="flex justify-between items-start mb-4">
                <StatusBadge status={ticket.status} />
                {ticket.priority === 'CRITICAL' && (
                  <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-600 uppercase">
                    <AlertCircle className="w-3 h-3" />
                    Critical
                  </span>
                )}
              </div>
              
              <h3 className="font-bold text-slate-900 mb-2 truncate text-lg tracking-tight">{ticket.location}</h3>
              <p className="text-slate-500 text-sm line-clamp-3 mb-6 min-h-[60px] leading-relaxed">
                {ticket.description}
              </p>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Reported By</span>
                  <span className="text-xs font-semibold text-slate-700">{ticket.createdById ? 'Request #' + ticket.id.substring(0, 5) : 'Anonymous'}</span>
                </div>
                <button 
                  onClick={() => navigate(`/tickets/${ticket.id}`)}
                  className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-all flex items-center gap-1"
                >
                  Work on Task
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TechnicianTasks;
