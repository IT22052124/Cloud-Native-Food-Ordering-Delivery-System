import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import * as api from "../services/api";

interface User {
  id: string;
  email: string;
  name: string;
  role: "customer" | "delivery" | "restaurant" | "admin";
  status: "active" | "inactive" | "suspended" | "pending_approval";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<User>;
  register: (userData: any, role: "customer" | "delivery") => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>(null!);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        const userData = await api.getCurrentUser();
        setUser(userData);
      }
    } catch (error) {
      console.error("Auth check error:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await api.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error("Refresh user error:", error);
      throw error;
    }
  };

  const login = async (credentials: { email: string; password: string }): Promise<User> => {
    try {
      const { token, refreshToken, user } = await api.loginUser(credentials); // Destructure refreshToken
      await AsyncStorage.multiSet([
        ['token', token],
        ['refreshToken', refreshToken] // Store refresh token
      ]);
      setUser(user);
      return user;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: any, role: 'customer' | 'delivery'): Promise<User> => {
    try {
      const { token, refreshToken, user } = await api.registerUser(userData, role);
      await AsyncStorage.multiSet([
        ['token', token],
        ['refreshToken', refreshToken] // Store refresh token
      ]);
      setUser(user);
      return user;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.logoutUser();
      await AsyncStorage.removeItem("token");
      setUser(null);
      router.replace("/(auth)/role-selection");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);