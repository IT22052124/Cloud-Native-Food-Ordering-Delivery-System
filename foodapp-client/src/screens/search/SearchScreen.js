import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StatusBar,
} from "react-native";
import { Text, Divider, Chip, Badge } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../context/ThemeContext";
import { useLocation } from "../../context/LocationContext";
import dataService from "../../services/dataService";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

// Import UI components
import SearchBar from "../../components/ui/SearchBar";
import FoodCard from "../../components/ui/FoodCard";

const { width } = Dimensions.get("window");

const SearchScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const { selectedAddress, locationLoading } = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeRestaurantId, setActiveRestaurantId] = useState(null);
  const [searchType, setSearchType] = useState("all"); // "all", "restaurants", "dishes", "categories"
  const [foodCategories, setFoodCategories] = useState([]);

  useEffect(() => {
    // Check if search query is passed from navigation params
    if (route.params?.searchQuery) {
      setSearchQuery(route.params.searchQuery);
    }
  }, [route.params]);

  useEffect(() => {
    // Clear results if search query is empty
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setRestaurants([]);
      return;
    }

    // Debounce search to avoid too many API calls
    const debounceTimer = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, searchType, selectedAddress]);

  useEffect(() => {
    // Fetch food categories from API
    const fetchCategories = async () => {
      try {
        const response = await dataService.getCategories();
        if (response && response.success && response.categories) {
          setFoodCategories(response.categories);
        } else {
          console.warn("Failed to fetch food categories:", response);
        }
      } catch (error) {
        console.error("Error fetching food categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const performSearch = async (query) => {
    try {
      setLoading(true);

      // Prepare search parameters
      const searchParams = {
        query: query,
        sort: "distance",
      };

      // Add location data if available
      if (selectedAddress) {
        searchParams.lat = selectedAddress.latitude;
        searchParams.lng = selectedAddress.longitude;
        searchParams.range = 100; // 100km radius
      }

      console.log("Searching with params:", searchParams);

      // Call the advanced search API
      const response = await dataService.advancedSearch(searchParams);
      console.log("Search response:", response);

      if (response.success && response.restaurants) {
        const processedRestaurants = response.restaurants.map((restaurant) => {
          // Ensure we have an array of categorized dishes
          const categorizedDishes = restaurant.categorizedDishes || [];

          // Count matching dishes (that contain the search query)
          const matchingDishes = categorizedDishes.flatMap((category) =>
            (category.dishes || []).filter((dish) =>
              dish.name.toLowerCase().includes(query.toLowerCase())
            )
          );

          // Count total dishes across all categories
          const totalDishes = categorizedDishes.reduce(
            (total, category) =>
              total + (category.dishes ? category.dishes.length : 0),
            0
          );

          // Determine match type (restaurant name match or dish match)
          const isRestaurantNameMatch = restaurant.name
            .toLowerCase()
            .includes(query.toLowerCase());
          const isDishMatch = matchingDishes.length > 0;

          const matchType = isRestaurantNameMatch
            ? "nameMatch"
            : isDishMatch
            ? "dishMatch"
            : "other";

          // Process basic restaurant info
          return {
            ...restaurant,
            id: restaurant._id || restaurant.id, // Support both formats
            cuisineType: restaurant.cuisineType || "Various",
            rating:
              restaurant.rating ||
              (restaurant.reviews && restaurant.reviews.length > 0
                ? (
                    restaurant.reviews.reduce(
                      (sum, review) => sum + review.rating,
                      0
                    ) / restaurant.reviews.length
                  ).toFixed(1)
                : "New"),
            deliveryTime: restaurant.estimatedPrepTime
              ? `${restaurant.estimatedPrepTime}-${
                  restaurant.estimatedPrepTime + 10
                } min`
              : "30-40 min",
            image:
              restaurant.imageUrls && restaurant.imageUrls.length > 0
                ? restaurant.imageUrls[0]
                : restaurant.coverImageUrl || "https://via.placeholder.com/150",
            // Include categorized dishes in the restaurant object
            dishes: categorizedDishes,
            totalDishes: totalDishes,
            matchingDishes: matchingDishes,
            matchType: matchType,
            searchRelevance: {
              matchType: matchType,
              matchingDishCount: matchingDishes.length,
            },
          };
        });

        console.log("Processed restaurants:", processedRestaurants.length);
        if (processedRestaurants.length > 0) {
          console.log(
            "First restaurant dishes:",
            processedRestaurants[0].dishes?.length || 0
          );
        }

        // Get all unique dishes across all restaurants that match the query
        const allMatchingDishes = processedRestaurants.flatMap(
          (restaurant) => restaurant.matchingDishes || []
        );

        setSearchResults(processedRestaurants);
        setRestaurants(processedRestaurants);

        // Log match information for debugging
        processedRestaurants.forEach((restaurant) => {
          console.log(
            `Restaurant ${restaurant.name} match type: ${
              restaurant.matchType
            }, matching dishes: ${restaurant.matchingDishes?.length || 0}`
          );
        });
      } else {
        console.warn("Advanced search returned unexpected format:", response);
        setSearchResults([]);
        setRestaurants([]);
      }
    } catch (error) {
      console.error("Error searching:", error);
      setSearchResults([]);
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRestaurantPress = (restaurantId) => {
    // Navigate to RestaurantDetailScreen with the restaurant ID
    const restaurant = restaurants.find((r) => r.id === restaurantId);
    if (restaurant) {
      navigation.navigate("RestaurantDetail", { restaurantId: restaurantId });
    }
  };

  const handleCategoryPress = (category) => {
    // Set search query to category name and focus search on category dishes
    setSearchQuery(category.name);
    setSearchType("dishes");

    // Perform a new search filtered by this category
    const searchParams = {
      query: category.name,
      sort: "distance",
    };

    // Add location data if available
    if (selectedAddress) {
      searchParams.lat = selectedAddress.latitude;
      searchParams.lng = selectedAddress.longitude;
      searchParams.range = 100; // 100km radius
    }

    // Use existing search function but with category focus
    performSearch(category.name);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      performSearch(searchQuery);
    }
  };

  const renderSearchTypeSelector = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.searchTypeContainer}
    >
      <TouchableOpacity
        style={[
          styles.filterChip,
          searchType === "all" && {
            backgroundColor: theme.colors.primary,
            shadowColor: theme.colors.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 3,
          },
        ]}
        onPress={() => setSearchType("all")}
      >
        <Text
          style={[
            styles.filterChipText,
            searchType === "all" && {
              color: "#FFFFFF",
              fontFamily: "Poppins-SemiBold",
            },
          ]}
        >
          All
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.filterChip,
          searchType === "restaurants" && {
            backgroundColor: theme.colors.primary,
            shadowColor: theme.colors.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 3,
          },
        ]}
        onPress={() => setSearchType("restaurants")}
      >
        <Text
          style={[
            styles.filterChipText,
            searchType === "restaurants" && {
              color: "#FFFFFF",
              fontFamily: "Poppins-SemiBold",
            },
          ]}
        >
          Restaurants
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.filterChip,
          searchType === "dishes" && {
            backgroundColor: theme.colors.primary,
            shadowColor: theme.colors.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 3,
          },
        ]}
        onPress={() => setSearchType("dishes")}
      >
        <Text
          style={[
            styles.filterChipText,
            searchType === "dishes" && {
              color: "#FFFFFF",
              fontFamily: "Poppins-SemiBold",
            },
          ]}
        >
          Dishes
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.filterChip,
          searchType === "categories" && {
            backgroundColor: theme.colors.primary,
            shadowColor: theme.colors.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 3,
          },
        ]}
        onPress={() => setSearchType("categories")}
      >
        <Text
          style={[
            styles.filterChipText,
            searchType === "categories" && {
              color: "#FFFFFF",
              fontFamily: "Poppins-SemiBold",
            },
          ]}
        >
          Categories
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderRestaurantItem = ({ item, showMatchingDishCount = false }) => {
    const deliveryTime = item.deliveryTime || "30-45";
    const rating = item.rating || 4.5;

    return (
      <TouchableOpacity
        style={[styles.restaurantCard, { backgroundColor: theme.colors.card }]}
        onPress={() => handleRestaurantPress(item.id)}
        activeOpacity={0.7}
      >
        <Image
          source={{
            uri:
              item.image ||
              (item.imageUrls && item.imageUrls.length > 0
                ? item.imageUrls[0]
                : "https://via.placeholder.com/150"),
          }}
          style={styles.restaurantImage}
          // defaultSource={require("../../../assets/restaurant-placeholder.png")}
        />
        <View style={styles.restaurantDetails}>
          <Text style={[styles.restaurantName, { color: theme.colors.text }]}>
            {item.name}
          </Text>
          <View style={styles.restaurantMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.metaText}>{rating}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons
                name="time-outline"
                size={16}
                color={theme.colors.text}
              />
              <Text style={styles.metaText}>{deliveryTime} min</Text>
            </View>
            {item.deliveryFee !== undefined && (
              <View style={styles.metaItem}>
                <Ionicons
                  name="bicycle-outline"
                  size={16}
                  color={theme.colors.text}
                />
                <Text style={styles.metaText}>
                  ${parseFloat(item.deliveryFee).toFixed(2)}
                </Text>
              </View>
            )}
          </View>

          {showMatchingDishCount &&
            item.matchingDishes &&
            item.matchingDishes.length > 0 && (
              <View style={styles.matchingDishesContainer}>
                <Text
                  style={[
                    styles.matchingDishesText,
                    { color: theme.colors.primary },
                  ]}
                >
                  {item.matchingDishes.length} matching{" "}
                  {item.matchingDishes.length === 1 ? "dish" : "dishes"}
                </Text>
                <Text
                  style={styles.matchingDishNames}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item.matchingDishes
                    .slice(0, 3)
                    .map((dish) => dish.name)
                    .join(", ")}
                  {item.matchingDishes.length > 3 ? "..." : ""}
                </Text>
              </View>
            )}
        </View>
        <Ionicons
          name="chevron-forward"
          size={24}
          color={theme.colors.text}
          style={{ marginLeft: 8 }}
        />
      </TouchableOpacity>
    );
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryChip}
      onPress={() => handleCategoryPress(item)}
    >
      <Image
        source={{ uri: item.image || "https://via.placeholder.com/100" }}
        style={styles.categoryImage}
      />
      <Text style={styles.categoryChipText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderCategory = ({ item }) => {
    console.log(
      `Rendering category: ${item.categoryName} with ${
        item.dishes?.length || 0
      } dishes`
    );
    if (!item.dishes || item.dishes.length === 0) {
      console.log(`Skipping empty category: ${item.categoryName}`);
      return null;
    }

    return (
      <View style={styles.categoryContainer}>
        <Text style={styles.categoryTitle}>{item.categoryName}</Text>
        <FlatList
          data={item.dishes}
          renderItem={renderDishItem}
          keyExtractor={(item) =>
            item._id?.toString() || Math.random().toString()
          }
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.dishList}
          ListEmptyComponent={() => (
            <Text style={styles.emptyMessage}>No dishes in this category</Text>
          )}
        />
      </View>
    );
  };

  const renderRestaurantDishes = (restaurant) => {
    if (!restaurant) {
      console.log("Cannot render dishes: restaurant is null or undefined");
      return null;
    }

    // Debug log to see if we have categorized dishes
    console.log(
      `Restaurant ${restaurant.name} has categorizedDishes:`,
      restaurant.categorizedDishes
        ? `${restaurant.categorizedDishes.length} categories`
        : "No categorizedDishes array"
    );

    // Early return if no categorized dishes
    if (
      !restaurant.categorizedDishes ||
      restaurant.categorizedDishes.length === 0
    ) {
      return (
        <View style={styles.noDishesContainer}>
          <Text style={styles.noDishesText}>
            No dishes available for this restaurant
          </Text>
        </View>
      );
    }

    // Log counts of dishes by category for debugging
    restaurant.categorizedDishes.forEach((category) => {
      console.log(
        `Category ${category.categoryName}: ${
          category.dishes?.length || 0
        } dishes`
      );
    });

    // Filter out empty categories
    const nonEmptyCategories = restaurant.categorizedDishes.filter(
      (category) => category.dishes && category.dishes.length > 0
    );

    if (nonEmptyCategories.length === 0) {
      return (
        <View style={styles.noDishesContainer}>
          <Text style={styles.noDishesText}>
            No dishes available for this restaurant
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.dishesContainer}>
        <Text style={styles.dishesTitle}>Menu</Text>
        <FlatList
          data={nonEmptyCategories}
          renderItem={renderCategory}
          keyExtractor={(item, index) =>
            `category-${item.categoryName || index}`
          }
          contentContainerStyle={styles.categoriesList}
          ListEmptyComponent={() => (
            <Text style={styles.emptyMessage}>No categories available</Text>
          )}
        />
      </View>
    );
  };

  const renderDishItem = ({ item }) => {
    console.log("Rendering dish:", item);

    // Check if dish exists and has required properties
    if (!item || !item.name) {
      console.log("Invalid dish data:", item);
      return null;
    }

    // Safely get the image URL
    const imageUrl =
      item.imageUrls && item.imageUrls.length > 0
        ? item.imageUrls[0]
        : item.imageUrl || item.image || "https://via.placeholder.com/160x120";

    // Check if dish has portions/variants
    const hasPortions = item.portions && item.portions.length > 0;
    const priceRange = hasPortions
      ? `LKR ${parseFloat(item.portions[0].price || 0).toFixed(
          2
        )} - $${parseFloat(
          item.portions[item.portions.length - 1].price || 0
        ).toFixed(2)}`
      : `LKR ${(item.price || 0).toFixed(2)}`;

    return (
      <TouchableOpacity
        style={styles.dishCard}
        onPress={() =>
          navigation.navigate("DishDetail", {
            restaurantId: restaurant._id,
            dishId: item._id,
          })
        }
      >
        <Image
          source={{ uri: imageUrl }}
          style={styles.horizontalDishImage}
          // defaultSource={require("../../../assets/images/placeholder-food.png")}
        />
        <View style={styles.dishInfo}>
          <Text style={styles.dishName} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.dishPriceContainer}>
            <Text style={styles.dishPrice}>{priceRange}</Text>
            {hasPortions && (
              <Text style={styles.portionsAvailable}>
                {item.portions.length}{" "}
                {item.portions.length === 1 ? "size" : "sizes"}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderResultsSection = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      );
    }

    // No results found
    if (searchQuery && searchResults.length === 0) {
      return (
        <View style={styles.noResultsContainer}>
          <Ionicons name="search-outline" size={48} color="#AAAAAA" />
          <Text style={styles.noResultsText}>
            No results found for "{searchQuery}"
          </Text>
        </View>
      );
    }

    // If we have search results, display them based on match type
    if (searchQuery && searchResults.length > 0) {
      // Group restaurants by match type
      const restaurantNameMatches = searchResults.filter(
        (r) => r.matchType === "nameMatch"
      );
      const dishMatches = searchResults.filter(
        (r) => r.matchType === "dishMatch"
      );

      const categoryMatches = searchResults.filter(
        (r) => r.matchType === "other"
      );

      // Get all unique dishes that match the search query across all restaurants
      const allMatchingDishes = searchResults
        .flatMap((restaurant) =>
          restaurant.matchingDishes
            ? restaurant.matchingDishes.map((dish) => ({
                ...dish,
                restaurantId: restaurant.id,
                restaurantName: restaurant.name,
              }))
            : []
        )
        .filter(
          (dish, index, self) =>
            index === self.findIndex((d) => d._id === dish._id)
        );
      console.log("All matching dishes:", allMatchingDishes);
      return (
        <ScrollView style={styles.resultsContainer}>
          {/* Matching Restaurants Section */}
          {restaurantNameMatches.length > 0 && (
            <View style={styles.resultsSection}>
              <Text style={styles.resultsSectionTitle}>
                Matching Restaurants
              </Text>
              <FlatList
                data={restaurantNameMatches}
                renderItem={({ item }) =>
                  renderRestaurantItem({ item, showMatchingDishCount: true })
                }
                keyExtractor={(item) => `restaurant-${item.id || item._id}`}
                scrollEnabled={false}
                style={styles.resultsList}
              />
            </View>
          )}

          {/* Matching Dishes Section */}
          {allMatchingDishes.length > 0 && (
            <View style={styles.resultsSection}>
              <Text style={styles.resultsSectionTitle}>Matching Dishes</Text>
              <FlatList
                data={allMatchingDishes}
                renderItem={({ item }) => {
                  // Check if dish has portions/variants
                  const hasPortions = item.portions && item.portions.length > 0;
                  const priceDisplay = hasPortions
                    ? `${parseFloat(item.portions[0].price || 0).toFixed(
                        2
                      )} - LKR ${parseFloat(
                        item.portions[item.portions.length - 1].price || 0
                      ).toFixed(2)}`
                    : `${parseFloat(item.price || 0).toFixed(2)}`;

                  return (
                    <TouchableOpacity
                      style={[
                        styles.dishCardWithRestaurant,
                        { backgroundColor: theme.colors.card },
                      ]}
                      onPress={() =>
                        navigation.navigate("DishDetail", {
                          restaurantId: item.restaurantId,
                          dishId: item._id,
                        })
                      }
                    >
                      <Image
                        source={{
                          uri:
                            item.imageUrls && item.imageUrls.length > 0
                              ? item.imageUrls[0]
                              : item.image || "https://via.placeholder.com/100",
                        }}
                        style={styles.dishImage}
                        // defaultSource={require("../../../assets/dish-placeholder.png")}
                      />
                      <View style={styles.dishDetails}>
                        <Text
                          style={[
                            styles.dishName,
                            { color: theme.colors.text },
                          ]}
                        >
                          {item.name}
                        </Text>
                        <View style={styles.dishPriceRow}>
                          <Text style={styles.dishPrice}>
                            LKR {priceDisplay}
                          </Text>
                        </View>
                        {hasPortions && (
                          <View style={styles.dishPriceRow}>
                            <Text style={styles.portionInfo}>
                              {item.portions.length}{" "}
                              {item.portions.length === 1
                                ? "portion"
                                : "portions"}
                            </Text>
                          </View>
                        )}
                        <Text style={styles.dishRestaurantName}>
                          at {item.restaurantName}
                        </Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={24}
                        color={theme.colors.text}
                        style={{ marginLeft: 8 }}
                      />
                    </TouchableOpacity>
                  );
                }}
                keyExtractor={(item) => `dish-${item._id}`}
                scrollEnabled={false}
                style={styles.resultsList}
              />
            </View>
          )}

          {/* Restaurants with Matching Dishes Section */}
          {dishMatches.length > 0 && (
            <View style={styles.resultsSection}>
              <Text style={styles.resultsSectionTitle}>
                Restaurants with Matching Dishes
              </Text>
              <FlatList
                data={dishMatches}
                renderItem={({ item }) =>
                  renderRestaurantItem({ item, showMatchingDishCount: true })
                }
                keyExtractor={(item) => `dish-rest-${item.id || item._id}`}
                scrollEnabled={false}
                style={styles.resultsList}
              />
            </View>
          )}

          {/* Category Matches Section */}
          {categoryMatches.length > 0 && (
            <View style={styles.resultsSection}>
              <Text style={styles.resultsSectionTitle}>Category Matches</Text>
              <FlatList
                data={categoryMatches.flatMap((restaurant) => {
                  // Filter to only include categories that match the search query
                  const matchingCategories = restaurant.categorizedDishes
                    ? restaurant.categorizedDishes.filter((category) =>
                        category.categoryName
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase())
                      )
                    : [];

                  // Get dishes from matching categories only
                  return matchingCategories.flatMap((category) =>
                    (category.dishes || []).map((dish) => ({
                      ...dish,
                      restaurantId: restaurant._id,
                      restaurantName: restaurant.name,
                      category: category.categoryName,
                    }))
                  );
                })}
                renderItem={({ item }) => {
                  // Check if dish has portions/variants
                  const hasPortions = item.portions && item.portions.length > 0;
                  const priceDisplay = hasPortions
                    ? `${parseFloat(item.portions[0].price || 0).toFixed(
                        2
                      )} - LKR ${parseFloat(
                        item.portions[item.portions.length - 1].price || 0
                      ).toFixed(2)}`
                    : `${parseFloat(item.price || 0).toFixed(2)}`;

                  return (
                    <TouchableOpacity
                      style={[
                        styles.dishCardWithRestaurant,
                        { backgroundColor: theme.colors.card },
                      ]}
                      onPress={() =>
                        navigation.navigate("DishDetail", {
                          restaurantId: item.restaurantId,
                          dishId: item._id,
                        })
                      }
                    >
                      <Image
                        source={{
                          uri:
                            item.imageUrls && item.imageUrls.length > 0
                              ? item.imageUrls[0]
                              : item.image || "https://via.placeholder.com/100",
                        }}
                        style={styles.dishImage}
                      />
                      <View style={styles.dishDetails}>
                        <Text
                          style={[
                            styles.dishName,
                            { color: theme.colors.text },
                          ]}
                        >
                          {item.name}
                        </Text>
                        <View style={styles.dishPriceRow}>
                          <Text style={styles.dishPrice}>
                            LKR {priceDisplay}
                          </Text>
                        </View>
                        <Text style={styles.dishCategoryName}>
                          {item.category}
                        </Text>
                        <Text style={styles.dishRestaurantName}>
                          at {item.restaurantName}
                        </Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={24}
                        color={theme.colors.text}
                        style={{ marginLeft: 8 }}
                      />
                    </TouchableOpacity>
                  );
                }}
                keyExtractor={(item) => `category-dish-${item._id}`}
                scrollEnabled={false}
                style={styles.resultsList}
                ListEmptyComponent={() => (
                  <Text style={styles.emptyMessage}>
                    No dishes found in matching categories
                  </Text>
                )}
              />
            </View>
          )}
        </ScrollView>
      );
    }

    // If no search query, show popular categories
    return <ScrollView>{renderPopularCategories()}</ScrollView>;
  };

  // Display location info in the header
  const renderLocationInfo = () => {
    if (!selectedAddress) {
      return (
        <TouchableOpacity
          style={styles.locationInfoContainer}
          onPress={() => navigation.navigate("Home")}
        >
          <Ionicons
            name="location-outline"
            size={18}
            color={theme.colors.error}
          />
          <Text
            style={[styles.locationInfoText, { color: theme.colors.error }]}
          >
            Current Location
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={styles.locationInfoContainer}
        onPress={() => navigation.navigate("Home")}
      >
        <Ionicons name="location" size={18} color={theme.colors.primary} />
        <Text
          style={[styles.locationInfoText, { color: theme.colors.primary }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {selectedAddress.street ||
            selectedAddress.label ||
            "Current Location"}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderPopularCategories = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Popular Categories
        </Text>
      </View>

      <FlatList
        data={foodCategories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => `category-${item.id}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesHorizontalList}
      />
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar
        barStyle={theme.mode === "dark" ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.background}
      />

      {/* Search header with back button and search bar */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>

        <View style={styles.searchBarContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmit={handleSearch}
            onClear={handleClearSearch}
            autoFocus={true}
            placeholder="Search for restaurants or dishes"
          />
        </View>
      </View>

      {/* Location indicator */}
      {renderLocationInfo()}

      {/* Filter tabs with improved styling */}
      <View style={styles.filterContainer}>{renderSearchTypeSelector()}</View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderResultsSection()}

        {/* Extra space at bottom for the tab bar */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },

  backButton: {
    padding: 8,
    marginRight: 4,
  },
  searchBarContainer: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 24,
    paddingHorizontal: 6,
    height: 44,
    justifyContent: "center",
    marginRight: 8,
  },
  searchBarInput: {
    backgroundColor: "transparent",
    fontSize: 16,
  },
  locationInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  locationInfoText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    marginLeft: 8,
  },
  filterContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  searchTypeContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterChip: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 50,
    backgroundColor: "#F0F0F0",
    marginRight: 12,
    elevation: 1,
  },
  filterChipText: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
    paddingHorizontal: 32,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 18,
    textAlign: "center",
    fontFamily: "Poppins-SemiBold",
  },
  emptyStateSubtext: {
    marginTop: 8,
    fontSize: 14,
    textAlign: "center",
    color: "#888",
    fontFamily: "Poppins-Regular",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
  },
  sectionContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    fontWeight: "700",
  },
  resultCount: {
    fontSize: 14,
    color: "#888",
    fontFamily: "Poppins-Regular",
  },
  instructionBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.03)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: "#666",
    marginLeft: 6,
  },
  restaurantCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
    padding: 12,
  },
  restaurantImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  restaurantDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  restaurantName: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    marginBottom: 6,
  },
  restaurantMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    flexWrap: "wrap",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
    marginBottom: 4,
  },
  metaText: {
    marginLeft: 4,
    color: "#666",
    fontSize: 12,
    fontFamily: "Poppins-Regular",
  },
  matchingDishesContainer: {
    marginTop: 4,
  },
  matchingDishesText: {
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
  },
  matchingDishNames: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#666",
  },
  chevron: {
    marginLeft: "auto",
  },
  dishesGradient: {
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  dishesSubtitle: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Poppins-Regular",
    marginBottom: 16,
    marginTop: -4,
  },
  dishesContainer: {
    marginTop: 16,
  },
  dishesTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    marginBottom: 12,
  },
  categoryContainer: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    marginBottom: 12,
  },
  dishList: {
    paddingBottom: 8,
  },
  emptyMessage: {
    padding: 10,
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  noDishesContainer: {
    padding: 20,
    alignItems: "center",
  },
  noDishesText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  bottomPadding: {
    height: 80,
  },
  dishCard: {
    width: 160,
    marginRight: 12,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  dishImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#f0f0f0", // Placeholder background color
  },
  dishInfo: {
    padding: 10,
  },
  dishName: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    marginBottom: 4,
  },
  dishPriceContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dishPrice: {
    fontSize: 14,
    fontFamily: "Poppins-Bold",
    color: "#FF4500",
  },
  portionsAvailable: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#666",
    fontStyle: "italic",
  },
  portionsContainer: {
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  portionText: {
    fontSize: 11,
    fontFamily: "Poppins-Regular",
  },
  categoriesList: {
    paddingBottom: 20,
  },
  dishesHorizontalList: {
    paddingVertical: 10,
    paddingRight: 16,
  },
  categoryChip: {
    alignItems: "center",
    width: 120,
    marginRight: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryChipText: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    textAlign: "center",
  },
  categoryImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 12,
  },
  resultSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  resultSectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    marginBottom: 16,
    color: "#333333",
  },
  horizontalListContent: {
    paddingBottom: 20,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
    paddingHorizontal: 32,
  },
  noResultsText: {
    marginTop: 16,
    fontSize: 18,
    textAlign: "center",
    fontFamily: "Poppins-SemiBold",
  },
  noResultsSubText: {
    marginTop: 8,
    fontSize: 14,
    textAlign: "center",
    color: "#888",
    fontFamily: "Poppins-Regular",
  },
  resultsContainer: {
    padding: 16,
  },
  resultsList: {
    paddingBottom: 16,
  },
  dishCardWithRestaurant: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
    padding: 12,
  },
  dishDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  dishRestaurantName: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#666",
  },
  horizontalDishImage: {
    width: "100%",
    height: 120,
    backgroundColor: "#f0f0f0",
  },
  dishPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  portionInfo: {
    fontSize: 11,
    fontFamily: "Poppins-Regular",
    color: "#777",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 6,
    paddingVertical: 2,
    width: "auto",
    borderRadius: 4,
  },
  dishCategoryName: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#666",
  },
});

export default SearchScreen;
