import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Dimensions,
} from "react-native";
import {
  Text,
  Chip,
  Card,
  Badge,
  Button,
  Modal,
  Portal,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { useCart } from "../../context/CartContext";
import dataService from "../../services/dataService";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";

const { width } = Dimensions.get("window");

const RestaurantDetailScreen = ({ route, navigation }) => {
  const { restaurantId } = route.params;
  const theme = useTheme();
  const { addItem, items, restaurant: cartRestaurant, clearCart } = useCart();

  const [restaurant, setRestaurant] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addToCartLoading, setAddToCartLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [cartModalVisible, setCartModalVisible] = useState(false);
  // Add new state for location modal
  const [locationModalVisible, setLocationModalVisible] = useState(false);

  useEffect(() => {
    loadRestaurantDetails();
  }, [restaurantId]);

  const loadRestaurantDetails = async () => {
    try {
      setLoading(true);
      const restaurantData = await dataService.getRestaurantById(restaurantId);
      setRestaurant(restaurantData);

      if (restaurantData && restaurantData.dishes) {
        const restaurantDish = await dataService.getRestaurantDishes(
          restaurantId
        );
        setDishes(restaurantDish.dishes);
        // Extract unique categories
        const uniqueCategories = [
          ...new Set(restaurantDish.dishes.map((dish) => dish.category)),
        ];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error("Error loading restaurant details:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDishes = selectedCategory
    ? dishes.filter((dish) => dish.category === selectedCategory)
    : dishes;

  const handleAddToCart = async (item) => {
    setAddToCartLoading(true);
    setModalVisible(true);

    if (
      cartRestaurant &&
      cartRestaurant.id !== restaurant._id &&
      items.length > 0
    ) {
      // Show confirmation modal for clearing cart
      setCurrentItem(item);
      setModalVisible(false);
      setAddToCartLoading(false);
      setCartModalVisible(true);
    } else {
      const result = await addItem({ ...item, quantity: 1 }, restaurant);
      if (result.success) {
        // Show confirmation modal
        setCurrentItem(item);
        setAddToCartLoading(false);
        setModalVisible(true);
      }
    }
  };

  const handleClearCartAndAdd = () => {
    clearCart();
    addItem({ ...currentItem, quantity: 1 }, restaurant);
    setCartModalVisible(false);
    setModalVisible(true);
  };

  // Add function to handle opening the location modal
  const handleShowLocation = () => {
    setLocationModalVisible(true);
  };

  const renderDishItem = ({ item }) => (
    <Card
      style={[styles.dishCard, { ...theme.shadow.small }]}
      onPress={() =>
        navigation.navigate("DishDetail", {
          restaurantId: restaurant._id,
          dishId: item._id,
        })
      }
    >
      <View style={styles.dishContent}>
        <View style={styles.dishInfo}>
          <Text style={styles.dishName}>{item.name}</Text>
          <Text style={styles.dishPrice}>LKR {item.price.toFixed(2)}</Text>
          <Text style={styles.dishDescription} numberOfLines={2}>
            {item.description}
          </Text>

          <Button
            mode="contained"
            style={[
              styles.addButton,
              { backgroundColor: theme.colors.primary },
            ]}
            labelStyle={styles.addButtonLabel}
            onPress={() => handleAddToCart(item)}
          >
            Add
          </Button>
        </View>
        <Image source={{ uri: item.imageUrls[0] }} style={styles.dishImage} />
      </View>

      {item.popular && (
        <Badge
          style={[
            styles.popularBadge,
            { backgroundColor: theme.colors.tertiary },
          ]}
        >
          Popular
        </Badge>
      )}
    </Card>
  );

  const renderCategoryItem = ({ item }) => (
    <Chip
      selected={selectedCategory === item}
      onPress={() =>
        setSelectedCategory(selectedCategory === item ? null : item)
      }
      style={[
        styles.categoryChip,
        selectedCategory === item && { backgroundColor: theme.colors.primary },
      ]}
      textStyle={[selectedCategory === item && { color: theme.colors.white }]}
    >
      {item}
    </Chip>
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

  if (!restaurant) {
    return (
      <View
        style={[
          styles.errorContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Text style={styles.errorText}>Restaurant not found</Text>
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

  // Default coordinates for the restaurant
  // You should replace these with actual restaurant coordinates from your data
  const restaurantLocation = {
    latitude: restaurant.address?.coordinates?.lat,
    longitude: restaurant.address?.coordinates?.lng,
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Image
            source={{
              uri: restaurant.coverImageUrl || restaurant.imageUrls[0],
            }}
            style={styles.coverImage}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.restaurantInfoContainer}>
          <Text style={styles.restaurantName}>{restaurant.name}</Text>

          <View style={styles.restaurantMetaInfo}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={18} color={theme.colors.tertiary} />
              {/* <Text style={styles.ratingText}>{restaurant.rating}</Text> */}
            </View>
            {/* <Text style={styles.cuisineText}>{restaurant.cuisineType}</Text> */}
            <Text style={styles.addressText}>
              {restaurant.address.street} {restaurant.address.city}{" "}
              {restaurant.address.province}
            </Text>
          </View>

          <View style={styles.deliveryInfoContainer}>
            <View style={styles.deliveryInfo}>
              <Ionicons
                name="time-outline"
                size={20}
                color={theme.colors.gray}
              />
              <Text style={styles.deliveryInfoText}>
                {/* {restaurant.deliveryTime} */}
              </Text>
            </View>
            <View style={styles.deliveryInfo}>
              <Ionicons
                name="bicycle-outline"
                size={20}
                color={theme.colors.gray}
              />
              <Text style={styles.deliveryInfoText}>
                {/* ${restaurant.deliveryFee} delivery */}
              </Text>
            </View>
            <View style={styles.deliveryInfo}>
              <Ionicons
                name="cash-outline"
                size={20}
                color={theme.colors.gray}
              />
              <Text style={styles.deliveryInfoText}>
                {/* ${restaurant.minOrder} min */}
              </Text>
            </View>
          </View>

          <Text style={styles.descriptionText}>{restaurant.description}</Text>

          {/* Add a button to show location */}
          <Button
            mode="outlined"
            icon="map-marker"
            onPress={handleShowLocation}
            style={styles.locationButton}
            contentStyle={styles.locationButtonContent}
          >
            Show Restaurant Location
          </Button>
        </View>

        <View style={styles.menuContainer}>
          <Text style={styles.menuTitle}>Menu</Text>

          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesList}
            contentContainerStyle={styles.categoriesContainer}
          />

          <View style={styles.dishesContainer}>
            {filteredDishes.map((dish) => (
              <View key={dish._id} style={styles.dishItem}>
                {renderDishItem({ item: dish })}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

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
            {addToCartLoading ? (
              <ActivityIndicator
                size="large"
                color={theme.colors.primary}
                style={{ marginVertical: 20 }}
              />
            ) : (
              <>
                <Ionicons
                  name="checkmark-circle"
                  size={60}
                  color={theme.colors.success}
                />
                <Text style={styles.modalTitle}>Added to Cart</Text>
                <Text style={styles.modalText}>
                  {currentItem?.name} has been added to your cart.
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
              </>
            )}
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

      {/* Location Modal */}
      <Portal>
        <Modal
          visible={locationModalVisible}
          onDismiss={() => setLocationModalVisible(false)}
          contentContainerStyle={[
            styles.locationModal,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <View style={styles.locationModalContent}>
            <Text style={styles.locationModalTitle}>Restaurant Location</Text>

            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: restaurantLocation.latitude,
                  longitude: restaurantLocation.longitude,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }}
              >
                <Marker
                  coordinate={restaurantLocation}
                  title={restaurant.name}
                  description={restaurant.address.street}
                />
              </MapView>
            </View>

            <View style={styles.coordinatesContainer}>
              <Text style={styles.coordinatesText}>
                <Text style={styles.coordinatesLabel}>Latitude: </Text>
                {restaurantLocation.latitude.toFixed(6)}
              </Text>
              <Text style={styles.coordinatesText}>
                <Text style={styles.coordinatesLabel}>Longitude: </Text>
                {restaurantLocation.longitude.toFixed(6)}
              </Text>
            </View>

            <View style={styles.addressContainer}>
              <Text style={styles.addressLabel}>Address:</Text>
              <Text style={styles.addressValue}>
                {restaurant.address.street}, {restaurant.address.city},{" "}
                {restaurant.address.province}
              </Text>
            </View>

            <Button
              mode="contained"
              onPress={() => setLocationModalVisible(false)}
              style={[
                styles.closeButton,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              Close
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
  coverImage: {
    width: "100%",
    height: 200,
  },
  backButton: {
    position: "absolute",
    top: 15,
    left: 15,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 20,
    padding: 8,
  },
  restaurantInfoContainer: {
    padding: 16,
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  restaurantMetaInfo: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  ratingText: {
    marginLeft: 4,
    fontWeight: "bold",
  },
  cuisineText: {
    marginRight: 10,
    color: "#666",
  },
  addressText: {
    color: "#666",
  },
  deliveryInfoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  deliveryInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  deliveryInfoText: {
    marginLeft: 4,
    color: "#666",
  },
  descriptionText: {
    color: "#444",
    lineHeight: 22,
    marginBottom: 16,
  },
  locationButton: {
    marginTop: 8,
    borderColor: "#666",
  },
  locationButtonContent: {
    height: 44,
  },
  menuContainer: {
    padding: 16,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  categoriesList: {
    marginBottom: 12,
  },
  categoriesContainer: {
    paddingRight: 20,
  },
  categoryChip: {
    marginRight: 8,
  },
  dishesContainer: {
    marginTop: 8,
  },
  dishItem: {
    marginBottom: 16,
  },
  dishCard: {
    borderRadius: 12,
    overflow: "hidden",
  },
  dishContent: {
    flexDirection: "row",
    padding: 12,
  },
  dishInfo: {
    flex: 1,
    paddingRight: 10,
  },
  dishName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  dishPrice: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 6,
  },
  dishDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  dishImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  addButton: {
    alignSelf: "flex-start",
    paddingVertical: 2,
    paddingHorizontal: 12,
  },
  addButtonLabel: {
    fontSize: 14,
  },
  popularBadge: {
    position: "absolute",
    top: 8,
    right: 8,
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
  // Location modal styles
  locationModal: {
    margin: 20,
    borderRadius: 16,
    padding: 16,
    height: "80%", // Set a fixed height for the modal
  },
  locationModalContent: {
    flex: 1,
    width: "100%",
  },
  locationModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  mapContainer: {
    height: 250,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  coordinatesContainer: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  coordinatesText: {
    fontSize: 15,
    marginBottom: 4,
  },
  coordinatesLabel: {
    fontWeight: "bold",
  },
  addressContainer: {
    marginBottom: 16,
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  addressValue: {
    fontSize: 15,
    color: "#444",
    lineHeight: 20,
  },
  closeButton: {
    marginTop: 8,
  },
});

export default RestaurantDetailScreen;
