import { View, Text, StyleSheet, ActivityIndicator, Alert, Button } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Camera } from 'react-native-maps';
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

  // Fetch delivery info only if deliveryId exists
  useEffect(() => {
    if (!deliveryId) {
      setLoading(false); // No delivery to load, so stop loading
      return;
    }

    const fetchData = async () => {
      try {
        const { delivery } = await getDeliveryByIdAPI(deliveryId);
        setDelivery(delivery);

        const { driverLocation, route } = await trackDeliveryAPI(deliveryId);
        if (route) {
          const formattedRoute = route.map((p: number[]) => ({ latitude: p[1], longitude: p[0] }));
          setRouteCoords(formattedRoute);
        }
      } catch (err) {
        Alert.alert('Error', 'Failed to load delivery');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [deliveryId]);

  // Watch Location + Emit + Animate Map
  useEffect(() => {
    let subscription: Location.LocationSubscription;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Location is needed to update your delivery status.');
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

          // Send location to backend
          if (socket && deliveryId) {
            socket.emit('updateLocation', {
              deliveryId,
              lat: coords.latitude,
              lng: coords.longitude,
            });
          }

          // Animate camera to follow driver
          if (mapRef.current) {
            const camera: Camera = {
              center: coords,
              zoom: 16,
              heading: calculateHeading(previousLocation, coords),
              pitch: 45,
              altitude: 500,
            };
            mapRef.current.animateCamera(camera, { duration: 800 });
          }
        }
      );
    })();

    return () => {
      if (subscription) subscription.remove();
    };
  }, [deliveryId, socket, currentLocation]);

  // Listen for real-time delivery status update
  useEffect(() => {
    if (!socket || !deliveryId) return;

    const handleStatusUpdate = (data: any) => {
      if (data.deliveryId === deliveryId) {
        setDelivery((prev: any) => ({
          ...prev,
          status: data.status,
        }));
      }
    };

    socket.on('deliveryStatusUpdated', handleStatusUpdate);

    return () => {
      socket.off('deliveryStatusUpdated', handleStatusUpdate);
    };
  }, [socket, deliveryId]);

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 60 }} />;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject}
        showsUserLocation
        initialRegion={{
          latitude: currentLocation?.latitude || 7.8731,
          longitude: currentLocation?.longitude || 80.7718,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {routeCoords.length > 1 && (
          <Polyline coordinates={routeCoords} strokeColor="#3A86FF" strokeWidth={4} />
        )}

        {/* Restaurant Marker */}
        {delivery?.restaurant?.location?.coordinates && (
          <Marker
            coordinate={{
              latitude: delivery.restaurant.location.coordinates[1],
              longitude: delivery.restaurant.location.coordinates[0],
            }}
            title="Restaurant"
          />
        )}

        {/* Customer Marker */}
        {delivery?.customer?.deliveryAddress?.coordinates?.coordinates && (
          <Marker
            coordinate={{
              latitude: delivery.customer.deliveryAddress.coordinates.coordinates[1],
              longitude: delivery.customer.deliveryAddress.coordinates.coordinates[0],
            }}
            title="Customer"
          />
        )}
      </MapView>

      <View style={styles.bottomPanel}>
        {delivery ? (
          <>
            <Text style={styles.status}>Status: {delivery.status}</Text>
            <StatusButtons
              deliveryId={deliveryId!}
              currentStatus={delivery.status}
              onUpdated={() => refreshUser()}
            />
          </>
        ) : (
          <Text style={styles.status}>No active delivery yet. Waiting for orders...</Text>
        )}
      </View>
    </View>
  );
}

// Button group for moving delivery status forward
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
      const updated = await updateDeliveryStatusAPI(deliveryId, nextStatus);
      Alert.alert('✅ Updated', `Status: ${nextStatus}`);

      if (nextStatus === 'DELIVERED') {
        await toggleAvailabilityAPI();
        await onUpdated();
        router.replace('/(delivery)/dashboard');
      } else {
        await onUpdated();
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update status');
    }
  };

  return nextStatus ? (
    <Button title={`Mark as ${nextStatus}`} onPress={handleNext} />
  ) : (
    <Text>All steps completed 🎉</Text>
  );
}

// Helper to calculate heading/bearing between two locations
function calculateHeading(from: any, to: any) {
  if (!from || !to) return 0;

  const lat1 = (from.latitude * Math.PI) / 180;
  const lat2 = (to.latitude * Math.PI) / 180;
  const dLon = ((to.longitude - from.longitude) * Math.PI) / 180;

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  const heading = (Math.atan2(y, x) * 180) / Math.PI;
  return (heading + 360) % 360;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { textAlign: 'center', marginTop: 20 },
  bottomPanel: {
    position: 'absolute',
    bottom: 20,
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
});
