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
  const response = await axios.post('http://localhost:3000/api/branch/login', credentials);
  return response.data;
};
export const addRestaurant = async (restaurantData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post('http://localhost:3000/api/restaurants/add', restaurantData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('addRestaurant: Error:', error);
    throw error;
  }
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

export const getRestaurantById = async (id) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`http://localhost:3000/api/restaurants/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('getRestaurantById: Error:', error);
    throw error;
  }
};

export const updateRestaurantStatus = async (id, isActive) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.patch(
      `http://localhost:3000/api/restaurants/${id}/status`,
      { isActive },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('updateRestaurantStatus: Error:', error);
    throw error;
  }
};

export const updateRestaurant = async (id, data) => {
  const token = localStorage.getItem('token');
  console.log('Sending data:', data);
  const response = await axios.put(`http://localhost:3000/api/restaurants/${id}`, data,{
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const deleteRestaurant = async (id) => {
  const token = localStorage.getItem('token');

  const response = await axios.delete(`http://localhost:3000/api/restaurants/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
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
  const response = await api.get(`branch/`);
  return response.data;
};

export const addDish = async (data) => {
  const response = await api.post('/branch/add', data);
  return response.data;
};

export const getDish = async (id) => {
  const response = await api.get(`branch/${id}`);
  return response.data;
};

export const updateDish = async (id, data) => {
  const response = await api.put(`/branch/${id}`, data);
  return response.data;
};

export const deleteDish = async (id) => {
  const response = await api.delete(`/branch/${id}`);
  return response.data;
};