import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.42;

const FoodCard = ({ item, onPress, onAddToCart, isTrending = false }) => {
  const theme = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.card,
          ...theme.shadow.small,
        },
      ]}
      activeOpacity={0.95}
      onPress={onPress}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />

        {isTrending && (
          <View style={styles.trendingBadgeContainer}>
            <LinearGradient
              colors={theme.colors.primaryGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.trendingBadge}
            >
              <Text style={styles.trendingText}>Trending Now</Text>
            </LinearGradient>
          </View>
        )}
      </View>

      <View style={styles.contentContainer}>
        <Text
          style={[styles.title, { color: theme.colors.text }]}
          numberOfLines={1}
        >
          {item.name}
        </Text>

        <Text
          style={[styles.category, { color: theme.colors.gray }]}
          numberOfLines={1}
        >
          {item.category}
        </Text>

        <View style={styles.footer}>
          <Text style={[styles.price, { color: theme.colors.primary }]}>
            ${item.price.toFixed(2)}
          </Text>

          <TouchableOpacity
            style={[
              styles.addButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={onAddToCart}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderRadius: 16,
    overflow: "hidden",
    marginRight: 16,
    marginBottom: 16,
  },
  imageContainer: {
    position: "relative",
    height: CARD_WIDTH * 0.8,
    width: "100%",
  },
  image: {
    height: "100%",
    width: "100%",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  trendingBadgeContainer: {
    position: "absolute",
    top: 10,
    left: 0,
  },
  trendingBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  trendingText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontFamily: "Poppins-Medium",
    fontWeight: "500",
  },
  contentContainer: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    fontWeight: "600",
    marginBottom: 4,
  },
  category: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    marginBottom: 8,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  price: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    fontWeight: "600",
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default FoodCard;
