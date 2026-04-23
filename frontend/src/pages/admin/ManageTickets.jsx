import React, { useState, useEffect, useCallback } from 'react';
import ticketService from '../../services/ticketService';
import { StatusBadge } from '../../components/ticket/TicketForm';
import { useNavigate, Link } from 'react-router-dom';
import { 
  BarChart3, 
  Search, 
  MapPin, 
  AlertCircle, 
  Clock, 
  LayoutGrid, 
  List,
  Filter,
  X,
  Download,
  Eye,
  FileText,
  Trash2
} from 'lucide-react';
import PDFExportService from '../../services/pdfExportService';

const ManageTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [exporting, setExporting] = useState(false);
  const navigate = useNavigate();

  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch all tickets
  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await ticketService.getAllTickets();
      setTickets(data);
      setFilteredTickets(data);
    } catch (err) {
      console.error(err);
      alert('Failed to load tickets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // 🔍 SEARCH AND FILTER FUNCTION
  const applyFilters = useCallback(() => {
    let filtered = [...tickets];
    
    // Search by location, description, ID, or created by
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(ticket => 
        ticket.location?.toLowerCase().includes(term) ||
        ticket.description?.toLowerCase().includes(term) ||
        ticket.id?.toLowerCase().includes(term) ||
        ticket.createdByName?.toLowerCase().includes(term) ||
        ticket.createdById?.toLowerCase().includes(term)
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
  }, [tickets, searchTerm, statusFilter, priorityFilter]);

  // Apply filters when dependencies change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
    setShowFilters(false);
  };

  // Get unique statuses and priorities
  const uniqueStatuses = ['ALL', ...new Set(tickets.map(t => t.status))];
  const uniquePriorities = ['ALL', ...new Set(tickets.map(t => t.priority))];

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Ticket ID', 'Location', 'Description', 'Status', 'Priority', 'Created By', 'Created Date', 'Resolved Date'];
    const rows = filteredTickets.map(ticket => [
      ticket.id,
      ticket.location,
      ticket.description.replace(/,/g, ' '), // Remove commas to avoid CSV issues
      ticket.status,
      ticket.priority,
      ticket.createdByName || ticket.createdById,
      new Date(ticket.createdAt).toLocaleDateString(),
      ticket.resolvedAt ? new Date(ticket.resolvedAt).toLocaleDateString() : 'Pending'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tickets_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // PDF Export
  const handlePDFExport = async () => {
    if (filteredTickets.length === 0) {
        alert('No tickets to export!');
        return;
    }
    
    setExporting(true);
    try {
        await PDFExportService.exportTicketsToPDF(
            filteredTickets, 
            `Ticket Report - ${new Date().toLocaleDateString()}`
        );
    } catch (error) {
        console.error('PDF export failed:', error);
        alert('Failed to generate PDF. Please try again.');
    } finally {
        setExporting(false);
    }
  };

  // Delete Ticket
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) return;
    
    try {
      setLoading(true);
      await ticketService.deleteTicket(id);
      await fetchTickets(); // Refresh list
    } catch (err) {
      console.error(err);
      alert('Failed to delete ticket: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Get status count for display
  const getStatusCount = (status) => {
    if (status === 'ALL') return tickets.length;
    return tickets.filter(t => t.status === status).length;
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        document.querySelector('input[type="text"]')?.focus();
      }
      if (e.key === 'Escape') {
        clearFilters();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Admin Ticket Management</h1>
          <p className="text-slate-500 text-sm">Monitor, search, and manage all campus maintenance requests.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* PDF Export Button */}
          <button
              onClick={handlePDFExport}
              disabled={exporting || filteredTickets.length === 0}
              className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-all flex items-center gap-2 shadow-sm font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
              {exporting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              ) : (
                  <FileText className="w-4 h-4" />
              )}
              {exporting ? 'Generating...' : 'Export PDF'}
          </button>

          {/* Export Button */}
          {filteredTickets.length > 0 && (
            <button
              onClick={exportToCSV}
              className="bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-sm font-bold text-sm"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          )}
          
          <Link 
            to="/admin/analytics" 
            className="bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2 shadow-sm font-bold text-sm"
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
          </Link>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by location, description, ticket ID, or user name... (Ctrl+F to focus)"
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
          
          {/* View Toggle */}
          <div className="flex bg-slate-100 rounded-xl p-1">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              title="Table View"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Status Filter */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Filter by Status</label>
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
                      {status === 'ALL' ? `All (${getStatusCount('ALL')})` : `${status.replace('_', ' ')} (${getStatusCount(status)})`}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Priority Filter */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Filter by Priority</label>
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
              <div className="mt-4 pt-3 text-right border-t border-slate-100">
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

      {/* Results Info */}
      {!loading && (
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-slate-500">
            {filteredTickets.length === 0 ? (
              <span>No tickets match your search criteria</span>
            ) : (
              <span>
                Showing <span className="font-bold text-slate-700">{filteredTickets.length}</span> of <span className="font-bold text-slate-700">{tickets.length}</span> tickets
                {(searchTerm || statusFilter !== 'ALL' || priorityFilter !== 'ALL') && (
                  <button
                    onClick={clearFilters}
                    className="ml-2 text-indigo-600 hover:underline"
                  >
                    (Clear filters)
                  </button>
                )}
              </span>
            )}
          </div>
          <div className="text-xs text-slate-400">
            💡 Tip: Press ESC to clear all filters
          </div>
        </div>
      )}

      {/* Ticket Display */}
      <div className="space-y-4">
        {loading ? (
          // Loading skeletons
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 animate-pulse">
                <div className="flex justify-between mb-4">
                  <div className="h-6 w-20 bg-slate-100 rounded"></div>
                  <div className="h-6 w-16 bg-slate-100 rounded"></div>
                </div>
                <div className="h-5 w-3/4 bg-slate-100 rounded mb-2"></div>
                <div className="h-4 w-full bg-slate-50 rounded mb-1"></div>
                <div className="h-4 w-2/3 bg-slate-50 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredTickets.length === 0 ? (
          // No results
          <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm rotate-3">
              <AlertCircle className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-black text-slate-800">No Tickets Found</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
              {searchTerm || statusFilter !== 'ALL' || priorityFilter !== 'ALL'
                ? "No tickets match your current search or filter criteria. Try adjusting your filters."
                : "There are no tickets in the system yet."}
            </p>
            {(searchTerm || statusFilter !== 'ALL' || priorityFilter !== 'ALL') && (
              <button 
                onClick={clearFilters}
                className="mt-4 text-indigo-600 font-bold hover:underline inline-flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Clear all filters
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          // Grid View
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredTickets.map((ticket) => (
              <div 
                key={ticket.id} 
                className="group relative bg-white p-6 rounded-3xl shadow-sm hover:shadow-xl border border-slate-100 hover:border-indigo-100 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
                onClick={() => navigate(`/tickets/${ticket.id}`)}
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
                        <h4 className="text-sm font-bold text-slate-900">{ticket.createdByName || ticket.createdById?.substring(0, 8)}</h4>
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
                          ticket.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
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
                  <span className="text-xs font-mono text-slate-400">#{ticket.id.substring(ticket.id.length - 8)}</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(ticket.id);
                      }}
                      className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                      title="Delete Ticket"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/tickets/${ticket.id}`);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-indigo-600 transition-all"
                    >
                      <Eye className="w-3 h-3" />
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Table View
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Ticket ID</th>
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
                        <span className="text-xs font-mono text-slate-500">#{ticket.id.substring(ticket.id.length - 8)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500 overflow-hidden">
                            <img src={`https://ui-avatars.com/api/?name=${ticket.createdByName || ticket.createdById}&background=random&color=fff&size=32`} className="w-full h-full object-cover" alt="" />
                          </div>
                          <span className="text-sm font-medium text-slate-700">{ticket.createdByName || 'Anonymous'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-amber-500" />
                          <span className="text-sm font-medium text-slate-800">{ticket.location}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-500 max-w-xs line-clamp-1">{ticket.description}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          ticket.priority === 'CRITICAL' ? 'bg-rose-50 text-rose-600' : 
                          ticket.priority === 'HIGH' ? 'bg-orange-50 text-orange-600' : 
                          ticket.priority === 'MEDIUM' ? 'bg-yellow-50 text-yellow-700' :
                          'bg-slate-50 text-slate-500'
                        }`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={ticket.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(ticket.id);
                            }}
                            className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all"
                            title="Delete Ticket"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => navigate(`/tickets/${ticket.id}`)}
                            className="text-indigo-600 font-bold text-xs hover:text-white bg-indigo-50 hover:bg-indigo-600 px-3 py-2 rounded-lg transition-all flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            Manage
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageTickets;