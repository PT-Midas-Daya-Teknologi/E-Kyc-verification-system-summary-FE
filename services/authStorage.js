import { AUTH_STORAGE_KEY, USER_STORAGE_KEY } from '../config/api.js';

let memoryToken = null;
function normalizeToken(token) {
  if (!token || typeof token !== 'string') return null;
  const trimmed = token.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('Bearer ')) {
    return trimmed.slice(7).trim();
  }
  return trimmed;
}

export function extractAccessToken(response) {
  return response?.body?.accessToken ?? response?.accessToken ?? null;
}

export function getAccessToken() {
  if (memoryToken) return memoryToken;
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  memoryToken = normalizeToken(stored);
  return memoryToken;
}

export function setAccessToken(token) {
  memoryToken = normalizeToken(token);
  if (memoryToken) {
    localStorage.setItem(AUTH_STORAGE_KEY, memoryToken);
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

export function setSession({ accessToken, user }) {
  setAccessToken(accessToken);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearSession() {
  memoryToken = null;
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
}

export function getAuthorizationHeader() {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
