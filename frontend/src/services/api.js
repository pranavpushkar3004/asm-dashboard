import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// Auth
export const login = (username, password) =>
  api.post('/api/auth/token', new URLSearchParams({ username, password }), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
export const getMe = () => api.get('/api/auth/me');

// Dashboard
export const getDashboardStats = () => api.get('/api/dashboard/stats');

// Assets
export const getAssets = (params) => api.get('/api/assets', { params });
export const getAsset = (id) => api.get(`/api/assets/${id}`);
export const createAsset = (data) => api.post('/api/assets', data);
export const updateAsset = (id, data) => api.patch(`/api/assets/${id}`, data);
export const deleteAsset = (id) => api.delete(`/api/assets/${id}`);

// Domains
export const getDomains = (params) => api.get('/api/domains', { params });
export const getDomain = (id) => api.get(`/api/domains/${id}`);
export const createDomain = (data) => api.post('/api/domains', data);
export const updateDomain = (id, data) => api.patch(`/api/domains/${id}`, data);
export const deleteDomain = (id) => api.delete(`/api/domains/${id}`);

// DNS
export const getDNS = (params) => api.get('/api/dns', { params });

// Certificates
export const getCertificates = (params) => api.get('/api/certificates', { params });

// Services
export const getServices = (params) => api.get('/api/services', { params });

// Vulnerabilities
export const getVulnerabilities = (params) => api.get('/api/vulnerabilities', { params });
export const getVulnerability = (id) => api.get(`/api/vulnerabilities/${id}`);
export const createVulnerability = (data) => api.post('/api/vulnerabilities', data);
export const updateVulnerability = (id, data) => api.patch(`/api/vulnerabilities/${id}`, data);

// Alerts
export const getAlerts = (params) => api.get('/api/alerts', { params });
export const getAlert = (id) => api.get(`/api/alerts/${id}`);
export const updateAlert = (id, data) => api.patch(`/api/alerts/${id}`, data);

// Changes
export const getChanges = (params) => api.get('/api/changes', { params });

// Scans
export const getScans = (params) => api.get('/api/scans', { params });
export const createScan = (data) => api.post('/api/scans', data);

// Users
export const getUsers = (params) => api.get('/api/users', { params });
export const createUser = (data) => api.post('/api/users', data);
export const updateUser = (id, data) => api.patch(`/api/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/api/users/${id}`);

// Audit
export const getAuditLogs = (params) => api.get('/api/audit', { params });

// Reports
export const getExecutiveSummary = () => api.get('/api/reports/executive-summary');
