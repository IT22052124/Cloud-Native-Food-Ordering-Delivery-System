import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Text, Button, Badge, Modal, Portal } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { useCart } from "../../context/CartContext";
import dataService from "../../services/dataService";
import { Ionicons } from "@expo/vector-icons";

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

  useEffect(() => {
    loadDishDetails();
  }, [restaurantId, dishId]);

  const loadDishDetails = async () => {
    try {
      setLoading(true);
      const restaurantData = await dataService.getRestaurantById(restaurantId);
      setRestaurant(restaurantData);

      if (restaurantData && restaurantData.dishes) {
        const restaurantDish = await dataService.getRestaurantDishes(
          restaurantId
        );
        const dishData = restaurantDish.dishes.find((d) => d._id === dishId);
        setDish(dishData);
      }
    } catch (error) {
      console.error("Error loading dish details:", error);
    } finally {
      setLoading(false);
    }
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = async () => {
    setCartAddingLoading(true);
    if (
      cartRestaurant &&
      cartRestaurant.id !== restaurant._id &&
      items.length > 0
    ) {
      // Show confirmation modal for clearing cart
      setCartModalVisible(true);
    } else {
      const dishWithQuantity = { ...dish, quantity };
      const result = await addItem(dishWithQuantity, restaurant);

      if (result.success) {
        // Show confirmation modal
        setModalVisible(true);
      }
      setCartAddingLoading(false);
    }
  };

  const handleClearCartAndAdd = () => {
    clearCart();
    const dishWithQuantity = { ...dish, quantity };
    addItem(dishWithQuantity, restaurant);
    setCartModalVisible(false);
    setModalVisible(true);
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
          style={[
            styles.goBackButton,
            { backgroundColor: theme.colors.primary },
          ]}
        >
          Go Back
        </Button>
      </View>
    );
  }

  const totalPrice = dish.price * quantity;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Image
            source={{ uri: dish.imageUrls[0] }}
            style={styles.dishImage}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.white} />
          </TouchableOpacity>
          {dish.popular && (
            <Badge
              style={[
                styles.popularBadge,
                { backgroundColor: theme.colors.tertiary },
              ]}
            >
              Popular
            </Badge>
          )}
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.dishName}>{dish.name}</Text>
            <Text style={styles.dishPrice}>LKR {dish.price.toFixed(2)}</Text>
          </View>

          <Text style={styles.categoryText}>{dish.category}</Text>

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{dish.description}</Text>

          <Text style={styles.sectionTitle}>From</Text>
          <TouchableOpacity
            style={styles.restaurantContainer}
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
              <Text style={styles.restaurantName}>{restaurant.name}</Text>
              {/* <Text style={styles.restaurantCuisine}>
                {restaurant.cuisineType}
              </Text> */}
            </View>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={theme.colors.gray}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { backgroundColor: theme.colors.background, ...theme.shadow.medium },
        ]}
      >
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={[
              styles.quantityButton,
              { borderColor: theme.colors.primary },
            ]}
            onPress={decreaseQuantity}
          >
            <Ionicons name="remove" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity
            style={[
              styles.quantityButton,
              { borderColor: theme.colors.primary },
            ]}
            onPress={increaseQuantity}
          >
            <Ionicons name="add" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        <Button
          mode="contained"
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          labelStyle={styles.addButtonLabel}
          onPress={handleAddToCart}
          loading={cartAddingLoading}
          disabled={cartAddingLoading}
        >
          Add to Cart - LKR{totalPrice.toFixed(2)}
        </Button>
      </View>

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
            <Ionicons
              name="checkmark-circle"
              size={60}
              color={theme.colors.success}
            />
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
                style={[
                  styles.modalButton,
                  { backgroundColor: theme.colors.primary },
                ]}
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
            <Ionicons
              name="alert-circle"
              size={60}
              color={theme.colors.warning}
            />
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
                style={[
                  styles.modalButton,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                Clear Cart
              </Button>
            </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    marginBottom: 20,
  },
  goBackButton: {
    paddingHorizontal: 20,
  },
  header: {
    position: "relative",
  },
  dishImage: {
    width: "100%",
    height: 250,
  },
  backButton: {
    position: "absolute",
    top: 15,
    left: 15,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 20,
    padding: 8,
  },
  popularBadge: {
    position: "absolute",
    top: 15,
    right: 15,
  },
  contentContainer: {
    padding: 16,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  dishName: {
    fontSize: 24,
    fontWeight: "bold",
    flex: 1,
    marginRight: 10,
  },
  dishPrice: {
    fontSize: 20,
    fontWeight: "bold",
  },
  categoryText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#444",
  },
  restaurantContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
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
  },
  restaurantCuisine: {
    fontSize: 14,
    color: "#666",
  },
  footer: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  quantityButton: {
    borderWidth: 1,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    fontSize: 18,
    fontWeight: "bold",
    marginHorizontal: 12,
  },
  addButton: {
    flex: 1,
    borderRadius: 8,
  },
  addButtonLabel: {
    fontSize: 16,
    paddingVertical: 2,
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
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
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
});

export default DishDetailScreen;
