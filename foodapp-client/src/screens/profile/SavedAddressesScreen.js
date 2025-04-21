import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
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

const { width, height } = Dimensions.get("window");
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const SavedAddressesScreen = ({ navigation }) => {
  const theme = useTheme();

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(null);
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Form state
  const [label, setLabel] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

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

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      });

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

  // Open modal to add a new address
  const handleAddAddress = () => {
    setEditMode(false);
    setCurrentAddress(null);
    setLabel("");
    setStreet("");
    setCity("");
    setState("");
    setLatitude(null);
    setLongitude(null);
    setIsDefault(addresses.length === 0); // Set default true if it's the first address
    setModalVisible(true);

    // Set the selected location to the user's current location
    if (userLocation) {
      setSelectedLocation({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      });
    }
  };

  // Open modal to edit an existing address
  const handleEditAddress = (address) => {
    setEditMode(true);
    setCurrentAddress(address);
    setLabel(address.label);
    setStreet(address.street);
    setCity(address.city);
    setState(address.state);
    setIsDefault(address.isDefault);

    // Set latitude and longitude if available in the address
    if (address.latitude && address.longitude) {
      setLatitude(address.latitude);
      setLongitude(address.longitude);
      setSelectedLocation({
        latitude: address.latitude,
        longitude: address.longitude,
      });
    } else {
      setLatitude(null);
      setLongitude(null);
    }

    setModalVisible(true);
  };

  // Save new address or update existing one
  const handleSaveAddress = async () => {
    // Validate form
    if (!label || !street || !city || !state) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (!latitude || !longitude) {
      Alert.alert("Error", "Please select a location on the map");
      return;
    }

    try {
      const addressData = {
        label,
        street,
        city,
        state,
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
  const handleMapPress = (event) => {
    setSelectedLocation(event.nativeEvent.coordinate);
  };

  // Save selected location from map
  const saveLocation = () => {
    if (selectedLocation) {
      setLatitude(selectedLocation.latitude);
      setLongitude(selectedLocation.longitude);
      setMapModalVisible(false);
    } else {
      Alert.alert("Error", "Please select a location on the map");
    }
  };

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
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={[
            styles.modalContainer,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <Title style={styles.modalTitle}>
              {editMode ? "Edit Address" : "Add New Address"}
            </Title>

            <TextInput
              label="Label (e.g. Home, Work)"
              value={label}
              onChangeText={setLabel}
              style={styles.input}
              mode="outlined"
              dense
              blurOnSubmit={false}
              returnKeyType="next"
              autoCapitalize="words"
            />

            <TextInput
              label="Street Address"
              value={street}
              onChangeText={setStreet}
              style={styles.input}
              mode="outlined"
              dense
              blurOnSubmit={false}
              returnKeyType="next"
              autoCapitalize="words"
            />

            <TextInput
              label="City"
              value={city}
              onChangeText={setCity}
              style={styles.input}
              mode="outlined"
              dense
              blurOnSubmit={false}
              returnKeyType="next"
              autoCapitalize="words"
            />

            <TextInput
              label="State"
              value={state}
              onChangeText={setState}
              style={styles.input}
              mode="outlined"
              dense
              blurOnSubmit={false}
              returnKeyType="done"
              autoCapitalize="words"
            />

            <View style={styles.locationContainer}>
              <Text style={styles.locationLabel}>Location on Map:</Text>
              {latitude && longitude ? (
                <Text style={styles.locationCoordinates}>
                  Lat: {latitude.toFixed(6)}, Long: {longitude.toFixed(6)}
                </Text>
              ) : (
                <Text style={styles.locationPlaceholder}>
                  No location selected
                </Text>
              )}
              <Button
                mode="contained"
                icon="map-marker"
                onPress={openMapModal}
                style={styles.mapButton}
              >
                {latitude && longitude ? "Change Location" : "Select Location"}
              </Button>
            </View>

            <TouchableOpacity
              style={styles.defaultOption}
              onPress={() => setIsDefault(!isDefault)}
            >
              <RadioButton
                value="default"
                status={isDefault ? "checked" : "unchecked"}
                onPress={() => setIsDefault(!isDefault)}
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
              >
                Save
              </Button>
            </View>
          </ScrollView>
        </Modal>

        <Modal
          visible={mapModalVisible}
          onDismiss={() => setMapModalVisible(false)}
          contentContainerStyle={styles.mapModalContainer}
        >
          <View style={styles.mapContainer}>
            <Text style={styles.mapTitle}>Select Location</Text>

            {userLocation && (
              <MapView
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                initialRegion={userLocation}
                onPress={handleMapPress}
              >
                {selectedLocation && (
                  <Marker
                    coordinate={selectedLocation}
                    draggable
                    onDragEnd={(e) =>
                      setSelectedLocation(e.nativeEvent.coordinate)
                    }
                  />
                )}
              </MapView>
            )}

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
              >
                Confirm Location
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
