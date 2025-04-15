import React from "react";
import { View, Image, StyleSheet, ActivityIndicator } from "react-native";
import { Text } from "react-native-paper";
import { useTheme } from "../context/ThemeContext";
import LottieView from "lottie-react-native";

const SplashScreen = () => {
  const theme = useTheme();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Image
        source={require(`../../assets/images/icon.png`)}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={[styles.title, { color: theme.colors.primary }]}>
        Truffle Go
      </Text>

      <LottieView
        source={require("../../assets/animations/Loading.json")}
        autoPlay
        loop
        style={styles.loader}
      />
      {/* <ActivityIndicator
        size="large"
        color={theme.colors.primary}
        style={styles.loader}
      /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  loader: {
    marginTop: 20,
    width: 800,
    height: 336,
  },
});

export default SplashScreen;
