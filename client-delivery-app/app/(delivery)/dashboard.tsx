import React, { useEffect, useState } from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView, RefreshControl, ImageBackground } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { getCurrentDriverDeliveryAPI, toggleAvailabilityAPI, getCurrentMonthEarningsAPI } from '../../services/api';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import AppHeader from '../../components/AppHeader';
import { useSocketDeliveryAlert } from '../../hooks/useSocketDeliveryAlert';
import IncomingDeliveryModal from '../../components/IncomingDeliveryModal';
import MapView, { Marker, Polyline } from 'react-native-maps';

export default function DeliveryDashboard() {
  const { user, logout, refreshUser } = useAuth();
  const { goOnline, goOffline } = useSocket();
  const [isOnline, setIsOnline] = useState(user?.driverIsAvailable || false);
  const [toggling, setToggling] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [currentDelivery, setCurrentDelivery] = useState<any>(null);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [monthlyEarnings, setMonthlyEarnings] = useState<number | null>(null);
  const [loadingEarnings, setLoadingEarnings] = useState(false);
  const {
    modalVisible,
    incomingData,
    handleAccept,
    handleDismiss,
  } = useSocketDeliveryAlert();

  useSocketDeliveryAlert(); // Always listen for incoming delivery

  const handleLogout = async () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoggingOut(true);
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
            } finally {
              setLoggingOut(false);
            }
          }
        }
      ]
    );
  };

  const fetchCurrentMonthEarnings = async () => {
    try {
      setLoadingEarnings(true);
      if (!user?.id) {
        console.warn('No user ID found when fetching earnings');
        return;
      }
  
      const data = await getCurrentMonthEarningsAPI(user.id);
      console.log('Monthly earnings fetched:', data.total);
  
      if (data.success) {
        setMonthlyEarnings(data.total);
      }
    } catch (error) {
      console.error('Failed to fetch earnings:', error);
    } finally {
      setLoadingEarnings(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchCurrentDelivery(), fetchCurrentLocation()]);
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    console.log('User context loaded:', user); // for debug
  }, [user]);
  
  useEffect(() => {
    if (user?.id) {
      console.log('Driver ID for earnings:', user.id);
      fetchCurrentMonthEarnings();
    }
  }, [user?.id]);

  const fetchCurrentDelivery = async () => {
    try {
      const { delivery } = await getCurrentDriverDeliveryAPI();
      setCurrentDelivery(delivery);
    } catch (error) {
      console.log('No current delivery or error:', error);
      setCurrentDelivery(null);
    }
  };

  const fetchCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Location permission is required to show your location.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setCurrentLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    } catch (err) {
      console.error('Failed to fetch location', err);
    }
  };

  const toggleStatus = async () => {
    try {
      setToggling(true);

      if (!isOnline) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Location Required', 'Please enable location to go online.');
          return;
        }
        const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        goOnline(location.coords.latitude, location.coords.longitude);
        await toggleAvailabilityAPI();
      } else {
        goOffline();
        await toggleAvailabilityAPI();
      }

      await refreshUser();
      setIsOnline((prev) => !prev);

    } catch (err) {
      console.error('Toggle error:', err);
      Alert.alert('Error', 'Could not update availability');
    } finally {
      setToggling(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
      contentContainerStyle={[styles.scrollContainer, { paddingBottom: 70 }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refreshData}
          colors={['#3A86FF']} // Customize the loading indicator color
          tintColor="#3A86FF" // iOS only
        />
      }
      >
        {/* Header with Background Image */}
        <ImageBackground 
          source={require('../../assets/images/BG.png')} // Replace with your image
          resizeMode="cover"
          style={styles.headerBackground}
          imageStyle={styles.headerImageStyle}
        >
          <View style={styles.headerOverlay}>
            <AppHeader 
              title={
                <View style={{ backgroundColor: 'transparent' }}>
                  <Text style={styles.headerTitle}>Welcome Back</Text>
                  <Text style={styles.headerSubtitle}>Driver Dashboard</Text>
                </View>
              }
              titleStyle={styles.headerTitleContainer}
              rightAction={
                <TouchableOpacity 
                  onPress={refreshData} 
                  disabled={refreshing}
                  style={styles.refreshButton}
                >
                  {refreshing ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <MaterialIcons name="refresh" size={24} color="#FFF" />
                  )}
                </TouchableOpacity>
              }
              headerStyle={styles.transparentHeader}
            />
          </View>
        </ImageBackground>

        {/* Status Card */}
        <View style={styles.card}>
          <View style={styles.statusRow}>
            <View style={styles.userInfo}>
              <Text style={styles.greeting}>Hello,</Text>
              <Text style={styles.userName}>{user?.name || 'Driver'}</Text>
              <View style={[styles.statusIndicator, isOnline ? styles.online : styles.offline]}>
                <Text style={styles.statusText}>
                  {isOnline ? 'Online - Accepting orders' : 'Offline'}
                </Text>
              </View>
            </View>
            
            <View style={styles.switchContainer}>
              {toggling ? (
                <ActivityIndicator size="small" color="#3A86FF" />
              ) : (
                <>
                  <Text style={styles.switchLabel}>{isOnline ? 'ONLINE' : 'OFFLINE'}</Text>
                  <Switch
                    value={isOnline}
                    onValueChange={toggleStatus}
                    disabled={toggling}
                    thumbColor="#fff"
                    trackColor={{ true: '#4CAF50', false: '#9E9E9E' }}
                  />
                </>
              )}
            </View>
          </View>
        </View>

        {/* Map Section */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="local-shipping" size={20} color="#3A86FF" />
            <Text style={styles.sectionTitle}>
              {currentDelivery ? 'Active Delivery' : 'Your Location'}
            </Text>
          </View>

          {currentLocation ? (
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: currentDelivery 
                    ? currentDelivery.restaurant.location.coordinates[1]
                    : currentLocation.latitude,
                  longitude: currentDelivery 
                    ? currentDelivery.restaurant.location.coordinates[0]
                    : currentLocation.longitude,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
                pitchEnabled={false}
                rotateEnabled={false}
              >
                {currentDelivery ? (
                  <>
                    <Marker
                      coordinate={{
                        latitude: currentDelivery.restaurant.location.coordinates[1],
                        longitude: currentDelivery.restaurant.location.coordinates[0],
                      }}
                      title="Pickup (Restaurant)"
                    >
                      <View style={styles.markerContainer}>
                        <FontAwesome5 name="store" size={16} color="#fff" />
                      </View>
                    </Marker>
                    <Marker
                      coordinate={{
                        latitude: currentDelivery.customer.deliveryAddress.coordinates.coordinates[1],
                        longitude: currentDelivery.customer.deliveryAddress.coordinates.coordinates[0],
                      }}
                      title="Dropoff (Customer)"
                    >
                      <View style={styles.markerContainer}>
                        <FontAwesome5 name="home" size={16} color="#fff" />
                      </View>
                    </Marker>
                    <Polyline
                      coordinates={[
                        {
                          latitude: currentDelivery.restaurant.location.coordinates[1],
                          longitude: currentDelivery.restaurant.location.coordinates[0],
                        },
                        {
                          latitude: currentDelivery.customer.deliveryAddress.coordinates.coordinates[1],
                          longitude: currentDelivery.customer.deliveryAddress.coordinates.coordinates[0],
                        }
                      ]}
                      strokeColor="#3A86FF"
                      strokeWidth={4}
                    />
                  </>
                ) : (
                  <Marker
                    coordinate={{
                      latitude: currentLocation.latitude,
                      longitude: currentLocation.longitude,
                    }}
                    title="You are here"
                  >
                    <View style={styles.currentLocationMarker}>
                      <View style={styles.currentLocationPulse} />
                      <FontAwesome5 name="motorcycle" size={16} color="#fff" />
                    </View>
                  </Marker>
                )}
              </MapView>

              {currentDelivery ? (
                <TouchableOpacity 
                  style={styles.deliveryButton}
                  onPress={() => router.push(`/(delivery)/active-delivery?deliveryId=${currentDelivery._id}`)}
                >
                  <Text style={styles.deliveryButtonText}>View Delivery Details</Text>
                  <MaterialIcons name="chevron-right" size={24} color="#fff" />
                </TouchableOpacity>
              ) : (
                <View style={styles.noDeliveryContainer}>
                  <MaterialIcons name="local-shipping" size={24} color="#9E9E9E" />
                  <Text style={styles.noDeliveryText}>No active deliveries</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.locationLoading}>
              <ActivityIndicator size="small" color="#3A86FF" />
              <Text style={styles.locationLoadingText}>Getting your location...</Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <ActionButton
              icon="assignment"
              label="My Deliveries"
              onPress={() => router.push('/')}
              color="#FF9E00"
            />
            <ActionButton
              icon="attach-money"
              label="Earnings"
              onPress={() => router.push('/')}
              color="#4CAF50"
            />
            <ActionButton
              icon="account-circle"
              label="Profile"
              onPress={() => router.push('/(delivery)/profile')}
              color="#3F51B5"
            />
            <ActionButton
              icon="help"
              label="Support"
              onPress={() => router.push('/')}
              color="#9C27B0"
            />
          </View>
        </View>

        {/* Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>24</Text>
            <Text style={styles.statLabel}>Deliveries</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>4.9</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {loadingEarnings ? (
                <ActivityIndicator size="small" color="#3A86FF" />
              ) : (
                `$${(monthlyEarnings || 0).toFixed(2)}`
              )}
            </Text>
            <Text style={styles.statLabel}>Earnings</Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MaterialIcons name="logout" size={18} color="#fff" />
              <Text style={styles.logoutText}>Logout</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Incoming Delivery Modal */}
      {incomingData && (
        <IncomingDeliveryModal
          visible={modalVisible}
          data={incomingData}
          onAccept={handleAccept}
          onDismiss={handleDismiss}
        />
      )}
    </View>
  );
}

function ActionButton({ icon, label, color, onPress }: any) {
  return (
    <TouchableOpacity 
      style={[styles.actionButton, { backgroundColor: color }]} 
      onPress={onPress}
    >
      <View style={styles.actionIconContainer}>
        <MaterialIcons name={icon} size={24} color="#fff" />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  headerBackground: {
    width: '100%',
    height: 180, // Adjust height as needed
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  headerImageStyle: {
    opacity: 0.9,
  },
  headerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)', // Dark overlay for better text visibility
    padding: 16,
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '300',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  transparentHeader: {
    backgroundColor: 'transparent',
    elevation: 0, // Remove shadow on Android
    shadowOpacity: 0, // Remove shadow on iOS
    borderBottomWidth: 0,
  },
  refreshButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    paddingBottom: 0, // Add some bottom padding
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: '#757575',
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212121',
    marginTop: 4,
  },
  statusIndicator: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  online: {
    backgroundColor: '#E8F5E9',
  },
  offline: {
    backgroundColor: '#F5F5F5',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  switchContainer: {
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#757575',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: '#212121',
  },
  mapContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: 180,
    marginBottom: 12,
  },
  markerContainer: {
    backgroundColor: '#3A86FF',
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
  },
  currentLocationMarker: {
    backgroundColor: '#FF5252',
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentLocationPulse: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 82, 82, 0.3)',
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  deliveryButton: {
    backgroundColor: '#3A86FF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  deliveryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  noDeliveryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  noDeliveryText: {
    color: '#9E9E9E',
    marginLeft: 8,
  },
  locationLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  locationLoadingText: {
    color: '#757575',
    marginLeft: 8,
  },
  actionsContainer: {
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    width: '48%',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIconContainer: {
    marginRight: 8,
  },
  actionLabel: {
    color: '#fff',
    fontWeight: '500',
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3A86FF',
  },
  statLabel: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: '#F44336',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
});