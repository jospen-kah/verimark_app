// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://verimark-app.onrender.com', // Replace with your actual backend URL
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      // Redirect to login page or show login modal
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;