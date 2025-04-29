import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Dimensions,
  Platform,
} from "react-native";
import {
  Text,
  Badge,
  Button,
  Modal,
  Portal,
  Divider,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { useCart } from "../../context/CartContext";
import dataService from "../../services/dataService";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import GradientButton from "../../components/ui/GradientButton";
import * as Haptics from "expo-haptics";

const { width } = Dimensions.get("window");

const DishDetailScreen = ({ route, navigation }) => {
  const { restaurantId, dishId } = route.params;
  const theme = useTheme();
  const { addItem, items, restaurant: cartRestaurant, clearCart } = useCart();
  const [dish, setDish] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [cartAddingLoading, setCartAddingLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [cartModalVisible, setCartModalVisible] = useState(false);
  const [selectedPortion, setSelectedPortion] = useState(null);
  const [portionModalVisible, setPortionModalVisible] = useState(false);
  const [modalQuantity, setModalQuantity] = useState(1);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [isRestaurantOpen, setIsRestaurantOpen] = useState(true);

  useEffect(() => {
    loadDishDetails();
  }, [restaurantId, dishId]);

  const loadDishDetails = async () => {
    try {
      setLoading(true);
      const restaurantData = await dataService.getRestaurantById(restaurantId);
      setRestaurant(restaurantData);

      // Check if restaurant is open
      const isOpen = !isRestaurantClosed(restaurantData);
      setIsRestaurantOpen(isOpen);

      if (restaurantData && restaurantData.dishes) {
        const restaurantDish = await dataService.getRestaurantDishes(
          restaurantId
        );
        const dishData = restaurantDish.dishes.find((d) => d._id === dishId);
        console.log(dishData);
        setDish(dishData);

        // Set default portion if portions exist
        if (dishData?.portions && dishData.portions.length > 0) {
          setSelectedPortion(dishData.portions[0]);
        }
      }
    } catch (error) {
      console.error("Error loading dish details:", error);
    } finally {
      setLoading(false);
    }
  };

  const isRestaurantClosed = (restaurant) => {
    console.log("123 ", restaurant.openingHours);
    if (!restaurant.openingHours || restaurant.openingHours.length === 0)
      return false;

    // Get current day of the week (0 = Sunday, 1 = Monday, etc.)
    const now = new Date();
    const currentDay = now.getDay();
    // Convert to match our array structure (where 0 = Monday, 6 = Sunday)
    const dayIndex = currentDay === 0 ? 6 : currentDay - 1;

    // Get the opening hours for today
    const todayHours = restaurant.openingHours[dayIndex];
    console.log(todayHours);
    if (!todayHours) return true;

    // If the restaurant is explicitly marked as closed for today
    if (todayHours.isClosed) return true;

    // Check if current time is outside opening hours
    if (todayHours.open && todayHours.close) {
      const currentTime = now.getHours() * 60 + now.getMinutes(); // current time in minutes

      // Convert opening hours to minutes for comparison
      const [openHour, openMinute] = todayHours.open.split(":").map(Number);
      const [closeHour, closeMinute] = todayHours.close.split(":").map(Number);

      const openTime = openHour * 60 + openMinute;
      const closeTime = closeHour * 60 + closeMinute;

      // Handle overnight opening hours (close time is less than open time)
      if (closeTime < openTime) {
        // Restaurant is open overnight
        return currentTime < openTime && currentTime > closeTime;
      } else {
        // Regular hours
        return currentTime < openTime || currentTime > closeTime;
      }
    }

    // If open/close times aren't properly set, consider it closed
    return todayHours.open === "" || todayHours.close === "";
  };

  const increaseQuantity = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setQuantity(quantity + 1);
    getCurrentPrice;
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setQuantity(quantity - 1);
    }
  };

  // Helper to get base price (lowest portion price or dish.price)
  const getBasePrice = () => {
    if (dish?.portions && dish.portions.length > 0) {
      return Math.min(...dish.portions.map((p) => p.price));
    }
    return dish?.price || 0;
  };

  // Helper to get current price (selected portion or base price)
  const getCurrentPrice = () => {
    if (selectedPortion) {
      return selectedPortion.price * quantity;
    }
    return dish?.price * quantity || 0;
  };

  // Helper to get price difference for a portion
  const getPortionDiff = (portion) => {
    const base = getBasePrice();
    const diff = portion.price - base;
    return diff === 0 ? "+LKR 0" : `+LKR ${diff.toFixed(2)}`;
  };

  const handleAddToCart = async () => {
    if (!dish.isAvailable || !isRestaurantOpen) {
      return; // Don't allow adding if dish not available or restaurant closed
    }

    if (dish.portions && dish.portions.length > 0 && !selectedPortion) {
      setModalQuantity(1);
      setPortionModalVisible(true);
      return;
    }

    setCartAddingLoading(true);
    if (
      cartRestaurant &&
      cartRestaurant.id !== restaurant._id &&
      items.length > 0
    ) {
      setCartModalVisible(true);
    } else {
      const dishWithQuantity = {
        ...dish,
        quantity,
        selectedPortion,
        price: selectedPortion ? selectedPortion.price : dish.price,
      };
      const result = await addItem(dishWithQuantity, restaurant);
      if (result.success) setModalVisible(true);
      setCartAddingLoading(false);
    }
  };

  const handlePortionAdd = async () => {
    if (!isRestaurantOpen) {
      setPortionModalVisible(false);
      return;
    }

    setPortionModalVisible(false);
    setCartAddingLoading(true);
    if (
      cartRestaurant &&
      cartRestaurant.id !== restaurant._id &&
      items.length > 0
    ) {
      setCartModalVisible(true);
    } else {
      const dishWithPortion = {
        ...dish,
        quantity: modalQuantity,
        selectedPortion,
        price: selectedPortion.price,
      };
      const result = await addItem(dishWithPortion, restaurant);
      if (result.success) setModalVisible(true);
      setCartAddingLoading(false);
    }
  };

  const handleClearCartAndAdd = () => {
    if (!isRestaurantOpen) return;

    clearCart();
    const dishWithQuantity = {
      ...dish,
      quantity,
      selectedPortion,
      price: selectedPortion ? selectedPortion.price : dish.price,
    };
    addItem(dishWithQuantity, restaurant);
    setCartModalVisible(false);
    setModalVisible(true);
  };

  const handleScanQRCode = () => {
    setQrModalVisible(true);
  };

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator size="large" color="#FF5722" />
      </View>
    );
  }

  if (!dish || !restaurant) {
    return (
      <View
        style={[
          styles.errorContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Text style={styles.errorText}>Dish not found</Text>
        <Button
          mode="contained"
          onPress={() => navigation.goBack()}
          style={[styles.goBackButton, { backgroundColor: "#FF5722" }]}
        >
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.cardContainer}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>

          <View style={styles.imageContainer}>
            <Image
              source={{ uri: dish.imageUrls[0] }}
              style={styles.dishImage}
              resizeMode="cover"
            />
            {dish.popular && <Badge style={styles.popularBadge}>Popular</Badge>}
            {!dish.isAvailable && (
              <View style={styles.unavailableOverlay}>
                <Text style={styles.unavailableText}>
                  Currently Unavailable
                </Text>
              </View>
            )}
            {!isRestaurantOpen && dish.isAvailable && (
              <View style={styles.unavailableOverlay}>
                <Text style={styles.restaurantClosedText}>
                  Restaurant Closed
                </Text>
              </View>
            )}
          </View>

          <View style={styles.contentContainer}>
            <Text style={styles.dishName}>{dish.name}</Text>
            <Text style={styles.deliveryText}>{dish.category}</Text>

            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={[
                  styles.quantityButton,
                  (!dish.isAvailable || !isRestaurantOpen) &&
                    styles.disabledButton,
                ]}
                onPress={decreaseQuantity}
                disabled={
                  quantity <= 1 || !dish.isAvailable || !isRestaurantOpen
                }
              >
                <Text style={styles.quantityButtonText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.quantityValue}>{quantity}</Text>
              <TouchableOpacity
                style={[
                  styles.quantityButton,
                  (!dish.isAvailable || !isRestaurantOpen) &&
                    styles.disabledButton,
                ]}
                onPress={increaseQuantity}
                disabled={!dish.isAvailable || !isRestaurantOpen}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>

              <Text style={styles.priceText}>
                LKR {getCurrentPrice().toFixed(2)}
              </Text>
            </View>

            {dish.portions && dish.portions.length > 0 && (
              <View style={styles.portionSection}>
                <Text style={styles.sectionTitle}>Select Size</Text>
                <View style={styles.portionsContainer}>
                  {dish.portions.map((portion, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.portionCard,
                        (!dish.isAvailable || !isRestaurantOpen) &&
                          styles.disabledPortionCard,
                        selectedPortion && selectedPortion.size === portion.size
                          ? {
                              borderColor: "#FF5722",
                              backgroundColor: "rgba(255, 87, 34, 0.1)",
                            }
                          : {
                              borderColor: "#E0E0E0",
                            },
                      ]}
                      onPress={() =>
                        dish.isAvailable &&
                        isRestaurantOpen &&
                        setSelectedPortion(portion)
                      }
                      disabled={!dish.isAvailable || !isRestaurantOpen}
                    >
                      <View style={styles.portionNameContainer}>
                        <Text
                          style={[
                            styles.portionName,
                            (!dish.isAvailable || !isRestaurantOpen) &&
                              styles.disabledText,
                            selectedPortion &&
                              selectedPortion.size === portion.size && {
                                color: "#FF5722",
                                fontWeight: "bold",
                              },
                          ]}
                        >
                          {portion.size}
                        </Text>
                      </View>
                      <View>
                        <Text
                          style={[
                            styles.portionPrice,
                            (!dish.isAvailable || !isRestaurantOpen) &&
                              styles.disabledText,
                          ]}
                        >
                          LKR {portion.price.toFixed(2)}
                        </Text>
                        <Text style={styles.portionDiff}>
                          {getPortionDiff(portion)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.descriptionText}>{dish.description}</Text>
            </View>

            <View style={styles.restaurantSection}>
              <Text style={styles.sectionTitle}>From</Text>
              <TouchableOpacity
                style={styles.restaurantCard}
                onPress={() =>
                  navigation.navigate("RestaurantDetail", {
                    restaurantId: restaurant._id,
                  })
                }
              >
                <Image
                  source={{ uri: restaurant.imageUrls[0] }}
                  style={styles.restaurantImage}
                />
                <View style={styles.restaurantInfo}>
                  <Text style={styles.restaurantName}>
                    {restaurant.name} ({restaurant.address.city})
                  </Text>
                  <Text style={styles.restaurantCuisine}>
                    {restaurant.cuisineType}
                  </Text>
                  <View style={styles.statusIndicator}>
                    <View
                      style={[
                        styles.statusDot,
                        isRestaurantOpen ? styles.openDot : styles.closedDot,
                      ]}
                    />
                    <Text
                      style={
                        isRestaurantOpen ? styles.openText : styles.closedText
                      }
                    >
                      {isRestaurantOpen ? "Open Now" : "Closed"}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#999" />
              </TouchableOpacity>
            </View>

            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={[
                  styles.addButton,
                  (!dish.isAvailable || !isRestaurantOpen) &&
                    styles.disabledAddButton,
                ]}
                onPress={handleAddToCart}
                disabled={
                  cartAddingLoading || !dish.isAvailable || !isRestaurantOpen
                }
              >
                {cartAddingLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.addButtonText}>Add to cart</Text>
                )}
              </TouchableOpacity>
            </View>

            {!dish.isAvailable && (
              <Text style={styles.unavailableNote}>
                This item is currently unavailable. Please check back later or
                explore other options.
              </Text>
            )}

            {!isRestaurantOpen && dish.isAvailable && (
              <Text style={styles.unavailableNote}>
                This restaurant is currently closed. You can't add items to your
                cart until the restaurant opens.
              </Text>
            )}
          </View>
        </ScrollView>
      </View>

      {/* Portion Selection Modal */}
      <Portal>
        <Modal
          visible={portionModalVisible}
          onDismiss={() => setPortionModalVisible(false)}
          contentContainerStyle={[
            styles.modal,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select your portion</Text>
            {dish?.portions?.map((portion, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.radioRow,
                  selectedPortion?.name === portion.name &&
                    styles.radioRowSelected,
                ]}
                onPress={() => setSelectedPortion(portion)}
              >
                <View
                  style={[
                    styles.radioCircle,
                    selectedPortion?.name === portion.name &&
                      styles.radioCircleSelected,
                  ]}
                >
                  {selectedPortion?.name === portion.name && (
                    <View style={styles.radioDot} />
                  )}
                </View>
                <Text style={styles.radioLabel}>{portion.name}</Text>
                <Text style={styles.radioPrice}>
                  LKR {portion.price.toFixed(2)}
                </Text>
              </TouchableOpacity>
            ))}
            <View style={styles.modalFooterRow}>
              <View style={styles.modalQtyBox}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() =>
                    setModalQuantity(Math.max(1, modalQuantity - 1))
                  }
                >
                  <Text style={styles.qtyBtnText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.qtyText}>{modalQuantity}</Text>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => setModalQuantity(modalQuantity + 1)}
                >
                  <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.modalPrice}>
                LKR{" "}
                {(selectedPortion
                  ? selectedPortion.price * modalQuantity
                  : getBasePrice() * modalQuantity
                ).toFixed(2)}
              </Text>
            </View>
            <Button
              mode="contained"
              style={[styles.addButtonModal, { backgroundColor: "#FF5722" }]}
              labelStyle={styles.addButtonLabel}
              onPress={handlePortionAdd}
              disabled={!selectedPortion || !isRestaurantOpen}
            >
              Add to Cart
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* Added to cart confirmation modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={[
            styles.modal,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <View style={styles.modalContent}>
            <Ionicons name="checkmark-circle" size={60} color="#4CAF50" />
            <Text style={styles.modalTitle}>Added to Cart</Text>
            <Text style={styles.modalText}>
              {quantity} x {dish.name} has been added to your cart.
            </Text>

            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={() => setModalVisible(false)}
                style={styles.modalButton}
              >
                Continue Shopping
              </Button>
              <Button
                mode="contained"
                onPress={() => {
                  setModalVisible(false);
                  navigation.navigate("Cart");
                }}
                style={[styles.modalButton, { backgroundColor: "#FF5722" }]}
              >
                View Cart
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>

      {/* Cart confirmation modal */}
      <Portal>
        <Modal
          visible={cartModalVisible}
          onDismiss={() => setCartModalVisible(false)}
          contentContainerStyle={[
            styles.modal,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <View style={styles.modalContent}>
            <Ionicons name="alert-circle" size={60} color="#FFC107" />
            <Text style={styles.modalTitle}>Clear Cart?</Text>
            <Text style={styles.modalText}>
              Your cart contains items from {cartRestaurant?.name}. Do you want
              to clear your cart and add items from {restaurant.name}?
            </Text>

            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={() => setCartModalVisible(false)}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleClearCartAndAdd}
                style={[styles.modalButton, { backgroundColor: "#FF5722" }]}
              >
                Clear Cart
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>

      {/* QR Code Modal */}
      {/* <Portal>
        <Modal
          visible={qrModalVisible}
          onDismiss={() => setQrModalVisible(false)}
          contentContainerStyle={[
            styles.modal,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Scan to Order</Text> */}
      {/* <Image
              source={require("../../assets/images/qr-placeholder.png")}
              style={styles.qrCode}
              onError={() => console.log("Error loading QR code")}
            />
            <Text style={styles.modalText}>
              Scan this QR code at the restaurant to order {dish.name}.
            </Text> */}
      {/* <Button
              mode="contained"
              onPress={() => setQrModalVisible(false)}
              style={{ backgroundColor: "#FF5722", marginTop: 16 }}
            >
              Close
            </Button>
          </View>
        </Modal>
      </Portal> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cardContainer: {
    flex: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
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
  errorText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  goBackButton: {
    borderRadius: 10,
    paddingHorizontal: 16,
  },
  backButton: {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    height: 250,
    width: "100%",
    position: "relative",
  },
  dishImage: {
    width: "100%",
    height: "100%",
  },
  popularBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    paddingHorizontal: 10,
    backgroundColor: "#FF5722",
    color: "#FFFFFF",
  },
  unavailableOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  unavailableText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    padding: 10,
    backgroundColor: "rgba(255, 87, 34, 0.8)",
    borderRadius: 5,
  },
  restaurantClosedText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    padding: 10,
    backgroundColor: "rgba(244, 67, 54, 0.8)",
    borderRadius: 5,
  },
  contentContainer: {
    padding: 20,
  },
  dishName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 6,
  },
  deliveryText: {
    fontSize: 14,
    color: "#888888",
    marginBottom: 20,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  disabledButton: {
    opacity: 0.5,
    backgroundColor: "#F0F0F0",
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
  },
  quantityValue: {
    fontSize: 16,
    fontWeight: "bold",
    marginHorizontal: 16,
    width: 20,
    textAlign: "center",
  },
  priceText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
    marginLeft: "auto",
  },
  sectionContainer: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#888888",
  },
  portionSection: {
    marginBottom: 10,
  },
  portionsContainer: {
    marginTop: 12,
  },
  portionCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  disabledPortionCard: {
    opacity: 0.6,
    backgroundColor: "#F8F8F8",
  },
  portionNameContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  portionName: {
    fontSize: 14,
    color: "#333333",
  },
  portionPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333333",
    textAlign: "right",
  },
  portionDiff: {
    fontSize: 12,
    color: "#888888",
    textAlign: "right",
  },
  disabledText: {
    color: "#999999",
  },
  restaurantSection: {
    marginBottom: 16,
  },
  restaurantCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    marginTop: 5,

    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,

    // Elevation for Android
    elevation: 3,
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
    color: "#333333",
  },
  restaurantCuisine: {
    fontSize: 14,
    color: "#888888",
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  openDot: {
    backgroundColor: "#4CAF50",
  },
  closedDot: {
    backgroundColor: "#F44336",
  },
  openText: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "500",
  },
  closedText: {
    fontSize: 12,
    color: "#F44336",
    fontWeight: "500",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  scanButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#FF5722",
    borderRadius: 8,
    marginRight: 8,
    flex: 1,
  },
  disabledScanButton: {
    borderColor: "#CCCCCC",
    opacity: 0.6,
  },
  scanButtonText: {
    color: "#FF5722",
    fontWeight: "bold",
    marginLeft: 8,
  },
  addButton: {
    backgroundColor: "#FF5722",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    flex: 2,
  },
  disabledAddButton: {
    backgroundColor: "#CCCCCC",
    opacity: 0.6,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  unavailableNote: {
    fontSize: 14,
    color: "#F44336",
    textAlign: "center",
    marginTop: 8,
    fontStyle: "italic",
  },
  modal: {
    margin: 20,
    borderRadius: 16,
    padding: 20,
    width: "90%",
    alignSelf: "center",
  },
  modalContent: {
    alignItems: "center",
    width: "100%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  modalText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#666",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    width: "100%",
  },
  radioRowSelected: {
    backgroundColor: "#f6f6f6",
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#aaa",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  radioCircleSelected: {
    borderColor: "#FF5722",
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FF5722",
  },
  radioLabel: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
  },
  radioPrice: {
    fontSize: 15,
    color: "#888",
    marginLeft: 8,
  },
  modalFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  modalQtyBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FF5722",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  qtyBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  qtyBtnText: {
    fontSize: 20,
    color: "#FF5722",
    fontWeight: "bold",
  },
  qtyText: {
    fontSize: 16,
    fontWeight: "bold",
    marginHorizontal: 8,
  },
  modalPrice: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: "auto",
    marginRight: 8,
  },
  addButtonModal: {
    marginTop: 20,
    width: "100%",
  },
  addButtonLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  qrCode: {
    width: 200,
    height: 200,
    marginVertical: 16,
  },
});

export default DishDetailScreen;
