"use client"

import { useState, useEffect } from "react"
import DishSidebar from "../../components/DishSidebar"
import Navbar from "../../components/DishNavBar"
import LoadingSpinner from "../../components/LoadingSpinner"
import { toast } from "react-toastify"
import { getOrders } from "../../utils/api"
import { Calendar, DollarSign, Filter, TrendingUp, User, ShoppingBag, Clock, CreditCard, RefreshCw } from "lucide-react"

const OrderEarnings = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  // Fetch all orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        // Assuming getOrders can fetch all orders when no status is specified
        const data = await getOrders()
        setOrders(data)
      } catch (error) {
        toast.error("Failed to fetch orders")
        console.error("Error fetching orders:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  // Filter confirmed orders and apply date range
  const filteredOrders = orders.filter((order) => {
    const isConfirmed = order.status.toUpperCase() === "PLACED"
    if (!isConfirmed) return false

    const orderDate = new Date(order.createdAt)
    const start = startDate ? new Date(startDate) : null
    const end = endDate ? new Date(endDate) : null

    if (start && end) {
      return orderDate >= start && orderDate <= end
    } else if (start) {
      return orderDate >= start
    } else if (end) {
      return orderDate <= end
    }
    return true
  })

  // Calculate total earnings (80% of order total)
  const totalEarnings = filteredOrders.reduce((sum, order) => {
    const orderTotal = order.subtotal + order.tax + order.deliveryFee
    return sum + orderTotal * 0.8
  }, 0)

  if (loading) return <LoadingSpinner />

  return (
    <div className="flex min-h-screen">
      <DishSidebar />
      <div className="flex-1 ml-64 bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="p-6">
          <div className="flex items-center mb-6">
            <DollarSign className="h-8 w-8 mr-2 text-green-500" />
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Order Earnings</h2>
          </div>

          {/* Total Earnings Display */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg shadow-md mb-6 border border-green-100 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                  Total Restaurant Earnings (80%)
                </h3>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                  LKR {totalEarnings.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Based on {filteredOrders.length} confirmed orders
                </p>
              </div>
              <div className="hidden md:block">
                <div className="h-24 w-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <DollarSign className="h-12 w-12 text-green-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Date Filter */}
          <div className="mb-6 bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md border border-gray-100 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <Filter className="h-5 w-5 mr-2 text-indigo-500" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Filter by Date</h3>
            </div>
            <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Calendar className="h-4 w-4 inline mr-1" /> Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white py-2 px-3"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Calendar className="h-4 w-4 inline mr-1" /> End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white py-2 px-3"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setStartDate("")
                    setEndDate("")
                  }}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md transition flex items-center"
                >
                  <RefreshCw className="h-4 w-4 mr-1" /> Reset
                </button>
              </div>
            </div>
          </div>

          {/* Earnings Table */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
                <ShoppingBag className="h-5 w-5 mr-2 text-indigo-500" />
                Confirmed Orders
              </h3>
              <span className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {filteredOrders.length} Orders
              </span>
            </div>
            {filteredOrders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600 dark:text-gray-400 text-lg">No confirmed orders found</p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">Try adjusting your filter criteria</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-300">
                  <thead className="text-xs uppercase bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-t-lg">
                    <tr>
                      <th className="px-6 py-3 rounded-tl-lg">
                        <div className="flex items-center">
                          <ShoppingBag className="h-4 w-4 mr-1" />
                          Order ID
                        </div>
                      </th>
                      <th className="px-6 py-3">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          Date
                        </div>
                      </th>
                      <th className="px-6 py-3">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          Customer
                        </div>
                      </th>
                      <th className="px-6 py-3">
                        <div className="flex items-center">
                          <CreditCard className="h-4 w-4 mr-1" />
                          Total
                        </div>
                      </th>
                      <th className="px-6 py-3 rounded-tr-lg">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          Restaurant Share (80%)
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order, index) => {
                      const orderTotal = order.subtotal + order.tax + order.deliveryFee
                      const restaurantShare = orderTotal * 0.8
                      return (
                        <tr
                          key={order.orderId}
                          className={`${
                            index % 2 === 0 ? "bg-gray dark:bg-gray-800" : "bg-gray-750 dark:bg-gray-750"
                          } hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition`}
                        >
                          <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">#{order.orderId}</td>
                          <td className="px-6 py-4 text-gray-900 dark:text-white">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-gray-900 dark:text-white">{order.customerName}</td>
                          <td className="px-6 py-4 text-gray-900 dark:text-white">LKR {orderTotal.toFixed(2)}</td>
                          <td className="px-6 py-4 font-medium text-green-600 dark:text-green-400">
                            LKR {restaurantShare.toFixed(2)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderEarnings
