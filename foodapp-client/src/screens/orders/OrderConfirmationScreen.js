import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import {
  Text,
  Button,
  Card,
  Title,
  IconButton,
  Divider,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import dataService from "../../services/dataService";
import { Ionicons } from "@expo/vector-icons";

const OrderConfirmationScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const { orderId } = route.params;

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [restaurant, setRestaurant] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const response = await dataService.getOrderById(orderId);
        setOrder(response.order.order);
        console.log(response.order.order.restaurantOrder.items);
        setRestaurant(response.order.restaurant);
      } catch (error) {
        console.error("Error fetching order details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const renderOrderStatus = () => {
    return (
      <Card style={styles.statusCard}>
        <Card.Content style={styles.statusContent}>
          <View style={styles.statusIconContainer}>
            <Ionicons
              name="checkmark-circle"
              size={60}
              color={theme.colors.success}
            />
          </View>
          <View style={styles.statusTextContainer}>
            <Title style={styles.statusTitle}>Order Confirmed!</Title>
            <Text style={styles.orderNumber}>Order #{order.orderId}</Text>
            <Text style={styles.statusMessage}>
              Your order has been placed and ready to prepare.
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderDeliveryInfo = () => {
    const timeString = order.estimatedDeliveryTime?.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <View style={styles.section}>
        <Title style={styles.sectionTitle}>
          {order.type === "DELIVERY"
            ? "Delivery Information"
            : "Pickup Information"}
        </Title>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.deliveryInfoRow}>
              <Ionicons
                name={order.type === "DELIVERY" ? "bicycle" : "storefront"}
                size={24}
                color={theme.colors.primary}
                style={styles.deliveryIcon}
              />
              <View style={styles.deliveryTextContainer}>
                <Text style={styles.deliveryLabel}>
                  Estimated {order.type === "DELIVERY" ? "Delivery" : "Pickup"}{" "}
                  Time
                </Text>
                {/* <Text style={styles.deliveryTime}>{timeString}</Text> */}
              </View>
            </View>

            {order.type === "DELIVERY" && (
              <View style={styles.deliveryInfoRow}>
                <Ionicons
                  name="location"
                  size={24}
                  color={theme.colors.primary}
                  style={styles.deliveryIcon}
                />
                <View style={styles.deliveryTextContainer}>
                  <Text style={styles.deliveryLabel}>Delivery Address</Text>
                  <Text style={styles.deliveryAddress}>
                    {order.deliveryAddress.street}, {order.deliveryAddress.city}
                    , {order.deliveryAddress.state}{" "}
                    {order.deliveryAddress.zipCode}
                  </Text>
                </View>
              </View>
            )}

            {order.type === "PICKUP" && (
              <View style={styles.deliveryInfoRow}>
                <Ionicons
                  name="location"
                  size={24}
                  color={theme.colors.primary}
                  style={styles.deliveryIcon}
                />
                <View style={styles.deliveryTextContainer}>
                  <Text style={styles.deliveryLabel}>Pickup Address</Text>
                  <Text style={styles.deliveryAddress}>
                    {restaurant.address.street}, {restaurant.address.city},{" "}
                    {restaurant.address.province}{" "}
                  </Text>
                </View>
              </View>
            )}
          </Card.Content>
        </Card>
      </View>
    );
  };

  const renderRestaurantInfo = () => {
    return (
      <View style={styles.section}>
        <Title style={styles.sectionTitle}>Restaurant</Title>
        <Card style={styles.card}>
          <Card.Content style={styles.restaurantContent}>
            <Image
              source={
                restaurant.imageUrls && restaurant.imageUrls?.length > 0
                  ? { uri: restaurant.imageUrls[0] }
                  : require("../../assets/no-image-restaurant.png")
              }
              style={styles.restaurantImage}
            />
            <View style={styles.restaurantDetails}>
              <Text style={styles.restaurantName}>{restaurant.name}</Text>
              <Text style={styles.restaurantAddress}>
                {restaurant.address.street}, {restaurant.address.city},{" "}
                {restaurant.address.province}{" "}
              </Text>
              <Text style={styles.restaurantPhone}>
                {restaurant.contact.phone}
              </Text>
            </View>
          </Card.Content>
        </Card>
      </View>
    );
  };

  const renderOrderSummary = () => {
    return (
      <View style={styles.section}>
        <Title style={styles.sectionTitle}>Order Summary</Title>
        <Card style={styles.card}>
          <Card.Content>
            {order.restaurantOrder.items.map((item) => (
              <View key={item._id} style={styles.orderItem}>
                <View style={styles.orderItemLeft}>
                  <Image
                    source={
                      item.image
                        ? { uri: item.image }
                        : require("../../assets/no-image.png")
                    }
                    style={styles.itemImage}
                  />
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName}>
                      {item.name}{" "}
                      {item.portionName ? "(" + item.portionName + ")" : ""}
                    </Text>
                    <Text style={styles.itemQuantity}>
                      Qty: {item.quantity}
                    </Text>
                  </View>
                </View>
                <Text style={styles.itemPrice}>
                  LKR {(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            ))}

            <Divider style={styles.divider} />

            <View style={styles.priceSummary}>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Subtotal</Text>
                <Text style={styles.priceValue}>
                  LKR {order.restaurantOrder?.subtotal?.toFixed(2)}
                </Text>
              </View>

              {order.type === "DELIVERY" && (
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Delivery Fee</Text>
                  <Text style={styles.priceValue}>
                    LKR{" "}
                    {order.restaurantOrder.deliveryFee?.toFixed(2) || "0.00"}
                  </Text>
                </View>
              )}

              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Tax</Text>
                <Text style={styles.priceValue}>
                  LKR {order.restaurantOrder.tax?.toFixed(2) || "0.00"}
                </Text>
              </View>

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>
                  LKR {order.totalAmount?.toFixed(2)}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </View>
    );
  };

  const renderPaymentInfo = () => {
    const getPaymentStatus = () => {
      if (order.paymentStatus === "PAID") {
        return { text: "Paid", color: theme.colors.success };
      } else if (order.paymentStatus === "PENDING") {
        return { text: "Pending", color: theme.colors.warning };
      } else if (order.paymentMethod === "COD") {
        return { text: "Cash on Delivery", color: theme.colors.info };
      } else {
        return {
          text: order.paymentStatus || "Unknown",
          color: theme.colors.text,
        };
      }
    };

    const paymentStatus = getPaymentStatus();

    return (
      <View style={styles.section}>
        <Title style={styles.sectionTitle}>Payment</Title>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Method</Text>
              <Text style={styles.paymentValue}>
                {order.paymentMethod === "CARD"
                  ? "Credit/Debit Card"
                  : order.paymentMethod === "COD"
                  ? "Cash on Delivery"
                  : order.paymentMethod}
              </Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Status</Text>
              <Text
                style={[styles.paymentValue, { color: paymentStatus.color }]}
              >
                {paymentStatus.text}
              </Text>
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
          onPress={() => {
            navigation.navigate("Cart", { screen: "CartScreen" });
          }}
          color={theme.colors.text}
        />
        <Text style={styles.headerTitle}>Order Confirmation</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        {renderOrderStatus()}
        {renderDeliveryInfo()}
        {renderRestaurantInfo()}
        {renderOrderSummary()}
        {renderPaymentInfo()}

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            style={styles.trackButton}
            labelStyle={styles.buttonLabel}
            onPress={() => {
              navigation.navigate("Orders", {
                screen: "OrderTracking",
                params: { orderId: order.orderId },
              });
            }}
          >
            Track Order
          </Button>

          <Button
            mode="outlined"
            style={styles.homeButton}
            labelStyle={styles.homeButtonLabel}
            onPress={() => {
              navigation.navigate("Orders", { screen: "OrdersScreen" });
            }}
          >
            Back to Orders
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
  statusCard: {
    margin: 16,
    backgroundColor: "#F0FFF4",
  },
  statusContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  statusIconContainer: {
    marginRight: 16,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitle: {
    color: "#276749",
    fontSize: 20,
  },
  orderNumber: {
    fontSize: 14,
    color: "#4A5568",
    marginBottom: 4,
  },
  statusMessage: {
    fontSize: 14,
    color: "#4A5568",
  },
  section: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  card: {
    marginBottom: 8,
  },
  deliveryInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  deliveryIcon: {
    marginRight: 12,
  },
  deliveryTextContainer: {
    flex: 1,
  },
  deliveryLabel: {
    fontSize: 14,
    color: "#4A5568",
  },
  deliveryTime: {
    fontSize: 16,
    fontWeight: "bold",
  },
  deliveryAddress: {
    fontSize: 16,
  },
  restaurantContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  restaurantImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  restaurantDetails: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  restaurantAddress: {
    fontSize: 14,
    color: "#4A5568",
    marginBottom: 2,
  },
  restaurantPhone: {
    fontSize: 14,
    color: "#4A5568",
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  itemImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "500",
  },
  itemQuantity: {
    fontSize: 12,
    color: "#4A5568",
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "bold",
  },
  divider: {
    marginVertical: 12,
  },
  priceSummary: {
    marginTop: 8,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
  },
  priceValue: {
    fontSize: 14,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF6B6B",
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  paymentLabel: {
    fontSize: 14,
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  trackButton: {
    marginBottom: 12,
    backgroundColor: "#FF6B6B",
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  homeButton: {
    borderColor: "#FF6B6B",
  },
  homeButtonLabel: {
    color: "#FF6B6B",
  },
});

export default OrderConfirmationScreen;
