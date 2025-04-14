import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { getDish, updateDish } from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';

const schema = zod.object({
  name: zod.string().min(1, 'Name is required'),
  description: zod.string().optional(),
  price: zod.number().min(0, 'Price must be positive'),
  isAvailable: zod.boolean(),
  media: zod.array(
    zod.object({
      url: zod.string().url('Invalid URL').optional(),
      alt_text: zod.string().optional(),
    })
  ).optional(),
});

const EditDish = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (!user || user.role !== 'restaurantAdmin') {
      navigate('/restaurant-admin/login');
      return;
    }
    const fetchDish = async () => {
      try {
        const data = await getDish(id);
        reset({
          ...data,
          media: data.media?.length > 0 ? data.media : [{ url: '', alt_text: '' }],
        });
      } catch (error) {
        toast.error('Failed to fetch dish');
        navigate('/dishes');
      }
      setLoading(false);
    };
    fetchDish();
  }, [id, user, navigate, reset]);

  const onSubmit = async (data) => {
    try {
      await updateDish(id, {
        ...data,
        restaurantId: user.restaurantId,
      });
      toast.success('Dish updated successfully');
      navigate('/dishes');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update dish');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 dark:text-white">Edit Dish</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2 dark:text-gray-300">Name</label>
                <input
                  {...register('name')}
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
                />
                {errors.name && <p className="text-red-600 dark:text-red-400">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-gray-700 mb-2 dark:text-gray-300">Description</label>
                <textarea
                  {...register('description')}
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
                ></textarea>
              </div>
              <div>
                <label className="block text-gray-700 mb-2 dark:text-gray-300">Price (LKR)</label>
                <input
                  type="number"
                  step="0.01"
                  {...register('price', { valueAsNumber: true })}
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
                />
                {errors.price && <p className="text-red-600 dark:text-red-400">{errors.price.message}</p>}
              </div>
              <div>
                <label className="block text-gray-700 mb-2 dark:text-gray-300">Available</label>
                <input
                  type="checkbox"
                  {...register('isAvailable')}
                  className="p-3"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2 dark:text-gray-300">Media URL</label>
                <input
                  {...register('media.0.url')}
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
                />
                {errors.media?.[0]?.url && <p className="text-red-600 dark:text-red-400">{errors.media[0].url.message}</p>}
              </div>
              <div>
                <label className="block text-gray-700 mb-2 dark:text-gray-300">Media Alt Text</label>
                <input
                  {...register('media.0.alt_text')}
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <button
              type="submit"
              className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
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