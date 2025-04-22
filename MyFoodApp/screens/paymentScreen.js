import { useStripe } from "@stripe/stripe-react-native";
import { Button, Alert } from "react-native";
import axios from "axios";

const PaymentScreen = () => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const handlePayment = async () => {
    try {
      // 1. Fetch Payment Intent
      const response = await axios.post(
        "http://192.168.8.196:3001/api/payment/initiate",
        { amount: 1000, currency: "lkr" } // Explicitly specify currency
      );

      console.log("Client Secret:", response.data.client_secret); // Verify format
      console.log("hi");
      // 2. Initialize Payment Sheet
      const { error } = await initPaymentSheet({
        merchantDisplayName: "My Food App",
        paymentIntentClientSecret: response.data.client_secret,
        returnURL: "myfoodapp://stripe-redirect",
      });
      console.log("hi1");
      if (error) throw error;
      console.log("hi2");

      // 3. Present Payment Sheet
      const { error: paymentError } = await presentPaymentSheet();
      console.log(paymentError);
      if (paymentError) throw paymentError;
      console.log("hi4");

      Alert.alert("Success", "Payment completed!");
    } catch (error) {
      console.error("Full error:", JSON.stringify(error, null, 2)); // Detailed log
      Alert.alert("Error", error.message);
    }
  };

  return <Button title="Pay with Stripe" onPress={handlePayment} />;
};

export default PaymentScreen;
