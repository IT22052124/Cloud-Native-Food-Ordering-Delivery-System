import { useAuth } from '../../context/AuthContext';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import { useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { user, updateProfile, changePassword, toggleAvailability } = useAuth();
  const [loading, setLoading] = useState(false);

  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editVehiclePlate, setEditVehiclePlate] = useState(user?.vehiclePlate || '');

  // Password modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const handleUpdate = async () => {
    try {
      setLoading(true);
      await updateProfile({ 
        name: editName, 
        phone: editPhone, 
        vehiclePlate: editVehiclePlate 
      });
      Alert.alert('Success', 'Profile updated successfully');
      setShowEditModal(false);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not update profile');
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
      setShowPasswordModal(false);
      Alert.alert('Success', 'Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleToggleAvailability = async () => {
    try {
      await toggleAvailability();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to toggle availability');
    }
  };

  const openEditModal = () => {
    setEditName(user?.name || '');
    setEditPhone(user?.phone || '');
    setEditVehiclePlate(user?.vehiclePlate || '');
    setShowEditModal(true);
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#118AB2" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <MaterialIcons name="account-circle" size={80} color="#118AB2" />
        </View>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        
        <View style={styles.infoRow}>
          <MaterialIcons name="person" size={20} color="#666" />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>Name</Text>
            <Text style={styles.infoValue}>{user.name}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="email" size={20} color="#666" />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user.email}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="phone" size={20} color="#666" />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{user.phone || 'Not provided'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Vehicle Information</Text>
        
        <View style={styles.infoRow}>
          <MaterialIcons name="directions-car" size={20} color="#666" />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>Vehicle Plate</Text>
            <Text style={styles.infoValue}>{user.vehiclePlate || 'Not provided'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Account Status</Text>
        
        <View style={styles.infoRow}>
          <MaterialIcons name="verified-user" size={20} color="#666" />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>Status</Text>
            <Text style={[styles.infoValue, 
              { color: user.status === 'active' ? '#06D6A0' : '#EF476F' }]}>
              {user.status.split('_').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="toggle-on" size={20} color="#666" />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>Availability</Text>
            <TouchableOpacity onPress={handleToggleAvailability}>
              <Text style={[styles.infoValue, 
                { color: user.driverIsAvailable ? '#06D6A0' : '#EF476F' }]}>
                {user.driverIsAvailable ? 'Available' : 'Not Available'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={openEditModal}>
          <Text style={styles.actionButtonText}>Edit Profile</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.changePasswordButton]} 
          onPress={() => setShowPasswordModal(true)}
        >
          <Text style={styles.actionButtonText}>Change Password</Text>
        </TouchableOpacity>
      </View>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Edit Profile</Text>

            <TextInput
              placeholder="Full Name"
              style={styles.input}
              value={editName}
              onChangeText={setEditName}
            />
            <TextInput
              placeholder="Phone"
              style={styles.input}
              value={editPhone}
              onChangeText={setEditPhone}
              keyboardType="phone-pad"
            />
            <TextInput
              placeholder="Vehicle Plate"
              style={styles.input}
              value={editVehiclePlate}
              onChangeText={setEditVehiclePlate}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleUpdate}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Password Change Modal */}
      <Modal
        visible={showPasswordModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowPasswordModal(false)}
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
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowPasswordModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handlePasswordSubmit}
                disabled={changingPassword}
              >
                {changingPassword ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    marginBottom: 12,
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
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
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  actionsContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  actionButton: {
    backgroundColor: '#118AB2',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  changePasswordButton: {
    backgroundColor: '#EF476F',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    backgroundColor: '#fff',
    fontSize: 16,
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
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 120,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#06D6A0',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});