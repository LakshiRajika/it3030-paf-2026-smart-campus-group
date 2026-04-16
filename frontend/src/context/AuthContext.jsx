import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // Mock user for now to unblock UI development
    const [user, setUser] = useState({
        id: 'mock-user-id',
        name: 'Campus Staff',
        email: 'staff@smartcampus.edu',
        role: 'ADMIN' // Set to ADMIN to allow access to all features
    });
    const [loading, setLoading] = useState(false);

    const login = async (credentials) => {
        // Implement real login later
        console.log('Login called with:', credentials);
        return { success: true };
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
