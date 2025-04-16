"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import Navbar from "../components/Navbar"
import { getRestaurantById, updateRestaurantStatus, deleteRestaurant } from "../utils/api"
import { toast } from "react-toastify"
import LoadingSpinner from "../components/LoadingSpinner"

const RestaurantDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [restaurant, setRestaurant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [statusLoading, setStatusLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const data = await getRestaurantById(id)
        setRestaurant(data)
      } catch (error) {
        toast.error("Failed to fetch restaurant details")
        navigate("/dashboard")
      } finally {
        setLoading(false)
      }
    }
    fetchRestaurant()
  }, [id, navigate])

  const handleStatusToggle = async () => {
    if (!restaurant) return
    setStatusLoading(true)
    try {
      const newStatus = !restaurant.isActive
      await updateRestaurantStatus(restaurant._id, newStatus)
      setRestaurant((prev) => ({ ...prev, isActive: newStatus }))
      toast.success(`Restaurant status updated to ${newStatus ? "Active" : "Inactive"}`)
    } catch (error) {
      toast.error("Failed to update restaurant status")
    } finally {
      setStatusLoading(false)
    }
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await deleteRestaurant(restaurant._id)
      toast.success("Restaurant deleted successfully!")
      navigate("/dashboard")
    } catch (error) {
      toast.error("Failed to delete restaurant")
    } finally {
      setDeleteLoading(false)
      setShowDeleteModal(false)
    }
  }

  if (loading) return <LoadingSpinner />
  if (!restaurant) return <p className="text-orange-800 dark:text-orange-300">Restaurant not found.</p>

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64 bg-white dark:bg-gray-900">
        <Navbar />
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Restaurant Details
              <span className="ml-2 text-orange-500 dark:text-orange-400">•</span>
            </h2>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 dark:hover:bg-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
              disabled={deleteLoading}
            >
              Delete Restaurant
            </button>
          </div>

          {/* Restaurant Details */}
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-orange-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white border-b border-orange-200 dark:border-gray-700 pb-2 flex items-center">
                <span className="w-1 h-5 bg-orange-500 rounded-full mr-2"></span>
                Restaurant Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Name</label>
                  <p className="text-gray-800 dark:text-white font-medium">{restaurant.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Description</label>
                  <p className="text-gray-800 dark:text-white">{restaurant.description}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Status</label>
                  <div className="flex items-center space-x-3">
                    <span
                      className={`${
                        restaurant.isActive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                      } font-medium`}
                    >
                      {restaurant.isActive ? "Active" : "Inactive"}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={restaurant.isActive}
                        onChange={handleStatusToggle}
                        disabled={statusLoading}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-500 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                    </label>
                    {statusLoading && <span className="text-gray-500 dark:text-gray-400 text-sm">Updating...</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-orange-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white border-b border-orange-200 dark:border-gray-700 pb-2 flex items-center">
                <span className="w-1 h-5 bg-orange-500 rounded-full mr-2"></span>
                Address
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-orange-50 dark:bg-gray-700 p-3 rounded-md">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Street</label>
                  <p className="text-gray-800 dark:text-white">{restaurant.address.street}</p>
                </div>
                <div className="bg-orange-50 dark:bg-gray-700 p-3 rounded-md">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">City</label>
                  <p className="text-gray-800 dark:text-white">{restaurant.address.city}</p>
                </div>
                <div className="bg-orange-50 dark:bg-gray-700 p-3 rounded-md">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Province</label>
                  <p className="text-gray-800 dark:text-white">{restaurant.address.province}</p>
                </div>
                <div className="bg-orange-50 dark:bg-gray-700 p-3 rounded-md">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Postal Code</label>
                  <p className="text-gray-800 dark:text-white">{restaurant.address.postalCode}</p>
                </div>
                <div className="bg-orange-50 dark:bg-gray-700 p-3 rounded-md">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Latitude</label>
                  <p className="text-gray-800 dark:text-white">{restaurant.address.coordinates.lat}</p>
                </div>
                <div className="bg-orange-50 dark:bg-gray-700 p-3 rounded-md">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Longitude</label>
                  <p className="text-gray-800 dark:text-white">{restaurant.address.coordinates.lng}</p>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-orange-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white border-b border-orange-200 dark:border-gray-700 pb-2 flex items-center">
                <span className="w-1 h-5 bg-orange-500 rounded-full mr-2"></span>
                Contact
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-orange-50 dark:bg-gray-700 p-3 rounded-md">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Phone</label>
                  <p className="text-gray-800 dark:text-white">{restaurant.contact.phone}</p>
                </div>
                <div className="bg-orange-50 dark:bg-gray-700 p-3 rounded-md">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Email</label>
                  <p className="text-gray-800 dark:text-white">{restaurant.contact.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Delete Confirmation Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border-2 border-orange-400 dark:border-orange-500">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 border-b border-orange-200 dark:border-gray-700 pb-2 flex items-center">
                  <span className="w-1 h-5 bg-red-500 rounded-full mr-2"></span>
                  Confirm Deletion
                </h3>
                <p className="text-gray-800 dark:text-white mb-6">
                  Are you sure you want to delete{" "}
                  <span className="font-bold text-orange-600 dark:text-orange-400">{restaurant.name}</span>? This action
                  cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleteLoading}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 dark:hover:bg-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200 disabled:bg-gray-400"
                  >
                    {deleteLoading ? "Deleting..." : "Delete"}
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

export default RestaurantDetails
