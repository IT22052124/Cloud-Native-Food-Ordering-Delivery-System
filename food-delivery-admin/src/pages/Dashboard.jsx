import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import {
  dashboardStats,
  revenueData,
  ordersByCategory,
  recentOrders,
} from "../data/dashboardData";

// For this implementation, we'll use placeholders for charts
// In a real implementation, you'd use a library like recharts or chart.js

function DashboardCard({ title, value, subtitle, icon, colorClass }) {
  const { theme } = useContext(ThemeContext);

  return (
    <div
      className={`rounded-lg shadow-md p-6 ${
        theme === "dark" ? "bg-gray-800" : "bg-white"
      }`}
    >
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${colorClass} bg-opacity-20`}>
          <span className={`text-xl ${colorClass}`}>{icon}</span>
        </div>
        <div className="ml-5">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </p>
          <div className="flex items-center">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
              {value}
            </h3>
            {subtitle && (
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                {subtitle}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const { theme } = useContext(ThemeContext);
  const { today, weekly, monthly } = dashboardStats;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
    }).format(date);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Dashboard
        </h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <span>Last updated: Today, {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard
          title="Today's Orders"
          value={today.orders}
          subtitle="+12% from yesterday"
          icon="📊"
          colorClass="text-blue-600"
        />
        <DashboardCard
          title="Today's Revenue"
          value={formatCurrency(today.revenue)}
          subtitle="+8% from yesterday"
          icon="💰"
          colorClass="text-green-600"
        />
        <DashboardCard
          title="New Users"
          value={today.newUsers}
          subtitle="+5% from yesterday"
          icon="👥"
          colorClass="text-purple-600"
        />
        <DashboardCard
          title="Cancellations"
          value={today.cancellations}
          subtitle="-2% from yesterday"
          icon="❌"
          colorClass="text-red-600"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div
          className={`rounded-lg shadow-md p-6 ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}
        >
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Revenue Overview
          </h2>
          <div className="h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded">
            <span className="text-gray-500 dark:text-gray-400">
              Bar Chart: Monthly Revenue
            </span>
            {/* In a real implementation, you would render a chart here */}
          </div>
        </div>
        <div
          className={`rounded-lg shadow-md p-6 ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}
        >
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Orders by Category
          </h2>
          <div className="h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded">
            <span className="text-gray-500 dark:text-gray-400">
              Pie Chart: Order Distribution
            </span>
            {/* In a real implementation, you would render a chart here */}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div
          className={`rounded-lg shadow-md p-6 ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}
        >
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Daily Summary
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Orders</span>
              <span className="font-semibold text-gray-800 dark:text-white">
                {today.orders}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Revenue</span>
              <span className="font-semibold text-gray-800 dark:text-white">
                {formatCurrency(today.revenue)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">
                New Users
              </span>
              <span className="font-semibold text-gray-800 dark:text-white">
                {today.newUsers}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">
                Cancellations
              </span>
              <span className="font-semibold text-gray-800 dark:text-white">
                {today.cancellations}
              </span>
            </div>
          </div>
        </div>
        <div
          className={`rounded-lg shadow-md p-6 ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}
        >
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Weekly Summary
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Orders</span>
              <span className="font-semibold text-gray-800 dark:text-white">
                {weekly.orders}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Revenue</span>
              <span className="font-semibold text-gray-800 dark:text-white">
                {formatCurrency(weekly.revenue)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">
                New Users
              </span>
              <span className="font-semibold text-gray-800 dark:text-white">
                {weekly.newUsers}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">
                Cancellations
              </span>
              <span className="font-semibold text-gray-800 dark:text-white">
                {weekly.cancellations}
              </span>
            </div>
          </div>
        </div>
        <div
          className={`rounded-lg shadow-md p-6 ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}
        >
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Monthly Summary
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Orders</span>
              <span className="font-semibold text-gray-800 dark:text-white">
                {monthly.orders}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Revenue</span>
              <span className="font-semibold text-gray-800 dark:text-white">
                {formatCurrency(monthly.revenue)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">
                New Users
              </span>
              <span className="font-semibold text-gray-800 dark:text-white">
                {monthly.newUsers}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">
                Cancellations
              </span>
              <span className="font-semibold text-gray-800 dark:text-white">
                {monthly.cancellations}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div
        className={`rounded-lg shadow-md p-6 ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        } mb-8`}
      >
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Recent Orders
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Restaurant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 dark:text-blue-400">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                    {order.customer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                    {order.restaurant}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                    {formatCurrency(order.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${
                        order.status === "Delivered"
                          ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                          : order.status === "In Transit"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
                          : order.status === "Preparing"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
                          : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                    {formatDate(order.date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
