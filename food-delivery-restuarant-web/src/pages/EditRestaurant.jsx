import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { getRestaurant, updateRestaurant } from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';

const schema = zod.object({
  name: zod.string().min(1, 'Name is required'),
  description: zod.string().optional(),
  address: zod.object({
    street: zod.string().min(1, 'Street is required'),
    city: zod.string().min(1, 'City is required'),
    province: zod.string().min(1, 'Province is required'),
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
  openingHours: zod.object({
    open: zod.string().min(1, 'Open time is required'),
    close: zod.string().min(1, 'Close time is required'),
    isClosed: zod.boolean(),
  }).optional(),
  isActive: zod.boolean().optional(),
  menu: zod.array(zod.object({
    name: zod.string().min(1, 'Menu item name is required'),
    description: zod.string().optional(),
    price: zod.number().min(0, 'Price must be positive'),
    category: zod.string().min(1, 'Category is required'),
  })).optional(),
  restaurantAdmin: zod.object({
    username: zod.string().min(1, 'Username is required'),
    email: zod.string().email('Invalid email').optional(),
  }).optional(),
});

const EditRestaurant = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
  } = useForm({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    console.log('Form values on render:', getValues());
  }, [getValues]);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const data = await getRestaurant(id);
        console.log('Fetched restaurant data:', data);
        reset({
          name: data.name || '',
          description: data.description || '',
          address: {
            street: data.address?.street || '',
            city: data.address?.city || '',
            province: data.address?.province || '',
            postalCode: data.address?.postalCode || '',
            coordinates: {
              lat: data.address?.coordinates?.lat || 0,
              lng: data.address?.coordinates?.lng || 0,
            },
          },
          contact: {
            phone: data.contact?.phone || '',
            email: data.contact?.email || '',
          },
          openingHours: {
            open: data.openingHours?.open || '',
            close: data.openingHours?.close || '',
            isClosed: data.openingHours?.isClosed || false,
          },
          // restaurantAdmin: {
          //   username: data.restaurantAdmin?.username || '',
          //   email: data.restaurantAdmin?.email || '',
          // },
        });
      } catch (error) {
        console.error('Fetch error:', error);
        toast.error('Failed to fetch restaurant');
        navigate('/dashboard');
      }
      setLoading(false);
    };
    fetchRestaurant();
  }, [id, user, navigate, reset]);

  const onSubmit = async (data, event) => {
    console.log('onSubmit called with:', { data, event });
    if (!data) {
      console.error('Form data is undefined');
      toast.error('Please fill out the form');
      return;
    }
    console.log('Submitting data:', JSON.stringify(data, null, 2));
    try {
      await updateRestaurant(id, data);
      toast.success('Restaurant updated successfully');
      navigate('/dashboard');
    } catch (error) {
      console.error('Update error:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to update restaurant');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Navbar />
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 dark:text-white">Edit Restaurant</h2>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
            onSubmitCapture={() => console.log('Form submitted')}
          >
            {/* Basic Information Section */}
            <div className="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
              <h3 className="text-lg font-semibold mb-4 dark:text-white">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2 dark:text-gray-300">Name*</label>
                  <input
                    {...register('name')}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
                  />
                  {errors.name && <p className="text-red-600 dark:text-red-400">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 dark:text-gray-300">Description</label>
                  <textarea
                    {...register('description')}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div className="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
              <h3 className="text-lg font-semibold mb-4 dark:text-white">Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2 dark:text-gray-300">Street*</label>
                  <input
                    {...register('address.street')}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
                  />
                  {errors.address?.street && <p className="text-red-600 dark:text-red-400">{errors.address.street.message}</p>}
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 dark:text-gray-300">City*</label>
                  <input
                    {...register('address.city')}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
                  />
                  {errors.address?.city && <p className="text-red-600 dark:text-red-400">{errors.address.city.message}</p>}
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 dark:text-gray-300">Province*</label>
                  <input
                    {...register('address.province')}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
                  />
                  {errors.address?.province && <p className="text-red-600 dark:text-red-400">{errors.address.province.message}</p>}
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 dark:text-gray-300">Postal Code*</label>
                  <input
                    {...register('address.postalCode')}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
                  />
                  {errors.address?.postalCode && <p className="text-red-600 dark:text-red-400">{errors.address.postalCode.message}</p>}
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 dark:text-gray-300">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    {...register('address.coordinates.lat', { valueAsNumber: true })}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
                  />
                  {errors.address?.coordinates?.lat && <p className="text-red-600 dark:text-red-400">{errors.address.coordinates.lat.message}</p>}
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 dark:text-gray-300">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    {...register('address.coordinates.lng', { valueAsNumber: true })}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
                  />
                  {errors.address?.coordinates?.lng && <p className="text-red-600 dark:text-red-400">{errors.address.coordinates.lng.message}</p>}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
              <h3 className="text-lg font-semibold mb-4 dark:text-white">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2 dark:text-gray-300">Phone*</label>
                  <input
                    {...register('contact.phone')}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
                  />
                  {errors.contact?.phone && <p className="text-red-600 dark:text-red-400">{errors.contact.phone.message}</p>}
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 dark:text-gray-300">Email</label>
                  <input
                    {...register('contact.email')}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
                  />
                  {errors.contact?.email && <p className="text-red-600 dark:text-red-400">{errors.contact.email.message}</p>}
                </div>
              </div>
            </div>

            {/* Opening Hours */}
            <div className="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
              <h3 className="text-lg font-semibold mb-4 dark:text-white">Opening Hours</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2 dark:text-gray-300">Open Time*</label>
                  <input
                    {...register('openingHours.open')}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
                  />
                  {errors.openingHours?.open && <p className="text-red-600 dark:text-red-400">{errors.openingHours.open.message}</p>}
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 dark:text-gray-300">Close Time*</label>
                  <input
                    {...register('openingHours.close')}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
                  />
                  {errors.openingHours?.close && <p className="text-red-600 dark:text-red-400">{errors.openingHours.close.message}</p>}
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 dark:text-gray-300">Closed</label>
                  <input
                    type="checkbox"
                    {...register('openingHours.isClosed')}
                    className="w-5 h-5"
                  />
                </div>
              </div>
            </div>

            {/* Restaurant Admin
            <div className="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
              <h3 className="text-lg font-semibold mb-4 dark:text-white">Restaurant Admin</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2 dark:text-gray-300">Admin Username</label>
                  <input
                    {...register('restaurantAdmin.0.username')}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
                  />
                  {errors.restaurantAdmin?.username && <p className="text-red-600 dark:text-red-400">{errors.restaurantAdmin.username.message}</p>}
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 dark:text-gray-300">Admin Email</label>
                  <input
                    {...register('restaurantAdmin.0.password')}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
                  />
                  {errors.restaurantAdmin?.email && <p className="text-red-600 dark:text-red-400">{errors.restaurantAdmin.email.message}</p>}
                </div>
              </div>
            </div> */}

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200"
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

export default EditRestaurant;