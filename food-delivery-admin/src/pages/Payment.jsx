import React, { useState } from "react";

// Restaurant Payment Management Component
const RestaurantPayments = () => {
  // State for restaurant payment filters
  const [restaurantPaymentStatus, setRestaurantPaymentStatus] = useState("all");
  const [selectedRestaurant, setSelectedRestaurant] = useState("all");

  // Sample restaurant payment data - you would fetch this from your backend
  const restaurantPayments = [
    {
      id: "RP001",
      restaurantId: "rest1",
      restaurantName: "Burger King",
      ordersCount: 142,
      salesAmount: 24750.8,
      commissionRate: 0.15,
      commissionAmount: 3712.62,
      taxAmount: 1237.54,
      netPayable: 19800.64,
      paymentStatus: "paid",
      paymentDate: "2025-04-15",
      paymentMethod: "Direct Deposit",
      reference: "BK-APR15-2025",
    },
    {
      id: "RP002",
      restaurantId: "rest2",
      restaurantName: "Pizza Hut",
      ordersCount: 109,
      salesAmount: 18632.45,
      commissionRate: 0.18,
      commissionAmount: 3353.84,
      taxAmount: 931.62,
      netPayable: 14347.99,
      paymentStatus: "pending",
      paymentDate: "2025-04-30",
      paymentMethod: "Bank Transfer",
      reference: "PH-APR30-2025",
    },
    {
      id: "RP003",
      restaurantId: "rest3",
      restaurantName: "The Fancy Plate",
      ordersCount: 78,
      salesAmount: 15980.25,
      commissionRate: 0.2,
      commissionAmount: 3196.05,
      taxAmount: 799.01,
      netPayable: 11985.19,
      paymentStatus: "processing",
      paymentDate: "2025-04-28",
      paymentMethod: "Direct Deposit",
      reference: "TFP-APR28-2025",
    },
    {
      id: "RP004",
      restaurantId: "rest4",
      restaurantName: "Taco Palace",
      ordersCount: 94,
      salesAmount: 12560.7,
      commissionRate: 0.15,
      commissionAmount: 1884.11,
      taxAmount: 628.04,
      netPayable: 10048.56,
      paymentStatus: "paid",
      paymentDate: "2025-04-15",
      paymentMethod: "Digital Wallet",
      reference: "TP-APR15-2025",
    },
    {
      id: "RP005",
      restaurantId: "rest5",
      restaurantName: "Sushi Express",
      ordersCount: 67,
      salesAmount: 14985.3,
      commissionRate: 0.18,
      commissionAmount: 2697.35,
      taxAmount: 749.27,
      netPayable: 11538.68,
      paymentStatus: "failed",
      paymentDate: "2025-04-15",
      paymentMethod: "Bank Transfer",
      reference: "SE-APR15-2025",
    },
  ];

  // Filter restaurants based on selected status
  const filteredRestaurantPayments = restaurantPayments.filter((payment) => {
    if (
      restaurantPaymentStatus !== "all" &&
      payment.paymentStatus !== restaurantPaymentStatus
    ) {
      return false;
    }
    if (
      selectedRestaurant !== "all" &&
      payment.restaurantId !== selectedRestaurant
    ) {
      return false;
    }
    return true;
  });

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
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

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

  // Format currency function (reusing from your code)
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
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
              value={restaurantPaymentStatus}
              onChange={(e) => setRestaurantPaymentStatus(e.target.value)}
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
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
            Process Selected
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-2 dark:text-white">
            Total Restaurants
          </h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {restaurants.length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-2 dark:text-white">
            Pending Payments
          </h3>
          <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
            {
              restaurantPayments.filter((p) => p.paymentStatus === "pending")
                .length
            }
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-2 dark:text-white">
            Total Payable
          </h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(
              restaurantPayments.reduce(
                (sum, payment) => sum + payment.netPayable,
                0
              )
            )}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold dark:text-white">
            Restaurant Payment Settlements
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
              {filteredRestaurantPayments.map((payment) => (
                <tr
                  key={payment.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-blue-600"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {payment.restaurantName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {payment.restaurantId}
                        </div>
                      </div>
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
                    {payment.paymentDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3">
                      View
                    </button>
                    {payment.paymentStatus !== "paid" && (
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
      </div>

      <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold dark:text-white">
            COD Reconciliation
          </h3>
        </div>
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
            <div className="mb-4 md:mb-0">
              <h4 className="text-md font-medium dark:text-white">
                COD Collection Summary
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total COD orders with pending restaurant payments
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
                Mark as Reconciled
              </button>
              <button className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg">
                Download Report
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Total COD Collected
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(24680.5)}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Pending Reconciliation
              </div>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {formatCurrency(8750.25)}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Already Reconciled
              </div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(15930.25)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Driver Payment Management Component
const DriverPayments = () => {
  // State for driver payment filters
  const [driverPaymentStatus, setDriverPaymentStatus] = useState("all");
  const [selectedDriver, setSelectedDriver] = useState("all");

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
    },
  ];

  // Filter drivers based on selected status
  const filteredDriverPayments = driverPayments.filter((payment) => {
    if (
      driverPaymentStatus !== "all" &&
      payment.paymentStatus !== driverPaymentStatus
    ) {
      return false;
    }
    if (selectedDriver !== "all" && payment.driverId !== selectedDriver) {
      return false;
    }
    return true;
  });

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
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

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

  // Format currency function (reusing from your code)
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <h2 className="text-xl font-bold mb-4 md:mb-0 dark:text-white">
          Driver Payments
        </h2>
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
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
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
            Process Selected
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-2 dark:text-white">
            Active Drivers
          </h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {drivers.length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-2 dark:text-white">
            Total Deliveries
          </h3>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {driverPayments.reduce(
              (sum, payment) => sum + payment.deliveriesCount,
              0
            )}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-2 dark:text-white">
            Pending Payments
          </h3>
          <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
            {driverPayments.filter((p) => p.paymentStatus === "pending").length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-2 dark:text-white">
            Total Payable
          </h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(
              driverPayments.reduce(
                (sum, payment) => sum + payment.netPayable,
                0
              )
            )}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold dark:text-white">
            Driver Payment Settlements
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
                  Driver
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Deliveries
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Earnings
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  COD Collected
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  COD Difference
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
                      className="form-checkbox h-5 w-5 text-blue-600"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {payment.driverName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {payment.driverId}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {payment.deliveriesCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {formatCurrency(payment.totalEarnings)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Fees: {formatCurrency(payment.deliveryFees)} | Tips:{" "}
                      {formatCurrency(payment.tips)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatCurrency(payment.codCollected)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {payment.codDifference > 0 ? (
                      <span className="text-sm text-red-600 dark:text-red-400">
                        {formatCurrency(payment.codDifference)}
                      </span>
                    ) : (
                      <span className="text-sm text-green-600 dark:text-green-400">
                        {formatCurrency(payment.codDifference)}
                      </span>
                    )}
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3">
                      View
                    </button>
                    {payment.paymentStatus !== "paid" && (
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
      </div>

      <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold dark:text-white">
            Driver COD Collection
          </h3>
        </div>
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
            <div className="mb-4 md:mb-0">
              <h4 className="text-md font-medium dark:text-white">
                COD Collection Summary
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Summary of cash collected on delivery by drivers
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                Record Collection
              </button>
              <button className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg">
                Download Report
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Total COD Collected
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(
                  driverPayments.reduce(
                    (sum, payment) => sum + payment.codCollected,
                    0
                  )
                )}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                COD Submitted
              </div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(
                  driverPayments.reduce(
                    (sum, payment) => sum + payment.codSubmitted,
                    0
                  )
                )}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Total Differences
              </div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(
                  driverPayments.reduce(
                    (sum, payment) => sum + payment.codDifference,
                    0
                  )
                )}
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Important Note
                </h3>
                <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                  <p>
                    Drivers with COD differences need to reconcile their cash
                    collections. Please contact any driver with significant
                    discrepancies.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold dark:text-white">
            Payment History
          </h3>
        </div>
        <div className="p-6">
          <div className="flex flex-col space-y-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-md font-medium text-gray-900 dark:text-white">
                  April 15, 2025 Payment Batch
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Batch ID: PAY-20250415-001
                </div>
              </div>
              <div className="mt-2 md:mt-0 flex items-center">
                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 mr-4">
                  Completed
                </span>
                <span className="text-md font-medium text-gray-900 dark:text-white">
                  {formatCurrency(12650.7)}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-md font-medium text-gray-900 dark:text-white">
                  April 1, 2025 Payment Batch
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Batch ID: PAY-20250401-001
                </div>
              </div>
              <div className="mt-2 md:mt-0 flex items-center">
                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 mr-4">
                  Completed
                </span>
                <span className="text-md font-medium text-gray-900 dark:text-white">
                  {formatCurrency(14835.45)}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-md font-medium text-gray-900 dark:text-white">
                  March 15, 2025 Payment Batch
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Batch ID: PAY-20250315-001
                </div>
              </div>
              <div className="mt-2 md:mt-0 flex items-center">
                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 mr-4">
                  Completed
                </span>
                <span className="text-md font-medium text-gray-900 dark:text-white">
                  {formatCurrency(13750.2)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
              View All Payment History →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Export both components
export { RestaurantPayments, DriverPayments };
