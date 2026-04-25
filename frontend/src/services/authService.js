import api from './api';

export const loginWithPassword = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
};

export const registerWithPassword = async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
};
