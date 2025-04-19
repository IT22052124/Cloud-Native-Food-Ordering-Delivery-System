import { View, Text } from "react-native";
import { useAuth } from "../../context/AuthContext";

export default function DeliveryDashboard() {
    const { user } = useAuth();
    return (
      <View>
        <Text>Welcome, {user?.name} (Delivery Partner)</Text>
      </View>
    );
  }