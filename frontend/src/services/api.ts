import axios from 'axios';

// Determine API base URL based on environment
const getApiBaseUrl = (): string => {
  // If we have an environment variable, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Otherwise, use the same origin as the frontend
  // This handles both localhost and production domains
  const protocol = window.location.protocol; // http: or https:
  const host = window.location.host; // localhost:5173 or dealer.askgroup-bd.com
  
  // Replace frontend port with backend port if on localhost
  if (host.includes('localhost')) {
    return `${protocol}//localhost:8000/api/v1`;
  }
  
  // For production, assume backend is on same domain
  return `${protocol}//${host}/api/v1`;
};

const API_BASE_URL = getApiBaseUrl();

// Create axios instances for different API endpoints
export const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const dealerApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const productApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const purchaseOrderApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const settingsApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
const addAuthInterceptor = (api: typeof authApi) => {
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle auth errors
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
};

addAuthInterceptor(authApi);
addAuthInterceptor(dealerApi);
addAuthInterceptor(productApi);
addAuthInterceptor(purchaseOrderApi);
addAuthInterceptor(settingsApi);

export default { authApi, dealerApi, productApi, purchaseOrderApi, settingsApi };