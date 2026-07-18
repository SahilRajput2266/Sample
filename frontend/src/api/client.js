import axios from 'axios';

// Centralized API client configuration.
//
// The app currently makes calls through the global `axios` instance from many
// pages, so we configure the global defaults + interceptors here (module scope,
// executed once) and also export `api` for new code. Existing `import axios`
// call sites keep working unchanged; new code should `import api from '../api/client'`.

const TOKEN_KEY = 'token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  delete axios.defaults.headers.common['Authorization'];
};

axios.defaults.baseURL = '/api';
const existingToken = getToken();
if (existingToken) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${existingToken}`;
}

// Auto-logout on expired/invalid tokens. Skips auth endpoints so a wrong
// password (401 from /auth/login) doesn't trigger a redirect loop.
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register');
    const onAuthPage = ['/login', '/register'].includes(window.location.pathname);
    if (status === 401 && !isAuthEndpoint && !onAuthPage) {
      clearToken();
      window.location.assign('/login');
    }
    return Promise.reject(error);
  }
);

const api = axios;
export default api;
