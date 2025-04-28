import React, { useContext, useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  FaTachometerAlt,
  FaList,
  FaPlus,
  FaClipboardList,
  FaInbox,
  FaSpinner,
  FaHistory,
  FaDollarSign,
  FaTruck ,
} from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import { getOrders } from "../utils/api";

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
        const [incomingOrders, processingOrders, readyOrders, historyOrders] =
          await Promise.all([
            getOrders("PLACED"),
            getOrders("PREPARING"),
            getOrders("READY_FOR_PICKUP"),
            getOrders("DELIVERED,CANCELLED"),
          ]);

        // Filter orders with case-insensitive status comparison
        const filteredCounts = {
          incoming: incomingOrders.filter(
            (order) => order.status && order.status.toUpperCase() === "PLACED"
          ).length,
          processing: processingOrders.filter(
            (order) =>
              order.status && order.status.toUpperCase() === "PREPARING"
          ).length,
          ready: readyOrders.filter(
            (order) =>
              order.status && order.status.toUpperCase() === "READY_FOR_PICKUP"
          ).length,
          history: historyOrders.filter(
            (order) =>
              order.status &&
              ["DELIVERED", "CANCELLED"].includes(order.status?.toUpperCase())
          ).length,
        };

        setOrderCounts(filteredCounts);
        console.log("Filtered Order Counts:", filteredCounts);
      } catch (error) {
        console.error("Failed to fetch order counts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderCounts();
  }, []);

  return (
    <div className="w-64 h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white fixed shadow-xl">
      <div className="p-6 flex flex-col h-full">
        {/* Logo/App Name */}
        <div className="flex items-center mb-8">
          <FaList className="text-3xl text-orange-500 mr-2" />
          <h1 className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-pink-500">
            FoodDash
          </h1>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 overflow-y-auto">
          <NavLink
            to="/admin-dashboard"
            end
            className={({ isActive }) =>
              `flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 min-h-[48px] w-full box-border ${
                isActive
                  ? "bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-md"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`
            }
          >
            <FaTachometerAlt className="flex-shrink-0" />
            <span className="font-medium">Dashboard</span>
          </NavLink>

          <NavLink
            to="/dishes"
            end
            className={({ isActive }) =>
              `flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 min-h-[48px] w-full box-border ${
                isActive
                  ? "bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-md"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`
            }
          >
            <FaList className="flex-shrink-0" />
            <span className="font-medium">All Dishes</span>
          </NavLink>

          <NavLink
            to="/dishes/add"
            end
            className={({ isActive }) =>
              `flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 min-h-[48px] w-full box-border ${
                isActive
                  ? "bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-md"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`
            }
          >
            <FaPlus className="flex-shrink-0" />
            <span className="font-medium">Add New Dish</span>
          </NavLink>

          {/* Incoming Orders */}
          <NavLink
            to="/orders/incoming"
            end
            className={({ isActive }) =>
              `flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 min-h-[48px] w-full box-border ${
                isActive
                  ? "bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-md"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`
            }
          >
            <FaInbox className="flex-shrink-0" />
            <span className="font-medium">Incoming Orders</span>
            <div className="ml-auto min-w-[24px] flex items-center justify-end">
              {loading ? (
                <span className="text-gray-500 dark:text-gray-400 text-xs">
                  <FaSpinner className="animate-spin" />
                </span>
              ) : orderCounts.incoming > 0 ? (
                <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full">
                  {orderCounts.incoming}
                </span>
              ) : null}
            </div>
          </NavLink>

          {/* Processing Orders */}
          <NavLink
            to="/orders/processing"
            end
            className={({ isActive }) =>
              `flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 min-h-[48px] w-full box-border ${
                isActive
                  ? "bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-md"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`
            }
          >
            <FaClipboardList className="flex-shrink-0" />
            <span className="font-medium">Processing Orders</span>
            <div className="ml-auto min-w-[24px] flex items-center justify-end">
              {loading ? (
                <span className="text-gray-500 dark:text-gray-400 text-xs">
                  <FaSpinner className="animate-spin" />
                </span>
              ) : orderCounts.processing > 0 ? (
                <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full">
                  {orderCounts.processing}
                </span>
              ) : null}
            </div>
          </NavLink>

          {/* Ready to Pickup Orders */}
          <NavLink
            to="/orders/ready"
            end
            className={({ isActive }) =>
              `flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 min-h-[48px] w-full box-border ${
                isActive
                  ? "bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-md"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`
            }
          >
            <FaTruck className="flex-shrink-0" />
            <span className="font-medium">Ready to Pickup</span>
            <div className="ml-auto min-w-[24px] flex items-center justify-end">
              {loading ? (
                <span className="text-gray-500 dark:text-gray-400 text-xs">
                  <FaSpinner className="animate-spin" />
                </span>
              ) : orderCounts.ready > 0 ? (
                <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full">
                  {orderCounts.ready}
                </span>
              ) : null}
            </div>
          </NavLink>

          {/* Order History */}
          <NavLink
            to="/orders/history"
            end
            className={({ isActive }) =>
              `flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 min-h-[48px] w-full box-border ${
                isActive
                  ? "bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-md"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`
            }
          >
            <FaHistory className="flex-shrink-0" />
            <span className="font-medium">Order History</span>
            <div className="ml-auto min-w-[24px] flex items-center justify-end">
              {loading ? (
                <span className="text-gray-500 dark:text-gray-400 text-xs">
                  <FaSpinner className="animate-spin" />
                </span>
              ) : orderCounts.history > 0 ? (
                <span className="bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white text-xs px-2 py-1 rounded-full">
                  {orderCounts.history}
                </span>
              ) : null}
            </div>
          </NavLink>

          <NavLink
            to="/orders/earnings"
            end
            className={({ isActive }) =>
              `flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 min-h-[48px] w-full box-border ${
                isActive
                  ? "bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-md"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`
            }
          >
            <FaDollarSign className="flex-shrink-0" />
            <span className="font-medium">Earnings</span>
          </NavLink>
        </nav>
      </div>
    </div>
  );
};

export default DishSidebar;