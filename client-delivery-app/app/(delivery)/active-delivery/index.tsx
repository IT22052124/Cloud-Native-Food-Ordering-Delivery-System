import { View, Text, StyleSheet, ActivityIndicator, Alert, Button } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Camera, Region } from 'react-native-maps';
import { useEffect, useState, useRef } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { useSocket } from '../../../context/SocketContext';
import * as Location from 'expo-location';
import { getDeliveryByIdAPI, updateDeliveryStatusAPI, trackDeliveryAPI, toggleAvailabilityAPI } from '../../../services/api';

export default function ActiveDeliveryScreen() {
  const { deliveryId } = useLocalSearchParams<{ deliveryId?: string }>();
  const { refreshUser } = useAuth();
  const { socket } = useSocket();
  const router = useRouter();

  const [delivery, setDelivery] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [routeCoords, setRouteCoords] = useState<any[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [previousLocation, setPreviousLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const mapRef = useRef<MapView>(null);

  const fetchDelivery = async () => {
    try {
      if (!deliveryId) return;
      const { delivery } = await getDeliveryByIdAPI(deliveryId);
      setDelivery(delivery);

      const { route } = await trackDeliveryAPI(deliveryId);
      if (route) {
        const formattedRoute = route.map((p: number[]) => ({ latitude: p[1], longitude: p[0] }));
        setRouteCoords(formattedRoute);
      }
    } catch (err) {
      console.error('Error fetching delivery:', err);
      Alert.alert('Error', 'Failed to load delivery');
    } finally {
      setLoading(false);
    }
  };

  // Fetch once
  useEffect(() => {
    fetchDelivery();
  }, [deliveryId]);

  // Watch location and animate map
  useEffect(() => {
    let subscription: Location.LocationSubscription;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Location permission is required.');
        return;
      }

      subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Highest, distanceInterval: 5, timeInterval: 2000 },
        (loc) => {
          const coords = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          };
          setPreviousLocation(currentLocation);
          setCurrentLocation(coords);

          if (socket && deliveryId) {
            socket.emit('updateLocation', {
              deliveryId,
              lat: coords.latitude,
              lng: coords.longitude,
            });
          }

          if (mapRef.current) {
            const camera: Camera = {
              center: coords,
              zoom: 16,
              heading: calculateHeading(previousLocation, coords),
              pitch: 45,
              altitude: 500,
            };
            mapRef.current.animateCamera(camera, { duration: 500 });
          }
        }
      );
    })();

    return () => {
      if (subscription) subscription.remove();
    };
  }, [deliveryId, socket, currentLocation]);

  // Live status update
  useEffect(() => {
    const handleStatusUpdate = async (data: any) => {
      if (data.deliveryId === deliveryId) {
        await fetchDelivery();
      }
    };
  
    if (socket && deliveryId) {
      socket.on('deliveryStatusUpdated', handleStatusUpdate);
      return () => {
        socket.off('deliveryStatusUpdated', handleStatusUpdate);
      };
    }
  
    // If no socket/deliveryId, return undefined correctly (React treats it as no cleanup)
    return;
  }, [socket, deliveryId]);

  // Show no delivery message if no delivery exists
  if (!deliveryId || !delivery) {
    if (!currentLocation) {
      return <ActivityIndicator size="large" style={{ marginTop: 60 }} />;
    }
  
    return (
      <View style={styles.container}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={StyleSheet.absoluteFillObject}
          showsUserLocation
          followsUserLocation={true}
          initialRegion={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          <Marker
            coordinate={currentLocation}
            title="Your Location"
            pinColor="#3A86FF"
          />
        </MapView>
  
        <View style={styles.noDeliveryContainer}>
          <Text style={styles.noDeliveryText}>No current deliveries assigned</Text>
          <Button
            title="Back to Dashboard"
            onPress={() => router.replace('/(delivery)/dashboard')}
          />
        </View>
      </View>
    );
  }

  const pickup = delivery.restaurant?.location?.coordinates;
  const dropoff = delivery.customer?.deliveryAddress?.coordinates?.coordinates;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject}
        showsUserLocation
        followsUserLocation={true}
        initialRegion={{
          latitude: pickup ? pickup[1] : currentLocation?.latitude || 7.8731,
          longitude: pickup ? pickup[0] : currentLocation?.longitude || 80.7718,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {/* Route Polyline */}
        {routeCoords.length > 1 && (
          <Polyline coordinates={routeCoords} strokeColor="#3A86FF" strokeWidth={4} />
        )}

        {/* Restaurant Marker */}
        {pickup && (
          <Marker
            coordinate={{
              latitude: pickup[1],
              longitude: pickup[0],
            }}
            title="Restaurant"
            pinColor="green"
          />
        )}

        {/* Customer Marker */}
        {dropoff && (
          <Marker
            coordinate={{
              latitude: dropoff[1],
              longitude: dropoff[0],
            }}
            title="Customer"
            pinColor="red"
          />
        )}
      </MapView>

      {/* Bottom Panel */}
      <View style={styles.bottomPanel}>
        <Text style={styles.status}>Status: {delivery.status}</Text>
        <StatusButtons deliveryId={deliveryId!} currentStatus={delivery.status} onUpdated={fetchDelivery} />
      </View>
    </View>
  );
}

function StatusButtons({ deliveryId, currentStatus, onUpdated }: { deliveryId: string; currentStatus: string; onUpdated: () => void }) {
  const router = useRouter();

  const statusFlow = [
    'DRIVER_ASSIGNED',
    'EN_ROUTE_TO_RESTAURANT',
    'ARRIVED_AT_RESTAURANT',
    'PICKED_UP',
    'EN_ROUTE_TO_CUSTOMER',
    'ARRIVED_AT_CUSTOMER',
    'DELIVERED',
  ];

  const nextStatus = statusFlow[statusFlow.indexOf(currentStatus) + 1];

  const handleNext = async () => {
    try {
      await updateDeliveryStatusAPI(deliveryId, nextStatus);
      Alert.alert('✅ Updated', `Status updated to: ${nextStatus}`);
      if (nextStatus === 'DELIVERED') {
        await toggleAvailabilityAPI();
        router.replace('/(delivery)/dashboard');
      } else {
        await onUpdated(); // ✅ Refresh delivery again
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update status');
    }
  };

  return nextStatus ? (
    <Button title={`Mark as ${nextStatus}`} onPress={handleNext} />
  ) : (
    <Text style={{ textAlign: 'center' }}>All steps completed 🎉</Text>
  );
}

function calculateHeading(from: any, to: any) {
  if (!from || !to) return 0;

  const lat1 = (from.latitude * Math.PI) / 180;
  const lat2 = (to.latitude * Math.PI) / 180;
  const dLon = ((to.longitude - from.longitude) * Math.PI) / 180;

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  const heading = (Math.atan2(y, x) * 180) / Math.PI;
  return (heading + 360) % 360;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bottomPanel: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  status: { fontSize: 16, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
  noDeliveryContainer: {
    position: 'absolute',
    top: 80,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  noDeliveryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
});
