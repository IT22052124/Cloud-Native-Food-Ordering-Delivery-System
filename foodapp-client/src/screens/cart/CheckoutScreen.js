import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  Text,
  Button,
  Card,
  Divider,
  RadioButton,
  Title,
  IconButton,
  List,
  Portal,
  Modal,
  TextInput,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import dataService from "../../services/dataService";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { debounce } from "lodash";
import Constants from "expo-constants";
const { GOOGLE_MAPS_API_KEY } = Constants.expoConfig.extra; // Google Maps API key from config

const { width, height } = Dimensions.get("window");
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

// Check if the API key has been set properly
if (!GOOGLE_MAPS_API_KEY) {
  console.warn(
    "Google Maps API key is not properly configured. Geocoding functionality may not work correctly."
  );
}

const CheckoutScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const { items, restaurant, getSubtotal, getTotal, clearCart } = useCart();

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [orderType, setOrderType] = useState("DELIVERY");
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [loading, setLoading] = useState(false);

  // Map and location states
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [tempLocation, setTempLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [reverseGeocodingInProgress, setReverseGeocodingInProgress] =
    useState(false);
  const [tempAddressDetails, setTempAddressDetails] = useState({
    label: "Temporary Location",
    street: "",
    city: "",
    state: "",
    latitude: null,
    longitude: null,
  });

  useEffect(() => {
    const loadAddresses = async () => {
      try {
        setLoading(true);
        const response = await dataService.getUserAddresses();
        if (response.success) {
          setAddresses(response.addresses);
          setSelectedAddress(
            response.addresses.find((addr) => addr.isDefault) ||
              response.addresses[0]
          );
        } else {
          Alert.alert("Error", response.message || "Failed to fetch addresses");
        }
      } catch (error) {
        console.error("Error fetching addresses:", error);
        Alert.alert(
          "Error",
          "Failed to fetch your addresses. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    // Load delivery fee
    const loadDeliveryFee = () => {
      if (restaurant) {
        setDeliveryFee(parseFloat(restaurant.deliveryFee || 5.99));
      }
    };

    loadAddresses();
    loadDeliveryFee();
    getUserLocation();
  }, [user, restaurant]);

  // Get user's current location
  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Permission to access location was denied"
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const initialRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      };

      setUserLocation(initialRegion);
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert("Location Error", "Could not get your current location");
    }
  };

  // Reverse geocode the selected location to get address details
  const reverseGeocode = useCallback(
    async (latitude, longitude) => {
      if (reverseGeocodingInProgress) return;

      if (!latitude || !longitude) {
        console.log("No coordinates provided for reverse geocoding");
        return;
      }

      try {
        setReverseGeocodingInProgress(true);

        // Ensure we have a valid API key
        if (!GOOGLE_MAPS_API_KEY) {
          console.error("Invalid Google Maps API key");
          Alert.alert(
            "Configuration Error",
            "Google Maps API key is not properly configured. Please contact support."
          );
          return;
        }

        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`;
        console.log("Geocoding request URL:", url);

        const response = await fetch(url);
        const data = await response.json();
        console.log("Geocoding response status:", data.status);

        if (data.status === "OK" && data.results.length > 0) {
          const addressComponents = data.results[0].address_components;
          const formattedAddress = data.results[0].formatted_address || "";
          let streetNumber = "";
          let route = "";
          let locality = "";
          let adminArea = "";

          for (const component of addressComponents) {
            const types = component.types;

            if (types.includes("street_number")) {
              streetNumber = component.long_name;
            } else if (types.includes("route")) {
              route = component.long_name;
            } else if (types.includes("locality")) {
              locality = component.long_name;
            } else if (types.includes("administrative_area_level_1")) {
              adminArea = component.short_name;
            }
          }

          // Update temp address details with retrieved info
          let updatedFields = {};

          if (streetNumber && route) {
            updatedFields.street = `${streetNumber} ${route}`;
          } else if (route) {
            updatedFields.street = route;
          } else if (formattedAddress) {
            const parts = formattedAddress.split(",");
            if (parts.length > 0) {
              updatedFields.street = parts[0].trim();
            }
          }

          if (locality) {
            updatedFields.city = locality;
          }

          if (adminArea) {
            updatedFields.state = adminArea;
          }

          setTempAddressDetails((prev) => ({
            ...prev,
            ...updatedFields,
            latitude: latitude,
            longitude: longitude,
          }));
        } else if (data.status === "ZERO_RESULTS") {
          Alert.alert(
            "No Address Found",
            "We couldn't find an address for this location. Please try a different spot."
          );
        } else {
          Alert.alert(
            "Location Error",
            "Could not retrieve address information. Please try again."
          );
        }
      } catch (error) {
        console.error("Error during reverse geocoding:", error);
        Alert.alert(
          "Connection Error",
          "Could not connect to location services. Please check your internet connection."
        );
      } finally {
        setReverseGeocodingInProgress(false);
      }
    },
    [reverseGeocodingInProgress]
  );

  // Debounced function to handle map marker movements
  const debouncedReverseGeocode = useMemo(
    () =>
      debounce((lat, lng) => {
        if (lat && lng) {
          console.log("Debounced geocode call with coordinates:", lat, lng);
          reverseGeocode(lat, lng);
        } else {
          console.log("Skipping reverse geocode due to invalid coordinates");
        }
      }, 500),
    [reverseGeocode]
  );

  // Handle map marker drag
  const handleMapPress = useCallback(
    (event) => {
      const newLocation = event.nativeEvent.coordinate;
      console.log("Map pressed at coordinates:", newLocation);
      setSelectedLocation(newLocation);

      // Get address details based on selected location
      if (newLocation && newLocation.latitude && newLocation.longitude) {
        debouncedReverseGeocode(newLocation.latitude, newLocation.longitude);
      }
    },
    [debouncedReverseGeocode]
  );

  // Handle marker drag end
  const handleMarkerDragEnd = useCallback(
    (e) => {
      const newLocation = e.nativeEvent.coordinate;
      console.log("Marker dragged to coordinates:", newLocation);
      setSelectedLocation(newLocation);

      // Get address details based on new marker position
      if (newLocation && newLocation.latitude && newLocation.longitude) {
        debouncedReverseGeocode(newLocation.latitude, newLocation.longitude);
      }
    },
    [debouncedReverseGeocode]
  );

  // Save selected location
  const saveTempLocation = useCallback(() => {
    if (selectedLocation && tempAddressDetails.street) {
      setTempLocation({
        _id: "temp-location",
        label: tempAddressDetails.label,
        street: tempAddressDetails.street,
        city: tempAddressDetails.city,
        state: tempAddressDetails.state,
        coordinates: {
          lat: selectedLocation.latitude,
          lng: selectedLocation.longitude,
        },
        isTemporary: true,
      });
      setSelectedAddress({
        _id: "temp-location",
        label: tempAddressDetails.label,
        street: tempAddressDetails.street,
        city: tempAddressDetails.city,
        state: tempAddressDetails.state,
        coordinates: {
          lat: selectedLocation.latitude,
          lng: selectedLocation.longitude,
        },
        isTemporary: true,
      });
      setMapModalVisible(false);
    } else {
      Alert.alert("Error", "Please select a location on the map");
    }
  }, [selectedLocation, tempAddressDetails]);

  const openMapModal = () => {
    if (!userLocation) {
      getUserLocation().then(() => {
        setMapModalVisible(true);
      });
    } else {
      setMapModalVisible(true);
    }
  };

  const handleProceedToPayment = () => {
    if (!selectedAddress && orderType === "DELIVERY") {
      Alert.alert("Error", "Please select a delivery address");
      return;
    }

    // Navigate to payment screen
    navigation.navigate("Payment", {
      orderType,
      selectedAddress: selectedAddress,
      subtotal: getSubtotal(),
      deliveryFee: orderType === "DELIVERY" ? deliveryFee : 0,
      total: orderType === "DELIVERY" ? getTotal() : getSubtotal(),
    });
  };

  const handleAddAddress = () => {
    navigation.navigate("SavedAddresses");
  };

  const renderCartItems = () => {
    return (
      <View style={styles.section}>
        <Title style={styles.sectionTitle}>Order Items</Title>
        {items.map((item) => (
          <Card key={item.id} style={styles.itemCard}>
            <Card.Content style={styles.itemContent}>
              <Image
                source={
                  item.image
                    ? { uri: item.image }
                    : require("../../assets/no-image.png")
                }
                style={styles.itemImage}
              />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>
                ${(item.price * item.quantity).toFixed(2)}
              </Text>
            </Card.Content>
          </Card>
        ))}
      </View>
    );
  };

  const renderAddresses = () => {
    if (orderType !== "DELIVERY") return null;

    return (
      <View style={styles.section}>
        <Title style={styles.sectionTitle}>Delivery Address</Title>
        <ScrollView style={styles.addressList}>
          {tempLocation && (
            <TouchableOpacity
              key="temp-location"
              style={[
                styles.addressCard,
                selectedAddress?._id === "temp-location" &&
                  styles.selectedAddressCard,
              ]}
              onPress={() => setSelectedAddress(tempLocation)}
            >
              <RadioButton
                value="temp-location"
                status={
                  selectedAddress?._id === "temp-location"
                    ? "checked"
                    : "unchecked"
                }
                onPress={() => setSelectedAddress(tempLocation)}
                color={theme.colors.primary}
              />
              <View style={styles.addressDetails}>
                <Text style={styles.addressName}>{tempLocation.label}</Text>
                <Text style={styles.addressText}>
                  {tempLocation.street}, {tempLocation.city},{" "}
                  {tempLocation.state}
                </Text>
              </View>
              <View style={styles.tempBadge}>
                <Text style={styles.tempText}>Temporary</Text>
              </View>
            </TouchableOpacity>
          )}
          {addresses.map((address) => (
            <TouchableOpacity
              key={address._id}
              style={[
                styles.addressCard,
                selectedAddress?._id === address._id &&
                  styles.selectedAddressCard,
              ]}
              onPress={() => setSelectedAddress(address)}
            >
              <RadioButton
                value={address._id}
                status={
                  selectedAddress?._id === address._id ? "checked" : "unchecked"
                }
                onPress={() => setSelectedAddress(address)}
                color={theme.colors.primary}
              />
              <View style={styles.addressDetails}>
                <Text style={styles.addressName}>{address.label}</Text>
                <Text style={styles.addressText}>
                  {address.street}, {address.city}, {address.state}
                </Text>
              </View>
              {address.isDefault && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultText}>Default</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.addressActions}>
          <Button
            mode="outlined"
            icon="crosshairs-gps"
            style={styles.tempLocationButton}
            onPress={openMapModal}
          >
            Use Current Location
          </Button>
          <Button
            mode="outlined"
            icon="plus"
            style={styles.addAddressButton}
            onPress={handleAddAddress}
          >
            Add New Address
          </Button>
        </View>
      </View>
    );
  };

  const renderOrderType = () => {
    return (
      <View style={styles.section}>
        <Title style={styles.sectionTitle}>Order Type</Title>
        <Card style={styles.orderTypeCard}>
          <Card.Content>
            <TouchableOpacity
              style={[
                styles.orderTypeOption,
                orderType === "DELIVERY" && styles.selectedOrderType,
              ]}
              onPress={() => setOrderType("DELIVERY")}
            >
              <RadioButton
                value="DELIVERY"
                status={orderType === "DELIVERY" ? "checked" : "unchecked"}
                onPress={() => setOrderType("DELIVERY")}
                color={theme.colors.primary}
              />
              <View style={styles.orderTypeDetails}>
                <Text style={styles.orderTypeName}>Delivery</Text>
                <Text style={styles.orderTypeDescription}>
                  Delivered to your address
                </Text>
              </View>
              <Text style={styles.deliveryFee}>+${deliveryFee.toFixed(2)}</Text>
            </TouchableOpacity>

            <Divider style={styles.divider} />

            <TouchableOpacity
              style={[
                styles.orderTypeOption,
                orderType === "PICKUP" && styles.selectedOrderType,
              ]}
              onPress={() => setOrderType("PICKUP")}
            >
              <RadioButton
                value="PICKUP"
                status={orderType === "PICKUP" ? "checked" : "unchecked"}
                onPress={() => setOrderType("PICKUP")}
                color={theme.colors.primary}
              />
              <View style={styles.orderTypeDetails}>
                <Text style={styles.orderTypeName}>Pickup</Text>
                <Text style={styles.orderTypeDescription}>
                  Pickup from restaurant
                </Text>
              </View>
              <Text style={styles.deliveryFee}>Free</Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>
      </View>
    );
  };

  const renderOrderSummary = () => {
    const subtotal = getSubtotal();
    const total = orderType === "DELIVERY" ? getTotal() : subtotal;

    return (
      <View style={styles.section}>
        <Title style={styles.sectionTitle}>Order Summary</Title>
        <Card style={styles.summaryCard}>
          <Card.Content>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
            </View>

            {orderType === "DELIVERY" && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery Fee</Text>
                <Text style={styles.summaryValue}>
                  ${deliveryFee.toFixed(2)}
                </Text>
              </View>
            )}

            <Divider style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
            </View>
          </Card.Content>
        </Card>
      </View>
    );
  };

  // Map preview component for the map modal
  const MapPreview = useCallback(
    () => (
      <View style={styles.mapContainer}>
        <View style={styles.mapHeaderContainer}>
          <Text style={styles.mapTitle}>Select Location</Text>
          {reverseGeocodingInProgress && (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          )}
        </View>

        {userLocation && (
          <MapView
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={userLocation}
            onPress={handleMapPress}
            showsUserLocation={true}
            showsMyLocationButton={true}
            showsCompass={true}
            loadingEnabled={true}
          >
            {selectedLocation && (
              <Marker
                coordinate={selectedLocation}
                draggable
                onDragEnd={handleMarkerDragEnd}
                pinColor={theme.colors.primary}
              />
            )}
          </MapView>
        )}

        <View
          style={[
            styles.mapAddressPreview,
            reverseGeocodingInProgress && styles.mapAddressPreviewLoading,
          ]}
        >
          {reverseGeocodingInProgress ? (
            <View style={styles.loadingIndicator}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Finding address...</Text>
            </View>
          ) : tempAddressDetails.street && tempAddressDetails.city ? (
            <Text style={styles.mapAddressText}>
              {tempAddressDetails.street}, {tempAddressDetails.city},{" "}
              {tempAddressDetails.state}
            </Text>
          ) : (
            <Text style={styles.mapAddressPlaceholder}>
              Drop pin to get address details
            </Text>
          )}
        </View>

        <View style={styles.mapButtons}>
          <Button
            mode="outlined"
            onPress={() => setMapModalVisible(false)}
            style={styles.mapCancelButton}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={saveTempLocation}
            style={styles.mapSaveButton}
            disabled={
              !selectedLocation ||
              reverseGeocodingInProgress ||
              !tempAddressDetails.street
            }
          >
            Use This Location
          </Button>
        </View>
      </View>
    ),
    [
      userLocation,
      selectedLocation,
      handleMapPress,
      handleMarkerDragEnd,
      theme.colors.primary,
      tempAddressDetails,
      saveTempLocation,
      reverseGeocodingInProgress,
    ]
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
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.goBack()}
          color={theme.colors.text}
        />
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        {renderCartItems()}
        {renderOrderType()}
        {renderAddresses()}
        {renderOrderSummary()}

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            style={styles.checkoutButton}
            labelStyle={styles.buttonLabel}
            onPress={handleProceedToPayment}
            loading={loading}
            disabled={loading || (orderType === "DELIVERY" && !selectedAddress)}
          >
            Proceed to Payment
          </Button>
        </View>
      </ScrollView>

      {/* Map Modal */}
      <Portal>
        <Modal
          visible={mapModalVisible}
          onDismiss={() => setMapModalVisible(false)}
          contentContainerStyle={styles.mapModalContainer}
        >
          <MapPreview />
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    height: 56,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
    fontWeight: "bold",
  },
  itemCard: {
    marginBottom: 8,
    elevation: 2,
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "500",
  },
  itemQuantity: {
    fontSize: 14,
    color: "#757575",
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "bold",
  },
  addressList: {
    maxHeight: 250,
  },
  addressCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  selectedAddressCard: {
    borderColor: "#FF6B6B",
    borderWidth: 2,
  },
  addressDetails: {
    marginLeft: 12,
    flex: 1,
  },
  addressName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: "#757575",
  },
  defaultBadge: {
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  defaultText: {
    fontSize: 12,
    color: "#757575",
  },
  tempBadge: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  tempText: {
    fontSize: 12,
    color: "#2196F3",
  },
  addressActions: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  addAddressButton: {
    flex: 1,
    marginLeft: 8,
  },
  tempLocationButton: {
    flex: 1,
    marginRight: 8,
  },
  orderTypeCard: {
    marginBottom: 16,
  },
  orderTypeOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
  },
  selectedOrderType: {
    backgroundColor: "rgba(255, 107, 107, 0.1)",
  },
  orderTypeDetails: {
    marginLeft: 12,
    flex: 1,
  },
  orderTypeName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  orderTypeDescription: {
    fontSize: 14,
    color: "#757575",
  },
  deliveryFee: {
    fontSize: 16,
    fontWeight: "bold",
  },
  divider: {
    marginVertical: 8,
  },
  summaryCard: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
  },
  summaryValue: {
    fontSize: 16,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF6B6B",
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  checkoutButton: {
    height: 50,
    justifyContent: "center",
    backgroundColor: "#FF6B6B",
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  mapModalContainer: {
    margin: 0,
    padding: 0,
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  mapHeaderContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginRight: 8,
  },
  map: {
    width: "100%",
    height: "70%",
  },
  mapAddressPreview: {
    padding: 12,
    backgroundColor: "#f5f5f5",
    margin: 8,
    borderRadius: 8,
    minHeight: 50,
  },
  mapAddressText: {
    fontSize: 15,
  },
  mapAddressPlaceholder: {
    fontSize: 15,
    color: "#666",
    fontStyle: "italic",
  },
  mapButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
  mapCancelButton: {
    flex: 1,
    marginRight: 8,
  },
  mapSaveButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: "#FF6B6B",
  },
  loadingIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  mapAddressPreviewLoading: {
    backgroundColor: "#f0f0f0",
  },
});

export default CheckoutScreen;
