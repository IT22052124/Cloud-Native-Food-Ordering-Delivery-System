import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  Text,
  TextInput,
  Button,
  IconButton,
  Headline,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";

const ChangePasswordScreen = ({ navigation }) => {
  const theme = useTheme();
  const { changePassword } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!currentPassword.trim()) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!newPassword.trim()) {
      newErrors.newPassword = "New password is required";
    } else if (newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await changePassword(currentPassword, newPassword);

      Alert.alert("Success", "Your password has been changed successfully", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error("Error changing password:", error);

      Alert.alert(
        "Error",
        error.message || "Failed to change password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />
        <Headline style={styles.headerTitle}>Change Password</Headline>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <TextInput
              label="Current Password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry={!showCurrentPassword}
              mode="outlined"
              error={!!errors.currentPassword}
              right={
                <TextInput.Icon
                  name={showCurrentPassword ? "eye-off" : "eye"}
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  color={theme.colors.gray}
                />
              }
              style={styles.input}
            />
            {errors.currentPassword && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errors.currentPassword}
              </Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showNewPassword}
              mode="outlined"
              error={!!errors.newPassword}
              right={
                <TextInput.Icon
                  name={showNewPassword ? "eye-off" : "eye"}
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  color={theme.colors.gray}
                />
              }
              style={styles.input}
            />
            {errors.newPassword && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errors.newPassword}
              </Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              label="Confirm New Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              mode="outlined"
              error={!!errors.confirmPassword}
              right={
                <TextInput.Icon
                  name={showConfirmPassword ? "eye-off" : "eye"}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  color={theme.colors.gray}
                />
              }
              style={styles.input}
            />
            {errors.confirmPassword && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errors.confirmPassword}
              </Text>
            )}
          </View>

          <View style={styles.passwordRequirements}>
            <Text style={styles.requirementsTitle}>Password Requirements:</Text>
            <View style={styles.requirementItem}>
              <Ionicons
                name={
                  newPassword.length >= 8
                    ? "checkmark-circle"
                    : "ellipse-outline"
                }
                size={16}
                color={
                  newPassword.length >= 8
                    ? theme.colors.success
                    : theme.colors.gray
                }
              />
              <Text style={styles.requirementText}>At least 8 characters</Text>
            </View>
            <View style={styles.requirementItem}>
              <Ionicons
                name={
                  /[A-Z]/.test(newPassword)
                    ? "checkmark-circle"
                    : "ellipse-outline"
                }
                size={16}
                color={
                  /[A-Z]/.test(newPassword)
                    ? theme.colors.success
                    : theme.colors.gray
                }
              />
              <Text style={styles.requirementText}>
                At least one uppercase letter
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <Ionicons
                name={
                  /[0-9]/.test(newPassword)
                    ? "checkmark-circle"
                    : "ellipse-outline"
                }
                size={16}
                color={
                  /[0-9]/.test(newPassword)
                    ? theme.colors.success
                    : theme.colors.gray
                }
              />
              <Text style={styles.requirementText}>At least one number</Text>
            </View>
            <View style={styles.requirementItem}>
              <Ionicons
                name={
                  /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
                    ? "checkmark-circle"
                    : "ellipse-outline"
                }
                size={16}
                color={
                  /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
                    ? theme.colors.success
                    : theme.colors.gray
                }
              />
              <Text style={styles.requirementText}>
                At least one special character
              </Text>
            </View>
          </View>

          <Button
            mode="contained"
            onPress={handleChangePassword}
            style={styles.changeButton}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.white} size="small" />
            ) : (
              "Change Password"
            )}
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  scrollContent: {
    padding: 16,
    flexGrow: 1,
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: "transparent",
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 8,
  },
  passwordRequirements: {
    marginTop: 8,
    marginBottom: 24,
  },
  requirementsTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  requirementText: {
    fontSize: 14,
    marginLeft: 8,
  },
  changeButton: {
    paddingVertical: 8,
    marginBottom: 24,
  },
});

export default ChangePasswordScreen;
