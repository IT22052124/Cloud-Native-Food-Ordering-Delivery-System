"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { FaSearch, FaStore, FaEye, FaMapMarkerAlt, FaThList, FaTh } from "react-icons/fa"

const PendingRestaurantTable = ({ restaurants = [] }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState("table")

  // Ensure restaurants is an array and filter for isVerified: "pending"
  let filteredRestaurants = Array.isArray(restaurants) 
    ? restaurants.filter(restaurant => restaurant.isVerified === "pending")
    : []

  // Apply search filter
  if (searchTerm) {
    filteredRestaurants = filteredRestaurants.filter((restaurant) =>
      restaurant?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  return (
    <div className="space-y-6 bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-amber-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-amber-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
          <div className="mr-3 p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg shadow-md">
            <FaStore className="text-white" />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-600">
            Restaurants Awaiting Verification
          </span>
        </h2>

        {/* Search and View Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search restaurants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 p-3.5 border border-amber-200 dark:border-gray-600 rounded-xl w-full text-gray-700 dark:text-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 shadow-sm"
            />
          </div>

          {/* View Toggle */}
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode("table")}
              className={`p-3 rounded-xl ${viewMode === "table" ? "bg-amber-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"} hover:bg-amber-600 hover:text-white transition-all duration-200 shadow-sm`}
            >
              <FaThList />
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={`p-3 rounded-xl ${viewMode === "card" ? "bg-amber-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"} hover:bg-amber-600 hover:text-white transition-all duration-200 shadow-sm`}
            >
              <FaTh />
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-gray-600 dark:text-gray-400 bg-amber-50 dark:bg-gray-700/50 p-3 rounded-lg inline-block">
        <span className="font-medium">
          {filteredRestaurants.length} {filteredRestaurants.length === 1 ? "restaurant" : "restaurants"}
        </span>
        {searchTerm && (
          <span>
            {" "}
            matching "<span className="text-amber-500 font-medium">{searchTerm}</span>"
          </span>
        )}
        <span> awaiting verification</span>
      </div>

      {/* Table or Card View */}
      {filteredRestaurants.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-amber-50 dark:bg-gray-700/30 rounded-xl border border-dashed border-amber-200 dark:border-gray-700">
          <div className="bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 rounded-full p-8 mb-6 shadow-inner">
            <FaStore className="text-5xl text-amber-400 dark:text-amber-500" />
          </div>
          <p className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">No pending restaurants found</p>
          <p className="text-gray-500 dark:text-gray-400 max-w-md px-4">
            {searchTerm
              ? "Try adjusting your search to find pending restaurants."
              : "No restaurants are currently awaiting verification."}
          </p>
        </div>
      ) : viewMode === "table" ? (
        <div className="overflow-hidden rounded-xl border border-amber-200 dark:border-gray-700 shadow-md">
          <table className="min-w-full divide-y divide-amber-200 dark:divide-gray-700">
            <thead>
              <tr className="bg-amber-50 dark:bg-gray-700">
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-50 dark:bg-gray-800 divide-y divide-amber-200 dark:divide-gray-700">
              {filteredRestaurants.map((restaurant) => (
                <tr
                  key={restaurant._id}
                  className="hover:bg-amber-50/50 dark:hover:bg-gray-700/50 transition-all duration-200"
                >
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12 rounded-lg shadow-md overflow-hidden">
                        {restaurant.imageUrls && restaurant.imageUrls.length > 0 ? (
                          <img
                            src={restaurant.imageUrls[0]}
                            alt={restaurant.name}
                            className="h-12 w-12 object-cover"
                          />
                        ) : (
                          <img
                            src="https://via.placeholder.com/48?text=No+Image"
                            alt="No Image"
                            className="h-12 w-12 object-cover"
                          />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-base font-semibold text-gray-900 dark:text-white">{restaurant.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                      <FaMapMarkerAlt className="text-amber-500 mr-2 flex-shrink-0" />
                      <span>{`${restaurant?.address?.street}, ${restaurant?.address?.city}`}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-center">
                    <Link
                      to={`/restaurants/${restaurant._id}`}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all duration-200 shadow-sm hover:shadow transform hover:scale-105"
                    >
                      <FaEye className="mr-2" />
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map((restaurant) => (
            <div
              key={restaurant._id}
              className="bg-gray-50 dark:bg-gray-800 rounded-xl shadow-lg border border-amber-200 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-xl hover:scale-105"
            >
              <div className="relative h-48">
                {restaurant.imageUrls && restaurant.imageUrls.length > 0 ? (
                  <img
                    src={restaurant.imageUrls[0]}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src="https://via.placeholder.com/300x200?text=No+Image"
                    alt="No Image"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{restaurant.name}</h3>
                <div className="flex items-center text-sm text-gray-700 dark:text-gray-300 mb-4">
                  <FaMapMarkerAlt className="text-amber-500 mr-2 flex-shrink-0" />
                  <span>{`${restaurant?.address?.street}, ${restaurant?.address?.city}`}</span>
                </div>
                <Link
                  to={`/restaurants/${restaurant._id}`}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all duration-200 shadow-sm hover:shadow"
                >
                  <FaEye className="mr-2" />
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PendingRestaurantTable