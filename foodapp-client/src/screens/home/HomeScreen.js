import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  RefreshControl,
  Modal,
} from "react-native";
import { Text, Title, Paragraph, Divider } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useLocation } from "../../context/LocationContext";
import dataService from "../../services/dataService";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

// Import our new UI components
import SearchBar from "../../components/ui/SearchBar";
import FoodCard from "../../components/ui/FoodCard";
import HeroBanner from "../../components/ui/HeroBanner";
import GradientButton from "../../components/ui/GradientButton";

const { width } = Dimensions.get("window");

const HomeScreen = ({ navigation }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const {
    currentLocation,
    selectedAddress,
    setSelectedAddress,
    savedAddresses,
    setSavedAddresses,
    locationLoading,
    getCurrentLocation,
    addCustomLocation,
  } = useLocation();

  const [categories, setCategories] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [featuredRestaurants, setFeaturedRestaurants] = useState([]);
  const [popularItems, setPopularItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [locationError, setLocationError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  useEffect(() => {
    loadSavedAddresses();
    getCurrentLocation();
  }, []);

  // Set current location as default when available
  useEffect(() => {
    if (currentLocation && !selectedAddress) {
      setSelectedAddress({
        label: "Current Location",
        isCurrentLocation: true,
        ...currentLocation,
      });
    }
  }, [currentLocation]);

  useEffect(() => {
    if (selectedAddress) {
      fetchRestaurantsByLocation().catch(() => {
        // Silently catch any errors to prevent them from showing in the console
        setLocationError(true);
        setLoading(false);
      });
    } else {
      fetchData().catch(() => {
        // Silently catch any errors
        setLoading(false);
      });
    }
  }, [selectedAddress]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    if (selectedAddress) {
      fetchRestaurantsByLocation()
        .catch(() => {
          // Silently handle errors when refreshing
        })
        .finally(() => setRefreshing(false));
    } else {
      fetchData()
        .catch(() => {
          // Silently handle errors when refreshing
        })
        .finally(() => setRefreshing(false));
    }
  }, [selectedAddress]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoriesData, restaurantsData] = await Promise.all([
        dataService.getCategories(),
        dataService.getRestaurants(),
      ]);

      setCategories(categoriesData.categories);
      console.log("categoriesData", categoriesData);
      setRestaurants(restaurantsData.restaurants);

      // Set featured restaurants (restaurants with highest ratings)
      const featured = [...restaurantsData.restaurants]
        .sort((a, b) => {
          // Sort by whether they're open first, then by rating or other criteria
          const aOpen = !isRestaurantClosed(a);
          const bOpen = !isRestaurantClosed(b);

          if (aOpen !== bOpen) return bOpen - aOpen; // Open restaurants first

          // Then by rating if available, otherwise by name
          const aRating = a.rating || 0;
          const bRating = b.rating || 0;

          return bRating - aRating;
        })
        .slice(0, 3);
      setFeaturedRestaurants(featured);

      // Fetch dishes from the restaurants for Near You section
      await fetchNearbyDishes(restaurantsData.restaurants);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // New function to fetch nearby dishes
  const fetchNearbyDishes = async (restaurantsList) => {
    try {
      // Get dishes from the first 3 restaurants
      const dishPromises = restaurantsList.slice(0, 3).map((restaurant) =>
        dataService.getRestaurantDishes(restaurant._id).then((response) => {
          // Map dishes to include the restaurant information
          if (response && response.dishes) {
            return response.dishes.map((dish) => ({
              ...dish,
              id: dish._id, // Ensure unique ID
              restaurantId: restaurant._id,
              restaurantName: restaurant.name,
            }));
          }
          return [];
        })
      );

      // Wait for all dish requests to complete
      const dishesArrays = await Promise.all(dishPromises);

      // Flatten the arrays and take top 4-6 dishes
      const allDishes = dishesArrays.flat();

      // Sort dishes by popularity or rating if available
      const sortedDishes = allDishes
        .filter((dish) => dish.isAvailable !== false) // Filter out unavailable dishes
        .sort((a, b) => (b.popular === true) - (a.popular === true)); // Sort by popularity

      // Take top dishes
      const nearbyDishes = sortedDishes.slice(0, 6);

      if (nearbyDishes.length > 0) {
        setPopularItems(nearbyDishes);
      } else {
        // Fallback to default if no dishes found
        setPopularItems([
          {
            id: "1",
            name: "Double Cheeseburger",
            price: 12.99,
            category: "Burgers",
            imageUrl:
              "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          },
          // ... other default items
        ]);
      }
    } catch (error) {
      // Fallback to default popular items on error
      setPopularItems([
        {
          id: "1",
          name: "Double Cheeseburger",
          price: 12.99,
          category: "Burgers",
          imageUrl:
            "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        },
        // ... other default items
      ]);
    }
  };

  const fetchRestaurantsByLocation = async () => {
    if (!selectedAddress) return;

    try {
      setLoading(true);
      setLocationError(false); // Reset error state

      // Get categories
      let categoriesData;
      try {
        categoriesData = await dataService.getCategories();
        if (
          categoriesData &&
          categoriesData.success &&
          categoriesData.categories
        ) {
          setCategories(categoriesData.categories);
        }
      } catch {
        // Silently handle categories error
      }

      // Get restaurants - wrap in try/catch to silence API errors
      let restaurantsData;
      try {
        restaurantsData = await dataService.getRestaurantsByLocation(
          selectedAddress.latitude,
          selectedAddress.longitude,
          100 // Default delivery range set to 5km
        );
      } catch {
        // Handle 404 or other errors silently
        setLocationError(true);
        setRestaurants([]);
        setFeaturedRestaurants([]);
        setPopularItems([]);
        setLoading(false);
        return; // Exit early
      }

      if (
        restaurantsData &&
        restaurantsData.success &&
        restaurantsData.restaurants &&
        restaurantsData.restaurants.length > 0
      ) {
        // Process restaurant data to ensure it has all required fields
        const processedRestaurants = restaurantsData.restaurants.map(
          (restaurant) => {
            return {
              ...restaurant,
              // Convert MongoDB distance field (in km) to a displayable string with 1 decimal place
              distance: restaurant.distance
                ? `${restaurant.distance.toFixed(1)} km`
                : null,
              deliveryTime: calculateDeliveryTime(restaurant),
              // Add other default properties if they're missing from the API response
              rating:
                restaurant.rating ||
                (restaurant.reviews && restaurant.reviews.length > 0
                  ? (
                      restaurant.reviews.reduce(
                        (sum, review) => sum + review.rating,
                        0
                      ) / restaurant.reviews.length
                    ).toFixed(1)
                  : "New"),
              deliveryFee: calculateDeliveryFee(restaurant.distance || 0),
              minOrder: restaurant.minOrder || 10,
            };
          }
        );

        setRestaurants(processedRestaurants);
        setLocationError(false);

        // Set featured restaurants with distance info
        const featured = [...processedRestaurants]
          .sort((a, b) => {
            // Sort by whether they're open first
            const aOpen = !isRestaurantClosed(a);
            const bOpen = !isRestaurantClosed(b);

            if (aOpen !== bOpen) return bOpen - aOpen; // Open restaurants first

            // Then by distance
            const aDistance =
              typeof a.distance === "string"
                ? parseFloat(a.distance.replace(" km", ""))
                : parseFloat(a.distance || 0);

            const bDistance =
              typeof b.distance === "string"
                ? parseFloat(b.distance.replace(" km", ""))
                : parseFloat(b.distance || 0);

            return aDistance - bDistance;
          })
          .slice(0, 3);
        setFeaturedRestaurants(featured);

        // Fetch dishes from nearby restaurants for the "Dishes Near You" section
        try {
          await fetchNearbyDishes(processedRestaurants);
        } catch {
          // Silently handle dish fetch errors
          setPopularItems([]);
        }
      } else {
        // If no nearby restaurants are found, set error state
        setLocationError(true);
        setRestaurants([]);
        setFeaturedRestaurants([]);
        setPopularItems([]);
      }
    } catch (error) {
      // Handle all other errors silently
      setLocationError(true);
      setRestaurants([]);
      setFeaturedRestaurants([]);
      setPopularItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to calculate delivery time based on distance and restaurant prep time
  const calculateDeliveryTime = (restaurant) => {
    // Base delivery time calculation
    const distance = parseFloat(restaurant.distance || 0);
    // Estimated prep time from restaurant, default to 15 minutes
    const prepTime = restaurant.estimatedPrepTime || 15;

    // Calculate delivery time: prep time + (distance * avg speed)
    // Assuming average delivery speed of 18 km/h (0.3 km/min)
    const deliveryMinutes = Math.round(prepTime + distance / 0.3);

    // Add a 10-minute range
    const minTime = Math.max(10, deliveryMinutes - 5);
    const maxTime = deliveryMinutes + 5;

    return `${minTime}-${maxTime} min`;
  };

  // Helper function to calculate delivery fee based on distance
  const calculateDeliveryFee = (distance) => {
    // Base fee
    const baseFee = 2.99;
    const distanceKm = parseFloat(distance);

    // If distance > 3km, add $0.50 per additional km
    const additionalFee = distanceKm > 3 ? (distanceKm - 3) * 0.5 : 0;

    // Round to 2 decimal places and ensure it's a string with 2 decimals
    return (baseFee + additionalFee).toFixed(2);
  };

  const loadSavedAddresses = async () => {
    try {
      const response = await dataService.getUserAddresses();
      if (response.success) {
        setSavedAddresses(response.addresses);
      }
    } catch (error) {
      // Error handling for saved addresses
    }
  };

  const isRestaurantClosed = (restaurant) => {
    if (!restaurant.openingHours) return false;

    // If the restaurant is explicitly marked as closed
    if (restaurant.openingHours.isClosed) return true;

    // Check if current time is outside opening hours
    if (restaurant.openingHours.open && restaurant.openingHours.close) {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes(); // current time in minutes

      // Convert opening hours to minutes for comparison
      const [openHour, openMinute] = restaurant.openingHours.open
        .split(":")
        .map(Number);
      const [closeHour, closeMinute] = restaurant.openingHours.close
        .split(":")
        .map(Number);

      const openTime = openHour * 60 + openMinute;
      const closeTime = closeHour * 60 + closeMinute;

      // Check if current time is outside opening hours
      if (currentTime < openTime || currentTime > closeTime) {
        return true;
      }
    }

    return false;
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate("Search", { searchQuery });
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const handleAddressSelect = (address) => {
    if (address.isCurrentLocation) {
      setSelectedAddress(address);
    } else {
      setSelectedAddress(() => {
        return {
          ...address,
          latitude: address.coordinates.lat,
          longitude: address.coordinates.lng,
        };
      });
    }
    setLocationModalVisible(false);
  };

  const handleSetOnMap = () => {
    setLocationModalVisible(false);
    navigation.navigate("LocationMap", {
      onLocationSelect: (location) => {
        addCustomLocation({
          ...location,
          isCustom: true,
        });
      },
    });
  };

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        { backgroundColor: theme.colors.card, ...theme.shadow.small },
      ]}
      onPress={() => navigation.navigate("Search", { searchQuery: item.name })}
    >
      <View style={styles.categoryImageContainer}>
        <Image source={{ uri: item.image }} style={styles.categoryImage} />
      </View>
      <Text style={[styles.categoryName, { color: theme.colors.text }]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderPopularItem = ({ item }) => (
    <FoodCard
      item={{
        ...item,
        price:
          item.price ||
          (item.portions && item.portions.length > 0
            ? item.portions[0].price
            : 0),
        imageUrl:
          item.imageUrls && item.imageUrls.length > 0
            ? item.imageUrls[0]
            : item.imageUrl,
        category: item.category || item.categoryName,
      }}
      onPress={() => {
        // Navigate to dish detail screen
        navigation.navigate("RestaurantDetail", {
          restaurantId: item.restaurantId,
          dishId: item.id || item._id,
        });
      }}
      isTrending={item.popular === true}
    />
  );

  const renderHeader = () => (
    <>
      {/* User greeting and location */}
      <View style={styles.headerContainer}>
        <View>
          <Text style={[styles.greeting, { color: theme.colors.text }]}>
            {getGreeting()}
          </Text>
          <Text style={[styles.username, { color: theme.colors.text }]}>
            {user?.name || "Guest"}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.locationButton,
            {
              backgroundColor:
                theme.mode === "light" ? "#FFFFFF" : theme.colors.surface,
            },
          ]}
          onPress={() => setLocationModalVisible(true)}
        >
          <Ionicons name="location" size={16} color={theme.colors.primary} />
          <Text
            style={[styles.locationText, { color: theme.colors.text }]}
            numberOfLines={1}
          >
            {selectedAddress
              ? selectedAddress.label ||
                (selectedAddress.isCurrentLocation
                  ? "Current Location"
                  : selectedAddress.street ||
                    selectedAddress.address ||
                    "Selected Location")
              : "Set Location"}
          </Text>
          <Ionicons name="chevron-down" size={16} color={theme.colors.gray} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => navigation.navigate("Search")}
      >
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmit={handleSearch}
          onClear={handleClearSearch}
          editable={false} // Make the input field not directly editable
          style={styles.SearchBar}
        />
      </TouchableOpacity>

      {/* Hero Banner */}
      {featuredRestaurants.length > 0 && (
        <HeroBanner
          imageUrl={featuredRestaurants[0].coverImageUrl}
          title={featuredRestaurants[0].name}
          subtitle={`${featuredRestaurants[0].cuisineType} • ${
            featuredRestaurants[0].distance
              ? `${featuredRestaurants[0].distance}`
              : "Delivery Available"
          }`}
          onPress={() =>
            navigation.navigate("RestaurantDetail", {
              restaurantId: featuredRestaurants[0]._id,
            })
          }
        />
      )}

      {!locationError && (
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Categories
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Search")}>
              <Text
                style={[styles.seeAllText, { color: theme.colors.primary }]}
              >
                See All
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
  );

  const renderPopularItemsSection = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Dishes Near You
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Search")}>
          <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>
            See All
          </Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={popularItems}
        renderItem={renderPopularItem}
        keyExtractor={(item) => item.id || item._id || Math.random().toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.popularItemsList}
      />
    </View>
  );

  const renderRestaurantsSection = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Nearby Restaurants
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Search")}>
          <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>
            See All
          </Text>
        </TouchableOpacity>
      </View>

      {/* Restaurant list or grid will be rendered here */}
      {/* For this example, we'll just use a placeholder */}
      <Text style={{ color: theme.colors.gray, marginLeft: 16 }}>
        Coming soon...
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

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar
        barStyle={theme.mode === "dark" ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.background}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderHeader()}

        {/* No Restaurant Error Message */}
        {locationError && (
          <View style={styles.errorContainer}>
            <MaterialIcons
              name="location-off"
              size={48}
              color={theme.colors.error}
            />
            <Text style={[styles.errorTitle, { color: theme.colors.text }]}>
              There are no restaurants nearby
            </Text>
            <Text style={[styles.errorMessage, { color: theme.colors.gray }]}>
              Try to change your location or increase the delivery range
            </Text>
            <GradientButton
              title="Change Location"
              onPress={() => setLocationModalVisible(true)}
              style={styles.errorButton}
            />
          </View>
        )}

        {!locationError && (
          <>
            {/* Categories Horizontal List */}
            <FlatList
              data={categories}
              renderItem={renderCategory}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesList}
            />

            {renderPopularItemsSection()}
            {renderRestaurantsSection()}
          </>
        )}

        {/* Extra space at bottom for the tab bar */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Location Modal */}
      <Modal
        visible={locationModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setLocationModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContainer,
              { backgroundColor: theme.colors.background },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Delivery Location
              </Text>
              <TouchableOpacity onPress={() => setLocationModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <Divider />

            <ScrollView style={styles.locationsList}>
              {/* Current Location Option */}
              {currentLocation && (
                <TouchableOpacity
                  style={[
                    styles.locationItem,
                    selectedAddress?.isCurrentLocation &&
                      styles.selectedLocationItem,
                  ]}
                  onPress={() =>
                    handleAddressSelect({
                      label: "Current Location",
                      latitude: currentLocation.latitude,
                      longitude: currentLocation.longitude,
                      isCurrentLocation: true,
                    })
                  }
                >
                  <View style={styles.locationLeftSection}>
                    <View
                      style={[
                        styles.locationIconContainer,
                        { backgroundColor: theme.colors.primaryLight },
                      ]}
                    >
                      <Ionicons
                        name="navigate"
                        size={18}
                        color={theme.colors.primary}
                      />
                    </View>
                    <View style={styles.locationInfo}>
                      <Text
                        style={[
                          styles.locationLabel,
                          { color: theme.colors.text },
                        ]}
                      >
                        Current Location
                      </Text>
                      <Text
                        style={[
                          styles.locationAddress,
                          { color: theme.colors.gray },
                        ]}
                        numberOfLines={1}
                      >
                        {locationLoading
                          ? "Getting your location..."
                          : "Using your device's location"}
                      </Text>
                    </View>
                  </View>
                  {selectedAddress?.isCurrentLocation && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={theme.colors.primary}
                    />
                  )}
                </TouchableOpacity>
              )}

              {/* Set on Map option */}
              <TouchableOpacity
                style={[
                  styles.locationItem,
                  selectedAddress?.isCustom && styles.selectedLocationItem,
                ]}
                onPress={handleSetOnMap}
              >
                <View style={styles.locationLeftSection}>
                  <View
                    style={[
                      styles.locationIconContainer,
                      { backgroundColor: theme.colors.primaryLight },
                    ]}
                  >
                    <Ionicons
                      name="map"
                      size={18}
                      color={theme.colors.primary}
                    />
                  </View>
                  <View style={styles.locationInfo}>
                    <Text
                      style={[
                        styles.locationLabel,
                        { color: theme.colors.text },
                      ]}
                    >
                      {selectedAddress
                        ? "Change location on map"
                        : "Set location on map"}
                    </Text>
                    <Text
                      style={[
                        styles.locationAddress,
                        { color: theme.colors.gray },
                      ]}
                      numberOfLines={1}
                    >
                      {selectedAddress?.isCustom
                        ? "Custom location is currently selected"
                        : "Select a precise location on the map"}
                    </Text>
                  </View>
                </View>
                {selectedAddress?.isCustom && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={theme.colors.primary}
                  />
                )}
              </TouchableOpacity>

              {/* Saved Addresses */}
              {savedAddresses && savedAddresses.length > 0 && (
                <>
                  <View style={styles.sectionDivider}>
                    <Text
                      style={[
                        styles.sectionLabel,
                        { color: theme.colors.gray },
                      ]}
                    >
                      Saved Addresses
                    </Text>
                  </View>
                  {savedAddresses.map((address, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.locationItem,
                        selectedAddress?._id === address._id &&
                          styles.selectedLocationItem,
                      ]}
                      onPress={() => handleAddressSelect(address)}
                    >
                      <View style={styles.locationLeftSection}>
                        <View
                          style={[
                            styles.locationIconContainer,
                            { backgroundColor: theme.colors.primaryLight },
                          ]}
                        >
                          <Ionicons
                            name={
                              address.type === "home"
                                ? "home"
                                : address.type === "work"
                                ? "briefcase"
                                : "location"
                            }
                            size={18}
                            color={theme.colors.primary}
                          />
                        </View>
                        <View style={styles.locationInfo}>
                          <Text
                            style={[
                              styles.locationLabel,
                              { color: theme.colors.text },
                            ]}
                          >
                            {address.label ||
                              (address.type === "home"
                                ? "Home"
                                : address.type === "work"
                                ? "Work"
                                : "Saved Address")}
                          </Text>
                          <Text
                            style={[
                              styles.locationAddress,
                              { color: theme.colors.gray },
                            ]}
                            numberOfLines={1}
                          >
                            {address.street ||
                              address.address ||
                              "No address details"}
                            {address.city ? `, ${address.city}` : ""}
                          </Text>
                        </View>
                      </View>
                      {selectedAddress?._id === address._id && (
                        <Ionicons
                          name="checkmark-circle"
                          size={24}
                          color={theme.colors.primary}
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </>
              )}

              {/* Add New Address */}
              <TouchableOpacity
                style={styles.addLocationButton}
                onPress={() => {
                  setLocationModalVisible(false);
                  navigation.navigate("AddressForm");
                }}
              >
                <View
                  style={[
                    styles.locationIconContainer,
                    { backgroundColor: theme.colors.primaryLight },
                  ]}
                >
                  <Ionicons name="add" size={18} color={theme.colors.primary} />
                </View>
                <Text
                  style={[styles.addLocationText, { color: theme.colors.text }]}
                >
                  Add a new address
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
  },
  username: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    fontWeight: "700",
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    maxWidth: width * 0.45,
  },
  locationText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    marginHorizontal: 4,
  },
  sectionContainer: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    fontWeight: "700",
  },
  seeAllText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
  },
  categoriesList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryItem: {
    alignItems: "center",
    marginRight: 16,
    borderRadius: 12,
    padding: 10,
    width: 80,
  },
  categoryImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginBottom: 8,
  },
  categoryImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  categoryName: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    textAlign: "center",
  },
  popularItemsList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  bottomPadding: {
    height: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    fontWeight: "700",
  },
  locationsList: {
    padding: 16,
    maxHeight: 400,
  },
  locationItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  selectedLocationItem: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  locationLeftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  locationIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
  },
  addLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
  },
  addLocationText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    marginLeft: 12,
  },
  sectionDivider: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    marginTop: 8,
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
  },
  SearchBar: {
    marginLeft: 20,
    marginRight: 20,
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    marginTop: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    marginTop: 16,
    textAlign: "center",
  },
  errorMessage: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    marginTop: 8,
    textAlign: "center",
    marginBottom: 20,
  },
  errorButton: {
    marginTop: 16,
    width: "80%",
  },
});

export default HomeScreen;
