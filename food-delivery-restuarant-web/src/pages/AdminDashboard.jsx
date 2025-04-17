import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getDishes, getOrders } from '../utils/api';
import DishSidebar from '../components/DishSidebar';
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
    const fetchData = async () => {
      try {
        const [dishData, orderData] = await Promise.all([
          getDishes(user.restaurantId),
    
         // getOrders(),
        ]);
        setDishes(dishData.dishes);
        console.log(dishes)
     //   setOrders(orderData);
      } catch (error) {
        toast.error('Failed to fetch dashboard data');
      }
      setLoading(false);
    };
    fetchData();
  }, [user, navigate]);

  if (loading) return <LoadingSpinner />;
  const dishesCount = dishes.length;
  const countAvailableDishes = (dishes) => {
    if (!dishes || dishes.length === 0) return 0;
    return dishes.filter(dish => dish.isAvailable === true).length;
  };

  return (
    <div className="flex min-h-screen">
      <DishSidebar />
      <div className="flex-1 ml-64 bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="p-6">
          <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Restaurant Admin Dashboard</h2>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">Total Dishes</h3>
              <p className="text-3xl font-semibold text-blue-600 dark:text-blue-400">{dishes.length}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">Available Dishes</h3>
              <p className="text-3xl font-semibold text-green-600 dark:text-green-400">
                {countAvailableDishes(dishes)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">Pending Orders</h3>
              <p className="text-3xl font-semibold text-orange-600 dark:text-orange-400">
                {orders.filter((o) => o.status === 'Pending').length}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-8">
            <button
              onClick={() => navigate('/dishes/add')}
              className="bg-orange-500 text-white px-5 py-2 rounded-md hover:bg-orange-600 transition"
            >
              ➕ Add Dish
            </button>
            <button
              onClick={() => navigate('/dishes')}
              className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition"
            >
              🍽️ Manage Dishes
            </button>
            <button
              onClick={() => navigate('/orders')}
              className="bg-indigo-600 text-white px-5 py-2 rounded-md hover:bg-indigo-700 transition"
            >
              📦 Manage Orders
            </button>
          </div>

          {/* Recent Dishes Table */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              🍲 Recent Dishes
            </h3>
            {dishes.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">No dishes added yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-300">
                  <thead className="text-xs uppercase bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                    <tr>
                      <th className="px-6 py-3">Name</th>
                      <th className="px-6 py-3">Price</th>
                      <th className="px-6 py-3">Category</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dishes.slice(0, 5).map((dish) => (
                      <tr key={dish._id} className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{dish.name}</td>
                        <td className="px-6 py-4">LKR {dish.price}</td>
                        <td className="px-6 py-4">{dish.category || '—'}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium
                            ${dish.isAvailable
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
                            {dish.isAvailable ? 'Available' : 'Unavailable'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
