import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { getDish, updateDish } from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import DishSidebar from '../components/DishSidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../../firebase-config';

const schema = zod.object({
  name: zod.string().min(1, 'Name is required'),
  description: zod.string().optional(),
  price: zod.number().min(0, 'Price must be positive'),
  isAvailable: zod.boolean(),
});

const EditDish = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [imageUrls, setImageUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const fetchDish = async () => {
      try {
        const data = await getDish(id);
        reset({
          name: data.dish.name,
          description: data.dish.description || '',
          price: data.dish.price,
          isAvailable: data.dish.isAvailable,
        });
        setImageUrls(data.dish.imageUrls || []);
      } catch (error) {
        toast.error('Failed to fetch dish');
        navigate('/dishes');
      }
      setLoading(false);
    };
    fetchDish();
  }, [id, user, navigate, reset]);

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

  const onSubmit = async (data) => {
    try {
      await updateDish(id, {
        ...data,
        imageUrls,
        restaurantId: user.restaurantId,
      });
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
                      className="w-full p-3 border rounded dark:bg-gray-700 dark:text-white"
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
                      className="w-full p-3 border rounded dark:bg-gray-700 dark:text-white"
                    />
                    {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Price (LKR)</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('price', { valueAsNumber: true })}
                      className="w-full p-3 border rounded dark:bg-gray-700 dark:text-white"
                    />
                    {errors.price && <p className="text-red-600 text-sm mt-1">{errors.price.message}</p>}
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Description</label>
                    <textarea
                      {...register('description')}
                      className="w-full p-3 border rounded dark:bg-gray-700 dark:text-white"
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
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-500 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
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