import React, { useState } from "react";
import { restaurants } from "../data/restaurants";
import {
  FaStore,
  FaSearch,
  FaStar,
  FaEllipsisV,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
} from "react-icons/fa";

const Restaurants = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  const tabs = [
    { id: "all", label: "All Restaurants" },
    { id: "active", label: "Active" },
    { id: "pending", label: "Pending Approval" },
    { id: "suspended", label: "Suspended" },
  ];

  const filteredRestaurants = restaurants.filter((restaurant) => {
    // Filter by tab
    if (activeTab === "active" && restaurant.status !== "active") return false;
    if (activeTab === "pending" && restaurant.status !== "pending")
      return false;
    if (activeTab === "suspended" && restaurant.status !== "suspended")
      return false;

    // Filter by search
    if (
      searchTerm &&
      !restaurant.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false;

    return true;
  });

  const getStatusClass = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleViewDetails = (restaurant) => {
    setSelectedRestaurant(restaurant);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Restaurant Management
        </h1>
        <div className="flex items-center">
          <div className="relative mr-4">
            <input
              type="text"
              placeholder="Search restaurants..."
              className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center">
            <FaStore className="mr-2" />
            <span>Add Restaurant</span>
          </button>
        </div>
      </div>

      <div className="mb-6 border-b">
        <ul className="flex flex-wrap -mb-px">
          {tabs.map((tab) => (
            <li key={tab.id} className="mr-2">
              <button
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center px-4 py-2 font-medium text-sm rounded-t-lg ${
                  activeTab === tab.id
                    ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-500 dark:border-blue-500"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRestaurants.map((restaurant) => (
          <div
            key={restaurant.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={restaurant.coverImage}
                alt={restaurant.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-0 right-0 p-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusClass(
                    restaurant.status
                  )}`}
                >
                  {restaurant.status.charAt(0).toUpperCase() +
                    restaurant.status.slice(1)}
                </span>
              </div>
              <div className="absolute bottom-0 left-0 p-4 bg-gradient-to-t from-black/70 to-transparent w-full">
                <h3 className="text-white text-xl font-bold">
                  {restaurant.name}
                </h3>
                <div className="flex items-center text-white">
                  <FaStar className="text-yellow-400 mr-1" />
                  <span>{restaurant.rating}</span>
                  <span className="mx-2">•</span>
                  <span>{restaurant.cuisineType}</span>
                </div>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-center text-gray-500 dark:text-gray-400 mb-2">
                <FaMapMarkerAlt className="mr-2" />
                <span className="text-sm">{restaurant.address}</span>
              </div>

              <div className="flex items-center text-gray-500 dark:text-gray-400 mb-4">
                <FaPhone className="mr-2" />
                <span className="text-sm">{restaurant.phone}</span>
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleViewDetails(restaurant)}
                  className="text-blue-600 dark:text-blue-500 hover:underline font-medium"
                >
                  View Details
                </button>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mr-2">
                    Orders: {restaurant.totalOrders}
                  </span>
                  <button className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-full">
                    <FaEllipsisV />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedRestaurant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="relative h-64">
              <img
                src={selectedRestaurant.coverImage}
                alt={selectedRestaurant.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedRestaurant(null)}
                className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
              >
                ×
              </button>
              <div className="absolute bottom-0 left-0 p-6 bg-gradient-to-t from-black/80 to-transparent w-full">
                <h2 className="text-white text-3xl font-bold">
                  {selectedRestaurant.name}
                </h2>
                <div className="flex items-center text-white">
                  <FaStar className="text-yellow-400 mr-1" />
                  <span>{selectedRestaurant.rating}</span>
                  <span className="mx-2">•</span>
                  <span>{selectedRestaurant.cuisineType}</span>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 dark:text-white">
                    Restaurant Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <FaMapMarkerAlt className="mr-3 mt-1 text-gray-500 dark:text-gray-400" />
                      <div>
                        <h4 className="font-medium dark:text-white">Address</h4>
                        <p className="text-gray-600 dark:text-gray-300">
                          {selectedRestaurant.address}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <FaPhone className="mr-3 mt-1 text-gray-500 dark:text-gray-400" />
                      <div>
                        <h4 className="font-medium dark:text-white">Phone</h4>
                        <p className="text-gray-600 dark:text-gray-300">
                          {selectedRestaurant.phone}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <FaEnvelope className="mr-3 mt-1 text-gray-500 dark:text-gray-400" />
                      <div>
                        <h4 className="font-medium dark:text-white">Email</h4>
                        <p className="text-gray-600 dark:text-gray-300">
                          {selectedRestaurant.email}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4 dark:text-white">
                    Performance Statistics
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <h4 className="text-sm text-gray-500 dark:text-gray-400">
                        Total Orders
                      </h4>
                      <p className="text-xl font-bold dark:text-white">
                        {selectedRestaurant.totalOrders}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <h4 className="text-sm text-gray-500 dark:text-gray-400">
                        Avg. Order Value
                      </h4>
                      <p className="text-xl font-bold dark:text-white">
                        ${selectedRestaurant.avgOrderValue.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <h4 className="text-sm text-gray-500 dark:text-gray-400">
                        Commission Rate
                      </h4>
                      <p className="text-xl font-bold dark:text-white">
                        {selectedRestaurant.commissionRate}%
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <h4 className="text-sm text-gray-500 dark:text-gray-400">
                        Acceptance Rate
                      </h4>
                      <p className="text-xl font-bold dark:text-white">
                        {selectedRestaurant.acceptanceRate}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4 dark:text-white">
                  Menu Categories
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedRestaurant.menuCategories.map((category, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm dark:text-white"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                  Edit Details
                </button>
                <button
                  className={`px-4 py-2 rounded-lg text-white ${
                    selectedRestaurant.status === "active"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {selectedRestaurant.status === "active"
                    ? "Suspend Restaurant"
                    : "Activate Restaurant"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Restaurants;
