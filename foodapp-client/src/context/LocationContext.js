import React, { createContext, useState, useContext, useEffect } from "react";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dataService from "../services/dataService";

// Create Location Context
const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [deliveryRange, setDeliveryRange] = useState(5); // Default 5km
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    // Load saved location data from AsyncStorage on app start
    const loadSavedLocationData = async () => {
      try {
        const savedLocationData = await AsyncStorage.getItem("locationData");
        if (savedLocationData) {
          const { selectedAddress: savedAddress, deliveryRange: savedRange } =
            JSON.parse(savedLocationData);
          if (savedAddress) setSelectedAddress(savedAddress);
          if (savedRange) setDeliveryRange(savedRange);
        }
      } catch (error) {
        console.error("Error loading saved location data:", error);
      }
    };

    loadSavedLocationData();
    getCurrentLocation();
  }, []);

  // Save location data to AsyncStorage when it changes
  useEffect(() => {
    const saveLocationData = async () => {
      try {
        const locationData = JSON.stringify({
          selectedAddress,
          deliveryRange,
        });
        await AsyncStorage.setItem("locationData", locationData);
      } catch (error) {
        console.error("Error saving location data:", error);
      }
    };

    saveLocationData();
  }, [selectedAddress, deliveryRange]);

  const getCurrentLocation = async () => {
    try {
      setLocationLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({});
        setCurrentLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        // Get address from coordinates
        const addresses = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        if (addresses && addresses.length > 0) {
          const address = addresses[0];
          if (!selectedAddress) {
            setSelectedAddress({
              label: "Current Location",
              street: address.street || "",
              city: address.city || "",
              state: address.region || "",
              isDefault: false,
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              isCurrentLocation: true,
            });
          }
        }
      }
    } catch (error) {
      console.error("Error getting current location:", error);
    } finally {
      setLocationLoading(false);
    }
  };

  const updateSavedAddresses = (addresses) => {
    setSavedAddresses(addresses);
  };

  const addCustomLocation = (location) => {
    setSelectedAddress({
      label: location.label || "Custom Location",
      street: location.street || location.address || "Custom Address",
      city: location.city || "",
      state: location.state || location.region || "",
      latitude: location.latitude,
      longitude: location.longitude,
      isCurrentLocation: false,
      isCustom: true,
    });
  };

  return (
    <LocationContext.Provider
      value={{
        currentLocation,
        setCurrentLocation,
        selectedAddress,
        setSelectedAddress,
        deliveryRange,
        setDeliveryRange,
        savedAddresses,
        setSavedAddresses: updateSavedAddresses,
        locationLoading,
        getCurrentLocation,
        addCustomLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

// Hook to use location context
export const useLocation = () => useContext(LocationContext);

export default LocationContext;
