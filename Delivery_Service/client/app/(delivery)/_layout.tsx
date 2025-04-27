import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function DeliveryTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,          // no headers
        animation: "none",           // no screen animation
        tabBarActiveTintColor: "#3A86FF",
        tabBarLabelStyle: { fontSize: 12 },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="active-delivery/index"
        options={{
          title: "Delivery",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="location-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
