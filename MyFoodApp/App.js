import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import PaymentScreen from "./screens/paymentScreen";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StripeProvider } from "@stripe/stripe-react-native";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <StripeProvider
      publishableKey="pk_test_51RGHn3Gf4vgtIBBsdOkoju3H4njfu776FIl74ohd92TGGW7AwObAM61wTP7adsY37ABvcCENRLFf06wiqM6SYxSF00A68iNIPf" // Your Stripe test key
      merchantIdentifier="merchant.com.your.app" // Required for Apple Pay
      urlScheme="myfoodapp" // Must match your app scheme
    >
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Payment"
            component={PaymentScreen}
            initialParams={{ token: "test_token" }}
            options={{
              title: "Make Payment",
              headerStyle: {
                backgroundColor: "#f4511e",
              },
              headerTintColor: "#fff",
            }}
          />
        </Stack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </StripeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
