// services/orderApiService.js
import axios from "axios";

// Configure the base URL from environment variables or config
const orderServiceBaseUrl = "http://order-service:5002/api/orders";

/**
 * Fetch orders by date range and status
 * @param {Object} params - Query parameters
 * @param {Date} params.startDate - Start date for filtering orders
 * @param {Date} params.endDate - End date for filtering orders
 * @param {String} params.status - Order status (e.g., "DELIVERED")
 * @param {String} params.paymentStatus - Payment status (e.g., "PAID")
 * @returns {Promise<Array>} - Promise resolving to array of orders
 */
export const fetchOrdersByDateRange = async (params) => {
  try {
    const { startDate, endDate, status, paymentStatus } = params;

    const response = await axios.get(`${orderServiceBaseUrl}/orders/query`, {
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        status,
        paymentStatus,
      },
      headers: {
        "x-api-key": config.services.order.apiKey,
        "Content-Type": "application/json",
      },
    });

    if (response.status !== 200) {
      throw new Error(`Failed to fetch orders: ${response.statusText}`);
    }

    return response.data.orders || [];
  } catch (error) {
    console.error("Error fetching orders by date range:", error);
    throw new Error(`Order service communication error: ${error.message}`);
  }
};

/**
 * Fetch orders by array of order IDs
 * @param {Array<String>} orderIds - Array of order IDs to fetch
 * @returns {Promise<Array>} - Promise resolving to array of orders
 */
export const fetchOrdersByIds = async (orderIds) => {
  try {
    if (!orderIds || orderIds.length === 0) {
      return [];
    }

    const response = await axios.post(
      `${orderServiceBaseUrl}/orders/batch`,
      {
        orderIds,
      },
      {
        headers: {
          "x-api-key": config.services.order.apiKey,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status !== 200) {
      throw new Error(`Failed to fetch orders by IDs: ${response.statusText}`);
    }

    return response.data.orders || [];
  } catch (error) {
    console.error("Error fetching orders by IDs:", error);
    throw new Error(`Order service communication error: ${error.message}`);
  }
};

export default {
  fetchOrdersByDateRange,
  fetchOrdersByIds,
};
