import { Stack } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
import { SocketProvider } from '../context/SocketContext';
import Toast from "react-native-toast-message";

export default function RootLayout() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(delivery)" />
          <Stack.Screen name="index" />
        </Stack>
        <Toast />
      </SocketProvider>
    </AuthProvider>
  );
}