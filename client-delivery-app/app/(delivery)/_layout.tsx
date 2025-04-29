import { Tabs } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { View, StyleSheet } from "react-native";

export default function DeliveryTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#3A86FF",
        tabBarInactiveTintColor: "#94A3B8",
        tabBarLabelStyle: { 
          fontSize: 12, 
          fontWeight: "500",
          marginBottom: 4,
        },
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused, size }) => (
            <View style={focused ? styles.activeIconContainer : {}}>
              <Ionicons 
                name={focused ? "home" : "home-outline"} 
                size={size} 
                color={color} 
                style={styles.icon}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="active-delivery/index"
        options={{
          title: "Delivery",
          tabBarIcon: ({ color, focused, size }) => (
            <View style={focused ? styles.activeIconContainer : {}}>
              <MaterialIcons 
                name="delivery-dining" 
                size={size} 
                color={color} 
                style={styles.icon}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          title: "Earnings",
          tabBarIcon: ({ color, focused, size }) => (
            <View style={focused ? styles.activeIconContainer : {}}>
              <Ionicons 
                name={focused ? "wallet" : "wallet-outline"} 
                size={size} 
                color={color} 
                style={styles.icon}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused, size }) => (
            <View style={focused ? styles.activeIconContainer : {}}>
              <Ionicons 
                name={focused ? "person" : "person-outline"} 
                size={size} 
                color={color} 
                style={styles.icon}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 70,
    paddingTop: 2,
    paddingBottom: 12,
    borderTopWidth: 0,
    backgroundColor: "#FFFFFF",
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -5 },
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'absolute', // Add this
    bottom: 0, // Add this
    left: 0, // Add this
    right: 0, // Add this
  },
  tabItem: {
    paddingVertical: 3,
  },
  activeIconContainer: {
    backgroundColor: "#EFF6FF",
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    top: -10, // Pull the active icon up slightly
  },
  icon: {
    // Ensures icons are properly centered
    textAlign: 'center',
    includeFontPadding: false, // Removes extra padding around icons
  },
});