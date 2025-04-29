import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Animated,
  Dimensions,
  Platform,
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
import { LinearGradient } from "expo-linear-gradient";
import SearchBar from "../../components/ui/SearchBar";
import GradientButton from "../../components/ui/GradientButton";

const { width } = Dimensions.get("window");

const CARD_WIDTH = width - 32;

const RestaurantsScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const { selectedAddress, deliveryRange } = useLocation();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [locationBased, setLocationBased] = useState(false);
  const [error, setError] = useState(null);
  const [searchValue, setSearchValue] = useState("");

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

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [restaurants]);

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
            100
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

  const handleSearchClear = () => {
    setSearchValue("");
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleChangeLocation = () => {
    navigation.navigate("Home");
  };

  const isRestaurantClosed = (restaurant) => {
    if (!restaurant.openingHours || restaurant.openingHours.length === 0)
      return false;

    // Get current day of the week (0 = Sunday, 1 = Monday, etc.)
    const now = new Date();
    const currentDay = now.getDay();
    // Convert to match our array structure (where 0 = Monday, 6 = Sunday)
    const dayIndex = currentDay === 0 ? 6 : currentDay - 1;

    // Get the opening hours for today
    const todayHours = restaurant.openingHours[dayIndex];

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

  const renderRestaurantItem = ({ item }) => {
    const isClosed = isRestaurantClosed(item);

    return (
      <TouchableOpacity
        style={[styles.restaurantCard, { backgroundColor: theme.colors.card }]}
        onPress={() => {
          navigation.navigate("RestaurantDetail", { restaurantId: item._id });
        }}
        activeOpacity={isClosed ? 1 : 0.95}
      >
        <View style={styles.restaurantImageContainer}>
          <Image
            source={{ uri: item.coverImageUrl || item.imageUrls[0] }}
            style={[styles.restaurantImage, isClosed && styles.closedImage]}
            resizeMode="cover"
          />

          {isClosed && (
            <View style={styles.closedOverlay}>
              <Text style={styles.closedText}>Closed</Text>
            </View>
          )}

          {/* Service Type Badges */}
          <View style={styles.serviceTypeBadges}>
            {item.serviceType?.delivery && (
              <View
                style={[
                  styles.serviceBadge,
                  { backgroundColor: theme.colors.primary + "80" },
                ]}
              >
                <Ionicons name="bicycle-outline" size={14} color="white" />
                <Text style={styles.serviceBadgeText}>Delivery</Text>
              </View>
            )}
            {item.serviceType?.pickup && (
              <View
                style={[
                  styles.serviceBadge,
                  { backgroundColor: theme.colors.primary + "80" },
                ]}
              >
                <MaterialIcons name="store" size={14} color="white" />
                <Text style={styles.serviceBadgeText}>Pickup</Text>
              </View>
            )}
          </View>

          {/* Time and Distance Info */}
          <View style={styles.timeDistanceInfo}>
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={14} color="white" />
              <Text style={styles.infoText}>{item.estimatedPrepTime}min</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="location-outline" size={14} color="white" />
              <Text style={styles.infoText}>{item.distance}km</Text>
            </View>
          </View>
        </View>

        <View style={styles.restaurantInfo}>
          <View style={styles.nameStatusContainer}>
            <Text
              style={[styles.restaurantName, { color: theme.colors.text }]}
              numberOfLines={1}
            >
              {item.name}
            </Text>
            <View
              style={[
                styles.statusChip,
                {
                  backgroundColor: isClosed
                    ? theme.colors.error + "20"
                    : theme.colors.success + "20",
                },
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: isClosed
                      ? theme.colors.error
                      : theme.colors.success,
                  },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  {
                    color: isClosed ? theme.colors.error : theme.colors.success,
                  },
                ]}
              >
                {isClosed ? "Closed" : "Open"}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderLocationDisclaimer = () => {
    if (!locationBased) return null;

    return (
      <View
        style={[
          styles.locationContainer,
          themedStyles.locationDisclaimerContainer,
        ]}
      >
        <Text
          style={[styles.locationText, themedStyles.locationDisclaimerText]}
        >
          Showing restaurants near{" "}
          <Text style={themedStyles.locationName}>
            {selectedAddress?.formattedAddress
              ? selectedAddress.formattedAddress
              : "selected location"}
          </Text>
        </Text>
        <TouchableOpacity onPress={handleChangeLocation}>
          <Text style={themedStyles.changeLocationText}>Change Location</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Restaurants
        </Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => navigation.navigate("Search")}
      >
        <SearchBar
          editable={false} // Make the input field not directly editable
          style={styles.SearchBar}
        />
      </TouchableOpacity>

      {renderLocationDisclaimer()}
    </View>
  );

  const renderEmptyComponent = () => (
    <View
      style={[
        styles.emptyContainer,
        { alignItems: "center", justifyContent: "flex-start", marginTop: 20 },
      ]}
    >
      {error ? (
        <View
          style={[
            styles.errorContainer,
            themedStyles.errorContainer,
            { width: "100%" },
          ]}
        >
          <Ionicons name="alert-circle" size={48} color={theme.colors.error} />
          <Text style={[styles.emptyText, themedStyles.errorText]}>
            {error.message}
          </Text>
          {error.type === "location" && (
            <GradientButton
              title="Change Location"
              onPress={handleChangeLocation}
              style={{ marginTop: 16 }}
              fullWidth
            />
          )}
        </View>
      ) : (
        <>
          <Ionicons
            name="restaurant-outline"
            size={64}
            color={theme.colors.gray}
          />
          <Text style={[styles.emptyText, { color: theme.colors.text }]}>
            No restaurants available
          </Text>
        </>
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
        keyExtractor={(item) => item._id.toString()}
        renderItem={renderRestaurantItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyComponent}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
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
  headerContainer: {},
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontFamily: "Poppins-Bold",
    marginVertical: 8,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  restaurantCard: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  restaurantImageContainer: {
    position: "relative",
    height: 180,
  },
  restaurantImage: {
    width: "100%",
    height: "100%",
  },
  serviceTypeBadges: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    gap: 6,
  },
  serviceBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  serviceBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },
  timeDistanceInfo: {
    position: "absolute",
    bottom: 10,
    left: 10,
    flexDirection: "row",
    gap: 6,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  infoText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },
  restaurantInfo: {
    padding: 10,
  },
  nameStatusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
    marginRight: 8,
  },
  statusChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  locationContainer: {
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  locationText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    marginBottom: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
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
  closedImage: {
    opacity: 0.5,
  },
  closedOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  closedText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
});

export default RestaurantsScreen;
