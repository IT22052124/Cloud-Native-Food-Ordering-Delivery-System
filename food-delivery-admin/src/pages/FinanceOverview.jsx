import { useEffect, useState } from "react";
import {
  FaMoneyBillWave,
  FaChartLine,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { getAllOrders, getAllRestaurantSettlements } from "../utils/api";

export default function FinanceOverview() {
  const [isLoading, setIsLoading] = useState(true);
  const [financeData, setFinanceData] = useState({
    summary: {
      totalRevenue: 0,
      netProfit: 0,
      platformFees: 0,
      pendingPayouts: 0,
    },
    monthlySummary: [],
    revenueSources: [],
    recentTransactions: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [orders, settlements] = await Promise.all([
          getAllOrders(),
          getAllRestaurantSettlements(),
        ]);

        const processedData = processFinanceData(orders, settlements);
        setFinanceData(processedData);
      } catch (error) {
        console.error("Error fetching finance data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const processFinanceData = (orders, settlements) => {
    // Calculate summary metrics
    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );
    const platformFees = settlements.reduce(
      (sum, settlement) => sum + settlement.platformFee,
      0
    );
    const netProfit = platformFees;
    const pendingPayouts = settlements
      .filter((s) => s.status === "PENDING" || s.status === "PROCESSING")
      .reduce((sum, s) => sum + s.amountDue, 0);

    // Process monthly data
    const monthlyData = processMonthlyData(orders, settlements);

    // Process revenue sources
    const revenueSources = processRevenueSources(settlements);

    // Process recent transactions from orders
    const recentTransactions = processRecentTransactions(orders, settlements);

    return {
      summary: {
        totalRevenue,
        netProfit,
        platformFees,
        pendingPayouts,
      },
      monthlySummary: monthlyData,
      revenueSources,
      recentTransactions,
    };
  };

  const processMonthlyData = (orders, settlements) => {
    // Group data by month
    const monthlyMap = new Map();

    // Process orders
    orders.forEach((order) => {
      const date = new Date(order.createdAt);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      const monthName = date.toLocaleString("default", { month: "short" });

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, {
          month: monthName,
          revenue: 0,
          profit: 0,
        });
      }

      const monthData = monthlyMap.get(monthKey);
      monthData.revenue += order.totalAmount;
    });

    // Process settlements for profit data
    settlements.forEach((settlement) => {
      const date = new Date(settlement.weekEnding);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (monthlyMap.has(monthKey)) {
        const monthData = monthlyMap.get(monthKey);
        monthData.profit += settlement.platformFee;
      }
    });

    // Convert map to array and sort by month
    return Array.from(monthlyMap.values()).sort((a, b) => {
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      return months.indexOf(a.month) - months.indexOf(b.month);
    });
  };

  const processRevenueSources = (settlements) => {
    // Group revenue by restaurant
    const restaurantMap = new Map();

    settlements.forEach((settlement) => {
      if (!restaurantMap.has(settlement.restaurantId)) {
        restaurantMap.set(settlement.restaurantId, {
          name: settlement.restaurantName,
          value: 0,
        });
      }

      const restaurantData = restaurantMap.get(settlement.restaurantId);
      restaurantData.value += settlement.platformFee;
    });

    // Get top 5 restaurants by revenue
    const topRestaurants = Array.from(restaurantMap.values())
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Add "Others" category if needed
    if (restaurantMap.size > 5) {
      const othersValue = Array.from(restaurantMap.values())
        .sort((a, b) => b.value - a.value)
        .slice(5)
        .reduce((sum, item) => sum + item.value, 0);

      topRestaurants.push({ name: "Others", value: othersValue });
    }

    return topRestaurants;
  };

  const processRecentTransactions = (orders, settlements) => {
    // Combine orders and settlements into transactions
    const transactions = [];

    // Process recent orders (income)
    orders.slice(0, 5).forEach((order) => {
      transactions.push({
        id: order.orderId,
        date: new Date(order.createdAt).toLocaleDateString(),
        description: `Order from ${order.customerName}`,
        type: "income",
        amount: order.totalAmount,
        status: order.paymentStatus === "PAID" ? "completed" : "pending",
      });
    });

    // Process recent settlements (expense)
    settlements.slice(0, 5).forEach((settlement) => {
      transactions.push({
        id: `SET-${settlement._id.toString().slice(-6)}`,
        date: new Date(settlement.createdAt).toLocaleDateString(),
        description: `Settlement to ${settlement.restaurantName}`,
        type: "expense",
        amount: settlement.amountDue,
        status: settlement.status === "PAID" ? "completed" : "pending",
      });
    });

    // Sort by date (newest first) and take top 10
    return transactions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        Loading finance data...
      </div>
    );
  }

  const { summary, monthlySummary, revenueSources, recentTransactions } =
    financeData;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">
              Total Revenue
            </h3>
            <div className="p-2 bg-green-100 rounded-full">
              <FaMoneyBillWave className="text-green-600" />
            </div>
          </div>
          <div className="flex items-end">
            <p className="text-2xl font-bold dark:text-white">
              {formatCurrency(summary.totalRevenue)}
            </p>
            <p className="ml-2 text-sm text-green-600 flex items-center">
              <span className="flex items-center">
                <svg
                  className="w-3 h-3 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                8.4%
              </span>
            </p>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            vs previous period
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">
              Net Profit
            </h3>
            <div className="p-2 bg-blue-100 rounded-full">
              <FaChartLine className="text-blue-600" />
            </div>
          </div>
          <div className="flex items-end">
            <p className="text-2xl font-bold dark:text-white">
              {formatCurrency(summary.netProfit)}
            </p>
            <p className="ml-2 text-sm text-green-600 flex items-center">
              <span className="flex items-center">
                <svg
                  className="w-3 h-3 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                7.2%
              </span>
            </p>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            vs previous period
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">
              Platform Fees
            </h3>
            <div className="p-2 bg-purple-100 rounded-full">
              <svg
                className="text-purple-600 w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                ></path>
              </svg>
            </div>
          </div>
          <div className="flex items-end">
            <p className="text-2xl font-bold dark:text-white">
              {formatCurrency(summary.platformFees)}
            </p>
            <p className="ml-2 text-sm text-green-600 flex items-center">
              <span className="flex items-center">
                <svg
                  className="w-3 h-3 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                10%
              </span>
            </p>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            vs previous period
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">
              Pending Payouts
            </h3>
            <div className="p-2 bg-yellow-100 rounded-full">
              <svg
                className="text-yellow-600 w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                ></path>
              </svg>
            </div>
          </div>
          <div className="flex items-end">
            <p className="text-2xl font-bold dark:text-white">
              {formatCurrency(summary.pendingPayouts)}
            </p>
            <p className="ml-2 text-sm text-yellow-600 flex items-center">
              <span className="flex items-center">
                <svg
                  className="w-3 h-3 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                3.2%
              </span>
            </p>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            vs previous period
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold dark:text-white">
              Revenue Overview
            </h3>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded-full font-medium dark:bg-blue-900 dark:text-blue-300">
                Revenue
              </button>
              <button className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full font-medium dark:bg-gray-700 dark:text-gray-400">
                Profit
              </button>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={monthlySummary}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3B82F6"
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#10B981"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-6 dark:text-white">
            Revenue Distribution
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={revenueSources}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold dark:text-white">
            Recent Transactions
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
                  Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Description
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Type
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {recentTransactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    #{transaction.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {transaction.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {transaction.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        transaction.type === "income"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                      }`}
                    >
                      {transaction.type.charAt(0).toUpperCase() +
                        transaction.type.slice(1)}
                    </span>
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      transaction.type === "income"
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {transaction.status === "completed" ? (
                        <FaCheckCircle className="text-green-500 mr-2" />
                      ) : (
                        <FaExclamationCircle className="text-yellow-500 mr-2" />
                      )}
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {transaction.status.charAt(0).toUpperCase() +
                          transaction.status.slice(1)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
