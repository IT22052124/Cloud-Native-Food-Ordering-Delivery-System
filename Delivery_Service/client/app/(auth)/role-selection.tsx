import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Link } from "expo-router";

export default function RoleSelectionScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Your Role</Text>

      <Link href="/(auth)/delivery-register" asChild>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>I'm a Delivery Person</Text>
        </TouchableOpacity>
      </Link>

      <Link href="/(auth)/login" asChild>
        <TouchableOpacity style={styles.loginButton}>
          <Text style={styles.loginButtonText}>Already have an account? Login</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 40,
  },
  button: {
    width: "100%",
    padding: 15,
    backgroundColor: "#007AFF",
    borderRadius: 5,
    marginBottom: 15,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  loginButton: {
    marginTop: 20,
  },
  loginButtonText: {
    color: "#007AFF",
  },
});