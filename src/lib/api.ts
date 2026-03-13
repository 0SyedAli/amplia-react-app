import axios from 'axios';

const API_BASE_URL = "https://megasporic-carolyn-diametrically.ngrok-free.dev/"
// const API_BASE_URL = "http://localhost:4006/"

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'ngrok-skip-browser-warning': 'true'
  }
});


// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');

  console.log("token", token)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url} - Token attached`);
  } else {
    console.warn(`[API Request] ${config.method?.toUpperCase()} ${config.url} - No token found`);
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);


export const IMAGE_BASE_URL = "https://megasporic-carolyn-diametrically.ngrok-free.dev/uploads/";

export const getImageUrl = (filename: string, type: 'cover' | 'icon' | 'profile' | 'file' | 'media') => {
  if (!filename) return '';
  if (filename.startsWith('http')) return filename;

  switch (type) {
    case 'cover': return `${IMAGE_BASE_URL}cover/${filename}`;
    case 'icon': return `${IMAGE_BASE_URL}category/icons/${filename}`;
    case 'profile': return `${IMAGE_BASE_URL}profile/${filename}`;
    case 'file': return `${IMAGE_BASE_URL}file/${filename}`;
    case 'media': return `${IMAGE_BASE_URL}message/media/${filename}`;
    default: return `${IMAGE_BASE_URL}${filename}`;
  }
};

export default api;

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/signin', { email, password }),
};

// Settings API
export const settingsApi = {
  getTaxBrackets: () => api.get('/settings/tax-brackets'),
  updateTaxBrackets: (taxBrackets: any) =>
    api.put('/settings/tax-brackets', { taxBrackets }),
  getAllSettings: () => api.get('/settings'),
  getSetting: (key: string) => api.get(`/settings/${key}`),
  upsertSetting: (data: { key: string; value: any; description?: string; category?: string }) =>
    api.post('/settings', data),
  deleteSetting: (key: string) => api.delete(`/settings/${key}`),
};

// Users API
export const usersApi = {
  getAll: () => api.get('/admin/users'),
  getById: (id: string) => api.get(`/admin/users/${id}`),
  update: (id: string, data: any) => api.put(`/admin/users/${id}`, data),
  delete: (id: string) => api.delete(`/admin/users/${id}`),
};

// Services API
export const servicesApi = {
  getAll: () => api.get('/service'),
  create: (data: any) => api.post('/service', data),
  update: (id: string, data: any) => api.patch(`/service/${id}`, data),

  delete: (id: string) => api.delete(`/service/${id}`),
};

// Categories API
export const categoriesApi = {
  getAll: () => api.get('/category'),
  create: (data: FormData) => api.post('/category', data),
  update: (id: string, data: FormData) => api.patch(`/category/${id}`, data),
  delete: (id: string) => api.delete(`/category/${id}`),
};

// Bookings API
export const bookingsApi = {
  getAll: () => api.get('/booking'),
  getById: (id: string) => api.get(`/booking/${id}`),
  update: (id: string, data: any) => api.patch(`/booking/${id}`, data),
  assign: (id: string) => api.put(`/booking/${id}/assign`),
};

// Chat API
export const chatApi = {
  getAll: (status?: string) => api.get('/chat', { params: status ? { status } : {} }),
  create: (data: any) => api.post('/chat', data),
  getChat: (id: string) => api.get(`/chat/${id}`),
  sendMessage: (id: string, formData: FormData) => api.post(`/chat/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  markSeen: (messageIds: string[]) => api.patch('/chat/message', { messageIds }),
  join: (id: string) => api.post(`/chat/${id}/join`),
  leave: (id: string) => api.post(`/chat/${id}/leave`),
}

// Files API
export const filesApi = {
  upload: (data: FormData) => api.post('/file', data),
  getAll: (params?: { search?: string, year?: string | number }) => api.get('/file', { params }),
  getByBookingId: (bookingId: string) => api.get(`/file?bookingId=${bookingId}`),
  update: (id: string, data: any) => api.patch(`/file/${id}`, data),
  delete: (id: string) => api.delete(`/file/${id}`),
};

export const subAdminApi = {
  getAll: () => api.get('/subAdmin'),
  create: (data: FormData) => api.post('/subAdmin', data),
  update: (id: string, data: FormData) => api.patch(`/subAdmin/${id}`, data),
  delete: (id: string) => api.delete(`/subAdmin/${id}`),
};

// Ratings API
export const ratingsApi = {
  getAll: (params?: { service?: string, user?: string }) => api.get('/rating', { params }),
  delete: (id: string) => api.delete(`/rating/${id}`),
};

// Tax Category API
export const taxCategoryApi = {
  getAll: (params?: { year?: number }) => api.get('/tax-category', { params }),
  create: (data: any) => api.post('/tax-category', data),
  update: (id: string, data: any) => api.put(`/tax-category/${id}`, data),
  delete: (id: string) => api.delete(`/tax-category/${id}`),
  calculate: (data: { categoryId: string, amount: number }) => api.post('/tax-category/calculate', data),
};
