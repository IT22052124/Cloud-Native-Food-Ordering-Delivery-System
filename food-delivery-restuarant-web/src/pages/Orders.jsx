import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getOrders, updateOrderStatus } from "../utils/api";
import OrderTable from "../components/OrderTable";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/DishNavBar";
import LoadingSpinner from "../components/LoadingSpinner";
import { toast } from "react-toastify";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    const fetchOrders = async () => {
      try {
        const data = await getOrders();
        setOrders(data);
      } catch (error) {
        toast.error("Failed to fetch orders");
      }
      setLoading(false);
    };
    fetchOrders();
  }, [user, navigate]);

  const handleAccept = async (id) => {
    try {
      await updateOrderStatus(id, "Accepted");
      setOrders(
        orders.map((o) => (o._id === id ? { ...o, status: "Accepted" } : o))
      );
      toast.success("Order accepted");
    } catch (error) {
      toast.error("Failed to accept order");
    }
  };

  const handleReject = async (id) => {
    try {
      await updateOrderStatus(id, "Rejected");
      setOrders(
        orders.map((o) => (o._id === id ? { ...o, status: "Rejected" } : o))
      );
      toast.success("Order rejected");
    } catch (error) {
      toast.error("Failed to reject order");
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 dark:text-white">
            Manage Orders
          </h2>
          <OrderTable
            orders={orders}
            onAccept={handleAccept}
            onReject={handleReject}
          />
        </div>
      </div>
    </div>
  );
};

export default Orders;
