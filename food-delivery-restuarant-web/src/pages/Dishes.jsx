import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getDishes, deleteDish } from '../utils/api';
import DishTable from '../components/DishTable';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';

const Dishes = () => {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'restaurantAdmin') {
      navigate('/restaurant-admin/login');
      return;
    }
    const fetchDishes = async () => {
      try {
        const data = await getDishes(user.restaurantId);
        setDishes(data);
      } catch (error) {
        toast.error('Failed to fetch dishes');
      }
      setLoading(false);
    };
    fetchDishes();
  }, [user, navigate]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this dish?')) {
      try {
        await deleteDish(id);
        setDishes(dishes.filter((d) => d._id !== id));
        toast.success('Dish deleted');
      } catch (error) {
        toast.error('Failed to delete dish');
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 dark:text-white">Manage Dishes</h2>
          <div className="mb-4">
            <button
              onClick={() => navigate('/dishes/add')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Add Dish
            </button>
          </div>
          <DishTable dishes={dishes} onDelete={handleDelete} />
        </div>
      </div>
    </div>
  );
};

export default Dishes;