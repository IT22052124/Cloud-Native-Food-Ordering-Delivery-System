import axios from "axios";

export const loginUser = async (email, password) => {
  try {
    const response = await axios.post("http://localhost:5001/api/auth/login", {
      email,
      password,
    });

    console.log("loginUser: API response:", response.data);

    // Store the token in localStorage
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }

    // Store the refresh token if needed (consider security implications)
    if (response.data.refreshToken) {
      localStorage.setItem("refreshToken", response.data.refreshToken);
    }

    return {
      success: true,
      user: response.data.user,
      token: response.data.token,
      refreshToken: response.data.refreshToken,
    };
  } catch (error) {
    console.error("loginUser: Error:", error.response?.data || error.message);

    // Return the error message from server if available
    const errorMessage = error.response?.data?.message || "Login failed";

    throw new Error(errorMessage);
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
