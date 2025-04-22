import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { Text, Card, Chip, Title, Divider } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import dataService, { ORDER_STATUS } from "../../services/dataService";
import { Ionicons } from "@expo/vector-icons";

const OrdersScreen = ({ navigation }) => {
  const theme = useTheme();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("all");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await dataService.getOrders();
      setOrders(ordersData.orders);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredOrders = () => {
    if (selectedFilter === "all") {
      return orders;
    } else if (selectedFilter === "active") {
      return orders.filter(
        (order) =>
          order.status !== ORDER_STATUS.DELIVERED &&
          order.status !== ORDER_STATUS.CANCELLED
      );
    } else if (selectedFilter === "past") {
      return orders.filter(
        (order) =>
          order.status === ORDER_STATUS.DELIVERED ||
          order.status === ORDER_STATUS.CANCELLED
      );
    }
    return orders;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case ORDER_STATUS.PENDING:
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

  // Simplified status text to make UI more beautiful
  const getStatusText = (status) => {
    // Handle specific long statuses
    if (status === ORDER_STATUS.READY_FOR_PICKUP) {
      return "Ready for Pickup";
    } 
    
    // General case: convert snake_case to Title Case
    return status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
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

  const renderOrderItem = ({ item }) => (
    <Card
      style={[styles.orderCard, { ...theme.shadow.small }]}
      onPress={() =>
        navigation.navigate("OrderDetail", { orderId: item.orderId })
      }
    >
      <Card.Content>
        <View style={styles.orderHeader}>
          <View style={styles.restaurantInfo}>
            <Image
              source={require("../../assets/no-image-restaurant.png")}
              style={styles.restaurantImage}
            />
            <View style={styles.restaurantTextContainer}>
              <Text style={styles.restaurantName} numberOfLines={1}>
                {item.restaurant}
              </Text>
              <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
            </View>
          </View>
          <Chip
            style={[
              styles.statusChip,
              { backgroundColor: getStatusColor(item.status) },
            ]}
            textStyle={styles.statusText}
          >
            {getStatusText(item.status)}
          </Chip>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.orderItems}>
          {item.items.slice(0, 3).map((orderItem, index) => (
            <Text key={index} style={styles.orderItemText} numberOfLines={1}>
              {orderItem.quantity} x {orderItem.name}
            </Text>
          ))}
          {item.items.length > 3 && (
            <Text style={styles.moreItemsText}>
              +{item.items.length - 3} more items
            </Text>
          )}
        </View>

        <View style={styles.orderFooter}>
          <Text style={styles.totalItems}>{item.totalItems} items</Text>
          <Text style={styles.totalPrice}>LKR {item.totalAmount.toLocaleString()}</Text>
        </View>
      </Card.Content>
    </Card>
  );

  const renderEmptyOrders = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="receipt-outline" size={80} color={theme.colors.gray} />
      <Text style={styles.emptyTitle}>No orders found</Text>
      <Text style={styles.emptyText}>
        You haven't placed any orders yet. Start ordering your favorite food!
      </Text>
    </View>
  );

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

  const filteredOrders = getFilteredOrders();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <Title style={styles.headerTitle}>My Orders</Title>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedFilter === "all" && {
              backgroundColor: theme.colors.primary,
            },
          ]}
          onPress={() => setSelectedFilter("all")}
        >
          <Text
            style={[
              styles.filterText,
              selectedFilter === "all" && { color: theme.colors.white },
            ]}
          >
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedFilter === "active" && {
              backgroundColor: theme.colors.primary,
            },
          ]}
          onPress={() => setSelectedFilter("active")}
        >
          <Text
            style={[
              styles.filterText,
              selectedFilter === "active" && { color: theme.colors.white },
            ]}
          >
            Active
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedFilter === "past" && {
              backgroundColor: theme.colors.primary,
            },
          ]}
          onPress={() => setSelectedFilter("past")}
        >
          <Text
            style={[
              styles.filterText,
              selectedFilter === "past" && { color: theme.colors.white },
            ]}
          >
            Past
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.orderId}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyOrders}
      />
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
    padding: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: "#f0f0f0",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500",
  },
  listContent: {
    padding: 16,
    paddingTop: 4,
  },
  orderCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  restaurantInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  restaurantTextContainer: {
    flex: 1,
  },
  restaurantImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 13,
    color: "#666",
  },
  statusChip: {
    height: 32,
    paddingHorizontal: 8,
    minWidth: 90,
    justifyContent: "center",
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  divider: {
    marginVertical: 12,
  },
  orderItems: {
    marginBottom: 12,
  },
  orderItemText: {
    fontSize: 14,
    marginBottom: 4,
  },
  moreItemsText: {
    fontSize: 13,
    color: "#666",
    fontStyle: "italic",
    marginTop: 2,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalItems: {
    fontSize: 14,
    color: "#666",
  },
  totalPrice: {
    fontSize: 17,
    fontWeight: "bold",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
  },
});

export default OrdersScreen;