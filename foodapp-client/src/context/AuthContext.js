import React, { createContext, useState, useEffect, useContext } from "react";
import * as SecureStore from "expo-secure-store";
import authService from "../services/authService";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync("token");

      if (storedToken) {
        setToken(storedToken);
        // Also set the token in AsyncStorage for API client usage
        try {
          await AsyncStorage.setItem("authToken", storedToken);
        } catch (e) {
          // Ignore localStorage errors in React Native environment
        }

        const userData = await authService.getCurrentUser(storedToken);
        if (userData) {
          setUser(userData);
        } else {
          // If user data is null, token might be invalid
          await SecureStore.deleteItemAsync("token");
          try {
            await AsyncStorage.removeItem("authToken");
          } catch (e) {
            // Ignore localStorage errors in React Native environment
          }
        }
      }
    } catch (err) {
      console.error("Failed to load authentication data:", err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      // setLoading(true);

      const response = await authService.login(email, password);

      if (response && response.token) {
        setUser(response.user);
        setToken(response.token);

        // Store token in SecureStore
        await SecureStore.setItemAsync("token", response.token);

        // Also set token in localStorage for API client usage
        try {
          await AsyncStorage.setItem("authToken", response.token);
        } catch (e) {
          // Ignore localStorage errors in React Native environment
        }

        return response;
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      setError(err.message || "Login failed");
      throw err;
    } finally {
      // setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      const response = await authService.register(userData);
      if (response && response.token) {
        setUser(response.user);
        setToken(response.token);
        await SecureStore.setItemAsync("token", response.token);
        try {
          await AsyncStorage.setItem("authToken", response.token);
        } catch (e) {
          // Ignore localStorage errors in React Native environment
        }
      }
      return response;
    } catch (err) {
      setError(err.message || "Registration failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await authService.logout(token);
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
      setToken(null);
      await SecureStore.deleteItemAsync("token");
      try {
        await AsyncStorage.removeItem("authToken");
      } catch (e) {
        // Ignore localStorage errors in React Native environment
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!user && !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
