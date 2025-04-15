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

const LoginScreen = ({ navigation }) => {
  const theme = useTheme();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const handleLogin = async () => {
    // Form validation
    if (!email || !password) {
      setError("Please fill in all fields");
      setSnackbarVisible(true);
      return;
    }

    setLoading(true);
    try {
      // Attempt to login with provided credentials
      await login(email, password);
      // If no error is thrown, login was successful
    } catch (err) {
      // Handle specific error cases
      let errorMessage = "Failed to login. Please check your credentials.";

      if (err.statusCode === 401) {
        errorMessage = "Invalid email or password. Please try again.";
      } else if (err.statusCode === 403) {
        errorMessage = "Your account is not active. Please contact support.";
      } else if (err.message && err.message.includes("network")) {
        errorMessage =
          "Network error. Please check your connection and try again.";
      }

      setError(errorMessage);
      // Set snackbar visible immediately when error happens
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
              source={require("../../../assets/images/icon.png")}
              style={styles.logo}
            />
            <Text style={[styles.appName, { color: theme.colors.primary }]}>
              Truffle Go
            </Text>
          </View>

          <Text style={[styles.loginTitle, { color: theme.colors.text }]}>
            Welcome Back
          </Text>
          <Text style={[styles.loginSubtitle, { color: theme.colors.gray }]}>
            Sign in to continue
          </Text>

          <View style={styles.form}>
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

            <TouchableOpacity
              onPress={() => navigation.navigate("ForgotPassword")}
              style={styles.forgotPasswordContainer}
            >
              <Text
                style={[styles.forgotPassword, { color: theme.colors.primary }]}
              >
                Forgot Password?
              </Text>
            </TouchableOpacity>

            <Button
              mode="contained"
              onPress={handleLogin}
              style={[
                styles.loginButton,
                { backgroundColor: theme.colors.primary },
              ]}
              labelStyle={styles.loginButtonText}
              loading={loading}
              disabled={loading}
            >
              Login
            </Button>

            <View style={styles.registerContainer}>
              <Text style={{ color: theme.colors.text }}>
                Don't have an account?
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text
                  style={[styles.registerText, { color: theme.colors.primary }]}
                >
                  {" "}
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={4000}
        style={[styles.snackbar, { backgroundColor: theme.colors.error }]}
        action={{
          label: "OK",
          onPress: () => setSnackbarVisible(false),
          color: "white",
        }}
        theme={{ colors: { surface: theme.colors.error } }}
        wrapperStyle={styles.snackbarWrapper}
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
    marginTop: 30,
    marginBottom: 30,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 20,
  },
  appName: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
  },
  loginSubtitle: {
    fontSize: 16,
    marginBottom: 30,
  },
  form: {
    width: "100%",
  },
  input: {
    marginBottom: 15,
    backgroundColor: "transparent",
  },
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotPassword: {
    fontSize: 14,
  },
  loginButton: {
    marginVertical: 15,
    paddingVertical: 8,
    borderRadius: 10,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  registerText: {
    fontWeight: "bold",
  },
  snackbar: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    elevation: 6,
    borderRadius: 8,
  },
  snackbarWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
});

export default LoginScreen;
