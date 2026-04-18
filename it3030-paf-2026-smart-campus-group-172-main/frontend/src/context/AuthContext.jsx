import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { authAPI } from '../services/api';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 > Date.now()) {
          setUser(JSON.parse(savedUser));
        } else {
          logout();
        }
      } catch {
        logout();
      }
    }
    setLoading(false);
  }, []);

  const saveAuth = (data) => {
    localStorage.setItem('token', data.token);
    const userData = {
      id: data.id,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      profileImageUrl: data.profileImageUrl,
      role: data.role,
    };
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const login = async (email, password) => {
    try {
      const res = await authAPI.login({ email, password });
      const data = res.data.data;
      saveAuth(data);
      message.success(res.data.message || 'Login successful');
      navigateByRole(data.role);
    } catch (err) {
      message.error(err.response?.data?.message || 'Login failed');
      throw err;
    }
  };

  const register = async (formData) => {
    try {
      const res = await authAPI.register(formData);
      const data = res.data.data;
      saveAuth(data);
      message.success(res.data.message || 'Registration successful');
      navigateByRole(data.role);
    } catch (err) {
      message.error(err.response?.data?.message || 'Registration failed');
      throw err;
    }
  };

  const googleLogin = async (credentialResponse) => {
    try {
      const res = await authAPI.googleAuth(credentialResponse.credential);
      const data = res.data.data;
      saveAuth(data);
      message.success(res.data.message || 'Google sign-in successful');
      navigateByRole(data.role);
    } catch (err) {
      message.error(err.response?.data?.message || 'Google sign-in failed');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const navigateByRole = (role) => {
    if (role === 'ADMIN') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  const isAdmin = () => user?.role === 'ADMIN';
  const isAuthenticated = () => !!user;

  return (
    <AuthContext.Provider value={{
      user, loading, login, register, googleLogin, logout,
      isAdmin, isAuthenticated, setUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};
