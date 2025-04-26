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
  ImageBackground,
} from "react-native";
import {
  Text,
  Searchbar,
  Card,
  Title,
  Paragraph,
  Button,
  Modal,
  Portal,
  List,
  Divider,
  Avatar,
  Chip,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import dataService from "../../services/dataService";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useLocation } from "../../context/LocationContext";

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

  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [featuredRestaurants, setFeaturedRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationModalVisible, setLocationModalVisible] = useState(false);

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

  useEffect(() => {
    if (selectedAddress) {
      fetchRestaurantsByLocation();
    } else {
      fetchData();
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
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRestaurantsByLocation = async () => {
    if (!selectedAddress) return;

    try {
      setLoading(true);
      const [categoriesData, restaurantsData] = await Promise.all([
        dataService.getCategories(),
        dataService.getRestaurantsByLocation(
          selectedAddress.latitude,
          selectedAddress.longitude,
          5 // Default delivery range set to 5km
        ),
      ]);

      setCategories(categoriesData.categories);

      if (restaurantsData.success) {
        setRestaurants(restaurantsData.restaurants);

        // Set featured restaurants with distance info
        const featured = [...restaurantsData.restaurants]
          .sort((a, b) => {
            // Sort by whether they're open first
            const aOpen = !isRestaurantClosed(a);
            const bOpen = !isRestaurantClosed(b);

            if (aOpen !== bOpen) return bOpen - aOpen; // Open restaurants first

            // Then by distance (restaurants are already sorted by distance from API)
            return parseFloat(a.distance || 0) - parseFloat(b.distance || 0);
          })
          .slice(0, 3);
        setFeaturedRestaurants(featured);
      } else {
        // If no nearby restaurants are found, fall back to all restaurants
        console.log(
          "No nearby restaurants found, falling back to all restaurants"
        );
        fetchData();
      }
    } catch (error) {
      console.error("Error fetching data by location:", error);
      // Fall back to fetching all restaurants on error
      fetchData();
    } finally {
      setLoading(false);
    }
  };

  const loadSavedAddresses = async () => {
    try {
      const response = await dataService.getUserAddresses();
      if (response.success) {
        setSavedAddresses(response.addresses);

        // Set default address if available
        const defaultAddress = response.addresses.find(
          (addr) => addr.isDefault
        );
        if (defaultAddress) {
          setSelectedAddress(defaultAddress);
        }
      }
    } catch (error) {
      console.error("Error loading saved addresses:", error);
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

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchData();
      return;
    }

    try {
      setLoading(true);
      const results = await dataService.searchRestaurants(searchQuery);
      setRestaurants(results);
    } catch (error) {
      console.error("Error searching restaurants:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setLocationModalVisible(false);
    // Restaurants will be fetched in the useEffect based on selected address
  };

  const handleSetOnMap = () => {
    setLocationModalVisible(false);
    // Navigate to map screen to select location
    navigation.navigate("LocationMap", {
      onLocationSelect: (location) => {
        addCustomLocation(location);
      },
    });
  };

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() =>
        navigation.navigate("Restaurants", { categoryId: item.id })
      }
    >
      <View style={[styles.categoryImageContainer, { ...theme.shadow.small }]}>
        <Image source={{ uri: item.image }} style={styles.categoryImage} />
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderRestaurantCard = (restaurant, featured = false) => {
    const isClosed = isRestaurantClosed(restaurant);
    const showServiceTypes =
      restaurant.serviceTypes &&
      !(restaurant.serviceTypes.delivery && restaurant.serviceTypes.pickup);

    return (
      <Card
        style={[
          styles.restaurantCard,
          { ...theme.shadow.small },
          featured && styles.featuredCard,
          isClosed && styles.closedRestaurantCard,
        ]}
        onPress={() => {
          if (!isClosed) {
            navigation.navigate("RestaurantDetail", {
              restaurantId: restaurant._id,
            });
          }
        }}
      >
        {featured && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredText}>Featured</Text>
          </View>
        )}

        <Card.Cover
          source={{ uri: restaurant.coverImageUrl }}
          style={[
            styles.restaurantImage,
            featured && styles.featuredImage,
            isClosed && styles.closedImage,
          ]}
        />

        {isClosed && (
          <View style={styles.closedOverlay}>
            <Text style={styles.closedText}>CLOSED</Text>
            {restaurant.openingHours?.open && (
              <Text style={styles.openingHoursText}>
                Opens at {restaurant.openingHours.open}
              </Text>
            )}
          </View>
        )}

        <Card.Content style={styles.restaurantCardContent}>
          <Title style={styles.restaurantName}>{restaurant.name}</Title>

          <View style={styles.restaurantInfo}>
            {restaurant.cuisineType && (
              <Text style={styles.restaurantType}>
                {restaurant.cuisineType}
              </Text>
            )}

            {restaurant.estimatedPrepTime && (
              <View style={styles.prepTimeContainer}>
                <Ionicons
                  name="time-outline"
                  size={14}
                  color={theme.colors.gray}
                />
                <Text style={styles.prepTimeText}>
                  {restaurant.estimatedPrepTime} min
                </Text>
              </View>
            )}

            {/* Display distance when available */}
            {restaurant.distance && (
              <View style={styles.distanceContainer}>
                <Ionicons
                  name="location-outline"
                  size={14}
                  color={theme.colors.gray}
                />
                <Text style={styles.distanceText}>
                  {restaurant.distance} km
                </Text>
              </View>
            )}
          </View>

          {restaurant.openingHours?.open && restaurant.openingHours?.close && (
            <Text style={styles.hoursText}>
              Hours: {restaurant.openingHours.open} -{" "}
              {restaurant.openingHours.close}
            </Text>
          )}

          {showServiceTypes && (
            <View style={styles.serviceTypeContainer}>
              {restaurant.serviceTypes?.delivery && (
                <Chip
                  style={styles.serviceChip}
                  textStyle={styles.serviceChipText}
                  icon="bike"
                >
                  Delivery
                </Chip>
              )}

              {restaurant.serviceTypes?.pickup && (
                <Chip
                  style={styles.serviceChip}
                  textStyle={styles.serviceChipText}
                  icon="shopping"
                >
                  Pickup
                </Chip>
              )}
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  const renderLocationModal = () => (
    <Portal>
      <Modal
        visible={locationModalVisible}
        onDismiss={() => setLocationModalVisible(false)}
        contentContainerStyle={styles.locationModal}
      >
        <View style={styles.locationModalHeader}>
          <Text style={styles.locationModalTitle}>Choose Location</Text>
          <TouchableOpacity onPress={() => setLocationModalVisible(false)}>
            <Ionicons name="close" size={24} color={theme.colors.gray} />
          </TouchableOpacity>
        </View>

        <Divider />

        <ScrollView style={styles.locationList}>
          {/* Current Location */}
          {currentLocation && (
            <>
              <TouchableOpacity
                style={styles.locationOption}
                onPress={() =>
                  handleAddressSelect({
                    label: "Current Location",
                    isCurrentLocation: true,
                    ...currentLocation,
                  })
                }
              >
                <View style={styles.locationOptionIcon}>
                  <Ionicons name="locate" size={24} color="#000" />
                </View>
                <View style={styles.locationOptionContent}>
                  <Text style={styles.locationOptionTitle}>
                    Your current location
                  </Text>
                </View>
                {selectedAddress?.isCurrentLocation && (
                  <Ionicons
                    name="checkmark"
                    size={24}
                    color={theme.colors.primary}
                  />
                )}
              </TouchableOpacity>
              <Divider />
            </>
          )}

          {/* Set on map */}
          <TouchableOpacity
            style={styles.locationOption}
            onPress={handleSetOnMap}
          >
            <View style={styles.locationOptionIcon}>
              <Ionicons name="map" size={24} color="#000" />
            </View>
            <View style={styles.locationOptionContent}>
              <Text style={styles.locationOptionTitle}>Set on map</Text>
            </View>
            {selectedAddress?.isCustom && (
              <Ionicons
                name="checkmark"
                size={24}
                color={theme.colors.primary}
              />
            )}
          </TouchableOpacity>
          <Divider />

          {/* Saved Addresses */}
          {savedAddresses.length > 0 ? (
            <>
              {savedAddresses.map((address) => (
                <React.Fragment key={address._id}>
                  <TouchableOpacity
                    style={styles.locationOption}
                    onPress={() => handleAddressSelect(address)}
                  >
                    <View style={styles.locationOptionIcon}>
                      <Ionicons
                        name={
                          address.label.toLowerCase().includes("home")
                            ? "home"
                            : address.label.toLowerCase().includes("work")
                            ? "briefcase"
                            : "location"
                        }
                        size={24}
                        color="#000"
                      />
                    </View>
                    <View style={styles.locationOptionContent}>
                      <Text style={styles.locationOptionTitle}>
                        {address.label}
                      </Text>
                      <Text style={styles.locationOptionAddress}>
                        {address.street}, {address.city}
                      </Text>
                    </View>
                    {selectedAddress?._id === address._id && (
                      <Ionicons
                        name="checkmark"
                        size={24}
                        color={theme.colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                  <Divider />
                </React.Fragment>
              ))}
            </>
          ) : null}

          {/* Add Address */}
          <TouchableOpacity
            style={styles.locationOption}
            onPress={() => {
              setLocationModalVisible(false);
              navigation.navigate("Profile", {
                screen: "SavedAddresses",
                params: { addNew: true },
              });
            }}
          >
            <View style={styles.locationOptionIcon}>
              <Ionicons name="add-circle" size={24} color="#000" />
            </View>
            <View style={styles.locationOptionContent}>
              <Text style={styles.locationOptionTitle}>Add New Address</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#757575" />
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </Portal>
  );

  const renderPromoSection = () => (
    <View style={styles.promoSection}>
      <ImageBackground
        source={{
          uri: "https://img.freepik.com/free-photo/top-view-table-full-delicious-food-composition_23-2149141352.jpg",
        }}
        style={styles.promoBg}
        imageStyle={{ borderRadius: 12, opacity: 0.8 }}
      >
        <View style={styles.promoContent}>
          <Text style={styles.promoTitle}>Special Offers</Text>
          <Text style={styles.promoSubtitle}>Up to 40% Off Today</Text>
          <Button
            mode="contained"
            onPress={() => {}}
            style={styles.promoButton}
            labelStyle={styles.promoButtonLabel}
          >
            Explore Deals
          </Button>
        </View>
      </ImageBackground>
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

  const greeting = getGreeting();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {renderLocationModal()}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Updated header with time-based greeting */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>
              Hello, {user?.name || "Guest"}
            </Text>
            <Text style={styles.greetingText}>{greeting}</Text>
            <TouchableOpacity
              style={styles.locationSelector}
              onPress={() => setLocationModalVisible(true)}
            >
              <Ionicons
                name="location"
                size={16}
                color={theme.colors.primary}
              />
              <Text style={styles.locationText} numberOfLines={1}>
                {selectedAddress
                  ? selectedAddress.isCurrentLocation
                    ? "Current Location"
                    : selectedAddress.isCustom
                    ? selectedAddress.label || "Custom Location"
                    : `${selectedAddress.label}: ${selectedAddress.street}`
                  : "Select Location"}
              </Text>
              <Ionicons
                name="chevron-down"
                size={16}
                color={theme.colors.gray}
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
            <Image
              source={
                user?.profilePicture
                  ? { uri: user.profilePicture }
                  : {
                      uri: "https://png.pngtree.com/png-vector/20220708/ourmid/pngtree-fast-food-logo-png-image_5763171.png",
                    }
              }
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>

        <Searchbar
          placeholder="Search for restaurants or dishes"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={[styles.searchBar, { ...theme.shadow.small }]}
          iconColor={theme.colors.primary}
          onSubmitEditing={handleSearch}
          onIconPress={handleSearch}
        />

        {renderPromoSection()}

        <Text style={styles.sectionTitle}>Categories</Text>
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />

        <Text style={styles.sectionTitle}>Featured Restaurants</Text>
        <View style={styles.featuredContainer}>
          {featuredRestaurants.length > 0 ? (
            featuredRestaurants.map((restaurant, index) => (
              <View key={restaurant._id} style={styles.featuredItem}>
                {renderRestaurantCard(restaurant, true)}
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>
              No featured restaurants available
            </Text>
          )}
        </View>

        <View style={styles.allRestaurantsHeader}>
          <Text style={styles.sectionTitle}>All Restaurants</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Restaurants")}>
            <Text style={[styles.viewAllText, { color: theme.colors.primary }]}>
              View All
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.allRestaurantsContainer}>
          {restaurants?.length > 0 ? (
            restaurants.slice(0, 6).map((restaurant) => (
              <View key={restaurant._id} style={styles.restaurantItem}>
                {renderRestaurantCard(restaurant)}
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No restaurants available</Text>
          )}
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
    paddingHorizontal: 16,
    paddingBottom: 20,
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
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  greetingText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  locationSelector: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    maxWidth: width * 0.7,
  },
  locationText: {
    fontSize: 14,
    color: "#666",
    marginHorizontal: 4,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#eee",
  },
  searchBar: {
    marginBottom: 20,
    borderRadius: 12,
    elevation: 2,
  },
  promoSection: {
    height: 150,
    marginBottom: 20,
    borderRadius: 12,
    overflow: "hidden",
  },
  promoBg: {
    flex: 1,
    justifyContent: "center",
  },
  promoContent: {
    paddingHorizontal: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    height: "100%",
    justifyContent: "center",
  },
  promoTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  promoSubtitle: {
    color: "white",
    fontSize: 16,
    marginBottom: 16,
  },
  promoButton: {
    alignSelf: "flex-start",
    borderRadius: 20,
  },
  promoButtonLabel: {
    fontSize: 14,
    paddingHorizontal: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 12,
  },
  categoriesList: {
    paddingVertical: 5,
  },
  categoryItem: {
    marginRight: 15,
    alignItems: "center",
    width: 80,
  },
  categoryImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: "hidden",
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryImage: {
    width: "100%",
    height: "100%",
    borderRadius: 35,
    resizeMode: "cover",
  },
  categoryName: {
    textAlign: "center",
    fontSize: 12,
  },
  featuredContainer: {
    marginBottom: 15,
  },
  featuredItem: {
    marginBottom: 15,
  },
  featuredCard: {
    borderRadius: 16,
  },
  featuredImage: {
    height: 180,
    width: "100%",
    resizeMode: "cover",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  featuredBadge: {
    position: "absolute",
    top: 15,
    left: 15,
    backgroundColor: "rgba(255, 100, 0, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    zIndex: 1,
  },
  featuredText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  allRestaurantsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "500",
  },
  allRestaurantsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  restaurantItem: {
    width: "48%",
    marginBottom: 15,
  },
  restaurantCard: {
    borderRadius: 12,
    overflow: "hidden",
  },
  closedRestaurantCard: {
    opacity: 0.8,
    borderColor: "#ccc",
    borderWidth: 1,
  },
  restaurantImage: {
    height: 120,
    width: "100%",
    resizeMode: "cover",
  },
  closedImage: {
    opacity: 0.6,
  },
  closedOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  closedText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  openingHoursText: {
    color: "white",
    fontSize: 12,
    marginTop: 4,
  },
  restaurantCardContent: {
    padding: 8,
  },
  restaurantName: {
    fontSize: 16,
    marginVertical: 4,
  },
  restaurantInfo: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 4,
  },
  restaurantRating: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  ratingText: {
    marginLeft: 2,
    fontSize: 12,
  },
  restaurantType: {
    fontSize: 12,
    marginRight: 8,
    color: "#666",
  },
  prepTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  prepTimeText: {
    marginLeft: 4,
    fontSize: 12,
    color: "#666",
  },
  hoursText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  serviceTypeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  serviceChip: {
    marginRight: 4,
    height: 24,
    backgroundColor: "#f0f0f0",
  },
  serviceChipText: {
    fontSize: 10,
  },
  emptyText: {
    color: "#666",
    textAlign: "center",
    padding: 20,
  },
  locationModal: {
    backgroundColor: "white",
    margin: 0,
    marginTop: 50,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    flex: 1,
  },
  locationModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  locationModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  locationList: {
    flex: 1,
  },
  locationOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  locationOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  locationOptionContent: {
    flex: 1,
  },
  locationOptionTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  locationOptionAddress: {
    fontSize: 14,
    color: "#757575",
    marginTop: 2,
  },
  distanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  distanceText: {
    marginLeft: 4,
    fontSize: 12,
    color: "#666",
  },
});

export default HomeScreen;
