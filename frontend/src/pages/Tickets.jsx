import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ChevronRight,
  X
} from 'lucide-react';

const Tickets = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stats, setStats] = useState({ active: 0, resolved: 0, total: 0 });
  
  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [showFilters, setShowFilters] = useState(false);

  const { user } = useAuth();

  // Update stats
  const updateStats = useCallback((ticketList) => {
    const active = ticketList.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;
    const resolved = ticketList.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
    setStats({
      active,
      resolved,
      total: ticketList.length
    });
  }, []);

  // Fetch tickets
  const fetchTickets = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      let data;
      const isAdmin = user.roles?.some(r => r === 'ROLE_ADMIN' || r === 'ROLE_MANAGER' || r?.authority === 'ROLE_ADMIN');
      if (isAdmin) {
        data = await ticketService.getAllTickets();
      } else {
        data = await ticketService.getMyTickets(user.sub);
      }
      setTickets(data);
      setFilteredTickets(data);
      updateStats(data);
    } catch (err) {
      console.error(err);
      alert('Failed to load tickets. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user, updateStats]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // 🔍 SEARCH AND FILTER FUNCTION
  const applyFilters = useCallback(() => {
    let filtered = [...tickets];
    
    // Search by location or description
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(ticket => 
        ticket.location?.toLowerCase().includes(term) ||
        ticket.description?.toLowerCase().includes(term) ||
        ticket.id?.toLowerCase().includes(term)
      );
    }
    
    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }
    
    // Filter by priority
    if (priorityFilter !== 'ALL') {
      filtered = filtered.filter(ticket => ticket.priority === priorityFilter);
    }
    
    setFilteredTickets(filtered);
    updateStats(filtered);
  }, [tickets, searchTerm, statusFilter, priorityFilter, updateStats]);

  // Apply filters when dependencies change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
  };

  const handleCreateTicket = async (formData, files) => {
    if (!user) {
      alert('You must be logged in to create a ticket.');
      return;
    }

    try {
      setIsSubmitting(true);
      const ticketData = { 
        ...formData, 
        createdById: user.sub,
        createdByName: user.name || user.email?.split('@')[0] || 'Anonymous'
      };
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

  // Get unique statuses and priorities for filter buttons
  const uniqueStatuses = ['ALL', ...new Set(tickets.map(t => t.status))];
  const uniquePriorities = ['ALL', ...new Set(tickets.map(t => t.priority))];

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
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by location, description, or ticket ID..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-5 py-3 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
              showFilters || statusFilter !== 'ALL' || priorityFilter !== 'ALL'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {(statusFilter !== 'ALL' || priorityFilter !== 'ALL') && (
              <span className="bg-white text-indigo-600 rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold">
                {(statusFilter !== 'ALL' ? 1 : 0) + (priorityFilter !== 'ALL' ? 1 : 0)}
              </span>
            )}
          </button>
          
          {/* New Ticket Button */}
          {!showForm && (
            <button 
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
              onClick={() => setShowForm(true)}
            >
              <Plus className="w-5 h-5" />
              New Ticket
            </button>
          )}
        </div>
        
        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status Filter */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Status</label>
                <div className="flex flex-wrap gap-2">
                  {uniqueStatuses.map(status => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        statusFilter === status
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {status === 'ALL' ? 'All Status' : status.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Priority Filter */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Priority</label>
                <div className="flex flex-wrap gap-2">
                  {uniquePriorities.map(priority => (
                    <button
                      key={priority}
                      onClick={() => setPriorityFilter(priority)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        priorityFilter === priority
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {priority === 'ALL' ? 'All Priority' : priority}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Clear Filters Button */}
            {(searchTerm || statusFilter !== 'ALL' || priorityFilter !== 'ALL') && (
              <div className="mt-4 text-right">
                <button
                  onClick={clearFilters}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 ml-auto"
                >
                  <X className="w-3 h-3" />
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results Count */}
      {!showForm && !loading && (
        <div className="text-sm text-slate-500">
          Found {filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''}
          {(searchTerm || statusFilter !== 'ALL' || priorityFilter !== 'ALL') && (
            <button
              onClick={clearFilters}
              className="ml-2 text-indigo-600 hover:underline"
            >
              (Clear filters)
            </button>
          )}
        </div>
      )}

      {/* Rest of your existing ticket display code... */}
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
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
              <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <TicketIcon className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No Tickets Found</h3>
              <p className="text-slate-500 mb-6">
                {searchTerm || statusFilter !== 'ALL' || priorityFilter !== 'ALL'
                  ? "No tickets match your search criteria."
                  : "You haven't reported any incidents yet."}
              </p>
              {(searchTerm || statusFilter !== 'ALL' || priorityFilter !== 'ALL') ? (
                <button 
                  onClick={clearFilters}
                  className="text-indigo-600 font-bold hover:underline"
                >
                  Clear Filters
                </button>
              ) : (
                <button 
                  onClick={() => setShowForm(true)}
                  className="text-indigo-600 font-bold hover:underline"
                >
                  Create your first ticket
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTickets.map((ticket) => (
                <div key={ticket.id} className="group bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="flex justify-between items-start mb-4">
                    <StatusBadge status={ticket.status} />
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      ticket.priority === 'CRITICAL' ? 'bg-rose-50 text-rose-600' : 
                      ticket.priority === 'HIGH' ? 'bg-orange-50 text-orange-600' :
                      ticket.priority === 'MEDIUM' ? 'bg-yellow-50 text-yellow-600' :
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