/**
 * API base URL for the dashboard.
 * Dev: default to the backend openapi dev URL so the UI calls the real service.
 * You can still override with the env var `VITE_API_BASE_URL` for other environments.
 */
export const API_BASE_URL ='http://localhost:8081/openapi/dev';

export const AUTH_STORAGE_KEY = 'ekyc_access_token';
export const USER_STORAGE_KEY = 'ekyc_user';
