import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { drivers } from "../data/drivers";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Truck,
  Star,
  DollarSign,
  Award,
  Clock,
  FileText,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

const performanceHistory = [
  { month: "Jan", deliveries: 125, earnings: 2800, rating: 4.7 },
  { month: "Feb", deliveries: 137, earnings: 3100, rating: 4.8 },
  { month: "Mar", deliveries: 128, earnings: 2900, rating: 4.6 },
  { month: "Apr", deliveries: 140, earnings: 3150, rating: 4.7 },
  { month: "May", deliveries: 148, earnings: 3350, rating: 4.8 },
  { month: "Jun", deliveries: 135, earnings: 3050, rating: 4.9 },
];

const recentPayments = [
  { id: "PAY-23423", date: "2025-04-18", amount: 540.25, status: "completed" },
  { id: "PAY-23215", date: "2025-04-11", amount: 495.75, status: "completed" },
  { id: "PAY-22986", date: "2025-04-04", amount: 520.0, status: "completed" },
  { id: "PAY-22764", date: "2025-03-28", amount: 510.5, status: "completed" },
];

const recentDeliveries = [
  {
    id: "DEL-45629",
    restaurant: "Thai Spice",
    customer: "Emma Watson",
    amount: 28.99,
    date: "2025-04-23",
    status: "completed",
    rating: 5,
  },
  {
    id: "DEL-45608",
    restaurant: "Burger King",
    customer: "John Smith",
    amount: 18.45,
    date: "2025-04-23",
    status: "completed",
    rating: 4,
  },
  {
    id: "DEL-45592",
    restaurant: "Pizza Palace",
    customer: "Maria Rodriguez",
    amount: 32.5,
    date: "2025-04-22",
    status: "completed",
    rating: 5,
  },
  {
    id: "DEL-45577",
    restaurant: "Sushi Express",
    customer: "David Chen",
    amount: 45.75,
    date: "2025-04-22",
    status: "completed",
    rating: 5,
  },
  {
    id: "DEL-45548",
    restaurant: "Taco Town",
    customer: "Sarah Johnson",
    amount: 22.99,
    date: "2025-04-21",
    status: "completed",
    rating: 4,
  },
];

const recentIncidents = [
  {
    id: "INC-1023",
    date: "2025-04-10",
    type: "Late Delivery",
    description: "Delayed due to traffic congestion",
    resolution: "Customer compensated with discount voucher",
  },
  {
    id: "INC-982",
    date: "2025-03-17",
    type: "Order Damaged",
    description: "Drink spilled during delivery",
    resolution: "Refund issued to customer",
  },
];

const documents = [
  { name: "Driver's License", status: "verified", expiryDate: "2027-06-15" },
  { name: "Vehicle Insurance", status: "verified", expiryDate: "2025-12-10" },
  { name: "Background Check", status: "verified", expiryDate: "2026-04-25" },
  {
    name: "Food Handling Certificate",
    status: "verified",
    expiryDate: "2025-09-30",
  },
];

const DriverDetail = () => {
  const { id } = useParams();
  const [driver, setDriver] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  useEffect(() => {
    // Find driver by ID from our dummy data
    const driverData = drivers.find((d) => d.id === parseInt(id));
    setDriver(driverData || drivers[0]); // Use first driver as fallback
  }, [id]);

  if (!driver) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const handleBack = () => {
    navigate("/drivers");
  };

  // Format rating stars
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-5 h-5 ${
            i < Math.floor(rating)
              ? "text-yellow-400 fill-yellow-400"
              : "text-gray-300"
          }`}
        />
      );
    }
    return stars;
  };

  return (
    <div className="px-6 py-4">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={handleBack}
          className="flex items-center text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 mr-4"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          <span>Back to Drivers</span>
        </button>
        <h1 className="text-2xl font-bold flex-1 dark:text-white">
          Driver Details
        </h1>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Edit Profile
          </button>
          <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
            Suspend Driver
          </button>
        </div>
      </div>

      {/* Driver Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/4 flex flex-col items-center mb-4 md:mb-0">
            <img
              src={`/api/placeholder/150/150`}
              alt={driver.name}
              className="w-32 h-32 rounded-full object-cover border-4 border-blue-100 dark:border-blue-900"
            />
            <h2 className="text-xl font-bold mt-4 dark:text-white">
              {driver.name}
            </h2>
            <div className="flex items-center mt-2">
              {renderStars(driver.rating)}
              <span className="ml-2 text-gray-600 dark:text-gray-300">
                {driver.rating}
              </span>
            </div>
            <div
              className={`mt-2 px-3 py-1 rounded-full text-sm ${
                driver.status === "active"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : driver.status === "inactive"
                  ? "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              }`}
            >
              {driver.status.charAt(0).toUpperCase() + driver.status.slice(1)}
            </div>
          </div>

          <div className="md:w-3/4 md:pl-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
                <span className="dark:text-white">{driver.phone}</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
                <span className="dark:text-white">{driver.email}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
                <span className="dark:text-white">{driver.address}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
                <span className="dark:text-white">
                  Joined: {driver.joinDate}
                </span>
              </div>
              <div className="flex items-center">
                <Truck className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
                <span className="dark:text-white">
                  {driver.vehicleModel} ({driver.vehiclePlate})
                </span>
              </div>
              <div className="flex items-center">
                <Award className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
                <span className="dark:text-white">
                  {driver.completedDeliveries} Deliveries Completed
                </span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-md">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Earnings (Monthly)
                </p>
                <p className="text-lg font-bold text-blue-700 dark:text-blue-400">
                  ${driver.earnings.toFixed(2)}
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-md">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Acceptance Rate
                </p>
                <p className="text-lg font-bold text-green-700 dark:text-green-400">
                  {driver.acceptanceRate}%
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-md">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  On-time Rate
                </p>
                <p className="text-lg font-bold text-purple-700 dark:text-purple-400">
                  {driver.onTimeRate}%
                </p>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-md">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Customer Rating
                </p>
                <p className="text-lg font-bold text-yellow-700 dark:text-yellow-400">
                  {driver.rating} / 5
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "overview"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("deliveries")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "deliveries"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            Deliveries
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "payments"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            Payments
          </button>
          <button
            onClick={() => setActiveTab("documents")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "documents"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            Documents
          </button>
          <button
            onClick={() => setActiveTab("incidents")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "incidents"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            Incidents
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div>
          {/* Performance Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <h3 className="text-lg font-semibold mb-4 dark:text-white">
                Delivery Performance
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="deliveries" fill="#3B82F6" name="Deliveries" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <h3 className="text-lg font-semibold mb-4 dark:text-white">
                Earnings History
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="earnings"
                    stroke="#10B981"
                    name="Earnings ($)"
                  />
                  <Line
                    type="monotone"
                    dataKey="rating"
                    stroke="#F59E0B"
                    name="Rating"
                    yAxisId={1}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <h3 className="text-lg font-semibold mb-4 dark:text-white">
                Recent Deliveries
              </h3>
              <div className="space-y-3">
                {recentDeliveries.slice(0, 3).map((delivery) => (
                  <div
                    key={delivery.id}
                    className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3"
                  >
                    <div>
                      <div className="font-medium dark:text-white">
                        {delivery.restaurant}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {delivery.id} • {delivery.date}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium text-gray-800 dark:text-gray-200 mr-3">
                        ${delivery.amount.toFixed(2)}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        {delivery.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="text-blue-600 dark:text-blue-400 text-sm mt-4 hover:underline">
                View all deliveries
              </button>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <h3 className="text-lg font-semibold mb-4 dark:text-white">
                Recent Payments
              </h3>
              <div className="space-y-3">
                {recentPayments.slice(0, 3).map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3"
                  >
                    <div>
                      <div className="font-medium dark:text-white">
                        {payment.id}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {payment.date}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium text-gray-800 dark:text-gray-200 mr-3">
                        ${payment.amount.toFixed(2)}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        {payment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="text-blue-600 dark:text-blue-400 text-sm mt-4 hover:underline">
                View all payments
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "deliveries" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold dark:text-white">
              Delivery History
            </h3>
            <div className="flex space-x-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search deliveries..."
                  className="pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option>All Time</option>
                <option>This Month</option>
                <option>Last Month</option>
                <option>Last 3 Months</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Restaurant
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Customer
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Amount
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Rating
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {recentDeliveries.map((delivery) => (
                  <tr
                    key={delivery.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 dark:text-blue-400">
                      {delivery.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                      {delivery.restaurant}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                      {delivery.customer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                      ${delivery.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                      {delivery.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        {delivery.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {renderStars(delivery.rating)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing 1 to {recentDeliveries.length} of{" "}
              {recentDeliveries.length} results
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300">
                Previous
              </button>
              <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300">
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "payments" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold dark:text-white">
              Payment History
            </h3>
            <div className="flex space-x-2">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Process Payment
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-md">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Current Balance
              </p>
              <p className="text-xl font-bold text-green-700 dark:text-green-400">
                ${(1243.75).toFixed(2)}
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-md">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Earnings (YTD)
              </p>
              <p className="text-xl font-bold text-blue-700 dark:text-blue-400">
                ${(14625.5).toFixed(2)}
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-md">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Next Payment Date
              </p>
              <p className="text-xl font-bold text-purple-700 dark:text-purple-400">
                April 30, 2025
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Payment ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Amount
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {recentPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 dark:text-blue-400">
                      {payment.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                      {payment.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                      ${payment.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                      <button className="text-blue-600 dark:text-blue-400 hover:underline">
                        View Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing 1 to {recentPayments.length} of {recentPayments.length}{" "}
              results
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300">
                Previous
              </button>
              <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300">
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "documents" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold dark:text-white">
              Driver Documents
            </h3>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Request New Document
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {documents.map((doc, index) => (
              <div
                key={index}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <FileText className="w-10 h-10 text-blue-500 mr-3" />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {doc.name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Expires: {doc.expiryDate}
                      </p>
                    </div>
                  </div>
                  {doc.status === "verified" ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      <Clock className="w-3 h-3 mr-1" />
                      Pending
                    </span>
                  )}
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <button className="text-blue-600 dark:text-blue-400 text-sm hover:underline flex items-center">
                    View Document
                  </button>
                  <div>
                    {new Date(doc.expiryDate) <
                      new Date(
                        new Date().setMonth(new Date().getMonth() + 3)
                      ) && (
                      <p className="text-xs text-orange-500">Expiring soon</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-4">
              Document History
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
                  <span className="text-gray-800 dark:text-gray-200">
                    Driver's License renewed
                  </span>
                </div>
                <span className="text-gray-500 dark:text-gray-400">
                  March 15, 2025
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
                  <span className="text-gray-800 dark:text-gray-200">
                    Vehicle Insurance updated
                  </span>
                </div>
                <span className="text-gray-500 dark:text-gray-400">
                  February 10, 2025
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
                  <span className="text-gray-800 dark:text-gray-200">
                    Background Check completed
                  </span>
                </div>
                <span className="text-gray-500 dark:text-gray-400">
                  January 25, 2025
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "incidents" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold dark:text-white">
              Incident Reports
            </h3>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Report New Incident
            </button>
          </div>

          {recentIncidents.length > 0 ? (
            <div className="space-y-6">
              {recentIncidents.map((incident) => (
                <div
                  key={incident.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex justify-between">
                    <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
                      <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
                      {incident.type}
                    </h4>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {incident.date}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">
                    {incident.description}
                  </p>
                  <div className="mt-4 bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Resolution:
                    </span>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {incident.resolution}
                    </p>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button className="text-blue-600 dark:text-blue-400 text-sm hover:underline">
                      View Full Report
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                No Incidents Reported
              </h4>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                This driver has no reported incidents.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DriverDetail;
