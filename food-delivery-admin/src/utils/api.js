import axios from "axios";
import { TokenManager } from "./auth";

export const loginUser = async (email, password) => {
  try {
    const response = await axios.post("http://localhost:5001/api/auth/login", {
      email,
      password,
    });

    // Validate response structure
    if (!response.data?.token || !response.data?.user) {
      throw new Error("Invalid server response structure");
    }

    // Return consistent shape
    return {
      success: true,
      user: {
        ...response.data.user,
        token: response.data.token, // Ensure token is in user object
      },
      token: response.data.token,
    };
  } catch (error) {
    console.error("API login error:", error);
    throw error;
  }
};

export const getRestaurants = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get("http://localhost:5006/api/restaurants", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("getRestaurants: API response:", response.data);
    // Extract the restaurants array, fallback to empty array
    return Array.isArray(response.data.restaurants)
      ? response.data.restaurants
      : [];
  } catch (error) {
    console.error("getRestaurants: Error:", error);
    throw error;
  }
};

export const updateRestaurantVerification = async (restaurantId, status) => {
  try {
    const response = await fetch(
      `http://localhost:5006/api/restaurants/${restaurantId}/verfication`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isVerified: status }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update restaurant verification status");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating restaurant verification:", error);
    throw error;
  }
};

export const getDrivers = async () => {
  try {
    const token = TokenManager.getToken();
    if (!token) {
      throw new Error("No authentication token available");
    }

    const response = await axios.get(
      "http://localhost:5001/api/users/drivers",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data.drivers || [];
  } catch (error) {
    console.error("API Error:", {
      error: error.message,
      tokenStatus: TokenManager.getToken() ? "exists" : "missing",
      time: new Date().toISOString(),
    });
    throw error;
  }
};
