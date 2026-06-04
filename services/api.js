import axios from 'axios';
import { API_BASE_URL } from '../config/api.js';
import {
  clearSession,
  extractAccessToken,
  getAccessToken,
  getAuthorizationHeader,
  setAccessToken,
} from './authStorage.js';
import { hashPasswordForAuth } from './passwordCrypto.js';

const defaultConfig = {
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
};

export const publicApi = axios.create(defaultConfig);

export const api = axios.create(defaultConfig);

let unauthorizedHandler = null;

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

function attachAuthHeader(config) {
  const token = getAccessToken();
  if (!token) return config;

  const value = `Bearer ${token}`;
  if (config.headers?.set) {
    config.headers.set('Authorization', value);
  } else {
    config.headers = {
      ...(config.headers || {}),
      Authorization: value,
    };
  }
  return config;
}

export function applyAccessTokenToClient() {
  const token = getAccessToken();
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

api.interceptors.request.use(attachAuthHeader);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearSession();
      applyAccessTokenToClient();
      unauthorizedHandler?.();
    }
    return Promise.reject(error);
  }
);

export async function authenticate(username, password) {
  const hashedPassword = hashPasswordForAuth(password);
  const { data } = await publicApi.post('/authenticate', {
    username,
    password: hashedPassword,
  });
  return data;
}

export async function logout() {
  const { data } = await api.post('/logout', null, {
    headers: getAuthorizationHeader(),
  });
  return data;
}

export async function fetchUserSummary(page = 0, size = 100) {
  const { data } = await api.post('/dashboard/summary', { page, size }, {
    headers: getAuthorizationHeader(),
  });
  return data;
}

export async function fetchUserSessions(userId, page = 0, size = 100) {
  const { data } = await api.post('/dashboard/summary/session', { userId, page, size }, {
    headers: getAuthorizationHeader(),
  });
  console.log('[API] POST /dashboard/summary/session response:', data);
  return data;
}

export async function fetchSessionDetailBySessionId(userId, sessionId) {
  const { data } = await api.post('/dashboard/summary/session', { userId, page: 0, size: 200 }, {
    headers: getAuthorizationHeader(),
  });
  const allSessions = data?.body?.data ?? [];
  const selectedSession = allSessions.find(
    (session) => String(session?.sessionId) === String(sessionId)
  );
  console.log('[API] POST /dashboard/summary/session selected session:', selectedSession);
  return selectedSession ?? null;
}

export async function fetchDashboardRecords(page = 0, size = 10) {
  const { data } = await api.post('/dashboard/summary/records', { page, size });
  return data;
}

export function getApiErrorMessage(error) {
  if (error?.response?.status === 401) {
    return 'Session expired or unauthorized. Please sign in again.';
  }
  const errors = error?.response?.data?.errors;
  if (errors?.message) return errors.message;
  if (typeof errors === 'string') return errors;
  return error?.message || 'Request failed';
}

export default api;
