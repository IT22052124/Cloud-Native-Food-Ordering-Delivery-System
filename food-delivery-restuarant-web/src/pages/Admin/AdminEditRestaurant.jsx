import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { AdmingetRestaurantById, AdminupdateRestaurant } from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';
import DishNavbar from '../../components/DishNavBar';
import DishSidebar from '../../components/DishSidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from 'react-toastify';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../../../firebase-config';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { FaStore, FaUtensils, FaClock, FaMoneyBill, FaUser, FaPhone, FaMapMarkerAlt, FaImage } from 'react-icons/fa';

// Sri Lankan provinces
const provinces = [
  'Central', 'Eastern', 'Northern', 'North Central', 'North Western',
  'Sabaragamuwa', 'Southern', 'Uva', 'Western',
];

// Sri Lankan banks
const sriLankanBanks = [
  'Bank of Ceylon', "People's Bank", 'Commercial Bank of Ceylon',
  'Hatton National Bank', 'Sampath Bank', 'Nations Trust Bank',
  'Seylan Bank', 'DFCC Bank', 'NDB Bank', 'Union Bank of Colombo',
];

// Cuisine types
const cuisineTypes = ['Indian', 'Chinese', 'Italian', 'Mexican', 'Continental'];

// Days of the week
const daysOfWeek = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
];

// Zod schema for form validation
const schema = zod.object({
  name: zod.string().min(1, 'Name is required'),
  description: zod.string().optional(),
  address: zod.object({
    street: zod.string().min(1, 'Street is required'),
    city: zod.string().min(1, 'City is required'),
    province: zod.enum(provinces, { errorMap: () => ({ message: 'Please select a valid province' }) }),
    postalCode: zod.string().min(1, 'Postal code is required'),
    coordinates: zod.object({
      lat: zod.number().min(-90).max(90, 'Invalid latitude').optional(),
      lng: zod.number().min(-180).max(180, 'Invalid longitude').optional(),
    }),
  }),
  contact: zod.object({
    phone: zod.string().min(1, 'Phone is required'),
    email: zod.string().email('Invalid email').optional().or(zod.literal('')),
  }),
  openingHours: zod
    .array(
      zod.object({
        day: zod.enum(daysOfWeek),
        open: zod.string().optional(),
        close: zod.string().optional(),
        isClosed: zod.boolean(),
      })
    )
    .min(7, 'All days must be specified')
    .max(7, 'Exactly 7 days must be specified'),
  isActive: zod.boolean().optional(),
  menu: zod
    .array(
      zod.object({
        name: zod.string().min(1, 'Menu item name is required'),
        description: zod.string().optional(),
        price: zod.number().min(0, 'Price must be positive'),
        category: zod.string().min(1, 'Category is required'),
      })
    )
    .optional(),
  restaurantAdmin: zod
 .array(
       zod.object({
         username: zod.string().min(1, 'Username is required'),
       })
     )
     .min(1, 'At least one admin is required').optional(),
  bank: zod.object({
    accountNumber: zod.string().optional(),
    accountHolderName: zod.string().optional(),
    bankName: zod.string().optional(),
    branch: zod.string().optional(),
  }).optional(),
  serviceType: zod.object({
    delivery: zod.boolean(),
    pickup: zod.boolean(),
    dineIn: zod.boolean(),
  }).optional(),
  cuisineType: zod.enum(cuisineTypes).optional(),
  estimatedPrepTime: zod.number().min(1, 'Preparation time must be positive').optional(),
});

// Google Maps container style
const mapContainerStyle = {
  width: '100%',
  height: '400px',
};

// Default center (Colombo, Sri Lanka)
const defaultCenter = {
  lat: 6.9271,
  lng: 79.8612,
};

const AdminEditRestaurant = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [imageUrls, setImageUrls] = useState([]);
  const [uploading, setUploading] = useState({ cover: false, images: false });
  const [uploadProgress, setUploadProgress] = useState({ cover: 0, images: 0 });
  const [uploadError, setUploadError] = useState({ cover: '', images: '' });
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [markerPosition, setMarkerPosition] = useState(defaultCenter);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    getValues,
    watch,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      openingHours: daysOfWeek.map((day) => ({
        day,
        open: '',
        close: '',
        isClosed: false,
      })),
    },
  });

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Watch openingHours for conditional rendering
  const openingHours = watch('openingHours');

  // Fetch restaurant data
  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const data = await AdmingetRestaurantById(id);
        reset({
          name: data.name || '',
          description: data.description || '',
          address: {
            street: data.address?.street || '',
            city: data.address?.city || '',
            province: data.address?.province || '',
            postalCode: data.address?.postalCode || '',
            coordinates: {
              lat: data.address?.coordinates?.lat || defaultCenter.lat,
              lng: data.address?.coordinates?.lng || defaultCenter.lng,
            },
          },
          contact: {
            phone: data.contact?.phone || '',
            email: data.contact?.email || '',
          },
          openingHours: daysOfWeek.map((day) => {
            const hours = data.openingHours?.find((h) => h.day === day) || {};
            return {
              day,
              open: hours.open || '',
              close: hours.close || '',
              isClosed: hours.isClosed || false,
            };
          }),
          bank: {
            accountNumber: data.bank?.accountNumber || '',
            accountHolderName: data.bank?.accountHolderName || '',
            bankName: data.bank?.bankName || '',
            branch: data.bank?.branch || '',
          },
          serviceType: {
            delivery: data.serviceType?.delivery ?? true,
            pickup: data.serviceType?.pickup ?? true,
            dineIn: data.serviceType?.dineIn ?? true,
          },
          cuisineType: data.cuisineType || 'Indian',
          estimatedPrepTime: data.estimatedPrepTime || 20,
          restaurantAdmin: data.restaurantAdmin?.length > 0 ? data.restaurantAdmin.map(admin => ({ username: admin.username })) : [{ username: '' }],
        });
        setCoverImageUrl(data.coverImageUrl || '');
        setImageUrls(data.imageUrls || []);
        setMarkerPosition({
          lat: data.address?.coordinates?.lat || defaultCenter.lat,
          lng: data.address?.coordinates?.lng || defaultCenter.lng,
        });
      } catch (error) {
        toast.error('Failed to fetch restaurant');
        navigate('/restaurants/admin');
      }
      setLoading(false);
    };
    fetchRestaurant();
  }, [id, user, navigate, reset]);

  // Handle map click to set marker and autofill address
  const handleMapClick = useCallback(
    (event) => {
      const newLat = event.latLng.lat();
      const newLng = event.latLng.lng();
      setMarkerPosition({ lat: newLat, lng: newLng });
      setValue('address.coordinates.lat', newLat, { shouldValidate: true });
      setValue('address.coordinates.lng', newLng, { shouldValidate: true });

      fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${newLat},${newLng}&key=${apiKey}`
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.results && data.results[0]) {
            const addressComponents = data.results[0].address_components;
            let street = '';
            let city = '';
            let province = '';
            let postalCode = '';

            addressComponents.forEach((component) => {
              if (component.types.includes('route')) street = component.long_name;
              if (component.types.includes('locality')) city = component.long_name;
              if (component.types.includes('administrative_area_level_1')) province = component.long_name;
              if (component.types.includes('postal_code')) postalCode = component.long_name;
            });

            setValue('address.street', street || getValues('address.street'), { shouldValidate: true });
            setValue('address.city', city || getValues('address.city'), { shouldValidate: true });
            setValue('address.province', provinces.includes(province) ? province : getValues('address.province'), {
              shouldValidate: true,
            });
            setValue('address.postalCode', postalCode || getValues('address.postalCode'), { shouldValidate: true });
            toast.info('Address auto-filled from selected location');
          } else {
            toast.error('No address details found');
          }
        })
        .catch((error) => {
          toast.error('Failed to fetch address details');
        });
    },
    [apiKey, setValue, getValues]
  );

  // Handle marker drag to update coordinates
  const handleMarkerDragEnd = useCallback(
    (event) => {
      const newLat = event.latLng.lat();
      const newLng = event.latLng.lng();
      setMarkerPosition({ lat: newLat, lng: newLng });
      setValue('address.coordinates.lat', newLat, { shouldValidate: true });
      setValue('address.coordinates.lng', newLng, { shouldValidate: true });
    },
    [setValue]
  );

  // Handle cover image upload
  const handleCoverImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      setUploadError((prev) => ({ ...prev, cover: 'Please select a cover image.' }));
      return;
    }

    try {
      setUploading((prev) => ({ ...prev, cover: true }));
      setUploadError((prev) => ({ ...prev, cover: '' }));
      setUploadProgress((prev) => ({ ...prev, cover: 0 }));

      const storageRef = ref(storage, `restaurant_cover_images/${file.name}-${Date.now()}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      setCoverImageUrl(url);
      setUploading((prev) => ({ ...prev, cover: false }));
      setUploadProgress((prev) => ({ ...prev, cover: 100 }));
    } catch (error) {
      setUploadError((prev) => ({ ...prev, cover: 'Failed to upload cover image.' }));
      setUploading((prev) => ({ ...prev, cover: false }));
      setUploadProgress((prev) => ({ ...prev, cover: 0 }));
    }
  };

  // Handle deletion of cover image
  const handleDeleteCoverImage = async () => {
    if (!coverImageUrl) return;

    try {
      const imageRef = ref(storage, coverImageUrl);
      await deleteObject(imageRef);
      setCoverImageUrl('');
      setUploadError((prev) => ({ ...prev, cover: '' }));
    } catch (error) {
      setUploadError((prev) => ({ ...prev, cover: 'Failed to delete cover image.' }));
    }
  };

  // Handle multiple image uploads
  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) {
      setUploadError((prev) => ({ ...prev, images: 'Please select at least one image.' }));
      return;
    }

    const maxImages = 5;
    if (files.length + imageUrls.length > maxImages) {
      setUploadError((prev) => ({ ...prev, images: `You can upload a maximum of ${maxImages} images.` }));
      return;
    }

    try {
      setUploading((prev) => ({ ...prev, images: true }));
      setUploadError((prev) => ({ ...prev, images: '' }));
      setUploadProgress((prev) => ({ ...prev, images: 0 }));

      const uploadPromises = files.map(async (file, index) => {
        const storageRef = ref(storage, `restaurant_images/${file.name}-${Date.now()}-${index}`);
        await uploadBytes(storageRef, file);
        return getDownloadURL(storageRef);
      });

      const newImageUrls = await Promise.all(uploadPromises);
      setImageUrls([...imageUrls, ...newImageUrls]);
      setUploading((prev) => ({ ...prev, images: false }));
      setUploadProgress((prev) => ({ ...prev, images: 100 }));
    } catch (error) {
      setUploadError((prev) => ({ ...prev, images: 'Failed to upload one or more images.' }));
      setUploading((prev) => ({ ...prev, images: false }));
      setUploadProgress((prev) => ({ ...prev, images: 0 }));
    }
  };

  // Handle image deletion
  const handleDeleteImage = async (imageUrl) => {
    try {
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
      setImageUrls(imageUrls.filter((url) => url !== imageUrl));
      setUploadError((prev) => ({ ...prev, images: '' }));
    } catch (error) {
      setUploadError((prev) => ({ ...prev, images: 'Failed to delete image.' }));
    }
  };

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      await AdminupdateRestaurant(id, {
        ...data,
        coverImageUrl,
        imageUrls,
      });
      toast.success('Restaurant updated successfully');
      navigate('/restaurants/admin');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update restaurant');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!apiKey) {
    toast.error('Google Maps API key is missing.');
    return <div className="text-red-600 p-6 dark:text-red-400">Error: Google Maps API key is missing.</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <DishSidebar />
      <div className="flex-1 ml-64">
        <DishNavbar />
        <div className="p-8">
          <h2 className="text-3xl font-bold mb-8 dark:text-white flex items-center">
            <FaStore className="mr-3 text-orange-500" />
            Edit Restaurant
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Restaurant Details Section */}
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-orange-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold mb-6 dark:text-white flex items-center">
                <FaUtensils className="mr-2 text-orange-500" />
                Restaurant Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-gray-700 mb-2 dark:text-gray-300 group-focus-within:text-orange-500 transition-colors duration-200">
                    Name*
                  </label>
                  <div className="relative">
                    <FaStore className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    <input
                      {...register('name')}
                      className="w-full pl-10 p-3 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    />
                    <div className="absolute inset-y-0 left-0 w-1 bg-orange-500 rounded-l-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
                  </div>
                  {errors.name && <p className="text-red-600 dark:text-red-400">{errors.name.message}</p>}
                </div>
                <div className="group">
                  <label className="block text-gray-700 mb-2 dark:text-gray-300 group-focus-within:text-orange-500 transition-colors duration-200">
                    Cuisine Type
                  </label>
                  <div className="relative">
                    <FaUtensils className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    <select
                      {...register('cuisineType')}
                      className="w-full pl-10 p-3 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="">Select a cuisine</option>
                      {cuisineTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 left-0 w-1 bg-orange-500 rounded-l-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
                  </div>
                  {errors.cuisineType && <p className="text-red-600 dark:text-red-400">{errors.cuisineType.message}</p>}
                </div>
                <div className="group">
                  <label className="block text-gray-700 mb-2 dark:text-gray-300 group-focus-within:text-orange-500 transition-colors duration-200">
                    Description
                  </label>
                  <div className="relative">
                    <textarea
                      {...register('description')}
                      className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                      rows={4}
                    />
                    <div className="absolute inset-y-0 left-0 w-1 bg-orange-500 rounded-l-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
                  </div>
                </div>
                <div className="group">
                  <label className="block text-gray-700 mb-2 dark:text-gray-300 group-focus-within:text-orange-500 transition-colors duration-200">
                    Estimated Preparation Time (minutes)
                  </label>
                  <div className="relative">
                    <FaClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    <input
                      type="number"
                      {...register('estimatedPrepTime', { valueAsNumber: true })}
                      className="w-full pl-10 p-3 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                      min="1"
                    />
                    <div className="absolute inset-y-0 left-0 w-1 bg-orange-500 rounded-l-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
                  </div>
                  {errors.estimatedPrepTime && (
                    <p className="text-red-600 dark:text-red-400">{errors.estimatedPrepTime.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Images Section */}
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-orange-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold mb-6 dark:text-white flex items-center">
                <FaImage className="mr-2 text-orange-500" />
                Images
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-700 mb-2 dark:text-gray-300">Cover Image</label>
                  <div className="space-y-4">
                    {coverImageUrl && (
                      <div className="relative w-48 h-48">
                        <img
                          src={coverImageUrl}
                          alt="Cover"
                          className="w-full h-full object-cover rounded-xl shadow-md"
                        />
                        <button
                          type="button"
                          onClick={handleDeleteCoverImage}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-all duration-200"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                    <input
                      type="file"
                      onChange={handleCoverImageChange}
                      accept="image/*"
                      disabled={uploading.cover}
                      className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-200 dark:bg-gray-700"
                    />
                    {uploading.cover && (
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded h-2">
                        <div
                          className="bg-orange-500 h-2 rounded"
                          style={{ width: `${uploadProgress.cover}%` }}
                        ></div>
                      </div>
                    )}
                    {uploadError.cover && <p className="text-red-600 dark:text-red-400">{uploadError.cover}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 dark:text-gray-300">Other Images</label>
                  <div className="space-y-4">
                    {imageUrls.length > 0 && (
                      <div className="flex flex-wrap gap-4">
                        {imageUrls.map((url, index) => (
                          <div key={index} className="relative w-48 h-48">
                            <img
                              src={url}
                              alt={`Restaurant ${index + 1}`}
                              className="w-full h-full object-cover rounded-xl shadow-md"
                            />
                            <button
                              type="button"
                              onClick={() => handleDeleteImage(url)}
                              className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-all duration-200"
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
                      disabled={uploading.images}
                      className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-200 dark:bg-gray-700"
                    />
                    {uploading.images && (
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded h-2">
                        <div
                          className="bg-orange-500 h-2 rounded"
                          style={{ width: `${uploadProgress.images}%` }}
                        ></div>
                      </div>
                    )}
                    {uploadError.images && <p className="text-red-600 dark:text-red-400">{uploadError.images}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-orange-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold mb-6 dark:text-white flex items-center">
                <FaMapMarkerAlt className="mr-2 text-orange-500" />
                Address
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-gray-700 mb-2 dark:text-gray-300 group-focus-within:text-orange-500 transition-colors duration-200">
                    Street*
                  </label>
                  <div className="relative">
                    <input
                      {...register('address.street')}
                      className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    />
                    <div className="absolute inset-y-0 left-0 w-1 bg-orange-500 rounded-l-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
                  </div>
                  {errors.address?.street && (
                    <p className="text-red-600 dark:text-red-400">{errors.address.street.message}</p>
                  )}
                </div>
                <div className="group">
                  <label className="block text-gray-700 mb-2 dark:text-gray-300 group-focus-within:text-orange-500 transition-colors duration-200">
                    City*
                  </label>
                  <div className="relative">
                    <input
                      {...register('address.city')}
                      className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    />
                    <div className="absolute inset-y-0 left-0 w-1 bg-orange-500 rounded-l-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
                  </div>
                  {errors.address?.city && (
                    <p className="text-red-600 dark:text-red-400">{errors.address.city.message}</p>
                  )}
                </div>
                <div className="group">
                  <label className="block text-gray-700 mb-2 dark:text-gray-300 group-focus-within:text-orange-500 transition-colors duration-200">
                    Province*
                  </label>
                  <div className="relative">
                    <select
                      {...register('address.province')}
                      className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="">Select a province</option>
                      {provinces.map((province) => (
                        <option key={province} value={province}>
                          {province}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 left-0 w-1 bg-orange-500 rounded-l-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
                  </div>
                  {errors.address?.province && (
                    <p className="text-red-600 dark:text-red-400">{errors.address.province.message}</p>
                  )}
                </div>
                <div className="group">
                  <label className="block text-gray-700 mb-2 dark:text-gray-300 group-focus-within:text-orange-500 transition-colors duration-200">
                    Postal Code*
                  </label>
                  <div className="relative">
                    <input
                      {...register('address.postalCode')}
                      className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    />
                    <div className="absolute inset-y-0 left-0 w-1 bg-orange-500 rounded-l-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
                  </div>
                  {errors.address?.postalCode && (
                    <p className="text-red-600 dark:text-red-400">{errors.address.postalCode.message}</p>
                  )}
                </div>
                <div className="col-span-2">
                  <label className="block text-gray-700 mb-2 dark:text-gray-300">Select Location on Map</label>
                  <div style={{ width: '100%', height: '400px' }}>
                    <LoadScript
                      googleMapsApiKey={apiKey}
                      onLoad={() => setIsMapLoaded(true)}
                      onError={() => {
                        toast.error('Failed to load Google Maps API');
                        setIsMapLoaded(false);
                      }}
                    >
                      {isMapLoaded ? (
                        <GoogleMap
                          key={`${markerPosition.lat}-${markerPosition.lng}`}
                          mapContainerStyle={mapContainerStyle}
                          center={markerPosition}
                          zoom={15}
                          onClick={handleMapClick}
                        >
                          <Marker position={markerPosition} draggable onDragEnd={handleMarkerDragEnd} />
                        </GoogleMap>
                      ) : (
                        <div className="flex items-center justify-center h-full bg-gray-200 dark:bg-gray-700 rounded-xl">
                          Loading map...
                        </div>
                      )}
                    </LoadScript>
                  </div>
                </div>
                <div className="group">
                  <label className="block text-gray-700 mb-2 dark:text-gray-300 group-focus-within:text-orange-500 transition-colors duration-200">
                    Latitude
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      {...register('address.coordinates.lat', { valueAsNumber: true })}
                      className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-200 dark:bg-gray-700 bg-gray-100 dark:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                      readOnly
                    />
                    <div className="absolute inset-y-0 left-0 w-1 bg-orange-500 rounded-l-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
                  </div>
                  {errors.address?.coordinates?.lat && (
                    <p className="text-red-600 dark:text-red-400">{errors.address.coordinates.lat.message}</p>
                  )}
                </div>
                <div className="group">
                  <label className="block text-gray-700 mb-2 dark:text-gray-300 group-focus-within:text-orange-500 transition-colors duration-200">
                    Longitude
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      {...register('address.coordinates.lng', { valueAsNumber: true })}
                      className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-200 dark:bg-gray-700 bg-gray-100 dark:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                      readOnly
                    />
                    <div className="absolute inset-y-0 left-0 w-1 bg-orange-500 rounded-l-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
                  </div>
                  {errors.address?.coordinates?.lng && (
                    <p className="text-red-600 dark:text-red-400">{errors.address.coordinates.lng.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-orange-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold mb-6 dark:text-white flex items-center">
                <FaPhone className="mr-2 text-orange-500" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-gray-700 mb-2 dark:text-gray-300 group-focus-within:text-orange-500 transition-colors duration-200">
                    Phone*
                  </label>
                  <div className="relative">
                    <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    <input
                      {...register('contact.phone')}
                      className="w-full pl-10 p-3 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    />
                    <div className="absolute inset-y-0 left-0 w-1 bg-orange-500 rounded-l-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
                  </div>
                  {errors.contact?.phone && (
                    <p className="text-red-600 dark:text-red-400">{errors.contact.phone.message}</p>
                  )}
                </div>
                <div className="group">
                  <label className="block text-gray-700 mb-2 dark:text-gray-300 group-focus-within:text-orange-500 transition-colors duration-200">
                    Email
                  </label>
                  <div className="relative">
                    <input
                      {...register('contact.email')}
                      className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    />
                    <div className="absolute inset-y-0 left-0 w-1 bg-orange-500 rounded-l-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
                  </div>
                  {errors.contact?.email && (
                    <p className="text-red-600 dark:text-red-400">{errors.contact.email.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Opening Hours */}
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-orange-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold mb-6 dark:text-white flex items-center">
                <FaClock className="mr-2 text-orange-500" />
                Opening Hours
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Specify the opening and closing times for each day, or mark a day as closed.
              </p>
              <div className="space-y-6">
                {daysOfWeek.map((day, index) => (
                  <div key={day} className="border-b border-gray-200 dark:border-gray-600 pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300">{day}</h4>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          {...register(`openingHours.${index}.isClosed`)}
                          className="h-5 w-5 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                        />
                        <label className="text-gray-700 dark:text-gray-300">Closed</label>
                      </div>
                    </div>
                    {!openingHours[index]?.isClosed && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="group">
                          <label className="block text-gray-700 mb-2 dark:text-gray-300 group-focus-within:text-orange-500 transition-colors duration-200">
                            Opening Time
                          </label>
                          <div className="relative">
                            <FaClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                            <input
                              type="time"
                              {...register(`openingHours.${index}.open`)}
                              className="w-full pl-10 p-3 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                            />
                            <div className="absolute inset-y-0 left-0 w-1 bg-orange-500 rounded-l-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
                          </div>
                          {errors.openingHours?.[index]?.open && (
                            <p className="text-red-600 dark:text-red-400">{errors.openingHours[index].open.message}</p>
                          )}
                        </div>
                        <div className="group">
                          <label className="block text-gray-700 mb-2 dark:text-gray-300 group-focus-within:text-orange-500 transition-colors duration-200">
                            Closing Time
                          </label>
                          <div className="relative">
                            <FaClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                            <input
                              type="time"
                              {...register(`openingHours.${index}.close`)}
                              className="w-full pl-10 p-3 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                            />
                            <div className="absolute inset-y-0 left-0 w-1 bg-orange-500 rounded-l-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
                          </div>
                          {errors.openingHours?.[index]?.close && (
                            <p className="text-red-600 dark:text-red-400">{errors.openingHours[index].close.message}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {errors.openingHours && (
                <p className="text-red-600 dark:text-red-400 mt-2">{errors.openingHours.message}</p>
              )}
            </div>

            {/* Bank Details */}
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-orange-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold mb-6 dark:text-white flex items-center">
                <FaMoneyBill className="mr-2 text-orange-500" />
                Bank Details (Optional)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-gray-700 mb-2 dark:text-gray-300 group-focus-within:text-orange-500 transition-colors duration-200">
                    Account Number
                  </label>
                  <div className="relative">
                    <FaMoneyBill className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    <input
                      {...register('bank.accountNumber')}
                      className="w-full pl-10 p-3 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    />
                    <div className="absolute inset-y-0 left-0 w-1 bg-orange-500 rounded-l-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
                  </div>
                  {errors.bank?.accountNumber && (
                    <p className="text-red-600 dark:text-red-400">{errors.bank.accountNumber.message}</p>
                  )}
                </div>
                <div className="group">
                  <label className="block text-gray-700 mb-2 dark:text-gray-300 group-focus-within:text-orange-500 transition-colors duration-200">
                    Account Holder Name
                  </label>
                  <div className="relative">
                    <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    <input
                      {...register('bank.accountHolderName')}
                      className="w-full pl-10 p-3 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    />
                    <div className="absolute inset-y-0 left-0 w-1 bg-orange-500 rounded-l-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
                  </div>
                  {errors.bank?.accountHolderName && (
                    <p className="text-red-600 dark:text-red-400">{errors.bank.accountHolderName.message}</p>
                  )}
                </div>
                <div className="group">
                  <label className="block text-gray-700 mb-2 dark:text-gray-300 group-focus-within:text-orange-500 transition-colors duration-200">
                    Bank Name
                  </label>
                  <div className="relative">
                    <FaMoneyBill className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    <select
                      {...register('bank.bankName')}
                      className="w-full pl-10 p-3 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="">Select a bank</option>
                      {sriLankanBanks.map((bank) => (
                        <option key={bank} value={bank}>
                          {bank}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 left-0 w-1 bg-orange-500 rounded-l-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
                  </div>
                  {errors.bank?.bankName && (
                    <p className="text-red-600 dark:text-red-400">{errors.bank.bankName.message}</p>
                  )}
                </div>
                <div className="group">
                  <label className="block text-gray-700 mb-2 dark:text-gray-300 group-focus-within:text-orange-500 transition-colors duration-200">
                    Branch
                  </label>
                  <div className="relative">
                    <FaMoneyBill className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    <input
                      {...register('bank.branch')}
                      className="w-full pl-10 p-3 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    />
                    <div className="absolute inset-y-0 left-0 w-1 bg-orange-500 rounded-l-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
                  </div>
                  {errors.bank?.branch && (
                    <p className="text-red-600 dark:text-red-400">{errors.bank.branch.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Service Types */}
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-orange-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold mb-6 dark:text-white flex items-center">
                <FaUtensils className="mr-2 text-orange-500" />
                Service Types
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('serviceType.delivery')}
                    className="h-5 w-5 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Delivery
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('serviceType.pickup')}
                    className="h-5 w-5 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Pickup
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('serviceType.dineIn')}
                    className="h-5 w-5 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Dine-In
                  </label>
                </div>
              </div>
              {errors.serviceType && (
                <p className="text-red-600 dark:text-red-400">{errors.serviceType.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/restaurants/admin')}
                className="px-6 py-3 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-xl hover:bg-gray-400 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all duration-200 shadow-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading.cover || uploading.images}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl hover:from-orange-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200 shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Update Restaurant
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminEditRestaurant;