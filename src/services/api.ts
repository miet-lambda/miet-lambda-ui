import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

const API_BASE_URL = 'http://135.181.170.148:8080/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor to add auth token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh token yet
    if (error.response?.status === 401 && originalRequest && !(originalRequest as any)._retry) {
      (originalRequest as any)._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await api.post('/token/refresh', {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token } = response.data;
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);

        // Retry the original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear tokens and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth endpoints
export const auth = {
  register: (login: string, password: string) =>
    api.post('/register', { login, password }),
  
  login: (login: string, password: string) =>
    api.post('/token', { login, password }),
  
  getCurrentUser: () =>
    api.get('/users/me'),
  
  verifyToken: (token: string) =>
    api.post('/token/verify', { token }),
  
  refreshToken: (refreshToken: string) =>
    api.post('/token/refresh', { refresh_token: refreshToken }),
  
  revokeTokens: (userId: number) =>
    api.post(`/users/${userId}/revoke_tokens`),
  
  addMoney: (userId: number, amount: number) =>
    api.post(`/users/${userId}/add_money`, { amount }),
};

// Project endpoints
export const projects = {
  getAll: () =>
    api.get('/projects/'),
  
  getById: (projectId: number) =>
    api.get(`/projects/${projectId}`),
  
  create: (name: string) =>
    api.post('/projects/', { name }),
  
  update: (projectId: number, name: string) =>
    api.put(`/projects/${projectId}`, { name }),
  
  delete: (projectId: number) =>
    api.delete(`/projects/${projectId}`),
};

// Script endpoints
export const scripts = {
  getAll: (projectId: number) =>
    api.get(`/projects/${projectId}/scripts`),
  
  getById: (projectId: number, scriptId: number) =>
    api.get(`/projects/${projectId}/scripts/${scriptId}`),
  
  create: (projectId: number, path: string, sourceCode: string) =>
    api.post(`/projects/${projectId}/scripts`, { path, source_code: sourceCode }),
  
  update: (projectId: number, scriptId: number, path: string, sourceCode: string) =>
    api.put(`/projects/${projectId}/scripts/${scriptId}`, { path, source_code: sourceCode }),
  
  delete: (projectId: number, scriptId: number) =>
    api.delete(`/projects/${projectId}/scripts/${scriptId}`),
  
  execute: (projectId: number, scriptId: number) =>
    api.post(`/projects/${projectId}/scripts/${scriptId}/execute`),
};

export default api; 