import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  Text,
  Card,
  Button,
  IconButton,
  Divider,
  Title,
  Modal,
  Portal,
  TextInput,
  RadioButton,
} from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
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

const SavedAddressesScreen = ({ navigation }) => {
  const theme = useTheme();

  // State for address list and loading
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(null);
  const [mapModalVisible, setMapModalVisible] = useState(false);

  // Location states
  const [userLocation, setUserLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [reverseGeocodingInProgress, setReverseGeocodingInProgress] =
    useState(false);

  // Form state for address inputs
  const [formState, setFormState] = useState({
    label: "",
    street: "",
    city: "",
    state: "",
    isDefault: false,
    latitude: null,
    longitude: null,
  });

  // Extract values from formState for convenience
  const { label, street, city, state, isDefault, latitude, longitude } =
    formState;

  // Create a memoized updater function to reduce renders
  const updateFormField = useCallback((field, value) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Memoized input handlers to prevent lag
  const handleLabelChange = useCallback(
    (text) => updateFormField("label", text),
    [updateFormField]
  );
  const handleStreetChange = useCallback(
    (text) => updateFormField("street", text),
    [updateFormField]
  );
  const handleCityChange = useCallback(
    (text) => updateFormField("city", text),
    [updateFormField]
  );
  const handleStateChange = useCallback(
    (text) => updateFormField("state", text),
    [updateFormField]
  );
  const toggleIsDefault = useCallback(
    () => updateFormField("isDefault", !isDefault),
    [updateFormField, isDefault]
  );

  // Fetch addresses when component mounts
  useEffect(() => {
    fetchAddresses();
    getUserLocation();
  }, []);

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

      if (!selectedLocation) {
        setSelectedLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert("Location Error", "Could not get your current location");
    }
  };

  // Fetch user's addresses from the API
  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await dataService.getUserAddresses();
      if (response.success) {
        setAddresses(response.addresses);
      } else {
        Alert.alert("Error", response.message || "Failed to fetch addresses");
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
      Alert.alert("Error", "Failed to fetch your addresses. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Reverse geocode the selected location to get address details
  const reverseGeocode = useCallback(
    async (latitude, longitude) => {
      if (!latitude || !longitude || reverseGeocodingInProgress) return;

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

        const response = await fetch(url);
        const data = await response.json();

        if (data.status === "OK" && data.results.length > 0) {
          const addressComponents = data.results[0].address_components;
          const formattedAddress = data.results[0].formatted_address || "";
          let streetNumber = "";
          let route = "";
          let locality = "";
          let adminArea = "";

          // Log the full address for debugging
          console.log("Found address:", formattedAddress);

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

          // Update form fields with retrieved address info
          let updatedFields = {};

          if (streetNumber && route) {
            updatedFields.street = `${streetNumber} ${route}`;
          } else if (route) {
            updatedFields.street = route;
          } else if (formattedAddress) {
            // If no structured street data, use the first part of the formatted address
            const parts = formattedAddress.split(",");
            if (parts.length > 0) {
              updatedFields.street = parts[0].trim();
            }
          }

          if (locality) {
            updatedFields.city = locality;
            // Only set label if not already set
            if (!formState.label) {
              updatedFields.label = locality;
            }
          }

          if (adminArea) {
            updatedFields.state = adminArea;
          }

          // Update all fields at once to reduce renders
          setFormState((prev) => ({
            ...prev,
            ...updatedFields,
          }));
        } else if (data.status === "ZERO_RESULTS") {
          Alert.alert(
            "No Address Found",
            "We couldn't find an address for this location. Please try a different spot."
          );
          console.log("No geocoding results found");
        } else if (data.status === "REQUEST_DENIED") {
          console.error("Geocoding API request denied:", data.error_message);
          Alert.alert(
            "Service Error",
            "Location service temporarily unavailable. Please try again later."
          );
        } else {
          console.log("Geocoding error:", data.status, data.error_message);
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
    [reverseGeocodingInProgress, formState.label]
  );

  // Debounced function to handle map marker movements
  const debouncedReverseGeocode = useMemo(
    () =>
      debounce((lat, lng) => {
        reverseGeocode(lat, lng);
      }, 500),
    [reverseGeocode]
  );

  // Reset form values
  const resetForm = useCallback(() => {
    setFormState({
      label: "",
      street: "",
      city: "",
      state: "",
      latitude: null,
      longitude: null,
      isDefault: addresses.length === 0, // Set default true if it's the first address
    });
  }, [addresses.length]);

  // Open modal to add a new address
  const handleAddAddress = useCallback(() => {
    setEditMode(false);
    setCurrentAddress(null);
    resetForm();
    setModalVisible(true);

    // Set the selected location to the user's current location
    if (userLocation) {
      setSelectedLocation({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      });

      // Update form state with current location
      setFormState((prev) => ({
        ...prev,
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      }));

      // Auto-fill address based on current location
      debouncedReverseGeocode(userLocation.latitude, userLocation.longitude);
    }
  }, [userLocation, resetForm, debouncedReverseGeocode]);

  // Open modal to edit an existing address
  const handleEditAddress = useCallback((address) => {
    setEditMode(true);
    setCurrentAddress(address);

    // Update form state with address data
    setFormState({
      label: address.label,
      street: address.street,
      city: address.city,
      state: address.state,
      isDefault: address.isDefault,
      latitude: address.latitude || null,
      longitude: address.longitude || null,
    });

    // Update selected location if coordinates exist
    if (address.latitude && address.longitude) {
      setSelectedLocation({
        latitude: address.latitude,
        longitude: address.longitude,
      });
    } else {
      setSelectedLocation(null);
    }

    setModalVisible(true);
  }, []);

  // Save new address or update existing one
  const handleSaveAddress = async () => {
    // Validate form
    if (!label.trim() || !street.trim() || !city.trim() || !state.trim()) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (!latitude || !longitude) {
      Alert.alert("Error", "Please select a location on the map");
      return;
    }

    try {
      const addressData = {
        label: label.trim(),
        street: street.trim(),
        city: city.trim(),
        state: state.trim(),
        isDefault,
        coordinates: {
          lat: latitude,
          lng: longitude,
        },
      };

      let response;

      if (editMode && currentAddress) {
        // Update existing address
        response = await dataService.updateAddress(
          currentAddress._id,
          addressData
        );
      } else {
        // Add new address
        response = await dataService.addAddress(addressData);
      }

      if (response.success) {
        setModalVisible(false);
        fetchAddresses(); // Refresh address list
        Alert.alert(
          "Success",
          editMode
            ? "Address updated successfully"
            : "Address added successfully"
        );
      } else {
        Alert.alert("Error", response.message || "Failed to save address");
      }
    } catch (error) {
      console.error("Error saving address:", error);
      Alert.alert(
        "Error",
        `Failed to ${editMode ? "update" : "add"} address. Please try again.`
      );
    }
  };

  // Delete an address
  const handleDeleteAddress = (addressId) => {
    Alert.alert(
      "Delete Address",
      "Are you sure you want to delete this address?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await dataService.deleteAddress(addressId);
              if (response.success) {
                fetchAddresses(); // Refresh address list
                Alert.alert("Success", "Address deleted successfully");
              } else {
                Alert.alert(
                  "Error",
                  response.message || "Failed to delete address"
                );
              }
            } catch (error) {
              console.error("Error deleting address:", error);
              Alert.alert(
                "Error",
                "Failed to delete address. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  // Set an address as default
  const handleSetDefault = async (addressId) => {
    try {
      const response = await dataService.setDefaultAddress(addressId);
      if (response.success) {
        fetchAddresses(); // Refresh address list
      } else {
        Alert.alert(
          "Error",
          response.message || "Failed to set default address"
        );
      }
    } catch (error) {
      console.error("Error setting default address:", error);
      Alert.alert("Error", "Failed to set default address. Please try again.");
    }
  };

  // Open map modal to select location
  const openMapModal = () => {
    setMapModalVisible(true);
  };

  // Handle map marker drag
  const handleMapPress = useCallback(
    (event) => {
      const newLocation = event.nativeEvent.coordinate;
      setSelectedLocation(newLocation);

      // Update form state with new coordinates
      setFormState((prev) => ({
        ...prev,
        latitude: newLocation.latitude,
        longitude: newLocation.longitude,
      }));

      // Get address details based on selected location
      debouncedReverseGeocode(newLocation.latitude, newLocation.longitude);
    },
    [debouncedReverseGeocode]
  );

  // Save selected location from map
  const saveLocation = useCallback(() => {
    if (selectedLocation) {
      setFormState((prev) => ({
        ...prev,
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
      }));
      setMapModalVisible(false);
    } else {
      Alert.alert("Error", "Please select a location on the map");
    }
  }, [selectedLocation]);

  // Handle marker drag end
  const handleMarkerDragEnd = useCallback(
    (e) => {
      const newLocation = e.nativeEvent.coordinate;
      setSelectedLocation(newLocation);

      // Update form state with new coordinates
      setFormState((prev) => ({
        ...prev,
        latitude: newLocation.latitude,
        longitude: newLocation.longitude,
      }));

      // Get address details based on new marker position
      debouncedReverseGeocode(newLocation.latitude, newLocation.longitude);
    },
    [debouncedReverseGeocode]
  );

  // Optimized TextInput component with memoization to prevent rerenders
  const MemoizedTextInput = useMemo(
    () =>
      React.forwardRef((props, ref) => (
        <TextInput
          ref={ref}
          style={styles.input}
          mode="outlined"
          dense
          blurOnSubmit={false}
          autoCapitalize="words"
          underlineColor="transparent"
          {...props}
        />
      )),
    []
  );

  // Address Auto-fill Information component
  const AddressLocationInfo = useCallback(
    () => (
      <View style={styles.locationContainer}>
        <View style={styles.locationHeader}>
          <Text style={styles.locationLabel}>Location on Map:</Text>
          {reverseGeocodingInProgress && (
            <View style={styles.loadingIndicator}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Looking up address...</Text>
            </View>
          )}
        </View>

        {latitude && longitude ? (
          <Text style={styles.locationCoordinates}>
            Lat: {latitude.toFixed(6)}, Long: {longitude.toFixed(6)}
          </Text>
        ) : (
          <Text style={styles.locationPlaceholder}>No location selected</Text>
        )}
        <Button
          mode="contained"
          icon="map-marker"
          onPress={openMapModal}
          style={styles.mapButton}
          loading={reverseGeocodingInProgress}
        >
          {latitude && longitude ? "Change Location" : "Select Location"}
        </Button>
      </View>
    ),
    [
      latitude,
      longitude,
      reverseGeocodingInProgress,
      theme.colors.primary,
      openMapModal,
    ]
  );

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
          ) : street && city ? (
            <Text style={styles.mapAddressText}>
              {street}, {city}, {state}
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
            onPress={saveLocation}
            style={styles.mapSaveButton}
            disabled={!selectedLocation || reverseGeocodingInProgress}
          >
            Confirm Location
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
      street,
      city,
      state,
      saveLocation,
      reverseGeocodingInProgress,
    ]
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
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.goBack()}
          color={theme.colors.text}
        />
        <Text style={styles.headerTitle}>Saved Addresses</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshing={refreshing}
        onRefresh={fetchAddresses}
      >
        <Button
          mode="contained"
          icon="plus"
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleAddAddress}
        >
          Add New Address
        </Button>

        {addresses.length === 0 ? (
          <Card style={[styles.emptyCard, { ...theme.shadow.small }]}>
            <Card.Content style={styles.emptyContent}>
              <Ionicons
                name="location-outline"
                size={60}
                color={theme.colors.primary}
              />
              <Text style={styles.emptyText}>No saved addresses yet</Text>
              <Text style={styles.emptySubtext}>
                Add an address to make checkout faster
              </Text>
            </Card.Content>
          </Card>
        ) : (
          addresses.map((address) => (
            <Card
              key={address._id}
              style={[
                styles.addressCard,
                address.isDefault && styles.defaultCard,
                { ...theme.shadow.small },
              ]}
            >
              <Card.Content>
                <View style={styles.addressHeader}>
                  <View style={styles.labelContainer}>
                    <Text style={styles.addressLabel}>{address.label}</Text>
                    {address.isDefault && (
                      <View
                        style={[
                          styles.defaultBadge,
                          { backgroundColor: theme.colors.primary },
                        ]}
                      >
                        <Text style={styles.defaultText}>Default</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.actionButtons}>
                    <IconButton
                      icon="pencil"
                      size={20}
                      color={theme.colors.primary}
                      onPress={() => handleEditAddress(address)}
                    />
                    <IconButton
                      icon="delete"
                      size={20}
                      color={theme.colors.error}
                      onPress={() => handleDeleteAddress(address._id)}
                    />
                  </View>
                </View>

                <Divider style={styles.divider} />

                <Text style={styles.addressText}>
                  {address.street}, {address.city}, {address.state}
                </Text>

                {address.latitude && address.longitude && (
                  <Text style={styles.coordinatesText}>
                    GPS: {address.latitude.toFixed(6)},{" "}
                    {address.longitude.toFixed(6)}
                  </Text>
                )}

                {!address.isDefault && (
                  <Button
                    mode="outlined"
                    style={styles.setDefaultButton}
                    onPress={() => handleSetDefault(address._id)}
                  >
                    Set as Default
                  </Button>
                )}
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      <Portal>
        {/* Address Edit/Add Modal */}
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={[
            styles.modalContainer,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoid}
          >
            <ScrollView contentContainerStyle={styles.modalScrollContent}>
              <Title style={styles.modalTitle}>
                {editMode ? "Edit Address" : "Add New Address"}
              </Title>

              <MemoizedTextInput
                label="Label (e.g. Home, Work)"
                value={label}
                onChangeText={handleLabelChange}
                returnKeyType="next"
                maxLength={30}
              />

              <MemoizedTextInput
                label="Street Address"
                value={street}
                onChangeText={handleStreetChange}
                returnKeyType="next"
                maxLength={100}
              />

              <MemoizedTextInput
                label="City"
                value={city}
                onChangeText={handleCityChange}
                returnKeyType="next"
                maxLength={50}
              />

              <MemoizedTextInput
                label="State"
                value={state}
                onChangeText={handleStateChange}
                returnKeyType="done"
                maxLength={30}
              />

              <AddressLocationInfo />

              <TouchableOpacity
                style={styles.defaultOption}
                onPress={toggleIsDefault}
              >
                <RadioButton
                  value="default"
                  status={isDefault ? "checked" : "unchecked"}
                  onPress={toggleIsDefault}
                  color={theme.colors.primary}
                />
                <Text style={styles.defaultOptionText}>
                  Set as default address
                </Text>
              </TouchableOpacity>

              <View style={styles.modalButtons}>
                <Button
                  mode="outlined"
                  onPress={() => setModalVisible(false)}
                  style={styles.cancelButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSaveAddress}
                  style={[
                    styles.saveButton,
                    { backgroundColor: theme.colors.primary },
                  ]}
                  disabled={reverseGeocodingInProgress}
                >
                  Save
                </Button>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </Modal>

        {/* Map Modal */}
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
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  addButton: {
    marginBottom: 16,
  },
  emptyCard: {
    padding: 16,
    marginTop: 20,
    borderRadius: 8,
  },
  emptyContent: {
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    color: "#757575",
  },
  addressCard: {
    marginBottom: 16,
    borderRadius: 8,
  },
  defaultCard: {
    borderWidth: 2,
    borderColor: "#FF6B6B",
  },
  addressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  addressLabel: {
    fontSize: 18,
    fontWeight: "bold",
  },
  defaultBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  actionButtons: {
    flexDirection: "row",
  },
  divider: {
    marginVertical: 8,
  },
  addressText: {
    fontSize: 16,
    marginBottom: 4,
  },
  coordinatesText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 12,
  },
  setDefaultButton: {
    alignSelf: "flex-start",
    marginTop: 8,
  },
  modalContainer: {
    margin: 20,
    padding: 20,
    borderRadius: 8,
    maxHeight: "90%",
    width: "90%",
    alignSelf: "center",
  },
  mapModalContainer: {
    margin: 0,
    padding: 0,
    flex: 1,
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    marginBottom: 16,
    height: 60,
    backgroundColor: "transparent",
  },
  locationContainer: {
    marginBottom: 16,
  },
  locationLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  locationCoordinates: {
    fontSize: 14,
    marginBottom: 8,
  },
  locationPlaceholder: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    fontStyle: "italic",
  },
  mapButton: {
    marginTop: 8,
  },
  defaultOption: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  defaultOptionText: {
    fontSize: 16,
    marginLeft: 8,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: "bold",
    padding: 16,
    textAlign: "center",
  },
  map: {
    width: "100%",
    height: "80%",
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
  },
  modalScrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
});

export default SavedAddressesScreen;
