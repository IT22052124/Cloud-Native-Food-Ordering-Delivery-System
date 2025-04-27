import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function PendingApproval() {
  const { logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Account is Pending Approval</Text>
      <Text style={styles.subtitle}>Please wait for admin verification. You’ll be notified once approved.</Text>

      <TouchableOpacity style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 40 },
  button: {
    backgroundColor: '#FF3B30',
    padding: 12,
    borderRadius: 5,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
