import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from "react-native";
import { Text, Button, Modal, Portal, Divider, FAB } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import dataService from "../../services/dataService";
import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";

const RestaurantInfoScreen = ({ route, navigation }) => {
  const { restaurantId } = route.params;
  const theme = useTheme();

  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationModalVisible, setLocationModalVisible] = useState(false);

  useEffect(() => {
    loadRestaurantDetails();
  }, [restaurantId]);

  const loadRestaurantDetails = async () => {
    try {
      setLoading(true);
      const restaurantData = await dataService.getRestaurantById(restaurantId);
      setRestaurant(restaurantData);
    } catch (error) {
      console.error("Error loading restaurant details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowLocation = () => {
    setLocationModalVisible(true);
  };

  const handleCallMerchant = () => {
    if (restaurant?.contact?.phone) {
      Linking.openURL(`tel:${restaurant.contact.phone}`);
    }
  };

  const handleGetDirections = () => {
    if (
      restaurant?.address?.coordinates?.lat &&
      restaurant?.address?.coordinates?.lng
    ) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${restaurant.address.coordinates.lat},${restaurant.address.coordinates.lng}`;
      Linking.openURL(url);
    }
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

  const formatOpeningHours = (openingHours) => {
    if (!openingHours || openingHours.length === 0) {
      return [{ days: "Monday - Sunday", hours: "Closed", isClosed: true }];
    }

    // Group days with same hours together
    const daysOrder = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    // First, process the opening hours to make them consistent
    const processedHours = openingHours.map((day) => {
      if (day.isClosed) {
        return { ...day, open: "", close: "" };
      }
      return day;
    });

    // Then group them
    const groupedHours = [];
    let currentGroup = null;

    daysOrder.forEach((day, index) => {
      const dayData = processedHours.find((d) => d.day === day);
      if (!dayData) return;

      const hoursKey = `${dayData.open}-${dayData.close}-${dayData.isClosed}`;

      if (!currentGroup || currentGroup.hoursKey !== hoursKey) {
        currentGroup = {
          days: [day],
          open: dayData.open,
          close: dayData.close,
          isClosed: dayData.isClosed,
          hoursKey,
        };
        groupedHours.push(currentGroup);
      } else {
        currentGroup.days.push(day);
      }
    });

    // Format the grouped hours for display
    return groupedHours.map((group) => {
      const days = group.days;
      let dayRange;

      if (days.length === 1) {
        dayRange = days[0];
      } else if (
        days.length === 7 &&
        days[0] === "Monday" &&
        days[6] === "Sunday"
      ) {
        dayRange = "All Week";
      } else if (
        days.length === 5 &&
        days[0] === "Monday" &&
        days[4] === "Friday"
      ) {
        dayRange = "Weekdays";
      } else if (
        days.length === 2 &&
        days.includes("Saturday") &&
        days.includes("Sunday")
      ) {
        dayRange = "Weekends";
      } else {
        // Find consecutive days
        const firstDay = days[0];
        const lastDay = days[days.length - 1];
        dayRange = `${firstDay} - ${lastDay}`;
      }

      let hoursText;
      if (group.isClosed) {
        hoursText = "Closed";
      } else {
        const formatTime = (time) => {
          if (!time) return "";
          const [hours, minutes] = time.split(":");
          const hourInt = parseInt(hours, 10);
          const ampm = hourInt >= 12 ? "PM" : "AM";
          const displayHour = hourInt % 12 || 12;
          return `${displayHour}:${minutes} ${ampm}`;
        };

        hoursText = `${formatTime(group.open)} - ${formatTime(group.close)}`;
      }

      return {
        days: dayRange,
        hours: hoursText,
        isClosed: group.isClosed,
      };
    });
  };

  // Sample data for fields that might be missing
  const cuisineTypes = restaurant.cuisineType
    ? [restaurant.cuisineType]
    : ["Rice & Curry", "Bakery"];
  const estimatedDeliveryTime = restaurant.estimatedPrepTime
    ? `Est: ${restaurant.estimatedPrepTime}mins`
    : "Est: 30mins";
  const address = restaurant.address || {
    street: "835",
    area: "Thorana Junction",
    city: "Kelaniya",
    fullAddress: "835, Thorana Junction, Kandy Road, Kelaniya",
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with back button and share */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
        </View>

        {/* Restaurant Cover Image */}
        <Image
          source={{
            uri:
              restaurant.coverImageUrl ||
              "https://images.unsplash.com/photo-1530554764233-e79e16c91d08?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
          }}
          style={styles.coverImage}
          resizeMode="cover"
        />

        {/* Restaurant Logo in center */}
        <View style={styles.logoContainer}>
          <Image
            source={{
              uri:
                restaurant.imageUrls[0] ||
                "https://cdn.pixabay.com/photo/2021/09/06/01/13/logo-6600650_1280.png",
            }}
            style={[styles.logoImage, { borderColor: theme.colors.primary }]}
            resizeMode="cover"
          />
        </View>

        {/* Restaurant Title and Categories */}
        <View style={styles.titleContainer}>
          <Text style={styles.restaurantName}>{restaurant.name}</Text>
          <View style={styles.categoriesRow}>
            {cuisineTypes.map((type, index) => (
              <React.Fragment key={index}>
                <Text style={styles.categoryText}>{type}</Text>
                {index < cuisineTypes.length - 1 && (
                  <Text style={styles.categoryDot}>•</Text>
                )}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Info Sections */}
        <View style={styles.infoContainer}>
          {/* Address Section */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Address</Text>
            <View style={styles.addressContainer}>
              <Text style={styles.addressText}>
                {address.fullAddress ||
                  `${address.street}, ${address.city}, ${address.province}`}
              </Text>
              <Button
                mode="outlined"
                icon="map-marker"
                onPress={handleGetDirections}
                style={styles.directionsButton}
              >
                Directions
              </Button>
            </View>
          </View>
          <Divider style={styles.divider} />

          {/* Opening Hours */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Opening Hours</Text>
            {formatOpeningHours(restaurant.openingHours).map((hours, index) => (
              <View key={index} style={styles.hoursContainer}>
                <Text style={styles.daysText}>{hours.days}</Text>
                <Text
                  style={[
                    styles.hoursText,
                    hours.isClosed && { color: theme.colors.error },
                  ]}
                >
                  {hours.hours}
                </Text>
              </View>
            ))}
          </View>

          <Divider style={styles.divider} />

          {/* Delivery Information */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Restaurant Location</Text>

            {/* Map Preview */}
            <TouchableOpacity
              onPress={handleShowLocation}
              style={styles.mapPreviewContainer}
            >
              <MapView
                style={styles.mapPreview}
                initialRegion={{
                  latitude: restaurant.address?.coordinates?.lat,
                  longitude: restaurant.address?.coordinates?.lng,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
              >
                <Marker
                  coordinate={{
                    latitude: restaurant.address?.coordinates?.lat,
                    longitude: restaurant.address?.coordinates?.lng,
                  }}
                  title={restaurant.name}
                />
              </MapView>
            </TouchableOpacity>

            {/* Delivery Details */}
            <View style={styles.deliveryDetailsContainer}>
              <View style={styles.deliveryItem}>
                <MaterialCommunityIcons
                  name="clock-time-four-outline"
                  size={20}
                  color="#666"
                />
                <Text style={styles.deliveryItemText}>
                  Estimated delivery time
                </Text>
                <Text style={styles.deliveryValue}>
                  {estimatedDeliveryTime}
                </Text>
              </View>

              <View style={styles.deliveryItem}>
                <MaterialCommunityIcons
                  name="store-outline"
                  size={20}
                  color="#666"
                />
                <Text style={styles.deliveryItemText}>Self Pickup</Text>
                <Text style={styles.deliveryValue}>
                  {restaurant.serviceType?.pickup ? "Available" : "Unavailable"}
                </Text>
              </View>
              <View style={styles.deliveryItem}>
                <MaterialCommunityIcons
                  name="silverware-fork-knife"
                  size={20}
                  color="#666"
                />
                <Text style={styles.deliveryItemText}>Dine In</Text>
                <Text style={styles.deliveryValue}>
                  {restaurant.serviceType?.dineIn ? "Available" : "Unavailable"}
                </Text>
              </View>
            </View>
          </View>

          <Divider style={styles.divider} />

          {/* Contact Section */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Contact</Text>
            <Text style={styles.contactText}>
              If you have allergies or other dietary restrictions, please tap
              the floating call icon to contact the restaurant directly. They
              will provide food-specific information upon request.
            </Text>
          </View>
        </View>
      </ScrollView>

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

            <MapView
              style={styles.fullMap}
              initialRegion={{
                latitude: restaurant.address?.coordinates?.lat || 6.9715,
                longitude: restaurant.address?.coordinates?.lng || 79.9189,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }}
            >
              <Marker
                coordinate={{
                  latitude: restaurant.address?.coordinates?.lat || 6.9715,
                  longitude: restaurant.address?.coordinates?.lng || 79.9189,
                }}
                title={restaurant.name}
                description={address.fullAddress}
              />
            </MapView>

            <Button
              mode="contained"
              onPress={() => setLocationModalVisible(false)}
              style={[
                styles.closeMapButton,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              Close
            </Button>
          </View>
        </Modal>
      </Portal>
      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="phone"
        color="white"
        onPress={handleCallMerchant}
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
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 15,
    position: "absolute",
    width: "100%",
    zIndex: 10,
  },
  backButton: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 8,
  },
  shareButton: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 8,
  },
  coverImage: {
    width: "100%",
    height: 180,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: -40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  logoImage: {
    width: 80,
    height: 80,
    borderRadius: 15,
    borderWidth: 1,
    backgroundColor: "#FED74D",
    elevation: 6, // Change from "fill" to "cover"
  },
  titleContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 5,
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 2,
  },
  categoriesRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  categoryText: {
    color: "#666",
    fontSize: 14,
  },
  categoryDot: {
    marginHorizontal: 5,
    color: "#666",
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 20,
    borderRadius: 28,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1,
  },
  infoContainer: {
    paddingHorizontal: 20,
  },
  infoSection: {
    paddingVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 16,
    marginLeft: 8,
  },
  addressContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  addressText: {
    fontSize: 16,
    color: "#444",
    lineHeight: 22,
    flex: 1,
    paddingRight: 10,
  },
  directionsButton: {
    borderColor: "#888",
  },
  hoursContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  daysText: {
    fontSize: 16,
    color: "#444",
  },
  hoursText: {
    fontSize: 16,
    color: "#444",
    fontWeight: "500",
  },
  mapPreviewContainer: {
    height: 150,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 15,
  },
  mapPreview: {
    width: "100%",
    height: "100%",
  },
  deliveryDetailsContainer: {
    marginTop: 5,
  },
  deliveryItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  deliveryItemText: {
    fontSize: 16,
    marginLeft: 10,
    flex: 1,
    color: "#444",
  },
  deliveryValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#444",
  },
  contactText: {
    fontSize: 15,
    color: "#666",
    lineHeight: 22,
    marginBottom: 15,
  },
  contactRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  outletLabel: {
    fontSize: 16,
    color: "#444",
  },
  supportLabel: {
    fontSize: 16,
    color: "#444",
  },
  supportNumber: {
    fontSize: 16,
    color: "#4285F4",
    fontWeight: "bold",
  },
  locationModal: {
    margin: 15,
    borderRadius: 10,
    padding: 15,
    height: "70%",
  },
  locationModalContent: {
    flex: 1,
  },
  locationModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  fullMap: {
    flex: 1,
    borderRadius: 10,
    marginBottom: 15,
  },
  closeMapButton: {
    marginTop: 5,
  },
});

export default RestaurantInfoScreen;
