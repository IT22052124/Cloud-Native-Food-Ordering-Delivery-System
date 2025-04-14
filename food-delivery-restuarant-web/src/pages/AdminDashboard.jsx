import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getDishes, getOrders } from '../utils/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const [dishes, setDishes] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'restaurantAdmin') {
      navigate('/restaurant-admin/login');
      return;
    }
    const fetchData = async () => {
      try {
        const [dishData, orderData] = await Promise.all([
          getDishes(user.restaurantId),
          getOrders(),
        ]);
        setDishes(dishData);
        setOrders(orderData);
      } catch (error) {
        toast.error('Failed to fetch dashboard data');
      }
      setLoading(false);
    };
    fetchData();
  }, [user, navigate]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 dark:text-white">Restaurant Admin Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow dark:bg-gray-800">
              <h3 className="text-lg font-semibold dark:text-gray-300">Total Dishes</h3>
              <p className="text-2xl dark:text-white">{dishes.length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow dark:bg-gray-800">
              <h3 className="text-lg font-semibold dark:text-gray-300">Available Dishes</h3>
              <p className="text-2xl dark:text-white">{dishes.filter((d) => d.isAvailable).length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow dark:bg-gray-800">
              <h3 className="text-lg font-semibold dark:text-gray-300">Pending Orders</h3>
              <p className="text-2xl dark:text-white">{orders.filter((o) => o.status === 'Pending').length}</p>
            </div>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => navigate('/dishes/add')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Add Dish
            </button>
            <button
              onClick={() => navigate('/dishes')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Manage Dishes
            </button>
            <button
              onClick={() => navigate('/orders')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Manage Orders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;