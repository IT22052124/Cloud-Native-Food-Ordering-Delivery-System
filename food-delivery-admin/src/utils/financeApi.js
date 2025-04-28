// services/financeApi.js
import axios from "axios";
import { getAuthToken } from "../utils/auth";

const API_BASE_URL = process.env.ADMIN_API_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/finance`,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle API errors
const handleApiError = (error) => {
  const message = error.response?.data?.message || "An error occurred";
  console.error("API Error:", message, error);
  throw new Error(message);
};

/**
 * Fetch restaurant payments with filters
 */
export const fetchRestaurantPayments = async (filters = {}) => {
  try {
    const response = await api.get("/restaurant-payments", { params: filters });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Generate weekly payments
 */
export const generateWeeklyPayments = async (weekNumber, year) => {
  try {
    const response = await api.post("/restaurant-payments/generate-weekly", {
      weekNumber,
      year,
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Process a single payment
 */
export const processPayment = async (paymentId) => {
  try {
    const response = await api.post(
      `/restaurant-payments/${paymentId}/process`
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Process multiple payments
 */
export const processMultiplePayments = async (paymentIds) => {
  try {
    const response = await api.post("/restaurant-payments/process-bulk", {
      paymentIds,
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Update payment status
 */
export const updatePaymentStatus = async (paymentId, status, notes) => {
  try {
    const response = await api.patch(
      `/restaurant-payments/${paymentId}/status`,
      {
        status,
        notes,
      }
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Get payment details
 */
export const getPaymentDetails = async (paymentId) => {
  try {
    const response = await api.get(`/restaurant-payments/${paymentId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Get current week summary
 */
export const getCurrentWeekSummary = async () => {
  try {
    const response = await api.get("/restaurant-payments/summary/current-week");
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Download payment report as CSV
 */
export const downloadPaymentReport = async (filters = {}) => {
  try {
    const response = await api.get("/restaurant-payments/report", {
      params: filters,
      responseType: "blob",
    });

    // Create a download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `restaurant-payments-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    link.remove();

    return true;
  } catch (error) {
    handleApiError(error);
  }
};
