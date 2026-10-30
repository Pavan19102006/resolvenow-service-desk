/**
 * ResolveNow API Client
 * Supports dynamic switching between Live Render backend and Localhost.
 */

const DEFAULT_CLOUD_URL = 'https://resolvenow-service-desk.onrender.com';
const DEFAULT_LOCAL_URL = 'http://localhost:8080';

// Retrieve saved backend URL or default to Cloud Render
export const getBaseUrl = () => {
  return localStorage.getItem('resolvenow_base_url') || DEFAULT_CLOUD_URL;
};

export const setBaseUrl = (url) => {
  localStorage.setItem('resolvenow_base_url', url);
};

export const getToken = () => {
  return localStorage.getItem('resolvenow_token');
};

export const setToken = (token) => {
  if (token) {
    localStorage.setItem('resolvenow_token', token);
  } else {
    localStorage.removeItem('resolvenow_token');
  }
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('resolvenow_user');
  return user ? JSON.parse(user) : null;
};

export const setCurrentUser = (user) => {
  if (user) {
    localStorage.setItem('resolvenow_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('resolvenow_user');
  }
};

const request = async (endpoint, options = {}) => {
  const baseUrl = getBaseUrl();
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const url = `${baseUrl.replace(/\/$/, '')}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const errorMessage =
        (data && typeof data === 'object' && (data.message || data.error)) ||
        (typeof data === 'string' && data) ||
        `HTTP ${response.status} ${response.statusText}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.status) throw err;
    const netErr = new Error(`Cannot connect to server at ${baseUrl}. Ensure backend is running.`);
    netErr.status = 0;
    throw netErr;
  }
};

export const api = {
  // Auth endpoints
  auth: {
    register: (userData) =>
      request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      }),
    login: (credentials) =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      }),
    validate: (token) =>
      request(`/auth/validate?token=${encodeURIComponent(token)}`, {
        method: 'GET'
      })
  },

  // Complaint endpoints
  complaints: {
    getAll: () => request('/complaints', { method: 'GET' }),
    getById: (id) => request(`/complaints/${id}`, { method: 'GET' }),
    getByUser: (userId) => request(`/complaints/user/${userId}`, { method: 'GET' }),
    create: (complaintData) =>
      request('/complaints', {
        method: 'POST',
        body: JSON.stringify(complaintData)
      }),
    updateStatus: (id, status) =>
      request(`/complaints/${id}/status?status=${encodeURIComponent(status)}`, {
        method: 'PUT'
      })
  },

  // Assignment endpoints
  assignments: {
    getById: (id) => request(`/assignments/${id}`, { method: 'GET' }),
    getByComplaint: (complaintId) =>
      request(`/assignments/complaint/${complaintId}`, { method: 'GET' }),
    getByDepartment: (department) =>
      request(`/assignments/department/${encodeURIComponent(department)}`, { method: 'GET' }),
    updateStatus: (id, status) =>
      request(`/assignments/${id}/status?status=${encodeURIComponent(status)}`, {
        method: 'PUT'
      })
  },

  // Notification endpoints
  notifications: {
    getByUser: (userId) =>
      request(`/notifications/user/${userId}`, { method: 'GET' }),
    getUnread: (userId) =>
      request(`/notifications/user/${userId}/unread`, { method: 'GET' }),
    markRead: (id) =>
      request(`/notifications/${id}/read`, { method: 'PUT' }),
    markAllRead: (userId) =>
      request(`/notifications/user/${userId}/read-all`, { method: 'PUT' })
  },

  // Backend Health Check
  ping: async (url) => {
    const target = url || getBaseUrl();
    try {
      const res = await fetch(`${target.replace(/\/$/, '')}/auth/validate?token=ping_test`, {
        method: 'GET'
      });
      // A 200, 400, or 401 means the service is alive and reachable!
      return res.status > 0;
    } catch {
      return false;
    }
  }
};

export { DEFAULT_CLOUD_URL, DEFAULT_LOCAL_URL };

