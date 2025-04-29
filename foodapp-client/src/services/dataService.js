import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

// API Base URLs
const AUTH_API_URL = `http://192.168.1.6:5001/api`;
const ORDER_API_URL = `http://192.168.1.6:5002/api/orders`;
const CART_API_URL = `http://192.168.1.6:5002/api/cart`;
const RESTAURANT_API_URL = `http://192.168.1.6:5006/api`;
const PAYMENT_API_URL = `http://192.168.1.6:5004/api/payment`;

// Sample payment methods
const samplePaymentMethods = [
  {
    id: "1",
    name: "Credit Card",
    icon: "credit-card",
    isDefault: true,
  },
  {
    id: "2",
    name: "Cash on Delivery",
    icon: "cash",
    isDefault: false,
  },
  {
    id: "3",
    name: "Digital Wallet",
    icon: "wallet",
    isDefault: false,
  },
];

// Order status constants
export const ORDER_STATUS = {
  PLACED: "PLACED",
  PREPARING: "PREPARING",
  READY_FOR_PICKUP: "READY_FOR_PICKUP",
  OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
};

// API client with error handling
const apiClient = {
  get: async (url, headers = {}) => {
    try {
      const token = await getToken();
      const response = await axios.get(url, {
        headers: {
          ...headers,
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      return response.data;
    } catch (error) {
      console.error(`GET request to ${url} failed:`, error);
      throw handleApiError(error);
    }
  },

  post: async (url, data = {}, headers = {}) => {
    try {
      const token = await getToken();
      const response = await axios.post(url, data, {
        headers: {
          ...headers,
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      return response.data;
    } catch (error) {
      console.error(`POST request to ${url} failed:`, error);
      throw handleApiError(error);
    }
  },

  put: async (url, data = {}, headers = {}) => {
    try {
      const token = await getToken();
      const response = await axios.put(url, data, {
        headers: {
          ...headers,
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      return response.data;
    } catch (error) {
      console.error(`PUT request to ${url} failed:`, error);
      throw handleApiError(error);
    }
  },

  patch: async (url, data = {}, headers = {}) => {
    try {
      const token = await getToken();
      const response = await axios.patch(url, data, {
        headers: {
          ...headers,
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      return response.data;
    } catch (error) {
      console.error(`PATCH request to ${url} failed:`, error);
      throw handleApiError(error);
    }
  },

  delete: async (url, headers = {}) => {
    try {
      const token = await getToken();
      const response = await axios.delete(url, {
        headers: {
          ...headers,
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      return response.data;
    } catch (error) {
      console.error(`DELETE request to ${url} failed:`, error);
      throw handleApiError(error);
    }
  },
};

// Helper functions
const getToken = async () => {
  try {
    let token = await SecureStore.getItemAsync("token");
    if (!token) {
      // Fall back to AsyncStorage
      token = await AsyncStorage.getItem("authToken");
    }
    return token;
  } catch (e) {
    console.warn("Could not retrieve token from AsyncStorage:", e);
    return null;
  }
};

const handleApiError = (error) => {
  if (error.response) {
    // Server responded with a non-2xx status
    const errorMessage = error.response.data?.message || "Server error";
    const errorObj = new Error(errorMessage);
    errorObj.status = error.response.status;
    errorObj.data = error.response.data;
    return errorObj;
  } else if (error.request) {
    // Request was made but no response received
    return new Error("Network error. Please check your connection.");
  } else {
    // Error in request setup
    return new Error("Request configuration error.");
  }
};

// Service methods
const dataService = {
  // Restaurant endpoints
  getRestaurants: async () => {
    try {
      return await apiClient.get(`${RESTAURANT_API_URL}/restaurants`);
    } catch (error) {
      console.warn("Falling back to sample data for restaurants");
    }
  },

  getCategories: async () => {
    try {
      return await apiClient.get(`${RESTAURANT_API_URL}/categories`);
    } catch (error) {
      console.warn("Falling back to sample data for restaurants");
    }
  },

  getRestaurantById: async (id) => {
    try {
      return await apiClient.get(`${RESTAURANT_API_URL}/restaurants/${id}`);
    } catch (error) {
      console.warn("Falling back to sample data for restaurant detail");
    }
  },

  getRestaurantDishes: async (restaurantId) => {
    try {
      return await apiClient.get(
        `${RESTAURANT_API_URL}/restaurants/${restaurantId}/dishes`
      );
    } catch (error) {
      console.warn("Falling back to sample data for dishes");
    }
  },

  // Cart endpoints
  getCart: async () => {
    try {
      const response = await apiClient.get(CART_API_URL);
      return response;
    } catch (error) {
      console.warn("Failed to fetch cart from API:", error);
      // Return empty cart structure
      return {
        data: {
          restaurantDetails: null,
          items: [],
          totalCount: 0,
        },
      };
    }
  },

  addToCart: async (itemData) => {
    try {
      const response = await apiClient.post(CART_API_URL, itemData);
      return response;
    } catch (error) {
      console.error("Failed to add item to cart:", error);
      throw error;
    }
  },

  updateCartItem: async (cartId, data) => {
    try {
      const response = await apiClient.put(`${CART_API_URL}/${cartId}`, data);
      return response;
    } catch (error) {
      console.error("Failed to update cart item:", error);
      throw error;
    }
  },

  deleteCartItem: async (cartId) => {
    try {
      const response = await apiClient.delete(`${CART_API_URL}/${cartId}`);
      return response;
    } catch (error) {
      console.error("Failed to delete cart item:", error);
      throw error;
    }
  },

  bulkUpdateCart: async (items) => {
    try {
      const response = await apiClient.post(`${CART_API_URL}/bulk-update`, {
        items,
      });
      return response;
    } catch (error) {
      console.error("Failed to bulk update cart:", error);
      throw error;
    }
  },

  // Reset cart (clear all items)
  resetCart: async () => {
    try {
      const response = await apiClient.post(`${CART_API_URL}/reset`, {});
      return response;
    } catch (error) {
      console.error("Failed to reset cart:", error);
      throw error;
    }
  },

  // Order endpoints
  createOrder: async (orderData) => {
    try {
      const response = await apiClient.post(`${ORDER_API_URL}`, orderData);
      return {
        success: true,
        order: response,
      };
    } catch (error) {
      console.error("Error creating order:", error);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  getOrderById: async (orderId) => {
    try {
      const response = await apiClient.get(`${ORDER_API_URL}/${orderId}`);
      console.log("tax", response.order.restaurantOrder.tax);
      console.log("deliveryFee", response.order.restaurantOrder.deliveryFee);

      // Process the response to match the expected format in the client
      return {
        success: true,
        order: {
          ...response,
          tax: response.order.restaurantOrder.tax,
          deliveryFee: response.order.restaurantOrder.deliveryFee,
          id: response.order.orderId,
          status: response.order.restaurantOrder.status,
          deliveryAddress: response.order.deliveryAddress,
          statusUpdates: response.order.restaurantOrder.statusHistory?.reduce(
            (acc, status) => {
              const timestamp = new Date(status.timestamp).toLocaleString();
              switch (status.status) {
                case "PLACED":
                  acc.placed = timestamp;
                  break;
                case "PREPARING":
                  acc.preparing = timestamp;
                  break;
                case "READY_FOR_PICKUP":
                  acc.readyForPickup = timestamp;
                  break;
                case "OUT_FOR_DELIVERY":
                  acc.outForDelivery = timestamp;
                  break;
                case "DELIVERED":
                  acc.delivered = timestamp;
                  break;
                case "CANCELLED":
                  acc.cancelled = timestamp;
                  break;
              }
              return acc;
            },
            {}
          ),
        },
      };
    } catch (error) {
      console.error("Error retrieving order by id:", error);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  getOrders: async () => {
    try {
      return await apiClient.get(`${ORDER_API_URL}`);
    } catch (error) {
      console.error("Error retrieving order by id:", error);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  // Payment methods
  getPaymentMethods: async () => {
    return samplePaymentMethods;
  },

  // Sample service integration
  searchRestaurants: async (query) => {
    if (!query) return [];

    try {
      // Make API call to search restaurants
      const response = await apiClient.get(
        `${RESTAURANT_API_URL}/restaurants/search?query=${encodeURIComponent(
          query
        )}`
      );
      return response.restaurants || [];
    } catch (error) {
      console.error("Error searching restaurants from API:", error);

      // Fallback to sample data for development/demo
      const lowerQuery = query.toLowerCase();
      return sampleRestaurants.filter(
        (restaurant) =>
          restaurant.name.toLowerCase().includes(lowerQuery) ||
          restaurant.cuisineType.toLowerCase().includes(lowerQuery)
      );
    }
  },

  // Search dishes from a specific restaurant
  searchDishes: async (restaurantId, query) => {
    if (!restaurantId || !query) return [];

    try {
      // Make API call to search dishes from a specific restaurant
      const response = await apiClient.get(
        `${RESTAURANT_API_URL}/restaurants/${restaurantId}/dishes/search?query=${encodeURIComponent(
          query
        )}`
      );
      return response.dishes || [];
    } catch (error) {
      console.error("Error searching dishes from API:", error);

      // Fallback to sample data for development/demo
      const restaurant = sampleRestaurants.find((r) => r.id === restaurantId);
      if (!restaurant || !restaurant.dishes) return [];

      const lowerQuery = query.toLowerCase();
      return restaurant.dishes.filter(
        (dish) =>
          dish.name.toLowerCase().includes(lowerQuery) ||
          (dish.category && dish.category.toLowerCase().includes(lowerQuery)) ||
          (dish.description &&
            dish.description.toLowerCase().includes(lowerQuery))
      );
    }
  },

  // Search all dishes across all restaurants
  searchAllDishes: async (query) => {
    if (!query) return [];

    try {
      // Make API call to search all dishes
      const response = await apiClient.get(
        `${RESTAURANT_API_URL}/dishes/search?query=${encodeURIComponent(query)}`
      );
      return response.dishes || [];
    } catch (error) {
      console.error("Error searching all dishes from API:", error);

      // Fallback to sample data for development/demo
      const lowerQuery = query.toLowerCase();

      // Collect dishes from all restaurants with restaurant info
      const allDishes = [];
      sampleRestaurants.forEach((restaurant) => {
        if (restaurant.dishes) {
          const matchingDishes = restaurant.dishes.filter(
            (dish) =>
              dish.name.toLowerCase().includes(lowerQuery) ||
              (dish.category &&
                dish.category.toLowerCase().includes(lowerQuery)) ||
              (dish.description &&
                dish.description.toLowerCase().includes(lowerQuery))
          );

          // Add restaurant info to each dish
          matchingDishes.forEach((dish) => {
            allDishes.push({
              ...dish,
              restaurantId: restaurant.id,
              restaurantName: restaurant.name,
            });
          });
        }
      });

      return allDishes;
    }
  },

  // Search food categories
  searchCategories: async (query) => {
    if (!query) return [];

    try {
      // Make API call to search categories
      const response = await apiClient.get(
        `${RESTAURANT_API_URL}/categories/search?query=${encodeURIComponent(
          query
        )}`
      );
      return response.categories || [];
    } catch (error) {
      console.error("Error searching categories from API:", error);

      // Fallback to sample categories for development/demo
      const sampleCategories = [
        {
          id: "1",
          name: "Pizza",
          image:
            "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
        },
        {
          id: "2",
          name: "Burger",
          image:
            "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
        },
        {
          id: "3",
          name: "Sushi",
          image:
            "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
        },
        {
          id: "4",
          name: "Mexican",
          image:
            "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
        },
        {
          id: "5",
          name: "Italian",
          image:
            "https://images.unsplash.com/photo-1498579150354-977475b7ea0b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
        },
        {
          id: "6",
          name: "Chinese",
          image:
            "https://images.unsplash.com/photo-1563245372-f21724e3856d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
        },
        {
          id: "7",
          name: "Indian",
          image:
            "https://images.unsplash.com/photo-1505253758473-96b7015fcd40?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
        },
        {
          id: "8",
          name: "Dessert",
          image:
            "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
        },
      ];

      const lowerQuery = query.toLowerCase();
      return sampleCategories.filter((category) =>
        category.name.toLowerCase().includes(lowerQuery)
      );
    }
  },

  // Advanced search for restaurants with dishes grouped by categories
  advancedSearch: async (params) => {
    try {
      const { query, lat, lng, range, sort = "distance" } = params;

      // Build query parameters
      const queryParams = new URLSearchParams();
      if (query) queryParams.append("query", query);
      if (lat) queryParams.append("lat", lat);
      if (lng) queryParams.append("lng", lng);
      if (range) queryParams.append("range", range);
      if (sort) queryParams.append("sort", sort);

      const queryString = queryParams.toString();
      const endpoint = `${RESTAURANT_API_URL}/restaurants/advanced-search${
        queryString ? `?${queryString}` : ""
      }`;

      console.log("Advanced search endpoint:", endpoint);

      const response = await apiClient.get(endpoint);

      if (response) {
        // Handle case where response might be an array directly
        if (Array.isArray(response)) {
          console.log("Response is an array directly:", response.length);
          return {
            success: true,
            restaurants: response,
            count: response.length,
          };
        }

        // Regular expected response format
        if (response.success && response.restaurants) {
          console.log(`Found ${response.count} restaurants`);

          // Check if restaurants have dishes
          const restaurantsWithDishes = response.restaurants.map(
            (restaurant) => {
              const dishCount =
                restaurant.categorizedDishes?.reduce(
                  (sum, category) => sum + (category.dishes?.length || 0),
                  0
                ) || 0;

              console.log(
                `Restaurant ${restaurant.name} has ${dishCount} dishes`
              );

              // If there are no categorized dishes, create a default structure
              if (
                !restaurant.categorizedDishes ||
                restaurant.categorizedDishes.length === 0
              ) {
                console.log(
                  `No categorized dishes for ${restaurant.name}, creating empty structure`
                );
                restaurant.categorizedDishes = [];
              }

              return restaurant;
            }
          );

          return {
            success: true,
            restaurants: restaurantsWithDishes,
            count: restaurantsWithDishes.length,
          };
        }

        // Unexpected but still valid response
        if (response.restaurants) {
          console.log("Response has restaurants but no success flag");
          return {
            success: true,
            restaurants: response.restaurants,
            count: response.restaurants.length,
          };
        }

        console.warn("Advanced search returned unexpected format:", response);
        return {
          success: false,
          restaurants: [],
          count: 0,
        };
      } else {
        console.warn("Advanced search returned null or undefined response");
        return {
          success: false,
          restaurants: [],
          count: 0,
        };
      }
    } catch (error) {
      console.error("Error in advanced search:", error);
      // Try to extract error message
      const errorMessage =
        error.response?.data?.message || error.message || "Unknown error";
      console.log("Error message:", errorMessage);

      // Fallback to sample data for testing/demo when the backend is unavailable
      console.log("Falling back to sample restaurant data");

      // Filter sample restaurants based on query if available
      let filteredRestaurants = [...sampleRestaurants];
      if (params.query) {
        const lowerQuery = params.query.toLowerCase();
        filteredRestaurants = filteredRestaurants.filter(
          (restaurant) =>
            restaurant.name.toLowerCase().includes(lowerQuery) ||
            restaurant.cuisineType.toLowerCase().includes(lowerQuery)
        );
      }

      // Transform sample data to match expected format
      const restaurants = filteredRestaurants.map((restaurant) => {
        // Group dishes by category
        const dishCategories = {};
        restaurant.dishes.forEach((dish) => {
          const category = dish.category || "Uncategorized";
          if (!dishCategories[category]) {
            dishCategories[category] = [];
          }
          dishCategories[category].push({
            ...dish,
            _id: dish.id,
            restaurantId: restaurant.id,
            imageUrls: [dish.image], // Convert image to imageUrls array
          });
        });

        // Convert to array format
        const categorizedDishes = Object.keys(dishCategories).map(
          (category) => ({
            categoryName: category,
            dishes: dishCategories[category],
          })
        );

        return {
          ...restaurant,
          _id: restaurant.id,
          categorizedDishes,
        };
      });

      return {
        success: true,
        error: errorMessage,
        restaurants: restaurants,
        count: restaurants.length,
      };
    }
  },

  // Get restaurant details with dishes
  getRestaurantDetails: async (restaurantId) => {
    try {
      // First try to get restaurant details from API
      const response = await apiClient.get(
        `${RESTAURANT_API_URL}/restaurants/${restaurantId}`
      );

      // Get restaurant dishes separately
      try {
        const dishesResponse = await apiClient.get(
          `${RESTAURANT_API_URL}/restaurants/${restaurantId}/dishes`
        );

        // Combine restaurant details with dishes
        return {
          ...response,
          dishes: dishesResponse.dishes || [],
        };
      } catch (dishError) {
        console.error("Error fetching restaurant dishes:", dishError);
        return response; // Return restaurant details even if dishes fetch fails
      }
    } catch (error) {
      console.error("Error fetching restaurant details:", error);

      // Fallback to sample data for demo/development
      const restaurant = sampleRestaurants.find((r) => r.id === restaurantId);
      if (!restaurant) {
        throw new Error("Restaurant not found");
      }
      return restaurant;
    }
  },

  // Get order tracking information
  getOrderTracking: async (orderId) => {
    try {
      const response = await apiClient.get(
        `${ORDER_API_URL}/${orderId}/tracking`
      );

      // Process and return the tracking data
      return {
        orderId,
        status: response.status,
        restaurantLocation: response.restaurantLocation,
        driverLocation: response.driverLocation,
        routeCoordinates: response.route,
        estimatedArrival: response.estimatedDeliveryTime
          ? `${Math.ceil(
              (new Date(response.estimatedDeliveryTime) - new Date()) / 60000
            )} minutes`
          : "Calculating...",
        lastUpdated: response.lastUpdated || new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error getting order tracking:", error);
      // If tracking API fails, fall back to mock data for demo purposes
      if (sampleOrders) {
        const order = sampleOrders.find((o) => o.id === orderId);
        if (!order) throw new Error("Order not found");

        if (
          order.status === ORDER_STATUS.PLACED ||
          order.status === ORDER_STATUS.CANCELLED
        ) {
          throw new Error("Tracking not available for this order status");
        }

        const restaurantLocation = {
          latitude: 37.7825,
          longitude: -122.4078,
        };

        let driverLocation;
        let routeCoordinates;
        let estimatedArrival;

        if (order.status === ORDER_STATUS.OUT_FOR_DELIVERY) {
          driverLocation = {
            latitude: 37.7865,
            longitude: -122.4095,
          };

          routeCoordinates = [
            driverLocation,
            { latitude: 37.7855, longitude: -122.405 },
            { latitude: 37.7845, longitude: -122.401 },
            { latitude: 37.7835, longitude: -122.399 },
            order.deliveryAddress,
          ];

          estimatedArrival = "15-20 minutes";
        } else if (order.status === ORDER_STATUS.READY_FOR_PICKUP) {
          driverLocation = { ...restaurantLocation };
          routeCoordinates = [
            driverLocation,
            { latitude: 37.7835, longitude: -122.403 },
            { latitude: 37.7825, longitude: -122.4 },
            order.deliveryAddress,
          ];
          estimatedArrival = "25-30 minutes";
        } else {
          driverLocation = null;
          routeCoordinates = null;
          estimatedArrival = null;
        }

        return {
          orderId,
          status: order.status,
          restaurantLocation,
          driverLocation,
          routeCoordinates,
          estimatedArrival,
          lastUpdated: new Date().toISOString(),
        };
      }

      throw error;
    }
  },

  // User Address Management
  getUserAddresses: async () => {
    try {
      const response = await apiClient.get(
        `${AUTH_API_URL}/users/me/addresses`
      );
      return { success: true, addresses: response.addresses };
    } catch (error) {
      console.error("Error fetching user addresses:", error);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  addAddress: async (addressData) => {
    try {
      const response = await apiClient.post(
        `${AUTH_API_URL}/users/me/addresses`,
        addressData
      );
      return { success: true, address: response.address };
    } catch (error) {
      console.error("Error adding address:", error);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  updateAddress: async (addressId, addressData) => {
    try {
      const response = await apiClient.put(
        `${AUTH_API_URL}/users/me/addresses/${addressId}`,
        addressData
      );
      return { success: true, address: response.address };
    } catch (error) {
      console.error("Error updating address:", error);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  setDefaultAddress: async (addressId) => {
    try {
      const response = await apiClient.put(
        `${AUTH_API_URL}/users/me/addresses/${addressId}/default`,
        {}
      );
      return { success: true, address: response.address };
    } catch (error) {
      console.error("Error setting default address:", error);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  deleteAddress: async (addressId) => {
    try {
      await apiClient.delete(`${AUTH_API_URL}/users/me/addresses/${addressId}`);
      return { success: true };
    } catch (error) {
      console.error("Error deleting address:", error);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  createPaymentIntent: async (paymentData) => {
    try {
      const response = await apiClient.post(`${PAYMENT_API_URL}/initiate`, {
        orderId: paymentData.orderId,
        amount: paymentData.amount,
        currency: paymentData.currency || "lkr", // Default to LKR if not specified
      });

      return {
        success: true,
        clientSecret: response.clientSecret, // Ensure your backend returns this
      };
    } catch (error) {
      console.error("Error creating payment intent:", error);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
        error: error,
      };
    }
  },

  // Get restaurants filtered by distance from user location
  getRestaurantsByLocation: async (latitude, longitude, radius = 100) => {
    try {
      // Call the API endpoint with the coordinates and radius
      const response = await apiClient.get(
        `${RESTAURANT_API_URL}/restaurants/nearby?lat=${latitude}&lng=${longitude}&range=${radius}`
      );

      if (response.success && response.restaurants) {
        return {
          success: true,
          restaurants: response.restaurants,
          count: response.count,
        };
      } else {
        return {
          success: false,
          restaurants: null,
          count: 0,
        };
      }
    } catch (error) {
      console.error("Error getting restaurants by location:", error);
      return { success: false };
    }
  },

  // Get food categories from the API
  getFoodCategories: async () => {
    try {
      const response = await apiClient.get(
        `${RESTAURANT_API_URL}/restaurants/categories`
      );

      if (response && response.categories) {
        return {
          success: true,
          categories: response.categories,
        };
      } else {
        console.warn(
          "Categories endpoint returned unexpected format:",
          response
        );
        // Fallback to sample categories
        return {
          success: true,
          categories: [
            {
              id: 1,
              name: "Appetizers",
              image:
                "https://www.eatingwell.com/thmb/VZOpYLlkdhow-YKvWLTlotmVRjY=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/loaded-smashed-brussels-sprouts-4f5ab837d61d40c8a5bf27a398ca29eb.jpg",
            },
            {
              id: 2,
              name: "Main Course",
              image:
                "https://sp-ao.shortpixel.ai/client/to_webp,q_glossy,ret_img,w_600,h_400/https://thefoodcafe.com/wp-content/uploads/2018/04/Bacon-wrapped-jalapeno-Chicken-600x400.jpg",
            },
            {
              id: 3,
              name: "Desserts",
              image:
                "https://www.tasteofhome.com/wp-content/uploads/2019/05/Fried-Ice-Cream-Dessert-Bars-_EXPS_SDJJ19_232652_B02_06_1b_rms-2.jpg",
            },
            {
              id: 4,
              name: "Beverages",
              image:
                "https://media.istockphoto.com/id/1303977605/photo/five-cocktails-in-hands-joined-in-celebratory-toast.jpg?s=612x612&w=0&k=20&c=QtnWuVeQCwKOfXIISxfkuDhQTe15qnnKOFKgpcH1Vko=",
            },
            {
              id: 5,
              name: "Salads",
              image:
                "https://i2.wp.com/www.downshiftology.com/wp-content/uploads/2019/04/Cobb-Salad-main.jpg",
            },
            {
              id: 6,
              name: "Soups",
              image:
                "https://cdn.loveandlemons.com/wp-content/uploads/2023/01/tomato-soup-recipe.jpg",
            },
            {
              id: 7,
              name: "Breads",
              image:
                "https://www.allrecipes.com/thmb/CjzJwg2pACUzGODdxJL1BJDRx9Y=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/6788-amish-white-bread-DDMFS-4x3-6faa1e552bdb4f6eabdd7791e59b3c84.jpg",
            },
            {
              id: 8,
              name: "Rice Dishes",
              image:
                "https://www.allrecipes.com/thmb/NVjvH6r7xOrcoxmA-OjPs3uSmUA=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/RM-33385-best-spanish-rice-ddmfs-3x4-054478cf67f14ffebc114d2d18639634.jpg",
            },
            {
              id: 9,
              name: "Noodles",
              image:
                "https://takestwoeggs.com/wp-content/uploads/2023/11/Soy-Sauce-Pan-Fried-Noodles-Takestwoeggs-sq.jpg",
            },
            {
              id: 10,
              name: "Seafood",
              image:
                "https://assets.epicurious.com/photos/54b87c137cbba01c0db7ff8d/1:1/w_2560%2Cc_limit/51248830_cioppino_1x1.jpg",
            },
            {
              id: 11,
              name: "Grilled",
              image:
                "https://assets.epicurious.com/photos/5b843bce1abfc56568396369/1:1/w_2560%2Cc_limit/Grilled-Chicken-with-Mustard-Sauce-and-Tomato-Salad-recipe-2-22082018.jpg",
            },
            {
              id: 12,
              name: "Fast Food",
              image:
                "https://www.summahealth.org/-/media/project/summahealth/website/page-content/flourish/2_18a_fl_fastfood_400x400.webp?la=en&h=400&w=400&hash=145DC0CF6234A159261389F18A36742A",
            },
          ],
        };
      }
    } catch (error) {
      console.error("Error fetching food categories:", error);
      return { success: false, error: error.message };
    }
  },
};

export default dataService;
