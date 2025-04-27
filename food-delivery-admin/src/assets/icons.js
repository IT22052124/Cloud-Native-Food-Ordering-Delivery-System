// src/assets/icons.js
import React from "react";
import {
  FiBarChart2, // Dashboard
  FiBell, // Notifications
  FiShoppingBag, // Restaurants
  FiTruck, // Drivers
  FiDollarSign, // Finance
  FiFileText, // Reports
  FiSettings, // Settings
  FiLogOut, // Logout
  FiSun, // Sun
  FiMoon, // Moon
  FiMenu, // Menu
  FiX, // Close
  FiUser, // User
  FiShoppingCart, // Cart
  FiHome, // Home
  FiMail, // Email
  FiPhone, // Phone
  FiStar, // Star
  FiMapPin, // Location
  FiClock, // Clock
  FiSearch, // Search
  FiPlus, // Plus
  FiChevronDown, // ChevronDown
  FiMoreVertical, // DotsMenu
  FiAlertCircle, // Warning
  FiCheckCircle, // Success
  FiInfo, // Info
  FiEdit, // Edit
  FiTrash2, // Delete
  FiFilter, // Filter
  FiCalendar, // Calendar
} from "react-icons/fi"; // Feather Icons (lightweight and clean)

// Helper function for consistent icons
const createIcon = (Icon) => {
  return React.createElement(Icon, {
    className: "w-5 h-5",
    "aria-hidden": "true",
  });
};

const Icons = {
  // Main navigation
  Dashboard: createIcon(FiBarChart2),
  Notifications: createIcon(FiBell),
  Restaurants: createIcon(FiShoppingBag),
  Drivers: createIcon(FiTruck),
  Finance: createIcon(FiDollarSign),
  Reports: createIcon(FiFileText),
  Settings: createIcon(FiSettings),
  Logout: createIcon(FiLogOut),

  // Theme
  Sun: createIcon(FiSun),
  Moon: createIcon(FiMoon),

  // UI Controls
  Menu: createIcon(FiMenu),
  Close: createIcon(FiX),
  User: createIcon(FiUser),
  Search: createIcon(FiSearch),
  Plus: createIcon(FiPlus),
  ChevronDown: createIcon(FiChevronDown),
  DotsMenu: createIcon(FiMoreVertical),

  // Status Indicators
  Warning: createIcon(FiAlertCircle),
  Success: createIcon(FiCheckCircle),
  Info: createIcon(FiInfo),

  // Actions
  Edit: createIcon(FiEdit),
  Delete: createIcon(FiTrash2),
  Filter: createIcon(FiFilter),

  // Restaurant/Delivery
  Store: createIcon(FiShoppingBag),
  Cart: createIcon(FiShoppingCart),
  Home: createIcon(FiHome),
  Email: createIcon(FiMail),
  Phone: createIcon(FiPhone),
  Star: createIcon(FiStar),
  Location: createIcon(FiMapPin),
  Clock: createIcon(FiClock),
  Calendar: createIcon(FiCalendar),
};

export default Icons;
