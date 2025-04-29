import React from "react";
import { View, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { Text } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";

const { width } = Dimensions.get("window");

const BottomTabBar = ({ state, descriptors, navigation }) => {
  const theme = useTheme();

  const icons = {
    Home: "home",
    Search: "search",
    Cart: "cart",
    Profile: "person",
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.card,
          ...theme.shadow.medium,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel || options.title || route.name;
        const isFocused = state.index === index;

        const isCartTab = route.name === "Cart";

        // Skip rendering cart in regular tab positions
        if (isCartTab) {
          return null;
        }

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            activeOpacity={0.7}
            onPress={onPress}
            style={styles.tab}
          >
            <Ionicons
              name={icons[route.name] + (isFocused ? "" : "-outline")}
              size={24}
              color={isFocused ? theme.colors.primary : theme.colors.gray}
            />
            <Text
              style={[
                styles.tabText,
                { color: isFocused ? theme.colors.primary : theme.colors.gray },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}

      {/* Floating Cart Button */}
      <View style={styles.floatingButtonContainer}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate("Cart")}
          style={styles.floatingButton}
        >
          <LinearGradient
            colors={theme.colors.primaryGradient}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="cart" size={24} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: 70,
    paddingBottom: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  tab: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 12,
  },
  tabText: {
    fontSize: 12,
    marginTop: 4,
    fontFamily: "Poppins-Medium",
  },
  floatingButtonContainer: {
    position: "absolute",
    alignSelf: "center",
    bottom: 25,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  floatingButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  gradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
  },
});

export default BottomTabBar;
