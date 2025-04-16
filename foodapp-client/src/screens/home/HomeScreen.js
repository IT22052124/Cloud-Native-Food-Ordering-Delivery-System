import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Text, Searchbar, Card, Title, Paragraph } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import dataService from "../../services/dataService";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const HomeScreen = ({ navigation }) => {
  const theme = useTheme();
  const { user } = useAuth();

  useEffect(() => {
    // Function to get and log token
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        console.log("Current authToken:", token);
      } catch (error) {
        console.error("Error retrieving token:", error);
      }
    };

    checkToken();
  }, []);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [featuredRestaurants, setFeaturedRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoriesData, restaurantsData] = await Promise.all([
        dataService.getCategories(),
        dataService.getRestaurants(),
      ]);

      setCategories(categoriesData);
      setRestaurants(restaurantsData);

      // Set featured restaurants (restaurants with highest ratings)
      const featured = [...restaurantsData]
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 3);
      setFeaturedRestaurants(featured);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchData();
      return;
    }

    try {
      setLoading(true);
      const results = await dataService.searchRestaurants(searchQuery);
      setRestaurants(results);
    } catch (error) {
      console.error("Error searching restaurants:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() =>
        navigation.navigate("Restaurants", { categoryId: item.id })
      }
    >
      <View style={[styles.categoryImageContainer, { ...theme.shadow.small }]}>
        <Image source={{ uri: item.image }} style={styles.categoryImage} />
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderRestaurantCard = (restaurant, index) => (
    <Card
      style={[styles.restaurantCard, { ...theme.shadow.small }]}
      onPress={() =>
        navigation.navigate("Restaurants", {
          screen: "RestaurantDetail",
          params: { restaurantId: restaurant.id },
        })
      }
    >
      <Card.Cover
        source={{ uri: restaurant.image }}
        style={styles.restaurantImage}
      />
      <Card.Content style={styles.restaurantCardContent}>
        <Title style={styles.restaurantName}>{restaurant.name}</Title>
        <View style={styles.restaurantInfo}>
          <View style={styles.restaurantRating}>
            <Ionicons name="star" size={16} color={theme.colors.tertiary} />
            <Text style={styles.ratingText}>{restaurant.rating}</Text>
          </View>
          <Text style={styles.restaurantType}>{restaurant.cuisineType}</Text>
          <Text style={styles.deliveryInfo}>{restaurant.deliveryTime}</Text>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>
              Hello, {user?.name || "Guest"}!
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.gray }]}>
              What would you like to eat?
            </Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
            <Image
              source={
                user?.profilePicture
                  ? { uri: user.profilePicture }
                  : {
                      uri: "https://png.pngtree.com/png-vector/20220708/ourmid/pngtree-fast-food-logo-png-image_5763171.png",
                    }
              }
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>

        <Searchbar
          placeholder="Search for restaurants or dishes"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={[styles.searchBar, { ...theme.shadow.small }]}
          iconColor={theme.colors.primary}
          onSubmitEditing={handleSearch}
          onIconPress={handleSearch}
        />

        <Text style={styles.sectionTitle}>Categories</Text>
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />

        <Text style={styles.sectionTitle}>Featured Restaurants</Text>
        <View style={styles.featuredContainer}>
          {featuredRestaurants.map((restaurant, index) => (
            <View key={restaurant.id} style={styles.featuredItem}>
              {renderRestaurantCard(restaurant, index)}
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>All Restaurants</Text>
        <View style={styles.allRestaurantsContainer}>
          {restaurants?.map((restaurant) => (
            <View key={restaurant.id} style={styles.restaurantItem}>
              {renderRestaurantCard(restaurant)}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  searchBar: {
    marginBottom: 20,
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 12,
  },
  categoriesList: {
    paddingVertical: 5,
  },
  categoryItem: {
    marginRight: 15,
    alignItems: "center",
    width: 80,
  },
  categoryImageContainer: {
    borderRadius: 40,
    overflow: "hidden",
    backgroundColor: "white",
  },
  categoryImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  categoryName: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 13,
  },
  featuredContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  featuredItem: {
    width: "100%",
    marginBottom: 15,
  },
  allRestaurantsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  restaurantItem: {
    width: "48%",
    marginBottom: 15,
  },
  restaurantCard: {
    borderRadius: 12,
    overflow: "hidden",
  },
  restaurantImage: {
    height: 120,
  },
  restaurantCardContent: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  restaurantName: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  restaurantInfo: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  restaurantRating: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  ratingText: {
    marginLeft: 2,
    fontSize: 12,
  },
  restaurantType: {
    fontSize: 12,
    marginRight: 8,
    color: "#666",
  },
  deliveryInfo: {
    fontSize: 12,
    color: "#666",
  },
});

export default HomeScreen;
