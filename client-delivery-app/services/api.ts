import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_API_URL = process.env.EXPO_PUBLIC_AUTH_API_URL || 'http://192.168.48.124:5001';
const DELIVERY_API_URL = process.env.EXPO_PUBLIC_DELIVERY_API_URL || 'http://192.168.48.124:5004';
const ORDER_API_URL = process.env.EXPO_PUBLIC_ORDER_API_URL || 'http://192.168.48.124:5002';

const authApi = axios.create({
  baseURL: AUTH_API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

const orderApi = axios.create({
  baseURL: ORDER_API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

const deliveryApi = axios.create({
  baseURL: DELIVERY_API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

deliveryApi.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

authApi.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const registerUser = async (data: any) => {
  const res = await authApi.post("/api/auth/register", data);
  return res.data;
};

// Auth APIs
export const loginUser = async (credentials: { email: string; password: string }) => {
  const res = await authApi.post('/api/auth/login', credentials);
  return res.data;
};

export const logoutUser = async () => {
  return await authApi.post('/api/auth/logout');
};

export const toggleAvailabilityAPI = async () => {
  const res = await authApi.put('/api/users/me/availability/toggle');
  return res.data;
};

export const updateProfile = async (data: Partial<any>) => {
  const res = await authApi.put('/api/users/me', data);
  return res.data;
};

export const changePassword = async (data: { currentPassword: string; newPassword: string }) => {
  const res = await authApi.put('/api/users/me/password', data);
  return res.data;
};

export const getCurrentUser = async () => {
  const res = await authApi.get('api/auth/me');
  return res.data.user;
};

export const getDeliveryByIdAPI = async (deliveryId: string) => {

  const res = await deliveryApi.get(`/api/deliveries/${deliveryId}`);
  return res.data; // { success: true, delivery }
};

export const getCurrentDriverDeliveryAPI = async () => {
  const res = await deliveryApi.get('/api/deliveries/driver/current');
  return res.data; // { success, delivery }
};

export const updateDeliveryStatusAPI = async (deliveryId: string, status: string) => {
  const res = await deliveryApi.patch(`/api/deliveries/${deliveryId}/status`, { status });
  return res.data.delivery;
};

export const updateDeliveryVerification = async (deliveryId: any) => {
  const res = await deliveryApi.patch(`/api/deliveries/${deliveryId}/verify`);
  return res.data.delivery;
};

export const trackDeliveryAPI = async (deliveryId: string) => {
  const res = await deliveryApi.get(`/api/deliveries/track/${deliveryId}`);
  return res.data; // { driverLocation, deliveryLocation, route, eta }
};

export const getCurrentMonthEarningsAPI = async (driverId: string) => {
  try {
    const res = await deliveryApi.get(`/api/earnings/current/${driverId}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching monthly earnings:', error);
    return { success: false, total: 0 };
  }
};

export default { authApi, deliveryApi };
