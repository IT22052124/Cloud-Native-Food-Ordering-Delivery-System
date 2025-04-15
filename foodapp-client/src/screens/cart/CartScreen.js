import React, { useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  Text,
  Divider,
  Button,
  IconButton,
  Card,
  Title,
  Modal,
  Portal,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import dataService from "../../services/dataService";
import { Ionicons } from "@expo/vector-icons";

const CartScreen = ({ navigation }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const {
    items,
    restaurant,
    loading,
    updateQuantity,
    removeItem,
    clearCart,
    getSubtotal,
    getTotal,
  } = useCart();

  const [orderLoading, setOrderLoading] = useState(false);
  const [sucessModalVisible, setSuccessModalVisible] = useState(false);
  const [emptyCartModalVisible, setEmptyCartModalVisible] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  const handleCheckout = async () => {
    if (!items.length || !restaurant) {
      return;
    }

    try {
      setOrderLoading(true);

      // Create order object
      const orderData = {
        type: "DELIVERY",
        deliveryAddress: {
          street: user?.address?.street || "123 Main St",
          city: user?.address?.city || "Anytown",
          state: user?.address?.state || "CA",
          zipCode: user?.address?.zipCode || "12345",
          country: user?.address?.country || "USA",
          coordinates: user?.address?.coordinates || {
            lat: 37.7749,
            lng: -122.4194,
          },
        },
        paymentMethod: "CARD", // Default payment method
        paymentDetails: {
          cardLastFour: "4242",
          paymentProcessor: "stripe",
        },
      };

      // Send order to backend
      const response = await dataService.createOrder(orderData);
      setOrderDetails(response.order || response);

      // Show success modal
      setSuccessModalVisible(true);

      // Clear cart after successful order
      clearCart();
    } catch (error) {
      console.error("Error during checkout:", error);
      // Show error message to user
      Alert.alert(
        "Checkout Failed",
        error.message ||
          "There was a problem creating your order. Please try again."
      );
    } finally {
      setOrderLoading(false);
    }
  };

  const renderCartItem = ({ item }) => (
    <Card style={[styles.cartItem, { ...theme.shadow.small }]}>
      <View style={styles.cartItemContent}>
        <Image source={{ uri: item.image }} style={styles.itemImage} />

        <View style={styles.itemDetails}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemPrice}>
            ${(item.price * item.quantity).toFixed(2)}
          </Text>
        </View>

        <View style={styles.quantityContainer}>
          <IconButton
            icon="minus"
            size={16}
            onPress={() => updateQuantity(item.id, item.quantity - 1)}
            style={styles.quantityButton}
            iconColor={theme.colors.primary}
          />
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <IconButton
            icon="plus"
            size={16}
            onPress={() => updateQuantity(item.id, item.quantity + 1)}
            style={styles.quantityButton}
            iconColor={theme.colors.primary}
          />
        </View>

        <IconButton
          icon="delete-outline"
          size={20}
          onPress={() => removeItem(item.id)}
          style={styles.deleteButton}
          iconColor={theme.colors.error}
        />
      </View>
    </Card>
  );

  const renderHeader = () => {
    if (!restaurant) return null;

    return (
      <View style={styles.restaurantContainer}>
        <TouchableOpacity
          style={styles.restaurantHeader}
          onPress={() =>
            navigation.navigate("Restaurants", {
              screen: "RestaurantDetail",
              params: { restaurantId: restaurant.id },
            })
          }
        >
          <Image
            source={{ uri: restaurant.image }}
            style={styles.restaurantImage}
          />
          <View style={styles.restaurantInfo}>
            <Text style={styles.restaurantName}>{restaurant.name}</Text>
            <Text style={styles.restaurantDelivery}>
              Delivery: ${restaurant.deliveryFee} • {restaurant.deliveryTime}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.gray}
          />
        </TouchableOpacity>
      </View>
    );
  };

  const renderFooter = () => {
    if (items.length === 0) return null;

    const subtotal = getSubtotal();
    const deliveryFee = restaurant ? parseFloat(restaurant.deliveryFee) : 0;
    const total = getTotal();

    return (
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Order Summary</Text>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>Subtotal</Text>
          <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>Delivery Fee</Text>
          <Text style={styles.summaryValue}>${deliveryFee.toFixed(2)}</Text>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.totalRow}>
          <Text style={styles.totalText}>Total</Text>
          <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
        </View>

        <Button
          mode="contained"
          style={[
            styles.checkoutButton,
            { backgroundColor: theme.colors.primary },
          ]}
          labelStyle={styles.checkoutButtonLabel}
          onPress={handleCheckout}
          loading={orderLoading}
          disabled={orderLoading}
        >
          Checkout
        </Button>
      </View>
    );
  };

  const renderEmptyCart = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="cart-outline" size={80} color={theme.colors.gray} />
      <Text style={styles.emptyTitle}>Your cart is empty</Text>
      <Text style={styles.emptyText}>
        Add items from restaurants to start an order
      </Text>
      <Button
        mode="contained"
        style={[styles.browseButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate("Restaurants")}
      >
        Browse Restaurants
      </Button>
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

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <Title style={styles.headerTitle}>My Cart</Title>
        {items.length > 0 && (
          <TouchableOpacity onPress={() => clearCart()}>
            <Text style={[styles.clearCartText, { color: theme.colors.error }]}>
              Clear cart
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={items}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyCart}
        contentContainerStyle={styles.listContent}
      />

      {/* Success Modal */}
      <Portal>
        <Modal
          visible={sucessModalVisible}
          onDismiss={() => setSuccessModalVisible(false)}
          contentContainerStyle={[
            styles.modal,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <View style={styles.modalContent}>
            <Ionicons
              name="checkmark-circle"
              size={70}
              color={theme.colors.success}
            />
            <Text style={styles.modalTitle}>Order Placed!</Text>
            <Text style={styles.modalText}>
              Your order from {orderDetails?.restaurantName} has been placed
              successfully.
            </Text>
            <Button
              mode="contained"
              style={[
                styles.modalButton,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={() => {
                setSuccessModalVisible(false);
                navigation.navigate("Orders");
              }}
            >
              Track Order
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* Empty Cart Modal */}
      <Portal>
        <Modal
          visible={emptyCartModalVisible}
          onDismiss={() => setEmptyCartModalVisible(false)}
          contentContainerStyle={[
            styles.modal,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <View style={styles.modalContent}>
            <Ionicons
              name="information-circle"
              size={70}
              color={theme.colors.info}
            />
            <Text style={styles.modalTitle}>Cart Empty</Text>
            <Text style={styles.modalText}>
              Your cart is empty. Add items to your cart before checking out.
            </Text>
            <Button
              mode="contained"
              style={[
                styles.modalButton,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={() => {
                setEmptyCartModalVisible(false);
                navigation.navigate("Restaurants");
              }}
            >
              Browse Restaurants
            </Button>
          </View>
        </Modal>
      </Portal>
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 22,
  },
  clearCartText: {
    fontSize: 14,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
    flexGrow: 1,
  },
  restaurantContainer: {
    marginBottom: 16,
  },
  restaurantHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
  },
  restaurantImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  restaurantInfo: {
    flex: 1,
    marginLeft: 12,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  restaurantDelivery: {
    fontSize: 14,
    color: "#666",
  },
  cartItem: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
  cartItemContent: {
    flexDirection: "row",
    padding: 12,
    alignItems: "center",
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 16,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "bold",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  quantityButton: {
    margin: 0,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "bold",
    marginHorizontal: 4,
  },
  deleteButton: {
    marginLeft: 5,
  },
  summaryContainer: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 16,
    color: "#666",
  },
  summaryValue: {
    fontSize: 16,
  },
  divider: {
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  checkoutButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
  checkoutButtonLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
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
    marginBottom: 30,
    color: "#666",
  },
  browseButton: {
    paddingHorizontal: 20,
  },
  modal: {
    margin: 20,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  modalContent: {
    alignItems: "center",
    width: "100%",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 25,
    color: "#444",
  },
  modalButton: {
    paddingHorizontal: 30,
  },
});

export default CartScreen;
