import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getOrders } from "../../utils/api";
import DishSidebar from "../../components/DishSidebar";
import Navbar from "../../components/Navbar";
import LoadingSpinner from "../../components/LoadingSpinner";
import { toast } from "react-toastify";

const ReadyForPickupOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch orders with status READY_FOR_PICKUP
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await getOrders("READY_FOR_PICKUP");
        console.log("Fetched Orders:", data);
        setOrders(data);
      } catch (error) {
        toast.error("Failed to fetch ready for pickup orders");
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <LoadingSpinner />;

  // Filter orders to only show those with status 'READY_FOR_PICKUP' (case-insensitive)
  const filteredOrders = orders.filter(
    (order) => order.status && order.status.toUpperCase() === "READY_FOR_PICKUP"
  );

  console.log("Filtered Orders:", filteredOrders);

  return (
    <div className="flex min-h-screen">
      <DishSidebar />
      <div className="flex-1 ml-64 bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="p-6">
          <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
            🚚 Ready for Pickup Orders
          </h2>
          {filteredOrders.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">
              No orders are ready for pickup.
            </p>
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
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr
                        key={order.orderId}
                        className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                      >
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                          {order.orderId}
                        </td>
                        <td className="px-6 py-4 text-gray-900 dark:text-white">
                          {order.customerName}
                        </td>
                        <td className="px-6 py-4 text-gray-900 dark:text-white">
                          {order.items
                            .map((item) => `${item.name} (${item.quantity})`)
                            .join(", ")}
                        </td>
                        <td className="px-6 py-4 text-gray-900 dark:text-white">
                          LKR{" "}
                          {(
                            order.subtotal +
                            order.tax +
                            order.deliveryFee
                          ).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            {order.status}
                          </span>
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

export default ReadyForPickupOrders;
