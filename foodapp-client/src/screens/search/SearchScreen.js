import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import {
  Text,
  Searchbar,
  Divider,
  List,
  Avatar,
  Chip,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import dataService from "../../services/dataService";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

const SearchScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeRestaurantId, setActiveRestaurantId] = useState(null);
  const [searchType, setSearchType] = useState("all"); // "all", "restaurants", "dishes", "categories"

  useEffect(() => {
    // Check if search query is passed from navigation params
    if (route.params?.searchQuery) {
      setSearchQuery(route.params.searchQuery);
    }
  }, [route.params]);

  useEffect(() => {
    // Clear results if search query is empty
    if (!searchQuery.trim()) {
      setRestaurants([]);
      setDishes([]);
      setCategories([]);
      return;
    }

    // Debounce search to avoid too many API calls
    const debounceTimer = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, searchType]);

  const performSearch = async (query) => {
    try {
      setLoading(true);

      // Search based on searchType
      if (searchType === "all" || searchType === "restaurants") {
        // Search for restaurants
        const restaurantResults = await dataService.searchRestaurants(query);
        setRestaurants(restaurantResults);
      } else {
        setRestaurants([]);
      }

      if (searchType === "all" || searchType === "dishes") {
        // Search for all dishes matching the query across restaurants
        const dishResults = await dataService.searchAllDishes(query);
        setDishes(dishResults);
      } else if (activeRestaurantId) {
        // If a restaurant is active, search for dishes in that restaurant
        await searchRestaurantDishes(activeRestaurantId, query);
      } else {
        setDishes([]);
      }

      if (searchType === "all" || searchType === "categories") {
        // Search for categories
        const categoryResults = await dataService.searchCategories(query);
        setCategories(categoryResults);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestaurantPress = (restaurantId) => {
    if (activeRestaurantId === restaurantId) {
      // If the same restaurant is clicked, clear active restaurant
      setActiveRestaurantId(null);
      if (searchType === "all" || searchType === "dishes") {
        performSearch(searchQuery); // Refresh the search to show all dishes
      }
    } else {
      // Set active restaurant and search for dishes
      setActiveRestaurantId(restaurantId);
      searchRestaurantDishes(restaurantId, searchQuery);
    }
  };

  const searchRestaurantDishes = async (restaurantId, query) => {
    try {
      setLoading(true);
      // Use the searchDishes function to search within a specific restaurant
      const dishResults = await dataService.searchDishes(restaurantId, query);
      setDishes(dishResults);
    } catch (error) {
      console.error("Error searching restaurant dishes:", error);
      setDishes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryPress = (category) => {
    // Set search query to category name and focus search on restaurants
    setSearchQuery(category.name);
    setSearchType("restaurants");
    performSearch(category.name);
  };

  const renderSearchTypeSelector = () => (
    <View style={styles.searchTypeContainer}>
      <Chip
        selected={searchType === "all"}
        onPress={() => setSearchType("all")}
        style={styles.searchTypeChip}
        selectedColor={theme.colors.primary}
      >
        All
      </Chip>
      <Chip
        selected={searchType === "restaurants"}
        onPress={() => setSearchType("restaurants")}
        style={styles.searchTypeChip}
        selectedColor={theme.colors.primary}
      >
        Restaurants
      </Chip>
      <Chip
        selected={searchType === "dishes"}
        onPress={() => setSearchType("dishes")}
        style={styles.searchTypeChip}
        selectedColor={theme.colors.primary}
      >
        Dishes
      </Chip>
      <Chip
        selected={searchType === "categories"}
        onPress={() => setSearchType("categories")}
        style={styles.searchTypeChip}
        selectedColor={theme.colors.primary}
      >
        Categories
      </Chip>
    </View>
  );

  const renderRestaurantItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleRestaurantPress(item.id)}
      style={[
        styles.restaurantItem,
        activeRestaurantId === item.id && {
          backgroundColor: theme.colors.primary + "15", // semi-transparent primary color
        },
      ]}
    >
      <View style={styles.restaurantItemContent}>
        <Avatar.Image
          size={50}
          source={{ uri: item.image || "https://via.placeholder.com/150" }}
          style={[
            styles.restaurantLogo,
            { backgroundColor: theme.colors.surface },
          ]}
        />
        <View style={styles.restaurantInfo}>
          <Text style={[styles.restaurantName, { color: theme.colors.text }]}>
            {item.name}
          </Text>
          <View style={styles.ratingContainer}>
            {item.rating && (
              <>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.ratingText}>{item.rating}</Text>
              </>
            )}
            {item.cuisineType && (
              <Text style={styles.cuisineText}> • {item.cuisineType}</Text>
            )}
          </View>
        </View>
        <MaterialIcons
          name={
            activeRestaurantId === item.id
              ? "keyboard-arrow-up"
              : "keyboard-arrow-down"
          }
          size={24}
          color={theme.colors.text}
        />
      </View>
    </TouchableOpacity>
  );

  const renderDishItem = ({ item }) => (
    <TouchableOpacity
      style={styles.dishItem}
      onPress={() => {
        navigation.navigate("DishDetail", {
          restaurantId: item.restaurantId || activeRestaurantId,
          dishId: item.id,
        });
      }}
    >
      <View style={styles.dishInfoContainer}>
        <Text style={styles.dishName}>{item.name}</Text>
        {item.restaurantName && !activeRestaurantId && (
          <Text style={styles.dishRestaurant}>from {item.restaurantName}</Text>
        )}
        <Text style={styles.dishCategory}>{item.category}</Text>
        <Text style={styles.dishPrice}>${item.price.toFixed(2)}</Text>
      </View>
      {item.image && (
        <Image source={{ uri: item.image }} style={styles.dishImage} />
      )}
    </TouchableOpacity>
  );

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => handleCategoryPress(item)}
    >
      <View style={styles.categoryItemContent}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.categoryImage} />
        ) : (
          <View style={styles.categoryImagePlaceholder} />
        )}
        <Text style={styles.categoryName}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderDishesWithCategoryHeader = () => {
    // Group dishes by category
    const categorizedDishes = dishes.reduce((acc, dish) => {
      const category = dish.category || "Other";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(dish);
      return acc;
    }, {});

    // Convert to array format for FlatList
    const data = Object.entries(categorizedDishes).map(([category, items]) => ({
      category,
      data: items,
    }));

    return (
      <FlatList
        data={data}
        keyExtractor={(item) => item.category}
        renderItem={({ item }) => (
          <View>
            <Text style={styles.categoryHeader}>{item.category}</Text>
            <FlatList
              data={item.data}
              keyExtractor={(dish) => dish.id}
              renderItem={renderDishItem}
              scrollEnabled={false}
            />
          </View>
        )}
        ListEmptyComponent={
          activeRestaurantId ? (
            <Text style={styles.emptyText}>No dishes match your search.</Text>
          ) : (
            <Text style={styles.emptyText}>No dishes found.</Text>
          )
        }
      />
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Search
        </Text>
        <View style={styles.placeholder} />
      </View>

      <Searchbar
        placeholder="Search for restaurants, dishes, or categories..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}
        iconColor={theme.colors.primary}
        autoFocus={!route.params?.searchQuery}
        clearButtonMode="always"
      />

      {renderSearchTypeSelector()}

      {loading ? (
        <ActivityIndicator
          size="large"
          color={theme.colors.primary}
          style={styles.loader}
        />
      ) : (
        <View style={styles.resultsContainer}>
          {!searchQuery.trim() ? (
            <Text style={styles.initialText}>Start typing to search...</Text>
          ) : (
            <>
              {/* Categories section */}
              {(searchType === "all" || searchType === "categories") &&
                categories.length > 0 && (
                  <>
                    <Text style={styles.sectionTitle}>Categories</Text>
                    <FlatList
                      data={categories}
                      keyExtractor={(item) => item.id}
                      renderItem={renderCategoryItem}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.categoriesList}
                    />
                    <Divider style={styles.divider} />
                  </>
                )}

              {/* Restaurants section */}
              {(searchType === "all" || searchType === "restaurants") && (
                <>
                  <Text style={styles.sectionTitle}>Restaurants</Text>
                  <FlatList
                    data={restaurants}
                    keyExtractor={(item) => item.id}
                    renderItem={renderRestaurantItem}
                    ListEmptyComponent={
                      <Text style={styles.emptyText}>
                        No restaurants found.
                      </Text>
                    }
                    style={styles.restaurantList}
                  />
                </>
              )}

              {/* Show divider if both restaurants and dishes are displayed */}
              {restaurants.length > 0 &&
                (activeRestaurantId ||
                  ((searchType === "all" || searchType === "dishes") &&
                    dishes.length > 0)) && <Divider style={styles.divider} />}

              {/* Dishes section */}
              {(searchType === "all" ||
                searchType === "dishes" ||
                activeRestaurantId) && (
                <>
                  <Text style={styles.sectionTitle}>
                    {activeRestaurantId ? "Restaurant Dishes" : "Dishes"}
                  </Text>
                  {renderDishesWithCategoryHeader()}
                </>
              )}
            </>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    margin: 16,
    elevation: 2,
  },
  searchTypeContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 8,
    justifyContent: "space-between",
  },
  searchTypeChip: {
    marginRight: 8,
  },
  loader: {
    marginTop: 20,
  },
  resultsContainer: {
    flex: 1,
    padding: 16,
  },
  initialText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    opacity: 0.6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 10,
  },
  categoriesList: {
    marginVertical: 8,
  },
  categoryItem: {
    marginRight: 16,
    alignItems: "center",
    width: 100,
  },
  categoryItemContent: {
    alignItems: "center",
  },
  categoryImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  categoryImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#e0e0e0",
    marginBottom: 8,
  },
  categoryName: {
    textAlign: "center",
    fontSize: 14,
  },
  restaurantList: {
    maxHeight: 300,
  },
  restaurantItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  activeRestaurantItem: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  restaurantItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  restaurantLogo: {
    marginRight: 12,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
  },
  cuisineText: {
    fontSize: 14,
    opacity: 0.7,
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  categoryHeader: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 6,
    padding: 4,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: 4,
  },
  dishItem: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "rgba(0, 0, 0, 0.02)",
  },
  dishInfoContainer: {
    flex: 1,
  },
  dishName: {
    fontSize: 16,
    fontWeight: "500",
  },
  dishRestaurant: {
    fontSize: 14,
    fontStyle: "italic",
    marginTop: 2,
  },
  dishCategory: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
  },
  dishPrice: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 4,
  },
  dishImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    opacity: 0.6,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
});

export default SearchScreen;
