import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import {
  Text,
  Button,
  Card,
  Divider,
  RadioButton,
  Title,
  IconButton,
  List,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import dataService from "../../services/dataService";

const CheckoutScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const { items, restaurant, getSubtotal, getTotal, clearCart } = useCart();

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [orderType, setOrderType] = useState("DELIVERY");
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadAddresses = async () => {
      try {
        // In a real app, fetch addresses from API
        // For now, use sample data
        const userAddresses = [
          {
            id: "1",
            name: "Home",
            street: user?.address?.street || "123 Main St",
            city: user?.address?.city || "Anytown",
            state: user?.address?.state || "CA",
            zipCode: user?.address?.zipCode || "12345",
            country: user?.address?.country || "USA",
            isDefault: true,
          },
          {
            id: "2",
            name: "Work",
            street: "456 Office Blvd",
            city: "Business City",
            state: "NY",
            zipCode: "67890",
            country: "USA",
            isDefault: false,
          },
        ];

        setAddresses(userAddresses);
        // Set default address
        setSelectedAddress(
          userAddresses.find((addr) => addr.isDefault) || userAddresses[0]
        );
      } catch (error) {
        console.error("Error loading addresses:", error);
      }
    };

    // Load delivery fee
    const loadDeliveryFee = () => {
      if (restaurant) {
        setDeliveryFee(parseFloat(restaurant.deliveryFee || 5.99));
      }
    };

    loadAddresses();
    loadDeliveryFee();
  }, [user, restaurant]);

  const handleProceedToPayment = () => {
    if (!selectedAddress && orderType === "DELIVERY") {
      Alert.alert("Error", "Please select a delivery address");
      return;
    }

    // Navigate to payment screen
    navigation.navigate("Payment", {
      orderType,
      selectedAddress: selectedAddress,
      subtotal: getSubtotal(),
      deliveryFee: orderType === "DELIVERY" ? deliveryFee : 0,
      total: orderType === "DELIVERY" ? getTotal() : getSubtotal(),
    });
  };

  const handleAddAddress = () => {
    // Navigate to add address screen
    // This would be implemented in a real app
    Alert.alert(
      "Add Address",
      "Address management functionality would be implemented in a real app"
    );
  };

  const renderCartItems = () => {
    return (
      <View style={styles.section}>
        <Title style={styles.sectionTitle}>Order Items</Title>
        {items.map((item) => (
          <Card key={item.id} style={styles.itemCard}>
            <Card.Content style={styles.itemContent}>
              <Image
                source={
                  item.imageUrls && item.imageUrls.length > 0
                    ? { uri: item.imageUrls[0] }
                    : require("../../assets/no-image.png")
                }
                style={styles.itemImage}
              />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>
                ${(item.price * item.quantity).toFixed(2)}
              </Text>
            </Card.Content>
          </Card>
        ))}
      </View>
    );
  };

  const renderAddresses = () => {
    if (orderType !== "DELIVERY") return null;

    return (
      <View style={styles.section}>
        <Title style={styles.sectionTitle}>Delivery Address</Title>
        <ScrollView style={styles.addressList}>
          {addresses.map((address) => (
            <TouchableOpacity
              key={address.id}
              style={[
                styles.addressCard,
                selectedAddress?.id === address.id &&
                  styles.selectedAddressCard,
              ]}
              onPress={() => setSelectedAddress(address)}
            >
              <RadioButton
                value={address.id}
                status={
                  selectedAddress?.id === address.id ? "checked" : "unchecked"
                }
                onPress={() => setSelectedAddress(address)}
                color={theme.colors.primary}
              />
              <View style={styles.addressDetails}>
                <Text style={styles.addressName}>{address.name}</Text>
                <Text style={styles.addressText}>
                  {address.street}, {address.city}, {address.state}{" "}
                  {address.zipCode}
                </Text>
              </View>
              {address.isDefault && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultText}>Default</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Button
          mode="outlined"
          icon="plus"
          style={styles.addAddressButton}
          onPress={handleAddAddress}
        >
          Add New Address
        </Button>
      </View>
    );
  };

  const renderOrderType = () => {
    return (
      <View style={styles.section}>
        <Title style={styles.sectionTitle}>Order Type</Title>
        <Card style={styles.orderTypeCard}>
          <Card.Content>
            <TouchableOpacity
              style={[
                styles.orderTypeOption,
                orderType === "DELIVERY" && styles.selectedOrderType,
              ]}
              onPress={() => setOrderType("DELIVERY")}
            >
              <RadioButton
                value="DELIVERY"
                status={orderType === "DELIVERY" ? "checked" : "unchecked"}
                onPress={() => setOrderType("DELIVERY")}
                color={theme.colors.primary}
              />
              <View style={styles.orderTypeDetails}>
                <Text style={styles.orderTypeName}>Delivery</Text>
                <Text style={styles.orderTypeDescription}>
                  Delivered to your address
                </Text>
              </View>
              <Text style={styles.deliveryFee}>+${deliveryFee.toFixed(2)}</Text>
            </TouchableOpacity>

            <Divider style={styles.divider} />

            <TouchableOpacity
              style={[
                styles.orderTypeOption,
                orderType === "PICKUP" && styles.selectedOrderType,
              ]}
              onPress={() => setOrderType("PICKUP")}
            >
              <RadioButton
                value="PICKUP"
                status={orderType === "PICKUP" ? "checked" : "unchecked"}
                onPress={() => setOrderType("PICKUP")}
                color={theme.colors.primary}
              />
              <View style={styles.orderTypeDetails}>
                <Text style={styles.orderTypeName}>Pickup</Text>
                <Text style={styles.orderTypeDescription}>
                  Pickup from restaurant
                </Text>
              </View>
              <Text style={styles.deliveryFee}>Free</Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>
      </View>
    );
  };

  const renderOrderSummary = () => {
    const subtotal = getSubtotal();
    const total = orderType === "DELIVERY" ? getTotal() : subtotal;

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
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        {renderCartItems()}
        {renderOrderType()}
        {renderAddresses()}
        {renderOrderSummary()}

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            style={styles.checkoutButton}
            labelStyle={styles.buttonLabel}
            onPress={handleProceedToPayment}
            loading={loading}
            disabled={loading || (orderType === "DELIVERY" && !selectedAddress)}
          >
            Proceed to Payment
          </Button>
        </View>
      </ScrollView>
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
  itemCard: {
    marginBottom: 8,
    elevation: 2,
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "500",
  },
  itemQuantity: {
    fontSize: 14,
    color: "#757575",
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "bold",
  },
  addressList: {
    maxHeight: 250,
  },
  addressCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  selectedAddressCard: {
    borderColor: "#FF6B6B",
    borderWidth: 2,
  },
  addressDetails: {
    marginLeft: 12,
    flex: 1,
  },
  addressName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: "#757575",
  },
  defaultBadge: {
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  defaultText: {
    fontSize: 12,
    color: "#757575",
  },
  addAddressButton: {
    marginTop: 8,
  },
  orderTypeCard: {
    marginBottom: 16,
  },
  orderTypeOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
  },
  selectedOrderType: {
    backgroundColor: "rgba(255, 107, 107, 0.1)",
  },
  orderTypeDetails: {
    marginLeft: 12,
    flex: 1,
  },
  orderTypeName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  orderTypeDescription: {
    fontSize: 14,
    color: "#757575",
  },
  deliveryFee: {
    fontSize: 16,
    fontWeight: "bold",
  },
  divider: {
    marginVertical: 8,
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
  checkoutButton: {
    height: 50,
    justifyContent: "center",
    backgroundColor: "#FF6B6B",
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CheckoutScreen;
