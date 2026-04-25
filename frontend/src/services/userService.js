import api from '../utils/api';

const userService = {
    getAllUsers: async () => {
        const response = await api.get('/users');
        return response.data;
    },
    
    updateUserRoles: async (userId, roles) => {
        const response = await api.put(`/users/${userId}/roles`, roles);
        return response.data;
    },

    deleteUser: async (userId) => {
        const response = await api.delete(`/users/${userId}`);
        return response.data;
    },

    toggleUserStatus: async (userId) => {
        const response = await api.patch(`/users/${userId}/status`);
        return response.data;
    }
};

export default userService;
