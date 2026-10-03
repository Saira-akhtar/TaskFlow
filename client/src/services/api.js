import axios from 'axios';
import useAuthStore from '../store/authStore.js';

// .env file se URL pick karega (e.g., VITE_API_URL=http://localhost:3000/api)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Har request ke sath token automatically attach karega (agar login hai)
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;