import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

// Polling interval in milliseconds (30 seconds)
const POLLING_INTERVAL = 30000;
// Max retries before showing error
const MAX_RETRIES = 3;

export default function PendingApprovalScreen() {
  const { user, logout, refreshUser } = useAuth();
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  useEffect(() => {
    if (user?.status !== 'pending_approval') return;

    let timeoutId: NodeJS.Timeout;

    const checkStatus = async () => {
      if (isChecking) return;
      
      setIsChecking(true);
      setError(null);

      try {
        // Option 1: Refresh the entire user object (recommended)
        await refreshUser();
        
        // Option 2: Or make a specific status check API call
        // const status = await checkDeliveryStatus();
        // if (status === 'active') {
        //   router.replace('/delivery/dashboard');
        // }

        // Reset retry count on success
        setRetryCount(0);
      } catch (err) {
        console.error('Status check failed:', err);
        setRetryCount(prev => prev + 1);
        
        if (retryCount >= MAX_RETRIES) {
          setError('Failed to check status. Please check your connection.');
        } else {
          setError('Checking status...');
        }
      } finally {
        setIsChecking(false);
        
        // Schedule next check only if still in pending status
        if (user?.status === 'pending_approval') {
          timeoutId = setTimeout(checkStatus, POLLING_INTERVAL);
        }
      }
    };

    // Initial check
    checkStatus();

    return () => {
      clearTimeout(timeoutId);
    };
  }, [user?.status, retryCount]);

  // Redirect if status changed elsewhere
  useEffect(() => {
    if (user?.status === 'active') {
      router.replace('/(delivery)/dashboard');
    }
  }, [user?.status]);

  return (
    <View style={styles.container}>
      <MaterialIcons name="pending-actions" size={100} color="#FFA500" />
      <Text style={styles.title}>Account Pending Approval</Text>
      
      <View style={styles.statusContainer}>
        {isChecking ? (
          <>
            <ActivityIndicator size="small" color="#FFA500" />
            <Text style={styles.statusText}>Checking status...</Text>
          </>
        ) : error ? (
          <Text style={[styles.statusText, styles.errorText]}>{error}</Text>
        ) : (
          <Text style={styles.statusText}>Last checked: just now</Text>
        )}
      </View>

      <Text style={styles.subtitle}>
        Your delivery partner account is under review. You'll receive a notification once approved.
      </Text>
      <Text style={styles.emailText}>Registered Email: {user?.email}</Text>
      
      <TouchableOpacity 
        style={styles.logoutButton} 
        onPress={handleLogout}
        disabled={isChecking}
      >
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    color: '#FF3B30',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  emailText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 40,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    maxWidth: 200,
    alignItems: 'center',
    opacity: 1,
  },
  logoutButtonDisabled: {
    opacity: 0.5,
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});