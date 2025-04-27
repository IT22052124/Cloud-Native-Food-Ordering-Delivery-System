import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as api from '../services/api';
import { router } from 'expo-router';
import { toggleAvailabilityAPI } from '../services/api';

interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  vehiclePlate: string;
  role: "delivery";
  status: "active" | "inactive" | "suspended" | "pending_approval";
  driverIsAvailable?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<User>;
  register: (data: RegisterFormValues) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  toggleAvailability: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  changePassword: (data: { currentPassword: string, newPassword: string }) => Promise<void>;
}

interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  phone: string;
  nic: string;
  vehiclePlate: string;
  nicImage: string;
}

const AuthContext = createContext<AuthContextType>(null!);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const toggleAvailability = async () => {
    const result = await toggleAvailabilityAPI();
    setUser((prev) => prev ? { ...prev, driverIsAvailable: result.isAvailable } : null);
  };

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const currentUser = await api.getCurrentUser();
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Check auth error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const refreshUser = async () => {
    const userData = await api.getCurrentUser();
    setUser(userData);
  };

  const login = async (credentials: { email: string; password: string }): Promise<User> => {
    const { token, refreshToken, user } = await api.loginUser(credentials);
    await AsyncStorage.multiSet([
      ['token', token],
      ['refreshToken', refreshToken]
    ]);
    setUser(user);
    return user;
  };

  const updateProfile = async (updates: Partial<User>) => {
    const updated = await api.updateProfile(updates);
    setUser(updated.user);
  };
  
  const changePassword = async (data: { currentPassword: string, newPassword: string }) => {
    await api.changePassword(data);
  };

  const logout = async () => {
    try {
      await api.logoutUser();
    } finally {
      await AsyncStorage.multiRemove(['token', 'refreshToken']);
      setUser(null);
      router.replace('/(auth)/login');
    }
  };

  const register = async (data: RegisterFormValues) => {
    const payload = {
      ...data,
      role: 'delivery', // Force role from frontend too (optional since backend also enforces)
    };
    
    const { token, refreshToken, user } = await api.registerUser(payload);
    await AsyncStorage.multiSet([
      ["token", token],
      ["refreshToken", refreshToken],
    ]);
    setUser(user);
    return user;
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, refreshUser, login, register, logout, toggleAvailability, updateProfile, changePassword }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
