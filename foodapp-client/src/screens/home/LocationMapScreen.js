import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Text,
  Platform,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "react-native-paper";
import { useTheme } from "../../context/ThemeContext";
import { useLocation } from "../../context/LocationContext";
import { SafeAreaView } from "react-native-safe-area-context";

const LocationMapScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const { currentLocation } = useLocation();
  const { onLocationSelect } = route.params || {};

  const [selectedLocation, setSelectedLocation] = useState(currentLocation);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState("");
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    if (currentLocation) {
      setSelectedLocation(currentLocation);
      setRegion({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
      reverseGeocode(currentLocation.latitude, currentLocation.longitude);
      setLoading(false);
    } else {
      getCurrentLocation();
    }
  }, [currentLocation]);

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("Location permission not granted");
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      setSelectedLocation({ latitude, longitude });
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
      reverseGeocode(latitude, longitude);
      setLoading(false);
    } catch (error) {
      console.error("Error getting current location:", error);
      setLoading(false);
    }
  };

  const reverseGeocode = async (latitude, longitude) => {
    try {
      const response = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (response && response.length > 0) {
        const { street, city, region, country } = response[0];
        const addressText = [street, city, region, country]
          .filter(Boolean)
          .join(", ");
        setAddress(addressText);
      }
    } catch (error) {
      console.error("Error reverse geocoding:", error);
    }
  };

  const handleMapPress = (event) => {
    const { coordinate } = event.nativeEvent;
    console.log("coordinate", event.nativeEvent);
    setSelectedLocation(coordinate);
    reverseGeocode(coordinate.latitude, coordinate.longitude);
  };

  const handleConfirm = () => {
    if (onLocationSelect && selectedLocation) {
      onLocationSelect({
        ...selectedLocation,
        address,
        label: "Custom Location",
        isCustom: true,
      });
    }
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Location</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <>
          <MapView
            style={styles.map}
            region={region}
            onRegionChangeComplete={setRegion}
            onPress={handleMapPress}
          >
            {selectedLocation && (
              <Marker
                coordinate={selectedLocation}
                draggable
                onDragEnd={(e) => {
                  setSelectedLocation(e.nativeEvent.coordinate);
                  reverseGeocode(
                    e.nativeEvent.coordinate.latitude,
                    e.nativeEvent.coordinate.longitude
                  );
                }}
              />
            )}
          </MapView>

          <View style={styles.footer}>
            <View style={styles.addressContainer}>
              <Ionicons
                name="location"
                size={24}
                color={theme.colors.primary}
              />
              <Text style={styles.addressText} numberOfLines={2}>
                {address || "Drop pin to select location"}
              </Text>
            </View>
            <Button
              mode="contained"
              onPress={handleConfirm}
              style={styles.confirmButton}
              disabled={!selectedLocation}
            >
              Confirm Location
            </Button>
          </View>

          <TouchableOpacity
            style={styles.currentLocationButton}
            onPress={getCurrentLocation}
          >
            <Ionicons name="locate" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginRight: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  map: {
    flex: 1,
  },
  footer: {
    backgroundColor: "white",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eeeeee",
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  addressText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  confirmButton: {
    borderRadius: 8,
  },
  currentLocationButton: {
    position: "absolute",
    right: 16,
    bottom: 100,
    backgroundColor: "white",
    padding: 12,
    borderRadius: 30,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
});

export default LocationMapScreen;
