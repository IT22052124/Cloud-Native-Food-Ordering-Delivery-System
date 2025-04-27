import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function DeliveryTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3A86FF',
        headerShown: false,
        tabBarLabelStyle: { fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="(delivery)/dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="dashboard" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(delivery)/assignments"
        options={{
          title: 'Deliveries',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="local-shipping" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(delivery)/earnings"
        options={{
          title: 'Earnings',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="attach-money" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(delivery)/profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
