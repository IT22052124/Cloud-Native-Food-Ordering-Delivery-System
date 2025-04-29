import React, { useState } from "react";
import {
  FaMoneyBillWave,
  FaDownload,
  FaCalendarAlt,
  FaChartLine,
  FaChevronDown,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { RestaurantPayments, DriverPayments } from "./Payment";
import FinanceOverview from "./FinanceOverview.jsx";

// Using the finance data structure you provided
import { finance } from "../data/finance";

const Finance = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedTab, setSelectedTab] = useState("overview");

  // We don't have this in the provided data, but we can keep it for UI purposes
  const [dateRange, setDateRange] = useState({
    start: "2025-04-01",
    end: "2025-04-30",
  });

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "restaurantPayments", label: "Restaurant Payments" },
    { id: "driverPayments", label: "Driver Payments" },
    { id: "payouts", label: "Payouts" },
  ];

  const periodOptions = [
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "quarter", label: "This Quarter" },
    { value: "year", label: "This Year" },
  ];

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    // In a real app, this would update the date range based on the selected period
    // and fetch new data from the backend
  };

  // Helper function to format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Sample transactions based on the data structure
  const recentTransactions = [
    {
      id: "tr001",
      date: "2025-04-17",
      description: "Payment to Burger King",
      type: "expense",
      amount: 5876.5,
      status: "completed",
    },
    {
      id: "tr002",
      date: "2025-04-17",
      description: "Payment to Pizza Hut",
      type: "expense",
      amount: 4987.25,
      status: "completed",
    },
    {
      id: "tr003",
      date: "2025-04-24",
      description: "Payment to The Fancy Plate",
      type: "expense",
      amount: 6540.75,
      status: "pending",
    },
    {
      id: "tr004",
      date: "2025-04-15",
      description: "Revenue from online orders",
      type: "income",
      amount: 12540.5,
      status: "completed",
    },
    {
      id: "tr005",
      date: "2025-04-20",
      description: "Platform fee",
      type: "expense",
      amount: 3287.5,
      status: "completed",
    },
  ];

  // Convert monthly summary to revenue sources for the bar chart
  const revenueSources = [
    { name: "Platform Fees", value: finance.summary.platformFees },
    { name: "Processing Fees", value: finance.summary.paymentProcessingFees },
    { name: "Net Profit", value: finance.summary.netProfit },
    { name: "Pending Payouts", value: finance.summary.pendingPayouts },
  ];

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Financial Management
        </h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button className="flex items-center px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <FaCalendarAlt className="mr-2 text-gray-500 dark:text-gray-400" />
              <span>
                {
                  periodOptions.find(
                    (option) => option.value === selectedPeriod
                  )?.label
                }
              </span>
              <FaChevronDown className="ml-2 text-gray-500 dark:text-gray-400" />
            </button>
            {/* Period dropdown would go here */}
          </div>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center">
            <FaDownload className="mr-2" />
            <span>Export</span>
          </button>
        </div>
      </div>

      <div className="mb-6 border-b">
        <ul className="flex flex-wrap -mb-px">
          {tabs.map((tab) => (
            <li key={tab.id} className="mr-2">
              <button
                onClick={() => setSelectedTab(tab.id)}
                className={`inline-flex items-center px-4 py-2 font-medium text-sm rounded-t-lg ${
                  selectedTab === tab.id
                    ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-500 dark:border-blue-500"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {selectedTab === "payouts" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold dark:text-white">
              Recent Payouts
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
                    ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Recipient
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Amount
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
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Reference
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {finance.payouts.map((payout) => (
                  <tr
                    key={payout.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {payout.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {payout.recipient}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(payout.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          payout.status === "Paid"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                        }`}
                      >
                        {payout.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {payout.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {payout.reference}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {selectedTab === "restaurantPayments" && (
        <RestaurantPayments finance={finance} formatCurrency={formatCurrency} />
      )}

      {selectedTab === "driverPayments" && (
        <DriverPayments finance={finance} formatCurrency={formatCurrency} />
      )}

      {selectedTab === "overview" && <FinanceOverview />}
    </div>
  );
};

export default Finance;
