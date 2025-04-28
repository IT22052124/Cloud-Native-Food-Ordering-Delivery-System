import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Dimensions,
  TextInput,
  Text as RNText,
  Animated,
} from "react-native";
import { Card, Badge, Button, Modal, Portal } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { useCart } from "../../context/CartContext";
import dataService from "../../services/dataService";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";

const { width } = Dimensions.get("window");
const HEADER_HEIGHT = 280; // Default header height
const STICKY_NAV_HEIGHT = 60; // Height of sticky nav bar
const STICKY_CATEGORY_HEIGHT = 70; // Height of sticky category bar
const STICKY_SEARCH_HEIGHT = 66; // Height of sticky search bar
const STICKY_HEADER_HEIGHT =
  STICKY_NAV_HEIGHT + STICKY_CATEGORY_HEIGHT + STICKY_SEARCH_HEIGHT;

const RestaurantDetailScreen = ({ route, navigation }) => {
  const { restaurantId } = route.params;
  const theme = useTheme();
  const { addItem, items, restaurant: cartRestaurant, clearCart } = useCart();

  const [restaurant, setRestaurant] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [filteredDishes, setFilteredDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addToCartLoading, setAddToCartLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [cartModalVisible, setCartModalVisible] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [headerHeight, setHeaderHeight] = useState(HEADER_HEIGHT);
  const [searchFocused, setSearchFocused] = useState(false);

  const scrollViewRef = useRef(null);
  const sectionRefs = useRef({});
  const searchInputRef = useRef(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadRestaurantDetails();
  }, [restaurantId]);

  // Function to measure the header height
  const onHeaderLayout = (event) => {
    const { height } = event.nativeEvent.layout;
    setHeaderHeight(height);
  };

  // Initialize section refs when categories change
  useEffect(() => {
    if (categories.length > 0) {
      sectionRefs.current = {};
      categories.forEach((category) => {
        sectionRefs.current[category] = React.createRef();
      });

      if (!activeCategory) {
        setActiveCategory(categories[0]);
      }
    }
  }, [categories]);

  // Filter dishes based on selected category and search query
  useEffect(() => {
    if (dishes.length === 0) return;

    let filtered = [...dishes];

    // Apply search filter if query exists
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter((dish) =>
        dish.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredDishes(filtered);
  }, [searchQuery, dishes]);

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
        setFilteredDishes(restaurantDish.dishes);

        // Extract unique categories
        const uniqueCategories = [
          ...new Set(restaurantDish.dishes.map((dish) => dish.category)),
        ];
        setCategories(uniqueCategories);

        // Set initial active category
        if (uniqueCategories.length > 0) {
          setActiveCategory(uniqueCategories[0]);
        }
      }
    } catch (error) {
      console.error("Error loading restaurant details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event) => {
        const yOffset = event.nativeEvent.contentOffset.y;

        // Find which section is most visible
        categories.forEach((category) => {
          const ref = sectionRefs.current[category];
          if (ref && ref.current) {
            ref.current.measure((x, y, width, height, pageX, pageY) => {
              // If section is visible in the viewport (with some margin)
              if (pageY <= 200 && pageY >= -100) {
                if (activeCategory !== category) {
                  setActiveCategory(category);
                }
              }
            });
          }
        });
      },
    }
  );

  const handleCategoryPress = (category) => {
    setActiveCategory(category);

    // Scroll to the section
    const sectionRef = sectionRefs.current[category];
    if (scrollViewRef.current && sectionRef && sectionRef.current) {
      sectionRef.current.measure((x, y, width, height, pageX, pageY) => {
        scrollViewRef.current.scrollTo({
          y: pageY - STICKY_HEADER_HEIGHT - 30, // Offset to account for sticky header
          animated: true,
        });
      });
    }
  };

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

  const handleShowLocation = () => {
    setLocationModalVisible(true);
  };

  const handleSearchFocus = () => {
    setSearchFocused(true);
    // Scroll to make the search input visible if needed
    if (scrollY._value < headerHeight - 150) {
      scrollViewRef.current?.scrollTo({
        y: headerHeight - 100,
        animated: true,
      });
    }
  };

  const handleSearchBlur = () => {
    setSearchFocused(false);
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
          <RNText style={styles.dishName}>{item.name}</RNText>
          <RNText style={styles.dishPrice}>LKR {item.price.toFixed(2)}</RNText>
          <RNText style={styles.dishDescription} numberOfLines={2}>
            {item.description}
          </RNText>

          {item.isAvailable ? (
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
          ) : (
            <View style={styles.unavailableContainer}>
              <Ionicons
                name="close-circle"
                size={20}
                color={theme.colors.error}
              />
              <RNText
                style={[styles.unavailableText, { color: theme.colors.error }]}
              >
                Not Available
              </RNText>
            </View>
          )}
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

  const renderCategoryTab = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryTab,
        activeCategory === item && {
          ...styles.activeCategoryTab,
          backgroundColor: theme.colors.primary,
        },
      ]}
      onPress={() => handleCategoryPress(item)}
    >
      <RNText
        style={[
          styles.categoryTabText,
          activeCategory === item && styles.activeCategoryText,
        ]}
      >
        {item}
      </RNText>
    </TouchableOpacity>
  );

  // Calculate styles for sticky header components with smoother animations
  const navBarOpacity = scrollY.interpolate({
    inputRange: [0, headerHeight - 200, headerHeight - 180],
    outputRange: [0, 0, 1],
    extrapolate: "clamp",
  });

  const navBarTranslateY = scrollY.interpolate({
    inputRange: [0, headerHeight - 200, headerHeight - 180],
    outputRange: [-STICKY_NAV_HEIGHT, -STICKY_NAV_HEIGHT, 0],
    extrapolate: "clamp",
  });

  const categoryOpacity = scrollY.interpolate({
    inputRange: [headerHeight - 180, headerHeight - 160, headerHeight - 140],
    outputRange: [0, 0.5, 1],
    extrapolate: "clamp",
  });

  const categoryTranslateY = scrollY.interpolate({
    inputRange: [headerHeight - 180, headerHeight - 140],
    outputRange: [15, 0],
    extrapolate: "clamp",
  });

  const searchOpacity = scrollY.interpolate({
    inputRange: [headerHeight - 140, headerHeight - 120, headerHeight - 100],
    outputRange: [0, 0.5, 1],
    extrapolate: "clamp",
  });

  const searchTranslateY = scrollY.interpolate({
    inputRange: [headerHeight - 140, headerHeight - 100],
    outputRange: [15, 0],
    extrapolate: "clamp",
  });

  const navBarStyle = {
    opacity: navBarOpacity,
    transform: [{ translateY: navBarTranslateY }],
  };

  const stickyCategoryStyle = {
    opacity: categoryOpacity,
    transform: [{ translateY: categoryTranslateY }],
  };

  const searchBarStyle = {
    opacity: searchOpacity,
    transform: [{ translateY: searchTranslateY }],
  };

  // Update the stickySearchContainer component to prevent accidental interactions
  const Animated_TouchableOpacity =
    Animated.createAnimatedComponent(TouchableOpacity);

  // Create a function to render dish sections
  const renderDishSections = () => {
    // If search query exists, show simplified results without category sections
    if (searchQuery.trim() !== "") {
      if (filteredDishes.length === 0) {
        // Show "No dishes found" message when no results
        return (
          <View style={styles.noResultsContainer}>
            <Ionicons name="search-outline" size={50} color="#aaa" />
            <RNText style={styles.noResultsText}>No dishes found</RNText>
            <RNText style={styles.noResultsSubText}>
              Try a different search term
            </RNText>
          </View>
        );
      }

      // Show all filtered dishes in a single list without category headers
      return (
        <View style={styles.searchResultsContainer}>
          <RNText style={styles.searchResultsTitle}>
            Search Results ({filteredDishes.length})
          </RNText>
          {filteredDishes.map((dish) => (
            <View key={dish._id} style={styles.dishItem}>
              {renderDishItem({ item: dish })}
            </View>
          ))}
        </View>
      );
    }

    // Normal category-based view when not searching
    return categories.map((category) => (
      <View key={category} style={styles.categorySection}>
        <View ref={sectionRefs.current[category]} collapsable={false}>
          <RNText style={styles.categorySectionTitle}>{category}</RNText>
        </View>
        {filteredDishes
          .filter((dish) => dish.category === category)
          .map((dish) => (
            <View key={dish._id} style={styles.dishItem}>
              {renderDishItem({ item: dish })}
            </View>
          ))}
      </View>
    ));
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

  if (!restaurant) {
    return (
      <View
        style={[
          styles.errorContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <RNText style={styles.errorText}>Restaurant not found</RNText>
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

  const restaurantLocation = {
    latitude: restaurant.address?.coordinates?.lat,
    longitude: restaurant.address?.coordinates?.lng,
  };

  const isOpen = restaurant.openingHours && !restaurant.openingHours.isClosed;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Sticky Header */}
      <Animated.View
        style={[styles.stickyHeaderContainer]}
        pointerEvents="box-none"
      >
        {/* Navigation Bar with Back Button and Restaurant Name */}
        <Animated.View style={[styles.stickyNavBar, navBarStyle]}>
          <TouchableOpacity
            style={styles.stickyBackButton}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            activeOpacity={0.6}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <RNText style={styles.stickyRestaurantName} numberOfLines={1}>
            {restaurant?.name} ({restaurant.address.city})
          </RNText>
        </Animated.View>

        {/* Sticky Category Tabs with box-none to allow back button to work */}
        <Animated.View
          style={[styles.stickyCategoryTabsContainer, stickyCategoryStyle]}
          pointerEvents={categoryOpacity.__getValue() < 0.9 ? "none" : "auto"}
        >
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={categories}
            renderItem={renderCategoryTab}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.categoryTabsList}
          />
        </Animated.View>

        {/* Sticky Search Bar with box-none to allow back button to work */}
        <Animated.View
          style={[styles.stickySearchContainerOutside, searchBarStyle]}
          pointerEvents={searchOpacity.__getValue() < 0.9 ? "none" : "auto"}
        >
          <View style={styles.stickySearchContainer}>
            <Ionicons
              name="search"
              size={20}
              color="#888"
              style={styles.searchIcon}
            />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder="Search for items"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#888"
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
            />
          </View>
        </Animated.View>
      </Animated.View>

      {/* Scrollable Content */}
      <Animated.ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false, listener: handleScroll }
        )}
        scrollEventThrottle={16}
        style={{ zIndex: 1 }} // Lower z-index for scroll view
      >
        {/* Header Section - This will scroll */}
        <View onLayout={onHeaderLayout} style={{ zIndex: 5 }}>
          {/* Restaurant Header */}
          <View style={styles.header}>
            <Image
              source={{
                uri: restaurant.coverImageUrl || restaurant.imageUrls[0],
              }}
              style={styles.coverImage}
              resizeMode="cover"
            />

            {/* Move this outside of any animated containers */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              activeOpacity={0.6}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={theme.colors.white}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.favoriteButton}>
              <Ionicons
                name="heart-outline"
                size={24}
                color={theme.colors.white}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareButton}>
              <Ionicons
                name="share-social-outline"
                size={24}
                color={theme.colors.white}
              />
            </TouchableOpacity>

            {/* More Info Button */}
            <TouchableOpacity
              style={[
                styles.moreInfoButton,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={(e) => {
                // Prevent event bubbling
                e.stopPropagation();
                navigation.navigate("RestaurantInfo", {
                  restaurantId: restaurant._id,
                });
              }}
            >
              <Ionicons
                name="restaurant-outline"
                size={20}
                color={theme.colors.white}
              />
              <RNText
                style={[styles.moreInfoText, { color: theme.colors.white }]}
              >
                More Info
              </RNText>
            </TouchableOpacity>
          </View>

          {/* Restaurant Info */}
          <View style={styles.restaurantInfoContainer}>
            <RNText style={styles.openStatus}>
              {isOpen ? "Open" : "Closed"}
            </RNText>
            <RNText style={styles.restaurantName}>
              {restaurant.name} ({restaurant.address.city})
            </RNText>

            <RNText style={styles.cuisineType}>
              {restaurant.cuisineType || "Mixed Cuisine"}
            </RNText>

            <View style={styles.serviceTypesContainer}>
              {restaurant.serviceType?.delivery && (
                <View style={styles.serviceTypeItem}>
                  <Ionicons name="bicycle-outline" size={20} color="#444" />
                  <RNText style={styles.serviceTypeText}>Delivery</RNText>
                </View>
              )}
              {restaurant.serviceType?.pickup && (
                <View style={styles.serviceTypeItem}>
                  <MaterialIcons name="store" size={20} color="#444" />
                  <RNText style={styles.serviceTypeText}>Self Pickup</RNText>
                </View>
              )}
              {restaurant.serviceType?.dineIn && (
                <View style={styles.serviceTypeItem}>
                  <FontAwesome5 name="utensils" size={18} color="#444" />
                  <RNText style={styles.serviceTypeText}>Dine In</RNText>
                </View>
              )}
            </View>

            <View style={styles.deliveryInfoContainer}>
              <View style={styles.deliveryInfo}>
                <Ionicons
                  name="time-outline"
                  size={20}
                  color={theme.colors.gray}
                />
                <RNText style={styles.deliveryInfoText}>
                  {restaurant.estimatedPrepTime}min -{" "}
                  {restaurant.estimatedPrepTime + 10}min
                </RNText>
              </View>
            </View>
          </View>

          {/* Categories Header */}
          <View style={styles.categoriesHeaderContainer}>
            <RNText style={styles.categoriesHeaderText}>Categories</RNText>
          </View>

          {/* Regular Category Tabs */}
          <View style={styles.categoryTabsContainer}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={categories}
              renderItem={renderCategoryTab}
              keyExtractor={(item) => item}
              contentContainerStyle={styles.categoryTabsList}
            />
          </View>

          {/* Regular Search */}
          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={20}
              color="#888"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for items"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#888"
            />
          </View>
        </View>

        {/* Menu Content */}
        <View style={styles.menuContainer}>
          <View style={styles.menuHeaderContainer}>
            <Ionicons name="star" size={22} color="#222" />
            <RNText style={styles.menuHeaderText}>Menu</RNText>
          </View>

          {renderDishSections()}
        </View>
      </Animated.ScrollView>

      {/* Modals */}
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
                <RNText style={styles.modalTitle}>Added to Cart</RNText>
                <RNText style={styles.modalText}>
                  {currentItem?.name} has been added to your cart.
                </RNText>

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
            <RNText style={styles.modalTitle}>Clear Cart?</RNText>
            <RNText style={styles.modalText}>
              Your cart contains items from {cartRestaurant?.name}. Do you want
              to clear your cart and add items from {restaurant.name}?
            </RNText>

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
            <RNText style={styles.locationModalTitle}>
              Restaurant Location
            </RNText>

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
              <RNText style={styles.coordinatesText}>
                <RNText style={styles.coordinatesLabel}>Latitude: </RNText>
                {restaurantLocation.latitude.toFixed(6)}
              </RNText>
              <RNText style={styles.coordinatesText}>
                <RNText style={styles.coordinatesLabel}>Longitude: </RNText>
                {restaurantLocation.longitude.toFixed(6)}
              </RNText>
            </View>

            <View style={styles.addressContainer}>
              <RNText style={styles.addressLabel}>Address:</RNText>
              <RNText style={styles.addressValue}>
                {restaurant.address.street}, {restaurant.address.city},{" "}
                {restaurant.address.province}
              </RNText>
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
  cuisineType: {
    fontSize: 16,
    color: "#666",
    marginBottom: 12,
    fontStyle: "italic",
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
    zIndex: 5,
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
    zIndex: 200, // Very high z-index
  },
  favoriteButton: {
    position: "absolute",
    top: 15,
    right: 60,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 20,
    padding: 8,
  },
  shareButton: {
    position: "absolute",
    top: 15,
    right: 15,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 20,
    padding: 8,
  },
  restaurantInfoContainer: {
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 24,
  },
  openStatus: {
    fontSize: 16,
    color: "#4CAF50",
    fontWeight: "bold",
    marginBottom: 8,
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  serviceTypesContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  serviceTypeItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  serviceTypeText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#444",
  },
  deliveryInfoContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  deliveryInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  deliveryInfoText: {
    marginLeft: 4,
    fontSize: 14,
    color: "#666",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 25,
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginVertical: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 10,
    color: "#888",
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    padding: 0,
    height: 36,
  },

  // Regular category tabs
  categoryTabsContainer: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
    marginBottom: 10,
    paddingBottom: 5,
  },

  // Sticky Header styles
  stickyHeaderContainer: {
    position: "absolute",
    top: 20,
    left: 0,
    right: 0,
    zIndex: 100,
    pointerEvents: "box-none", // This allows touches to pass through to elements below
  },

  // Sticky Navigation Bar
  stickyNavBar: {
    height: STICKY_NAV_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    paddingTop: 5,
    zIndex: 150,
  },
  stickyBackButton: {
    padding: 10,
    marginRight: 12,
    borderRadius: 20,
    zIndex: 151,
  },
  stickyRestaurantName: {
    fontSize: 19,
    fontWeight: "bold",
    flex: 1,
    color: "#333",
  },

  // Sticky Category Tabs
  stickyCategoryTabsContainer: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
    paddingVertical: 10,
    height: STICKY_CATEGORY_HEIGHT,
    justifyContent: "center",
  },

  // Sticky Search
  stickySearchContainerOutside: {
    backgroundColor: "#FFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    zIndex: 100,
  },
  stickySearchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },

  // Categories header
  categoriesHeaderContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: "#fff",
  },
  categoriesHeaderText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },

  // Category tabs styling
  categoryTabsList: {
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  categoryTab: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginHorizontal: 6,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    minWidth: 100,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  activeCategoryTab: {
    // backgroundColor is added dynamically with theme.colors.primary
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#555",
  },
  activeCategoryText: {
    color: "#fff",
  },

  // Menu section styling improvements
  menuContainer: {
    padding: 16,
    paddingTop: 16,
  },
  menuHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  menuHeaderText: {
    fontSize: 22,
    fontWeight: "bold",
    marginLeft: 10,
    color: "#222",
  },
  categorySection: {
    marginBottom: 24,
  },
  categorySectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
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
  moreInfoButton: {
    position: "absolute",
    bottom: -18,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 10,
  },
  moreInfoText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "bold",
  },
  locationModal: {
    margin: 20,
    borderRadius: 16,
    padding: 16,
    height: "80%",
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
  noResultsContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    marginTop: 20,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#555",
    marginTop: 15,
  },
  noResultsSubText: {
    fontSize: 14,
    color: "#888",
    marginTop: 5,
  },
  searchResultsContainer: {
    paddingBottom: 20,
  },
  searchResultsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#555",
    marginBottom: 15,
  },
  unavailableContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  unavailableText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default RestaurantDetailScreen;
