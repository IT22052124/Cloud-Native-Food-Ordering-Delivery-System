import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrders, updateOrderStatus } from '../utils/api';
import DishSidebar from '../components/DishSidebar';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';
import { FaCheck, FaTimes } from 'react-icons/fa';

const IncomingOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const navigate = useNavigate();

  // Fetch incoming orders (status: PLACED)
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await getOrders('PLACED');
        setOrders(data);
      } catch (error) {
        toast.error('Failed to fetch incoming orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Handle order status updates
  const handleUpdateOrderStatus = async (orderId, newStatus, onSuccess) => {
    setActionLoading((prev) => ({ ...prev, [orderId]: true }));
    try {
      await updateOrderStatus(orderId, newStatus, `${newStatus} by restaurant`);
      toast.success(`Order ${newStatus.toLowerCase()} successfully`);
      onSuccess();
    } catch (error) {
      toast.error(`Failed to update order status to ${newStatus.toLowerCase()}`);
    } finally {
      setActionLoading((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const handleConfirmOrder = (orderId) => {
    handleUpdateOrderStatus(orderId, 'PREPARING', () => {
      setOrders((prev) => prev.filter((order) => order.orderId !== orderId));
    });
  };

  const handleCancelOrder = (orderId) => {
    handleUpdateOrderStatus(orderId, 'CANCELLED', () => {
      setOrders((prev) => prev.filter((order) => order.orderId !== orderId));
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex min-h-screen">
      <DishSidebar />
      <div className="flex-1 ml-64 bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="p-6">
          <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">📥 Incoming Orders</h2>
          {orders.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">No orders</p>
          ) : (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-300">
                  <thead className="text-xs uppercase bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                    <tr>
                      <th className="px-6 py-3">Order ID</th>
                      <th className="px-6 py-3">Customer</th>
                      <th className="px-6 py-3">Items</th>
                      <th className="px-6 py-3">Total</th>
                      <th className="px-6 py-3 text-center">Status</th>
                      <th className="px-6 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr
                        key={order.orderId}
                        className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                      >
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{order.orderId}</td>
                        <td className="px-6 py-4 text-gray-900 dark:text-white">{order.customerName}</td>
                        <td className="px-6 py-4 text-gray-900 dark:text-white">
                          {order.items.map((item) => `${item.name} (${item.quantity})`).join(', ')}
                        </td>
                        <td className="px-6 py-4 text-gray-900 dark:text-white">
                          LKR {(order.subtotal + order.tax + order.deliveryFee).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center flex justify-center space-x-2">
                          <button
                            onClick={() => handleConfirmOrder(order.orderId)}
                            disabled={actionLoading[order.orderId]}
                            className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 transition-all duration-200 disabled:bg-gray-400"
                          >
                            <FaCheck className="mr-1.5" />
                            {actionLoading[order.orderId] ? 'Confirming...' : 'Confirm'}
                          </button>
                          <button
                            onClick={() => handleCancelOrder(order.orderId)}
                            disabled={actionLoading[order.orderId]}
                            className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 transition-all duration-200 disabled:bg-gray-400"
                          >
                            <FaTimes className="mr-1.5" />
                            {actionLoading[order.orderId] ? 'Cancelling...' : 'Cancel'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IncomingOrders;