import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const ticketService = {
  // Create a new ticket with optional attachments
  createTicket: async (ticketData, attachments) => {
    const formData = new FormData();
    formData.append('ticket', new Blob([JSON.stringify(ticketData)], {
      type: 'application/json'
    }));
    
    if (attachments && attachments.length > 0) {
      attachments.forEach(file => {
        formData.append('attachments', file);
      });
    }

    const response = await axios.post(`${API_BASE_URL}/tickets`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get all tickets
  getAllTickets: async () => {
    const response = await axios.get(`${API_BASE_URL}/tickets`);
    return response.data;
  },

  // Get ticket by ID
  getTicketById: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/tickets/${id}`);
    return response.data;
  },

  // Update ticket status or assignment
  updateTicket: async (id, updateData) => {
    const response = await axios.put(`${API_BASE_URL}/tickets/${id}`, updateData);
    return response.data;
  },

  // Add a comment to a ticket
  addComment: async (ticketId, commentData) => {
    const response = await axios.post(`${API_BASE_URL}/tickets/${ticketId}/comments`, commentData);
    return response.data;
  },

  // Get comments for a ticket
  getComments: async (ticketId) => {
    const response = await axios.get(`${API_BASE_URL}/tickets/${ticketId}/comments`);
    return response.data;
  },

  // Delete a comment
  deleteComment: async (commentId, userId) => {
    await axios.delete(`${API_BASE_URL}/tickets/comments/${commentId}`, {
      params: { userId }
    });
  }
};

export default ticketService;
