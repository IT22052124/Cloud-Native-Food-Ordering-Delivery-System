// app/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { router } from 'expo-router';
import { View, Text } from 'react-native';

interface AuthContextType {
  user: any;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/dev-login', { email, password });
      console.log('Login success', response.data); // ✅ Log response
  
      const { accessToken } = response.data;
      await AsyncStorage.setItem('accessToken', accessToken);
  
      const userRes = await api.get('/me');
      setUser(userRes.data.user);
  
      router.replace('/home');
    } catch (err: any) {
      console.error('Login error:', err.response?.data || err.message);
      throw err;
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('accessToken');
    setUser(null);
    router.replace('/login');
  };

  const restoreSession = async () => {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) return;

    try {
      const res = await api.get('/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data.user);
    } catch (err) {
      console.warn('Session expired or invalid, logging out');
      await AsyncStorage.removeItem('accessToken');
      setUser(null);
    }
  };

  useEffect(() => {
    restoreSession();
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        try {
          const response = await api.get('/me');
          setUser(response.data.user);
        } catch (err) {
          await AsyncStorage.removeItem('accessToken');
        }
      }
      setLoading(false); // ✅ mark loading complete
    };
    loadUser();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext)!;