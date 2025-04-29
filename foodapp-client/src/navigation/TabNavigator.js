import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useTheme as usePaperTheme } from "react-native-paper";
import { useTheme } from "../context/ThemeContext";

// Custom Bottom Tab Bar
import BottomTabBar from "../components/ui/BottomTabBar";

// Screens
import HomeScreen from "../screens/home/HomeScreen";
import RestaurantStackNavigator from "./RestaurantStackNavigator";
import CartScreen from "../screens/cart/CartScreen";
import OrdersScreen from "../screens/orders/OrdersScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import SearchScreen from "../screens/search/SearchScreen";

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const paperTheme = usePaperTheme();
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.gray,
        tabBarStyle: {
          height: 0, // Hide the default tab bar since we're using a custom one
          display: "none",
        },
      }}
      tabBar={(props) => <BottomTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
