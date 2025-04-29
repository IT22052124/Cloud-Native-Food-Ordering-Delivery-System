import React, { createContext, useState, useContext, useEffect } from "react";
import { useColorScheme } from "react-native";
import { DefaultTheme, DarkTheme } from "@react-navigation/native";

// Define light theme colors with new palette
const lightTheme = {
  mode: "light",
  colors: {
    primary: "#FF6B6B", // Coral
    primaryGradient: ["#FF6B6B", "#FFA502"], // Coral to Gold gradient
    secondary: "#FFA502", // Gold
    background: "#F8F9FA", // Light gray background
    surface: "#FFFFFF",
    error: "#FF5252",
    text: "#333333",
    onBackground: "#333333",
    onSurface: "#333333",
    disabled: "#BDBDBD",
    placeholder: "#9E9E9E",
    backdrop: "rgba(0, 0, 0, 0.5)",
    notification: "#FF6B6B",
    card: "#FFFFFF",
    border: "#E0E0E0",
    gray: "#757575",
    success: "#4CAF50",
    warning: "#FFC107",
    info: "#2196F3",
    white: "#FFFFFF",
  },
  shadow: {
    small: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2.22,
      elevation: 2,
    },
    medium: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 3.84,
      elevation: 3,
    },
    large: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 4.65,
      elevation: 5,
    },
  },
  navigationTheme: {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: "#FF6B6B",
      background: "#F8F9FA",
      card: "#FFFFFF",
      text: "#333333",
      border: "#E0E0E0",
      notification: "#FF6B6B",
    },
  },
};

// Define dark theme colors with new palette
const darkTheme = {
  mode: "dark",
  colors: {
    primary: "#FF6B6B", // Coral
    primaryGradient: ["#FF6B6B", "#FFA502"], // Coral to Gold gradient
    secondary: "#FFA502", // Gold
    background: "#1E1E1E", // Dark background
    surface: "#252525",
    error: "#FF5252",
    text: "#FFFFFF",
    onBackground: "#FFFFFF",
    onSurface: "#FFFFFF",
    disabled: "#757575",
    placeholder: "#9E9E9E",
    backdrop: "rgba(0, 0, 0, 0.7)",
    notification: "#FF6B6B",
    card: "#252525",
    border: "#2C2C2C",
    gray: "#BDBDBD",
    success: "#4CAF50",
    warning: "#FFC107",
    info: "#2196F3",
    white: "#FFFFFF",
  },
  shadow: {
    small: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2.22,
      elevation: 3,
    },
    medium: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.33,
      shadowRadius: 3.84,
      elevation: 5,
    },
    large: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.38,
      shadowRadius: 4.65,
      elevation: 8,
    },
  },
  navigationTheme: {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: "#FF6B6B",
      background: "#1E1E1E",
      card: "#252525",
      text: "#FFFFFF",
      border: "#2C2C2C",
      notification: "#FF6B6B",
    },
  },
};

// Create the theme context
const ThemeContext = createContext();

// Theme provider component
export const ThemeProvider = ({ children }) => {
  const deviceColorScheme = useColorScheme();
  const [mode, setMode] = useState(deviceColorScheme || "light");

  // Update theme based on device color scheme changes
  useEffect(() => {
    if (deviceColorScheme) {
      setMode(deviceColorScheme);
    }
  }, [deviceColorScheme]);

  // Get the current theme based on mode
  const theme = mode === "dark" ? darkTheme : lightTheme;

  // Function to toggle theme
  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  // Function to set theme directly
  const setTheme = (newMode) => {
    if (newMode === "light" || newMode === "dark") {
      setMode(newMode);
    }
  };

  return (
    <ThemeContext.Provider value={{ ...theme, toggleTheme, setMode: setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
