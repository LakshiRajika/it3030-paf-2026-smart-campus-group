import React, { useState, useEffect } from 'react';
import ticketService from '../services/ticketService';
import { TicketForm, StatusBadge } from '../components/ticket/TicketForm';

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await ticketService.getAllTickets();
      setTickets(data);
    } catch (err) {
      setError('Failed to load tickets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (formData, files) => {
    try {
      setIsSubmitting(true);
      // Dummy user ID for now - should come from AuthContext
      const ticketData = { ...formData, createdById: 'USER123' };
      await ticketService.createTicket(ticketData, files);
      setShowForm(false);
      fetchTickets();
    } catch (err) {
      alert('Error creating ticket: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Maintenance & Incidents</h1>
          <p className="text-slate-500 mt-1">Report campus issues and track maintenance progress.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className={`px-6 py-2.5 rounded-xl font-bold transition-all shadow-md flex items-center gap-2 ${showForm ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-1'}`}
        >
          {showForm ? 'Back to Tickets' : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              New Ticket
            </>
          )}
        </button>
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
                <div key={i} className="bg-slate-100 animate-pulse h-64 rounded-2xl"></div>
              ))}
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
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
                <div key={ticket.id} className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
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
                  <h3 className="font-bold text-slate-900 mb-2 truncate">{ticket.location}</h3>
                  <p className="text-slate-500 text-sm line-clamp-3 mb-6 min-h-[60px]">
                    {ticket.description}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                        UID
                      </div>
                      <span className="text-xs text-slate-500 font-medium">{ticket.createdById}</span>
                    </div>
                    <button 
                      onClick={() => navigate(`/tickets/${ticket.id}`)}
                      className="text-indigo-600 text-sm font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1"
                    >
                      View Details
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
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
