import api from '../utils/api';

const resourceService = {
  getAll: async () => {
    const response = await api.get('/v1/resources');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/v1/resources/${id}`);
    return response.data;
  },

  search: async (params) => {
    const response = await api.get('/v1/resources/search', { params });
    return response.data;
  },

  create: async (data) => {
    if (data instanceof FormData) {
      const response = await api.post('/v1/resources/with-image', data);
      return response.data;
    }
    const response = await api.post('/v1/resources', data);
    return response.data;
  },

  update: async (id, data) => {
    if (data instanceof FormData) {
      const response = await api.put(`/v1/resources/${id}/with-image`, data);
      return response.data;
    }
    const response = await api.put(`/v1/resources/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/v1/resources/${id}`);
    return response.data;
  },
};

export default resourceService;

