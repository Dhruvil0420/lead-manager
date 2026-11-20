import axios from 'axios';

// Normalize VITE_API_URL so it reliably ends with /api regardless of trailing slashes
const rawUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').trim();
const cleanUrl = rawUrl.replace(/\/+$/, '');
const baseURL = cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token from localStorage to outgoing requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: on 401 unauthorized, log user out and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const hadToken = Boolean(localStorage.getItem('token'));
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login only if user had an active session that expired
      if (hadToken && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

