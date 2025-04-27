import { useAuth } from '../../context/AuthContext';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  Alert,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useState } from 'react';

export default function ProfileScreen() {
  const { user, updateProfile, changePassword } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [vehiclePlate, setVehiclePlate] = useState(user?.vehiclePlate || '');
  const [loading, setLoading] = useState(false);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const handleUpdate = async () => {
    try {
      setLoading(true);
      await updateProfile({ name, phone, vehiclePlate });
      Alert.alert('Success', 'Profile updated');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not update');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert('Error', 'Please fill both fields');
      return;
    }

    try {
      setChangingPassword(true);
      await changePassword({ currentPassword, newPassword });
      setShowModal(false);
      Alert.alert('Success', 'Password changed');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Edit Profile</Text>

      <TextInput
        placeholder="Full Name"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        placeholder="Phone"
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <TextInput
        placeholder="Vehicle Plate"
        style={styles.input}
        value={vehiclePlate}
        onChangeText={setVehiclePlate}
      />

      <Button
        title={loading ? 'Updating...' : 'Update Profile'}
        onPress={handleUpdate}
        disabled={loading}
      />
      <View style={{ marginTop: 20 }} />
      <Button title="Change Password" onPress={() => setShowModal(true)} color="#EF476F" />

      {/* Password Change Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Change Password</Text>

            <TextInput
              style={styles.input}
              placeholder="Current Password"
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="New Password"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#ccc' }]}
                onPress={() => setShowModal(false)}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#06D6A0' }]}
                onPress={handlePasswordSubmit}
                disabled={changingPassword}
              >
                {changingPassword ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: '#fff' }}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  heading: { fontSize: 22, fontWeight: '600', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 12,
    marginBottom: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginLeft: 10,
  },
});
