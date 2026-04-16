import api from '../utils/api';

const ticketService = {
  // Create a new ticket with optional attachments
  createTicket: async (ticketData, attachments) => {
    const formData = new FormData();
    formData.append('ticket', JSON.stringify(ticketData));
    
    if (attachments && attachments.length > 0) {
      attachments.forEach(file => {
        formData.append('attachments', file);
      });
    }

    const response = await api.post(`/tickets`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get all tickets
  getAllTickets: async () => {
    const response = await api.get(`/tickets`);
    return response.data;
  },

  // Get tickets created by the current user
  getMyTickets: async (userId) => {
    const response = await api.get(`/tickets/user/${userId}`);
    return response.data;
  },

  // Get ticket by ID
  getTicketById: async (id) => {
    const response = await api.get(`/tickets/${id}`);
    return response.data;
  },

  // Update ticket status or assignment
  updateTicket: async (id, updateData) => {
    const response = await api.put(`/tickets/${id}`, updateData);
    return response.data;
  },

  // Add a comment to a ticket
  addComment: async (ticketId, commentData) => {
    const response = await api.post(`/tickets/${ticketId}/comments`, commentData);
    return response.data;
  },

  // Get comments for a ticket
  getComments: async (ticketId) => {
    const response = await api.get(`/tickets/${ticketId}/comments`);
    return response.data;
  },

  // Delete a comment
  deleteComment: async (commentId, userId) => {
    await api.delete(`/tickets/comments/${commentId}`, {
      params: { userId }
    });
  },

  // Get ticket statistics
  getStats: async () => {
    const response = await api.get('/tickets/stats');
    return response.data;
  },

  // Get advanced analytics
  getAnalytics: async () => {
    const response = await api.get('/tickets/analytics');
    return response.data;
  }
};

export default ticketService;
