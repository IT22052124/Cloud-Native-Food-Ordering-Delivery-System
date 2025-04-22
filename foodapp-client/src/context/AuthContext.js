import React, { createContext, useState, useEffect, useContext } from "react";
import * as SecureStore from "expo-secure-store";
import authService from "../services/authService";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      setLoading(true);
      // First try to get tokens from SecureStore
      let storedToken = await SecureStore.getItemAsync("token");
      let storedRefreshToken = await SecureStore.getItemAsync("refreshToken");

      // If not in SecureStore, try AsyncStorage as fallback
      if (!storedToken) {
        storedToken = await AsyncStorage.getItem("authToken");
      }
      if (!storedRefreshToken) {
        storedRefreshToken = await AsyncStorage.getItem("refreshToken2");
      }
      // Make sure both stores are synchronized
      if (storedToken) {
        setToken(storedToken);
        // Ensure token is in both stores
        await SecureStore.setItemAsync("token", storedToken);
        await AsyncStorage.setItem("authToken", storedToken);

        if (storedRefreshToken) {
          setRefreshToken(storedRefreshToken);
          await SecureStore.setItemAsync("refreshToken", storedRefreshToken);
          await AsyncStorage.setItem("refreshToken2", storedRefreshToken);
        }
        try {
          const userData = await authService.getCurrentUser();
          if (userData) {
            setUser(userData);
          } else {
            // If user data is null, token might be invalid - try to refresh it
            try {
              // Only try to refresh if we have a refresh token
              if (storedRefreshToken) {
                const refreshResult = await authService.refreshToken();
                if (refreshResult && refreshResult.token) {
                  setToken(refreshResult.token);
                  await SecureStore.setItemAsync("token", refreshResult.token);
                  await AsyncStorage.setItem("authToken", refreshResult.token);

                  if (refreshResult.refreshToken) {
                    setRefreshToken(refreshResult.refreshToken);
                    await SecureStore.setItemAsync(
                      "refreshToken",
                      refreshResult.refreshToken
                    );
                    await AsyncStorage.setItem(
                      "refreshToken2",
                      refreshResult.refreshToken
                    );
                  }

                  const refreshedUserData = await authService.getCurrentUser();
                  if (refreshedUserData) {
                    setUser(refreshedUserData);
                  } else {
                    await clearAuthData();
                  }
                } else {
                  await clearAuthData();
                }
              } else {
                console.log("No refresh token available, clearing auth data");
                await clearAuthData();
              }
            } catch (refreshError) {
              console.error("Token refresh failed:", refreshError);
              await clearAuthData();
            }
          }
        } catch (userError) {
          console.error("Error fetching user data:", userError);
          await clearAuthData();
        }
      } else {
        await clearAuthData();
      }
    } catch (err) {
      console.error("Failed to load authentication data:", err);
      await clearAuthData();
    } finally {
      setLoading(false);
    }
  };

  const clearAuthData = async () => {
    setUser(null);
    setToken(null);
    setRefreshToken(null);

    // Clear both storage mechanisms
    try {
      await SecureStore.deleteItemAsync("token");
      await SecureStore.deleteItemAsync("refreshToken");
      await AsyncStorage.removeItem("authToken");
      await AsyncStorage.removeItem("refreshToken2");
    } catch (e) {
      console.error("Error clearing auth data:", e);
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

        // Store in both storage mechanisms
        await SecureStore.setItemAsync("token", response.token);
        await AsyncStorage.setItem("authToken", response.token);

        // Store refresh token if available
        if (response.refreshToken) {
          setRefreshToken(response.refreshToken);
          await SecureStore.setItemAsync("refreshToken", response.refreshToken);
          await AsyncStorage.setItem("refreshToken2", response.refreshToken);
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

        // Store in both storage mechanisms
        await SecureStore.setItemAsync("token", response.token);
        await AsyncStorage.setItem("authToken", response.token);

        // Store refresh token if available
        if (response.refreshToken) {
          setRefreshToken(response.refreshToken);
          await SecureStore.setItemAsync("refreshToken", response.refreshToken);
          await AsyncStorage.setItem("refreshToken2", response.refreshToken);
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
    setLoading(true);
    try {
      if (token) {
        await authService.logout();
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      await clearAuthData();
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        refreshToken,
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
