import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaUtensils, FaEye, FaTable, FaTh, FaEdit } from 'react-icons/fa';

const DishTable = ({ dishes }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'

  const filteredDishes = dishes.filter((dish) => {
    const matchesSearch = dish.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === 'all' || (filter === 'available' && dish.isAvailable) || (filter === 'unavailable' && !dish.isAvailable);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Search, Filter, and Toggle Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:w-64">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" />
          <input
            type="text"
            placeholder="Search dishes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 p-3 border border-gray-300 dark:border-gray-600 rounded-lg w-full text-gray-700 dark:text-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200"
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-full md:w-40">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="p-3 bg-gray-600 text-white rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200 appearance-none pr-8 bg-no-repeat bg-right"
              style={{
                backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                backgroundSize: "1.5em 1.5em",
              }}
            >
              <option value="all">ALL</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>
          {/* Toggle Switch */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-md ${
                viewMode === 'table'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              } hover:bg-blue-700 hover:text-white transition-all duration-200`}
            >
              <FaTable />
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`p-2 rounded-md ${
                viewMode === 'card'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              } hover:bg-blue-700 hover:text-white transition-all duration-200`}
            >
              <FaTh />
            </button>
          </div>
        </div>
      </div>

      {/* Table or Card View */}
      {filteredDishes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full p-6 mb-4">
            <FaUtensils className="text-4xl text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">No dishes found</p>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {search || filter !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Add your first dish to get started'}
          </p>
        </div>
      ) : viewMode === 'table' ? (
        // Table View
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-600">
          <table className="min-w-full bg-white dark:bg-gray-800">
            <thead>
              <tr className="bg-gray-600 text-white">
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium uppercase tracking-wider">
                  Availability
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {filteredDishes.map((dish) => (
                <tr
                  key={dish._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    {dish.imageUrls && dish.imageUrls.length > 0 ? (
                      <img
                        src={dish.imageUrls[0]}
                        alt={`${dish.name}`}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <p className="text-gray-500 dark:text-gray-400 text-xs">No image</p>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-800 dark:text-gray-200">
                    {dish.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-800 dark:text-gray-200">
                    LKR {dish.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        dish.isAvailable
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full mr-1.5 ${
                          dish.isAvailable
                            ? 'bg-green-500 dark:bg-green-400'
                            : 'bg-red-500 dark:bg-red-400'
                        }`}
                      ></span>
                      {dish.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center flex justify-center space-x-2">
                    <Link
                      to={`/dishes/edit/${dish._id}`}
                      className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-all duration-200"
                    >
                      <FaEdit className="mr-1.5" />
                      Edit
                    </Link>
                    <Link
                      to={`/dishes/${dish._id}`}
                      className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 transition-all duration-200"
                    >
                      <FaEye className="mr-1.5" />
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        // Card View
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDishes.map((dish) => (
            <div
              key={dish._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-200"
            >
              {/* Display First Image */}
              {dish.imageUrls && dish.imageUrls.length > 0 ? (
                <div className="mb-4">
                  <img
                    src={dish.imageUrls[0]}
                    alt={`${dish.name}`}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                </div>
              ) : (
                <div className="mb-4 w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No image</p>
                </div>
              )}
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {dish.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                LKR {dish.price.toFixed(2)}
              </p>
              <div className="mb-4">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    dish.isAvailable
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full mr-1.5 ${
                      dish.isAvailable
                        ? 'bg-green-500 dark:bg-green-400'
                        : 'bg-red-500 dark:bg-red-400'
                    }`}
                  ></span>
                  {dish.isAvailable ? 'Available' : 'Unavailable'}
                </span>
              </div>
              <div className="flex space-x-2">
                <Link
                  to={`/dishes/edit/${dish._id}`}
                  className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-all duration-200"
                >
                  <FaEdit className="mr-1.5" />
                  Edit
                </Link>
                <Link
                  to={`/dishes/${dish._id}`}
                  className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 transition-all duration-200"
                >
                  <FaEye className="mr-1.5" />
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DishTable;