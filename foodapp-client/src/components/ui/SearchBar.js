import React from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";

const SearchBar = ({
  placeholder = "Search for restaurants or dishes",
  value,
  onChangeText,
  onSubmit,
  onClear,
  autoFocus = false,
  onFocus,
  editable = true,
  style, // Add style prop
}) => {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            theme.mode === "light" ? "#FFFFFF" : theme.colors.surface,
          ...theme.shadow.small,
        },
        style, // Apply custom style
      ]}
    >
      <Ionicons
        name="search-outline"
        size={22}
        color={theme.colors.gray}
        style={styles.searchIcon}
      />

      <TextInput
        style={[
          styles.input,
          { color: theme.colors.text },
          !editable && { pointerEvents: "none" },
        ]}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.placeholder}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        onFocus={onFocus}
        returnKeyType="search"
        autoFocus={autoFocus}
        editable={editable}
        blurOnSubmit
      />

      {value && value.length > 0 && (
        <TouchableOpacity onPress={onClear} style={styles.clearButton}>
          <Ionicons name="close-circle" size={18} color={theme.colors.gray} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // Take up available space
    height: 50,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: "100%",
    fontFamily: "Poppins-Regular",
    fontSize: 14,
  },
  clearButton: {
    padding: 4,
  },
});

export default SearchBar;