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
  Chip,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
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
  const [checkoutConfirmVisible, setCheckoutConfirmVisible] = useState(false);
  const [quantityUpdateLoading, setQuantityUpdateLoading] = useState(false);

  const handleCheckoutRequest = () => {
    if (!items.length || !restaurant) {
      setEmptyCartModalVisible(true);
      return;
    }
    setCheckoutConfirmVisible(true);
  };

  const handleConfirmCheckout = () => {
    // Close the confirmation modal
    setCheckoutConfirmVisible(false);

    // Navigate to the checkout screen
    navigation.navigate("Checkout");
  };

  const handleQuantityUpdate = async (cartId, itemId, newQuantity) => {
    setQuantityUpdateLoading(true);
    try {
      await updateQuantity(cartId, itemId, newQuantity);
    } catch (error) {
      console.error("Error updating quantity:", error);
    } finally {
      setQuantityUpdateLoading(false);
    }
  };

  const renderCartItem = ({ item }) => (
    <Card style={[styles.cartItem, { ...theme.shadow.small }]}>
      <View style={styles.cartItemContent}>
        <Image
          source={
            item.image
              ? { uri: item.image }
              : require("../../assets/no-image.png")
          }
          style={styles.itemImage}
        />

        <View style={styles.itemDetails}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemPrice}>
            LKR {(item.price * item.quantity).toFixed(2)}
          </Text>
        </View>

        <View style={styles.quantityContainer}>
          <IconButton
            icon="minus"
            size={16}
            onPress={() =>
              handleQuantityUpdate(item.id, item.itemId, item.quantity - 1)
            }
            style={styles.quantityButton}
            iconColor={theme.colors.primary}
            disabled={quantityUpdateLoading}
          />
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <IconButton
            icon="plus"
            size={16}
            onPress={() =>
              handleQuantityUpdate(item.id, item.itemId, item.quantity + 1)
            }
            style={styles.quantityButton}
            iconColor={theme.colors.primary}
            disabled={quantityUpdateLoading}
          />
        </View>

        <IconButton
          icon="delete-outline"
          size={20}
          onPress={() => removeItem(item.id, item.itemId)}
          style={styles.deleteButton}
          iconColor={theme.colors.error}
          disabled={quantityUpdateLoading}
        />
      </View>
    </Card>
  );

  const renderHeader = () => {
    if (!restaurant) return null;
    const hasDeliveryOnly =
      restaurant.serviceType?.delivery && !restaurant.serviceType?.pickup;
    const hasPickupOnly =
      restaurant.serviceType?.pickup && !restaurant.serviceType?.delivery;

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
            source={
              restaurant.image
                ? { uri: restaurant.image }
                : require("../../assets/no-image-restaurant.png")
            }
            style={styles.restaurantImage}
          />
          <View style={styles.restaurantInfo}>
            <Text style={styles.restaurantName}>{restaurant.name}</Text>
            <Text style={styles.restaurantAddress}>
              {restaurant.address.street}, {restaurant.address.province} ,{" "}
              {restaurant.address.city}
            </Text>
            {(hasDeliveryOnly || hasPickupOnly) && (
              <View style={styles.disclaimerContainer}>
                <Chip
                  style={styles.disclaimerChip}
                  textStyle={styles.disclaimerChipText}
                  icon="information-outline"
                >
                  {hasDeliveryOnly ? "Delivery only" : "Pickup only"}
                </Chip>
              </View>
            )}
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
    // Calculate 5% tax on subtotal (delivery fee will be added at checkout)
    const estimatedTax = subtotal * 0.05;
    // Estimate of total (excluding delivery fee which will be calculated at checkout)
    const estimatedTotal = subtotal + estimatedTax;

    return (
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Order Summary</Text>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>Subtotal</Text>
          <Text style={styles.summaryValue}>LKR {subtotal.toFixed(2)}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>Tax (5%)</Text>
          <Text style={styles.summaryValue}>LKR {estimatedTax.toFixed(2)}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>Delivery Fee</Text>
          <Text style={styles.summaryValue}>(Calculated at checkout)</Text>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.totalRow}>
          <Text style={styles.totalText}>Estimated Total</Text>
          <Text style={styles.totalValue}>LKR {estimatedTotal.toFixed(2)}</Text>
        </View>

        <Button
          mode="contained"
          style={[
            styles.checkoutButton,
            { backgroundColor: theme.colors.primary },
          ]}
          labelStyle={styles.checkoutButtonLabel}
          onPress={handleCheckoutRequest}
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

  const renderCheckoutConfirmDialog = () => {
    return (
      <Portal>
        <Modal
          visible={checkoutConfirmVisible}
          onDismiss={() => setCheckoutConfirmVisible(false)}
          contentContainerStyle={[
            styles.modalContainer,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <Title style={styles.modalTitle}>Confirm Checkout</Title>
          <Text style={styles.modalText}>
            Are you sure you want to proceed to checkout?
          </Text>
          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={() => setCheckoutConfirmVisible(false)}
              style={[styles.modalButton, styles.cancelButton]}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleConfirmCheckout}
              style={[
                styles.modalButton,
                styles.confirmButton,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              Proceed
            </Button>
          </View>
        </Modal>
      </Portal>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {quantityUpdateLoading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      )}

      <View style={styles.header}>
        <Title style={styles.headerTitle}>My Cart</Title>
        {items.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              Alert.alert(
                "Clear Cart",
                "Are you sure you want to clear your cart?",
                [
                  {
                    text: "Cancel",
                    style: "cancel",
                  },
                  {
                    text: "Clear",
                    onPress: () => clearCart(),
                    style: "destructive",
                  },
                ]
              );
            }}
          >
            <Text style={[styles.clearText, { color: theme.colors.error }]}>
              Clear
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCartItem}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyCart}
        contentContainerStyle={styles.listContent}
      />

      {renderCheckoutConfirmDialog()}

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
  clearButton: {
    padding: 8,
  },
  clearText: {
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
  restaurantAddress: {
    fontSize: 14,
    color: "#666",
  },
  disclaimerContainer: {
    marginTop: 6,
  },
  disclaimerChip: {
    alignSelf: "flex-start",
  },
  disclaimerChipText: {
    fontSize: 10,
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
  modalContainer: {
    margin: 20,
    borderRadius: 8,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    marginBottom: 16,
    textAlign: "center",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    margin: 8,
  },
  cancelButton: {
    borderColor: "#757575",
  },
  confirmButton: {
    backgroundColor: "#FF6B6B",
  },
  quantityUpdateModal: {
    position: "absolute",
    bottom: 20,
    right: 20,
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  quantityUpdateText: {
    marginLeft: 8,
    fontSize: 14,
  },
  loaderContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    zIndex: 1000,
  },
});

export default CartScreen;
