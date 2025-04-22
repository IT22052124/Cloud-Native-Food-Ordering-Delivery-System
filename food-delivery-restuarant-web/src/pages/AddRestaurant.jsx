import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { addRestaurant } from "../utils/api";
import { toast } from "react-toastify";
import { FaStore, FaMapMarkerAlt, FaPhone, FaEnvelope, FaUser, FaLock, FaInfoCircle } from "react-icons/fa";
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
  const [isMapLoaded, setIsMapLoaded] = useState(false); // Track if Google Maps API is loaded
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    street: "",
    city: "",
    province: "",
    postalCode: "",
    landmark: "", // Added landmark field
    lat: 6.9271,
    lng: 79.8612,
    phone: "",
    email: "",
    username: "",
    password: "",
    coverImageUrl: "",
    imageUrls: [],
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState({ cover: false, images: false });
  const [uploadError, setUploadError] = useState({ cover: "", images: "" });
  const [uploadProgress, setUploadProgress] = useState({ cover: 0, images: 0 });
  const [markerPosition, setMarkerPosition] = useState(defaultCenter);

  // Handle map click to set marker and coordinates
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
    // Reverse geocode to auto-fill address fields
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

  // Handle marker drag to update coordinates
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
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "lat" || name === "lng" ? parseFloat(value) || 0 : value,
    }));
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
    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    return newErrors;
  };

  // Image upload and delete functions (unchanged)
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
      toast.error("Please fix the form errors");
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
        username: formData.username.trim(),
        password: formData.password,
        coverImageUrl: formData.coverImageUrl,
        imageUrls: formData.imageUrls,
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

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Navbar />
        <div className="p-8 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white flex items-center">
            <FaStore className="mr-2 text-orange-500" />
            Add New Restaurant
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Restaurant Details */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Restaurant Details</h3>
              <div className="space-y-4">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-orange-500 transition-colors duration-200" htmlFor="name">
                    Restaurant Name
                  </label>
                  <div className="relative">
                    <FaStore className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter restaurant name"
                      className={`w-full pl-10 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 ${
                        errors.name ? "border-red-500" : ""
                      }`}
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? "name-error" : undefined}
                    />
                    <div className="absolute inset-y-0 left-0 w-1 bg-orange-500 rounded-l-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
                  </div>
                  {errors.name && (
                    <p id="name-error" className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-orange-500 transition-colors duration-200" htmlFor="description">
                    Description
                  </label>
                  <div className="relative">
                    <FaInfoCircle className="absolute left-3 top-4 text-gray-400" />
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Describe your restaurant"
                      rows="4"
                      className={`w-full pl-10 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 ${
                        errors.description ? "border-red-500" : ""
                      }`}
                      aria-invalid={!!errors.description}
                      aria-describedby={errors.description ? "description-error" : undefined}
                    />
                    <div className="absolute inset-y-0 left-0 w-1 bg-orange-500 rounded-l-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
                  </div>
                  {errors.description && (
                    <p id="description-error" className="text-red-500 text-sm mt-1">{errors.description}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Cover Image */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Cover Image</h3>
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-orange-500 transition-colors duration-200">
                  Restaurant Cover Image
                </label>
                <div className="space-y-4">
                  {formData.coverImageUrl && (
                    <div className="relative mb-4">
                      <img
                        src={formData.coverImageUrl}
                        alt="Cover"
                        className="w-full max-w-xs h-32 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={handleDeleteCoverImage}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  <input
                    type="file"
                    onChange={handleCoverImageChange}
                    accept="image/*"
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                  {uploading.cover && (
                    <div className="w-full bg-gray-200 rounded h-2">
                      <div
                        className="bg-orange-500 h-2 rounded"
                        style={{ width: `${uploadProgress.cover}%` }}
                      ></div>
                    </div>
                  )}
                  {uploadError.cover && <p className="text-red-500">{uploadError.cover}</p>}
                </div>
              </div>
            </div>

            {/* Other Images */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Other Images</h3>
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-orange-500 transition-colors duration-200">
                  Restaurant Images
                </label>
                <div className="space-y-4">
                  {formData.imageUrls.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {formData.imageUrls.map((url, index) => (
                        <div key={index} className="relative">
                          <img
                            src={url}
                            alt={`Restaurant ${index + 1}`}
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
                  {uploading.images && (
                    <div className="w-full bg-gray-200 rounded h-2">
                      <div
                        className="bg-orange-500 h-2 rounded"
                        style={{ width: `${uploadProgress.images}%` }}
                      ></div>
                    </div>
                  )}
                  {uploadError.images && <p className="text-red-500">{uploadError.images}</p>}
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-orange-500 transition-colors duration-200" htmlFor="street">
                    Street
                  </label>
                  <div className="relative">
                    <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      id="street"
                      name="street"
                      value={formData.street}
                      onChange={handleChange}
                      placeholder="Enter street address"
                      className={`w-full pl-10 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 ${
                        errors.street ? "border-red-500" : ""
                      }`}
                      aria-invalid={!!errors.street}
                      aria-describedby={errors.street ? "street-error" : undefined}
                    />
                    <div className="absolute inset-y-0 left-0 w-1 bg-orange-500 rounded-l-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
                  </div>
                  {errors.street && (
                    <p id="street-error" className="text-red-500 text-sm mt-1">{errors.street}</p>
                  )}
                </div>
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-orange-500 transition-colors duration-200" htmlFor="city">
                    City
                  </label>
                  <div className="relative">
                    <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Enter city"
                      className={`w-full pl-10 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 ${
                        errors.city ? "border-red-500" : ""
                      }`}
                      aria-invalid={!!errors.city}
                      aria-describedby={errors.city ? "city-error" : undefined}
                    />
                    <div className="absolute inset-y-0 left-0 w-1 bg-orange-500 rounded-l-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
                  </div>
                  {errors.city && (
                    <p id="city-error" className="text-red-500 text-sm mt-1">{errors.city}</p>
                  )}
                </div>
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-orange-500 transition-colors duration-200" htmlFor="province">
                    Province
                  </label>
                  <div className="relative">
                    <select
                      id="province"
                      name="province"
                      value={formData.province}
                      onChange={handleChange}
                      className={`w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 ${
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
                    <div className="absolute inset-y-0 left-0 w-1 bg-orange-500 rounded-l-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
                  </div>
                  {errors.province && (
                    <p id="province-error" className="text-red-500 text-sm mt-1">{errors.province}</p>
                  )}
                </div>
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-orange-500 transition-colors duration-200" htmlFor="postalCode">
                    Postal Code
                  </label>
                  <div className="relative">
                    <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      placeholder="Enter postal code"
                      className={`w-full pl-10 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 ${
                        errors.postalCode ? "border-red-500" : ""
                      }`}
                      aria-invalid={!!errors.postalCode}
                      aria-describedby={errors.postalCode ? "postalCode-error" : undefined}
                    />
                    <div className="absolute inset-y-0 left-0 w-1 bg-orange-500 rounded-l-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
                  </div>
                  {errors.postalCode && (
                    <p id="postalCode-error" className="text-red-500 text-sm mt-1">{errors.postalCode}</p>
                  )}
                </div>
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-orange-500 transition-colors duration-200" htmlFor="landmark">
                    Landmark (Optional)
                  </label>
                  <div className="relative">
                    <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      id="landmark"
                      name="landmark"
                      value={formData.landmark}
                      onChange={handleChange}
                      placeholder="E.g., Next to ABC Bank"
                      className="w-full pl-10 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    />
                    <div className="absolute inset-y-0 left-0 w-1 bg-orange-500 rounded-l-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Location on Map
                  </label>
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
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-orange-500 transition-colors duration-200" htmlFor="lat">
                    Latitude
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="lat"
                      name="lat"
                      value={formData.lat}
                      readOnly
                      className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 dark:text-white"
                      aria-describedby="lat-help"
                    />
                  </div>
                  <p id="lat-help" className="text-gray-500 text-sm mt-1">
                    Selected latitude from the map.
                  </p>
                </div>
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-orange-500 transition-colors duration-200" htmlFor="lng">
                    Longitude
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="lng"
                      name="lng"
                      value={formData.lng}
                      readOnly
                      className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 dark:text-white"
                      aria-describedby="lng-help"
                    />
                  </div>
                  <p id="lng-help" className="text-gray-500 text-sm mt-1">
                    Selected longitude from the map.
                  </p>
                </div>
                <div className="col-span-2">
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200"
                  >
                    Use My Current Location
                  </button>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-orange-500 transition-colors duration-200" htmlFor="phone">
                    Phone Number
                  </label>
                  <div className="relative">
                    <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                      className={`w-full pl-10 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 ${
                        errors.phone ? "border-red-500" : ""
                      }`}
                      aria-invalid={!!errors.phone}
                      aria-describedby={errors.phone ? "phone-error" : undefined}
                    />
                    <div className="absolute inset-y-0 left-0 w-1 bg-orange-500 rounded-l-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
                  </div>
                  {errors.phone && (
                    <p id="phone-error" className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-orange-500 transition-colors duration-200" htmlFor="email">
                    Email
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter email address"
                      className={`w-full pl-10 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 ${
                        errors.email ? "border-red-500" : ""
                      }`}
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? "email-error" : undefined}
                    />
                    <div className="absolute inset-y-0 left-0 w-1 bg-orange-500 rounded-l-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
                  </div>
                  {errors.email && (
                    <p id="email-error" className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Login Credentials */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Login Credentials</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-orange-500 transition-colors duration-200" htmlFor="username">
                    Username
                  </label>
                  <div className="relative">
                    <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Enter username"
                      className={`w-full pl-10 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 ${
                        errors.username ? "border-red-500" : ""
                      }`}
                      aria-invalid={!!errors.username}
                      aria-describedby={errors.username ? "username-error" : undefined}
                    />
                    <div className="absolute inset-y-0 left-0 w-1 bg-orange-500 rounded-l-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
                  </div>
                  {errors.username && (
                    <p id="username-error" className="text-red-500 text-sm mt-1">{errors.username}</p>
                  )}
                </div>
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-orange-500 transition-colors duration-200" htmlFor="password">
                    Password
                  </label>
                  <div className="relative">
                    <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter password"
                      className={`w-full pl-10 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 ${
                        errors.password ? "border-red-500" : ""
                      }`}
                      aria-invalid={!!errors.password}
                      aria-describedby={errors.password ? "password-error" : undefined}
                    />
                    <div className="absolute inset-y-0 left-0 w-1 bg-orange-500 rounded-l-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
                  </div>
                  {errors.password && (
                    <p id="password-error" className="text-red-500 text-sm mt-1">{errors.password}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || uploading.cover || uploading.images}
                className="px-6 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:from-orange-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
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
                  "Add Restaurant"
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