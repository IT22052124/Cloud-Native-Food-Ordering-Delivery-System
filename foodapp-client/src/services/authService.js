import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import {
  uploadImageToFirebase,
  deleteImageFromFirebase,
} from "../utils/firebase/imageUtils";

// Use consistent API URL configuration
const API_BASE_URL = "http://192.168.1.6:5001/api";
const AUTH_API_URL = `${API_BASE_URL}/auth`;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL, // Fix: Use API_BASE_URL instead of AUTH_API_URL
});

// Store token in AsyncStorage for React Native
const setToken = async (token) => {
  if (token) {
    try {
      await SecureStore.setItemAsync("token", token);
    } catch {
      await AsyncStorage.setItem("authToken", token);
    }
  } else {
    console.warn("No token found");
  }
};

// Store refresh token in AsyncStorage
const setRefreshToken = async (refreshToken) => {
  if (refreshToken) {
    try {
      await SecureStore.setItemAsync("refreshToken", token);
    } catch {
      await AsyncStorage.setItem("refreshToken2", refreshToken);
    }
  } else {
    console.warn("No refresh token found");
  }
};

// Get token from AsyncStorage
const getToken = async () => {
  try {
    let token = await SecureStore.getItemAsync("token");
    if (!token) {
      token = await AsyncStorage.getItem("authToken");
    }
    return token;
  } catch (e) {
    console.warn("Could not retrieve token from AsyncStorage:", e);
    return null;
  }
};

// Get refresh token from AsyncStorage
const getRefreshToken = async () => {
  try {
    let token = await SecureStore.getItemAsync("refreshToken");
    if (!token) {
      // Fall back to AsyncStorage
      token = await AsyncStorage.getItem("refreshToken2");
    }
    return token;
  } catch (e) {
    console.warn("Could not retrieve refresh token from AsyncStorage:", e);
    return null;
  }
};

// Handle API errors
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

// Setup axios request interceptor
api.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const authService = {
  // Register a new user
  register: async (userData) => {
    try {
      // Fix: Use correct path
      const response = await api.post(`/auth/register`, userData);

      if (response.data && response.data.token) {
        await setToken(response.data.token);
        if (response.data.refreshToken) {
          await setRefreshToken(response.data.refreshToken);
        }
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
      // Fix: Use correct path
      const response = await api.post(`/auth/login`, {
        email,
        password,
      });
      if (response.data && response.data.token) {
        await setToken(response.data.token);
        if (response.data.refreshToken) {
          await setRefreshToken(response.data.refreshToken);
        }
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
  getCurrentUser: async () => {
    try {
      // Fix: Use correct path
      const response = await api.get(`/auth/me`);
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
  logout: async () => {
    try {
      // Fix: Use correct path
      await api.post(`/auth/logout`);
      await setToken(null);
      await setRefreshToken(null);
      return true;
    } catch (error) {
      // Clear token even if logout request fails
      await setToken(null);
      await setRefreshToken(null);
      return false;
    }
  },

  // Refresh token
  refreshToken: async () => {
    try {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      // Fix: Use correct path
      const response = await api.post(`/auth/refresh-token`, {
        refreshToken,
      });

      if (!response.data || !response.data.token) {
        throw new Error("Failed to refresh token");
      }

      // Store the new tokens
      await setToken(response.data.token);
      if (response.data.refreshToken) {
        await setRefreshToken(response.data.refreshToken);
      }

      return response.data;
    } catch (error) {
      console.error("Token refresh failed:", error);
      await setToken(null);
      await setRefreshToken(null);
      throw handleError(error);
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    try {
      // Fix: Use correct path
      const response = await api.post(`/auth/forgot-password`, {
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
      // Fix: Use correct path
      const response = await api.post(`/auth/reset-password/${token}`, {
        password,
      });
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  // Validate token (useful for protected routes)
  validateToken: async () => {
    try {
      // Fix: Use correct path
      const response = await api.get(`/auth/validate-token`);
      return response.data && response.data.success;
    } catch (error) {
      return false;
    }
  },

  // Add a method to get the stored token
  getStoredToken: async () => {
    return await getToken();
  },

  // Get the stored refresh token
  getStoredRefreshToken: async () => {
    return await getRefreshToken();
  },

  updateProfile: async (updatedFields) => {
    try {
      // Create a mapped object with the correct field names for the API
      const mappedFields = {};

      // Map frontend field names to backend field names
      if (updatedFields.name !== undefined)
        mappedFields.name = updatedFields.name;
      if (updatedFields.email !== undefined)
        mappedFields.email = updatedFields.email;
      if (updatedFields.phone !== undefined)
        mappedFields.phone = updatedFields.phone;

      // Handle profile image upload if included
      if (
        updatedFields.profileImage &&
        updatedFields.profileImage.startsWith("file:")
      ) {
        // This is a local file URI that needs to be uploaded to Firebase
        const userId = (await authService.getCurrentUser())?._id;
        if (!userId) {
          throw new Error("User ID not available for image upload");
        }

        try {
          // Upload the image to Firebase
          const uploadResult = await uploadImageToFirebase(
            updatedFields.profileImage,
            userId
          );

          // Replace the local URI with the Firebase download URL and use the correct field name
          mappedFields.profilePicture = uploadResult.downloadURL;
          // Store the Firebase path for potential future deletion if needed
          mappedFields.profileImagePath = uploadResult.path;
        } catch (uploadError) {
          console.error("Failed to upload profile image:", uploadError);
          throw new Error("Failed to upload profile image");
        }
      } else if (updatedFields.profileImage) {
        // Just pass through the URL if it's not a file URI
        mappedFields.profilePicture = updatedFields.profileImage;
      }

      // Call the API to update the user profile with the mapped fields
      const response = await api.patch("/users/me", mappedFields);

      // Map the returned data back to the frontend field names if needed
      const returnData = { ...response.data };
      if (returnData.user?.profilePicture) {
        returnData.user.profileImage = returnData.user.profilePicture;
      }

      return returnData.user || returnData;
    } catch (error) {
      console.error("Update profile error:", error);
      if (error.response) {
        throw new Error(
          error.response.data.message || "Failed to update profile"
        );
      } else {
        throw new Error(
          error.message || "Network error. Please check your connection."
        );
      }
    }
  },

  // Method to delete user's profile image
  deleteProfileImage: async () => {
    try {
      const currentUser = await authService.getCurrentUser();

      if (currentUser && currentUser.profileImagePath) {
        // Delete from Firebase
        await deleteImageFromFirebase(currentUser.profileImagePath);

        // Update user profile to remove image references
        await api.patch("/users/me", {
          profileImage: null,
          profileImagePath: null,
        });

        return { success: true };
      } else {
        throw new Error("No profile image to delete");
      }
    } catch (error) {
      console.error("Delete profile image error:", error);
      throw error;
    }
  },
};

export default authService;
