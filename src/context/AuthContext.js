import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user profile on start if token exists
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('vk_hospital_token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
        } catch (error) {
          console.error('Failed to load user profile', error);
          localStorage.removeItem('vk_hospital_token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const loginUser = async (credentials) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', credentials);
      const { token, ...userData } = res.data;
      
      localStorage.setItem('vk_hospital_token', token);
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      console.error('Login error details:', error);
      return {
        success: false,
        message: error.response?.data?.message || (error.request ? 'Network Error: Cannot connect to the server.' : 'Login failed. Please check your credentials.')
      };
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = () => {
    localStorage.removeItem('vk_hospital_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login: loginUser, logout: logoutUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
