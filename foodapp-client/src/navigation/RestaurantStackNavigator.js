import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import RestaurantsScreen from '../screens/restaurants/RestaurantsScreen';
import RestaurantDetailScreen from '../screens/restaurants/RestaurantDetailScreen';
import DishDetailScreen from '../screens/restaurants/DishDetailScreen';

const Stack = createStackNavigator();

const RestaurantStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="RestaurantsList" component={RestaurantsScreen} />
      <Stack.Screen name="RestaurantDetail" component={RestaurantDetailScreen} />
      <Stack.Screen name="DishDetail" component={DishDetailScreen} />
    </Stack.Navigator>
  );
};

export default RestaurantStackNavigator; 