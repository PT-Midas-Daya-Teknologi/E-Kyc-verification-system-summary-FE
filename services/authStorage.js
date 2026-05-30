import { AUTH_STORAGE_KEY, USER_STORAGE_KEY } from '../config/api.js';

export function getAccessToken() {
  return localStorage.getItem(AUTH_STORAGE_KEY);
}

export function setSession({ accessToken, user }) {
  localStorage.setItem(AUTH_STORAGE_KEY, accessToken);
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
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
}
