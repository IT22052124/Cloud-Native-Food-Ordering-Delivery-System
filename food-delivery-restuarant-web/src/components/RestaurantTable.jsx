import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaEdit, FaFilter, FaStore, FaEye } from 'react-icons/fa';

const RestaurantTable = ({ restaurants = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Ensure restaurants is an array
  let filteredRestaurants = Array.isArray(restaurants) ? restaurants : [];

  // Apply search filter
  if (searchTerm) {
    filteredRestaurants = filteredRestaurants.filter((restaurant) =>
      restaurant.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Apply status filter
  if (statusFilter !== 'All') {
    const isActive = statusFilter === 'Active';
    filteredRestaurants = filteredRestaurants.filter(
      (restaurant) => restaurant.isActive === isActive
    );
  }

  return (
    <div className="space-y-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
          <FaStore className="mr-2 text-orange-500" />
          Restaurant Management
        </h2>
        
        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" />
            <input
              type="text"
              placeholder="Search restaurants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 p-3 border border-gray-300 dark:border-gray-600 rounded-lg w-full text-gray-700 dark:text-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200"
            />
          </div>
          
          <div className="relative w-full sm:w-auto">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
              <FaFilter />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200 appearance-none pr-8 bg-no-repeat bg-right"
              style={{
                backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                backgroundSize: "1.5em 1.5em"
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
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {filteredRestaurants.length} {filteredRestaurants.length === 1 ? 'restaurant' : 'restaurants'}
        {searchTerm && <span> matching "{searchTerm}"</span>}
        {statusFilter !== 'All' && <span> with status: {statusFilter}</span>}
      </div>

      {/* Table */}
      {filteredRestaurants.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-6 mb-4">
            <FaStore className="text-4xl text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">No restaurants found</p>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {searchTerm || statusFilter !== 'All' 
              ? 'Try adjusting your search or filter criteria' 
              : 'Add your first restaurant to get started'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
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
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                        <span className="text-orange-600 dark:text-orange-300 font-bold">
                          {restaurant.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {restaurant.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      {`${restaurant.address.street}, ${restaurant.address.city}`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        restaurant.isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full mr-1.5 ${
                        restaurant.isActive
                          ? 'bg-green-500 dark:bg-green-400'
                          : 'bg-red-500 dark:bg-red-400'
                      }`}></span>
                      {restaurant.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center space-x-2">
                      <Link
                        to={`/restaurants/${restaurant._id}`}
                        className="inline-flex items-center px-3 py-1.5 bg-green-50 text-green-700 rounded-md hover:bg-green-100 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800 transition-all duration-200"
                      >
                        <FaEye className="mr-1.5" />
                        View
                      </Link>
                      <Link
                        to={`/restaurants/edit/${restaurant._id}`}
                        className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800 transition-all duration-200"
                      >
                        <FaEdit className="mr-1.5" />
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
      
      {/* Pagination Placeholder */}
      {filteredRestaurants.length > 0 && (
        <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredRestaurants.length}</span> of{' '}
            <span className="font-medium">{filteredRestaurants.length}</span> results
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50" disabled>
              Previous
            </button>
            <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50" disabled>
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantTable;