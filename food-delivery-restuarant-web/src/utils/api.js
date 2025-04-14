import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const loginOwner = async (credentials) => {
  const response = await axios.post('http://localhost:5001/api/auth/login', credentials);
  return response.data;
};

export const loginRestaurantAdmin = async (credentials) => {
  const response = await axios.post('http://localhost:3000/api/restaurant-admin/login', credentials);
  return response.data;
};

export const addRestaurant = async (data) => {
  const response = await api.post('/restaurants/add', data);
  return response.data;
};

export const getRestaurants = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:3000/api/restaurants', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('getRestaurants: API response:', response.data);
    // Extract the restaurants array, fallback to empty array
    return Array.isArray(response.data.restaurants) ? response.data.restaurants : [];
  } catch (error) {
    console.error('getRestaurants: Error:', error);
    throw error;
  }
};

export const getRestaurant = async (id) => {
  const response = await api.get(`/restaurants/${id}`);
  return response.data;
};

export const updateRestaurant = async (id, data) => {
  const response = await api.put(`/restaurants/update/${id}`, data);
  return response.data;
};

export const deleteRestaurant = async (id) => {
  const response = await api.delete(`/restaurants/${id}`);
  return response.data;
};

export const getOrders = async () => {
  const response = await api.get('/orders');
  return response.data;
};

export const updateOrderStatus = async (id, status) => {
  const response = await api.put(`/orders/${id}`, { status });
  return response.data;
};

export const getDishes = async (restaurantId) => {
  const response = await api.get(`/dishes?restaurantId=${restaurantId}`);
  return response.data;
};

export const addDish = async (data) => {
  const response = await api.post('/dishes', data);
  return response.data;
};

export const getDish = async (id) => {
  const response = await api.get(`/dishes/${id}`);
  return response.data;
};

export const updateDish = async (id, data) => {
  const response = await api.put(`/dishes/${id}`, data);
  return response.data;
};

export const deleteDish = async (id) => {
  const response = await api.delete(`/dishes/${id}`);
  return response.data;
};