import axios, {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig
} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5001';

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

interface ApiError {
  message: string;
  status?: number;
}

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Enhanced error handling
const handleApiError = (error: AxiosError): Promise<never> => {
  const apiError: ApiError = {
    message: (error.response?.data as any)?.message || error.message,
    status: error.response?.status
  };
  return Promise.reject(apiError);
};

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
  handleApiError
);

// Token refresh function (explicit)
export const refreshToken = async (): Promise<{ token: string }> => {
  try {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token');
    
    const response = await axios.post(`${API_URL}/api/auth/refresh-token`, { refreshToken });
    await AsyncStorage.multiSet([
      ['token', response.data.token],
      ['refreshToken', response.data.refreshToken]
    ]);
    return response.data;
  } catch (error) {
    await AsyncStorage.multiRemove(['token', 'refreshToken']);
    return handleApiError(error as AxiosError);
  }
};

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { token } = await refreshToken();
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        return handleApiError(refreshError as AxiosError);
      }
    }
    return handleApiError(error);
  }
);

// API Methods - Verified against auth service endpoints
export const registerUser = async (
  userData: any,
  role: 'customer' | 'delivery'
): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/api/auth/register', { 
      ...userData, 
      role 
    });
    return response.data;
  } catch (error) {
    return handleApiError(error as AxiosError);
  }
};

export const loginUser = async (
  credentials: { email: string; password: string }
): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/api/auth/login', credentials);
    return response.data;
  } catch (error) {
    return handleApiError(error as AxiosError);
  }
};

export const getCurrentUser = async (): Promise<AuthResponse['user']> => {
  try {
    const response = await api.get<{ user: AuthResponse['user'] }>('/api/auth/me');
    return response.data.user;
  } catch (error) {
    return handleApiError(error as AxiosError);
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await api.post('/api/auth/logout');
  } catch (error) {
    return handleApiError(error as AxiosError);
  }
};

export const forgotPassword = async (email: string): Promise<void> => {
  try {
    await api.post('/api/auth/forgot-password', { email });
  } catch (error) {
    return handleApiError(error as AxiosError);
  }
};

export const resetPassword = async (
  token: string,
  newPassword: string
): Promise<void> => {
  try {
    await api.post(`/api/auth/reset-password/${token}`, { 
      password: newPassword 
    });
  } catch (error) {
    return handleApiError(error as AxiosError);
  }
};

export default api;