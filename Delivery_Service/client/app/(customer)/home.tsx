import { View, Text } from 'react-native'; // Add this import
import { useAuth } from '../../context/AuthContext';

export default function CustomerHome() {
  const { user } = useAuth();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Welcome, {user?.name} (Customer)</Text>
    </View>
  );
}