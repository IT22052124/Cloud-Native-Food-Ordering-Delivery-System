import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  Text,
  Avatar,
  Card,
  Divider,
  Button,
  IconButton,
  List,
  Modal,
  TextInput,
  Switch,
  Portal,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import * as ImagePicker from "expo-image-picker";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

const ProfileScreen = ({ navigation }) => {
  const theme = useTheme();
  const { user, updateUserProfile, logout, isLoading } = useAuth();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editField, setEditField] = useState("");
  const [editValue, setEditValue] = useState("");
  const [editLabel, setEditLabel] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(theme.mode === "dark");

  const openEditModal = (field, currentValue, label) => {
    setEditField(field);
    setEditValue(currentValue);
    setEditLabel(label);
    setEditModalVisible(true);
  };

  const saveProfileChanges = async () => {
    if (!editValue.trim()) {
      Alert.alert("Error", `${editLabel} cannot be empty`);
      return;
    }

    try {
      const updatedFields = { [editField]: editValue };
      await updateUserProfile(updatedFields);
      setEditModalVisible(false);
    } catch (error) {
      Alert.alert(
        "Error",
        `Failed to update ${editLabel.toLowerCase()}: ${error.message}`
      );
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => logout(),
      },
    ]);
  };

  const pickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "You need to allow access to your photos to change your profile picture."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        setUploadingImage(true);

        try {
          // Let the updateUserProfile method handle the image upload and field mapping
          await updateUserProfile({
            profileImage: imageUri,
          });

          Alert.alert("Success", "Profile picture updated successfully");
        } catch (error) {
          console.error("Profile picture update error:", error);
          Alert.alert(
            "Error",
            error.message || "Failed to update profile picture"
          );
        } finally {
          setUploadingImage(false);
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update profile picture");
      console.error("Error picking image:", error);
      setUploadingImage(false);
    }
  };

  const toggleDarkMode = () => {
    const newMode = !darkModeEnabled;
    setDarkModeEnabled(newMode);
    theme.setMode(newMode ? "dark" : "light");
  };

  if (isLoading || !user) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.profileImageContainer}>
            {uploadingImage ? (
              <View style={styles.uploadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
              </View>
            ) : user.profilePicture ? (
              <Image
                source={{ uri: user.profilePicture }}
                style={styles.profileImage}
              />
            ) : (
              <Avatar.Text
                size={100}
                label={`${user.name?.charAt(0) || ""}`}
                backgroundColor={theme.colors.primary}
              />
            )}
            <TouchableOpacity
              style={[
                styles.editImageButton,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={pickImage}
              disabled={uploadingImage}
            >
              <Ionicons name="camera" size={20} color="white" />
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>

        <Card style={[styles.section, { ...theme.shadow.small }]}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Account Information</Text>

            <List.Item
              title="Name"
              description={`${user.name} `}
              left={(props) => <List.Icon {...props} icon="account" />}
              right={(props) => (
                <IconButton
                  {...props}
                  icon="pencil"
                  onPress={() => openEditModal("name", user.name, "Name")}
                />
              )}
            />

            <Divider />

            <List.Item
              title="Email"
              description={user.email}
              left={(props) => <List.Icon {...props} icon="email" />}
              right={(props) => (
                <IconButton
                  {...props}
                  icon="pencil"
                  onPress={() => openEditModal("email", user.email, "Email")}
                />
              )}
            />

            <Divider />

            <List.Item
              title="Phone Number"
              description={user.phone || "Not set"}
              left={(props) => <List.Icon {...props} icon="phone" />}
              right={(props) => (
                <IconButton
                  {...props}
                  icon="pencil"
                  onPress={() =>
                    openEditModal(
                      "phoneNumber",
                      user.phone || "",
                      "Phone Number"
                    )
                  }
                />
              )}
            />
          </Card.Content>
        </Card>

        <Card style={[styles.section, { ...theme.shadow.small }]}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Account Settings</Text>

            <List.Item
              title="Password"
              description="Change your password"
              left={(props) => <List.Icon {...props} icon="lock" />}
              right={(props) => (
                <IconButton
                  {...props}
                  icon="chevron-right"
                  onPress={() => navigation.navigate("ChangePassword")}
                />
              )}
            />

            <Divider />

            <List.Item
              title="Saved Addresses"
              description="Manage your delivery addresses"
              left={(props) => <List.Icon {...props} icon="map-marker" />}
              right={(props) => (
                <IconButton
                  {...props}
                  icon="chevron-right"
                  onPress={() => navigation.navigate("SavedAddresses")}
                />
              )}
            />
          </Card.Content>
        </Card>

        <Card style={[styles.section, { ...theme.shadow.small }]}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Preferences</Text>

            <List.Item
              title="Push Notifications"
              left={(props) => <List.Icon {...props} icon="bell" />}
              right={(props) => (
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  color={theme.colors.primary}
                />
              )}
            />

            <Divider />

            <List.Item
              title="Location Services"
              left={(props) => <List.Icon {...props} icon="map-marker" />}
              right={(props) => (
                <Switch
                  value={locationEnabled}
                  onValueChange={setLocationEnabled}
                  color={theme.colors.primary}
                />
              )}
            />

            <Divider />

            <List.Item
              title="Dark Mode"
              left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
              right={(props) => (
                <Switch
                  value={darkModeEnabled}
                  onValueChange={toggleDarkMode}
                  color={theme.colors.primary}
                />
              )}
            />
          </Card.Content>
        </Card>

        <Card style={[styles.section, { ...theme.shadow.small }]}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Support</Text>

            <List.Item
              title="Help Center"
              description="Find answers to common questions"
              left={(props) => <List.Icon {...props} icon="help-circle" />}
              right={(props) => (
                <IconButton
                  {...props}
                  icon="chevron-right"
                  onPress={() => navigation.navigate("HelpCenter")}
                />
              )}
            />

            <Divider />

            <List.Item
              title="About Us"
              description="Learn more about our company"
              left={(props) => <List.Icon {...props} icon="information" />}
              right={(props) => (
                <IconButton
                  {...props}
                  icon="chevron-right"
                  onPress={() => navigation.navigate("AboutUs")}
                />
              )}
            />

            <Divider />

            <List.Item
              title="Privacy Policy"
              description="Read our privacy policy"
              left={(props) => <List.Icon {...props} icon="shield" />}
              right={(props) => (
                <IconButton
                  {...props}
                  icon="chevron-right"
                  onPress={() => navigation.navigate("PrivacyPolicy")}
                />
              )}
            />

            <Divider />

            <List.Item
              title="Terms of Service"
              description="Read our terms and conditions"
              left={(props) => <List.Icon {...props} icon="file-document" />}
              right={(props) => (
                <IconButton
                  {...props}
                  icon="chevron-right"
                  onPress={() => navigation.navigate("TermsOfService")}
                />
              )}
            />
          </Card.Content>
        </Card>

        <Button
          mode="outlined"
          onPress={handleLogout}
          style={[styles.logoutButton, { borderColor: theme.colors.error }]}
          color={theme.colors.error}
          icon="logout"
        >
          Logout
        </Button>

        <Portal>
          <Modal
            visible={editModalVisible}
            onDismiss={() => setEditModalVisible(false)}
            contentContainerStyle={[
              styles.modalContent,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Text style={styles.modalTitle}>Edit {editLabel}</Text>

            <TextInput
              label={editLabel}
              value={editValue}
              onChangeText={setEditValue}
              mode="outlined"
              style={styles.modalInput}
            />

            <View style={styles.modalButtons}>
              <Button
                mode="text"
                onPress={() => setEditModalVisible(false)}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={saveProfileChanges}
                style={styles.modalButton}
              >
                Save
              </Button>
            </View>
          </Modal>
        </Portal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  uploadingContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(0,0,0,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  editImageButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: "#666",
  },
  section: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  logoutButton: {
    marginTop: 8,
    marginBottom: 40,
  },
  modalContent: {
    padding: 20,
    margin: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  modalInput: {
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  modalButton: {
    marginLeft: 12,
  },
});

export default ProfileScreen;
