import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import {
  Text,
  Card,
  Title,
  Searchbar,
  Chip,
  Badge,
  Button,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { useLocation } from "../../context/LocationContext";
import dataService from "../../services/dataService";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

const RestaurantsScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const { selectedAddress, deliveryRange } = useLocation();

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [locationBased, setLocationBased] = useState(false);
  const [error, setError] = useState(null);

  // Create theme-dependent styles inside the component
  const themedStyles = {
    promotionText: {
      color: theme.colors.primary,
      fontWeight: "600",
      marginLeft: 6,
    },
    locationDisclaimerContainer: {
      backgroundColor: theme.colors.primary + "15",
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.primary,
    },
    locationDisclaimerText: {
      color: theme.colors.text,
    },
    locationName: {
      color: theme.colors.primary,
      fontWeight: "bold",
    },
    changeLocationText: {
      color: theme.colors.primary,
    },
    errorText: {
      color: theme.colors.error,
    },
    errorContainer: {
      backgroundColor: theme.colors.errorContainer || "#FFEBEE",
      borderRadius: 8,
      padding: 16,
      marginVertical: 8,
    },
    changeLocationButton: {
      backgroundColor: theme.colors.primary,
      marginTop: 16,
    },
  };

  useEffect(() => {
    loadData();
  }, [selectedAddress]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      let restaurantsData;

      // Check if location is available and fetch restaurants by location
      if (
        selectedAddress &&
        selectedAddress.latitude &&
        selectedAddress.longitude
      ) {
        try {
          restaurantsData = await dataService.getRestaurantsByLocation(
            selectedAddress.latitude,
            selectedAddress.longitude,
            deliveryRange || 5
          );

          if (
            restaurantsData.success &&
            restaurantsData.restaurants &&
            restaurantsData.restaurants.length > 0
          ) {
            setLocationBased(true);
            setRestaurants(restaurantsData.restaurants);
          } else {
            // No restaurants found near location
            setLocationBased(true);
            setRestaurants([]);
            setError({
              message: "No restaurants found near your location.",
              type: "location",
            });
          }
        } catch (locationError) {
          console.error(
            "Error fetching restaurants by location:",
            locationError
          );
          // Fall back to all restaurants if location-based search fails
          restaurantsData = await dataService.getRestaurants();
          setLocationBased(false);

          if (
            restaurantsData.restaurants &&
            restaurantsData.restaurants.length > 0
          ) {
            setRestaurants(restaurantsData.restaurants);
          } else {
            setRestaurants([]);
            setError({
              message: "Failed to fetch restaurants. Please try again later.",
              type: "general",
            });
          }
        }
      } else {
        // If no location is set, get all restaurants
        restaurantsData = await dataService.getRestaurants();
        setLocationBased(false);

        if (
          restaurantsData.restaurants &&
          restaurantsData.restaurants.length > 0
        ) {
          setRestaurants(restaurantsData.restaurants);
        } else {
          setRestaurants([]);
          setError({
            message: "No restaurants available at this time.",
            type: "general",
          });
        }
      }
    } catch (error) {
      console.error("Error loading restaurants:", error);
      setRestaurants([]);
      setError({
        message: "Failed to load restaurants. Please try again.",
        type: "general",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = async () => {
    // Navigate to dedicated search screen instead of performing search here
    navigation.navigate("Search");
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleChangeLocation = () => {
    navigation.navigate("Home");
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

  const renderRestaurantItem = ({ item }) => {
    const isClosed = isRestaurantClosed(item);
    const hasDeliveryOnly =
      item.serviceType?.delivery && !item.serviceType?.pickup;
    const hasPickupOnly =
      item.serviceType?.pickup && !item.serviceType?.delivery;

    return (
      <Card
        style={[
          styles.restaurantCard,
          { ...theme.shadow.small },
          isClosed && styles.closedRestaurantCard,
        ]}
        onPress={() => {
          if (!isClosed) {
            navigation.navigate("RestaurantDetail", { restaurantId: item._id });
          }
        }}
      >
        <View style={styles.cardContentContainer}>
          {/* Service Type Label at top left */}
          {hasPickupOnly && (
            <View style={styles.serviceTypeBadge}>
              <View style={styles.pickupIconContainer}>
                <MaterialIcons name="directions-walk" size={16} color="#fff" />
              </View>
              <Text style={styles.serviceTypeBadgeText}>PICK UP ONLY</Text>
            </View>
          )}
          {hasDeliveryOnly && (
            <View style={[styles.serviceTypeBadge, styles.deliveryBadge]}>
              <MaterialIcons name="delivery-dining" size={16} color="#fff" />
              <Text style={styles.serviceTypeBadgeText}> DELIVERY ONLY</Text>
            </View>
          )}

          {/* Heart/Favorite icon at top right */}
          <TouchableOpacity style={styles.favoriteButton}>
            <Ionicons name="heart-outline" size={24} color="#fff" />
          </TouchableOpacity>

          {/* Restaurant Image */}
          <Card.Cover
            source={{ uri: item.coverImageUrl }}
            style={[styles.restaurantImage, isClosed && styles.closedImage]}
          />

          {/* Estimated time and price */}
          {item.estimatedPrepTime && (
            <View style={styles.timeAndPriceContainer}>
              <View style={styles.timeContainer}>
                <Ionicons name="time-outline" size={18} color="#fff" />
                <Text style={styles.timeText}>
                  {item.estimatedPrepTime}min - {item.estimatedPrepTime + 10}min
                </Text>
              </View>
              {item.deliveryFee && (
                <View style={styles.priceContainer}>
                  <Text style={styles.priceText}>
                    Fee: LKR {item.deliveryFee.toFixed(2)}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Distance badge for location-based results */}
          {locationBased && item.distance && (
            <View style={styles.distanceBadge}>
              <Ionicons name="location-outline" size={14} color="#fff" />
              <Text style={styles.distanceBadgeText}>
                {parseFloat(item.distance).toFixed(1)} km
              </Text>
            </View>
          )}

          {isClosed && (
            <View style={styles.closedOverlay}>
              <Text style={styles.closedText}>CLOSED</Text>
              {item.openingHours?.open && item.openingHours?.close && (
                <Text style={styles.openingHoursText}>
                  Opens at {item.openingHours.open}
                </Text>
              )}
            </View>
          )}
        </View>

        <Card.Content>
          <View style={styles.restaurantInfoContainer}>
            <View style={styles.nameAndRatingContainer}>
              <Title style={styles.restaurantName}>{item.name}</Title>
              {item.rating && (
                <View style={styles.ratingContainer}>
                  <Ionicons
                    name="thumbs-up"
                    size={16}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.ratingText}>
                    {item.rating}% ({item.ratingCount || "500+"})
                  </Text>
                </View>
              )}
            </View>

            {item.promotion && (
              <View style={styles.promotionContainer}>
                <Ionicons
                  name="pricetag-outline"
                  size={18}
                  color={theme.colors.primary}
                />
                <Text style={themedStyles.promotionText}>{item.promotion}</Text>
              </View>
            )}

            <View style={styles.infoContainer}>
              {item.cuisineType && (
                <Text style={styles.cuisineText}>{item.cuisineType}</Text>
              )}

              {item.openingHours?.open && item.openingHours?.close && (
                <Text style={styles.hoursText}>
                  Hours: {item.openingHours.open} - {item.openingHours.close}
                </Text>
              )}
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderLocationDisclaimer = () => {
    if (!selectedAddress) return null;

    const locationName = selectedAddress.isCurrentLocation
      ? "Current Location"
      : selectedAddress.label || "Custom Location";

    return (
      <View
        style={[
          styles.locationDisclaimerContainer,
          themedStyles.locationDisclaimerContainer,
        ]}
      >
        <View style={styles.locationDisclaimerContent}>
          <Text
            style={[
              styles.locationDisclaimerText,
              themedStyles.locationDisclaimerText,
            ]}
          >
            Showing restaurants near{"       "}
            <Text style={themedStyles.locationName}>{locationName}</Text>
          </Text>
          <TouchableOpacity onPress={handleChangeLocation}>
            <Text style={themedStyles.changeLocationText}>Change Location</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Restaurants</Text>
        <View style={styles.placeholder} />
      </View>

      <TouchableOpacity onPress={handleSearch} activeOpacity={0.7}>
        <Searchbar
          placeholder="Search for restaurants or dishes"
          value=""
          style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}
          onFocus={handleSearch}
          showSoftInputOnFocus={false}
          icon="magnify"
          iconColor={theme.colors.primary}
        />
      </TouchableOpacity>

      {/* Location-based disclaimer */}
      {locationBased && renderLocationDisclaimer()}
    </View>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Image
        source={{
          uri: "https://png.pngtree.com/png-vector/20220708/ourmid/pngtree-fast-food-logo-png-image_5763171.png",
        }}
        style={styles.emptyImage}
      />
      <Text style={styles.emptyText}>No Restaurants Found</Text>

      {error ? (
        <Text style={styles.emptySubtext}>{error.message}</Text>
      ) : (
        <Text style={styles.emptySubtext}>
          {locationBased
            ? "Try changing your location or delivery range"
            : "No restaurants available at this time"}
        </Text>
      )}

      {locationBased && (
        <Button
          mode="contained"
          style={[
            styles.changeLocationButton,
            themedStyles.changeLocationButton,
            { marginTop: 20 },
          ]}
          onPress={handleChangeLocation}
        >
          Change Location
        </Button>
      )}
    </View>
  );

  if (loading && !refreshing) {
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
      <FlatList
        data={restaurants}
        renderItem={renderRestaurantItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyComponent}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
    </SafeAreaView>
  );
};

// Static styles without theme-dependent properties
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
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  backButton: {
    padding: 5,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  placeholder: {
    width: 24,
  },
  searchBar: {
    marginVertical: 10,
    borderRadius: 12,
    elevation: 2,
  },
  listContent: {
    paddingBottom: 20,
  },
  restaurantCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  closedRestaurantCard: {
    opacity: 0.8,
    borderColor: "#ccc",
    borderWidth: 1,
  },
  restaurantImage: {
    height: 150,
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
    fontSize: 24,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  openingHoursText: {
    color: "white",
    fontSize: 14,
    marginTop: 4,
  },
  restaurantName: {
    fontWeight: "bold",
    fontSize: 18,
    marginTop: 5,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    flexWrap: "wrap",
  },
  hoursContainer: {
    marginTop: 4,
  },
  hoursText: {
    fontSize: 13,
    color: "#666",
  },
  cuisineText: {
    color: "#666",
    fontSize: 14,
    marginRight: 10,
  },
  prepTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  prepTimeText: {
    marginLeft: 4,
    fontSize: 13,
    color: "#666",
  },
  serviceTypesContainer: {
    flexDirection: "row",
    marginTop: 8,
    flexWrap: "wrap",
  },
  serviceChip: {
    marginRight: 8,
    marginTop: 4,
    backgroundColor: "#f0f0f0",
  },
  serviceChipText: {
    fontSize: 12,
  },
  deliveryInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  icon: {
    marginLeft: 10,
  },
  deliveryText: {
    marginLeft: 4,
    color: "#666",
    fontSize: 14,
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
  },
  emptyImage: {
    width: 100,
    height: 100,
    marginBottom: 20,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  emptySubtext: {
    color: "#666",
    textAlign: "center",
  },
  cardContentContainer: {
    position: "relative",
  },
  serviceTypeBadge: {
    position: "absolute",
    top: 16,
    left: 0,
    backgroundColor: "#4CAF50",
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    zIndex: 10,
  },
  deliveryBadge: {
    backgroundColor: "#2196F3",
  },
  pickupIconContainer: {
    marginRight: 4,
  },
  serviceTypeBadgeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  favoriteButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 20,
    padding: 6,
  },
  timeAndPriceContainer: {
    position: "absolute",
    bottom: 10,
    right: 10,
    alignItems: "flex-end",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    marginBottom: 4,
  },
  timeText: {
    color: "#fff",
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "500",
  },
  priceContainer: {
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
  },
  priceText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  restaurantInfoContainer: {
    paddingVertical: 8,
  },
  nameAndRatingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    marginLeft: 4,
    color: "#555",
    fontWeight: "500",
  },
  promotionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    backgroundColor: "#f0f8ff",
    padding: 8,
    borderRadius: 8,
    borderColor: "#e6f2ff",
    borderWidth: 1,
  },
  locationDisclaimerContainer: {
    marginVertical: 10,
    padding: 12,
    borderRadius: 8,
  },
  locationDisclaimerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  locationDisclaimerText: {
    flex: 1,
    fontSize: 14,
  },
  distanceBadge: {
    position: "absolute",
    bottom: 50,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 10,
  },
  distanceBadgeText: {
    color: "#fff",
    marginLeft: 4,
    fontSize: 12,
    fontWeight: "500",
  },
  errorContainer: {
    marginVertical: 10,
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 14,
  },
  changeLocationButton: {
    borderRadius: 8,
  },
});

export default RestaurantsScreen;
