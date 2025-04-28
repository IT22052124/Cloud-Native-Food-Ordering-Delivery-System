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
    const response = await axios.get("http://localhost:3000/api/restaurants", {
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
      `http://localhost:3000/api/restaurants/${restaurantId}/verfication`,
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

export const getNotifications = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(
      "http://localhost:5007/api/notifications",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("getNotifications: API response:", response.data);
    return response.data.data || [];
  } catch (error) {
    console.error("getNotifications: Error:", error);
    throw error;
  }
};

// Mark a notification as read
export const markNotificationAsRead = async (id) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.put(
      `http://localhost:5007/api/notifications/${id}/read`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("markNotificationAsRead: API response:", response.data);
    return response.data;
  } catch (error) {
    console.error("markNotificationAsRead: Error:", error);
    throw error;
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.put(
      "http://localhost:5007/api/notifications/read-all",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("markAllNotificationsAsRead: API response:", response.data);
    return response.data;
  } catch (error) {
    console.error("markAllNotificationsAsRead: Error:", error);
    throw error;
  }
};

// Delete a notification
export const deleteNotification = async (id) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.delete(
      `http://localhost:5007/api/notifications/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("deleteNotification: API response:", response.data);
    return response.data;
  } catch (error) {
    console.error("deleteNotification: Error:", error);
    throw error;
  }
};

export const getDeliveries = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get("http://localhost:5004/api/deliveries/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("getDeliveries: API response:", response.data);
    // Extract the deliveries array, fallback to empty array
    return Array.isArray(response.data.deliveries)
      ? response.data.deliveries
      : [];
  } catch (error) {
    console.error("getDeliveries: Error:", error);
    throw error;
  }
};

export const updateDriverStatus = async (driverId, status) => {
  try {
    // Validate the status matches the enum values from your schema
    const validStatuses = [
      "active",
      "inactive",
      "suspended",
      "pending_approval",
    ];
    if (!validStatuses.includes(status)) {
      throw new Error(
        `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      );
    }

    const response = await fetch(
      `http://localhost:5001/api/users/${driverId}/status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          // Add authorization if needed
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update driver status");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating driver status:", error);
    throw error;
  }
};
