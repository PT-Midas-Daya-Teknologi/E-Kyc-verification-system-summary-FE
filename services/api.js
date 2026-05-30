import axios from 'axios';
import { getAccessToken } from './authStorage.js';
import { hashPasswordForAuth } from './passwordCrypto.js';

// For testing default to the real backend URL. Override with `VITE_API_BASE_URL` when needed.
const DEFAULT_API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/openapi/dev';

const api = axios.create({
  baseURL: DEFAULT_API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function authenticate(username, password) {
  const hashedPassword = hashPasswordForAuth(password);
  const { data } = await api.post('/authenticate', {
    username,
    password: hashedPassword,
  });
  return data;
}

export async function logout() {
  const { data } = await api.post('/logout');
  return data;
  
}

export async function fetchUserSummary(page = 0, size = 100) {
  const { data } = await api.post('/dashboard/summary', { page, size });
  return data;
}

export async function fetchUserSessions(userId, page = 0, size = 100) {
  const { data } = await api.post('/dashboard/summary/session', {
    userId,
    page,
    size,
  });
  return data;
}

export function getApiErrorMessage(error) {
  const errors = error?.response?.data?.errors;
  if (errors?.message) return errors.message;
  if (typeof errors === 'string') return errors;
  return error?.message || 'Request failed';
}

export default api;
