import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Use consistent API URL configuration
const API_BASE_URL = "http://192.168.1.2:5001/api";
const AUTH_API_URL = `${API_BASE_URL}/auth`;

// Store token in AsyncStorage for React Native
const setToken = async (token) => {
  if (token) {
    try {
      await AsyncStorage.setItem("authToken", token);
    } catch (e) {
      console.warn("Could not store token in AsyncStorage:", e);
    }
  } else {
    try {
      await AsyncStorage.removeItem("authToken");
    } catch (e) {
      console.warn("Could not remove token from AsyncStorage:", e);
    }
  }
};

// Get token from AsyncStorage
const getToken = async () => {
  try {
    return await AsyncStorage.getItem("authToken");
  } catch (e) {
    console.warn("Could not retrieve token from AsyncStorage:", e);
    return null;
  }
};

const authService = {
  // Register a new user
  register: async (userData) => {
    try {
      const response = await axios.post(`${AUTH_API_URL}/register`, userData);

      if (response.data && response.data.token) {
        await setToken(response.data.token);
        return response.data;
      } else {
        throw new Error("Registration failed. Please try again.");
      }
    } catch (error) {
      throw handleError(error);
    }
  },

  // Login user
  login: async (email, password) => {
    try {
      const response = await axios.post(`${AUTH_API_URL}/login`, {
        email,
        password,
      });
      if (response.data && response.data.token) {
        await setToken(response.data.token);
        return response.data;
      } else {
        throw new Error("Login failed. Please check your credentials.");
      }
    } catch (error) {
      // More specific error handling for login
      if (error.response) {
        if (error.response.status === 401) {
          throw new Error("Invalid email or password.");
        } else if (error.response.status === 403) {
          throw new Error(
            "Your account is not active. Please contact support."
          );
        }
      }
      throw handleError(error);
    }
  },

  // Get current user details
  getCurrentUser: async (token) => {
    try {
      const response = await axios.get(`${AUTH_API_URL}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.user) {
        return response.data.user;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Failed to get current user:", error);
      return null;
    }
  },

  // Logout user
  logout: async (token) => {
    try {
      if (!token) {
        await setToken(null);
        return true;
      }

      await axios.post(
        `${AUTH_API_URL}/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await setToken(null);
      return true;
    } catch (error) {
      // Clear token even if logout request fails
      await setToken(null);
      return false;
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    try {
      const response = await axios.post(`${AUTH_API_URL}/forgot-password`, {
        email,
      });
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  // Reset password
  resetPassword: async (token, password) => {
    try {
      const response = await axios.post(
        `${AUTH_API_URL}/reset-password/${token}`,
        {
          password,
        }
      );
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  // Validate token (useful for protected routes)
  validateToken: async (token) => {
    try {
      if (!token) {
        return false;
      }

      const response = await axios.get(`${AUTH_API_URL}/validate-token`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data && response.data.success;
    } catch (error) {
      return false;
    }
  },

  // Add a method to get the stored token
  getStoredToken: async () => {
    return await getToken();
  },
};

// Error handler
const handleError = (error) => {
  if (error.response) {
    // Server responded with a status code outside the 2xx range
    const errorMessage = error.response.data?.message || "An error occurred";
    const errorObj = new Error(errorMessage);
    errorObj.statusCode = error.response.status;
    errorObj.data = error.response.data;
    return errorObj;
  } else if (error.request) {
    // Request was made but no response received
    return new Error(
      "Cannot connect to server. Please check your internet connection."
    );
  } else {
    // Error setting up the request
    return new Error("Network error. Please try again later.");
  }
};

export default authService;
