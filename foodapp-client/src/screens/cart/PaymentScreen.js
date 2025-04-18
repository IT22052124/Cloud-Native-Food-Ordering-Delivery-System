import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import {
  Text,
  Button,
  Card,
  Title,
  IconButton,
  RadioButton,
  Divider,
  Portal,
  Modal,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { useCart } from "../../context/CartContext";
import dataService from "../../services/dataService";
import * as PaymentIcons from "../../assets/index";

const PAYMENT_METHODS = [
  {
    id: "card",
    name: "Credit/Debit Card",
    icon: PaymentIcons.creditCard,
    description: "Pay with your card",
  },
  {
    id: "paypal",
    name: "PayPal",
    icon: PaymentIcons.paypal,
    description: "Pay with PayPal",
  },
  {
    id: "gpay",
    name: "Google Pay",
    icon: PaymentIcons.gpay,
    description: "Pay with Google Pay",
  },
  {
    id: "applepay",
    name: "Apple Pay",
    icon: PaymentIcons.applepay,
    description: "Pay with Apple Pay",
  },
  {
    id: "cod",
    name: "Cash on Delivery",
    icon: PaymentIcons.cash,
    description: "Pay when your order arrives",
  },
];

const PaymentScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const { clearCart } = useCart();

  const { orderType, selectedAddress, subtotal, deliveryFee, total } =
    route.params;

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    // Set default payment method
    setSelectedPayment(PAYMENT_METHODS[0]);
  }, []);

  const handlePayment = async () => {
    if (!selectedPayment) {
      Alert.alert("Error", "Please select a payment method");
      return;
    }

    try {
      setProcessingPayment(true);

      // In a real app, we would process the payment with a payment gateway
      // For this demo, we'll simulate a payment processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create order object
      const orderData = {
        type: orderType,
        deliveryAddress:
          orderType === "DELIVERY"
            ? {
                street: selectedAddress?.street || "",
                city: selectedAddress?.city || "",
                state: selectedAddress?.state || "",
                zipCode: selectedAddress?.zipCode || "",
                country: selectedAddress?.country || "",
              }
            : null,
        paymentMethod: selectedPayment.id.toUpperCase(),
        // Additional payment details would be included here
      };

      const response = await dataService.createOrder(orderData);

      // Simulate order creation
      const mockOrderResponse = {
        id: "ORD" + Math.floor(Math.random() * 1000000),
        status: "CONFIRMED",
        estimatedDeliveryTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
        paymentMethod: selectedPayment.id.toUpperCase(),
        total: total,
      };

      setOrderDetails(mockOrderResponse);
      setPaymentSuccess(true);

      // Clear cart after successful order
      // clearCart();
    } catch (error) {
      console.error("Error during payment:", error);
      Alert.alert(
        "Payment Failed",
        error.message ||
          "There was a problem processing your payment. Please try again."
      );
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleViewOrder = () => {
    // Close success modal and navigate to order details
    setPaymentSuccess(false);
    navigation.reset({
      index: 0,
      routes: [
        {
          name: "OrderConfirmation",
          params: { orderId: orderDetails.id },
        },
      ],
    });
  };

  const renderPaymentMethods = () => {
    return (
      <View style={styles.section}>
        <Title style={styles.sectionTitle}>Select Payment Method</Title>
        <ScrollView>
          {PAYMENT_METHODS.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentCard,
                selectedPayment?.id === method.id && styles.selectedPaymentCard,
              ]}
              onPress={() => setSelectedPayment(method)}
            >
              <RadioButton
                value={method.id}
                status={
                  selectedPayment?.id === method.id ? "checked" : "unchecked"
                }
                onPress={() => setSelectedPayment(method)}
                color={theme.colors.primary}
              />
              <Image source={method.icon} style={styles.paymentIcon} />
              <View style={styles.paymentDetails}>
                <Text style={styles.paymentName}>{method.name}</Text>
                <Text style={styles.paymentDescription}>
                  {method.description}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderOrderSummary = () => {
    return (
      <View style={styles.section}>
        <Title style={styles.sectionTitle}>Order Summary</Title>
        <Card style={styles.summaryCard}>
          <Card.Content>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
            </View>

            {orderType === "DELIVERY" && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery Fee</Text>
                <Text style={styles.summaryValue}>
                  ${deliveryFee.toFixed(2)}
                </Text>
              </View>
            )}

            <Divider style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
            </View>
          </Card.Content>
        </Card>
      </View>
    );
  };

  const renderSuccessModal = () => {
    return (
      <Portal>
        <Modal
          visible={paymentSuccess}
          dismissable={false}
          contentContainerStyle={[
            styles.modalContainer,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <View style={styles.modalContent}>
            <IconButton
              icon="check-circle"
              size={60}
              color={theme.colors.success}
              style={styles.successIcon}
            />
            <Title style={styles.modalTitle}>Payment Successful!</Title>
            <Text style={styles.modalText}>
              Your order #{orderDetails?.id} has been placed successfully.
            </Text>
            <Text style={styles.estimatedTime}>
              Estimated {orderType === "DELIVERY" ? "delivery" : "pickup"} time:{" "}
              {orderDetails?.estimatedDeliveryTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
            <Button
              mode="contained"
              style={[
                styles.viewOrderButton,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={handleViewOrder}
            >
              View Order Details
            </Button>
          </View>
        </Modal>
      </Portal>
    );
  };

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.goBack()}
          color={theme.colors.text}
        />
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        {renderPaymentMethods()}
        {renderOrderSummary()}

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            style={[styles.payButton, { backgroundColor: "#FF6B6B" }]}
            labelStyle={styles.buttonLabel}
            onPress={handlePayment}
            loading={processingPayment}
            disabled={processingPayment || !selectedPayment}
          >
            {processingPayment ? "Processing..." : `Pay $${total.toFixed(2)}`}
          </Button>
        </View>
      </ScrollView>

      {renderSuccessModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    height: 56,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
    fontWeight: "bold",
  },
  paymentCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  selectedPaymentCard: {
    borderColor: "#FF6B6B",
    borderWidth: 2,
  },
  paymentIcon: {
    width: 40,
    height: 40,
    marginLeft: 8,
  },
  paymentDetails: {
    marginLeft: 12,
    flex: 1,
  },
  paymentName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  paymentDescription: {
    fontSize: 14,
    color: "#757575",
  },
  summaryCard: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
  },
  summaryValue: {
    fontSize: 16,
  },
  divider: {
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF6B6B",
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  payButton: {
    height: 50,
    justifyContent: "center",
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    marginHorizontal: 24,
    borderRadius: 8,
    padding: 24,
  },
  modalContent: {
    alignItems: "center",
  },
  successIcon: {
    margin: 16,
  },
  modalTitle: {
    marginBottom: 8,
    textAlign: "center",
  },
  modalText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 8,
  },
  estimatedTime: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
  },
  viewOrderButton: {
    width: "100%",
  },
});

export default PaymentScreen;
