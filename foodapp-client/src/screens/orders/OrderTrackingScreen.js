import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Linking,
  ScrollView,
  Alert,
} from "react-native";
import { Text, Card, Chip, Divider, IconButton } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import dataService, { ORDER_STATUS } from "../../services/dataService";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

// WebSocket URL - match it with your backend WebSocket server address
const WS_URL = "ws://192.168.1.2:5002";

const OrderTrackingScreen = ({ route, navigation }) => {
  const { orderId } = route.params;
  const theme = useTheme();
  const socketRef = useRef(null);

  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState(null);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    loadOrderAndTracking();
    initWebSocket();
    const pollingInterval = setInterval(() => {
      if (
        !connected &&
        order &&
        order.status !== ORDER_STATUS.DELIVERED &&
        order.status !== ORDER_STATUS.CANCELLED
      ) {
        refreshTracking();
      }
    }, 30000); // Every 30 seconds

    // Clean up WebSocket connection and intervals on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      clearInterval(pollingInterval);
    };
  }, [orderId, connected]);

  const initWebSocket = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");

      // Create WebSocket connection
      socketRef.current = new WebSocket(
        `${WS_URL}/ws/orders/${orderId}?token=${token}`
      );

      socketRef.current.onopen = () => {
        console.log("WebSocket connected");
        setConnected(true);
      };

      socketRef.current.onclose = (event) => {
        console.log("WebSocket disconnected", event.code, event.reason);
        setConnected(false);

        // Try to reconnect after 5 seconds if not intentionally closed
        if (event.code !== 1000) {
          setTimeout(() => {
            if (
              order &&
              order.status !== ORDER_STATUS.DELIVERED &&
              order.status !== ORDER_STATUS.CANCELLED
            ) {
              initWebSocket();
            }
          }, 5000);
        }
      };

      socketRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        setConnected(false);
      };

      socketRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("WebSocket message received:", data);

          if (data.type === "ORDER_UPDATE") {
            // Update order status
            if (data.order) {
              setOrder((prevOrder) => ({
                ...prevOrder,
                ...data.order,
                status: data.order.status,
                statusUpdates: {
                  ...prevOrder?.statusUpdates,
                  ...data.order.statusUpdates,
                },
              }));
            }
          } else if (data.type === "TRACKING_UPDATE") {
            // Update tracking data
            if (data.tracking) {
              setTracking((prevTracking) => ({
                ...prevTracking,
                ...data.tracking,
              }));

              // Update map region if driver location changed
              if (data.tracking.driverLocation) {
                setRegion({
                  latitude: data.tracking.driverLocation.latitude,
                  longitude: data.tracking.driverLocation.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                });
              }
            }
          }
        } catch (err) {
          console.error("Error parsing WebSocket message:", err);
        }
      };
    } catch (error) {
      console.error("Error initializing WebSocket:", error);
      setConnected(false);
    }
  };

  const loadOrderAndTracking = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load order data
      const response = await dataService.getOrderById(orderId);
      if (!response || !response.order) {
        setError("Order not found");
        setLoading(false);
        return;
      }

      setOrder(response.order);

      // Load tracking data
      if (
        response.order.status !== ORDER_STATUS.PLACED &&
        response.order.status !== ORDER_STATUS.CANCELLED
      ) {
        try {
          const trackingData = await dataService.getOrderTracking(orderId);
          setTracking(trackingData);
          // Set map region
          if (trackingData.driverLocation) {
            setRegion({
              latitude: trackingData.driverLocation.lat,
              longitude: trackingData.driverLocation.lng,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            });
          } else if (response.order.deliveryAddress) {
            setRegion({
              latitude: response.order.deliveryAddress.coordinates.lat,
              longitude: response.order.deliveryAddress.coordinates.lng,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            });
          }
        } catch (trackingError) {
          console.error("Error loading tracking:", trackingError);
          // Continue with order display even if tracking fails
        }
      }
    } catch (error) {
      console.error("Error loading order tracking:", error);
      setError("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const refreshTracking = async () => {
    try {
      // Only update tracking data, not the whole order
      const trackingData = await dataService.getOrderTracking(orderId);
      setTracking(trackingData);

      // Check if order status has changed
      if (trackingData.status !== order.status) {
        // If status changed, reload full order
        loadOrderAndTracking();
      }

      // Update region if driver moved
      if (trackingData.driverLocation) {
        setRegion({
          latitude: trackingData.driverLocation.latitude,
          longitude: trackingData.driverLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    } catch (error) {
      console.error("Error refreshing tracking:", error);
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

  const handleCallDriver = () => {
    if (order.driver && order.driver.phoneNumber) {
      Linking.openURL(`tel:${order.driver.phoneNumber}`);
    }
  };

  const handleCallRestaurant = () => {
    if (order.restaurantPhone) {
      Linking.openURL(`tel:${order.restaurantPhone}`);
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
      </View>
    );
  }

  const showMap =
    tracking &&
    (order.status === ORDER_STATUS.OUT_FOR_DELIVERY ||
      order.status === ORDER_STATUS.READY_FOR_PICKUP);

  const showDriver =
    tracking && order.driver && order.status === ORDER_STATUS.OUT_FOR_DELIVERY;

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
        <Text style={styles.headerTitle}>Track #{order.order.orderId}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {showMap && region ? (
            <View style={styles.mapContainer}>
              <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                region={region}
                showsUserLocation={false}
                showsMyLocationButton={false}
                showsCompass={true}
                toolbarEnabled={false}
              >
                {/* Restaurant Marker */}
                {tracking.restaurantLocation && (
                  <Marker
                    coordinate={{
                      latitude: tracking.restaurantLocation.lat,
                      longitude: tracking.restaurantLocation.lng,
                    }}
                    title={order.restaurant.name}
                  >
                    <View style={styles.markerContainer}>
                      <View style={styles.restaurantMarker}>
                        <Ionicons name="restaurant" size={24} color="white" />
                      </View>
                      <View style={styles.markerLabelContainer}>
                        <Text style={styles.markerLabel}>
                          {order.restaurantName}
                        </Text>
                      </View>
                    </View>
                  </Marker>
                )}

                {/* Delivery Address Marker */}
                {order.deliveryAddress && (
                  <Marker
                    coordinate={{
                      latitude: order.deliveryAddress.coordinates.lat,
                      longitude: order.deliveryAddress.coordinates.lng,
                    }}
                    title="Delivery Address"
                  >
                    <View style={styles.destinationMarker}>
                      <Ionicons name="location" size={24} color="white" />
                    </View>
                  </Marker>
                )}

                {/* Driver Marker */}
                {/* {tracking.driverLocation && (
                  <Marker
                    coordinate={{
                      latitude: tracking.driverLocation.latitude,
                      longitude: tracking.driverLocation.longitude,
                    }}
                    title={`Driver: ${order.driver?.name || "Your driver"}`}
                  >
                    <View style={styles.driverMarker}>
                      <Ionicons name="car" size={24} color="white" />
                    </View>
                  </Marker>
                )} */}

                {/* Route from driver to destination */}
                {/* {tracking.driverLocation &&
                  order.deliveryAddress &&
                  tracking.routeCoordinates && (
                    <Polyline
                      coordinates={tracking.routeCoordinates}
                      strokeColor={theme.colors.primary}
                      strokeWidth={4}
                    />
                  )} */}
              </MapView>
            </View>
          ) : (
            <View style={styles.noMapContainer}>
              <Ionicons
                name={
                  order.status === ORDER_STATUS.PLACED
                    ? "time-outline"
                    : order.status === ORDER_STATUS.PREPARING
                    ? "restaurant-outline"
                    : order.status === ORDER_STATUS.DELIVERED
                    ? "checkmark-done-circle-outline"
                    : order.status === ORDER_STATUS.CANCELLED
                    ? "close-circle-outline"
                    : "restaurant-outline"
                }
                size={80}
                color={getStatusColor(order.status)}
              />
              <Text style={styles.noMapText}>
                {order.status === ORDER_STATUS.PLACED
                  ? "Waiting for restaurant to confirm your order"
                  : order.status === ORDER_STATUS.PREPARING
                  ? "Your food is being prepared"
                  : order.status === ORDER_STATUS.DELIVERED
                  ? "Your order has been delivered! Enjoy your meal!"
                  : order.status === ORDER_STATUS.CANCELLED
                  ? "This order has been cancelled"
                  : "Your order is being processed"}
              </Text>
            </View>
          )}

          <Card style={[styles.statusCard, { ...theme.shadow.small }]}>
            <Card.Content>
              <View style={styles.statusHeader}>
                <Text style={styles.statusTitle}>Order Status</Text>
                <Chip
                  style={[
                    styles.statusChip,
                    { backgroundColor: getStatusColor(order.status) },
                  ]}
                  textStyle={{ color: "white" }}
                >
                  {getStatusText(order.status)}
                </Chip>
              </View>

              <View style={styles.timeline}>
                <View style={styles.timelineItem}>
                  <View
                    style={[
                      styles.timelineDot,
                      {
                        backgroundColor:
                          order.status !== ORDER_STATUS.CANCELLED
                            ? theme.colors.success
                            : theme.colors.error,
                      },
                    ]}
                  >
                    {order.status !== ORDER_STATUS.CANCELLED ? (
                      <Ionicons name="checkmark" size={16} color="white" />
                    ) : (
                      <Ionicons name="close" size={16} color="white" />
                    )}
                  </View>
                  <View style={styles.timelineConnector} />
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineTitle}>Order Placed</Text>
                    <Text style={styles.timelineTime}>
                      {order.statusUpdates?.placed || "Processing"}
                    </Text>
                  </View>
                </View>

                <View style={styles.timelineItem}>
                  <View
                    style={[
                      styles.timelineDot,
                      {
                        backgroundColor:
                          order.status === ORDER_STATUS.CANCELLED
                            ? theme.colors.error
                            : [
                                ORDER_STATUS.PREPARING,
                                ORDER_STATUS.READY_FOR_PICKUP,
                                ORDER_STATUS.OUT_FOR_DELIVERY,
                                ORDER_STATUS.DELIVERED,
                              ].includes(order.status)
                            ? theme.colors.success
                            : theme.colors.gray,
                      },
                    ]}
                  >
                    {order.status === ORDER_STATUS.CANCELLED ? (
                      <Ionicons name="close" size={16} color="white" />
                    ) : [
                        ORDER_STATUS.PREPARING,
                        ORDER_STATUS.READY_FOR_PICKUP,
                        ORDER_STATUS.OUT_FOR_DELIVERY,
                        ORDER_STATUS.DELIVERED,
                      ].includes(order.status) ? (
                      <Ionicons name="checkmark" size={16} color="white" />
                    ) : null}
                  </View>
                  <View style={styles.timelineConnector} />
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineTitle}>Preparing</Text>
                    <Text style={styles.timelineTime}>
                      {order.statusUpdates?.preparing || "Waiting"}
                    </Text>
                  </View>
                </View>

                <View style={styles.timelineItem}>
                  <View
                    style={[
                      styles.timelineDot,
                      {
                        backgroundColor:
                          order.status === ORDER_STATUS.CANCELLED
                            ? theme.colors.error
                            : [
                                ORDER_STATUS.READY_FOR_PICKUP,
                                ORDER_STATUS.OUT_FOR_DELIVERY,
                                ORDER_STATUS.DELIVERED,
                              ].includes(order.status)
                            ? theme.colors.success
                            : theme.colors.gray,
                      },
                    ]}
                  >
                    {order.status === ORDER_STATUS.CANCELLED ? (
                      <Ionicons name="close" size={16} color="white" />
                    ) : [
                        ORDER_STATUS.READY_FOR_PICKUP,
                        ORDER_STATUS.OUT_FOR_DELIVERY,
                        ORDER_STATUS.DELIVERED,
                      ].includes(order.status) ? (
                      <Ionicons name="checkmark" size={16} color="white" />
                    ) : null}
                  </View>
                  <View style={styles.timelineConnector} />
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineTitle}>Ready For Pickup</Text>
                    <Text style={styles.timelineTime}>
                      {order.statusUpdates?.confirmed || "Waiting"}
                    </Text>
                  </View>
                </View>

                <View style={styles.timelineItem}>
                  <View
                    style={[
                      styles.timelineDot,
                      {
                        backgroundColor:
                          order.status === ORDER_STATUS.CANCELLED
                            ? theme.colors.error
                            : [
                                ORDER_STATUS.OUT_FOR_DELIVERY,
                                ORDER_STATUS.DELIVERED,
                              ].includes(order.status)
                            ? theme.colors.success
                            : theme.colors.gray,
                      },
                    ]}
                  >
                    {order.status === ORDER_STATUS.CANCELLED ? (
                      <Ionicons name="close" size={16} color="white" />
                    ) : [
                        ORDER_STATUS.OUT_FOR_DELIVERY,
                        ORDER_STATUS.DELIVERED,
                      ].includes(order.status) ? (
                      <Ionicons name="checkmark" size={16} color="white" />
                    ) : null}
                  </View>
                  <View style={styles.timelineConnector} />
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineTitle}>Out for Delivery</Text>
                    <Text style={styles.timelineTime}>
                      {order.statusUpdates?.outForDelivery || "Waiting"}
                    </Text>
                  </View>
                </View>

                <View style={styles.timelineItem}>
                  <View
                    style={[
                      styles.timelineDot,
                      {
                        backgroundColor:
                          order.status === ORDER_STATUS.CANCELLED
                            ? theme.colors.error
                            : order.status === ORDER_STATUS.DELIVERED
                            ? theme.colors.success
                            : theme.colors.gray,
                      },
                    ]}
                  >
                    {order.status === ORDER_STATUS.CANCELLED ? (
                      <Ionicons name="close" size={16} color="white" />
                    ) : order.status === ORDER_STATUS.DELIVERED ? (
                      <Ionicons name="checkmark" size={16} color="white" />
                    ) : null}
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineTitle}>Delivered</Text>
                    <Text style={styles.timelineTime}>
                      {order.statusUpdates?.delivered || "Waiting"}
                    </Text>
                  </View>
                </View>
              </View>
            </Card.Content>
          </Card>

          {showDriver && (
            <Card style={[styles.driverCard, { ...theme.shadow.small }]}>
              <Card.Content>
                <Text style={styles.driverTitle}>Your Driver</Text>
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
                    <Text style={styles.estimatedArrival}>
                      Estimated arrival:{" "}
                      {tracking.estimatedArrival || "Calculating..."}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={handleCallDriver}
                    style={[
                      styles.callButton,
                      { backgroundColor: theme.colors.primary },
                    ]}
                  >
                    <Ionicons name="call" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              </Card.Content>
            </Card>
          )}

          <Card style={[styles.restaurantCard, { ...theme.shadow.small }]}>
            <Card.Content>
              <Text style={styles.restaurantTitle}>Restaurant</Text>
              <View style={styles.restaurantInfo}>
                <Image
                  source={{ uri: order.restaurantImage }}
                  style={styles.restaurantImage}
                />
                <View style={styles.restaurantDetails}>
                  <Text style={styles.restaurantName}>
                    {order.restaurant.name}
                  </Text>
                  {order.status !== ORDER_STATUS.DELIVERED &&
                    order.status !== ORDER_STATUS.CANCELLED && (
                      <TouchableOpacity
                        onPress={() =>
                          navigation.navigate("RestaurantDetail", {
                            restaurantId: order.restaurant._id,
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
                    )}
                </View>
                {order.restaurantPhone &&
                  order.status !== ORDER_STATUS.DELIVERED &&
                  order.status !== ORDER_STATUS.CANCELLED && (
                    <TouchableOpacity
                      onPress={handleCallRestaurant}
                      style={[
                        styles.callButton,
                        { backgroundColor: theme.colors.primary },
                      ]}
                    >
                      <Ionicons name="call" size={20} color="white" />
                    </TouchableOpacity>
                  )}
              </View>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
  content: {
    flex: 1,
    padding: 16,
  },
  mapContainer: {
    height: height * 0.3,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  noMapContainer: {
    height: height * 0.2,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    padding: 20,
  },
  noMapText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: "center",
    color: "#666",
  },
  restaurantMarker: {
    backgroundColor: "#FF6B6B",
    padding: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "white",
  },
  destinationMarker: {
    backgroundColor: "#4CAF50",
    padding: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "white",
  },
  driverMarker: {
    backgroundColor: "#2196F3",
    padding: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "white",
  },
  statusCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statusChip: {
    height: 32,
  },
  timeline: {
    marginTop: 8,
  },
  timelineItem: {
    flexDirection: "row",
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  timelineConnector: {
    position: "absolute",
    left: 11,
    top: 24,
    width: 2,
    height: 40,
    backgroundColor: "#E0E0E0",
  },
  timelineContent: {
    marginLeft: 16,
    paddingBottom: 24,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  timelineTime: {
    fontSize: 14,
    color: "#666",
  },
  driverCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  driverTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
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
    marginBottom: 4,
  },
  driverRatingText: {
    marginLeft: 4,
    fontSize: 14,
  },
  estimatedArrival: {
    fontSize: 14,
    color: "#666",
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  restaurantCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  restaurantTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  restaurantInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  restaurantImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 16,
  },
  restaurantDetails: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  viewRestaurantButton: {
    alignSelf: "flex-start",
  },
  viewRestaurantText: {
    fontSize: 14,
    fontWeight: "500",
  },
  markerContainer: {
    alignItems: "center",
  },
  markerLabelContainer: {
    backgroundColor: "white",
    borderRadius: 4,
    padding: 4,
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  markerLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
  },
});

export default OrderTrackingScreen;
