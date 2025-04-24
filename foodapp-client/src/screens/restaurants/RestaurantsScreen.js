import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { Text, Card, Title, Searchbar } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import dataService from "../../services/dataService";
import { Ionicons } from "@expo/vector-icons";

const RestaurantsScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const categoryId = route.params?.categoryId;

  const [restaurants, setRestaurants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(categoryId || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedCategory]);

  const loadData = async () => {
    try {
      setLoading(true);
      const categoriesData = await dataService.getCategories();
      setCategories(categoriesData.categories);

      let restaurantsData;
      // if (selectedCategory) {
      //   restaurantsData = await dataService.getRestaurantsByCategory(
      //     selectedCategory
      //   );
      // } else {
      restaurantsData = await dataService.getRestaurants();
      // }

      setRestaurants(restaurantsData.restaurants);
    } catch (error) {
      console.error("Error loading restaurants:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = async () => {
    // if (!searchQuery.trim()) {
    //   loadData();
    //   return;
    // }

    // try {
    //   setLoading(true);
    //   const results = await dataService.searchRestaurants(searchQuery);
    //   setRestaurants(results);
    // } catch (error) {
    //   console.error("Error searching restaurants:", error);
    // } finally {
    //   setLoading(false);
    // }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const renderRestaurantItem = ({ item }) => (
    <Card
      style={[styles.restaurantCard, { ...theme.shadow.small }]}
      onPress={() =>
        navigation.navigate("RestaurantDetail", { restaurantId: item._id })
      }
    >
      <Card.Cover
        source={{ uri: item.coverImageUrl }}
        style={styles.restaurantImage}
      />
      <Card.Content>
        <Title style={styles.restaurantName}>{item.name}</Title>
        <View style={styles.infoContainer}>
          {/* <View style={styles.ratingContainer}>
            <Ionicons name="star" size={18} color={theme.colors.tertiary} />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View> */}
          {/* <Text style={styles.cuisineText}>{item.cuisineType}</Text> */}
        </View>
        <View style={styles.deliveryInfoContainer}>
          {/* <Ionicons name="time-outline" size={16} color={theme.colors.gray} />
          <Text style={styles.deliveryText}>{item.deliveryTime}</Text>
          <Ionicons
            name="bicycle-outline"
            size={16}
            color={theme.colors.gray}
            style={styles.icon}
          />
          <Text style={styles.deliveryText}>${item.deliveryFee} delivery</Text> */}
        </View>
      </Card.Content>
    </Card>
  );

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        selectedCategory === item.id && {
          backgroundColor: theme.colors.primary,
        },
      ]}
      onPress={() =>
        setSelectedCategory(selectedCategory === item.id ? null : item.id)
      }
    >
      <Text
        style={[
          styles.categoryText,
          selectedCategory === item.id && { color: theme.colors.white },
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Restaurants</Text>
        <View style={styles.placeholder} />
      </View>

      <Searchbar
        placeholder="Search restaurants"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={[styles.searchBar, { ...theme.shadow.small }]}
        iconColor={theme.colors.primary}
        onSubmitEditing={handleSearch}
        onIconPress={handleSearch}
      />

      <FlatList
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesList}
      />
    </View>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Image
        source={{
          uri: "https://png.pngtree.com/png-vector/20220708/ourmid/pngtree-fast-food-logo-png-image_5763171.png",
        }}
        style={styles.emptyImage}
      />
      <Text style={styles.emptyText}>No restaurants found</Text>
      <Text style={styles.emptySubtext}>
        {selectedCategory
          ? "Try selecting a different category"
          : "Try a different search term"}
      </Text>
    </View>
  );

  if (loading && !refreshing) {
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
      <FlatList
        data={restaurants}
        renderItem={renderRestaurantItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyComponent}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  backButton: {
    padding: 5,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  placeholder: {
    width: 24,
  },
  searchBar: {
    marginVertical: 10,
    borderRadius: 12,
    elevation: 2,
  },
  categoriesList: {
    marginVertical: 10,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 10,
    marginBottom: 5,
  },
  categoryText: {
    fontSize: 14,
  },
  listContent: {
    paddingBottom: 20,
  },
  restaurantCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  restaurantImage: {
    height: 150,
  },
  restaurantName: {
    fontSize: 18,
    marginTop: 5,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  ratingText: {
    marginLeft: 4,
    fontWeight: "bold",
  },
  cuisineText: {
    color: "#666",
  },
  deliveryInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  icon: {
    marginLeft: 10,
  },
  deliveryText: {
    marginLeft: 4,
    color: "#666",
    fontSize: 14,
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
  },
  emptyImage: {
    width: 100,
    height: 100,
    marginBottom: 20,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});

export default RestaurantsScreen;
