import React, { useEffect, useState } from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { toggleAvailabilityAPI } from '../../services/api';
import { MaterialIcons } from '@expo/vector-icons';
import AppHeader from '../../components/AppHeader';
import { useSocketDeliveryAlert } from '../../hooks/useSocketDeliveryAlert';
import IncomingDeliveryModal from '../../components/IncomingDeliveryModal';

export default function DeliveryDashboard() {
  const { user, logout, refreshUser } = useAuth();
  const { goOnline, goOffline } = useSocket();
  const [isOnline, setIsOnline] = useState(user?.driverIsAvailable || false);
  const [toggling, setToggling] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const {
    modalVisible,
    incomingData,
    handleAccept,
    handleDismiss,
  } = useSocketDeliveryAlert();

  useSocketDeliveryAlert(); // 🔥 Always listen for incoming delivery

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoggingOut(false);
    }
  };

  const toggleStatus = async () => {
    try {
      setToggling(true);

      if (!isOnline) {
        // Going online: get location first
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Location Required', 'Please enable location to go online.');
          return;
        }
        const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });

        // Emit to socket
        goOnline(location.coords.latitude, location.coords.longitude);

        // Update in Auth service
        await toggleAvailabilityAPI();
      } else {
        // Going offline: emit and update
        goOffline();
        await toggleAvailabilityAPI();
      }

      await refreshUser(); // Refresh user from auth
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
      {/* Status header */}
      <AppHeader title="Dashboard" />
      <View style={styles.card}>
        <View style={styles.statusRow}>
          <View>
            <Text style={styles.title}>Welcome, {user?.name || 'Driver'}!</Text>
            <Text style={styles.subText}>
              {isOnline ? 'You’re online and visible to restaurants' : 'Currently offline'}
            </Text>
          </View>
          <Switch
            value={isOnline}
            onValueChange={toggleStatus}
            disabled={toggling}
            thumbColor={isOnline ? '#3A86FF' : '#EF476F'}
          />
        </View>
      </View>

      {/* Quick actions */}
      <View style={styles.actions}>
        <ActionButton
          icon="assignment"
          label="Assignments"
          onPress={() => router.push('/')}
          color="#8338EC"
        />
        <ActionButton
          icon="attach-money"
          label="Earnings"
          onPress={() => router.push('/')}
          color="#06D6A0"
        />
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        disabled={loggingOut}
      >
        {loggingOut ? <ActivityIndicator color="#fff" /> : <Text style={styles.logoutText}>Logout</Text>}
      </TouchableOpacity>

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
    <TouchableOpacity style={[styles.actionButton, { backgroundColor: color }]} onPress={onPress}>
      <MaterialIcons name={icon} size={24} color="#fff" />
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA', padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 20, fontFamily: 'Inter-SemiBold' },
  subText: { color: '#6C757D', marginTop: 4 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  actionLabel: { marginTop: 8, color: '#fff', fontFamily: 'Inter-Medium' },
  logoutButton: {
    backgroundColor: '#EF476F',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 32,
  },
  logoutText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
