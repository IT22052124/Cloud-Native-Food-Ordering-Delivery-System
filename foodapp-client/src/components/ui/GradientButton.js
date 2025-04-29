import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../context/ThemeContext";

const { width } = Dimensions.get("window");

const GradientButton = ({
  title,
  onPress,
  style,
  textStyle,
  disabled = false,
  loading = false,
  fullWidth = false,
  icon = null,
  colors = null,
  providedTheme = null,
}) => {
  // Use a try-catch block to safely use the theme
  let theme;
  try {
    // Use the provided theme if available, otherwise use the useTheme hook
    const contextTheme = useTheme();
    theme = providedTheme || contextTheme;
  } catch (error) {
    // If useTheme fails (not in a ThemeProvider), use default colors
    theme = {
      colors: {
        primaryGradient: ["#FF7F57", "#FFBC63"],
      },
    };
  }

  // Safely access button colors
  const buttonColors = colors ||
    theme?.colors?.primaryGradient || ["#FF7F57", "#FFBC63"];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.container,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={buttonColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.gradient,
          fullWidth && styles.fullWidth,
          disabled && styles.disabledGradient,
        ]}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <>
            {icon}
            <Text style={[styles.text, textStyle]}>{title}</Text>
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    elevation: 0,
  },
  gradient: {
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    paddingHorizontal: 24,
    borderRadius: 12,
    minWidth: width * 0.35,
    borderWidth: 0,
  },
  fullWidth: {
    width: "100%",
  },
  text: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    marginLeft: 8,
  },
  disabled: {
    opacity: 0.6,
  },
  disabledGradient: {
    opacity: 0.6,
  },
});

export default GradientButton;
