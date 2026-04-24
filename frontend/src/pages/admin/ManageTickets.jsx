import React, { useState, useEffect } from 'react';
import ticketService from '../../services/ticketService';
import { StatusBadge } from '../../components/ticket/TicketForm';
import { useNavigate, Link } from 'react-router-dom';
import { BarChart3, Search, MapPin, AlertCircle, Clock, ChevronRight, LayoutGrid, List } from 'lucide-react';

const ManageTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid');
  const navigate = useNavigate();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await ticketService.getAllTickets();
      setTickets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = filter === 'ALL' 
    ? tickets 
    : tickets.filter(t => t.status === filter);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Admin Ticket Management</h1>
          <p className="text-slate-500 text-sm">Monitor and assign campus maintenance requests.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex gap-2 bg-white p-1 rounded-xl shadow-sm border border-slate-200">
            {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filter === f ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          
          <Link 
            to="/admin/analytics" 
            className="bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2 shadow-sm font-bold text-sm"
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
          </Link>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
        <div className="relative w-full md:w-auto flex-grow max-w-md">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search tickets by location or issue..." 
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm transition-shadow"
          />
        </div>

        <div className="flex bg-white rounded-xl shadow-sm border border-slate-200 p-1">
          <button 
            onClick={() => setViewMode('grid')}
            title="Grid View"
            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setViewMode('table')}
            title="Table View"
            className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 animate-pulse flex items-center gap-6">
              <div className="w-12 h-12 bg-slate-100 rounded-full shrink-0"></div>
              <div className="space-y-3 w-full">
                <div className="h-4 bg-slate-100 rounded w-1/4"></div>
                <div className="h-3 bg-slate-50 rounded w-1/2"></div>
              </div>
            </div>
          ))
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm rotate-3">
              <AlertCircle className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-black text-slate-800">No Tickets Found</h3>
            <p className="text-slate-500 text-sm mt-1">There are no {filter !== 'ALL' ? filter.toLowerCase() : ''} requests at the moment.</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredTickets.map((ticket) => (
              <div 
                key={ticket.id} 
                className="group relative bg-white p-6 rounded-3xl shadow-sm hover:shadow-xl border border-slate-100 hover:border-indigo-100 transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Decorative background element */}
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full opacity-50 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>

                <div>
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-black shadow-inner overflow-hidden border border-white">
                        {ticket.createdByName ? (
                          <img src={`https://ui-avatars.com/api/?name=${ticket.createdByName}&background=random&color=fff`} className="w-full h-full object-cover" alt="" />
                        ) : (
                          ticket.createdById?.substring(0, 2).toUpperCase()
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{ticket.createdByName || ticket.createdById}</h4>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                       <StatusBadge status={ticket.status} />
                       <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wide
                        ${ticket.priority === 'CRITICAL' ? 'bg-rose-100 text-rose-700' : 
                          ticket.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' : 
                          'bg-slate-100 text-slate-600'
                        }`}>
                        {ticket.priority} PRIORITY
                      </span>
                    </div>
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center">
                        <MapPin className="w-3.5 h-3.5 text-amber-600" />
                      </div>
                      <h3 className="font-black text-slate-800 text-base">{ticket.location}</h3>
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-2 mt-2 leading-relaxed ml-8">
                       {ticket.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center relative z-10">
                  <span className="text-xs font-bold text-slate-400">ID: {ticket.id.substring(ticket.id.length - 8)}</span>
                  <button 
                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-indigo-600 hover:shadow-lg hover:-translate-y-0.5 transition-all outline-none"
                  >
                    Action <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Requested By</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Issue</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500 overflow-hidden border-2 border-white shadow-sm">
                          {ticket.createdByName ? (
                            <img src={`https://ui-avatars.com/api/?name=${ticket.createdByName}&background=random&color=fff`} className="w-full h-full object-cover" alt="" />
                          ) : (
                            ticket.createdById?.substring(0, 2).toUpperCase()
                          )}
                        </div>
                        <div>
                          <span className="block text-sm font-bold text-slate-700">{ticket.createdByName || ticket.createdById}</span>
                          <span className="block text-[10px] text-slate-400 uppercase font-semibold">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-sm font-bold text-slate-800">{ticket.location}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-500 max-w-xs line-clamp-1">{ticket.description}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        ticket.priority === 'CRITICAL' ? 'bg-rose-50 text-rose-600' : 
                        ticket.priority === 'HIGH' ? 'bg-orange-50 text-orange-600' : 'bg-slate-50 text-slate-500'
                      }`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => navigate(`/tickets/${ticket.id}`)}
                        className="text-indigo-600 font-bold text-xs hover:text-white bg-indigo-50 hover:bg-indigo-600 px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1 justify-end ml-auto"
                      >
                        Action <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageTickets;
