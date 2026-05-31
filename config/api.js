/**
 * API base URL for the dashboard.
 * Dev: Vite proxies /api -> http://localhost:8081/openapi/dev (see vite.config.js)
 * Prod: set VITE_API_BASE_URL to full backend URL (e.g. http://localhost:8081/openapi/dev)
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const AUTH_STORAGE_KEY = 'ekyc_access_token';
export const USER_STORAGE_KEY = 'ekyc_user';
