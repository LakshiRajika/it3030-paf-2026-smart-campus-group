import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ticketService from '../services/ticketService';
import { StatusBadge } from '../components/ticket/TicketForm';
import CommentSection from '../components/ticket/CommentSection';
import StatusTimeline from '../components/ticket/StatusTimeline';

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    fetchTicketDetails();
  }, [id]);

  const fetchTicketDetails = async () => {
    try {
      setLoading(true);
      const [ticketData, commentsData] = await Promise.all([
        ticketService.getTicketById(id),
        ticketService.getComments(id)
      ]);
      setTicket(ticketData);
      setComments(commentsData);
    } catch (err) {
      console.error(err);
      alert('Error fetching ticket details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      setStatusUpdating(true);
      const updateData = { status: newStatus };
      if (newStatus === 'RESOLVED' || newStatus === 'CLOSED') {
        const notes = prompt('Enter resolution notes:');
        if (notes === null) return;
        updateData.resolutionNotes = notes;
      }
      await ticketService.updateTicket(id, updateData);
      fetchTicketDetails();
    } catch (err) {
      alert('Error updating status');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      setSubmitting(true);
      await ticketService.addComment(id, {
        content: newComment,
        authorId: 'USER123', // Demo ID
        authorName: 'Campus User'
      });
      setNewComment('');
      fetchTicketDetails();
    } catch (err) {
      alert('Error adding comment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (!ticket) return <div className="text-center py-20">Ticket not found</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button 
        onClick={() => navigate('/tickets')}
        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-semibold mb-6 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to List
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-slate-900">{ticket.location}</h1>
                  <StatusBadge status={ticket.status} />
                </div>
                <p className="text-slate-500 text-sm">Created on {new Date(ticket.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Priority</span>
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  ticket.priority === 'CRITICAL' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-600'
                }`}>
                  {ticket.priority}
                </span>
              </div>
            </div>

            <div className="prose prose-slate max-w-none">
              <h4 className="text-sm font-bold text-slate-400 uppercase mb-2">Description</h4>
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
            </div>

            {ticket.attachments && ticket.attachments.length > 0 && (
              <div className="mt-8 border-t border-slate-50 pt-6">
                <h4 className="text-sm font-bold text-slate-400 uppercase mb-4 tracking-wider">Attachments</h4>
                <div className="flex flex-wrap gap-4">
                  {ticket.attachments.map((file, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => window.open(`http://localhost:8080/api/tickets/uploads/${file}`, '_blank')}
                      className="w-32 h-32 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden hover:border-indigo-400 transition-all cursor-zoom-in group shadow-sm hover:shadow-md"
                    >
                      <img 
                        src={`http://localhost:8080/api/tickets/uploads/${file}`} 
                        alt="Attachment" 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.onerror = null; 
                          e.target.src = 'https://placehold.co/400?text=Image+Error';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              Comments
              <span className="bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded-full">{comments.length}</span>
            </h3>
            
            <div className="space-y-6 mb-8">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex-shrink-0 flex items-center justify-center text-indigo-600 font-bold text-xs">
                    {comment.authorName.charAt(0)}
                  </div>
                  <div className="flex-grow">
                    <div className="bg-slate-50 rounded-2xl rounded-tl-none p-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-sm text-slate-900">{comment.authorName}</span>
                        <span className="text-[10px] text-slate-400">{new Date(comment.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-sm text-slate-700">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-4">
              <input 
                type="text" 
                placeholder="Add a comment..."
                className="flex-grow bg-slate-50 border-none rounded-2xl px-6 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button 
                type="submit"
                disabled={submitting}
                className="bg-indigo-600 text-white p-3 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h4 className="text-sm font-bold text-slate-400 uppercase mb-4 tracking-wider">Status Management</h4>
            <div className="space-y-3">
              {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'CLOSED'].map((status) => (
                <button
                  key={status}
                  disabled={statusUpdating || ticket.status === status}
                  onClick={() => handleStatusUpdate(status)}
                  className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 
                    ${ticket.status === status 
                      ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' 
                      : 'hover:bg-slate-50 text-slate-600 border border-transparent'
                    } disabled:cursor-not-allowed`}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl shadow-slate-200">
            <h4 className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-widest">SLA Timers</h4>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Response Time</p>
                <p className="text-sm font-medium">
                  {ticket.firstResponseAt ? new Date(ticket.firstResponseAt).toLocaleString() : '---'}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Resolution Time</p>
                <p className="text-sm font-medium">
                  {ticket.resolvedAt ? new Date(ticket.resolvedAt).toLocaleString() : '---'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
