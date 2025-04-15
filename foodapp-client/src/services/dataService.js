import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// API Base URLs
const AUTH_API_URL = `http://localhost:5001/api/auth`;
const ORDER_API_URL = `http://192.168.1.6:5002/api/orders`;
const CART_API_URL = `http://192.168.1.6:5002/api/cart`;
const RESTAURANT_API_URL = `http://192.168.1.6:3000/api/restaurants`;

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
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
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
    console.log(AsyncStorage.getItem("authToken"));
    return AsyncStorage.getItem("authToken");
  } catch (error) {
    console.error("Failed to get token:", error);
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
      return sampleRestaurants;
      return await apiClient.get(`${RESTAURANT_API_URL}`);
    } catch (error) {
      console.warn("Falling back to sample data for restaurants");
    }
  },

  getCategories: async () => {
    try {
      return sampleCategories;
      return await apiClient.get(`${RESTAURANT_API_URL}`);
    } catch (error) {
      console.warn("Falling back to sample data for restaurants");
    }
  },

  getRestaurantById: async (id) => {
    try {
      return sampleRestaurants.find((restaurant) => restaurant.id === id);
      return await apiClient.get(`${RESTAURANT_API_URL}/${id}`);
    } catch (error) {
      console.warn("Falling back to sample data for restaurant detail");
    }
  },

  getRestaurantDishes: async (restaurantId) => {
    try {
      const restaurant = sampleRestaurants.find((r) => r.id === restaurantId);
      return restaurant ? restaurant.dishes : [];
      return await apiClient.get(
        `${RESTAURANT_API_URL}/${restaurantId}/dishes`
      );
    } catch (error) {
      console.warn("Falling back to sample data for dishes");
    }
  },

  // Cart endpoints
  getCart: async () => {
    try {
      const response = await axios.get(CART_API_URL, {
        headers: {
          Authorization: `Bearer ${AsyncStorage.getItem("authToken")}`,
        },
      });
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
      const response = await axios.post(CART_API_URL, itemData, {
        headers: {
          Authorization: `Bearer ${AsyncStorage.getItem("authToken")}`,
        },
      });
      return response;
    } catch (error) {
      console.error("Failed to add item to cart:", error);
      throw error;
    }
  },

  updateCartItem: async (itemId, data) => {
    try {
      const response = await axios.put(`${CART_API_URL}/${itemId}`, data, {
        headers: {
          Authorization: `Bearer ${AsyncStorage.getItem("authToken")}`,
        },
      });
      return response;
    } catch (error) {
      console.error("Failed to update cart item:", error);
      throw error;
    }
  },

  deleteCartItem: async (itemId) => {
    try {
      const response = await axios.delete(`${CART_API_URL}/${itemId}`, {
        headers: {
          Authorization: `Bearer ${AsyncStorage.getItem("authToken")}`,
        },
      });
      return response;
    } catch (error) {
      console.error("Failed to delete cart item:", error);
      throw error;
    }
  },

  bulkUpdateCart: async (items) => {
    try {
      const response = await axios.post(
        `${CART_API_URL}/bulk-update`,
        { items },
        {
          headers: {
            Authorization: `Bearer ${AsyncStorage.getItem("authToken")}`,
          },
        }
      );
      return response;
    } catch (error) {
      console.error("Failed to bulk update cart:", error);
      throw error;
    }
  },

  // Reset cart (clear all items)
  resetCart: async () => {
    try {
      const response = await axios.post(
        `${CART_API_URL}/reset`,
        {},
        {
          headers: {
            Authorization: `Bearer ${AsyncStorage.getItem("authToken")}`,
          },
        }
      );
      return response;
    } catch (error) {
      console.error("Failed to reset cart:", error);
      throw error;
    }
  },

  // Order endpoints
  createOrder: async (orderData) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Create a new order with default values and user data
    const newOrder = {
      id: `order-${Date.now()}`,
      orderId: `ORD-${new Date()
        .toISOString()
        .slice(2, 10)
        .replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`,
      status: ORDER_STATUS.PLACED,
      createdAt: new Date().toISOString(),
      restaurantOrder: orderData.restaurantOrder || {
        restaurantId: orderData.restaurantId,
        restaurantName: orderData.restaurantName,
        items: orderData.items || [],
        subtotal: orderData.subtotal || 0,
        tax: orderData.tax || 0,
        deliveryFee: orderData.deliveryFee || 0,
        status: ORDER_STATUS.PLACED,
      },
      ...orderData,
    };

    return {
      success: true,
      order: newOrder,
    };
  },

  // Payment methods
  getPaymentMethods: async () => {
    return samplePaymentMethods;
  },

  // Sample service integration
  searchRestaurants: async (query) => {
    if (!query) return sampleRestaurants;

    const lowerQuery = query.toLowerCase();
    return sampleRestaurants.filter(
      (restaurant) =>
        restaurant.name.toLowerCase().includes(lowerQuery) ||
        restaurant.cuisineType.toLowerCase().includes(lowerQuery)
    );
  },

  // Get order tracking information
  getOrderTracking: async (orderId) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Find the order
    const order = sampleOrders.find((o) => o.id === orderId);

    if (!order) {
      throw new Error("Order not found");
    }

    // Only provide tracking for certain order statuses
    if (
      order.status === ORDER_STATUS.PENDING ||
      order.status === ORDER_STATUS.CANCELLED
    ) {
      throw new Error("Tracking not available for this order status");
    }

    // Mock tracking data
    const restaurantLocation = {
      latitude: 37.7825,
      longitude: -122.4078,
    };

    // Mock driver location (different based on status)
    let driverLocation;
    let routeCoordinates;
    let estimatedArrival;

    if (order.status === ORDER_STATUS.OUT_FOR_DELIVERY) {
      // Driver is on the way
      driverLocation = {
        latitude: 37.7865,
        longitude: -122.4095,
      };

      // Mock route coordinates
      routeCoordinates = [
        driverLocation,
        { latitude: 37.7855, longitude: -122.405 },
        { latitude: 37.7845, longitude: -122.401 },
        { latitude: 37.7835, longitude: -122.399 },
        order.deliveryAddress,
      ];

      estimatedArrival = "15-20 minutes";
    } else if (order.status === ORDER_STATUS.READY_FOR_PICKUP) {
      // Driver is at the restaurant
      driverLocation = { ...restaurantLocation };
      routeCoordinates = [
        driverLocation,
        { latitude: 37.7835, longitude: -122.403 },
        { latitude: 37.7825, longitude: -122.4 },
        order.deliveryAddress,
      ];
      estimatedArrival = "25-30 minutes";
    } else {
      // Driver location not available for other statuses
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
  },

  // Place order
  placeOrder: async (orderData) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Create a new order with default values and user data
    const newOrder = {
      id: `order-${Date.now()}`,
      orderNumber: Math.floor(10000 + Math.random() * 90000).toString(),
      status: ORDER_STATUS.PENDING,
      createdAt: new Date().toISOString(),
      ...orderData,
    };

    return {
      success: true,
      order: newOrder,
    };
  },
};

export default dataService;
