import api from './api';

const facilityService = {
    getAllFacilities: async () => {
        try {
            const response = await api.get('/facilities');
            return response.data;
        } catch (error) {
            console.error('Error fetching facilities:', error);
            return []; // Return empty array on error to prevent crashes
        }
    },
    getFacilityById: async (id) => {
        const response = await api.get(`/facilities/${id}`);
        return response.data;
    }
};

export default facilityService;
