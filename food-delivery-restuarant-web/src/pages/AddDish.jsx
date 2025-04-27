import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addDish } from "../utils/api.js";
import DishSidebar from "../components/DishSidebar.jsx";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../components/Navbar";
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../../firebase-config.js';

function AddDish() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    portions: [{ size: "regular", price: "" }],
    category: "",
    food_type: "veg",
    isAvailable: true,
    imageUrls: [],
    pricingType: "single", // "single" or "portion"
  });

  const [suggestedPrice, setSuggestedPrice] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const commonCategories = [
    "Appetizers",
    "Main Course",
    "Desserts",
    "Beverages",
    "Salads",
    "Soups",
    "Breads",
    "Rice Dishes",
    "Noodles",
    "Seafood",
    "Grilled",
    "Fast Food",
  ];

  const foodTypes = [
    { value: "veg", label: "Vegetarian", icon: "🥗" },
    { value: "non-veg", label: "Non-Vegetarian", icon: "🍗" },
    { value: "vegan", label: "Vegan", icon: "🥬" },
  ];

  const portionSizes = ["small", "regular", "large"];

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith("portions")) {
      const [_, index, field] = name.match(/portions\[(\d+)\]\.(\w+)/);
      const updatedPortions = [...formData.portions];
      updatedPortions[index] = {
        ...updatedPortions[index],
        [field]: value,
      };

      setFormData({
        ...formData,
        portions: updatedPortions,
      });

      // Calculate suggested price for the changed portion
      if (field === "price" && value) {
        const basePrice = parseFloat(value);
        if (!isNaN(basePrice)) {
          const withMargin = basePrice * 1.2; // 20% margin
          setSuggestedPrice(withMargin.toFixed(2));
        } else {
          setSuggestedPrice("");
        }
      }
    } else {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });

      // Calculate suggested price for single price
      if (name === "price" && value) {
        const basePrice = parseFloat(value);
        if (!isNaN(basePrice)) {
          const withMargin = basePrice * 1.2; // 20% margin
          setSuggestedPrice(withMargin.toFixed(2));
        } else {
          setSuggestedPrice("");
        }
      }
    }
  };

  const addPortion = () => {
    const usedSizes = formData.portions.map(p => p.size);
    const availableSizes = portionSizes.filter(size => !usedSizes.includes(size));
    if (availableSizes.length === 0) {
      setError("All portion sizes are already added.");
      return;
    }
    setFormData({
      ...formData,
      portions: [...formData.portions, { size: availableSizes[0], price: "" }],
    });
  };

  const removePortion = (index) => {
    const updatedPortions = formData.portions.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      portions: updatedPortions.length > 0 ? updatedPortions : [{ size: "regular", price: "" }],
    });
    setSuggestedPrice("");
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) {
      setError("Please select at least one image.");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setUploadProgress(0);

      const uploadPromises = files.map(async (file, index) => {
        const storageRef = ref(storage, `images/${file.name}-${Date.now()}-${index}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        return url;
      });

      const newImageUrls = await Promise.all(uploadPromises);
      setFormData({
        ...formData,
        imageUrls: [...formData.imageUrls, ...newImageUrls],
      });

      setUploading(false);
      setUploadProgress(100);
    } catch (error) {
      console.error("Error uploading images: ", error);
      setError("Failed to upload one or more images. Please try again.");
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteImage = async (imageUrl) => {
    try {
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
      setFormData({
        ...formData,
        imageUrls: formData.imageUrls.filter((url) => url !== imageUrl),
      });
      setError("");
    } catch (error) {
      console.error("Error deleting image: ", error);
      setError("Failed to delete image.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        price: formData.pricingType === "single" && formData.price ? parseFloat(formData.price) : null,
        portions: formData.pricingType === "portion" ? formData.portions.map(p => ({
          size: p.size,
          price: parseFloat(p.price)
        })) : null,
      };
      await addDish(submitData);
      toast.success("Dish added successfully!");
      navigate("/dishes");
    } catch (err) {
      toast.error("Failed to add dish");
    }
  };

  return (
    <div className="flex min-h-screen bg-orange-50 dark:bg-gray-900">
      <DishSidebar />
      <div className="flex-1 ml-64">
        <Navbar />
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover draggable />

        <div className="p-6 max-w-3xl mx-auto">
          <div className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-l-orange-500 border border-orange-100 dark:border-gray-700">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center">
              <span className="text-orange-500 mr-2">🍽️</span>
              Add New Dish
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2 pl-7">
              Fill in the details to add a new dish to your restaurant menu.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg border border-orange-100 dark:border-gray-700 space-y-8"
          >
            {/* Dish Name */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-orange-500 transition-colors duration-200">
                Dish Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-4 pl-5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                  required
                  placeholder="Enter dish name"
                />
                <div className="absolute inset-y-0 left-0 w-1 bg-orange-500 rounded-l-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
              </div>
            </div>

            {/* Image Upload */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-orange-500 transition-colors duration-200">
                Dish Images
              </label>
              <div className="space-y-4">
                {formData.imageUrls.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {formData.imageUrls.map((url, index) => (
                      <div key={index} className="relative">
                        <img
                          src={url}
                          alt={`Dish ${index + 1}`}
                          className="w-full h-32 object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(url)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <input
                  type="file"
                  multiple
                  onChange={handleImageChange}
                  accept="image/*"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
                {uploading && (
                  <div className="w-full bg-gray-200 rounded h-2">
                    <div
                      className="bg-orange-500 h-2 rounded"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                )}
                {error && <p className="text-red-500">{error}</p>}
              </div>
            </div>

            {/* Description */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-orange-500 transition-colors duration-200">
                Description
              </label>
              <div className="relative">
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full p-4 pl-5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                  placeholder="Describe the dish, ingredients, and special features"
                ></textarea>
                <div className="absolute inset-y-0 left-0 w-1 bg-orange-500 rounded-l-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
              </div>
            </div>

            {/* Pricing Type, Price/Portions, Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-orange-500 transition-colors duration-200">
                  Pricing Type
                </label>
                <div className="relative">
                  <select
                    name="pricingType"
                    value={formData.pricingType}
                    onChange={handleChange}
                    className="w-full p-4 pl-5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 appearance-none"
                    style={{
                      backgroundImage:
                        "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                      backgroundPosition: "right 0.75rem center",
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "1.5em 1.5em",
                    }}
                  >
                    <option value="single">Single Price (e.g., Juice)</option>
                    <option value="portion">Portions (e.g., Pizza)</option>
                  </select>
                  <div className="absolute inset-y-0 left-0 w-1 bg-orange-500 rounded-l-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
                </div>
              </div>

              <div className="group">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-orange-500 transition-colors duration-200">
                  {formData.pricingType === "single" ? "Base Price (LKR)" : "Portion Prices (LKR)"}
                </label>
                {formData.pricingType === "single" ? (
                  <div className="relative">
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      className="w-full p-4 pl-5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                      required
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                    <div className="absolute inset-y-0 left-0 w-1 bg-orange-500 rounded-l-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
                    {suggestedPrice && (
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Suggested selling price (add 20% margin):{" "}
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          LKR {suggestedPrice}
                        </span>
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.portions.map((portion, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <select
                          name={`portions[${index}].size`}
                          value={portion.size}
                          onChange={handleChange}
                          className="w-1/3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                        >
                          {portionSizes.map((size) => (
                            <option key={size} value={size} disabled={formData.portions.some(p => p.size === size && p.size !== portion.size)}>
                              {size.charAt(0).toUpperCase() + size.slice(1)}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          name={`portions[${index}].price`}
                          value={portion.price}
                          onChange={handleChange}
                          className="w-2/3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                          required
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                        />
                        {formData.portions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePortion(index)}
                            className="text-red-500 hover:text-red-600"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    {formData.portions.length < portionSizes.length && (
                      <button
                        type="button"
                        onClick={addPortion}
                        className="text-orange-500 hover:text-orange-600 text-sm"
                      >
                        + Add Portion
                      </button>
                    )}
                    {suggestedPrice && (
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Suggested selling price (add 20% margin):{" "}
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          LKR {suggestedPrice}
                        </span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="group">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-orange-500 transition-colors duration-200">
                  Category
                </label>
                <div className="relative">
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full p-4 pl-5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 appearance-none"
                    style={{
                      backgroundImage:
                        "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                      backgroundPosition: "right 0.75rem center",
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "1.5em 1.5em",
                    }}
                  >
                    <option value="">Select a category</option>
                    {commonCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 left-0 w-1 bg-orange-500 rounded-l-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
                </div>
              </div>
            </div>

            {/* Food Type */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Food Type
              </label>
              <div className="flex space-x-4 bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-300 dark:border-gray-600">
                {foodTypes.map((type) => (
                  <label
                    key={type.value}
                    className={`flex-1 p-3 rounded-md cursor-pointer transition-colors duration-200 ${
                      formData.food_type === type.value
                        ? "bg-orange-100 dark:bg-gray-600 border border-orange-300 dark:border-orange-500"
                        : "hover:bg-gray-50 dark:hover:bg-gray-600"
                    }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="food_type"
                        value={type.value}
                        checked={formData.food_type === type.value}
                        onChange={handleChange}
                        className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 dark:border-gray-600"
                      />
                      <span className="ml-3 flex items-center">
                        <span className="mr-2">{type.icon}</span>
                        <span
                          className={
                            formData.food_type === type.value
                              ? "text-orange-600 font-medium dark:text-orange-400"
                              : "text-gray-700 dark:text-gray-300"
                          }
                        >
                          {type.label}
                        </span>
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Availability Toggle */}
            <div className="bg-orange-50 dark:bg-gray-700/50 p-5 rounded-lg border border-orange-100 dark:border-gray-600">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Availability Status
              </label>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Is this dish currently available on the menu?
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isAvailable"
                    checked={formData.isAvailable}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-500 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-orange-500"></div>
                  <span
                    className={`ml-3 text-sm font-medium ${
                      formData.isAvailable
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {formData.isAvailable ? "Available" : "Unavailable"}
                  </span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-lg font-semibold transition-colors duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
                disabled={uploading}
              >
                <span className="mr-2">🍽️</span>
                Add Dish to Menu
              </button>
              <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-4">
                This dish will be immediately available on your restaurant menu once added.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddDish;