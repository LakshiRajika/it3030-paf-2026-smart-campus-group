import React, { useState, useEffect } from 'react';
import ticketService from '../../services/ticketService';
import { StatusBadge } from '../../components/ticket/TicketForm';
import { useNavigate } from 'react-router-dom';

const TicketList = ({ filterStatus, userId }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTickets();
  }, [userId]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = userId 
        ? await ticketService.getTicketsByUserId(userId)
        : await ticketService.getAllTickets();
      setTickets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = filterStatus && filterStatus !== 'ALL'
    ? tickets.filter(t => t.status === filterStatus)
    : tickets;

  if (loading) return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-2xl"></div>
      ))}
    </div>
  );

  if (filteredTickets.length === 0) return (
    <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
      <p className="text-slate-400 font-medium">No tickets found.</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-4">
      {filteredTickets.map((ticket) => (
        <div 
          key={ticket.id} 
          onClick={() => navigate(`/tickets/${ticket.id}`)}
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer group flex flex-col md:flex-row justify-between gap-4 items-start md:items-center"
        >
          <div className="flex-grow">
            <div className="flex items-center gap-2 mb-2">
              <StatusBadge status={ticket.status} />
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{ticket.category}</span>
            </div>
            <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{ticket.location}</h3>
            <p className="text-slate-500 text-sm line-clamp-1">{ticket.description}</p>
          </div>

          <div className="flex items-center gap-6 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
            <div className="text-left md:text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase">Priority</p>
              <p className={`text-xs font-bold ${ticket.priority === 'CRITICAL' ? 'text-rose-600' : 'text-slate-600'}`}>
                {ticket.priority}
              </p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase">Created</p>
              <p className="text-xs font-bold text-slate-600">{new Date(ticket.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="bg-slate-50 p-2 rounded-xl group-hover:bg-indigo-50 transition-colors">
              <svg className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TicketList;
