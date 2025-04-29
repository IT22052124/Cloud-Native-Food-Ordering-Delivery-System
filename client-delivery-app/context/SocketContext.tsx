import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  goOnline: (lat: number, lng: number) => void;
  goOffline: () => void;
  updateLocation: (deliveryId: string, lat: number, lng: number) => void;
}

const SocketContext = createContext<SocketContextType>(null!);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const init = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const newSocket = io(process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:5004', {
        auth: { token },
        transports: ['websocket'],
      });

      newSocket.on('connect', () => {
        setIsConnected(true);
        console.log('✅ Socket connected');
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
        console.log('❌ Socket disconnected');
      });

      setSocket(newSocket);
    };

    init();

    return () => {
      socket?.disconnect();
    };
  }, []);

  const goOnline = (lat: number, lng: number) => {
    socket?.emit('goOnline', { lat, lng });
  };

  const goOffline = () => {
    socket?.emit('goOffline');
  };

  const updateLocation = (deliveryId: string, lat: number, lng: number) => {
    socket?.emit('updateLocation', { deliveryId, lat, lng });
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, goOnline, goOffline, updateLocation }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
