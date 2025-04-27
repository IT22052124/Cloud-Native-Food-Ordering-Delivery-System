import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Animated,
  Text,
  Button,
  SafeAreaView,
} from "react-native";
import { useTheme } from "react-native-paper";
import LottieView from "lottie-react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

const onboardingData = [
  {
    id: "1",
    title: "Discover Amazing Food",
    description:
      "Explore a wide variety of delicious cuisines from top-rated restaurants near you.",
    image: require("../../../assets/onboarding/icon.png"),
    animation: require("../../../assets/animations/food-background.json"),
    gradientColors: ["#FF6B6B", "#FF8E8E"],
  },
  {
    id: "2",
    title: "Fast & Reliable Delivery",
    description:
      "Get your favorite meals delivered to your doorstep in minutes with our efficient delivery system.",
    image: require("../../../assets/onboarding/icon.png"),
    animation: require("../../../assets/animations/food-background.json"),
    gradientColors: ["#4ECDC4", "#45B7D1"],
  },
  {
    id: "3",
    title: "Track Your Order",
    description:
      "Follow your order in real-time and know exactly when your food will arrive.",
    image: require("../../../assets/onboarding/icon.png"),
    animation: require("../../../assets/animations/food-background.json"),
    gradientColors: ["#45B7D1", "#4ECDC4"],
  },
];

const OnboardingScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef(null);
  const theme = useTheme();

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const hasSeenOnboarding = await AsyncStorage.getItem(
        "@hasSeenOnboarding"
      );
      if (hasSeenOnboarding === "true") {
        navigation.replace("Login");
      }
    } catch (error) {
      console.log("Error checking onboarding status:", error);
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem("@hasSeenOnboarding", "true");
      navigation.replace("Login");
    } catch (error) {
      console.log("Error saving onboarding status:", error);
    }
  };

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    setCurrentIndex(viewableItems[0]?.index || 0);
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollTo = () => {
    if (currentIndex < onboardingData.length - 1) {
      slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      completeOnboarding();
    }
  };

  const renderItem = ({ item, index }) => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.8, 1, 0.8],
      extrapolate: "clamp",
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.3, 1, 0.3],
      extrapolate: "clamp",
    });

    return (
      <View style={[styles.slide, { width }]}>
        <LinearGradient
          colors={item.gradientColors}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Animated.View
            style={[
              styles.contentContainer,
              {
                transform: [{ scale }],
                opacity,
              },
            ]}
          >
            <View style={styles.animationContainer}>
              <LottieView
                source={item.animation}
                autoPlay
                loop
                style={styles.animation}
              />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          </Animated.View>
        </LinearGradient>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {currentIndex !== onboardingData.length - 1 && (
        <View style={styles.skipContainer}>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={completeOnboarding}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.sliderContainer}>
        <FlatList
          data={onboardingData}
          renderItem={renderItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          keyExtractor={(item) => item.id}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          ref={slidesRef}
        />
      </View>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {onboardingData.map((_, index) => {
            const inputRange = [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [10, 20, 10],
              extrapolate: "clamp",
            });
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: "clamp",
            });

            return (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    width: dotWidth,
                    opacity,
                  },
                ]}
              />
            );
          })}
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: onboardingData[currentIndex].gradientColors[0] },
          ]}
          onPress={scrollTo}
        >
          <Text style={styles.buttonText}>
            {currentIndex === onboardingData.length - 1
              ? "Get Started"
              : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  skipContainer: {
    position: "absolute",
    top: 30,
    right: 20,
    zIndex: 1,
  },
  skipButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  skipText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
  sliderContainer: {
    flex: 1,
  },
  slide: {
    height: height,
  },
  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: height * 0.1,
  },
  animationContainer: {
    flex: 0.5,
    justifyContent: "center",
    alignItems: "center",
  },
  animation: {
    width: width * 0.8,
    height: width * 0.8,
  },
  textContainer: {
    flex: 0.3,
    paddingHorizontal: 20,
    alignItems: "center",
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 15,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  description: {
    fontSize: 18,
    color: "#fff",
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 24,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 20,
  },
  pagination: {
    flexDirection: "row",
    height: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
    marginHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  button: {
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
});

export default OnboardingScreen;
