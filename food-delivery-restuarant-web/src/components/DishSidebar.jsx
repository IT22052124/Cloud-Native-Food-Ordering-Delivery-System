import React, { useContext, useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { FaTachometerAlt, FaUtensils, FaPlus, FaClipboardList, FaUsers, FaInbox, FaSpinner, FaHistory } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import { getOrders } from '../utils/api';

const DishSidebar = () => {
  const { user } = useContext(AuthContext);
  const [orderCounts, setOrderCounts] = useState({
    incoming: 0,
    processing: 0,
    ready: 0,
    history: 0,
  });
  const [loading, setLoading] = useState(true);

  // Fetch order counts for each status
  useEffect(() => {
    const fetchOrderCounts = async () => {
      try {
        setLoading(true);
        const [incomingOrders, processingOrders, readyOrders, historyOrders] = await Promise.all([
          getOrders('PLACED'),
          getOrders('PREPARING'),
          getOrders('READY_FOR_PICKUP'),
          getOrders('DELIVERED,CANCELLED'),
        ]);

        // Filter orders with case-insensitive status comparison
        const filteredCounts = {
          incoming: incomingOrders.filter(order => 
            order.status && order.status.toUpperCase() === 'PLACED'
          ).length,
          processing: processingOrders.filter(order => 
            order.status && order.status.toUpperCase() === 'PREPARING'
          ).length,
          ready: readyOrders.filter(order => 
            order.status && order.status.toUpperCase() === 'READY_FOR_PICKUP'
          ).length,
          history: historyOrders.filter(order => 
            order.status && ['DELIVERED', 'CANCELLED'].includes(order.status?.toUpperCase())
          ).length,
        };

        setOrderCounts(filteredCounts);
        console.log('Filtered Order Counts:', filteredCounts);
      } catch (error) {
        console.error('Failed to fetch order counts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderCounts();
  }, []);

  return (
    <div className="fixed top-0 left-0 w-64 h-screen bg-gray-50 dark:bg-gray-800 shadow-md p-4 flex flex-col border-r border-gray-200 dark:border-gray-700">
      {/* Logo/App Name */}
      <div className="mb-10 pt-4 px-2">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
          <FaUtensils className="mr-3 text-accent" />
          <span>FoodDelivery</span>
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Admin Dashboard</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 overflow-y-auto">
        <NavLink
          to="/admin-dashboard"
          className={({ isActive }) =>
            `flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
              isActive
                ? 'bg-accent text-white shadow-md'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`
          }
        >
          <FaTachometerAlt className="flex-shrink-0" />
          <span className="font-medium">Dashboard</span>
        </NavLink>

        <NavLink
          to="/dishes"
          className={({ isActive }) =>
            `flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
              isActive
                ? 'bg-accent text-white shadow-md'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`
          }
        >
          <FaUtensils className="flex-shrink-0" />
          <span className="font-medium">All Dishes</span>
        </NavLink>

        <NavLink
          to="/dishes/add"
          className={({ isActive }) =>
            `flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
              isActive
                ? 'bg-accent text-white shadow-md'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`
          }
        >
          <FaPlus className="flex-shrink-0" />
          <span className="font-medium">Add New Dish</span>
        </NavLink>

        {/* Incoming Orders */}
        <NavLink
          to="/orders/incoming"
          className={({ isActive }) =>
            `flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
              isActive
                ? 'bg-accent text-white shadow-md'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`
          }
        >
          <FaInbox className="flex-shrink-0" />
          <span className="font-medium">Incoming Orders</span>
          {loading ? (
            <span className="ml-auto text-gray-500 dark:text-gray-400 text-xs">
              <FaSpinner className="animate-spin" />
            </span>
          ) : orderCounts.incoming > 0 ? (
            <span className="ml-auto bg-accent text-white text-xs px-2 py-1 rounded-full">
              {orderCounts.incoming}
            </span>
          ) : null}
        </NavLink>

        {/* Processing Orders */}
        <NavLink
          to="/orders/processing"
          className={({ isActive }) =>
            `flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
              isActive
                ? 'bg-accent text-white shadow-md'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`
          }
        >
          <FaClipboardList className="flex-shrink-0" />
          <span className="font-medium">Processing Orders</span>
          {loading ? (
            <span className="ml-auto text-gray-500 dark:text-gray-400 text-xs">
              <FaSpinner className="animate-spin" />
            </span>
          ) : orderCounts.processing > 0 ? (
            <span className="ml-auto bg-accent text-white text-xs px-2 py-1 rounded-full">
              {orderCounts.processing}
            </span>
          ) : null}
        </NavLink>

        {/* Ready to Pickup Orders */}
        <NavLink
          to="/orders/ready"
          className={({ isActive }) =>
            `flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
              isActive
                ? 'bg-accent text-white shadow-md'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`
          }
        >
          <FaClipboardList className="flex-shrink-0" />
          <span className="font-medium">Ready to Pickup</span>
          {loading ? (
            <span className="ml-auto text-gray-500 dark:text-gray-400 text-xs">
              <FaSpinner className="animate-spin" />
            </span>
          ) : orderCounts.ready > 0 ? (
            <span className="ml-auto bg-accent text-white text-xs px-2 py-1 rounded-full">
              {orderCounts.ready}
            </span>
          ) : null}
        </NavLink>

        {/* Order History */}
        <NavLink
          to="/orders/history"
          className={({ isActive }) =>
            `flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
              isActive
                ? 'bg-accent text-white shadow-md'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`
          }
        >
          <FaHistory className="flex-shrink-0" />
          <span className="font-medium">Order History</span>
          {loading ? (
            <span className="ml-auto text-gray-500 dark:text-gray-400 text-xs">
              <FaSpinner className="animate-spin" />
            </span>
          ) : orderCounts.history > 0 ? (
            <span className="ml-auto bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white text-xs px-2 py-1 rounded-full">
              {orderCounts.history}
            </span>
          ) : null}
        </NavLink>
        <NavLink
          to="/restaurants/admin"
          className={({ isActive }) =>
            `flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
              isActive
                ? 'bg-accent text-white shadow-md'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`
          }
        >
          <FaTachometerAlt className="flex-shrink-0" />
          <span className="font-medium">resutant</span>
        </NavLink>

        {/* <NavLink
          to="/users"
          className={({ isActive }) =>
            `flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
              isActive
                ? 'bg-accent text-white shadow-md'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`
          }
        >
          <FaUsers className="flex-shrink-0" />
          <span className="font-medium">Users</span>
        </NavLink> */}
      </nav>

      {/* User profile/settings at bottom */}
      
    
    </div>
  );
};

export default DishSidebar;