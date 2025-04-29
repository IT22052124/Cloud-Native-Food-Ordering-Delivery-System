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
import { creditCard, COD } from "../../assets/index";
import { useStripe } from "@stripe/stripe-react-native";
import LottieView from "lottie-react-native";
import { TAX_RATE } from "../../utils/taxUtils";

const PAYMENT_METHODS = [
  {
    id: "card",
    name: "Credit/Debit Card",
    icon: creditCard,
    description: "Pay with your card",
  },
  {
    id: "cod",
    name: "Cash on Delivery",
    icon: COD,
    description: "Pay when your order arrives",
  },
];

const PaymentScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const { clearCart } = useCart();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const {
    orderType,
    selectedAddress,
    subtotal,
    deliveryFee,
    tax,
    total,
    currency = "LKR",
  } = route.params;

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    setSelectedPayment(PAYMENT_METHODS[0]);
  }, []);

  const createOrder = async () => {
    try {
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
                coordinates: {
                  lat: selectedAddress?.coordinates.lat,
                  lng: selectedAddress?.coordinates.lng,
                },
              }
            : null,
        paymentMethod: selectedPayment.id.toUpperCase(),
        status: selectedPayment.id === "cod" ? "PAID" : "PENDING_PAYMENT",
        tax: tax || 0,
        deliveryFee: deliveryFee || 0,
        subtotal: subtotal || 0,
        customTaxRate: TAX_RATE,
      };

      const response = await dataService.createOrder(orderData);
      const OrderResponse = {
        _id: response.order.order._id,
        id: response.order.order.orderId,
        status: response.order.order.restaurantOrder.status,
        estimatedDeliveryTime: new Date(Date.now() + 30 * 60 * 1000),
        paymentMethod: response.order.order.paymentMethod,
        total: response.order.order.totalAmount,
      };

      return OrderResponse;
    } catch (error) {
      console.error("Order creation error:", error);
      throw error;
    }
  };

  const handleStripePayment = async () => {
    try {
      setProcessingPayment(true);

      // 1. First create the order
      const order = await createOrder();
      setOrderDetails(order);

      const amountInCents = Math.round(total * 100);

      // 2. Create Payment Intent with order ID
      const response = await dataService.createPaymentIntent({
        orderId: order.id,
        amount: amountInCents, 
        currency: "lkr",
      });

      if (!response.clientSecret) {
        throw new Error("No client secret returned");
      }

      // 3. Initialize Payment Sheet
      const { error } = await initPaymentSheet({
        merchantDisplayName: "My Food App",
        paymentIntentClientSecret: response.clientSecret,
        returnURL: "myfoodapp://stripe-redirect",
      });

      if (error) throw error;

      // 4. Present Payment Sheet
      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        throw paymentError;
      }

      // Payment successful
      setPaymentSuccess(true);
      clearCart();
    } catch (error) {
      console.error("Payment error:", error);
      Alert.alert(
        "Payment Failed",
        error.message || "There was an error processing your payment"
      );
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleCodPayment = async () => {
    try {
      setProcessingPayment(true);

      // Create order with status=PAID for COD
      const order = await createOrder();

      setOrderDetails(order);
      setPaymentSuccess(true);
      clearCart();
    } catch (error) {
      console.error("Order creation error:", error);
      Alert.alert(
        "Order Failed",
        error.message || "There was a problem creating your order"
      );
    } finally {
      setProcessingPayment(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedPayment) {
      Alert.alert("Error", "Please select a payment method");
      return;
    }

    if (selectedPayment.id === "card") {
      await handleStripePayment();
    } else {
      await handleCodPayment();
    }
  };

  const handleViewOrder = () => {
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
              <LottieView
                source={method.icon}
                autoPlay
                loop
                style={styles.paymentIcon}
              />
              {/* <Image source={method.icon} style={styles.paymentIcon} /> */}
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
              <Text style={styles.summaryValue}>
                {currency} {subtotal.toFixed(2)}
              </Text>
            </View>

            {orderType === "DELIVERY" && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery Fee</Text>
                <Text style={styles.summaryValue}>
                  {currency} {deliveryFee.toFixed(2)}
                </Text>
              </View>
            )}

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax (5%)</Text>
              <Text style={styles.summaryValue}>
                {currency} {tax.toFixed(2)}
              </Text>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                {currency} {total.toFixed(2)}
              </Text>
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
            <Title style={styles.modalTitle}>
              {selectedPayment?.id === "cod"
                ? "Order Placed!"
                : "Payment Successful!"}
            </Title>
            <Text style={styles.modalText}>
              Your order #{orderDetails?.id} has been placed successfully.
            </Text>
            {selectedPayment?.id === "cod" && (
              <Text style={styles.modalText}>
                Please have cash ready when your order arrives.
              </Text>
            )}
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
            {processingPayment
              ? "Processing..."
              : selectedPayment?.id === "cod"
              ? `Place Order`
              : `Pay ${currency} ${total.toFixed(2)}`}
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
    width: 60,
    height: 60,
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
