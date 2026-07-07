import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://hospital-management-3-4uml.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to include JWT token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vk_hospital_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
