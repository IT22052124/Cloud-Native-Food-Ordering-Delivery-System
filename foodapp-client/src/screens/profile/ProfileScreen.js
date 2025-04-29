import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  StatusBar,
  Dimensions,
} from "react-native";
import {
  Text,
  Divider,
  Modal,
  TextInput,
  Switch,
  Portal,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import * as ImagePicker from "expo-image-picker";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

// Import UI components
import GradientButton from "../../components/ui/GradientButton";

const { width } = Dimensions.get("window");

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

  const renderSettingItem = (
    icon,
    title,
    subtitle,
    value,
    onToggle,
    accentColor = theme.colors.primary
  ) => (
    <View style={styles.settingItem}>
      <View
        style={[
          styles.settingIconContainer,
          { backgroundColor: accentColor + "10" },
        ]}
      >
        <Ionicons name={icon} size={22} color={accentColor} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.settingSubtitle, { color: theme.colors.gray }]}>
            {subtitle}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        color={theme.colors.primary}
      />
    </View>
  );

  const renderProfileItem = (
    icon,
    title,
    value,
    onPress,
    iconColor = theme.colors.primary
  ) => (
    <TouchableOpacity style={styles.profileItem} onPress={onPress}>
      <View
        style={[
          styles.profileIconContainer,
          { backgroundColor: iconColor + "10" },
        ]}
      >
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>
      <View style={styles.profileItemContent}>
        <Text style={[styles.profileItemTitle, { color: theme.colors.text }]}>
          {title}
        </Text>
        <Text style={[styles.profileItemValue, { color: theme.colors.gray }]}>
          {value}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.colors.gray} />
    </TouchableOpacity>
  );

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
      <StatusBar
        barStyle={theme.mode === "dark" ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.background}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.profileImageContainer}>
            {uploadingImage ? (
              <View
                style={[
                  styles.profileImage,
                  {
                    backgroundColor: theme.colors.primary + "20",
                    justifyContent: "center",
                    alignItems: "center",
                  },
                ]}
              >
                <ActivityIndicator size="large" color={theme.colors.primary} />
              </View>
            ) : (
              <Image
                source={{
                  uri:
                    user.profilePicture ||
                    "https://ui-avatars.com/api/?name=" +
                      encodeURIComponent(user.name || "User"),
                }}
                style={styles.profileImage}
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
              <Ionicons name="camera" size={18} color="white" />
            </TouchableOpacity>
          </View>

          <Text style={[styles.userName, { color: theme.colors.text }]}>
            {user.name}
          </Text>

          <Text style={[styles.userEmail, { color: theme.colors.gray }]}>
            {user.email}
          </Text>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Profile Information
          </Text>

          <View
            style={[
              styles.sectionContent,
              {
                backgroundColor: theme.colors.card,
                ...theme.shadow.small,
              },
            ]}
          >
            {renderProfileItem("person", "Name", user.name || "Not set", () =>
              openEditModal("name", user.name, "Name")
            )}

            <Divider style={styles.divider} />

            {renderProfileItem(
              "call",
              "Phone",
              user.phone || "Add phone number",
              () => openEditModal("phone", user.phone, "Phone")
            )}

            <Divider style={styles.divider} />

            {renderProfileItem(
              "location",
              "Address",
              "Manage saved addresses",
              () => navigation.navigate("SavedAddresses")
            )}
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Preferences
          </Text>

          <View
            style={[
              styles.sectionContent,
              {
                backgroundColor: theme.colors.card,
                ...theme.shadow.small,
              },
            ]}
          >
            {renderSettingItem(
              "notifications",
              "Push Notifications",
              "Get updates on your orders and promotions",
              notificationsEnabled,
              () => setNotificationsEnabled(!notificationsEnabled)
            )}

            <Divider style={styles.divider} />

            {renderSettingItem(
              "location",
              "Location Services",
              "Allow access to your current location",
              locationEnabled,
              () => setLocationEnabled(!locationEnabled)
            )}

            <Divider style={styles.divider} />

            {renderSettingItem(
              "moon",
              "Dark Mode",
              "Switch between light and dark themes",
              darkModeEnabled,
              toggleDarkMode
            )}
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Account
          </Text>

          <View
            style={[
              styles.sectionContent,
              {
                backgroundColor: theme.colors.card,
                ...theme.shadow.small,
              },
            ]}
          >
            {renderProfileItem(
              "lock-closed",
              "Change Password",
              "Update your password",
              () => navigation.navigate("ChangePassword"),
              theme.colors.info
            )}

            <Divider style={styles.divider} />

            {renderProfileItem(
              "help-circle",
              "Help & Support",
              "Contact customer support",
              () => navigation.navigate("Support"),
              theme.colors.secondary
            )}

            <Divider style={styles.divider} />
          </View>
          <GradientButton
            title="Logout"
            onPress={handleLogout}
            style={[
              styles.logoutButton,
              {
                backgroundColor: theme.colors.error,
                borderColor: theme.colors.error,
              },
            ]}
            colors={[theme.colors.error, theme.colors.error]}
            providedTheme={theme}
          />
        </View>

        {/* Bottom space for tab bar */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      <Portal>
        <Modal
          visible={editModalVisible}
          onDismiss={() => setEditModalVisible(false)}
          contentContainerStyle={[
            styles.modalContainer,
            { backgroundColor: theme.colors.card },
          ]}
        >
          <View style={styles.modalContent}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Edit {editLabel}
            </Text>

            <TextInput
              label={editLabel}
              value={editValue}
              onChangeText={setEditValue}
              style={styles.input}
              mode="outlined"
              outlineColor={theme.colors.border}
              activeOutlineColor={theme.colors.primary}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.cancelButton,
                  { borderColor: theme.colors.gray },
                ]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text
                  style={[
                    styles.cancelButtonText,
                    { color: theme.colors.gray },
                  ]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <GradientButton
                title="Save"
                onPress={saveProfileChanges}
                style={styles.saveButton}
                providedTheme={theme}
              />
            </View>
          </View>
        </Modal>
      </Portal>
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
  header: {
    alignItems: "center",
    padding: 24,
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
  editImageButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  userName: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    fontWeight: "700",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
  },
  sectionContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    fontWeight: "700",
    marginBottom: 12,
  },
  sectionContent: {
    borderRadius: 12,
    overflow: "hidden",
  },
  profileItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  profileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  profileItemContent: {
    flex: 1,
  },
  profileItemTitle: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    marginBottom: 2,
  },
  profileItemValue: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
  },
  divider: {
    height: 1,
    marginLeft: 68,
  },
  bottomPadding: {
    height: 100,
  },
  modalContainer: {
    margin: 20,
    borderRadius: 16,
    overflow: "hidden",
  },
  modalContent: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    fontWeight: "700",
    marginBottom: 16,
  },
  input: {
    marginBottom: 20,
    backgroundColor: "transparent",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    borderWidth: 1,
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
  },
  logoutButton: {
    top: 20,
    borderWidth: 1,
  },
});

export default ProfileScreen;
