import React from "react";
import { useFonts } from "expo-font";
import { StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { Provider as PaperProvider, DefaultTheme } from "react-native-paper";
import { ThemeProvider } from "./src/context/ThemeContext";
import { AuthProvider } from "./src/context/AuthContext";
import { CartProvider } from "./src/context/CartContext";
import { LocationProvider } from "./src/context/LocationContext";
import AppNavigator from "./src/navigation/AppNavigator";
import { StripeProvider } from "@stripe/stripe-react-native";
import { LogBox } from "react-native";

// Define paper theme to match our app theme
const paperTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#FF6B6B",
    accent: "#4ECDC4",
  },
};

export default function App() {
  LogBox.ignoreAllLogs();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={paperTheme}>
          <ThemeProvider>
            <StatusBar
              barStyle="dark-content"
              backgroundColor="transparent"
              translucent
            />
            <StripeProvider
              publishableKey="pk_test_51RGHn3Gf4vgtIBBsdOkoju3H4njfu776FIl74ohd92TGGW7AwObAM61wTP7adsY37ABvcCENRLFf06wiqM6SYxSF00A68iNIPf"
              merchantIdentifier="merchant.com.your.app" // Required for Apple Pay
              urlScheme="myapp" // Must match your app scheme
            >
              <AuthProvider>
                <CartProvider>
                  <LocationProvider>
                    <NavigationContainer>
                      <AppNavigator />
                    </NavigationContainer>
                  </LocationProvider>
                </CartProvider>
              </AuthProvider>
            </StripeProvider>
          </ThemeProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
