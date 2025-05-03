import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getRestaurants, getAllOwnerOrders } from '../utils/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';

const Earnings = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [restaurantData, orderData] = await Promise.all([
        getRestaurants(),
        getAllOwnerOrders(), // Fetch all orders without date parameters
      ]);
      setRestaurants(Array.isArray(restaurantData) ? restaurantData : []);
      setOrders(Array.isArray(orderData) ? orderData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load earnings data. Please try again.');
      setRestaurants([]);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user, navigate]);

  // Apply frontend filtering
  useEffect(() => {
    const restaurantIds = restaurants.map(r => r._id);
    const filtered = orders.filter(order => {
      const isValidRestaurant = restaurantIds.includes(order?.restaurantId);
      if (!isValidRestaurant) return false;

      const orderDate = new Date(order.createdAt);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (start && end) {
        return orderDate >= start && orderDate <= end;
      } else if (start) {
        return orderDate >= start;
      } else if (end) {
        return orderDate <= end;
      }
      return true;
    });
    setFilteredOrders(filtered);
  }, [orders, restaurants, startDate, endDate]);

  // Calculate earnings
  const earningsByRestaurant = restaurants.map(restaurant => {
    const restaurantOrders = filteredOrders.filter(
      order => order?.restaurantId === restaurant._id
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
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      setError('End date cannot be before start date.');
      return;
    }
    fetchData();
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
  };

  if (loading) return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64 bg-gray-900">
        <Navbar />
        <div className="flex items-center justify-center h-full">
          <LoadingSpinner />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-900">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Navbar />
        <div className="p-6 max-w-7xl mx-auto">
          <div className="bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-3xl font-bold text-white mb-4">
              Earnings
            </h2>
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-200">
                Total Earnings: <span className="text-green-400">${totalEarnings}</span>
              </h3>
            </div>
            {error && (
              <div className="mb-6 p-4 bg-red-600 text-white rounded-lg flex items-center animate-fade-in">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M12 17h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}
            <div className="mb-8 flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
              <div className="flex-1">
                <label className="block text-gray-300 text-sm font-medium mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
              <div className="flex-1">
                <label className="block text-gray-300 text-sm font-medium mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
              <div className="self-end flex space-x-2">
                <button
                  onClick={handleFilter}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition"
                >
                  Apply Filter
                </button>
                <button
                  onClick={handleReset}
                  className="px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 transition"
                >
                  Reset
                </button>
              </div>
            </div>
            {earningsByRestaurant.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-gray-700">
                <table className="min-w-full bg-gray-800 text-white">
                  <thead className="bg-gray-900 sticky top-0">
                    <tr>
                      <th className="py-4 px-6 text-left text-gray-200 font-semibold">Restaurant Name</th>
                      <th className="py-4 px-6 text-left text-gray-200 font-semibold">Total Earnings ($)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {earningsByRestaurant.map((restaurant, index) => (
                      <tr 
                        key={index} 
                        className="border-t border-gray-700 hover:bg-gray-700 transition"
                      >
                        <td className="py-4 px-6">{restaurant.name}</td>
                        <td className="py-4 px-6 text-green-400">${restaurant.earnings}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-400 text-center py-6">No earnings data available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Earnings;