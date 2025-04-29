import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../context/ThemeContext";

const { width } = Dimensions.get("window");

const HeroBanner = ({
  imageUrl,
  title,
  subtitle,
  actionLabel = "Order Now",
  onPress,
  isTrending = true,
}) => {
  const theme = useTheme();

  return (
    <TouchableOpacity
      style={[styles.container, theme.shadow.medium]}
      activeOpacity={0.95}
      onPress={onPress}
    >
      <ImageBackground
        source={{ uri: imageUrl }}
        style={styles.imageBackground}
        imageStyle={styles.image}
      >
        <LinearGradient
          colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.7)"]}
          style={styles.gradient}
        >
          {isTrending && (
            <View style={styles.trendingBadgeContainer}>
              <LinearGradient
                colors={theme.colors.primaryGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.trendingBadge}
              >
                <Text style={styles.trendingText}>Nearest Restaurant</Text>
              </LinearGradient>
            </View>
          )}

          <View style={styles.contentContainer}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

            <TouchableOpacity
              style={styles.actionButton}
              onPress={onPress}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={theme.colors.primaryGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.actionButtonGradient}
              >
                <Text style={styles.actionButtonText}>{actionLabel}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width - 32,
    height: 180,
    borderRadius: 20,
    overflow: "hidden",
    marginVertical: 10,
    alignSelf: "center",
  },
  imageBackground: {
    width: "100%",
    height: "100%",
  },
  image: {
    borderRadius: 20,
  },
  gradient: {
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
    padding: 16,
  },
  trendingBadgeContainer: {
    position: "absolute",
    top: 16,
    left: 0,
  },
  trendingBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  trendingText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
    fontWeight: "600",
  },
  contentContainer: {
    width: "100%",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    marginBottom: 12,
    opacity: 0.9,
  },
  actionButton: {
    alignSelf: "flex-start",
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 8,
  },
  actionButtonGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    fontWeight: "600",
  },
});

export default HeroBanner;
