import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { TextInput, Button, Text, Snackbar } from "react-native-paper";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";

const RegisterScreen = ({ navigation }) => {
  const theme = useTheme();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const handleRegister = async () => {
    // Form validation
    if (!name || !email || !phone || !password || !confirmPassword) {
      setError("Please fill in all fields");
      setSnackbarVisible(true);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setSnackbarVisible(true);
      return;
    }

    setLoading(true);
    try {
      await register({
        name,
        email,
        phone,
        password,
        role: "customer", // Default role
      });
      // If successful, the AuthContext will redirect to the main app
    } catch (err) {
      setError(err.message || "Failed to register");
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : null}
        style={styles.keyboardAvoidView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <Image
              source={{
                uri: "https://png.pngtree.com/png-vector/20220708/ourmid/pngtree-fast-food-logo-png-image_5763171.png",
              }}
              style={styles.logo}
            />
            <Text style={[styles.appName, { color: theme.colors.primary }]}>
              FoodDelivery
            </Text>
          </View>

          <Text style={[styles.registerTitle, { color: theme.colors.text }]}>
            Create Account
          </Text>
          <Text style={[styles.registerSubtitle, { color: theme.colors.gray }]}>
            Sign up to get started
          </Text>

          <View style={styles.form}>
            <TextInput
              label="Full Name"
              value={name}
              onChangeText={setName}
              style={styles.input}
              mode="outlined"
              outlineColor={theme.colors.lightGray}
              activeOutlineColor={theme.colors.primary}
              left={<TextInput.Icon icon="account" color={theme.colors.gray} />}
            />

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              mode="outlined"
              outlineColor={theme.colors.lightGray}
              activeOutlineColor={theme.colors.primary}
              keyboardType="email-address"
              autoCapitalize="none"
              left={<TextInput.Icon icon="email" color={theme.colors.gray} />}
            />

            <TextInput
              label="Phone Number"
              value={phone}
              onChangeText={setPhone}
              style={styles.input}
              mode="outlined"
              outlineColor={theme.colors.lightGray}
              activeOutlineColor={theme.colors.primary}
              keyboardType="phone-pad"
              left={<TextInput.Icon icon="phone" color={theme.colors.gray} />}
            />

            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              mode="outlined"
              outlineColor={theme.colors.lightGray}
              activeOutlineColor={theme.colors.primary}
              secureTextEntry={!passwordVisible}
              right={
                <TextInput.Icon
                  icon={passwordVisible ? "eye-off" : "eye"}
                  onPress={() => setPasswordVisible(!passwordVisible)}
                  color={theme.colors.gray}
                />
              }
              left={<TextInput.Icon icon="lock" color={theme.colors.gray} />}
            />

            <TextInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={styles.input}
              mode="outlined"
              outlineColor={theme.colors.lightGray}
              activeOutlineColor={theme.colors.primary}
              secureTextEntry={!passwordVisible}
              left={
                <TextInput.Icon icon="lock-check" color={theme.colors.gray} />
              }
            />

            <Button
              mode="contained"
              onPress={handleRegister}
              style={[
                styles.registerButton,
                { backgroundColor: theme.colors.primary },
              ]}
              labelStyle={styles.registerButtonText}
              loading={loading}
              disabled={loading}
            >
              Sign Up
            </Button>

            <View style={styles.loginContainer}>
              <Text style={{ color: theme.colors.text }}>
                Already have an account?
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text
                  style={[styles.loginText, { color: theme.colors.primary }]}
                >
                  {" "}
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{ backgroundColor: theme.colors.error }}
        action={{
          label: "Dismiss",
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {error}
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
  },
  appName: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 10,
  },
  registerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
  },
  registerSubtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  form: {
    width: "100%",
  },
  input: {
    marginBottom: 12,
    backgroundColor: "transparent",
  },
  registerButton: {
    marginVertical: 15,
    paddingVertical: 8,
    borderRadius: 10,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 15,
  },
  loginText: {
    fontWeight: "bold",
  },
});

export default RegisterScreen;
