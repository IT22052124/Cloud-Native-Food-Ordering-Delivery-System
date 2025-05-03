import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getRestaurants } from '../utils/api';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';

const getAllOrders = async (startDate, endDate) => {
  try {
    const token = localStorage.getItem('ownerToken');
    const response = await axios.get('http://localhost:5002/api/orders/restaurant/owner/orders', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        startDate,
        endDate,
      },
    });
    console.log('getAllOrders: Response:', response.data.orders);
    return Array.isArray(response.data.orders) ? response.data.orders : [];
  } catch (error) {
    console.error('getAllOrders: Error:', error);
    throw error;
  }
};

const Earnings = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [restaurantData, orderData] = await Promise.all([
          getRestaurants(),
          getAllOrders(startDate, endDate),
        ]);
        setRestaurants(Array.isArray(restaurantData) ? restaurantData : []);
        setOrders(Array.isArray(orderData) ? orderData : []);
      } catch (error) {
        setRestaurants([]);
        setOrders([]);
      }
      setLoading(false);
    };
    fetchData();
  }, [user, navigate, startDate, endDate]);

  // Calculate earnings
  const restaurantIds = restaurants.map(r => r._id);
  const filteredOrders = orders.filter(order => 
    restaurantIds.includes(order.restaurantOrder?.restaurantId)
  );

  const earningsByRestaurant = restaurants.map(restaurant => {
    const restaurantOrders = filteredOrders.filter(
      order => order.restaurantOrder?.restaurantId === restaurant._id
    );
    const totalEarnings = restaurantOrders.reduce(
      (sum, order) => sum + (order.totalAmount * 0.8), // 80% of totalAmount
      0
    );
    return {
      name: restaurant.name,
      earnings: totalEarnings.toFixed(2),
    };
  });

  const totalEarnings = earningsByRestaurant
    .reduce((sum, r) => sum + parseFloat(r.earnings), 0)
    .toFixed(2);

  const handleFilter = () => {
    setLoading(true);
    // The useEffect hook will refetch orders with the new date range
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64 bg-gray-900 dark:dark-bg">
        <Navbar />
        <div className="p-6">
          <h2 className="text-2xl font-bold text-text-primary dark:dark-text mb-4">
            Earnings
          </h2>
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-text-primary dark:dark-text">
              Total Earnings: ${totalEarnings}
            </h3>
          </div>
          <div className="mb-6 flex space-x-4">
            <div>
              <label className="text-text-primary dark:dark-text">Start Date:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="ml-2 p-2 rounded bg-gray-800 text-white"
              />
            </div>
            <div>
              <label className="text-text-primary dark:dark-text">End Date:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="ml-2 p-2 rounded bg-gray-800 text-white"
              />
            </div>
            <button
              onClick={handleFilter}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Apply Filter
            </button>
          </div>
          {earningsByRestaurant.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-gray-800 text-white rounded-lg">
                <thead>
                  <tr>
                    <th className="py-3 px-4 text-left">Restaurant Name</th>
                    <th className="py-3 px-4 text-left">Total Earnings ($)</th>
                  </tr>
                </thead>
                <tbody>
                  {earningsByRestaurant.map((restaurant, index) => (
                    <tr key={index} className="border-t border-gray-700">
                      <td className="py-3 px-4">{restaurant.name}</td>
                      <td className="py-3 px-4">{restaurant.earnings}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-text-primary dark:dark-text">No earnings data available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Earnings;