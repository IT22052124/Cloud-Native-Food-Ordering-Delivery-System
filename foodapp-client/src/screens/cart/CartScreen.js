import React, { useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  Dimensions,
} from "react-native";
import { Text, Divider, Modal, Portal } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../context/ThemeContext";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";

// Import UI components
import GradientButton from "../../components/ui/GradientButton";

const { width } = Dimensions.get("window");

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
    if (newQuantity < 1) {
      // If the new quantity is 0 or less, remove the item
      removeItem(cartId);
      return;
    }

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
    <View
      style={[
        styles.cartItem,
        {
          backgroundColor: theme.colors.card,
          ...theme.shadow.small,
        },
      ]}
    >
      <View style={styles.cartItemContent}>
        <Image
          source={{ uri: item.image }}
          style={styles.itemImage}
          resizeMode="cover"
        />
        <View style={styles.itemDetails}>
          <Text
            style={[styles.itemName, { color: theme.colors.text }]}
            numberOfLines={2}
          >
            {item.name}
          </Text>

          {item.isPortionItem && (
            <Text style={[styles.portionText, { color: theme.colors.gray }]}>
              {item.portionName} Portion
            </Text>
          )}

          <Text style={[styles.itemPrice, { color: theme.colors.primary }]}>
            LKR {item.price.toFixed(2)}
          </Text>

          <View style={styles.quantityContainer}>
            <TouchableOpacity
              onPress={() =>
                handleQuantityUpdate(item.id, item.itemId, item.quantity - 1)
              }
              style={[
                styles.quantityButton,
                { backgroundColor: theme.colors.primary },
              ]}
              disabled={quantityUpdateLoading}
            >
              <Ionicons name="remove" size={16} color="white" />
            </TouchableOpacity>

            <Text style={[styles.quantityText, { color: theme.colors.text }]}>
              {item.quantity}
            </Text>

            <TouchableOpacity
              onPress={() =>
                handleQuantityUpdate(item.id, item.itemId, item.quantity + 1)
              }
              style={[
                styles.quantityButton,
                { backgroundColor: theme.colors.primary },
              ]}
              disabled={quantityUpdateLoading}
            >
              <Ionicons name="add" size={16} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.itemActions}>
          <Text style={[styles.totalPrice, { color: theme.colors.primary }]}>
            LKR {(item.price * item.quantity).toFixed(2)}
          </Text>

          <TouchableOpacity
            onPress={() => removeItem(item.id)}
            style={styles.removeButton}
          >
            <Ionicons
              name="trash-outline"
              size={20}
              color={theme.colors.error}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderHeader = () => {
    if (!restaurant) return null;

    return (
      <TouchableOpacity
        style={[
          styles.restaurantContainer,
          {
            backgroundColor: theme.colors.card,
            ...theme.shadow.small,
          },
        ]}
        onPress={() =>
          navigation.navigate("Restaurants", {
            screen: "RestaurantDetail",
            params: { restaurantId: restaurant.id },
          })
        }
        activeOpacity={0.9}
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
          <Text style={[styles.restaurantName, { color: theme.colors.text }]}>
            {restaurant.name}
          </Text>

          <Text
            style={[styles.restaurantAddress, { color: theme.colors.gray }]}
          >
            {restaurant.address.street}, {restaurant.address.city}
          </Text>

          <View style={styles.serviceTypeContainer}>
            {restaurant.serviceType?.delivery && (
              <View
                style={[
                  styles.serviceTypeTag,
                  { backgroundColor: theme.colors.primary + "20" }, // 20% opacity
                ]}
              >
                <Ionicons
                  name="bicycle"
                  size={14}
                  color={theme.colors.primary}
                />
                <Text
                  style={[
                    styles.serviceTypeText,
                    { color: theme.colors.primary },
                  ]}
                >
                  Delivery
                </Text>
              </View>
            )}

            {restaurant.serviceType?.pickup && (
              <View
                style={[
                  styles.serviceTypeTag,
                  { backgroundColor: theme.colors.secondary + "20" }, // 20% opacity
                ]}
              >
                <Ionicons
                  name="bag-handle"
                  size={14}
                  color={theme.colors.secondary}
                />
                <Text
                  style={[
                    styles.serviceTypeText,
                    { color: theme.colors.secondary },
                  ]}
                >
                  Pickup
                </Text>
              </View>
            )}
          </View>
        </View>

        <Ionicons name="chevron-forward" size={20} color={theme.colors.gray} />
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (items.length === 0) return null;

    const subtotal = getSubtotal();
    // Calculate tax on subtotal
    const estimatedTax = subtotal * 0.05;
    // Estimate of total (excluding delivery fee which will be calculated at checkout)
    const estimatedTotal = subtotal + estimatedTax;

    return (
      <View
        style={[
          styles.summaryContainer,
          {
            backgroundColor: theme.colors.card,
            ...theme.shadow.medium,
          },
        ]}
      >
        <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>
          Order Summary
        </Text>

        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: theme.colors.text }]}>
            Subtotal
          </Text>
          <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
            LKR {subtotal.toFixed(2)}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: theme.colors.text }]}>
            Tax (5%)
          </Text>
          <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
            LKR {estimatedTax.toFixed(2)}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: theme.colors.text }]}>
            Delivery Fee
          </Text>
          <Text style={[styles.summaryValue, { color: theme.colors.gray }]}>
            Calculated at checkout
          </Text>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: theme.colors.text }]}>
            Estimated Total
          </Text>
          <Text style={[styles.totalValue, { color: theme.colors.primary }]}>
            ${estimatedTotal.toFixed(2)}
          </Text>
        </View>

        <GradientButton
          title="Proceed to Checkout"
          onPress={handleCheckoutRequest}
          fullWidth
          style={styles.checkoutButton}
          icon={
            <Ionicons
              name="cart-outline"
              size={20}
              color="#FFFFFF"
              style={{ marginRight: 8 }}
            />
          }
        />
      </View>
    );
  };

  const renderEmptyCart = () => (
    <View style={styles.emptyCartContainer}>
      <Ionicons name="cart-outline" size={100} color={theme.colors.gray} />
      <Text style={[styles.emptyCartTitle, { color: theme.colors.text }]}>
        Your cart is empty
      </Text>
      <Text style={[styles.emptyCartSubtitle, { color: theme.colors.gray }]}>
        Add some items to your cart to get started
      </Text>
      <GradientButton
        title="Explore Restaurants"
        onPress={() => navigation.navigate("Home")}
        style={styles.exploreButton}
      />
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
            { backgroundColor: theme.colors.card },
          ]}
        >
          <View style={styles.modalContent}>
            <Ionicons name="cart" size={50} color={theme.colors.primary} />
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Ready to checkout?
            </Text>
            <Text style={[styles.modalBody, { color: theme.colors.gray }]}>
              You're about to proceed to checkout with {items.length}{" "}
              {items.length === 1 ? "item" : "items"} from {restaurant?.name}.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.cancelButton,
                  { borderColor: theme.colors.gray },
                ]}
                onPress={() => setCheckoutConfirmVisible(false)}
              >
                <Text
                  style={[
                    styles.cancelButtonText,
                    { color: theme.colors.gray },
                  ]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <GradientButton
                title="Continue"
                onPress={handleConfirmCheckout}
                style={styles.continueButton}
              />
            </View>
          </View>
        </Modal>
      </Portal>
    );
  };

  const renderEmptyCartModal = () => {
    return (
      <Portal>
        <Modal
          visible={emptyCartModalVisible}
          onDismiss={() => setEmptyCartModalVisible(false)}
          contentContainerStyle={[
            styles.modalContainer,
            { backgroundColor: theme.colors.card },
          ]}
        >
          <View style={styles.modalContent}>
            <Ionicons
              name="cart-outline"
              size={50}
              color={theme.colors.error}
            />
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Empty Cart
            </Text>
            <Text style={[styles.modalBody, { color: theme.colors.gray }]}>
              Your cart is empty. Add some items to your cart to proceed to
              checkout.
            </Text>

            <GradientButton
              title="OK"
              onPress={() => setEmptyCartModalVisible(false)}
              style={styles.okButton}
            />
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
      <StatusBar
        barStyle={theme.mode === "dark" ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.background}
      />

      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            My Cart
          </Text>
        </View>

        {items.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              Alert.alert(
                "Clear Cart",
                "Are you sure you want to remove all items from your cart?",
                [
                  {
                    text: "Cancel",
                    style: "cancel",
                  },
                  {
                    text: "Clear",
                    onPress: clearCart,
                    style: "destructive",
                  },
                ]
              );
            }}
          >
            <Text style={{ color: theme.colors.error }}>Clear Cart</Text>
          </TouchableOpacity>
        )}
      </View>

      {items.length === 0 ? (
        renderEmptyCart()
      ) : (
        <FlatList
          data={items}
          renderItem={renderCartItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.cartItemsList}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
        />
      )}

      {renderCheckoutConfirmDialog()}
      {renderEmptyCartModal()}
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
    paddingVertical: 16,
  },
  
  headerTitle: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    fontWeight: "700",
  },
  clearButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  cartItemsList: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  restaurantContainer: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    alignItems: "center",
  },
  restaurantImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  restaurantInfo: {
    flex: 1,
    marginLeft: 12,
  },
  restaurantName: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    fontWeight: "600",
    marginBottom: 4,
  },
  restaurantAddress: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    marginBottom: 6,
  },
  serviceTypeContainer: {
    flexDirection: "row",
  },
  serviceTypeTag: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 8,
  },
  serviceTypeText: {
    fontSize: 10,
    fontFamily: "Poppins-Medium",
    marginLeft: 4,
  },
  cartItem: {
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
  },
  cartItemContent: {
    flexDirection: "row",
    padding: 12,
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    fontWeight: "600",
    marginBottom: 2,
  },
  portionText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    fontWeight: "600",
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityText: {
    marginHorizontal: 12,
    fontSize: 14,
    fontFamily: "Poppins-Medium",
  },
  itemActions: {
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  totalPrice: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    fontWeight: "700",
    marginBottom: 12,
  },
  removeButton: {
    padding: 4,
  },
  summaryContainer: {
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    fontWeight: "700",
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
  },
  divider: {
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    fontWeight: "700",
  },
  totalValue: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    fontWeight: "700",
  },
  checkoutButton: {
    marginTop: 8,
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyCartTitle: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 8,
  },
  emptyCartSubtitle: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    textAlign: "center",
    marginBottom: 24,
  },
  exploreButton: {
    marginTop: 16,
  },
  modalContainer: {
    margin: 20,
    borderRadius: 16,
    overflow: "hidden",
  },
  modalContent: {
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
  },
  modalBody: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    textAlign: "center",
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    borderWidth: 1,
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
  },
  continueButton: {
    flex: 1,
    marginLeft: 8,
  },
  okButton: {
    marginTop: 8,
    paddingHorizontal: 32,
  },
});

export default CartScreen;
