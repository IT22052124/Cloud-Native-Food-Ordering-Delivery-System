import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from "react-native";
import {
  Text,
  Card,
  Chip,
  Divider,
  Button,
  IconButton,
  Surface,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import dataService, { ORDER_STATUS } from "../../services/dataService";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";

const OrderDetailScreen = ({ route, navigation }) => {
  const { orderId } = route.params;
  const theme = useTheme();
  const [order, setOrder] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapRegion, setMapRegion] = useState(null);

  useEffect(() => {
    loadOrderDetails();
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      const orderData = await dataService.getOrderById(orderId);
      setOrder(orderData);
      setOrder(orderData.order.order);
      setRestaurant(orderData.order.restaurant);
      // Set map region if delivery address is available
      if (
        orderData.order.deliveryAddress &&
        orderData.order.deliveryAddress.coordinates.lat &&
        orderData.order.deliveryAddress.coordinates.lng
      ) {
        setMapRegion({
          latitude: orderData?.order?.deliveryAddress?.coordinates?.lat,
          longitude: orderData.order?.deliveryAddress?.coordinates?.lng,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        });
      }
    } catch (error) {
      console.error("Error loading order details:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case ORDER_STATUS.PLACED:
        return theme.colors.warning;
      case ORDER_STATUS.PREPARING:
        return theme.colors.info;
      case ORDER_STATUS.READY_FOR_PICKUP:
        return theme.colors.warning;
      case ORDER_STATUS.OUT_FOR_DELIVERY:
        return theme.colors.secondary;
      case ORDER_STATUS.DELIVERED:
        return theme.colors.success;
      case ORDER_STATUS.CANCELLED:
        return theme.colors.error;
      default:
        return theme.colors.gray;
    }
  };

  const getStatusText = (status) => {
    return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleContactDriver = () => {
    if (order.deliveryPerson && order.deliveryPerson.phone) {
      Linking.openURL(`tel:${order.deliveryPerson.phone}`);
    }
  };

  const handleTrackOrder = () => {
    navigation.navigate("OrderTracking", { orderId: order.orderId });
  };

  const handleCancelOrder = async () => {
    try {
      // Only allow cancellation for placed orders
      if (order.restaurantOrder.status === ORDER_STATUS.PLACED) {
        // await dataService.cancelOrder(order.id);
        // loadOrderDetails(); // Reload order to get updated status
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
    }
  };

  const canCancelOrder = () => {
    return order && order.restaurantOrder.status === ORDER_STATUS.PLACED;
  };

  const isActiveOrder = () => {
    return (
      order &&
      order.restaurantOrder.status !== ORDER_STATUS.DELIVERED &&
      order.restaurantOrder.status !== ORDER_STATUS.CANCELLED
    );
  };

  const getPaymentStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
      case "completed":
        return theme.colors.success;
      case "pending":
        return theme.colors.warning;
      case "failed":
        return theme.colors.error;
      default:
        return theme.colors.gray;
    }
  };

  const getPaymentMethodIcon = (method) => {
    if (!method) return "cash";

    method = method.toLowerCase();
    if (method.includes("card")) {
      return "credit-card";
    } else {
      return "money";
    }
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

  if (!order) {
    return (
      <View
        style={[
          styles.errorContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Ionicons
          name="alert-circle-outline"
          size={80}
          color={theme.colors.error}
        />
        <Text style={styles.errorTitle}>Order not found</Text>
        <Text style={styles.errorText}>
          We couldn't find the order you're looking for. Please try again.
        </Text>
        <Button
          mode="contained"
          onPress={() => navigation.goBack()}
          style={{ marginTop: 20 }}
        >
          Go Back
        </Button>
      </View>
    );
  }

  // Determine payment status and method
  const paymentMethod =
    order.paymentMethod == "COD" ? "Cash on Delivery" : "Credit/Debit Card";
  const paymentStatus =
    order.paymentStatus ||
    (paymentMethod.toLowerCase().includes("cash") ? "Pending" : "Paid");

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />
        <Text style={styles.headerTitle}>Order #{order.orderId}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={[styles.orderStatusCard, { ...theme.shadow.small }]}>
          <Card.Content>
            <Chip
              style={[
                styles.statusChip,
                {
                  backgroundColor: getStatusColor(order.restaurantOrder.status),
                },
              ]}
              textStyle={{ color: "white", fontWeight: "bold" }}
            >
              {getStatusText(order.restaurantOrder.status)}
            </Chip>

            <Text style={styles.orderDate}>
              Ordered on {formatDate(order.createdAt)}
            </Text>

            {isActiveOrder() && (
              <View style={styles.estimatedDelivery}>
                <Ionicons
                  name="time-outline"
                  size={20}
                  color={theme.colors.primary}
                />
                <Text style={styles.estimatedDeliveryText}>
                  Estimated delivery: {order.estimatedDeliveryTime}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        <Card style={[styles.restaurantCard, { ...theme.shadow.small }]}>
          <Card.Content>
            <View style={styles.restaurantHeader}>
              <Image
                source={
                  restaurant.imageUrls && restaurant.imageUrls?.length > 0
                    ? { uri: restaurant.imageUrls[0] }
                    : require("../../assets/no-image-restaurant.png")
                }
                style={styles.restaurantImage}
              />
              <View style={styles.restaurantInfo}>
                <Text style={styles.restaurantName}>{restaurant.name}</Text>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("RestaurantDetail", {
                      restaurantId: restaurant._id,
                    })
                  }
                  style={styles.viewRestaurantButton}
                >
                  <Text
                    style={[
                      styles.viewRestaurantText,
                      { color: theme.colors.primary },
                    ]}
                  >
                    View Restaurant
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card.Content>
        </Card>

        <Card style={[styles.orderItemsCard, { ...theme.shadow.small }]}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Order Items</Text>

            {order.restaurantOrder.items.map((item, index) => (
              <View key={index}>
                <View style={styles.orderItem}>
                  <View style={styles.orderItemLeft}>
                    <Image
                      source={
                        item.image
                          ? { uri: item.image }
                          : require("../../assets/no-image.png")
                      }
                      style={styles.itemImage}
                    />
                    <View style={styles.orderItemInfo}>
                      <Text style={styles.orderItemName}>{item.name}</Text>
                      <Text style={styles.orderItemQuantity}>
                        Qty: {item.quantity}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.orderItemPrice}>
                    LKR {item.price * item.quantity}
                  </Text>
                </View>
                {index < order.restaurantOrder.items.length - 1 && (
                  <Divider style={styles.itemDivider} />
                )}
              </View>
            ))}
          </Card.Content>
        </Card>

        <Card style={[styles.orderSummaryCard, { ...theme.shadow.small }]}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Order Summary</Text>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>
                LKR {order.restaurantOrder.subtotal}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>
                LKR {order.restaurantOrder.deliveryFee}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax</Text>
              <Text style={styles.summaryValue}>
                LKR {order.restaurantOrder.tax}
              </Text>
            </View>

            <Divider style={styles.summaryDivider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>LKR {order.totalAmount}</Text>
            </View>
          </Card.Content>
        </Card>

        {/* New Payment Card */}
        <Card style={[styles.paymentCard, { ...theme.shadow.small }]}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Payment Information</Text>

            <Surface
              style={[
                styles.paymentMethodCard,
                { backgroundColor: theme.colors.surfaceVariant },
              ]}
            >
              <View style={styles.paymentCardContent}>
                <View style={styles.paymentLeftContent}>
                  <View style={styles.paymentIconContainer}>
                    <FontAwesome
                      name={getPaymentMethodIcon(paymentMethod)}
                      size={24}
                      color={theme.colors.primary}
                    />
                  </View>
                  <View style={styles.paymentDetails}>
                    <Text style={styles.paymentMethodTitle}>
                      {paymentMethod}
                    </Text>
                    <Text style={styles.paymentMethodDate}>
                      {formatDate(order.createdAt)}
                    </Text>
                  </View>
                </View>
                <Chip
                  style={[
                    styles.paymentStatusChip,
                    { backgroundColor: getPaymentStatusColor(paymentStatus) },
                  ]}
                  textStyle={{
                    color: "white",
                    fontWeight: "500",
                    fontSize: 12,
                  }}
                >
                  {paymentStatus}
                </Chip>
              </View>

              {paymentMethod.toLowerCase().includes("card") && (
                <View style={styles.cardDetails}>
                  <View style={styles.cardNumberSection}>
                    <Text style={styles.cardNumberLabel}>Card Number</Text>
                    <Text style={styles.cardNumberValue}>
                      •••• •••• •••• {order.cardLastFour || "1234"}
                    </Text>
                  </View>
                </View>
              )}
            </Surface>
          </Card.Content>
        </Card>

        {order.deliveryAddress && (
          <Card style={[styles.deliveryAddressCard, { ...theme.shadow.small }]}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Delivery Address</Text>

              <View style={styles.addressContainer}>
                <Ionicons
                  name="location-outline"
                  size={20}
                  color={theme.colors.primary}
                />
                <Text style={styles.addressText}>
                  {order.deliveryAddress.street}, {order.deliveryAddress.city},{" "}
                  {order.deliveryAddress.state} {order.deliveryAddress.zipCode}
                </Text>
              </View>

              {mapRegion && (
                <View style={styles.mapContainer}>
                  <MapView
                    style={styles.map}
                    region={mapRegion}
                    scrollEnabled={false}
                    zoomEnabled={false}
                    rotateEnabled={false}
                    pitchEnabled={false}
                  >
                    <Marker
                      coordinate={{
                        latitude: order.deliveryAddress.coordinates.lat,
                        longitude: order.deliveryAddress.coordinates.lng,
                      }}
                    />
                  </MapView>
                </View>
              )}
            </Card.Content>
          </Card>
        )}

        {order.driver && isActiveOrder() && (
          <Card style={[styles.driverCard, { ...theme.shadow.small }]}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Delivery Driver</Text>

              <View style={styles.driverInfo}>
                <Image
                  source={{ uri: order.driver.profileImage }}
                  style={styles.driverImage}
                />
                <View style={styles.driverDetails}>
                  <Text style={styles.driverName}>{order.driver.name}</Text>
                  <View style={styles.driverRating}>
                    <Ionicons name="star" size={16} color="#FFD700" />
                    <Text style={styles.driverRatingText}>
                      {order.driver.rating}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={handleContactDriver}
                  style={styles.contactDriverButton}
                >
                  <Ionicons name="call" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </Card.Content>
          </Card>
        )}

        <View style={styles.actionButtons}>
          {isActiveOrder() && (
            <Button
              mode="contained"
              onPress={handleTrackOrder}
              style={[
                styles.trackButton,
                { backgroundColor: theme.colors.primary },
              ]}
              icon="map-marker-radius"
            >
              Track Order
            </Button>
          )}

          {canCancelOrder() && (
            <Button
              mode="outlined"
              onPress={handleCancelOrder}
              style={styles.cancelButton}
              color={theme.colors.error}
            >
              Cancel Order
            </Button>
          )}
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  scrollContent: {
    padding: 16,
  },
  orderStatusCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  statusChip: {
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  orderDate: {
    fontSize: 14,
    color: "#666",
  },
  estimatedDelivery: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  estimatedDeliveryText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
  },
  restaurantCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  restaurantHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  restaurantImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  viewRestaurantButton: {
    alignSelf: "flex-start",
  },
  viewRestaurantText: {
    fontSize: 14,
    fontWeight: "500",
  },
  orderItemsCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingVertical: 8,
  },
  orderItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  orderItemInfo: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 14,
    fontWeight: "500",
  },
  orderItemQuantity: {
    fontSize: 14,
    color: "#666",
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: "bold",
  },
  itemDivider: {
    marginVertical: 8,
  },
  orderSummaryCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
  },
  summaryValue: {
    fontSize: 14,
  },
  summaryDivider: {
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  paymentCard: {
    marginBottom: 16,
    borderRadius: 10,
  },
  paymentMethodCard: {
    borderRadius: 5,
    padding: 14,
    overflow: "hidden",
  },
  paymentCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paymentLeftContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  paymentDetails: {
    flex: 1,
    maxWidth:135
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  paymentMethodDate: {
    fontSize: 12,
    color: "#666",
  },
  paymentStatusChip: {
    height: 28,
    maxWidth: 80
  },
  cardDetails: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  cardNumberSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardNumberLabel: {
    fontSize: 12,
    color: "#666",
  },
  cardNumberValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  deliveryAddressCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  addressText: {
    marginLeft: 8,
    fontSize: 14,
    flex: 1,
  },
  mapContainer: {
    height: 150,
    borderRadius: 8,
    overflow: "hidden",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  driverCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  driverInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  driverImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  driverRating: {
    flexDirection: "row",
    alignItems: "center",
  },
  driverRatingText: {
    marginLeft: 4,
    fontSize: 14,
  },
  contactDriverButton: {
    backgroundColor: "#25D366", // WhatsApp green
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtons: {
    marginBottom: 20,
  },
  trackButton: {
    marginBottom: 12,
    paddingVertical: 8,
  },
  cancelButton: {
    paddingVertical: 8,
  },
  itemImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 12,
  },
});

export default OrderDetailScreen;
