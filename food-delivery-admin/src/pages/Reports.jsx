import { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  CalendarIcon,
  FilterIcon,
  DownloadIcon,
  RefreshCw,
} from "lucide-react";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

// Dummy data for reports
const monthlyRevenue = [
  { name: "Jan", revenue: 4000, profit: 2400, orders: 240 },
  { name: "Feb", revenue: 3000, profit: 1398, orders: 210 },
  { name: "Mar", revenue: 2000, profit: 9800, orders: 290 },
  { name: "Apr", revenue: 2780, profit: 3908, orders: 320 },
  { name: "May", revenue: 1890, profit: 4800, orders: 240 },
  { name: "Jun", revenue: 2390, profit: 3800, orders: 280 },
  { name: "Jul", revenue: 3490, profit: 4300, orders: 340 },
  { name: "Aug", revenue: 4000, profit: 2400, orders: 360 },
  { name: "Sep", revenue: 3000, profit: 1398, orders: 310 },
  { name: "Oct", revenue: 2000, profit: 9800, orders: 290 },
  { name: "Nov", revenue: 2780, profit: 3908, orders: 330 },
  { name: "Dec", revenue: 3890, profit: 4800, orders: 380 },
];

const deliveryPerformance = [
  { name: "On Time", value: 85 },
  { name: "Delayed", value: 12 },
  { name: "Cancelled", value: 3 },
];

const customerSatisfaction = [
  { name: "5 Stars", value: 65 },
  { name: "4 Stars", value: 20 },
  { name: "3 Stars", value: 10 },
  { name: "2 Stars", value: 3 },
  { name: "1 Star", value: 2 },
];

const deviceUsage = [
  { name: "Mobile", value: 70 },
  { name: "Desktop", value: 20 },
  { name: "Tablet", value: 10 },
];

const Reports = () => {
  const [dateRange, setDateRange] = useState("Last 30 days");
  const [activeTab, setActiveTab] = useState("overview");

  const dateRanges = [
    "Today",
    "Yesterday",
    "Last 7 days",
    "Last 30 days",
    "This Month",
    "Last Month",
    "Custom",
  ];

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Reports & Analytics
        </h1>

        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <div className="relative">
            <button className="flex items-center space-x-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
              <CalendarIcon size={16} />
              <span>{dateRange}</span>
            </button>
          </div>

          <button className="flex items-center space-x-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
            <FilterIcon size={16} />
            <span>Filter</span>
          </button>

          <button className="flex items-center space-x-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
            <DownloadIcon size={16} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Report navigation tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex flex-wrap -mb-px">
          {["overview", "sales", "orders", "customers", "delivery"].map(
            (tab) => (
              <button
                key={tab}
                className={`mr-4 py-2 px-1 font-medium text-sm ${
                  activeTab === tab
                    ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            )
          )}
        </nav>
      </div>

      {/* Overview Section */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Revenue & Orders Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                Revenue & Orders Overview
              </h2>
              <button className="text-blue-500 hover:text-blue-600 flex items-center text-sm">
                <RefreshCw size={14} className="mr-1" /> Refresh
              </button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={monthlyRevenue}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#374151"
                  opacity={0.1}
                />
                <XAxis dataKey="name" tick={{ fill: "#6B7280" }} />
                <YAxis yAxisId="left" tick={{ fill: "#6B7280" }} />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: "#6B7280" }}
                />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3B82F6"
                  name="Revenue ($)"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="profit"
                  stroke="#10B981"
                  name="Profit ($)"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="orders"
                  stroke="#F59E0B"
                  name="Orders"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Delivery Performance */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h3 className="text-md font-semibold text-gray-800 dark:text-white mb-4">
                Delivery Performance
              </h3>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={deliveryPerformance}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {deliveryPerformance.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Customer Satisfaction */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h3 className="text-md font-semibold text-gray-800 dark:text-white mb-4">
                Customer Satisfaction
              </h3>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={customerSatisfaction}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {customerSatisfaction.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Device Usage */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h3 className="text-md font-semibold text-gray-800 dark:text-white mb-4">
                App Usage by Device
              </h3>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={deviceUsage}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {deviceUsage.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Sales Report Tab */}
      {activeTab === "sales" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Revenue
              </p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                $128,430
              </h3>
              <p className="text-sm text-green-500 flex items-center mt-1">
                <span className="mr-1">↑</span> 12.5% from last month
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Avg. Order Value
              </p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                $38.20
              </h3>
              <p className="text-sm text-green-500 flex items-center mt-1">
                <span className="mr-1">↑</span> 3.2% from last month
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Profit
              </p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                $42,650
              </h3>
              <p className="text-sm text-green-500 flex items-center mt-1">
                <span className="mr-1">↑</span> 8.7% from last month
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Profit Margin
              </p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                33.2%
              </h3>
              <p className="text-sm text-red-500 flex items-center mt-1">
                <span className="mr-1">↓</span> 1.5% from last month
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Monthly Revenue Breakdown
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={monthlyRevenue}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#374151"
                  opacity={0.1}
                />
                <XAxis dataKey="name" tick={{ fill: "#6B7280" }} />
                <YAxis tick={{ fill: "#6B7280" }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" name="Revenue" fill="#3B82F6" />
                <Bar dataKey="profit" name="Profit" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Orders Report Tab */}
      {activeTab === "orders" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Orders
              </p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                3,265
              </h3>
              <p className="text-sm text-green-500 flex items-center mt-1">
                <span className="mr-1">↑</span> 8.3% from last month
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Completed Orders
              </p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                3,108
              </h3>
              <p className="text-sm text-gray-500 flex items-center mt-1">
                95.2% completion rate
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Cancelled Orders
              </p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                157
              </h3>
              <p className="text-sm text-red-500 flex items-center mt-1">
                <span className="mr-1">↑</span> 2.1% from last month
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Avg. Delivery Time
              </p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                28 min
              </h3>
              <p className="text-sm text-green-500 flex items-center mt-1">
                <span className="mr-1">↓</span> 3 min from last month
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Order Volume by Time of Day
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  { time: "6am-9am", orders: 240 },
                  { time: "9am-12pm", orders: 380 },
                  { time: "12pm-3pm", orders: 650 },
                  { time: "3pm-6pm", orders: 420 },
                  { time: "6pm-9pm", orders: 780 },
                  { time: "9pm-12am", orders: 390 },
                  { time: "12am-3am", orders: 210 },
                  { time: "3am-6am", orders: 95 },
                ]}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#374151"
                  opacity={0.1}
                />
                <XAxis dataKey="time" tick={{ fill: "#6B7280" }} />
                <YAxis tick={{ fill: "#6B7280" }} />
                <Tooltip />
                <Bar dataKey="orders" name="Orders" fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Customers Tab */}
      {activeTab === "customers" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Active Customers
              </p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                12,845
              </h3>
              <p className="text-sm text-green-500 flex items-center mt-1">
                <span className="mr-1">↑</span> 5.2% from last month
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                New Customers
              </p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                854
              </h3>
              <p className="text-sm text-green-500 flex items-center mt-1">
                <span className="mr-1">↑</span> 12.7% from last month
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Average Customer Lifetime Value
              </p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                $320
              </h3>
              <p className="text-sm text-green-500 flex items-center mt-1">
                <span className="mr-1">↑</span> 3.5% from last month
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Customer Retention Rate
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={[
                  { month: "Jan", retention: 76 },
                  { month: "Feb", retention: 78 },
                  { month: "Mar", retention: 75 },
                  { month: "Apr", retention: 77 },
                  { month: "May", retention: 79 },
                  { month: "Jun", retention: 82 },
                  { month: "Jul", retention: 84 },
                  { month: "Aug", retention: 83 },
                  { month: "Sep", retention: 85 },
                  { month: "Oct", retention: 84 },
                  { month: "Nov", retention: 86 },
                  { month: "Dec", retention: 88 },
                ]}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#374151"
                  opacity={0.1}
                />
                <XAxis dataKey="month" tick={{ fill: "#6B7280" }} />
                <YAxis tick={{ fill: "#6B7280" }} domain={[70, 90]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="retention"
                  stroke="#8884d8"
                  name="Retention Rate (%)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Delivery Tab */}
      {activeTab === "delivery" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Active Drivers
              </p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                128
              </h3>
              <p className="text-sm text-green-500 flex items-center mt-1">
                <span className="mr-1">↑</span> 8 more than last month
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Average Deliveries per Driver
              </p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                42
              </h3>
              <p className="text-sm text-green-500 flex items-center mt-1">
                <span className="mr-1">↑</span> 3 more than last month
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Average Driver Rating
              </p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                4.8/5.0
              </h3>
              <p className="text-sm text-green-500 flex items-center mt-1">
                <span className="mr-1">↑</span> 0.1 more than last month
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Delivery Completion Rates by Area
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  { area: "Downtown", onTime: 92, delayed: 8 },
                  { area: "Uptown", onTime: 88, delayed: 12 },
                  { area: "Midtown", onTime: 95, delayed: 5 },
                  { area: "Westside", onTime: 90, delayed: 10 },
                  { area: "Eastside", onTime: 87, delayed: 13 },
                  { area: "Northside", onTime: 91, delayed: 9 },
                  { area: "Southside", onTime: 86, delayed: 14 },
                ]}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#374151"
                  opacity={0.1}
                />
                <XAxis dataKey="area" tick={{ fill: "#6B7280" }} />
                <YAxis tick={{ fill: "#6B7280" }} />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="onTime"
                  name="On Time %"
                  stackId="a"
                  fill="#10B981"
                />
                <Bar
                  dataKey="delayed"
                  name="Delayed %"
                  stackId="a"
                  fill="#EF4444"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
