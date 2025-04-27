import axios from "axios";

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
