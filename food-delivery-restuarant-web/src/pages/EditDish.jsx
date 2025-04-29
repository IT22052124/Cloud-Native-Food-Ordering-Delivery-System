import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { getDish, updateDish } from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/DishNavBar';
import DishSidebar from '../components/DishSidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../../firebase-config';

// Define portion-based categories
const portionBasedCategories = ["Appetizers", "Main Course", "Rice Dishes", "Noodles", "Seafood", "Grilled"];

// Zod schema for portions
const portionSchema = zod.object({
  size: zod.string().min(1, 'Size is required'),
  price: zod.number().min(0, 'Price must be positive'),
});

// Updated schema to handle both price and portions dynamically
const schema = zod.object({
  name: zod.string().min(1, 'Name is required'),
  description: zod.string().optional(),
  price: zod.number().min(0, 'Price must be positive').optional().nullable(),
  portions: zod.array(portionSchema).optional().nullable(),
  category: zod.string().min(1, 'Category is required'),
  food_type: zod.string().min(1, 'Food type is required'),
  isAvailable: zod.boolean(),
});

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

// Define available portion sizes (matching backend schema enum)
const portionSizes = ["small", "regular", "large"];

const EditDish = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [imageUrls, setImageUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [pricingType, setPricingType] = useState('single'); // "single" or "portion"
  const [portions, setPortions] = useState([{ size: '', price: '' }]); // Dynamic portions array

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const fetchDish = async () => {
      try {
        const data = await getDish(id);
        const dish = data.dish;
        // Determine pricing type based on fetched dish data
        const isPortionBased = dish.portions && dish.portions.length > 0;
        setPricingType(isPortionBased ? 'portion' : 'single');
        setPortions(
          isPortionBased
            ? dish.portions
            : [{ size: 'regular', price: '' }] // Default portion if switching to portion-based
        );
        reset({
          name: dish.name,
          description: dish.description || '',
          price: dish.price || null,
          portions: isPortionBased ? dish.portions : null,
          category: dish.category || '',
          food_type: dish.food_type || 'veg',
          isAvailable: dish.isAvailable,
        });
        setImageUrls(dish.imageUrls || []);
      } catch (error) {
        toast.error('Failed to fetch dish');
        navigate('/dishes');
      }
      setLoading(false);
    };
    fetchDish();
  }, [id, user, navigate, reset]);

  // Watch category to automatically set pricing type
  const selectedCategory = watch('category');
  useEffect(() => {
    if (selectedCategory && portionBasedCategories.includes(selectedCategory)) {
      setPricingType('portion');
      if (portions.length === 0) {
        setPortions([{ size: 'regular', price: '' }]);
      }
    } else {
      setPricingType('single');
      setPortions([]); // Clear portions if switching to single price
    }
  }, [selectedCategory]);

  // Handle multiple image uploads
  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) {
      setUploadError('Please select at least one image.');
      return;
    }

    const maxImages = 5;
    if (files.length + imageUrls.length > maxImages) {
      setUploadError(`You can upload a maximum of ${maxImages} images.`);
      return;
    }

    try {
      setUploading(true);
      setUploadError('');
      setUploadProgress(0);

      const uploadPromises = files.map(async (file, index) => {
        const storageRef = ref(storage, `images/${file.name}-${Date.now()}-${index}`);
        await uploadBytes(storageRef, file);
        return getDownloadURL(storageRef);
      });

      const newImageUrls = await Promise.all(uploadPromises);
      setImageUrls([...imageUrls, ...newImageUrls]);
      setUploading(false);
      setUploadProgress(100);
    } catch (error) {
      console.error('Error uploading images:', error);
      setUploadError('Failed to upload one or more images.');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle image deletion
  const handleDeleteImage = async (imageUrl) => {
    try {
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
      const updatedImageUrls = imageUrls.filter((url) => url !== imageUrl);
      setImageUrls(updatedImageUrls);
      setUploadError('');
      console.log('Updated imageUrls:', updatedImageUrls); // Debug log
    } catch (error) {
      console.error('Error deleting image:', error);
      setUploadError('Failed to delete image.');
    }
  };

  // Handle adding a new portion
  const addPortion = () => {
    setPortions([...portions, { size: '', price: '' }]);
  };

  // Handle removing a portion
  const removePortion = (index) => {
    const updatedPortions = portions.filter((_, i) => i !== index);
    setPortions(updatedPortions.length > 0 ? updatedPortions : [{ size: '', price: '' }]);
    setValue('portions', updatedPortions.length > 0 ? updatedPortions : null);
  };

  // Handle portion field changes
  const handlePortionChange = (index, field, value) => {
    const updatedPortions = [...portions];
    updatedPortions[index] = { ...updatedPortions[index], [field]: value };
    setPortions(updatedPortions);
    setValue('portions', updatedPortions);
  };

  const onSubmit = async (data) => {
    try {
      const submitData = {
        ...data,
        food_type: data.food_type,
        imageUrls,
        restaurantId: user.restaurantId,
        price: pricingType === 'single' ? Number(data.price) : null,
        portions: pricingType === 'portion' ? portions : null,
      };
      await updateDish(id, submitData);
      toast.success('Dish updated successfully');
      navigate('/dishes');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update dish');
    }
  };

  const isAvailable = watch('isAvailable');

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex min-h-screen">
      <DishSidebar />
      <div className="flex-1 ml-64 bg-white dark:bg-gray-900">
        <Navbar />
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Edit Dish</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Dish Info */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-orange-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white border-b border-orange-200 dark:border-gray-700 pb-2 flex items-center">
                <span className="w-1 h-5 bg-orange-500 rounded-full mr-2"></span>
                Dish Information
              </h3>
              <div className="space-y-6">
                {/* Image Upload and Preview */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Images</label>
                  <div className="space-y-4">
                    {imageUrls.length > 0 && (
                      <div className="flex flex-wrap gap-4 mb-4">
                        {imageUrls.map((url, index) => (
                          <div key={index} className="relative w-40 h-40">
                            <img
                              src={url}
                              alt={`Dish ${index + 1}`}
                              className="w-full h-full object-cover rounded"
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
                      disabled={uploading}
                      className="w-full p-3 border-0 rounded dark:bg-gray-700 dark:text-white"
                    />
                    {uploading && (
                      <div className="w-full bg-gray-200 rounded h-2">
                        <div
                          className="bg-orange-500 h-2 rounded"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    )}
                    {uploadError && <p className="text-red-600 text-sm mt-1">{uploadError}</p>}
                  </div>
                </div>
                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Name</label>
                    <input
                      {...register('name')}
                      className="w-full p-3 border-0 rounded dark:bg-gray-700 dark:text-white"
                    />
                    {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
                  </div>
                  {/* Pricing Type Toggle */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Pricing Type (add 20% margin from base price)</label>
                    <div className="flex space-x-4 bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-300 dark:border-gray-600 mt-2">
                      <label className={`flex-1 p-2 rounded-md cursor-pointer transition-colors duration-200 ${pricingType === 'single' ? 'bg-orange-100 dark:bg-gray-600 border border-orange-300 dark:border-orange-500' : 'hover:bg-gray-50 dark:hover:bg-gray-600'}`}>
                        <div className="flex items-center justify-center">
                          <input
                            type="radio"
                            value="single"
                            checked={pricingType === 'single'}
                            onChange={() => setPricingType('single')}
                            className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 dark:border-gray-600"
                          />
                          <span className={`ml-2 ${pricingType === 'single' ? 'text-orange-600 font-medium dark:text-orange-400' : 'text-gray-700 dark:text-gray-300'}`}>
                            Single Price
                          </span>
                        </div>
                      </label>
                      <label className={`flex-1 p-2 rounded-md cursor-pointer transition-colors duration-200 ${pricingType === 'portion' ? 'bg-orange-100 dark:bg-gray-600 border border-orange-300 dark:border-orange-500' : 'hover:bg-gray-50 dark:hover:bg-gray-600'}`}>
                        <div className="flex items-center justify-center">
                          <input
                            type="radio"
                            value="portion"
                            checked={pricingType === 'portion'}
                            onChange={() => setPricingType('portion')}
                            className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 dark:border-gray-600"
                          />
                          <span className={`ml-2 ${pricingType === 'portion' ? 'text-orange-600 font-medium dark:text-orange-400' : 'text-gray-700 dark:text-gray-300'}`}>
                            Portion Based
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                  {/* Price or Portions */}
                  {pricingType === 'single' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Price (LKR)</label>
                      <input
                        type="number"
                        step="0.01"
                        {...register('price', { valueAsNumber: true })}
                        className="w-full p-3 border-0 rounded dark:bg-gray-700 dark:text-white"
                      />
                      {errors.price && <p className="text-red-600 text-sm mt-1">{errors.price.message}</p>}
                    </div>
                  ) : (
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Portions</label>
                      {portions.map((portion, index) => (
                        <div key={index} className="flex items-center space-x-3 mb-3">
                          <div className="flex-1">
                            <select
                              value={portion.size}
                              onChange={(e) => handlePortionChange(index, 'size', e.target.value)}
                              className="w-full p-3 border-0 rounded dark:bg-gray-700 dark:text-white appearance-none"
                              style={{
                                backgroundImage:
                                  "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                                backgroundPosition: "right 0.75rem center",
                                backgroundRepeat: "no-repeat",
                                backgroundSize: "1.5em 1.5em",
                              }}
                            >
                              <option value="">Select Size</option>
                              {portionSizes.map((size) => (
                                <option key={size} value={size}>
                                  {size.charAt(0).toUpperCase() + size.slice(1)}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="flex-1">
                            <input
                              type="number"
                              step="0.01"
                              placeholder="Price (LKR)"
                              value={portion.price}
                              onChange={(e) => handlePortionChange(index, 'price', Number(e.target.value))}
                              className="w-full p-3 border-0 rounded dark:bg-gray-700 dark:text-white"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removePortion(index)}
                            className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addPortion}
                        className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      >
                        Add Portion
                      </button>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Category</label>
                    <select
                      {...register('category')}
                      className="w-full p-3 border-0 rounded dark:bg-gray-700 dark:text-white appearance-none"
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
                    {errors.category && <p className="text-red-600 text-sm mt-1">{errors.category.message}</p>}
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Food Type</label>
                    <div className="flex space-x-4 bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-300 dark:border-gray-600 mt-2">
                      {foodTypes.map((type) => (
                        <label
                          key={type.value}
                          className={`flex-1 p-3 rounded-md cursor-pointer transition-colors duration-200 ${
                            watch('food_type') === type.value
                              ? 'bg-orange-100 dark:bg-gray-600 border border-orange-300 dark:border-orange-500'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-600'
                          }`}
                        >
                          <div className="flex items-center">
                            <input
                              type="radio"
                              {...register('food_type')}
                              value={type.value}
                              className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 dark:border-gray-600"
                            />
                            <span className="ml-3 flex items-center">
                              <span className="mr-2">{type.icon}</span>
                              <span
                                className={
                                  watch('food_type') === type.value
                                    ? 'text-orange-600 font-medium dark:text-orange-400'
                                    : 'text-gray-700 dark:text-gray-300'
                                }
                              >
                                {type.label}
                              </span>
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                    {errors.food_type && <p className="text-red-600 text-sm mt-1">{errors.food_type.message}</p>}
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Description</label>
                    <textarea
                      {...register('description')}
                      className="w-full p-3 border-0 rounded dark:bg-gray-700 dark:text-white"
                      rows={4}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Available</label>
                    <div className="flex items-center space-x-3 mt-2">
                      <span
                        className={`${
                          isAvailable ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        } font-medium`}
                      >
                        {isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          {...register('isAvailable')}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-500 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <button
              type="submit"
              disabled={uploading}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-all disabled:bg-gray-400"
            >
              Update Dish
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditDish;