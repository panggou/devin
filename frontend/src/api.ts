import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
}

export interface Server {
  id: number;
  hostname: string;
  ip_address: string;
  operating_system: string | null;
  cpu_cores: number | null;
  ram_gb: number | null;
  environment: string | null;
  status: string;
  location: string | null;
  owner: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServerCreate {
  hostname: string;
  ip_address: string;
  operating_system?: string;
  cpu_cores?: number;
  ram_gb?: number;
  environment?: string;
  status?: string;
  location?: string;
  owner?: string;
  notes?: string;
}

export interface AuditLog {
  id: number;
  user_id: number | null;
  username: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: string | null;
  ip_address: string | null;
  timestamp: string;
}

export interface DashboardStats {
  total_servers: number;
  active_servers: number;
  inactive_servers: number;
  total_users: number;
  environments: Record<string, number>;
  recent_audit_logs: AuditLog[];
}

export interface KubernetesCluster {
  name: string;
  status: string;
  nodes: number;
  pods_running: number;
  pods_pending: number;
  pods_failed: number;
  cpu_usage_percent: number;
  memory_usage_percent: number;
  kubernetes_version: string;
  region: string;
}

export interface CSVUploadResponse {
  total_rows: number;
  imported: number;
  skipped: number;
  errors: string[];
}

export const authApi = {
  login: (username: string, password: string) =>
    api.post<{ access_token: string; username: string }>('/auth/login', { username, password }),
  register: (username: string, email: string, password: string) =>
    api.post<User>('/auth/register', { username, email, password }),
  me: () => api.get<User>('/auth/me'),
  seed: () => api.post('/auth/seed'),
};

export const serverApi = {
  list: (params?: { environment?: string; status_filter?: string }) =>
    api.get<Server[]>('/servers', { params }),
  get: (id: number) => api.get<Server>(`/servers/${id}`),
  create: (data: ServerCreate) => api.post<Server>('/servers', data),
  update: (id: number, data: Partial<ServerCreate>) => api.put<Server>(`/servers/${id}`, data),
  delete: (id: number) => api.delete(`/servers/${id}`),
  uploadCsv: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<CSVUploadResponse>('/servers/upload-csv', formData);
  },
};

export const dashboardApi = {
  stats: () => api.get<DashboardStats>('/dashboard'),
};

export const kubernetesApi = {
  clusters: () => api.get<KubernetesCluster[]>('/kubernetes/clusters'),
};

export const auditApi = {
  logs: (params?: { action?: string; resource_type?: string; skip?: number; limit?: number }) =>
    api.get<AuditLog[]>('/audit/logs', { params }),
};

export default api;
