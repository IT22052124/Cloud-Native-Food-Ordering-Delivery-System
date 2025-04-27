import React, { useState } from "react";

// Simplified Restaurant Payment Management Component
const RestaurantPayments = () => {
  // State for payment filters
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [selectedRestaurant, setSelectedRestaurant] = useState("all");
  const [paymentPeriod, setPaymentPeriod] = useState("weekly");
  const [currentWeek, setCurrentWeek] = useState(17); // Current week number

  // Sample restaurant payment data - you would fetch this from your backend
  const restaurantPayments = [
    // Weekly payments for week 17 (current)
    {
      id: "WP001",
      weekNumber: 17,
      weekStartDate: "2025-04-21",
      weekEndDate: "2025-04-27",
      restaurantId: "rest1",
      restaurantName: "Burger King",
      ordersCount: 32,
      salesAmount: 5390.45,
      commissionRate: 0.15,
      commissionAmount: 808.57,
      taxAmount: 269.52,
      netPayable: 4312.36,
      paymentStatus: "scheduled",
      paymentDate: "2025-04-28",
      paymentMethod: "Direct Deposit",
      paymentPeriod: "weekly",
    },
    {
      id: "WP002",
      weekNumber: 17,
      weekStartDate: "2025-04-21",
      weekEndDate: "2025-04-27",
      restaurantId: "rest2",
      restaurantName: "Pizza Hut",
      ordersCount: 27,
      salesAmount: 4215.8,
      commissionRate: 0.18,
      commissionAmount: 758.84,
      taxAmount: 210.79,
      netPayable: 3246.17,
      paymentStatus: "scheduled",
      paymentDate: "2025-04-28",
      paymentMethod: "Bank Transfer",
      paymentPeriod: "weekly",
    },
    {
      id: "WP003",
      weekNumber: 17,
      weekStartDate: "2025-04-21",
      weekEndDate: "2025-04-27",
      restaurantId: "rest3",
      restaurantName: "The Fancy Plate",
      ordersCount: 18,
      salesAmount: 3580.65,
      commissionRate: 0.2,
      commissionAmount: 716.13,
      taxAmount: 179.03,
      netPayable: 2685.49,
      paymentStatus: "pending",
      paymentDate: "2025-04-28",
      paymentMethod: "Direct Deposit",
      paymentPeriod: "weekly",
    },
    // Weekly payments for week 16 (previous)
    {
      id: "WP004",
      weekNumber: 16,
      weekStartDate: "2025-04-14",
      weekEndDate: "2025-04-20",
      restaurantId: "rest1",
      restaurantName: "Burger King",
      ordersCount: 35,
      salesAmount: 6120.25,
      commissionRate: 0.15,
      commissionAmount: 918.04,
      taxAmount: 306.01,
      netPayable: 4896.2,
      paymentStatus: "paid",
      paymentDate: "2025-04-21",
      paymentMethod: "Direct Deposit",
      paymentPeriod: "weekly",
    },
    {
      id: "WP005",
      weekNumber: 16,
      weekStartDate: "2025-04-14",
      weekEndDate: "2025-04-20",
      restaurantId: "rest2",
      restaurantName: "Pizza Hut",
      ordersCount: 24,
      salesAmount: 3895.6,
      commissionRate: 0.18,
      commissionAmount: 701.21,
      taxAmount: 194.78,
      netPayable: 2999.61,
      paymentStatus: "paid",
      paymentDate: "2025-04-21",
      paymentMethod: "Bank Transfer",
      paymentPeriod: "weekly",
    },
    // Monthly payments
    {
      id: "MP001",
      month: "April",
      monthStartDate: "2025-04-01",
      monthEndDate: "2025-04-30",
      restaurantId: "rest1",
      restaurantName: "Burger King",
      ordersCount: 142,
      salesAmount: 24750.8,
      commissionRate: 0.15,
      commissionAmount: 3712.62,
      taxAmount: 1237.54,
      netPayable: 19800.64,
      paymentStatus: "pending",
      paymentDate: "2025-05-01",
      paymentMethod: "Direct Deposit",
      paymentPeriod: "monthly",
    },
    {
      id: "MP002",
      month: "April",
      monthStartDate: "2025-04-01",
      monthEndDate: "2025-04-30",
      restaurantId: "rest2",
      restaurantName: "Pizza Hut",
      ordersCount: 109,
      salesAmount: 18632.45,
      commissionRate: 0.18,
      commissionAmount: 3353.84,
      taxAmount: 931.62,
      netPayable: 14347.99,
      paymentStatus: "pending",
      paymentDate: "2025-05-01",
      paymentMethod: "Bank Transfer",
      paymentPeriod: "monthly",
    },
    {
      id: "MP003",
      month: "March",
      monthStartDate: "2025-03-01",
      monthEndDate: "2025-03-31",
      restaurantId: "rest3",
      restaurantName: "The Fancy Plate",
      ordersCount: 78,
      salesAmount: 15980.25,
      commissionRate: 0.2,
      commissionAmount: 3196.05,
      taxAmount: 799.01,
      netPayable: 11985.19,
      paymentStatus: "paid",
      paymentDate: "2025-04-01",
      paymentMethod: "Direct Deposit",
      paymentPeriod: "monthly",
    },
  ];

  // Filter payments based on selected filters
  const filteredPayments = restaurantPayments.filter((payment) => {
    // Filter by payment status
    if (paymentStatus !== "all" && payment.paymentStatus !== paymentStatus) {
      return false;
    }

    // Filter by restaurant
    if (
      selectedRestaurant !== "all" &&
      payment.restaurantId !== selectedRestaurant
    ) {
      return false;
    }

    // Filter by payment period
    if (payment.paymentPeriod !== paymentPeriod) {
      return false;
    }

    return true;
  });

  // Get unique restaurant list for the filter dropdown
  const restaurants = [
    ...new Set(restaurantPayments.map((p) => p.restaurantId)),
  ].map((id) => {
    const restaurant = restaurantPayments.find((p) => p.restaurantId === id);
    return {
      id: restaurant.restaurantId,
      name: restaurant.restaurantName,
    };
  });

  // Get counts for summary cards
  const scheduledCount = restaurantPayments.filter(
    (p) => p.paymentStatus === "scheduled" && p.paymentPeriod === paymentPeriod
  ).length;
  const pendingCount = restaurantPayments.filter(
    (p) => p.paymentStatus === "pending" && p.paymentPeriod === paymentPeriod
  ).length;
  const totalPayable = restaurantPayments
    .filter((p) => p.paymentPeriod === paymentPeriod)
    .reduce((sum, payment) => sum + payment.netPayable, 0);

  // Format currency function
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Format date function
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  // Helper function for payment status badge styling
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "scheduled":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  // Process selected payments function
  const processSelectedPayments = () => {
    // Logic to process payments would go here
    alert("Processing selected payments...");
  };

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <h2 className="text-xl font-bold mb-4 md:mb-0 dark:text-white">
          Restaurant Payments
        </h2>
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
          <div>
            <select
              className="form-select rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={paymentPeriod}
              onChange={(e) => setPaymentPeriod(e.target.value)}
            >
              <option value="weekly">Weekly Payments</option>
              <option value="monthly">Monthly Payments</option>
            </select>
          </div>
          <div>
            <select
              className="form-select rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div>
            <select
              className="form-select rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={selectedRestaurant}
              onChange={(e) => setSelectedRestaurant(e.target.value)}
            >
              <option value="all">All Restaurants</option>
              {restaurants.map((restaurant) => (
                <option key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </option>
              ))}
            </select>
          </div>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            onClick={processSelectedPayments}
          >
            Process Payments
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-2 dark:text-white">
            {paymentPeriod === "weekly" ? "Current Week" : "Current Month"}
          </h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {paymentPeriod === "weekly" ? `Week ${currentWeek}` : "April 2025"}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {paymentPeriod === "weekly"
              ? "April 21 - April 27, 2025"
              : "April 1 - April 30, 2025"}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-2 dark:text-white">
            {scheduledCount > 0 ? "Scheduled Payments" : "Pending Payments"}
          </h3>
          <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
            {scheduledCount > 0 ? scheduledCount : pendingCount}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {scheduledCount > 0
              ? `Next payment date: ${
                  paymentPeriod === "weekly" ? "April 28, 2025" : "May 1, 2025"
                }`
              : "Awaiting processing"}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-2 dark:text-white">
            Total Payable
          </h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(totalPayable)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            For all restaurants
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold dark:text-white">
            {paymentPeriod === "weekly"
              ? "Weekly Payment History"
              : "Monthly Payment History"}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Restaurant
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  {paymentPeriod === "weekly" ? "Week Period" : "Month"}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Orders
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Sales
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Commission
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Net Payable
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Payment Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {filteredPayments.map((payment) => (
                <tr
                  key={payment.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-blue-600"
                      disabled={payment.paymentStatus === "paid"}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {payment.restaurantName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {payment.restaurantId}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {paymentPeriod === "weekly"
                        ? `Week ${payment.weekNumber}`
                        : payment.month}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {paymentPeriod === "weekly"
                        ? `${formatDate(payment.weekStartDate)} - ${formatDate(
                            payment.weekEndDate
                          )}`
                        : `${formatDate(payment.monthStartDate)} - ${formatDate(
                            payment.monthEndDate
                          )}`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {payment.ordersCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatCurrency(payment.salesAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {formatCurrency(payment.commissionAmount)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      ({(payment.commissionRate * 100).toFixed(1)}%)
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(payment.netPayable)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                        payment.paymentStatus
                      )}`}
                    >
                      {payment.paymentStatus.charAt(0).toUpperCase() +
                        payment.paymentStatus.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(payment.paymentDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3">
                      View
                    </button>
                    {(payment.paymentStatus === "scheduled" ||
                      payment.paymentStatus === "pending") && (
                      <button className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">
                        Process
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredPayments.length} payments
          </div>
          <div>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg mr-2">
              Process Selected
            </button>
            <button className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg">
              Download Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


import { PieChart, BarChart } from "recharts";
import {
  AlertCircle,
  Check,
  CreditCard,
  Download,
  DollarSign,
  Eye,
  FileText,
  PlusCircle,
  RefreshCw,
  Search,
  Truck,
  Users,
} from "lucide-react";

const DriverPayments = () => {
  // State for driver payment filters and data
  const [driverPaymentStatus, setDriverPaymentStatus] = useState("all");
  const [selectedDriver, setSelectedDriver] = useState("all");
  const [selectedWeek, setSelectedWeek] = useState("current");
  const [showCodSubmissionForm, setShowCodSubmissionForm] = useState(false);
  const [codSubmissionDriver, setCodSubmissionDriver] = useState("");
  const [codSubmissionAmount, setCodSubmissionAmount] = useState("");
  const [codSubmissionDate, setCodSubmissionDate] = useState("");
  const [codSubmissionNotes, setCodSubmissionNotes] = useState("");
  const [showManualIncomeForm, setShowManualIncomeForm] = useState(false);
  const [showBulkPaymentModal, setShowBulkPaymentModal] = useState(false);
  const [selectedPayments, setSelectedPayments] = useState([]);
  const [quickSearchTerm, setQuickSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("settlements");
  const [showPaymentDetailsModal, setShowPaymentDetailsModal] = useState(false);
  const [selectedPaymentDetail, setSelectedPaymentDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sample driver payment data - you would fetch this from your backend
  const driverPayments = [
    {
      id: "DP001",
      driverId: "driver1",
      driverName: "John Smith",
      deliveriesCount: 78,
      deliveryFees: 1170.0,
      tips: 546.8,
      totalEarnings: 1716.8,
      codCollected: 3450.75,
      codSubmitted: 3450.75,
      codDifference: 0,
      netPayable: 1716.8,
      paymentStatus: "paid",
      paymentDate: "2025-04-15",
      paymentMethod: "Direct Deposit",
      weekEnding: "2025-04-20",
      codSubmissions: [
        { date: "2025-04-14", amount: 1725.38, status: "verified" },
        { date: "2025-04-17", amount: 1725.37, status: "verified" },
      ],
      paymentHistory: [
        {
          date: "2025-04-15",
          amount: 1716.8,
          method: "Direct Deposit",
          reference: "REF-45632",
        },
      ],
      contactInfo: {
        email: "john.smith@example.com",
        phone: "555-123-4567",
        preferredPaymentMethod: "Direct Deposit",
        bankDetails: {
          accountName: "John Smith",
          accountNumber: "****3456",
          routingNumber: "****7890",
        },
      },
    },
    {
      id: "DP002",
      driverId: "driver2",
      driverName: "Emily Johnson",
      deliveriesCount: 64,
      deliveryFees: 960.0,
      tips: 482.5,
      totalEarnings: 1442.5,
      codCollected: 2845.3,
      codSubmitted: 2845.3,
      codDifference: 0,
      netPayable: 1442.5,
      paymentStatus: "pending",
      paymentDate: "2025-04-30",
      paymentMethod: "Bank Transfer",
      weekEnding: "2025-04-27",
      codSubmissions: [
        { date: "2025-04-24", amount: 1422.65, status: "verified" },
        { date: "2025-04-26", amount: 1422.65, status: "pending" },
      ],
      paymentHistory: [],
      contactInfo: {
        email: "emily.johnson@example.com",
        phone: "555-234-5678",
        preferredPaymentMethod: "Bank Transfer",
        bankDetails: {
          accountName: "Emily Johnson",
          accountNumber: "****5678",
          routingNumber: "****1234",
        },
      },
    },
    {
      id: "DP003",
      driverId: "driver3",
      driverName: "Michael Wilson",
      deliveriesCount: 82,
      deliveryFees: 1230.0,
      tips: 615.4,
      totalEarnings: 1845.4,
      codCollected: 4120.85,
      codSubmitted: 3950.6,
      codDifference: 170.25,
      netPayable: 1675.15,
      paymentStatus: "processing",
      paymentDate: "2025-04-28",
      paymentMethod: "Digital Wallet",
      weekEnding: "2025-04-27",
      codSubmissions: [
        { date: "2025-04-22", amount: 2150.3, status: "verified" },
        { date: "2025-04-25", amount: 1800.3, status: "pending" },
      ],
      paymentHistory: [],
      contactInfo: {
        email: "michael.wilson@example.com",
        phone: "555-345-6789",
        preferredPaymentMethod: "Digital Wallet",
        digitalWallet: "wallet-id-45678",
      },
    },
    {
      id: "DP004",
      driverId: "driver4",
      driverName: "Sarah Brown",
      deliveriesCount: 56,
      deliveryFees: 840.0,
      tips: 367.9,
      totalEarnings: 1207.9,
      codCollected: 2175.45,
      codSubmitted: 2175.45,
      codDifference: 0,
      netPayable: 1207.9,
      paymentStatus: "paid",
      paymentDate: "2025-04-15",
      paymentMethod: "Direct Deposit",
      weekEnding: "2025-04-20",
      codSubmissions: [
        { date: "2025-04-13", amount: 1087.73, status: "verified" },
        { date: "2025-04-16", amount: 1087.72, status: "verified" },
      ],
      paymentHistory: [
        {
          date: "2025-04-15",
          amount: 1207.9,
          method: "Direct Deposit",
          reference: "REF-45789",
        },
      ],
      contactInfo: {
        email: "sarah.brown@example.com",
        phone: "555-456-7890",
        preferredPaymentMethod: "Direct Deposit",
        bankDetails: {
          accountName: "Sarah Brown",
          accountNumber: "****7890",
          routingNumber: "****4567",
        },
      },
    },
    {
      id: "DP005",
      driverId: "driver5",
      driverName: "David Lee",
      deliveriesCount: 72,
      deliveryFees: 1080.0,
      tips: 524.6,
      totalEarnings: 1604.6,
      codCollected: 3275.2,
      codSubmitted: 3125.8,
      codDifference: 149.4,
      netPayable: 1455.2,
      paymentStatus: "failed",
      paymentDate: "2025-04-15",
      paymentMethod: "Bank Transfer",
      weekEnding: "2025-04-20",
      codSubmissions: [
        { date: "2025-04-12", amount: 1650.5, status: "verified" },
        { date: "2025-04-15", amount: 1475.3, status: "verified" },
      ],
      paymentHistory: [
        {
          date: "2025-04-15",
          amount: 1455.2,
          method: "Bank Transfer",
          reference: "REF-FAILED",
          status: "Failed",
        },
      ],
      contactInfo: {
        email: "david.lee@example.com",
        phone: "555-567-8901",
        preferredPaymentMethod: "Bank Transfer",
        bankDetails: {
          accountName: "David Lee",
          accountNumber: "****2345",
          routingNumber: "****8901",
        },
      },
    },
  ];

  // Sample payment history data
  const paymentHistory = [
    {
      batchId: "PAY-20250420-001",
      weekEnding: "2025-04-20",
      totalAmount: 12650.7,
      driversCount: 35,
      status: "Completed",
      processedDate: "2025-04-21",
    },
    {
      batchId: "PAY-20250413-001",
      weekEnding: "2025-04-13",
      totalAmount: 13845.25,
      driversCount: 38,
      status: "Completed",
      processedDate: "2025-04-14",
    },
    {
      batchId: "PAY-20250406-001",
      weekEnding: "2025-04-06",
      totalAmount: 14230.8,
      driversCount: 40,
      status: "Completed",
      processedDate: "2025-04-07",
    },
    {
      batchId: "PAY-20250330-001",
      weekEnding: "2025-03-30",
      totalAmount: 13125.45,
      driversCount: 37,
      status: "Completed",
      processedDate: "2025-03-31",
    },
  ];

  // Available weeks for filtering
  const availableWeeks = [
    { value: "current", label: "Current Week (Apr 21 - Apr 27)" },
    { value: "2025-04-20", label: "Apr 14 - Apr 20, 2025" },
    { value: "2025-04-13", label: "Apr 7 - Apr 13, 2025" },
    { value: "2025-04-06", label: "Mar 31 - Apr 6, 2025" },
    { value: "2025-03-30", label: "Mar 24 - Mar 30, 2025" },
  ];

  // Payment statistics for visualization
  const paymentStatistics = {
    paymentMethods: [
      { name: "Direct Deposit", value: 65 },
      { name: "Bank Transfer", value: 25 },
      { name: "Digital Wallet", value: 10 },
    ],
    weeklyPayments: [
      { week: "Mar 24", amount: 13125.45 },
      { week: "Mar 31", amount: 14230.8 },
      { week: "Apr 7", amount: 13845.25 },
      { week: "Apr 14", amount: 12650.7 },
      { week: "Apr 21", amount: 13750.2 },
    ],
  };

  // Filter drivers based on selected status and week
  const filteredDriverPayments = driverPayments.filter((payment) => {
    // Quick search filter
    if (
      quickSearchTerm &&
      !payment.driverName.toLowerCase().includes(quickSearchTerm.toLowerCase())
    ) {
      return false;
    }

    // Status filter
    if (
      driverPaymentStatus !== "all" &&
      payment.paymentStatus !== driverPaymentStatus
    ) {
      return false;
    }

    // Driver filter
    if (selectedDriver !== "all" && payment.driverId !== selectedDriver) {
      return false;
    }

    // Week filter
    if (selectedWeek !== "current" && payment.weekEnding !== selectedWeek) {
      return false;
    }

    return true;
  });

  // Filter payment history based on selected week
  const filteredPaymentHistory =
    selectedWeek === "current"
      ? paymentHistory
      : paymentHistory.filter((batch) => batch.weekEnding === selectedWeek);

  // Get unique driver list for the filter dropdown
  const drivers = [...new Set(driverPayments.map((p) => p.driverId))].map(
    (id) => {
      const driver = driverPayments.find((p) => p.driverId === id);
      return {
        id: driver.driverId,
        name: driver.driverName,
      };
    }
  );

  // Format currency function
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Handle bulk selection
  const handleSelectPayment = (paymentId) => {
    if (selectedPayments.includes(paymentId)) {
      setSelectedPayments(selectedPayments.filter((id) => id !== paymentId));
    } else {
      setSelectedPayments([...selectedPayments, paymentId]);
    }
  };

  // Handle select all payments
  const handleSelectAllPayments = (e) => {
    if (e.target.checked) {
      setSelectedPayments(filteredDriverPayments.map((payment) => payment.id));
    } else {
      setSelectedPayments([]);
    }
  };

  // Handle COD submission form
  const handleCodSubmission = (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Success message
      alert(
        `COD amount of ${formatCurrency(
          codSubmissionAmount
        )} recorded from driver ${codSubmissionDriver}`
      );

      // Reset form
      setShowCodSubmissionForm(false);
      setCodSubmissionDriver("");
      setCodSubmissionAmount("");
      setCodSubmissionDate("");
      setCodSubmissionNotes("");
    }, 1000);
  };

  // Handle manual income marking
  const handleManualIncome = (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Success message
      alert("COD amount successfully marked as income");

      // Reset form
      setShowManualIncomeForm(false);
    }, 1000);
  };

  // Handle bulk payment processing
  const processBulkPayments = () => {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      alert(
        `${selectedPayments.length} payments have been processed successfully`
      );
      setShowBulkPaymentModal(false);
      setSelectedPayments([]);
    }, 1500);
  };

  // Handle automatic payment setup
  const initiateAutomaticPayment = () => {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      alert(
        "Automatic weekly payment has been scheduled for all eligible drivers"
      );
    }, 1200);
  };

  // View payment details
  const viewPaymentDetails = (payment) => {
    setSelectedPaymentDetail(payment);
    setShowPaymentDetailsModal(true);
  };

  // Helper function for payment status badge styling
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "verified":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  // Loading overlay component
  const LoadingOverlay = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <p className="text-gray-700 dark:text-gray-300">Processing...</p>
      </div>
    </div>
  );

  return (
    <div>
      {isLoading && <LoadingOverlay />}

      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold mb-2 dark:text-white">
            Driver Payments
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Manage driver payments, COD collections, and payment settlements
          </p>
        </div>
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 mt-4 md:mt-0">
          {/* Quick search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search driver..."
              className="pl-10 pr-4 py-2 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={quickSearchTerm}
              onChange={(e) => setQuickSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>

          {/* Week selector */}
          <div>
            <select
              className="form-select rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
            >
              {availableWeeks.map((week) => (
                <option key={week.value} value={week.value}>
                  {week.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              className="form-select rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={driverPaymentStatus}
              onChange={(e) => setDriverPaymentStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div>
            <select
              className="form-select rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={selectedDriver}
              onChange={(e) => setSelectedDriver(e.target.value)}
            >
              <option value="all">All Drivers</option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.name}
                </option>
              ))}
            </select>
          </div>

          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
            onClick={initiateAutomaticPayment}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Process Weekly Payment
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold mb-2 dark:text-white">
                Active Drivers
              </h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {drivers.length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full dark:bg-blue-900">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold mb-2 dark:text-white">
                Total Deliveries
              </h3>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {filteredDriverPayments.reduce(
                  (sum, payment) => sum + payment.deliveriesCount,
                  0
                )}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full dark:bg-purple-900">
              <Truck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold mb-2 dark:text-white">
                Pending Payments
              </h3>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {
                  filteredDriverPayments.filter(
                    (p) => p.paymentStatus === "pending"
                  ).length
                }
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full dark:bg-yellow-900">
              <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold mb-2 dark:text-white">
                Total Payable
              </h3>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(
                  filteredDriverPayments.reduce(
                    (sum, payment) => sum + payment.netPayable,
                    0
                  )
                )}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full dark:bg-green-900">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex flex-wrap -mb-px">
          <button
            className={`mr-4 inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "settlements"
                ? "border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("settlements")}
          >
            <CreditCard className="w-5 h-5 mr-2" />
            Payment Settlements
          </button>
          <button
            className={`mr-4 inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "cod"
                ? "border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("cod")}
          >
            <DollarSign className="w-5 h-5 mr-2" />
            COD Management
          </button>
          <button
            className={`mr-4 inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "history"
                ? "border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("history")}
          >
            <FileText className="w-5 h-5 mr-2" />
            Payment History
          </button>
          <button
            className={`mr-4 inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "analytics"
                ? "border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("analytics")}
          >
            <PieChart className="w-5 h-5 mr-2" />
            Payment Analytics
          </button>
        </nav>
      </div>

      {/* Action buttons based on active tab */}
      {activeTab === "settlements" && (
        <div className="mb-6 flex flex-wrap gap-3">
          <button
            className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center ${
              selectedPayments.length === 0
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            onClick={() =>
              selectedPayments.length > 0 && setShowBulkPaymentModal(true)
            }
            disabled={selectedPayments.length === 0}
          >
            <CreditCard className="w-5 h-5 mr-2" />
            Process Selected ({selectedPayments.length})
          </button>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg flex items-center">
            <Download className="w-5 h-5 mr-2" />
            Export Payment Data
          </button>
          <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg flex items-center">
            <RefreshCw className="w-5 h-5 mr-2" />
            Refresh Data
          </button>
        </div>
      )}

      {activeTab === "cod" && (
        <div className="mb-6 flex flex-wrap gap-3">
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg flex items-center"
            onClick={() => setShowCodSubmissionForm(true)}
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Record COD Submission
          </button>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center"
            onClick={() => setShowManualIncomeForm(true)}
          >
            <Check className="w-5 h-5 mr-2" />
            Mark COD as Income
          </button>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Generate COD Report
          </button>
        </div>
      )}

      {/* COD Submission Form Modal */}
      {showCodSubmissionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold dark:text-white">
                Record COD Submission
              </h3>
              <button
                onClick={() => setShowCodSubmissionForm(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>
            <form onSubmit={handleCodSubmission}>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  Select Driver
                </label>
                <select
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={codSubmissionDriver}
                  onChange={(e) => setCodSubmissionDriver(e.target.value)}
                  required
                >
                  <option value="">Select Driver</option>
                  {drivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  COD Amount
                </label>
                <input
                  type="number"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter amount"
                  value={codSubmissionAmount}
                  onChange={(e) => setCodSubmissionAmount(e.target.value)}
                  required
                  step="0.01"
                  min="0"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  Submission Date
                </label>
                <input
                  type="date"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={codSubmissionDate}
                  onChange={(e) => setCodSubmissionDate(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter notes"
                  value={codSubmissionNotes}
                  onChange={(e) => setCodSubmissionNotes(e.target.value)}
                  rows="3"
                ></textarea>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                  onClick={() => setShowCodSubmissionForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Income Form Modal */}
      {showManualIncomeForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold dark:text-white">
                Mark COD as Income
              </h3>
              <button
                onClick={() => setShowManualIncomeForm(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>
            <form onSubmit={handleManualIncome}>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  Select Driver
                </label>
                <select
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                >
                  <option value="">Select Driver</option>
                  {drivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  Select COD Submission
                </label>
                <select
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                >
                  <option value="">Select Submission</option>
                  <option value="sub1">$1,725.38 - Apr 14, 2025</option>
                  <option value="sub2">$1,422.65 - Apr 24, 2025</option>
                  <option value="sub3">$1,800.30 - Apr 25, 2025</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  Income Date
                </label>
                <input
                  type="date"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter notes"
                  rows="3"
                ></textarea>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                  onClick={() => setShowManualIncomeForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Payment Modal */}
      {showBulkPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold dark:text-white">
                Process Bulk Payments
              </h3>
              <button
                onClick={() => setShowBulkPaymentModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>
            <div className="mb-4">
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                You are about to process payments for {selectedPayments.length}{" "}
                drivers.
              </p>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 dark:bg-yellow-900/30 dark:border-yellow-500">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      This action will send payment to all selected drivers and
                      cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Payment Date
              </label>
              <input
                type="date"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                defaultValue={new Date().toISOString().split("T")[0]}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Payment Method
              </label>
              <select
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              >
                <option value="direct_deposit">Direct Deposit</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="digital_wallet">Digital Wallet</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                onClick={() => setShowBulkPaymentModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                onClick={processBulkPayments}
              >
                Process Payments
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Details Modal */}
      {showPaymentDetailsModal && selectedPaymentDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold dark:text-white">
                Payment Details - {selectedPaymentDetail.driverName}
              </h3>
              <button
                onClick={() => setShowPaymentDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300">
                  Payment Information
                </h4>
                <div className="mt-2 space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Payment ID:</span>{" "}
                    {selectedPaymentDetail.id}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Week Ending:</span>{" "}
                    {selectedPaymentDetail.weekEnding}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Status:</span>
                    <span
                      className={`ml-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(
                        selectedPaymentDetail.paymentStatus
                      )}`}
                    >
                      {selectedPaymentDetail.paymentStatus
                        .charAt(0)
                        .toUpperCase() +
                        selectedPaymentDetail.paymentStatus.slice(1)}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Payment Date:</span>{" "}
                    {selectedPaymentDetail.paymentDate || "Not paid yet"}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Payment Method:</span>{" "}
                    {selectedPaymentDetail.paymentMethod}
                  </p>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300">
                  Earnings Breakdown
                </h4>
                <div className="mt-2 space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Deliveries:</span>{" "}
                    {selectedPaymentDetail.deliveriesCount}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Delivery Fees:</span>{" "}
                    {formatCurrency(selectedPaymentDetail.deliveryFees)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Tips:</span>{" "}
                    {formatCurrency(selectedPaymentDetail.tips)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">COD Difference:</span>{" "}
                    {formatCurrency(selectedPaymentDetail.codDifference)}
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    <span className="font-medium">Net Payable:</span>{" "}
                    {formatCurrency(selectedPaymentDetail.netPayable)}
                  </p>
                </div>
              </div>
            </div>
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                COD Submissions
              </h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                    {selectedPaymentDetail.codSubmissions.map(
                      (submission, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {submission.date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {formatCurrency(submission.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(
                                submission.status
                              )}`}
                            >
                              {submission.status.charAt(0).toUpperCase() +
                                submission.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            {selectedPaymentDetail.paymentHistory.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payment History
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                          Method
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                          Reference
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                      {selectedPaymentDetail.paymentHistory.map(
                        (payment, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {payment.date}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {formatCurrency(payment.amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {payment.method}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {payment.reference}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                onClick={() => setShowPaymentDetailsModal(false)}
              >
                Close
              </button>
              <button className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center">
                <Eye className="w-4 h-4 mr-2" />
                View Full Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area based on active tab */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        {/* Payment Settlements Tab */}
        {activeTab === "settlements" && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="w-12 px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                      onChange={handleSelectAllPayments}
                      checked={
                        selectedPayments.length ===
                          filteredDriverPayments.length &&
                        filteredDriverPayments.length > 0
                      }
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Deliveries
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Earnings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    COD Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Net Payable
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {filteredDriverPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                        checked={selectedPayments.includes(payment.id)}
                        onChange={() => handleSelectPayment(payment.id)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {payment.driverName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {payment.deliveriesCount}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white font-medium">
                        {formatCurrency(payment.totalEarnings)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatCurrency(payment.deliveryFees)} +{" "}
                        {formatCurrency(payment.tips)} tips
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {payment.codDifference > 0 ? (
                          <span className="text-red-600 dark:text-red-400 font-medium">
                            {formatCurrency(payment.codDifference)} short
                          </span>
                        ) : (
                          <span className="text-green-600 dark:text-green-400 font-medium">
                            Fully Submitted
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatCurrency(payment.codSubmitted)} of{" "}
                        {formatCurrency(payment.codCollected)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                      {formatCurrency(payment.netPayable)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(
                          payment.paymentStatus
                        )}`}
                      >
                        {payment.paymentStatus.charAt(0).toUpperCase() +
                          payment.paymentStatus.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                        onClick={() => viewPaymentDetails(payment)}
                      >
                        View
                      </button>
                      <button className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300">
                        Pay
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* COD Management Tab */}
        {activeTab === "cod" && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    COD Collected
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    COD Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Difference
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Latest Submission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {filteredDriverPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {payment.driverName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formatCurrency(payment.codCollected)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formatCurrency(payment.codSubmitted)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {payment.codDifference > 0 ? (
                        <div className="text-sm text-red-600 dark:text-red-400 font-medium">
                          {formatCurrency(payment.codDifference)}
                        </div>
                      ) : (
                        <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                          $0.00
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {payment.codSubmissions.length > 0
                          ? payment.codSubmissions[
                              payment.codSubmissions.length - 1
                            ].date
                          : "No submissions"}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {payment.codSubmissions.length > 0
                          ? formatCurrency(
                              payment.codSubmissions[
                                payment.codSubmissions.length - 1
                              ].amount
                            )
                          : ""}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                        onClick={() => viewPaymentDetails(payment)}
                      >
                        View
                      </button>
                      <button
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        onClick={() => {
                          setCodSubmissionDriver(payment.driverId);
                          setShowCodSubmissionForm(true);
                        }}
                      >
                        Record
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Payment History Tab */}
        {activeTab === "history" && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Batch ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Week Ending
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Total Paid
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Drivers
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Processed Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {filteredPaymentHistory.map((batch) => (
                  <tr
                    key={batch.batchId}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {batch.batchId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {batch.weekEnding}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white font-medium">
                        {formatCurrency(batch.totalAmount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {batch.driversCount}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
                        {batch.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {batch.processedDate}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3">
                        View
                      </button>
                      <button className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300">
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Payment Analytics Dashboard */}
        {activeTab === "analytics" && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4 dark:text-white">
                  Payment Methods Distribution
                </h3>
                {/* Placeholder for PieChart */}
                <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400">
                    PieChart would render here
                  </p>
                </div>
                <div className="mt-4">
                  <div className="grid grid-cols-3 gap-2">
                    {paymentStatistics.paymentMethods.map((method, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div
                          className={`h-3 w-3 rounded-full ${
                            index === 0
                              ? "bg-blue-500"
                              : index === 1
                              ? "bg-green-500"
                              : "bg-purple-500"
                          }`}
                        ></div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {method.name}
                        </p>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {method.value}%
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4 dark:text-white">
                  Weekly Payment Trends
                </h3>
                {/* Placeholder for BarChart */}
                <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400">
                    BarChart would render here
                  </p>
                </div>
                <div className="mt-4 grid grid-cols-5 gap-2">
                  {paymentStatistics.weeklyPayments.map((week, index) => (
                    <div key={index} className="text-center">
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {week.week}
                      </p>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {formatCurrency(week.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 md:col-span-2">
                <h3 className="text-lg font-semibold mb-4 dark:text-white">
                  Payment Status Overview
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Paid
                    </p>
                    <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      {
                        filteredDriverPayments.filter(
                          (p) => p.paymentStatus === "paid"
                        ).length
                      }
                    </p>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${
                            (filteredDriverPayments.filter(
                              (p) => p.paymentStatus === "paid"
                            ).length /
                              filteredDriverPayments.length) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Pending
                    </p>
                    <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      {
                        filteredDriverPayments.filter(
                          (p) => p.paymentStatus === "pending"
                        ).length
                      }
                    </p>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{
                          width: `${
                            (filteredDriverPayments.filter(
                              (p) => p.paymentStatus === "pending"
                            ).length /
                              filteredDriverPayments.length) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Processing
                    </p>
                    <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      {
                        filteredDriverPayments.filter(
                          (p) => p.paymentStatus === "processing"
                        ).length
                      }
                    </p>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${
                            (filteredDriverPayments.filter(
                              (p) => p.paymentStatus === "processing"
                            ).length /
                              filteredDriverPayments.length) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Failed
                    </p>
                    <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      {
                        filteredDriverPayments.filter(
                          (p) => p.paymentStatus === "failed"
                        ).length
                      }
                    </p>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{
                          width: `${
                            (filteredDriverPayments.filter(
                              (p) => p.paymentStatus === "failed"
                            ).length /
                              filteredDriverPayments.length) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Export both components
export { RestaurantPayments, DriverPayments };
