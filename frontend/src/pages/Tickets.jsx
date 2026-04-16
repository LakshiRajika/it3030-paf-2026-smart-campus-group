import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ticketService from '../services/ticketService';
import { TicketForm, StatusBadge } from '../components/ticket/TicketForm';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  Ticket as TicketIcon,
  BarChart3,
  ChevronRight 
} from 'lucide-react';

const Tickets = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ active: 0, resolved: 0, total: 0 });

  const { user } = useAuth();

  useEffect(() => {
    fetchTickets();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await ticketService.getStats();
      setStats({
        active: data.open + data.inProgress,
        resolved: data.resolved,
        total: data.total
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const fetchTickets = async () => {
    if (!user) return;
    try {
      setLoading(true);
      let data;
      if (user.roles.some(r => r === 'ROLE_ADMIN' || r === 'ROLE_MANAGER' || (typeof r === 'object' && r.authority === 'ROLE_ADMIN'))) {
        data = await ticketService.getAllTickets();
      } else {
        data = await ticketService.getMyTickets(user.sub);
      }
      setTickets(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load tickets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (formData, files) => {
    if (!user) {
      alert('You must be logged in to create a ticket.');
      return;
    }

    try {
      setIsSubmitting(true);
      const ticketData = { ...formData, createdById: user.sub };
      await ticketService.createTicket(ticketData, files);
      setShowForm(false);
      fetchTickets();
    } catch (err) {
      const data = err.response?.data;
      const errorMsg = typeof data === 'object' ? (data.message || JSON.stringify(data)) : (data || err.message);
      alert('Error creating ticket: ' + errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header & Stats Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Maintenance Hub</h1>
          <p className="text-slate-500 font-medium">Manage and track campus facility incidents.</p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <div className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active</p>
              <p className="text-lg font-black text-slate-900 leading-tight">{stats.active}</p>
            </div>
          </div>
          
          <div className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Resolved</p>
              <p className="text-lg font-black text-slate-900 leading-tight">{stats.resolved}</p>
            </div>
          </div>

          {(user.roles.some(r => r === 'ROLE_ADMIN' || r === 'ROLE_MANAGER' || (typeof r === 'object' && r.authority === 'ROLE_ADMIN'))) && (
            <Link 
              to="/admin/analytics" 
              className="bg-slate-900 text-white px-6 py-3 rounded-2xl hover:bg-slate-800 transition-all flex items-center gap-3 shadow-lg shadow-slate-200"
            >
              <BarChart3 className="w-5 h-5" />
              <span className="font-bold text-sm">Analytics</span>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </Link>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center pt-2">
        <div className="flex gap-2">
          {!showForm && (
            <button 
              className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
              onClick={() => setShowForm(true)}
            >
              <Plus className="w-5 h-5" />
              New Ticket
            </button>
          )}
          {showForm && (
            <button 
              className="bg-slate-100 text-slate-600 px-6 py-3 rounded-2xl font-bold hover:bg-slate-200 transition-all flex items-center gap-2"
              onClick={() => setShowForm(false)}
            >
              Back to List
            </button>
          )}
        </div>
        
        {!showForm && (
          <div className="flex w-full md:w-auto gap-2">
            <div className="relative flex-grow">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search location..." 
                className="w-full md:w-64 pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
              />
            </div>
            <button className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-500 hover:bg-slate-50 shadow-sm">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {showForm ? (
        <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-800">New Incident Report</h2>
            <p className="text-sm text-slate-500">Please provide accurate details for faster resolution.</p>
          </div>
          <TicketForm onSubmit={handleCreateTicket} isLoading={isSubmitting} />
        </div>
      ) : (
        <>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-slate-100 animate-pulse h-64 rounded-2xl shadow-sm border border-slate-200"></div>
              ))}
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
              <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <TicketIcon className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No Tickets Yet</h3>
              <p className="text-slate-500 mb-6">You haven't reported any incidents yet.</p>
              <button 
                onClick={() => setShowForm(true)}
                className="text-indigo-600 font-bold hover:underline"
              >
                Create your first ticket
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="group bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="flex justify-between items-start mb-4">
                    <StatusBadge status={ticket.status} />
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      ticket.priority === 'CRITICAL' ? 'bg-rose-50 text-rose-600' : 
                      ticket.priority === 'HIGH' ? 'bg-orange-50 text-orange-600' :
                      'text-slate-400'
                    }`}>
                      {ticket.priority} Priority
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2 truncate text-lg tracking-tight">{ticket.location}</h3>
                  <p className="text-slate-500 text-sm line-clamp-3 mb-6 min-h-[60px] leading-relaxed">
                    {ticket.description}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2 text-slate-400">
                       <Clock className="w-3.5 h-3.5" />
                       <span className="text-[10px] font-bold uppercase">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </div>
                    <button 
                      onClick={() => navigate(`/tickets/${ticket.id}`)}
                      className="text-indigo-600 text-sm font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1"
                    >
                      View Details
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Tickets;
