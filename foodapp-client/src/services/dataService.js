import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

// API Base URLs
const AUTH_API_URL = `http://192.168.1.7:5001/api`;
const ORDER_API_URL = `http://192.168.1.7:5002/api/orders`;
const CART_API_URL = `http://192.168.1.7:5002/api/cart`;
const RESTAURANT_API_URL = `http://192.168.1.7:5006/api`;
const PAYMENT_API_URL = `http://192.168.1.7:5004/api/payment`;

// Sample data for the app
const sampleRestaurants = [
  {
    id: "1",
    name: "Pizza Paradise",
    rating: 4.8,
    deliveryTime: "25-35 min",
    deliveryFee: "2.99",
    minOrder: 15,
    cuisineType: "Italian",
    address: "123 Main St, Anytown",
    image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
    coverImage:
      "https://images.unsplash.com/photo-1579751626657-72bc17010498?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80",
    description:
      "The finest pizzas made with the freshest ingredients. Our dough is made fresh daily and we use only the highest quality toppings.",
    dishes: [
      {
        id: "101",
        name: "Margherita Pizza",
        description: "Classic pizza with tomato sauce, mozzarella, and basil",
        price: 12.99,
        image:
          "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
        category: "Pizza",
        popular: true,
      },
      {
        id: "102",
        name: "Pepperoni Pizza",
        description:
          "Classic pizza with tomato sauce, mozzarella, and pepperoni",
        price: 14.99,
        image:
          "https://images.unsplash.com/photo-1628840042765-356cda07504e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
        category: "Pizza",
        popular: true,
      },
      {
        id: "103",
        name: "Garlic Bread",
        description: "Toasted bread with garlic butter and herbs",
        price: 5.99,
        image:
          "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
        category: "Sides",
        popular: false,
      },
      {
        id: "104",
        name: "Caesar Salad",
        description:
          "Fresh romaine lettuce with Caesar dressing, croutons, and parmesan",
        price: 7.99,
        image:
          "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
        category: "Salads",
        popular: false,
      },
    ],
  },
  {
    id: "2",
    name: "Burger Barn",
    rating: 4.5,
    deliveryTime: "15-25 min",
    deliveryFee: "1.99",
    minOrder: 10,
    cuisineType: "American",
    address: "456 Oak Ave, Anytown",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
    coverImage:
      "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80",
    description:
      "Juicy burgers made from 100% premium beef. All our burgers are flame-grilled to perfection and served with our signature sauce.",
    dishes: [
      {
        id: "201",
        name: "Classic Burger",
        description: "Beef patty with lettuce, tomato, and house sauce",
        price: 9.99,
        image:
          "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
        category: "Burgers",
        popular: true,
      },
      {
        id: "202",
        name: "Cheese Burger",
        description:
          "Beef patty with american cheese, lettuce, tomato, and house sauce",
        price: 10.99,
        image:
          "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
        category: "Burgers",
        popular: true,
      },
      {
        id: "203",
        name: "French Fries",
        description: "Crispy golden fries with sea salt",
        price: 3.99,
        image:
          "https://images.unsplash.com/photo-1585109649139-366815a0d713?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
        category: "Sides",
        popular: false,
      },
      {
        id: "204",
        name: "Vanilla Milkshake",
        description: "Creamy vanilla milkshake with whipped cream",
        price: 4.99,
        image:
          "https://images.unsplash.com/photo-1559598467-f8b76c8155d0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
        category: "Drinks",
        popular: false,
      },
    ],
  },
  {
    id: "3",
    name: "Sushi Express",
    rating: 4.7,
    deliveryTime: "30-40 min",
    deliveryFee: "3.99",
    minOrder: 20,
    cuisineType: "Japanese",
    address: "789 Maple Dr, Anytown",
    image:
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
    coverImage:
      "https://images.unsplash.com/photo-1611143669185-af224c5e3252?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80",
    description:
      "Authentic Japanese sushi made with the freshest fish. Our sushi chefs have over 10 years of experience and use traditional techniques.",
    dishes: [
      {
        id: "301",
        name: "California Roll",
        description: "Crab, avocado, and cucumber roll",
        price: 8.99,
        image:
          "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
        category: "Rolls",
        popular: true,
      },
      {
        id: "302",
        name: "Salmon Nigiri",
        description: "Fresh salmon over seasoned rice",
        price: 6.99,
        image:
          "https://images.unsplash.com/photo-1583623025817-d180a2fe075e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
        category: "Nigiri",
        popular: true,
      },
      {
        id: "303",
        name: "Miso Soup",
        description: "Traditional Japanese soup with tofu and seaweed",
        price: 3.99,
        image:
          "https://images.unsplash.com/photo-1607301406259-dfb186e15de8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
        category: "Soups",
        popular: false,
      },
      {
        id: "304",
        name: "Edamame",
        description: "Steamed soybean pods with sea salt",
        price: 4.99,
        image:
          "https://images.unsplash.com/photo-1603133872878-684f208fb84b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
        category: "Appetizers",
        popular: false,
      },
    ],
  },
  {
    id: "4",
    name: "Taco Town",
    rating: 4.3,
    deliveryTime: "20-30 min",
    deliveryFee: "2.49",
    minOrder: 12,
    cuisineType: "Mexican",
    address: "101 Pine St, Anytown",
    image:
      "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
    coverImage:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80",
    description:
      "Authentic Mexican tacos and burritos. We use traditional recipes passed down through generations and make our tortillas fresh daily.",
    dishes: [
      {
        id: "401",
        name: "Beef Taco",
        description:
          "Seasoned ground beef with lettuce, cheese, and salsa in a corn tortilla",
        price: 3.99,
        image:
          "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
        category: "Tacos",
        popular: true,
      },
      {
        id: "402",
        name: "Chicken Burrito",
        description:
          "Grilled chicken with rice, beans, cheese, and salsa in a flour tortilla",
        price: 8.99,
        image:
          "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
        category: "Burritos",
        popular: true,
      },
      {
        id: "403",
        name: "Chips & Guacamole",
        description: "Tortilla chips with freshly made guacamole",
        price: 5.99,
        image:
          "https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
        category: "Sides",
        popular: false,
      },
      {
        id: "404",
        name: "Horchata",
        description: "Traditional Mexican rice drink with cinnamon",
        price: 2.99,
        image:
          "https://images.unsplash.com/photo-1562707666-d172d575e15b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
        category: "Drinks",
        popular: false,
      },
    ],
  },
];

// Sample categories
const sampleCategories = [
  {
    id: "1",
    name: "Pizza",
    image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "2",
    name: "Burgers",
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
    name: "Chinese",
    image:
      "https://images.unsplash.com/photo-1563245372-f21724e3856d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "6",
    name: "Indian",
    image:
      "https://images.unsplash.com/photo-1585937421612-70a008356c36?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
  },
];

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

// Sample orders
const sampleOrders = [
  {
    id: "1001",
    orderNumber: "12345",
    restaurantId: "1",
    restaurantName: "Pizza Paradise",
    restaurantImage:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
    items: [
      {
        id: "101",
        name: "Margherita Pizza",
        price: 12.99,
        quantity: 1,
      },
      {
        id: "103",
        name: "Garlic Bread",
        price: 5.99,
        quantity: 1,
      },
    ],
    subtotal: 18.98,
    deliveryFee: 2.99,
    total: 21.97,
    status: ORDER_STATUS.DELIVERED,
    paymentMethod: "Credit Card",
    createdAt: "2023-04-20T14:30:00Z",
    deliveredAt: "2023-04-20T15:05:00Z",
    address: "123 Home St, Anytown",
    deliveryAddress: {
      latitude: 37.7749,
      longitude: -122.4194,
    },
    restaurantPhone: "+14155551234",
    statusUpdates: {
      placed: "Apr 20, 2:30 PM",
      confirmed: "Apr 20, 2:35 PM",
      preparing: "Apr 20, 2:45 PM",
      outForDelivery: "Apr 20, 3:15 PM",
      delivered: "Apr 20, 3:35 PM",
    },
    driver: {
      name: "John Driver",
      rating: 4.8,
      phoneNumber: "+14155557890",
      profileImage: "https://randomuser.me/api/portraits/men/32.jpg",
    },
  },
  {
    id: "1002",
    orderNumber: "12346",
    restaurantId: "2",
    restaurantName: "Burger Barn",
    restaurantImage:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
    items: [
      {
        id: "202",
        name: "Cheese Burger",
        price: 10.99,
        quantity: 2,
      },
      {
        id: "203",
        name: "French Fries",
        price: 3.99,
        quantity: 1,
      },
    ],
    subtotal: 25.97,
    deliveryFee: 1.99,
    total: 27.96,
    status: ORDER_STATUS.OUT_FOR_DELIVERY,
    paymentMethod: "Credit Card",
    createdAt: "2023-04-21T12:15:00Z",
    address: "123 Home St, Anytown",
    deliveryAddress: {
      latitude: 37.7749,
      longitude: -122.4194,
    },
    restaurantPhone: "+14155552345",
    statusUpdates: {
      placed: "Apr 21, 12:15 PM",
      confirmed: "Apr 21, 12:20 PM",
      preparing: "Apr 21, 12:30 PM",
      outForDelivery: "Apr 21, 12:50 PM",
    },
    driver: {
      name: "Sarah Driver",
      rating: 4.9,
      phoneNumber: "+14155556789",
      profileImage: "https://randomuser.me/api/portraits/women/44.jpg",
    },
  },
  {
    id: "1003",
    orderNumber: "12347",
    restaurantId: "3",
    restaurantName: "Sushi Express",
    restaurantImage:
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
    items: [
      {
        id: "301",
        name: "California Roll",
        price: 8.99,
        quantity: 2,
      },
      {
        id: "304",
        name: "Edamame",
        price: 4.99,
        quantity: 1,
      },
    ],
    subtotal: 22.97,
    deliveryFee: 3.99,
    total: 26.96,
    status: ORDER_STATUS.PREPARING,
    paymentMethod: "PayPal",
    createdAt: "2023-04-21T18:30:00Z",
    address: "123 Home St, Anytown",
    deliveryAddress: {
      latitude: 37.7749,
      longitude: -122.4194,
    },
    restaurantPhone: "+14155553456",
    statusUpdates: {
      placed: "Apr 21, 6:30 PM",
      confirmed: "Apr 21, 6:35 PM",
      preparing: "Apr 21, 6:45 PM",
    },
  },
  {
    id: "1004",
    orderNumber: "12348",
    restaurantId: "4",
    restaurantName: "Taco Town",
    restaurantImage:
      "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
    items: [
      {
        id: "401",
        name: "Beef Taco",
        price: 3.99,
        quantity: 3,
      },
      {
        id: "403",
        name: "Chips & Guacamole",
        price: 5.99,
        quantity: 1,
      },
    ],
    subtotal: 17.96,
    deliveryFee: 2.49,
    total: 20.45,
    status: ORDER_STATUS.PENDING,
    paymentMethod: "Apple Pay",
    createdAt: "2023-04-22T19:15:00Z",
    address: "123 Home St, Anytown",
    deliveryAddress: {
      latitude: 37.7749,
      longitude: -122.4194,
    },
    restaurantPhone: "+14155554567",
    statusUpdates: {
      placed: "Apr 22, 7:15 PM",
    },
  },
];

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
  getRestaurantsByLocation: async (latitude, longitude, radiuss = 300) => {
    try {
      // Call the API endpoint with the coordinates and radius
      const response = await apiClient.get(
        `${RESTAURANT_API_URL}/restaurants/nearby?lat=${latitude}&lng=${longitude}&range=${100}`
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
      return { success: false, error: error.message };
    }
  },
};

export default dataService;
