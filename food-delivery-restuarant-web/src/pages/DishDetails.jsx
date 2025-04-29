"use client"

import { useState, useEffect, useContext } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { FaEdit, FaTrash, FaArrowLeft, FaArrowRight, FaUtensils, FaTag, FaCheckCircle, FaList, FaLeaf } from "react-icons/fa"
import DishSidebar from "../components/DishSidebar"
import Navbar from "../components/DishNavBar"
import { getDish, deleteDish, updateDish } from "../utils/api"
import LoadingSpinner from "../components/LoadingSpinner"
import { toast } from "react-toastify"
import { AuthContext } from "../context/AuthContext"

const DishDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const [dish, setDish] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [toggleLoading, setToggleLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const fetchDish = async () => {
      try {
        const data = await getDish(id)
        setDish(data.dish)
        setCurrentImageIndex(0)
      } catch (error) {
        navigate("/dishes")
      } finally {
        setLoading(false)
      }
    }
    fetchDish()
  }, [id, navigate])

  useEffect(() => {
    if (dish && dish.imageUrls && currentImageIndex >= dish.imageUrls.length) {
      setCurrentImageIndex(Math.max(0, dish.imageUrls.length - 1))
    }
  }, [dish, currentImageIndex])

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await deleteDish(id)
      toast.success("Dish deleted successfully")
      navigate("/dishes")
    } catch (error) {
      toast.error("Failed to delete dish")
    } finally {
      setDeleteLoading(false)
      setShowDeleteModal(false)
    }
  }

  const handleToggleAvailability = async () => {
    if (toggleLoading) return
    setToggleLoading(true)
    const originalIsAvailable = dish.isAvailable
    const updatedDish = { ...dish, isAvailable: !dish.isAvailable }

    try {
      setDish(updatedDish)
      await updateDish(id, {
        ...updatedDish,
        price: updatedDish.price ? Number(updatedDish.price) : null,
        restaurantId: user.restaurantId,
      })
      toast.success(`Dish marked as ${updatedDish.isAvailable ? "available" : "unavailable"}`)
    } catch (error) {
      setDish({ ...dish, isAvailable: originalIsAvailable })
      toast.error("Failed to update availability")
    } finally {
      setToggleLoading(false)
    }
  }

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? dish.imageUrls.length - 1 : prev - 1))
  }

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === dish.imageUrls.length - 1 ? 0 : prev + 1))
  }

  const foodTypeIcons = {
    veg: { icon: <FaLeaf className="inline mr-1" />, label: "Vegetarian" },
    "non-veg": { icon: <FaUtensils className="inline mr-1" />, label: "Non-Vegetarian" },
    vegan: { icon: <FaLeaf className="inline mr-1" />, label: "Vegan" },
  }

  const formatPrice = (dish) => {
    if (dish.price !== null && dish.price !== undefined) {
      return (
        <span className="text-lg font-semibold text-green-400">
          LKR {dish.price.toFixed(2)}
        </span>
      )
    } else if (dish.portions && dish.portions.length > 0) {
      return dish.portions.map((portion) => (
        <div key={portion.size} className="flex justify-between text-sm py-1">
          <span className="capitalize text-gray-300">{portion.size}:</span>
          <span className="font-semibold text-green-400">LKR {portion.price.toFixed(2)}</span>
        </div>
      ))
    } else {
      return <span className="text-gray-500">N/A</span>
    }
  }

  if (loading) return <LoadingSpinner />
  if (!dish) return <div className="p-6 ml-64 text-red-600">Dish not found.</div>

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <DishSidebar />
      <div className="flex-1 ml-64">
        <Navbar />
        <div className="p-6 max-w-4xl mx-auto">
          <div className="bg-gray-800 rounded-xl shadow-xl overflow-hidden transition-all duration-300">
            {/* Header Section */}
            <div className="p-5 bg-gray-800 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-white flex items-center">
                  <FaUtensils className="mr-2 text-orange-500" size={22} />
                  Dish Details
                </h2>
                <div className="flex space-x-3">
                  <Link
                    to={`/dishes/edit/${dish._id}`}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 text-sm hover:shadow-md"
                  >
                    <FaEdit className="mr-2" size={16} />
                    Edit
                  </Link>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 text-sm hover:shadow-md"
                  >
                    <FaTrash className="mr-2" size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </div>

            {/* Image Section */}
            <div className="p-5">
              {dish.imageUrls && dish.imageUrls.length > 0 ? (
                <div className="relative w-full h-80 rounded-lg overflow-hidden shadow-md">
                  <img
                    src={dish.imageUrls[currentImageIndex] || "/placeholder.svg"}
                    alt={`Dish ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 ease-in-out hover:scale-105"
                    loading="lazy"
                  />
                  {dish.imageUrls.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-gray-700/70 text-white rounded-full hover:bg-gray-600 transition-all duration-200"
                      >
                        <FaArrowLeft size={16} />
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-gray-700/70 text-white rounded-full hover:bg-gray-600 transition-all duration-200"
                      >
                        <FaArrowRight size={16} />
                      </button>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                        {dish.imageUrls.map((_, index) => (
                          <button
                            key={index}
                            className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                              index === currentImageIndex ? "bg-white scale-125" : "bg-gray-400"
                            }`}
                            onClick={() => setCurrentImageIndex(index)}
                            aria-label={`View image ${index + 1}`}
                          ></button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="w-full h-80 flex items-center justify-center bg-gray-700 rounded-lg shadow-md">
                  <div className="text-center">
                    <FaUtensils className="text-6xl text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400 font-medium">No image available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Details Section */}
            <div className="p-6 space-y-6">
              {/* Dish Name */}
              <div>
                <h3 className="text-3xl font-bold text-white relative inline-block">
                  {dish.name}
                  <span className="absolute -bottom-1 left-0 w-20 h-1 bg-orange-500 rounded-full"></span>
                </h3>
              </div>

              {/* Price/Portions */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 flex items-center mb-3">
                  <FaTag className="mr-2 text-green-400" size={16} />
                  Price
                </h4>
                <div className="text-white">{formatPrice(dish)}</div>
              </div>

              {/* Availability */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 flex items-center mb-3">
                  <FaCheckCircle className="mr-2 text-blue-400" size={16} />
                  Availability
                </h4>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">
                    {dish.isAvailable ? "Available" : "Unavailable"}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dish.isAvailable}
                      onChange={handleToggleAvailability}
                      disabled={toggleLoading}
                      className="sr-only peer"
                    />
                    <div
                      className={`w-14 h-7 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-400 after:content-[''] after:absolute after:top-0.5 after:start-0.5 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:after:translate-x-7 peer-checked:bg-green-500 ${
                        toggleLoading ? "opacity-70" : "bg-gray-500"
                      } transition-all duration-200`}
                    ></div>
                  </label>
                </div>
              </div>

              {/* Category */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 flex items-center mb-3">
                  <FaList className="mr-2 text-blue-400" size={16} />
                  Category
                </h4>
                <span className="inline-block px-4 py-1.5 bg-blue-600 text-white rounded-full text-sm font-medium shadow-sm hover:bg-blue-700 transition-all duration-200">
                  {dish.category || "Not specified"}
                </span>
              </div>

              {/* Food Type */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 flex items-center mb-3">
                  <FaLeaf className="mr-2 text-orange-400" size={16} />
                  Food Type
                </h4>
                <span className="inline-block px-4 py-1.5 bg-orange-600 text-white rounded-full text-sm font-medium shadow-sm hover:bg-orange-700 transition-all duration-200">
                  {foodTypeIcons[dish.food_type]?.icon || ""}
                  {foodTypeIcons[dish.food_type]?.label || "Not specified"}
                </span>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 flex items-center mb-3">
                  <FaUtensils className="mr-2 text-gray-400" size={16} />
                  Description
                </h4>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {dish.description || "No description provided"}
                </p>
              </div>

              {/* Back Button */}
              <div className="pt-6 border-t border-gray-700">
                <Link
                  to="/dishes"
                  className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 text-sm hover:shadow-md"
                >
                  <FaArrowLeft className="mr-2" size={16} />
                  Back to Dishes
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 transition-opacity duration-300">
          <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 max-w-md w-full transition-transform duration-300">
            <div className="p-6">
              <div className="flex items-start mb-5">
                <div className="flex-shrink-0 bg-red-600/20 p-2 rounded-full mt-1 mr-4">
                  <FaTrash className="text-red-500" size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Delete Dish</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Are you sure you want to delete{" "}
                    <span className="font-medium text-white">{dish.name}</span>? This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 text-sm hover:shadow-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 text-sm hover:shadow-md disabled:opacity-70"
                >
                  {deleteLoading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DishDetails