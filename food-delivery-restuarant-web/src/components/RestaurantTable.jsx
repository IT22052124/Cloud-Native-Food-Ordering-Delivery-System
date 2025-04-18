"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { FaSearch, FaEdit, FaFilter, FaStore, FaEye, FaMapMarkerAlt } from "react-icons/fa"

const RestaurantTable = ({ restaurants = [] }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")

  // Ensure restaurants is an array
  let filteredRestaurants = Array.isArray(restaurants) ? restaurants : []

  // Apply search filter
  if (searchTerm) {
    filteredRestaurants = filteredRestaurants.filter((restaurant) =>
      restaurant?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }

  // Apply status filter
  if (statusFilter !== "All") {
    const isActive = statusFilter === "Active"
    filteredRestaurants = filteredRestaurants.filter((restaurant) => restaurant.isActive === isActive)
  }

  return (
    <div className="space-y-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
          <div className="mr-3 p-2 bg-gradient-to-br from-orange-400 to-pink-500 rounded-lg shadow-md">
            <FaStore className="text-white" />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-pink-600">
            Restaurant Management
          </span>
        </h2>

        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search restaurants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 p-3.5 border border-gray-200 dark:border-gray-600 rounded-xl w-full text-gray-700 dark:text-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 shadow-sm"
            />
          </div>

          <div className="relative w-full sm:w-auto">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
              <FaFilter />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-12 p-3.5 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 appearance-none pr-10 bg-no-repeat bg-right shadow-sm"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                backgroundSize: "1.5em 1.5em",
                backgroundPosition: "right 0.75rem center",
              }}
            >
              <option value="All">All Restaurants</option>
              <option value="Active">Active Only</option>
              <option value="Non-Active">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg inline-block">
        <span className="font-medium">
          {filteredRestaurants.length} {filteredRestaurants.length === 1 ? "restaurant" : "restaurants"}
        </span>
        {searchTerm && (
          <span>
            {" "}
            matching "<span className="text-orange-500 font-medium">{searchTerm}</span>"
          </span>
        )}
        {statusFilter !== "All" && (
          <span>
            {" "}
            with status:
            <span className={`ml-1 font-medium ${statusFilter === "Active" ? "text-green-500" : "text-red-500"}`}>
              {statusFilter}
            </span>
          </span>
        )}
      </div>

      {/* Table */}
      {filteredRestaurants.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
          <div className="bg-gradient-to-br from-orange-100 to-pink-100 dark:from-orange-900/20 dark:to-pink-900/20 rounded-full p-8 mb-6 shadow-inner">
            <FaStore className="text-5xl text-orange-400 dark:text-orange-500" />
          </div>
          <p className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">No restaurants found</p>
          <p className="text-gray-500 dark:text-gray-400 max-w-md px-4">
            {searchTerm || statusFilter !== "All"
              ? "Try adjusting your search or filter criteria to find what you're looking for."
              : "Add your first restaurant to begin managing your culinary business."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 shadow-md">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700">
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredRestaurants.map((restaurant, index) => (
                <tr
                  key={restaurant._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200"
                >
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-orange-400 to-pink-500 rounded-lg shadow-md flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {restaurant?.name?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-base font-semibold text-gray-900 dark:text-white">{restaurant.name}</div>
                        
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                      <FaMapMarkerAlt className="text-orange-500 mr-2 flex-shrink-0" />
                      <span>{`${restaurant?.address?.street}, ${restaurant?.address?.city}`}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-center">
                    <span
                      className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-medium ${
                        restaurant.isActive
                          ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full mr-1.5 ${
                          restaurant.isActive
                            ? "bg-green-500 dark:bg-green-400 animate-pulse"
                            : "bg-red-500 dark:bg-red-400"
                        }`}
                      ></span>
                      {restaurant.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-center">
                    <div className="flex justify-center space-x-3">
                      <Link
                        to={`/restaurants/${restaurant._id}`}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-sm hover:shadow transform hover:scale-105"
                      >
                        <FaEye className="mr-2" />
                        View
                      </Link>
                      <Link
                        to={`/restaurants/edit/${restaurant._id}`}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow transform hover:scale-105"
                      >
                        <FaEdit className="mr-2" />
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {filteredRestaurants.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 px-4 py-2 rounded-lg">
            Showing <span className="font-medium">1</span> to{" "}
            <span className="font-medium">{filteredRestaurants.length}</span> of{" "}
            <span className="font-medium">{filteredRestaurants.length}</span> results
          </div>
          <div className="flex space-x-2">
            <button
              className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 transition-all duration-200 shadow-sm disabled:shadow-none flex items-center"
              disabled
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
            <button
              className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 transition-all duration-200 shadow-sm disabled:shadow-none flex items-center"
              disabled
            >
              Next
              <svg
                className="w-4 h-4 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default RestaurantTable
