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
import authService from "../../services/authService";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const ForgotPasswordScreen = ({ navigation }) => {
  const theme = useTheme();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const handleForgotPassword = async () => {
    // Form validation
    if (!email) {
      setMessage("Please enter your email address");
      setIsError(true);
      setSnackbarVisible(true);
      return;
    }

    setLoading(true);
    try {
      const response = await authService.forgotPassword(email);
      setMessage(
        response.message || "Password reset instructions sent to your email"
      );
      setIsError(false);
      setSnackbarVisible(true);
    } catch (err) {
      setMessage(err.message || "Failed to send password reset");
      setIsError(true);
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={theme.colors.primary}
            />
          </TouchableOpacity>

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

          <Text style={[styles.title, { color: theme.colors.text }]}>
            Forgot Password
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.gray }]}>
            Enter your email to reset your password
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

            <Button
              mode="contained"
              onPress={handleForgotPassword}
              style={[
                styles.resetButton,
                { backgroundColor: theme.colors.primary },
              ]}
              labelStyle={styles.resetButtonText}
              loading={loading}
              disabled={loading}
            >
              Reset Password
            </Button>

            <View style={styles.loginContainer}>
              <Text style={{ color: theme.colors.text }}>
                Remember your password?
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
        style={{
          backgroundColor: isError ? theme.colors.error : theme.colors.success,
        }}
        action={{
          label: "Close",
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {message}
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
  backButton: {
    marginTop: 10,
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
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
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
  },
  form: {
    width: "100%",
  },
  input: {
    marginBottom: 20,
    backgroundColor: "transparent",
  },
  resetButton: {
    marginVertical: 15,
    paddingVertical: 8,
    borderRadius: 10,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  loginText: {
    fontWeight: "bold",
  },
});

export default ForgotPasswordScreen;
