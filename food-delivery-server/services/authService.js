import axios from 'axios';

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;

export const validateToken = async (token) => {
  const response = await axios.get(
    `${AUTH_SERVICE_URL}/api/auth/validate-token`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const getUserById = async (userId) => {
  const response = await axios.get(
    `${AUTH_SERVICE_URL}/api/users/${userId}`
  );
  return response.data.user;
};