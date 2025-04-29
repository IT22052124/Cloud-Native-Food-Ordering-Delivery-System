import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { addRestaurant } from "../utils/api";
import { toast } from "react-toastify";
import { FaStore, FaMapMarkerAlt, FaPhone, FaEnvelope, FaUser, FaLock, FaInfoCircle, FaClock, FaMoneyBill, FaUtensils, FaImage, FaTruck, FaShoppingBag, FaBuilding, FaCheckCircle, FaArrowLeft, FaPlus, FaEye, FaEyeSlash, FaTrash } from "react-icons/fa";
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../../firebase-config';

// Google Maps container style
const mapContainerStyle = {
  width: "100%",
  height: "400px",
};

// Default center (Colombo, Sri Lanka)
const defaultCenter = {
  lat: 6.9271,
  lng: 79.8612,
};

const AddRestaurant = () => {
  const navigate = useNavigate();
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    street: "",
    city: "",
    province: "",
    postalCode: "",
    landmark: "",
    lat: 6.9271,
    lng: 79.8612,
    phone: "",
    email: "",
    credentials: [{ username: "", password: "", showPassword: false }],
    coverImageUrl: "",
    imageUrls: [],
    openingHours: [
      { day: "Monday", open: "09:00", close: "18:00", isClosed: false },
      { day: "Tuesday", open: "09:00", close: "18:00", isClosed: false },
      { day: "Wednesday", open: "09:00", close: "18:00", isClosed: false },
      { day: "Thursday", open: "09:00", close: "18:00", isClosed: false },
      { day: "Friday", open: "09:00", close: "17:00", isClosed: false },
      { day: "Saturday", open: "10:00", close: "14:00", isClosed: false },
      { day: "Sunday", open: null, close: null, isClosed: true },
    ],
    accountNumber: "",
    accountHolderName: "",
    bankName: "",
    branch: "",
    serviceType: {
      delivery: true,
      pickup: true,
      dineIn: true,
    },
    cuisineType: "Indian",
    estimatedPrepTime: 20,
    termsAccepted: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState({ cover: false, images: false });
  const [uploadError, setUploadError] = useState({ cover: "", images: "" });
  const [uploadProgress, setUploadProgress] = useState({ cover: 0, images: 0 });
  const [markerPosition, setMarkerPosition] = useState(defaultCenter);

  const handleMapClick = useCallback((event) => {
    const newLat = event.latLng.lat();
    const newLng = event.latLng.lng();
    setMarkerPosition({ lat: newLat, lng: newLng });
    setFormData((prev) => ({
      ...prev,
      lat: newLat,
      lng: newLng,
    }));
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      toast.error("Google Maps API key is missing. Please contact support.");
      return;
    }
    fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${newLat},${newLng}&key=${apiKey}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.results && data.results[0]) {
          const addressComponents = data.results[0].address_components;
          let street = "";
          let city = "";
          let province = "";
          let postalCode = "";

          addressComponents.forEach((component) => {
            if (component.types.includes("route")) street = component.long_name;
            if (component.types.includes("locality")) city = component.long_name;
            if (component.types.includes("administrative_area_level_1")) province = component.long_name;
            if (component.types.includes("postal_code")) postalCode = component.long_name;
          });

          setFormData((prev) => ({
            ...prev,
            street: street || prev.street,
            city: city || prev.city,
            province: province || prev.province,
            postalCode: postalCode || prev.postalCode,
          }));
          toast.info("Address auto-filled from selected location");
        }
      })
      .catch((error) => {
        console.error("Error reverse geocoding:", error);
        toast.error("Failed to fetch address details");
      });
  }, []);

  const handleMarkerDragEnd = useCallback((event) => {
    const newLat = event.latLng.lat();
    const newLng = event.latLng.lng();
    setMarkerPosition({ lat: newLat, lng: newLng });
    setFormData((prev) => ({
      ...prev,
      lat: newLat,
      lng: newLng,
    }));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "delivery" || name === "pickup" || name === "dineIn") {
      setFormData((prev) => ({
        ...prev,
        serviceType: {
          ...prev.serviceType,
          [name]: checked,
        },
      }));
    } else if (type === "checkbox" && name === "termsAccepted") {
      setFormData((prev) => ({
        ...prev,
        termsAccepted: checked,
      }));
    } else if (name.startsWith("openingHours.")) {
      const [_, day, field] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        openingHours: prev.openingHours.map((entry) =>
          entry.day === day
            ? {
                ...entry,
                [field]: field === "isClosed" ? checked : value || null,
                ...(field === "isClosed" && checked
                  ? { open: null, close: null }
                  : {}),
                ...(field === "isClosed" && !checked
                  ? { open: "09:00", close: "18:00" }
                  : {}),
              }
            : entry
        ),
      }));
    } else if (name.startsWith("credentials.")) {
      const [_, index, field] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        credentials: prev.credentials.map((cred, i) =>
          parseInt(index) === i
            ? { ...cred, [field]: field === "showPassword" ? checked : value }
            : cred
        ),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === "lat" || name === "lng" || name === "estimatedPrepTime" ? parseFloat(value) || 0 : value,
      }));
    }
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Restaurant name is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.street.trim()) newErrors.street = "Street address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.province) newErrors.province = "Province is required";
    if (!formData.postalCode.trim()) newErrors.postalCode = "Postal code is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Invalid email format";
    if (!formData.credentials.length || formData.credentials.some(cred => !cred.username.trim())) {
      newErrors.credentials = "At least one username is required";
    }
    if (formData.credentials.some(cred => !cred.password)) {
      newErrors.credentials = "Password is required for all credentials";
    } else if (formData.credentials.some(cred => cred.password.length < 6)) {
      newErrors.credentials = "All passwords must be at least 6 characters";
    }
    if (
      formData.openingHours.length !== 7 ||
      !formData.openingHours.every(
        (entry) =>
          entry.day &&
          (entry.isClosed || (entry.open && entry.close))
      )
    ) {
      newErrors.openingHours = "Complete opening hours are required for all days";
    }
    if (!formData.termsAccepted) newErrors.termsAccepted = "You must accept the terms and conditions";
    return newErrors;
  };

  const handleCoverImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      setUploadError((prev) => ({ ...prev, cover: "Please select a cover image." }));
      return;
    }

    try {
      setUploading((prev) => ({ ...prev, cover: true }));
      setUploadError((prev) => ({ ...prev, cover: "" }));
      setUploadProgress((prev) => ({ ...prev, cover: 0 }));

      const storageRef = ref(storage, `restaurant_cover_images/${file.name}-${Date.now()}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      setFormData((prev) => ({
        ...prev,
        coverImageUrl: url,
      }));

      setUploading((prev) => ({ ...prev, cover: false }));
      setUploadProgress((prev) => ({ ...prev, cover: 100 }));
    } catch (error) {
      console.error("Error uploading cover image: ", error);
      setUploadError((prev) => ({ ...prev, cover: "Failed to upload cover image. Please try again." }));
      setUploading((prev) => ({ ...prev, cover: false }));
      setUploadProgress((prev) => ({ ...prev, cover: 0 }));
    }
  };

  const handleDeleteCoverImage = async () => {
    if (!formData.coverImageUrl) return;

    try {
      const imageRef = ref(storage, formData.coverImageUrl);
      await deleteObject(imageRef);
      setFormData((prev) => ({
        ...prev,
        coverImageUrl: "",
      }));
      setUploadError((prev) => ({ ...prev, cover: "" }));
    } catch (error) {
      console.error("Error deleting cover image: ", error);
      setUploadError((prev) => ({ ...prev, cover: "Failed to delete cover image." }));
    }
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) {
      setUploadError((prev) => ({ ...prev, images: "Please select at least one image." }));
      return;
    }

    try {
      setUploading((prev) => ({ ...prev, images: true }));
      setUploadError((prev) => ({ ...prev, images: "" }));
      setUploadProgress((prev) => ({ ...prev, images: 0 }));

      const uploadPromises = files.map(async (file, index) => {
        const storageRef = ref(storage, `restaurant_images/${file.name}-${Date.now()}-${index}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        return url;
      });

      const newImageUrls = await Promise.all(uploadPromises);
      setFormData((prev) => ({
        ...prev,
        imageUrls: [...prev.imageUrls, ...newImageUrls],
      }));

      setUploading((prev) => ({ ...prev, images: false }));
      setUploadProgress((prev) => ({ ...prev, images: 100 }));
    } catch (error) {
      console.error("Error uploading images: ", error);
      setUploadError((prev) => ({ ...prev, images: "Failed to upload one or more images. Please try again." }));
      setUploading((prev) => ({ ...prev, images: false }));
      setUploadProgress((prev) => ({ ...prev, images: 0 }));
    }
  };

  const handleDeleteImage = async (imageUrl) => {
    try {
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
      setFormData((prev) => ({
        ...prev,
        imageUrls: prev.imageUrls.filter((url) => url !== imageUrl),
      }));
      setUploadError((prev) => ({ ...prev, images: "" }));
    } catch (error) {
      console.error("Error deleting image: ", error);
      setUploadError((prev) => ({ ...prev, images: "Failed to delete image." }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fill the required fields");
      return;
    }

    setLoading(true);
    try {
      const restaurantData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        street: formData.street.trim(),
        city: formData.city.trim(),
        province: formData.province,
        postalCode: formData.postalCode.trim(),
        landmark: formData.landmark.trim(),
        lat: formData.lat,
        lng: formData.lng,
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        credentials: formData.credentials.map(({ username, password }) => ({
          username: username.trim(),
          password,
        })),
        coverImageUrl: formData.coverImageUrl,
        imageUrls: formData.imageUrls,
        openingHours: formData.openingHours,
        accountNumber: formData.accountNumber.trim(),
        accountHolderName: formData.accountHolderName.trim(),
        bankName: formData.bankName.trim(),
        branch: formData.branch.trim(),
        serviceType: formData.serviceType,
        cuisineType: formData.cuisineType,
        estimatedPrepTime: formData.estimatedPrepTime,
      };
      await addRestaurant(restaurantData);
      toast.success("Restaurant added successfully!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add restaurant");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMarkerPosition({ lat: latitude, lng: longitude });
          setFormData((prev) => ({
            ...prev,
            lat: latitude,
            lng: longitude,
          }));
          toast.info("Location set to your current position");
        },
        () => {
          toast.error("Unable to retrieve your location");
        }
      );
    } else {
      toast.error("Geolocation is not supported by this browser");
    }
  };

  const addCredential = () => {
    setFormData((prev) => ({
      ...prev,
      credentials: [...prev.credentials, { username: "", password: "", showPassword: false }],
    }));
  };

  const removeCredential = (index) => {
    if (formData.credentials.length === 1) {
      toast.error("At least one credential pair is required");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      credentials: prev.credentials.filter((_, i) => i !== index),
    }));
    setErrors((prev) => ({ ...prev, credentials: "" }));
  };

  const provinces = [
    "Western",
    "Central",
    "Southern",
    "Northern",
    "Eastern",
    "North Western",
    "North Central",
    "Uva",
    "Sabaragamuwa",
  ];

  const cuisineTypes = ["Indian", "Chinese", "Italian", "Mexican", "Continental"];

  const sriLankanBanks = [
    "",
    "Bank of Ceylon",
    "Commercial Bank of Ceylon",
    "Hatton National Bank",
    "People's Bank",
    "Sampath Bank",
    "Nations Trust Bank",
    "Seylan Bank",
    "DFCC Bank",
    "NSB (National Savings Bank)",
    "Pan Asia Bank",
  ];

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Navbar />
        <div className="p-8 max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white flex items-center">
            <FaStore className="mr-2 text-amber-500 dark:text-amber-400" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-600">
              Add New Restaurant
            </span>
          </h2>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Restaurant Details */}
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-amber-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-200">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
                <span className="w-1 h-6 bg-amber-500 rounded-full mr-2"></span>
                Restaurant Details
              </h3>
              <div className="space-y-6">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-amber-500 transition-colors duration-200" htmlFor="name">
                    Restaurant Name
                  </label>
                  <div className="relative">
                    <FaStore className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 dark:text-blue-400" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter restaurant name"
                      className={`w-full pl-10 p-4 border border-amber-200 dark:border-gray-700 rounded-lg bg-amber-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 shadow-sm ${
                        errors.name ? "border-red-500" : ""
                      }`}
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? "name-error" : undefined}
                    />
                  </div>
                  {errors.name && (
                    <p id="name-error" className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-amber-500 transition-colors duration-200" htmlFor="description">
                    Description
                  </label>
                  <div className="relative">
                    <FaInfoCircle className="absolute left-3 top-4 text-blue-500 dark:text-blue-400" />
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Describe your restaurant"
                      rows="4"
                      className={`w-full pl-10 p-4 border border-amber-200 dark:border-gray-700 rounded-lg bg-amber-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 shadow-sm ${
                        errors.description ? "border-red-500" : ""
                      }`}
                      aria-invalid={!!errors.description}
                      aria-describedby={errors.description ? "description-error" : undefined}
                    />
                  </div>
                  {errors.description && (
                    <p id="description-error" className="text-red-500 text-sm mt-1">{errors.description}</p>
                  )}
                </div>
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-amber-500 transition-colors duration-200" htmlFor="cuisineType">
                    Cuisine Type
                  </label>
                  <div className="relative">
                    <FaUtensils className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 dark:text-blue-400" />
                    <select
                      id="cuisineType"
                      name="cuisineType"
                      value={formData.cuisineType}
                      onChange={handleChange}
                      className="w-full pl-10 p-4 border border-amber-200 dark:border-gray-700 rounded-lg bg-amber-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 shadow-sm"
                    >
                      {cuisineTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-amber-500 transition-colors duration-200" htmlFor="estimatedPrepTime">
                    Estimated Preparation Time (minutes)
                  </label>
                  <div className="relative">
                    <FaClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 dark:text-blue-400" />
                    <input
                      type="number"
                      id="estimatedPrepTime"
                      name="estimatedPrepTime"
                      value={formData.estimatedPrepTime}
                      onChange={handleChange}
                      placeholder="Enter preparation time in minutes"
                      className="w-full pl-10 p-4 border border-amber-200 dark:border-gray-700 rounded-lg bg-amber-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 shadow-sm"
                      min="1"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Cover Image */}
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-amber-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-200">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
                <span className="w-1 h-6 bg-amber-500 rounded-full mr-2"></span>
                Cover Image
              </h3>
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-amber-500 transition-colors duration-200">
                  Restaurant Cover Image
                </label>
                <div className="space-y-4">
                  {formData.coverImageUrl && (
                    <div className="relative mb-4 group/image">
                      <img
                        src={formData.coverImageUrl}
                        alt="Cover"
                        className="w-full max-w-xs h-40 object-cover rounded-lg shadow-md transform group-hover/image:scale-105 transition-transform duration-300"
                      />
                      <button
                        type="button"
                        onClick={handleDeleteCoverImage}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
                        aria-label="Delete cover image"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  <div className="relative">
                    <FaImage className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-500 dark:text-yellow-400" />
                    <input
                      type="file"
                      onChange={handleCoverImageChange}
                      accept="image/*"
                      className="w-full pl-10 p-4 border border-amber-200 dark:border-gray-700 rounded-lg bg-amber-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 shadow-sm file:bg-amber-100 file:border-none file:rounded-lg file:p-2 file:text-amber-700 file:cursor-pointer"
                    />
                  </div>
                  {uploading.cover && (
                    <div className="w-full bg-gray-200 rounded-lg h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-orange-600 h-2 rounded-lg"
                        style={{ width: `${uploadProgress.cover}%` }}
                      ></div>
                    </div>
                  )}
                  {uploadError.cover && <p className="text-red-500 text-sm">{uploadError.cover}</p>}
                </div>
              </div>
            </div>

            {/* Other Images */}
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-amber-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-200">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
                <span className="w-1 h-6 bg-amber-500 rounded-full mr-2"></span>
                Other Images
              </h3>
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-amber-500 transition-colors duration-200">
                  Restaurant Images
                </label>
                <div className="space-y-4">
                  {formData.imageUrls.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                      {formData.imageUrls.map((url, index) => (
                        <div key={index} className="relative group/image">
                          <img
                            src={url}
                            alt={`Restaurant ${index + 1}`}
                            className="w-full h-40 object-cover rounded-lg shadow-md transform group-hover/image:scale-105 transition-transform duration-300"
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteImage(url)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
                            aria-label={`Delete image ${index + 1}`}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="relative">
                    <FaImage className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-500 dark:text-yellow-400" />
                    <input
                      type="file"
                      multiple
                      onChange={handleImageChange}
                      accept="image/*"
                      className="w-full pl-10 p-4 border border-amber-200 dark:border-gray-700 rounded-lg bg-amber-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 shadow-sm file:bg-amber-100 file:border-none file:rounded-lg file:p-2 file:text-amber-700 file:cursor-pointer"
                    />
                  </div>
                  {uploading.images && (
                    <div className="w-full bg-gray-200 rounded-lg h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-orange-600 h-2 rounded-lg"
                        style={{ width: `${uploadProgress.images}%` }}
                      ></div>
                    </div>
                  )}
                  {uploadError.images && <p className="text-red-500 text-sm">{uploadError.images}</p>}
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-amber-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-200">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
                <span className="w-1 h-6 bg-amber-500 rounded-full mr-2"></span>
                Address
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-amber-500 transition-colors duration-200" htmlFor="street">
                    Street
                  </label>
                  <div className="relative">
                    <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500 dark:text-orange-400" />
                    <input
                      type="text"
                      id="street"
                      name="street"
                      value={formData.street}
                      onChange={handleChange}
                      placeholder="Enter street address"
                      className={`w-full pl-10 p-4 border border-amber-200 dark:border-gray-700 rounded-lg bg-amber-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 shadow-sm ${
                        errors.street ? "border-red-500" : ""
                      }`}
                      aria-invalid={!!errors.street}
                      aria-describedby={errors.street ? "street-error" : undefined}
                    />
                  </div>
                  {errors.street && (
                    <p id="street-error" className="text-red-500 text-sm mt-1">{errors.street}</p>
                  )}
                </div>
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-amber-500 transition-colors duration-200" htmlFor="city">
                    City
                  </label>
                  <div className="relative">
                    <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500 dark:text-orange-400" />
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Enter city"
                      className={`w-full pl-10 p-4 border border-amber-200 dark:border-gray-700 rounded-lg bg-amber-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 shadow-sm ${
                        errors.city ? "border-red-500" : ""
                      }`}
                      aria-invalid={!!errors.city}
                      aria-describedby={errors.city ? "city-error" : undefined}
                    />
                  </div>
                  {errors.city && (
                    <p id="city-error" className="text-red-500 text-sm mt-1">{errors.city}</p>
                  )}
                </div>
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-amber-500 transition-colors duration-200" htmlFor="province">
                    Province
                  </label>
                  <div className="relative">
                    <select
                      id="province"
                      name="province"
                      value={formData.province}
                      onChange={handleChange}
                      className={`w-full p-4 border border-amber-200 dark:border-gray-700 rounded-lg bg-amber-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 shadow-sm ${
                        errors.province ? "border-red-500" : ""
                      }`}
                      aria-invalid={!!errors.province}
                      aria-describedby={errors.province ? "province-error" : undefined}
                    >
                      <option value="" disabled>
                        Select a province
                      </option>
                      {provinces.map((prov) => (
                        <option key={prov} value={prov}>
                          {prov}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.province && (
                    <p id="province-error" className="text-red-500 text-sm mt-1">{errors.province}</p>
                  )}
                </div>
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-amber-500 transition-colors duration-200" htmlFor="postalCode">
                    Postal Code
                  </label>
                  <div className="relative">
                    <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500 dark:text-orange-400" />
                    <input
                      type="text"
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      placeholder="Enter postal code"
                      className={`w-full pl-10 p-4 border border-amber-200 dark:border-gray-700 rounded-lg bg-amber-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 shadow-sm ${
                        errors.postalCode ? "border-red-500" : ""
                      }`}
                      aria-invalid={!!errors.postalCode}
                      aria-describedby={errors.postalCode ? "postalCode-error" : undefined}
                    />
                  </div>
                  {errors.postalCode && (
                    <p id="postalCode-error" className="text-red-500 text-sm mt-1">{errors.postalCode}</p>
                  )}
                </div>
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-amber-500 transition-colors duration-200" htmlFor="landmark">
                    Landmark (Optional)
                  </label>
                  <div className="relative">
                    <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500 dark:text-orange-400" />
                    <input
                      type="text"
                      id="landmark"
                      name="landmark"
                      value={formData.landmark}
                      onChange={handleChange}
                      placeholder="E.g., Next to ABC Bank"
                      className="w-full pl-10 p-4 border border-amber-200 dark:border-gray-700 rounded-lg bg-amber-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 shadow-sm"
                    />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Location on Map
                  </label>
                  <div className="rounded-lg border border-amber-200 dark:border-gray-700 overflow-hidden shadow-md">
                    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""}>
                      <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={markerPosition}
                        zoom={15}
                        onClick={handleMapClick}
                      >
                        <Marker position={markerPosition} draggable onDragEnd={handleMarkerDragEnd} />
                      </GoogleMap>
                    </LoadScript>
                  </div>
                </div>
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-amber-500 transition-colors duration-200" htmlFor="lat">
                    Latitude
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="lat"
                      name="lat"
                      value={formData.lat}
                      readOnly
                      className="w-full p-4 border border-amber-200 dark:border-gray-700 rounded-lg bg-amber-50 dark:bg-gray-600 text-gray-800 dark:text-white shadow-sm"
                      aria-describedby="lat-help"
                    />
                  </div>
                  <p id="lat-help" className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    Selected latitude from the map.
                  </p>
                </div>
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-amber-500 transition-colors duration-200" htmlFor="lng">
                    Longitude
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="lng"
                      name="lng"
                      value={formData.lng}
                      readOnly
                      className="w-full p-4 border border-amber-200 dark:border-gray-700 rounded-lg bg-amber-50 dark:bg-gray-600 text-gray-800 dark:text-white shadow-sm"
                      aria-describedby="lng-help"
                    />
                  </div>
                  <p id="lng-help" className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    Selected longitude from the map.
                  </p>
                </div>
                <div className="col-span-2">
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    className="px-6 py-2 bg-amber-100 dark:bg-gray-700 text-amber-700 dark:text-amber-400 rounded-lg hover:bg-amber-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all duration-200 shadow-sm flex items-center"
                  >
                    <FaMapMarkerAlt className="mr-2 text-amber-500 dark:text-amber-400" />
                    Use My Current Location
                  </button>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-amber-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-200">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
                <span className="w-1 h-6 bg-amber-500 rounded-full mr-2"></span>
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-amber-500 transition-colors duration-200" htmlFor="phone">
                    Phone Number
                  </label>
                  <div className="relative">
                    <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-teal-500 dark:text-teal-400" />
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                      className={`w-full pl-10 p-4 border border-amber-200 dark:border-gray-700 rounded-lg bg-amber-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 shadow-sm ${
                        errors.phone ? "border-red-500" : ""
                      }`}
                      aria-invalid={!!errors.phone}
                      aria-describedby={errors.phone ? "phone-error" : undefined}
                    />
                  </div>
                  {errors.phone && (
                    <p id="phone-error" className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-amber-500 transition-colors duration-200" htmlFor="email">
                    Email
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-teal-500 dark:text-teal-400" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter email address"
                      className={`w-full pl-10 p-4 border border-amber-200 dark:border-gray-700 rounded-lg bg-amber-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 shadow-sm ${
                        errors.email ? "border-red-500" : ""
                      }`}
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? "email-error" : undefined}
                    />
                  </div>
                  {errors.email && (
                    <p id="email-error" className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Opening Hours */}
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-amber-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-200">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
                <span className="w-1 h-6 bg-amber-500 rounded-full mr-2"></span>
                Opening Hours
              </h3>
              <div className="space-y-4">
                {formData.openingHours.map((entry, index) => (
                  <div key={entry.day} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <div className="font-medium text-gray-700 dark:text-gray-300">{entry.day}</div>
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-amber-500 transition-colors duration-200" htmlFor={`openingHours.${entry.day}.open`}>
                        Opening Time
                      </label>
                      <div className="relative">
                        <FaClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500 dark:text-purple-400" />
                        <input
                          type="time"
                          id={`openingHours.${entry.day}.open`}
                          name={`openingHours.${entry.day}.open`}
                          value={entry.open || ""}
                          onChange={handleChange}
                          disabled={entry.isClosed}
                          className={`w-full pl-10 p-4 border border-amber-200 dark:border-gray-700 rounded-lg bg-amber-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 shadow-sm ${
                            errors.openingHours && !entry.isClosed && !entry.open ? "border-red-500" : ""
                          }`}
                          aria-invalid={!!errors.openingHours && !entry.isClosed && !entry.open}
                          aria-describedby={errors.openingHours && !entry.isClosed && !entry.open ? `open-error-${entry.day}` : undefined}
                        />
                      </div>
                    </div>
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-amber-500 transition-colors duration-200" htmlFor={`openingHours.${entry.day}.close`}>
                        Closing Time
                      </label>
                      <div className="relative">
                        <FaClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500 dark:text-purple-400" />
                        <input
                          type="time"
                          id={`openingHours.${entry.day}.close`}
                          name={`openingHours.${entry.day}.close`}
                          value={entry.close || ""}
                          onChange={handleChange}
                          disabled={entry.isClosed}
                          className={`w-full pl-10 p-4 border border-amber-200 dark:border-gray-700 rounded-lg bg-amber-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 shadow-sm ${
                            errors.openingHours && !entry.isClosed && !entry.close ? "border-red-500" : ""
                          }`}
                          aria-invalid={!!errors.openingHours && !entry.isClosed && !entry.close}
                          aria-describedby={errors.openingHours && !entry.isClosed && !entry.close ? `close-error-${entry.day}` : undefined}
                        />
                      </div>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`openingHours.${entry.day}.isClosed`}
                        name={`openingHours.${entry.day}.isClosed`}
                        checked={entry.isClosed}
                        onChange={handleChange}
                        className="h-5 w-5 text-amber-500 focus:ring-amber-500 border-amber-200 dark:border-gray-700 rounded"
                      />
                      <label htmlFor={`openingHours.${entry.day}.isClosed`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Closed
                      </label>
                    </div>
                    {errors.openingHours && !entry.isClosed && (!entry.open || !entry.close) && (
                      <p id={`open-error-${entry.day}`} className="text-red-500 text-sm mt-1 col-span-4">
                        {`Opening and closing times are required for ${entry.day} when not closed`}
                      </p>
                    )}
                  </div>
                ))}
                {errors.openingHours && (
                  <p id="openingHours-error" className="text-red-500 text-sm mt-1">{errors.openingHours}</p>
                )}
              </div>
            </div>

            {/* Bank Details */}
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-amber-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-200">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
                <span className="w-1 h-6 bg-amber-500 rounded-full mr-2"></span>
                Bank Details (Optional)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-amber-500 transition-colors duration-200" htmlFor="accountNumber">
                    Account Number
                  </label>
                  <div className="relative">
                    <FaMoneyBill className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-500 dark:text-indigo-400" />
                    <input
                      type="text"
                      id="accountNumber"
                      name="accountNumber"
                      value={formData.accountNumber}
                      onChange={handleChange}
                      placeholder="Enter account number"
                      className="w-full pl-10 p-4 border border-amber-200 dark:border-gray-700 rounded-lg bg-amber-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 shadow-sm"
                    />
                  </div>
                </div>
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-amber-500 transition-colors duration-200" htmlFor="accountHolderName">
                    Account Holder Name
                  </label>
                  <div className="relative">
                    <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-500 dark:text-indigo-400" />
                    <input
                      type="text"
                      id="accountHolderName"
                      name="accountHolderName"
                      value={formData.accountHolderName}
                      onChange={handleChange}
                      placeholder="Enter account holder name"
                      className="w-full pl-10 p-4 border border-amber-200 dark:border-gray-700 rounded-lg bg-amber-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 shadow-sm"
                    />
                  </div>
                </div>
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-amber-500 transition-colors duration-200" htmlFor="bankName">
                    Bank Name
                  </label>
                  <div className="relative">
                    <FaMoneyBill className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-500 dark:text-indigo-400" />
                    <select
                      id="bankName"
                      name="bankName"
                      value={formData.bankName}
                      onChange={handleChange}
                      className="w-full pl-10 p-4 border border-amber-200 dark:border-gray-700 rounded-lg bg-amber-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 shadow-sm"
                    >
                      <option value="">Select a bank (optional)</option>
                      {sriLankanBanks.map((bank) => (
                        <option key={bank} value={bank}>
                          {bank || "None"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-amber-500 transition-colors duration-200" htmlFor="branch">
                    Branch
                  </label>
                  <div className="relative">
                    <FaBuilding className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-500 dark:text-indigo-400" />
                    <input
                      type="text"
                      id="branch"
                      name="branch"
                      value={formData.branch}
                      onChange={handleChange}
                      placeholder="Enter bank branch"
                      className="w-full pl-10 p-4 border border-amber-200 dark:border-gray-700 rounded-lg bg-amber-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Service Types */}
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-amber-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-200">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
                <span className="w-1 h-6 bg-amber-500 rounded-full mr-2"></span>
                Service Types
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div
                  className={`bg-amber-50 dark:bg-gray-700 p-4 rounded-lg flex items-center shadow-sm cursor-pointer transition-all duration-200 ${
                    formData.serviceType.delivery ? "border-amber-500 border-2" : "border-amber-200 border"
                  }`}
                  onClick={() => handleChange({ target: { name: "delivery", type: "checkbox", checked: !formData.serviceType.delivery } })}
                >
                  <FaTruck className="text-green-500 dark:text-green-400 mr-3 text-xl" />
                  <div>
                    <p className="text-gray-800 dark:text-white font-medium">Delivery</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{formData.serviceType.delivery ? "Enabled" : "Disabled"}</p>
                  </div>
                </div>
                <div
                  className={`bg-amber-50 dark:bg-gray-700 p-4 rounded-lg flex items-center shadow-sm cursor-pointer transition-all duration-200 ${
                    formData.serviceType.pickup ? "border-amber-500 border-2" : "border-amber-200 border"
                  }`}
                  onClick={() => handleChange({ target: { name: "pickup", type: "checkbox", checked: !formData.serviceType.pickup } })}
                >
                  <FaShoppingBag className="text-green-500 dark:text-green-400 mr-3 text-xl" />
                  <div>
                    <p className="text-gray-800 dark:text-white font-medium">Pickup</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{formData.serviceType.pickup ? "Enabled" : "Disabled"}</p>
                  </div>
                </div>
                <div
                  className={`bg-amber-50 dark:bg-gray-700 p-4 rounded-lg flex items-center shadow-sm cursor-pointer transition-all duration-200 ${
                    formData.serviceType.dineIn ? "border-amber-500 border-2" : "border-amber-200 border"
                  }`}
                  onClick={() => handleChange({ target: { name: "dineIn", type: "checkbox", checked: !formData.serviceType.dineIn } })}
                >
                  <FaUtensils className="text-green-500 dark:text-green-400 mr-3 text-xl" />
                  <div>
                    <p className="text-gray-800 dark:text-white font-medium">Dine-In</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{formData.serviceType.dineIn ? "Enabled" : "Disabled"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Login Credentials */}
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-amber-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-200">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
                <span className="w-1 h-6 bg-amber-500 rounded-full mr-2"></span>
                Login Credentials
              </h3>
              <div className="space-y-6">
                {formData.credentials.map((cred, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-amber-500 transition-colors duration-200" htmlFor={`credentials.${index}.username`}>
                        Username
                      </label>
                      <div className="relative">
                        <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-500 dark:text-pink-400" />
                        <input
                          type="text"
                          id={`credentials.${index}.username`}
                          name={`credentials.${index}.username`}
                          value={cred.username}
                          onChange={handleChange}
                          placeholder="Enter username"
                          className={`w-full pl-10 p-4 border border-amber-200 dark:border-gray-700 rounded-lg bg-amber-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 shadow-sm ${
                            errors.credentials && !cred.username.trim() ? "border-red-500" : ""
                          }`}
                          aria-invalid={!!errors.credentials && !cred.username.trim()}
                          aria-describedby={errors.credentials && !cred.username.trim() ? `username-error-${index}` : undefined}
                        />
                      </div>
                      {errors.credentials && !cred.username.trim() && (
                        <p id={`username-error-${index}`} className="text-red-500 text-sm mt-1">Username is required</p>
                      )}
                    </div>
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-amber-500 transition-colors duration-200" htmlFor={`credentials.${index}.password`}>
                        Password
                      </label>
                      <div className="relative">
                        <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-500 dark:text-pink-400" />
                        <input
                          type={cred.showPassword ? "text" : "password"}
                          id={`credentials.${index}.password`}
                          name={`credentials.${index}.password`}
                          value={cred.password}
                          onChange={handleChange}
                          placeholder="Enter password"
                          className={`w-full pl-10 pr-10 p-4 border border-amber-200 dark:border-gray-700 rounded-lg bg-amber-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 shadow-sm ${
                            errors.credentials && (!cred.password || cred.password.length < 6) ? "border-red-500" : ""
                          }`}
                          aria-invalid={!!errors.credentials && (!cred.password || cred.password.length < 6)}
                          aria-describedby={errors.credentials && (!cred.password || cred.password.length < 6) ? `password-error-${index}` : undefined}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            handleChange({
                              target: {
                                name: `credentials.${index}.showPassword`,
                                type: "checkbox",
                                checked: !cred.showPassword,
                              },
                            })
                          }
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-amber-500 dark:hover:text-amber-400"
                          aria-label={cred.showPassword ? "Hide password" : "Show password"}
                        >
                          {cred.showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      {errors.credentials && !cred.password && (
                        <p id={`password-error-${index}`} className="text-red-500 text-sm mt-1">Password is required</p>
                      )}
                      {errors.credentials && cred.password && cred.password.length < 6 && (
                        <p id={`password-error-${index}`} className="text-red-500 text-sm mt-1">Password must be at least 6 characters</p>
                      )}
                    </div>
                    {formData.credentials.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCredential(index)}
                        className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
                        aria-label="Remove credential"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                ))}
                {errors.credentials && (
                  <p id="credentials-error" className="text-red-500 text-sm mt-1">{errors.credentials}</p>
                )}
                <div>
                  <button
                    type="button"
                    onClick={addCredential}
                    className="px-4 py-2 bg-amber-100 dark:bg-gray-700 text-amber-700 dark:text-amber-400 rounded-lg hover:bg-amber-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all duration-200 shadow-sm flex items-center"
                  >
                    <FaPlus className="mr-2 text-amber-500 dark:text-amber-400" />
                    Add Another Credential
                  </button>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-amber-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-200">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="termsAccepted"
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={handleChange}
                  className="h-5 w-5 text-amber-500 focus:ring-amber-500 border-amber-200 dark:border-gray-700 rounded"
                />
                <label htmlFor="termsAccepted" className="ml-3 flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                  <FaCheckCircle className="mr-2 text-amber-500 dark:text-amber-400" />
                  I agree to the <a href="/terms" className="text-amber-500 hover:underline ml-1">Terms and Conditions</a>
                </label>
              </div>
              {errors.termsAccepted && (
                <p id="termsAccepted-error" className="text-red-500 text-sm mt-1">{errors.termsAccepted}</p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 bg-blue-500 dark:bg-gray-600 text-white  rounded-lg hover:bg-blue-600 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all duration-200 shadow-sm flex items-center"
              >
                <FaArrowLeft className="mr-2 text-white-500 dark:text-white-400" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || uploading.cover || uploading.images}
                className="px-6 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:from-green-500 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center shadow-sm"
              >
                {loading ? (
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
                    Adding...
                  </>
                ) : (
                  <>
                    <FaPlus className="mr-2 text-white" />
                    Add Restaurant
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddRestaurant;