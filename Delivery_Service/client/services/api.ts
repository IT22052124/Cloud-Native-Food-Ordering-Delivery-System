import axios, {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosHeaders
} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// For environment variables
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5001/api';

interface AuthResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: 'customer' | 'delivery' | 'restaurant' | 'admin';
    status: 'active' | 'inactive' | 'suspended' | 'pending_approval';
  };
}

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Token refresh function
const refreshToken = async (): Promise<string | null> => {
  try {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    if (!refreshToken) return null;

    const response = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
    const { token, newRefreshToken } = response.data;
    
    await AsyncStorage.multiSet([
      ['token', token],
      ['refreshToken', newRefreshToken]
    ]);
    return token;
  } catch (error) {
    await AsyncStorage.multiRemove(['token', 'refreshToken']);
    return null;
  }
};

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const newToken = await refreshToken();
      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      }
    }
    return Promise.reject(error);
  }
);

// API methods remain the same...
export const loginUser = async (
  credentials: { email: string; password: string }
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', credentials);
  return response.data;
};

// ... other methods