import { useState, useEffect } from "react";
import {
  Calendar,
  Search,
  Filter,
  Download,
  ArrowUp,
  ArrowDown,
  DollarSign,
  CreditCard,
  Clock,
  Check,
} from "lucide-react";

// Dummy data for the Balance page
const balanceData = {
  totalAvailableBalance: 124680.5,
  pendingPayouts: 32450.75,
  completedPayouts: 284530.25,
  recentTransactions: [
    {
      id: "TRX-1234",
      type: "restaurant",
      name: "Tasty Bites",
      amount: 1245.8,
      status: "pending",
      date: "2025-04-22",
    },
    {
      id: "TRX-1235",
      type: "driver",
      name: "John Smith",
      amount: 345.25,
      status: "completed",
      date: "2025-04-22",
    },
    {
      id: "TRX-1236",
      type: "restaurant",
      name: "Pizza Paradise",
      amount: 2150.4,
      status: "processing",
      date: "2025-04-21",
    },
    {
      id: "TRX-1237",
      type: "driver",
      name: "Alice Johnson",
      amount: 412.75,
      status: "completed",
      date: "2025-04-21",
    },
    {
      id: "TRX-1238",
      type: "restaurant",
      name: "Burger Heaven",
      amount: 1875.3,
      status: "completed",
      date: "2025-04-20",
    },
    {
      id: "TRX-1239",
      type: "driver",
      name: "Robert Davis",
      amount: 298.5,
      status: "pending",
      date: "2025-04-20",
    },
    {
      id: "TRX-1240",
      type: "restaurant",
      name: "Sushi Delight",
      amount: 3240.15,
      status: "completed",
      date: "2025-04-19",
    },
  ],
  pendingPayments: [
    {
      id: "PAY-4321",
      type: "restaurant",
      name: "Tasty Bites",
      amount: 1245.8,
      dueDate: "2025-04-29",
    },
    {
      id: "PAY-4322",
      type: "driver",
      name: "Robert Davis",
      amount: 298.5,
      dueDate: "2025-04-28",
    },
    {
      id: "PAY-4323",
      type: "restaurant",
      name: "Pizza Paradise",
      amount: 2150.4,
      dueDate: "2025-04-27",
    },
    {
      id: "PAY-4324",
      type: "driver",
      name: "Michael Brown",
      amount: 387.65,
      dueDate: "2025-04-26",
    },
  ],
};

const BalancePage = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState("7days");
  const [loading, setLoading] = useState(false);
  const [showProcessPayouts, setShowProcessPayouts] = useState(false);

  useEffect(() => {
    setLoading(true);
    // Simulate data fetch
    setTimeout(() => setLoading(false), 800);
  }, [dateRange]);

  // Filter transactions based on search term
  const filteredTransactions = balanceData.recentTransactions.filter(
    (transaction) =>
      transaction.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProcessPayout = () => {
    setShowProcessPayouts(true);
  };

  const statusColors = {
    pending:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    completed:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    processing: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Balance Management</h1>
        <div className="flex space-x-2">
          <button
            onClick={handleProcessPayout}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
          >
            <CreditCard size={16} className="mr-2" />
            Process Payouts
          </button>
          <button className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600">
            <Download size={16} className="mr-2" />
            Export Statements
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Available Balance
              </p>
              <h3 className="text-2xl font-bold mt-1">
                ${balanceData.totalAvailableBalance.toLocaleString()}
              </h3>
            </div>
            <div className="rounded-full p-3 bg-blue-100 dark:bg-blue-900">
              <DollarSign
                size={24}
                className="text-blue-500 dark:text-blue-300"
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Pending Payouts
              </p>
              <h3 className="text-2xl font-bold mt-1">
                ${balanceData.pendingPayouts.toLocaleString()}
              </h3>
            </div>
            <div className="rounded-full p-3 bg-yellow-100 dark:bg-yellow-900">
              <Clock
                size={24}
                className="text-yellow-500 dark:text-yellow-300"
              />
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500 flex items-center">
            <ArrowUp size={14} className="text-yellow-500 mr-1" />
            <span>4 payments pending approval</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Completed Payouts
              </p>
              <h3 className="text-2xl font-bold mt-1">
                ${balanceData.completedPayouts.toLocaleString()}
              </h3>
            </div>
            <div className="rounded-full p-3 bg-green-100 dark:bg-green-900">
              <Check size={24} className="text-green-500 dark:text-green-300" />
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500 flex items-center">
            <ArrowDown size={14} className="text-green-500 mr-1" />
            <span>Last payout: April 22, 2025</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          className={`py-3 px-6 ${
            activeTab === "overview"
              ? "border-b-2 border-blue-500 font-medium text-blue-500"
              : "text-gray-500 dark:text-gray-400"
          }`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`py-3 px-6 ${
            activeTab === "transactions"
              ? "border-b-2 border-blue-500 font-medium text-blue-500"
              : "text-gray-500 dark:text-gray-400"
          }`}
          onClick={() => setActiveTab("transactions")}
        >
          Transactions
        </button>
        <button
          className={`py-3 px-6 ${
            activeTab === "pending"
              ? "border-b-2 border-blue-500 font-medium text-blue-500"
              : "text-gray-500 dark:text-gray-400"
          }`}
          onClick={() => setActiveTab("pending")}
        >
          Pending Payments
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="relative flex-grow max-w-md">
          <input
            type="text"
            placeholder="Search transactions, restaurants or drivers..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
        </div>

        <div className="flex space-x-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
            <option value="custom">Custom range</option>
          </select>

          <button className="flex items-center px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm">
            <Filter size={16} className="mr-2" />
            Filters
          </button>
        </div>
      </div>

      {/* Conditional Content based on Tab */}
      {activeTab === "overview" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-medium mb-4">Transaction Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Recent Activity
                </h3>
                <ul className="space-y-3">
                  {balanceData.recentTransactions
                    .slice(0, 5)
                    .map((transaction) => (
                      <li
                        key={transaction.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center">
                          <div
                            className={`${
                              transaction.type === "restaurant"
                                ? "bg-blue-100 dark:bg-blue-900"
                                : "bg-purple-100 dark:bg-purple-900"
                            } p-2 rounded-full mr-3`}
                          >
                            {transaction.type === "restaurant" ? (
                              <DollarSign
                                size={16}
                                className={
                                  transaction.type === "restaurant"
                                    ? "text-blue-500 dark:text-blue-300"
                                    : "text-purple-500 dark:text-purple-300"
                                }
                              />
                            ) : (
                              <CreditCard
                                size={16}
                                className={
                                  transaction.type === "restaurant"
                                    ? "text-blue-500 dark:text-blue-300"
                                    : "text-purple-500 dark:text-purple-300"
                                }
                              />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{transaction.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {transaction.id} • {transaction.date}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            ${transaction.amount.toLocaleString()}
                          </p>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              statusColors[transaction.status]
                            }`}
                          >
                            {transaction.status}
                          </span>
                        </div>
                      </li>
                    ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Upcoming Payments
                </h3>
                <ul className="space-y-3">
                  {balanceData.pendingPayments.map((payment) => (
                    <li
                      key={payment.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center">
                        <div
                          className={`${
                            payment.type === "restaurant"
                              ? "bg-blue-100 dark:bg-blue-900"
                              : "bg-purple-100 dark:bg-purple-900"
                          } p-2 rounded-full mr-3`}
                        >
                          {payment.type === "restaurant" ? (
                            <DollarSign
                              size={16}
                              className={
                                payment.type === "restaurant"
                                  ? "text-blue-500 dark:text-blue-300"
                                  : "text-purple-500 dark:text-purple-300"
                              }
                            />
                          ) : (
                            <CreditCard
                              size={16}
                              className={
                                payment.type === "restaurant"
                                  ? "text-blue-500 dark:text-blue-300"
                                  : "text-purple-500 dark:text-purple-300"
                              }
                            />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{payment.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {payment.id} • Due {payment.dueDate}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ${payment.amount.toLocaleString()}
                        </p>
                        <button className="text-xs text-blue-500 hover:text-blue-600">
                          Process now
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "transactions" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Transaction ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Recipient
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Type
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
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTransactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {transaction.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {transaction.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="capitalize">{transaction.type}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    ${transaction.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {transaction.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        statusColors[transaction.status]
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-500 hover:text-blue-600">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTransactions.length === 0 && (
            <div className="text-center py-6">
              <p className="text-gray-500 dark:text-gray-400">
                No transactions found with your search criteria.
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === "pending" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-medium mb-4">Pending Payments</h2>
            <div className="space-y-4">
              {balanceData.pendingPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div
                        className={`${
                          payment.type === "restaurant"
                            ? "bg-blue-100 dark:bg-blue-900"
                            : "bg-purple-100 dark:bg-purple-900"
                        } p-3 rounded-lg mr-4`}
                      >
                        {payment.type === "restaurant" ? (
                          <DollarSign
                            size={20}
                            className={
                              payment.type === "restaurant"
                                ? "text-blue-500 dark:text-blue-300"
                                : "text-purple-500 dark:text-purple-300"
                            }
                          />
                        ) : (
                          <CreditCard
                            size={20}
                            className={
                              payment.type === "restaurant"
                                ? "text-blue-500 dark:text-blue-300"
                                : "text-purple-500 dark:text-purple-300"
                            }
                          />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-lg">{payment.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {payment.id}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        ${payment.amount.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Due {payment.dueDate}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end space-x-2">
                    <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
                      View Details
                    </button>
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                      Process Payment
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Process Payouts Modal */}
      {showProcessPayouts && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Process Payouts</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Select recipients and enter amounts to process payments.
            </p>

            <div className="space-y-4 mb-6">
              {balanceData.pendingPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-3 h-4 w-4 text-blue-500"
                    />
                    <div>
                      <p className="font-medium">{payment.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {payment.type}
                      </p>
                    </div>
                  </div>
                  <p className="font-medium">
                    ${payment.amount.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowProcessPayouts(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                Process Selected
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BalancePage;
