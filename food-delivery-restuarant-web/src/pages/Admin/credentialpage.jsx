"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../components/DishSidebar";
import Navbar from "../../components/DishNavBar";
import { getRestaurantUsernames, updateRestaurantCredentials } from "../../utils/api";
import { toast } from "react-toastify";
import { FaUser, FaEdit, FaArrowLeft } from "react-icons/fa";
import LoadingSpinner from "../../components/LoadingSpinner";

const RestaurantCredentialsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [usernames, setUsernames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentUsername, setCurrentUsername] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
const restaurantId = id;
  console.log("fuck",restaurantId);
  useEffect(() => {
    const fetchUsernames = async () => {
      try {
        const data = await getRestaurantUsernames(restaurantId);
        setUsernames(data.usernames || []);
      } catch (error) {
        toast.error("Failed to fetch usernames");
        navigate("/admin-dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchUsernames();
  }, [restaurantId, navigate]);

  const handleEdit = (username) => {
    setCurrentUsername(username);
    setNewUsername("");
    setNewPassword("");
    setShowEditModal(true);
  };

  const handleSaveCredentials = async () => {
    if (!newUsername && !newPassword) {
      toast.error("Please provide a new username or password");
      return;
    }

    setModalLoading(true);
    try {
      const credentials = { currentUsername };
      if (newUsername) credentials.newUsername = newUsername;
      if (newPassword) credentials.newPassword = newPassword;

      await updateRestaurantCredentials(restaurantId, credentials);
      toast.success("Credentials updated successfully!");
      const data = await getRestaurantUsernames(restaurantId);
      setUsernames(data.usernames || []);
      setShowEditModal(false);
    } catch (error) {
      toast.error(error.message || "Failed to update credentials");
    } finally {
      setModalLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/admin-dashboard");
  };

  if (loading) return <LoadingSpinner />;
  if (!usernames) return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <p className="text-amber-600 dark:text-amber-400 text-lg font-medium">No credentials found.</p>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Navbar />
        <div className="p-8 max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <button
                onClick={handleBack}
                className="mr-4 p-2 bg-amber-100 dark:bg-gray-700 text-amber-600 dark:text-amber-400 rounded-full hover:bg-amber-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all duration-200"
                aria-label="Go back to dashboard"
              >
                <FaArrowLeft className="text-lg" />
              </button>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center">
                <FaUser className="mr-2 text-amber-500 dark:text-amber-400" />
                Restaurant Credentials
              </h2>
            </div>
          </div>

          {/* Credentials List */}
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-amber-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
              <span className="w-1 h-6 bg-amber-500 rounded-full mr-2"></span>
              Usernames
            </h3>
            {usernames.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {usernames.map((username, index) => (
                  <div
                    key={index}
                    className="bg-amber-50 dark:bg-gray-700 p-4 rounded-lg flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <FaUser className="text-blue-500 dark:text-blue-400 mr-3" />
                      <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Username</label>
                        <p className="text-gray-800 dark:text-white font-medium">{username}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleEdit(username)}
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:from-amber-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all duration-200 flex items-center shadow-sm"
                    >
                      <FaEdit className="mr-2" />
                      Edit
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-amber-50 dark:bg-gray-700 p-4 rounded-lg flex items-center">
                <FaUser className="text-blue-500 dark:text-blue-400 mr-3" />
                <p className="text-gray-500 dark:text-gray-400">No usernames available.</p>
              </div>
            )}
          </div>

          {/* Edit Credentials Modal */}
          {showEditModal && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300">
              <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl shadow-2xl border border-amber-200 dark:border-gray-700 max-w-md w-full transform transition-all duration-300 scale-100">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                  <span className="w-1 h-6 bg-amber-500 rounded-full mr-2"></span>
                  Edit Credentials
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Current Username</label>
                    <input
                      type="text"
                      value={currentUsername}
                      disabled
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 dark:bg-gray-600 dark:text-white p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">New Username (optional)</label>
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 p-2 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter new username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">New Password (optional)</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 p-2 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter new password"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all duration-200 shadow-sm"
                    aria-label="Cancel edit"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveCredentials}
                    disabled={modalLoading}
                    className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:from-amber-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center shadow-sm"
                    aria-label="Save credentials"
                  >
                    {modalLoading ? (
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
                        Saving...
                      </>
                    ) : (
                      "Save"
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

export default RestaurantCredentialsPage;