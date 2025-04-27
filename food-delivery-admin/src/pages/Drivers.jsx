import React, { useState, useEffect } from "react";
import {
  FaUser,
  FaSearch,
  FaCar,
  FaEllipsisV,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaIdCard,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";
import { getDrivers } from "../utils/api";

const Drivers = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDrivers = async () => {
    try {
      const drivers = await getDrivers();
      setDrivers(drivers);
    } catch (error) {
      console.error("Driver load failed:", error);
      if (error.message.includes("Authentication")) {
        // Redirect to login if token is missing
        navigate("/login");
      }
    }
  };

  useEffect(() => {
    console.group("Token Debugging");
    console.log("Checking localStorage...");
    console.log("All localStorage contents:", localStorage);
    console.log("Token value:", localStorage.getItem("token"));
    console.log("Type of token:", typeof localStorage.getItem("token"));
    console.groupEnd();
    fetchDrivers();
  }, []);

  const tabs = [
    { id: "all", label: "All Drivers" },
    { id: "active", label: "Active" },
    { id: "pending_approval", label: "Pending Approval" },
    { id: "inactive", label: "Inactive" },
    { id: "suspended", label: "Suspended" },
  ];

  const filteredDrivers = drivers.filter((driver) => {
    // Filter by tab
    if (activeTab !== "all" && driver.status !== activeTab) return false;

    // Filter by search term
    if (
      searchTerm &&
      !driver.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false;

    return true;
  });

  const getStatusClass = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending_approval":
        return "bg-yellow-100 text-yellow-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getJoinDate = (dateString) => {
    const options = { year: "numeric", month: "long" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleViewDetails = (driver) => {
    // Generate some random stats and recent orders for the driver details
    const enhancedDriver = {
      ...driver,
      joinDate: getJoinDate(driver.createdAt),
      acceptanceRate: Math.floor(Math.random() * 20) + 80, // Random value between 80-99%
      avgDeliveryTime: Math.floor(Math.random() * 15) + 20, // Random value between 20-35 mins
      completedOrders: Math.floor(Math.random() * 300) + 50, // Random value between 50-350
      totalEarnings: Math.floor(Math.random() * 5000) + 1000, // Random value between $1000-$6000
      vehicle: {
        make: "Honda",
        model: "Civic",
        year: "2023",
        plate: driver.vehiclePlate,
        insuranceVerified: Math.random() > 0.3, // 70% chance of being verified
      },
      idVerified: driver.nic && driver.nicImage ? true : false,
      recentOrders: [
        {
          id: Math.floor(Math.random() * 10000) + 1000,
          restaurant: "Burger King",
          date: "2025-04-20",
          amount: parseFloat((Math.random() * 50 + 20).toFixed(2)),
          earnings: parseFloat((Math.random() * 15 + 5).toFixed(2)),
        },
        {
          id: Math.floor(Math.random() * 10000) + 1000,
          restaurant: "Pizza Hut",
          date: "2025-04-19",
          amount: parseFloat((Math.random() * 50 + 20).toFixed(2)),
          earnings: parseFloat((Math.random() * 15 + 5).toFixed(2)),
        },
        {
          id: Math.floor(Math.random() * 10000) + 1000,
          restaurant: "Subway",
          date: "2025-04-18",
          amount: parseFloat((Math.random() * 50 + 20).toFixed(2)),
          earnings: parseFloat((Math.random() * 15 + 5).toFixed(2)),
        },
      ],
    };

    setSelectedDriver(enhancedDriver);
  };

  // Handle change driver status (activate/deactivate/suspend)
  const handleChangeStatus = (driver, newStatus) => {
    // In a real app, this would make an API call to update the driver status
    console.log(
      `Changing ${driver.name}'s status from ${driver.status} to ${newStatus}`
    );

    // Update the local state for immediate feedback
    const updatedDrivers = drivers.map((d) => {
      if (d._id === driver._id) {
        return { ...d, status: newStatus };
      }
      return d;
    });

    setDrivers(updatedDrivers);

    // If we're viewing the driver details, update that as well
    if (selectedDriver && selectedDriver._id === driver._id) {
      setSelectedDriver({ ...selectedDriver, status: newStatus });
    }
  };

  // Handle toggle driver availability
  const handleToggleAvailability = (driver) => {
    // In a real app, this would make an API call to update the driver availability
    console.log(
      `Toggling ${driver.name}'s availability from ${
        driver.driverIsAvailable ? "available" : "unavailable"
      } to ${!driver.driverIsAvailable ? "available" : "unavailable"}`
    );

    // Update the local state for immediate feedback
    const updatedDrivers = drivers.map((d) => {
      if (d._id === driver._id) {
        return { ...d, driverIsAvailable: !d.driverIsAvailable };
      }
      return d;
    });

    setDrivers(updatedDrivers);

    // If we're viewing the driver details, update that as well
    if (selectedDriver && selectedDriver._id === driver._id) {
      setSelectedDriver({
        ...selectedDriver,
        driverIsAvailable: !selectedDriver.driverIsAvailable,
      });
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Delivery Driver Management
        </h1>
        <div className="flex items-center mt-4 md:mt-0">
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
                  Joined
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Phone
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
                  Total Orders
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
                  key={driver._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={driver.profilePicture}
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
                      {driver.vehiclePlate
                        ? driver.vehiclePlate
                        : "Not specified"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(driver.createdAt)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {driver.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
                        driver.status
                      )}`}
                    >
                      {driver.status.replace("_", " ").charAt(0).toUpperCase() +
                        driver.status.replace("_", " ").slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center text-gray-700 dark:text-gray-300">
                      {driver.completedOrders ||
                        Math.floor(Math.random() * 300) + 50}{" "}
                      Orders
                    </span>
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
                    src={selectedDriver.profilePicture}
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
                      {selectedDriver.status
                        .replace("_", " ")
                        .charAt(0)
                        .toUpperCase() +
                        selectedDriver.status.replace("_", " ").slice(1)}
                    </span>
                    <span className="text-sm ml-3 flex items-center">
                      <span
                        className={`${
                          selectedDriver.driverIsAvailable
                            ? "text-green-600 dark:text-green-400"
                            : "text-gray-500 dark:text-gray-400"
                        } flex items-center`}
                      >
                        {selectedDriver.driverIsAvailable ? (
                          <FaToggleOn className="mr-1" />
                        ) : (
                          <FaToggleOff className="mr-1" />
                        )}
                        {selectedDriver.driverIsAvailable
                          ? "Online"
                          : "Offline"}
                      </span>
                    </span>
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
                          NIC Verification
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300">
                          {selectedDriver.nic ? (
                            <span className="text-green-600 dark:text-green-400">
                              Verified ({selectedDriver.nic})
                            </span>
                          ) : (
                            <span className="text-red-600 dark:text-red-400">
                              Not Provided
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
                          {selectedDriver.vehicle.make}{" "}
                          {selectedDriver.vehicle.model} (
                          {selectedDriver.vehicle.year})
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
                          {selectedDriver.vehiclePlate}
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
                          Order Amount
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
                      {selectedDriver.recentOrders.map((order, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            #{order.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {order.restaurant}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(order.date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            ${order.amount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            ${order.earnings.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="border-t pt-6 mt-6 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4 dark:text-white">
                  Account Actions
                </h3>
                <div className="flex flex-wrap gap-3">
                  {selectedDriver.status === "active" && (
                    <>
                      <button
                        onClick={() =>
                          handleChangeStatus(selectedDriver, "inactive")
                        }
                        className="px-4 py-2 border border-yellow-500 text-yellow-500 rounded-lg hover:bg-yellow-500 hover:text-white"
                      >
                        Deactivate Account
                      </button>
                      <button
                        onClick={() =>
                          handleChangeStatus(selectedDriver, "suspended")
                        }
                        className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-500 hover:text-white"
                      >
                        Suspend Account
                      </button>
                    </>
                  )}
                  {selectedDriver.status === "inactive" && (
                    <button
                      onClick={() =>
                        handleChangeStatus(selectedDriver, "active")
                      }
                      className="px-4 py-2 border border-green-500 text-green-500 rounded-lg hover:bg-green-500 hover:text-white"
                    >
                      Activate Account
                    </button>
                  )}
                  {selectedDriver.status === "suspended" && (
                    <button
                      onClick={() =>
                        handleChangeStatus(selectedDriver, "active")
                      }
                      className="px-4 py-2 border border-green-500 text-green-500 rounded-lg hover:bg-green-500 hover:text-white"
                    >
                      Reinstate Account
                    </button>
                  )}
                  {selectedDriver.status === "pending_approval" && (
                    <button
                      onClick={() =>
                        handleChangeStatus(selectedDriver, "active")
                      }
                      className="px-4 py-2 border border-green-500 text-green-500 rounded-lg hover:bg-green-500 hover:text-white"
                    >
                      Approve Account
                    </button>
                  )}
                  <button className="px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white">
                    Edit Profile
                  </button>
                  <button className="px-4 py-2 border border-gray-500 text-gray-500 rounded-lg hover:bg-gray-500 hover:text-white">
                    Reset Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Drivers;
