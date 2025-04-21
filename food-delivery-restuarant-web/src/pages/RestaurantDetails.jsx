"use client"

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { getRestaurantById, updateRestaurantStatus, deleteRestaurant } from "../utils/api";
import { toast } from "react-toastify";
import { FaStore, FaMapMarkerAlt, FaPhone, FaEnvelope, FaEdit, FaArrowLeft, FaTrash } from "react-icons/fa";
import LoadingSpinner from "../components/LoadingSpinner";

const RestaurantDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const data = await getRestaurantById(id);
        setRestaurant(data);
      } catch (error) {
        toast.error("Failed to fetch restaurant details");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurant();
  }, [id, navigate]);

  const handleStatusToggle = async () => {
    if (!restaurant) return;
    setStatusLoading(true);
    try {
      const newStatus = !restaurant.isActive;
      await updateRestaurantStatus(restaurant._id, newStatus);
      setRestaurant((prev) => ({ ...prev, isActive: newStatus }));
      toast.success(`Restaurant status updated to ${newStatus ? "Active" : "Inactive"}`);
    } catch (error) {
      toast.error("Failed to update restaurant status");
    } finally {
      setStatusLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteRestaurant(restaurant._id);
      toast.success("Restaurant deleted successfully!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Failed to delete restaurant");
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  };

  const handleEdit = () => {
    navigate(`/restaurants/edit/${restaurant._id}`);
  };

  const handleBack = () => {
    navigate("/dashboard");
  };

  if (loading) return <LoadingSpinner />;
  if (!restaurant) return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <p className="text-orange-600 dark:text-orange-400 text-lg font-medium">Restaurant not found.</p>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Navbar />
        <div className="p-8 max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <button
                onClick={handleBack}
                className="mr-4 p-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200"
                aria-label="Go back to dashboard"
              >
                <FaArrowLeft className="text-lg" />
              </button>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center">
                <FaStore className="mr-2 text-orange-500" />
                {restaurant.name}
              </h2>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 flex items-center"
              >
                <FaEdit className="mr-2" />
                Edit Restaurant
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 dark:hover:bg-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200 flex items-center"
                disabled={deleteLoading}
                aria-label="Delete restaurant"
              >
                <FaTrash className="mr-2" />
                Delete Restaurant
              </button>
            </div>
          </div>

          {/* Restaurant Details */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
                <span className="w-1 h-6 bg-orange-500 rounded-full mr-2"></span>
                Restaurant Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Name</label>
                  <p className="text-gray-800 dark:text-white text-lg font-medium">{restaurant.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Description</label>
                  <p className="text-gray-800 dark:text-white">{restaurant.description || "No description provided."}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Status</label>
                  <div className="flex items-center space-x-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        restaurant.isActive
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full mr-1.5 ${
                          restaurant.isActive ? "bg-green-500" : "bg-red-500"
                        }`}
                      ></span>
                      {restaurant.isActive ? "Active" : "Inactive"}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={restaurant.isActive}
                        onChange={handleStatusToggle}
                        disabled={statusLoading}
                        className="sr-only peer"
                        aria-label={`Toggle restaurant status to ${restaurant.isActive ? "inactive" : "active"}`}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-500 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                    </label>
                    {statusLoading && (
                      <svg
                        className="animate-spin h-5 w-5 text-orange-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
                        ></path>
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
                <span className="w-1 h-6 bg-orange-500 rounded-full mr-2"></span>
                Address
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Street</label>
                  <p className="text-gray-800 dark:text-white font-medium">{restaurant.address.street}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">City</label>
                  <p className="text-gray-800 dark:text-white font-medium">{restaurant.address.city}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Province</label>
                  <p className="text-gray-800 dark:text-white font-medium">{restaurant.address.province}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Postal Code</label>
                  <p className="text-gray-800 dark:text-white font-medium">{restaurant.address.postalCode}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Latitude</label>
                  <p className="text-gray-800 dark:text-white font-medium">{restaurant.address.coordinates.lat}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Longitude</label>
                  <p className="text-gray-800 dark:text-white font-medium">{restaurant.address.coordinates.lng}</p>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
                <span className="w-1 h-6 bg-orange-500 rounded-full mr-2"></span>
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex items-center">
                  <FaPhone className="text-orange-500 mr-3" />
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Phone</label>
                    <p className="text-gray-800 dark:text-white font-medium">{restaurant.contact.phone}</p>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex items-center">
                  <FaEnvelope className="text-orange-500 mr-3" />
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Email</label>
                    <p className="text-gray-800 dark:text-white font-medium">{restaurant.contact.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Delete Confirmation Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl border border-orange-500 max-w-md w-full transform transition-all duration-300 scale-100">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                  <span className="w-1 h-6 bg-red-500 rounded-full mr-2"></span>
                  Confirm Deletion
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  Are you sure you want to delete{" "}
                  <span className="font-bold text-orange-600 dark:text-orange-400">{restaurant.name}</span>? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all duration-200"
                    aria-label="Cancel deletion"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleteLoading}
                    className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 dark:hover:bg-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                    aria-label="Confirm delete restaurant"
                  >
                    {deleteLoading ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 mr-2 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
                          ></path>
                        </svg>
                        Deleting...
                      </>
                    ) : (
                      "Delete"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetails;