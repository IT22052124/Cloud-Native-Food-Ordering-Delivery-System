"use client"

import { useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import { getRestaurants, deleteRestaurant } from "../utils/api"
import Sidebar from "../components/Sidebar"
import Navbar from "../components/Navbar"
import LoadingSpinner from "../components/LoadingSpinner"
import { toast } from "react-toastify"
import { FaStore, FaEye, FaTrash, FaPlusCircle, FaUtensils, FaCheckCircle, FaTimesCircle } from "react-icons/fa"

const Dashboard = () => {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(null)
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      navigate("/login")
      return
    }
    const fetchRestaurants = async () => {
      try {
        const data = await getRestaurants()
        setRestaurants(Array.isArray(data) ? data : [])
      } catch (error) {
        setError("Failed to fetch restaurants")
        toast.error("Failed to fetch restaurants")
        setRestaurants([])
      } finally {
        setLoading(false)
      }
    }
    fetchRestaurants()
  }, [user, navigate])

  const handleView = (id) => {
    navigate(`/restaurants/${id}`)
  }

  const handleEdit = (id) => {
    navigate(`/restaurants/edit/${id}`)
  }

  const handleDelete = async () => {
    if (!showDeleteModal) return
    try {
      await deleteRestaurant(showDeleteModal)
      setRestaurants((prev) => prev.filter((restaurant) => restaurant._id !== showDeleteModal))
      toast.success("Restaurant deleted successfully!")
    } catch (err) {
      toast.error("Failed to delete restaurant")
    } finally {
      setShowDeleteModal(null)
    }
  }

  const handleAddRestaurant = () => {
    navigate("/restaurants/add")
  }

  if (loading) return <LoadingSpinner />
  if (error)
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-red-600 dark:text-red-400 text-lg font-medium">{error}</p>
      </div>
    )

  const totalRestaurants = restaurants.length
  const activeRestaurants = restaurants.filter((r) => r.isActive).length
  const inactiveRestaurants = totalRestaurants - activeRestaurants

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Navbar />
        <div className="p-8 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
            <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white flex items-center">
              <div className="mr-3 p-2 bg-gradient-to-br from-orange-400 to-pink-500 rounded-lg shadow-lg">
                <FaStore className="text-white text-xl" />
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-pink-600">
                Owner Dashboard
              </span>
            </h2>
            <button
              onClick={handleAddRestaurant}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl hover:from-orange-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center"
              aria-label="Add new restaurant"
            >
              <FaPlusCircle className="mr-2" />
              Add Restaurant
            </button>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-2xl hover:border-orange-200 dark:hover:border-orange-900 group">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Total Restaurants</h3>
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full group-hover:bg-orange-200 dark:group-hover:bg-orange-800/40 transition-colors duration-300">
                  <FaStore className="text-orange-500 dark:text-orange-400" />
                </div>
              </div>
              <p className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-pink-500">
                {totalRestaurants}
              </p>
              <div className="mt-2 h-1 w-16 bg-gradient-to-r from-orange-300 to-pink-300 dark:from-orange-700 dark:to-pink-700 rounded-full"></div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-2xl hover:border-green-200 dark:hover:border-green-900 group">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Active Restaurants</h3>
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full group-hover:bg-green-200 dark:group-hover:bg-green-800/40 transition-colors duration-300">
                  <FaCheckCircle className="text-green-500 dark:text-green-400" />
                </div>
              </div>
              <p className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-emerald-500">
                {activeRestaurants}
              </p>
              <div className="mt-2 h-1 w-16 bg-gradient-to-r from-green-300 to-emerald-300 dark:from-green-700 dark:to-emerald-700 rounded-full"></div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-2xl hover:border-red-200 dark:hover:border-red-900 group">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Inactive Restaurants</h3>
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full group-hover:bg-red-200 dark:group-hover:bg-red-800/40 transition-colors duration-300">
                  <FaTimesCircle className="text-red-500 dark:text-red-400" />
                </div>
              </div>
              <p className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-rose-500">
                {inactiveRestaurants}
              </p>
              <div className="mt-2 h-1 w-16 bg-gradient-to-r from-red-300 to-rose-300 dark:from-red-700 dark:to-rose-700 rounded-full"></div>
            </div>
          </div>

          {/* Restaurant Cards */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-8 flex items-center">
              <div className="w-1.5 h-8 bg-gradient-to-b from-orange-400 to-pink-500 rounded-full mr-3"></div>
              Your Restaurants
            </h3>
            {restaurants.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="p-6 bg-orange-50 dark:bg-orange-900/20 rounded-full mb-6">
                  <FaStore className="text-5xl text-orange-400 dark:text-orange-300" />
                </div>
                <p className="text-xl font-medium text-gray-700 dark:text-gray-200 mb-2">No restaurants found</p>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
                  Get started by adding your first restaurant to manage your culinary empire.
                </p>
                <button
                  onClick={handleAddRestaurant}
                  className="px-8 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl hover:from-orange-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center"
                >
                  <FaPlusCircle className="mr-2" />
                  Add Your First Restaurant
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {restaurants.map((restaurant) => (
                  <div
                    key={restaurant._id}
                    onClick={() => handleView(restaurant._id)}
                    className="bg-white dark:bg-gray-800 overflow-hidden rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-2xl group cursor-pointer transform hover:-translate-y-2 hover:border-orange-300 dark:hover:border-orange-700"
                  >
                    {/* Cover Image */}
                    <div className="h-48 w-full">
                      {restaurant.coverImageUrl ? (
                        <img
                          src={restaurant.coverImageUrl}
                          alt={`${restaurant.name} cover`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">No cover image</p>
                        </div>
                      )}
                    </div>

                    {/* Restaurant Info */}
                    <div className="px-6 py-4">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-4">
                          {/* Restaurant Image */}
                          {restaurant.imageUrls && restaurant.imageUrls.length > 0 ? (
                            <img
                              src={restaurant.imageUrls[0]}
                              alt={`${restaurant.name} image`}
                              className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-700">
                              <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">No image</p>
                            </div>
                          )}
                          <div>
                            <h4 className="text-xl font-bold text-gray-800 dark:text-white group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors duration-300">
                              {restaurant.name}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {restaurant.address.city}, {restaurant.address.province}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            restaurant.isActive
                              ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200"
                              : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full mr-1.5 ${
                              restaurant.isActive ? "bg-green-500 animate-pulse" : "bg-red-500"
                            }`}
                          ></span>
                          {restaurant.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>

                      {/* Description */}
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Description</p>
                        <p className="text-gray-800 dark:text-white text-sm line-clamp-2 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                          {restaurant.description || "No description provided."}
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4">
                        <div className="flex-1 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg text-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Dishes</p>
                          <div className="flex items-center justify-center">
                            <FaUtensils className="text-orange-500 mr-1.5 text-xs" />
                            <p className="text-gray-800 dark:text-white font-bold">{restaurant.dishes.length}</p>
                          </div>
                        </div>
                        <div className="flex-1 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg text-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
                          <p className={`font-bold ${restaurant.isActive ? "text-green-500" : "text-red-500"}`}>
                            {restaurant.isActive ? "Open" : "Closed"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 flex justify-center">
  <button
    onClick={(e) => {
      e.stopPropagation()
      handleView(restaurant._id)
    }}
    className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:from-orange-600 hover:to-pink-600 transition-all duration-300 flex items-center shadow-md hover:shadow-lg transform hover:scale-105 font-medium"
    aria-label={`View details for ${restaurant.name}`}
  >
    <FaEye className="mr-2" />
    View Restaurant
  </button>
</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Delete Confirmation Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 animate-fadeIn">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl border-l-4 border-red-500 max-w-md w-full transform transition-all duration-300 scale-100 animate-scaleIn">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg mr-3">
                    <FaTrash className="text-red-500" />
                  </div>
                  Confirm Deletion
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  Are you sure you want to delete{" "}
                  <span className="font-bold text-orange-600 dark:text-orange-400">
                    {restaurants.find((r) => r._id === showDeleteModal)?.name}
                  </span>
                  ? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowDeleteModal(null)}
                    className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all duration-200"
                    aria-label="Cancel deletion"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl hover:from-red-600 hover:to-rose-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 flex items-center shadow-lg"
                    aria-label="Confirm delete restaurant"
                  >
                    <FaTrash className="mr-2" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard