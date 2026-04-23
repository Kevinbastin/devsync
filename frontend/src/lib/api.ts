import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Request interceptor — attach token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor — refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(originalRequest);
        }
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

// Workspace API
export const workspaceApi = {
  list: () => api.get('/workspaces'),
  get: (id: string) => api.get(`/workspaces/${id}`),
  create: (data: { name: string; description?: string; icon?: string }) =>
    api.post('/workspaces', data),
  update: (id: string, data: any) => api.patch(`/workspaces/${id}`, data),
  delete: (id: string) => api.delete(`/workspaces/${id}`),
  invite: (id: string, data: { email: string; role: string }) =>
    api.post(`/workspaces/${id}/invite`, data),
  removeMember: (id: string, memberId: string) =>
    api.delete(`/workspaces/${id}/members/${memberId}`),
};

// Document API
export const documentApi = {
  list: (workspaceId: string) => api.get(`/workspaces/${workspaceId}/documents`),
  get: (id: string) => api.get(`/documents/${id}`),
  create: (workspaceId: string, data?: { title?: string; parentId?: string }) =>
    api.post(`/workspaces/${workspaceId}/documents`, data || {}),
  update: (id: string, data: any) => api.patch(`/documents/${id}`, data),
  delete: (id: string) => api.delete(`/documents/${id}`),
};

// Board/Task API
export const boardApi = {
  list: (workspaceId: string) => api.get(`/workspaces/${workspaceId}/boards`),
  create: (workspaceId: string, data: { name: string }) =>
    api.post(`/workspaces/${workspaceId}/boards`, data),
};

export const taskApi = {
  createColumn: (boardId: string, data: { name: string }) =>
    api.post(`/tasks/boards/${boardId}/columns`, data),
  updateColumn: (columnId: string, data: { name: string }) =>
    api.patch(`/tasks/columns/${columnId}`, data),
  deleteColumn: (columnId: string) => api.delete(`/tasks/columns/${columnId}`),
  create: (columnId: string, data: any) =>
    api.post(`/tasks/columns/${columnId}/tasks`, data),
  update: (taskId: string, data: any) => api.patch(`/tasks/tasks/${taskId}`, data),
  delete: (taskId: string) => api.delete(`/tasks/tasks/${taskId}`),
  move: (taskId: string, data: { columnId: string; position: number }) =>
    api.patch(`/tasks/tasks/${taskId}/move`, data),
};

// Snippet API
export const snippetApi = {
  list: (workspaceId: string) => api.get(`/workspaces/${workspaceId}/snippets`),
  create: (workspaceId: string, data: any) =>
    api.post(`/workspaces/${workspaceId}/snippets`, data),
  update: (id: string, data: any) => api.patch(`/snippets/${id}`, data),
  delete: (id: string) => api.delete(`/snippets/${id}`),
};

// AI API
export const aiApi = {
  complete: (data: { prompt: string; context?: string; action?: string }) =>
    fetch(`${API_URL}/ai/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify(data),
    }),
};
