import axios from 'axios';
import { useAuthStore } from '@/store/authStore'; 

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// INSTANT synchronous token injection (No disk reads!)
api.interceptors.request.use((config) => {
  // Read directly from the Zustand memory state
  const session = useAuthStore.getState().session;
  
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});