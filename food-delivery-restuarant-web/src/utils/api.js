import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5006/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const loginOwner = async (credentials) => {
  const response = await axios.post('http://localhost:5001/api/auth/login', credentials);
  return response.data;
};

export const signup = async (credentials) => {
  const response = await axios.post('http://localhost:5001/api/auth/register', credentials);
  return response.data;
};

export const loginRestaurantAdmin = async (credentials) => {
  const response = await axios.post('http://localhost:5006/api/branch/login', credentials);
  return response.data;
};
export const addRestaurant = async (restaurantData) => {
  try {
    const token = localStorage.getItem('ownerToken');
    const response = await axios.post('http://localhost:5006/api/restaurants/add', restaurantData, {
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
    const token = localStorage.getItem('ownerToken');
    const response = await axios.get('http://localhost:5006/api/owner/restaurants', {
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
export const getPendingRestaurants = async () => {
  try {
    const token = localStorage.getItem('ownerToken');
    const response = await axios.get('http://localhost:5006/api/owner/restaurants/pending', {
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
  try {
    const token = localStorage.getItem('ownerToken');
    if (!token) throw new Error('No owner token found');
    const response = await api.get(`/restaurants/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('getRestaurant: Error:', error.response?.data || error.message);
    throw error;
  }
};

export const getRestaurantById = async (id) => {
  try {
    const token = localStorage.getItem('ownerToken');
    if (!token) throw new Error('No owner token found');

    const response = await axios.get(`http://localhost:5006/api/restaurants/${id}`, {
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
    const token = localStorage.getItem('ownerToken');
    if (!token) throw new Error('No owner token found');

    const response = await axios.patch(
      `http://localhost:5006/api/restaurants/${id}/status`,
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
  const token = localStorage.getItem('ownerToken');
  if (!token) throw new Error('No owner token found');
  const response = await axios.put(`http://localhost:5006/api/restaurants/${id}`, data,{
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const deleteRestaurant = async (id) => {
  const token = localStorage.getItem('ownerToken');
  if (!token) throw new Error('No owner token found');

  const response = await axios.delete(`http://localhost:5006/api/restaurants/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
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

// Updated getOrders to fetch orders with a specific status
// Updated getOrders to fetch orders with a specific status
export const getOrders = async (status) => {
  try {
    const token = localStorage.getItem("adminToken");
    if (!token) throw new Error('No admin token found');

    const response = await axios.post(
      "http://localhost:5002/api/orders/restaurant",
      status,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.orders || [];
  } catch (error) {
    console.error("getOrders: Error:", error);
    throw error;
  }
};

// Updated updateOrderStatus to call the orders microservice directly
export const updateOrderStatus = async (id, status, notes = '', estimatedReadyMinutes) => {
  try {
    const payload = { status, notes };
    if (estimatedReadyMinutes) {
      payload.estimatedReadyMinutes = estimatedReadyMinutes;
    }
    const response = await axios.patch(
      `http://localhost:5002/api/orders/${id}/status`, // Orders microservice endpoint
      payload,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('updateOrderStatus: Error:', error);
    throw error;
  }
};
// Fetch current user details
export const getCurrentUser = async (token) => {
  try {
    const token = localStorage.getItem('ownerToken');
    if (!token) throw new Error('No owner token found');
    const response = await axios.get('http://localhost:5001/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching current user:', error);
    throw error.response?.data || { success: false, message: 'Failed to fetch user data' };
  }
};

// Update user profile
export const updateProfile = async (token, updates) => {
  try {
    const token = localStorage.getItem('ownerToken');
    if (!token) throw new Error('No owner token found');
    const response = await axios.patch('http://localhost:5001/api/users/me', updates, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error.response?.data || { success: false, message: 'Failed to update profile' };
  }
};

export const AdmingetRestaurantById = async (id) => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.get(`http://localhost:5006/api/branch/restaurants/${id}`, {
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

export const AdminupdateRestaurant = async (id, data) => {
  const token = localStorage.getItem('adminToken');
  console.log('Sending data:', data);
  const response = await axios.put(`http://localhost:5006/api/branch/restaurants/${id}`, data,{
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};


export const AdminupdateRestaurantStatus = async (id, isActive) => {
  try {
    const token = localStorage.getItem('adminToken');
    if (!token) throw new Error('No admin token found');
    const response = await axios.patch(
      `http://localhost:5006/api/branch/restaurants/${id}/status`,
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

export const getRestaurantUsernames = async (restaurantId) => {
  try {
    const token = localStorage.getItem('adminToken');
    if (!token) throw new Error('No admin token found');
    const response = await axios.get(`http://localhost:5006/api/branch/restaurants/${restaurantId}/usernames`,{
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;;
  } catch (error) {
    console.error('getRestaurantUsernames: Error:', error);
    throw error.response?.data || { success: false, message: 'Failed to fetch usernames' };
  }
};

/**
 * Update username and/or password for a restaurant admin
 * @param {string} restaurantId - The ID of the restaurant
 * @param {Object} credentials - Object containing currentUsername, newUsername, and/or newPassword
 * @returns {Promise<Object>} - Response containing update status
 */
export const updateRestaurantCredentials = async (restaurantId, credentials) => {
  try {
    const token = localStorage.getItem('adminToken');
    if (!token) throw new Error('No admin token found');
    const response =  await axios.patch(`http://localhost:5006/api/branch/restaurants/${restaurantId}/credentials`, credentials,{
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('updateRestaurantCredentials: Error:', error);
    throw error.response?.data || { success: false, message: 'Failed to update credentials' };
  }
};

export const getAllOwnerOrders = async (startDate, endDate) => {
  try {
    const token = localStorage.getItem('ownerToken');
    if (!token) throw new Error('No admin token found');
    const response =  await axios.get(`http://localhost:5002/api/orders/restaurant/owner/orders`,  {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        startDate,
        endDate,
      },
    });

    console.log('getAllOrders: Response:', response.data.orders);
    return Array.isArray(response.data.orders) ? response.data.orders : [];
  } catch (error) {
    console.error('updateRestaurantCredentials: Error:', error);
    throw error.response?.data || { success: false, message: 'Failed to update credentials' };
  }
};
