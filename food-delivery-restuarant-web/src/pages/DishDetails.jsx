import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FaEdit, FaTrash, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import DishSidebar from "../components/DishSidebar";
import Navbar from "../components/Navbar";
import { getDish, deleteDish } from "../utils/api";
import LoadingSpinner from "../components/LoadingSpinner";
import { toast } from "react-toastify";

const DishDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dish, setDish] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchDish = async () => {
      try {
        const data = await getDish(id);
        setDish(data.dish);
        setCurrentImageIndex(0);
      } catch (error) {
        toast.error("Failed to fetch dish details");
        navigate("/dishes");
      } finally {
        setLoading(false);
      }
    };
    fetchDish();
  }, [id, navigate]);

  useEffect(() => {
    if (dish && dish.imageUrls && currentImageIndex >= dish.imageUrls.length) {
      setCurrentImageIndex(Math.max(0, dish.imageUrls.length - 1));
    }
  }, [dish, currentImageIndex]);

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteDish(id);
      toast.success("Dish deleted successfully");
      navigate("/dishes");
    } catch (error) {
      toast.error("Failed to delete dish");
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? dish.imageUrls.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === dish.imageUrls.length - 1 ? 0 : prev + 1
    );
  };

  if (loading) return <LoadingSpinner />;
  if (!dish) return <div className="p-6 ml-64 text-red-600 dark:text-red-300">Dish not found.</div>;

  return (
    <div className="flex min-h-screen">
      <DishSidebar />
      <div className="flex-1 ml-64">
        <Navbar />
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Dish Details
            </h2>
            <div className="flex space-x-2">
              <Link
                to={`/dishes/edit/${dish._id}`}
                className="flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
              >
                <FaEdit className="mr-1" size={14} />
                Edit
              </Link>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center px-3 py-1.5 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900"
              >
                <FaTrash className="mr-1" size={14} />
                Delete
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Image Section */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700">
              {dish.imageUrls && dish.imageUrls.length > 0 ? (
                <div className="relative w-full h-48">
                  <img
                    src={dish.imageUrls[currentImageIndex]}
                    alt={`Dish ${currentImageIndex + 1}`}
                    className="w-full h-full object-contain"
                  />
                  {dish.imageUrls.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 dark:bg-gray-800/80 text-gray-800 dark:text-white rounded-full shadow hover:bg-white dark:hover:bg-gray-700"
                      >
                        <FaArrowLeft size={12} />
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 dark:bg-gray-800/80 text-gray-800 dark:text-white rounded-full shadow hover:bg-white dark:hover:bg-gray-700"
                      >
                        <FaArrowRight size={12} />
                      </button>
                    </>
                  )}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-2 py-0.5 rounded-full text-xs">
                    {currentImageIndex + 1}/{dish.imageUrls.length}
                  </div>
                </div>
              ) : (
                <div className="w-full h-48 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No images available</p>
                </div>
              )}
            </div>

            {/* Details Section */}
            <div className="p-4">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-1">{dish.name}</h3>
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                    LKR {dish.price.toFixed(2)}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      dish.isAvailable
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    }`}
                  >
                    {dish.isAvailable ? "Available" : "Unavailable"}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Description</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {dish.description || "No description provided"}
                </p>
              </div>

              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <Link
                  to="/dishes"
                  className="inline-flex items-center text-sm px-3 py-1.5 border border-gray-300 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <FaArrowLeft className="mr-1" size={12} />
                  Back to Dishes
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-red-200 dark:border-red-900/50 max-w-xs w-full">
            <div className="p-4">
              <div className="flex items-start mb-4">
                <div className="flex-shrink-0 mt-0.5 mr-3 text-red-500">
                  <FaTrash />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Delete Dish</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Delete {dish.name}? This cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-xs px-3 py-1.5 border border-gray-300 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="text-xs px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-70"
                >
                  {deleteLoading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DishDetails;