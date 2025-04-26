import React, { useState } from "react";
import { drivers } from "../data/drivers";
import {
  FaUser,
  FaSearch,
  FaCar,
  FaEllipsisV,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaIdCard,
} from "react-icons/fa";

const Drivers = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDriver, setSelectedDriver] = useState(null);

  const tabs = [
    { id: "all", label: "All Drivers" },
    { id: "active", label: "Active" },
    { id: "pending", label: "Pending Approval" },
    { id: "offline", label: "Offline" },
  ];

  const filteredDrivers = drivers.filter((driver) => {
    // Filter by tab (converting status to lowercase for case-insensitive comparison)
    const driverStatus = driver.status.toLowerCase();
    if (activeTab === "active" && driverStatus !== "active") return false;
    if (activeTab === "pending" && driverStatus !== "pending") return false;
    if (
      activeTab === "offline" &&
      driverStatus !== "offline" &&
      driverStatus !== "inactive"
    )
      return false;

    // Filter by search using the name property
    if (
      searchTerm &&
      !driver.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false;

    return true;
  });

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "offline":
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleViewDetails = (driver) => {
    // Create a compatible driver object structure for the modal
    const enhancedDriver = {
      ...driver,
      firstName: driver.name.split(" ")[0],
      lastName: driver.name.split(" ")[1] || "",
      vehicle: {
        make: driver.vehicle.split(" ")[0] || "",
        model: driver.vehicle.split(" ").slice(1).join(" ") || "",
        plate: driver.licensePlate,
        year: new Date().getFullYear().toString(),
        insuranceVerified: true,
      },
      idVerified: true,
      acceptanceRate: Math.floor(Math.random() * 20) + 80, // Random value between 80-99%
      avgDeliveryTime: Math.floor(Math.random() * 15) + 20, // Random value between 20-35 mins
      recentOrders: [
        {
          id: Math.floor(Math.random() * 10000) + 1000,
          restaurant: "Burger King",
          date: "2024-04-20",
          amount: Math.random() * 50 + 20,
          earnings: Math.random() * 15 + 5,
        },
        {
          id: Math.floor(Math.random() * 10000) + 1000,
          restaurant: "Pizza Hut",
          date: "2024-04-19",
          amount: Math.random() * 50 + 20,
          earnings: Math.random() * 15 + 5,
        },
        {
          id: Math.floor(Math.random() * 10000) + 1000,
          restaurant: "Subway",
          date: "2024-04-18",
          amount: Math.random() * 50 + 20,
          earnings: Math.random() * 15 + 5,
        },
      ],
      avatar: driver.image,
    };

    setSelectedDriver(enhancedDriver);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Driver Management</h1>
        <div className="flex items-center">
          <div className="relative mr-4">
            <input
              type="text"
              placeholder="Search drivers..."
              className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center">
            <FaUser className="mr-2" />
            <span>Add Driver</span>
          </button>
        </div>
      </div>

      <div className="mb-6 border-b">
        <ul className="flex flex-wrap -mb-px">
          {tabs.map((tab) => (
            <li key={tab.id} className="mr-2">
              <button
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center px-4 py-2 font-medium text-sm rounded-t-lg ${
                  activeTab === tab.id
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

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
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
                  Vehicle
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Rating
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
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Earnings
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {filteredDrivers.map((driver) => (
                <tr
                  key={driver.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={driver.image}
                          alt=""
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {driver.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {driver.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {driver.vehicle}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {driver.licensePlate}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {driver.rating}
                      </span>
                      <svg
                        className="w-4 h-4 text-yellow-400 ml-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {driver.completedOrders}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
                        driver.status
                      )}`}
                    >
                      {driver.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    ${driver.totalEarnings.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleViewDetails(driver)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                    >
                      View
                    </button>
                    <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                      <FaEllipsisV />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="relative p-6">
              <button
                onClick={() => setSelectedDriver(null)}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
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
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <div className="flex flex-col md:flex-row items-start md:items-center mb-6">
                <div className="flex-shrink-0 mr-6 mb-4 md:mb-0">
                  <img
                    className="h-24 w-24 rounded-full object-cover border-4 border-white dark:border-gray-700"
                    src={selectedDriver.avatar}
                    alt=""
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold dark:text-white">
                    {selectedDriver.name}
                  </h2>
                  <div className="flex items-center mt-1">
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-semibold ${getStatusClass(
                        selectedDriver.status
                      )}`}
                    >
                      {selectedDriver.status}
                    </span>
                    <div className="flex items-center ml-4">
                      <span className="text-gray-700 dark:text-gray-300 mr-1">
                        {selectedDriver.rating}
                      </span>
                      <svg
                        className="w-4 h-4 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                    </div>
                    <span className="ml-4 text-gray-500 dark:text-gray-400">
                      Driver since {selectedDriver.joinDate}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 dark:text-white">
                    Personal Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <FaEnvelope className="mr-3 mt-1 text-gray-500 dark:text-gray-400" />
                      <div>
                        <h4 className="font-medium dark:text-white">Email</h4>
                        <p className="text-gray-600 dark:text-gray-300">
                          {selectedDriver.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <FaPhone className="mr-3 mt-1 text-gray-500 dark:text-gray-400" />
                      <div>
                        <h4 className="font-medium dark:text-white">Phone</h4>
                        <p className="text-gray-600 dark:text-gray-300">
                          {selectedDriver.phone}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <FaMapMarkerAlt className="mr-3 mt-1 text-gray-500 dark:text-gray-400" />
                      <div>
                        <h4 className="font-medium dark:text-white">Address</h4>
                        <p className="text-gray-600 dark:text-gray-300">
                          {selectedDriver.address}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <FaIdCard className="mr-3 mt-1 text-gray-500 dark:text-gray-400" />
                      <div>
                        <h4 className="font-medium dark:text-white">
                          ID Verification
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300">
                          {selectedDriver.idVerified ? (
                            <span className="text-green-600 dark:text-green-400">
                              Verified
                            </span>
                          ) : (
                            <span className="text-red-600 dark:text-red-400">
                              Not Verified
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4 dark:text-white">
                    Vehicle Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <FaCar className="mr-3 mt-1 text-gray-500 dark:text-gray-400" />
                      <div>
                        <h4 className="font-medium dark:text-white">Vehicle</h4>
                        <p className="text-gray-600 dark:text-gray-300">
                          {selectedDriver.vehicle.year}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="mr-3 mt-1 w-4 text-center text-gray-500 dark:text-gray-400">
                        #
                      </div>
                      <div>
                        <h4 className="font-medium dark:text-white">
                          License Plate
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300">
                          {selectedDriver.licensePlate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="mr-3 mt-1 w-4 text-center text-gray-500 dark:text-gray-400">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm6 6H7v2h6v-2z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium dark:text-white">
                          Insurance
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300">
                          {selectedDriver.vehicle.insuranceVerified ? (
                            <span className="text-green-600 dark:text-green-400">
                              Verified
                            </span>
                          ) : (
                            <span className="text-red-600 dark:text-red-400">
                              Not Verified
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="text-sm text-gray-500 dark:text-gray-400">
                    Completed Orders
                  </h4>
                  <p className="text-xl font-bold dark:text-white">
                    {selectedDriver.completedOrders}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="text-sm text-gray-500 dark:text-gray-400">
                    Acceptance Rate
                  </h4>
                  <p className="text-xl font-bold dark:text-white">
                    {selectedDriver.acceptanceRate}%
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="text-sm text-gray-500 dark:text-gray-400">
                    Total Earnings
                  </h4>
                  <p className="text-xl font-bold dark:text-white">
                    ${selectedDriver.totalEarnings.toFixed(2)}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="text-sm text-gray-500 dark:text-gray-400">
                    Avg. Delivery Time
                  </h4>
                  <p className="text-xl font-bold dark:text-white">
                    {selectedDriver.avgDeliveryTime} mins
                  </p>
                </div>
              </div>

              <div className="border-t pt-6 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4 dark:text-white">
                  Recent Orders
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          Order ID
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
                          Date
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
                          Earnings
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                      {selectedDriver.recentOrders.map((order) => (
                        <tr key={order.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            #{order.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {order.restaurant}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {order.date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            ${order.amount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            ${order.earnings.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                  Edit Details
                </button>
                <button
                  className={`px-4 py-2 rounded-lg text-white ${
                    selectedDriver.status.toLowerCase() === "active"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {selectedDriver.status.toLowerCase() === "active"
                    ? "Suspend Driver"
                    : "Activate Driver"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Drivers;
