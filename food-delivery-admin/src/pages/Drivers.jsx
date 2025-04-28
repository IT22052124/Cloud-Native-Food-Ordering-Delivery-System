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
  FaTruck,
  FaMoneyBillWave,
  FaCalendarAlt,
} from "react-icons/fa";
import { getDrivers, updateDriverStatus, getDeliveries } from "../utils/api";

const Drivers = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deliveryData, setDeliveryData] = useState([]);

  // Fetch all drivers
  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const driversData = await getDrivers();
      setDrivers(driversData);
      setLoading(false);
    } catch (error) {
      console.error("Driver load failed:", error);
      setError("Failed to load drivers");
      setLoading(false);
      if (error.message && error.message.includes("Authentication")) {
        // Redirect to login if token is missing
        window.location.href = "/login";
      }
    }
  };

  // Fetch all deliveries
  const fetchDeliveries = async () => {
    try {
      const deliveries = await getDeliveries();
      setDeliveryData(deliveries);
    } catch (error) {
      console.error("Deliveries load failed:", error);
    }
  };

  useEffect(() => {
    fetchDrivers();
    fetchDeliveries();
  }, []);

  // Safe accessor function to avoid type errors
  const safeGetDriverId = (delivery) => {
    return delivery?.driver?.id || delivery?.driver?._id || null;
  };

  // Get driver's total orders count from deliveries
  const getDriverOrderCount = (driverId) => {
    if (!deliveryData || !deliveryData.length) return 0;

    return deliveryData.filter(
      (delivery) => safeGetDriverId(delivery) === driverId
    ).length;
  };

  // Get driver's completed orders
  const getDriverCompletedOrders = (driverId) => {
    if (!deliveryData || !deliveryData.length) return 0;

    return deliveryData.filter(
      (delivery) =>
        safeGetDriverId(delivery) === driverId &&
        delivery.status === "DELIVERED"
    ).length;
  };

  // Calculate driver's total earnings
  const getDriverTotalEarnings = (driverId) => {
    if (!deliveryData || !deliveryData.length) return 0;

    return deliveryData
      .filter(
        (delivery) =>
          safeGetDriverId(delivery) === driverId &&
          delivery.status === "DELIVERED"
      )
      .reduce((total, delivery) => {
        const amount = delivery?.earningsAmount || 0;
        return total + amount;
      }, 0);
  };

  // Get driver's recent orders
  const getDriverRecentOrders = (driverId) => {
    if (!deliveryData || !deliveryData.length) return [];

    return deliveryData
      .filter((delivery) => safeGetDriverId(delivery) === driverId)
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 5)
      .map((delivery) => ({
        id: delivery.orderId || "N/A",
        restaurant: delivery.restaurant?.name || "Unknown",
        date: delivery.createdAt || new Date(),
        amount: delivery.payment?.amount || 0,
        earnings: delivery.earningsAmount || 0,
        status: delivery.status || "UNKNOWN",
      }));
  };

  // Calculate driver's acceptance rate (estimated)
  const getDriverAcceptanceRate = (driverId) => {
    const totalAssigned = deliveryData.filter(
      (delivery) => safeGetDriverId(delivery) === driverId
    ).length;

    if (totalAssigned === 0) return 0;

    // Assuming cancelled orders might be declined by the driver
    const cancelled = deliveryData.filter(
      (delivery) =>
        safeGetDriverId(delivery) === driverId &&
        delivery.status === "CANCELLED"
    ).length;

    const acceptanceRate = Math.round(
      ((totalAssigned - cancelled) / totalAssigned) * 100
    );
    return Math.min(Math.max(acceptanceRate, 0), 100); // Ensure between 0-100
  };

  // Calculate average delivery time
  const getAvgDeliveryTime = (driverId) => {
    const completedDeliveries = deliveryData.filter(
      (delivery) =>
        safeGetDriverId(delivery) === driverId &&
        delivery.status === "DELIVERED" &&
        delivery.pickupTime &&
        delivery.deliveryTime
    );

    if (completedDeliveries.length === 0) return 0;

    const totalMinutes = completedDeliveries.reduce((total, delivery) => {
      try {
        const pickupTime = new Date(delivery.pickupTime);
        const deliveryTime = new Date(delivery.deliveryTime);
        const diffMinutes = Math.round(
          (deliveryTime - pickupTime) / (1000 * 60)
        );
        return total + (isNaN(diffMinutes) ? 0 : diffMinutes);
      } catch (e) {
        console.error("Error calculating delivery time:", e);
        return total;
      }
    }, 0);

    return Math.round(totalMinutes / completedDeliveries.length);
  };

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
      !driver.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !driver.email?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !driver.phone?.toLowerCase().includes(searchTerm.toLowerCase())
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
    if (!dateString) return "N/A";
    try {
      const options = { year: "numeric", month: "short", day: "numeric" };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      console.error("Error formatting date:", e);
      return "Invalid Date";
    }
  };

  const getJoinDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const options = { year: "numeric", month: "long" };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      console.error("Error formatting join date:", e);
      return "Invalid Date";
    }
  };

  const handleViewDetails = (driver) => {
    // Get driver details with delivery statistics
    if (!driver) return;

    const driverId = driver._id;
    const totalOrders = getDriverOrderCount(driverId);
    const completedOrders = getDriverCompletedOrders(driverId);
    const totalEarnings = getDriverTotalEarnings(driverId);
    const acceptanceRate = getDriverAcceptanceRate(driverId);
    const avgDeliveryTime = getAvgDeliveryTime(driverId);
    const recentOrders = getDriverRecentOrders(driverId);

    const enhancedDriver = {
      ...driver,
      joinDate: getJoinDate(driver.createdAt),
      totalOrders,
      completedOrders,
      acceptanceRate: isNaN(acceptanceRate) ? 0 : acceptanceRate,
      avgDeliveryTime: isNaN(avgDeliveryTime) ? 0 : avgDeliveryTime,
      totalEarnings,
      vehicle: {
        make: driver.vehicleMake || "Not specified",
        model: driver.vehicleModel || "Not specified",
        year: driver.vehicleYear || "N/A",
        plate: driver.vehiclePlate || "Not specified",
        insuranceVerified: driver.vehicleInsuranceVerified || false,
      },
      idVerified: driver.nic && driver.nicImage ? true : false,
      recentOrders,
    };

    setSelectedDriver(enhancedDriver);
  };

  // Handle change driver status (activate/deactivate/suspend)
  const handleChangeStatus = async (driver, newStatus) => {
    if (!driver || !driver._id) {
      console.error("Invalid driver data");
      return;
    }

    try {
      await updateDriverStatus(driver._id, newStatus);

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
    } catch (error) {
      console.error(`Failed to update driver status: ${error}`);
      alert(`Failed to update driver status. Please try again.`);
    }
  };

  // Handle toggle driver availability
  const handleToggleAvailability = async (driver) => {
    if (!driver || !driver._id) {
      console.error("Invalid driver data");
      return;
    }

    try {
      // Assuming this API will be implemented
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
    } catch (error) {
      console.error(`Failed to toggle driver availability: ${error}`);
      alert(`Failed to toggle driver availability. Please try again.`);
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

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      ) : (
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
                {filteredDrivers.length > 0 ? (
                  filteredDrivers.map((driver) => (
                    <tr
                      key={driver._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={
                                driver.profilePicture ||
                                `/api/placeholder/40/40`
                              }
                              alt=""
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {driver.name || "Unnamed Driver"}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {driver.email || "No email"}
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
                          {driver.phone || "Not provided"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
                            driver.status || "inactive"
                          )}`}
                        >
                          {(driver.status || "inactive")
                            .replace("_", " ")
                            .charAt(0)
                            .toUpperCase() +
                            (driver.status || "inactive")
                              .replace("_", " ")
                              .slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center text-gray-700 dark:text-gray-300">
                          {getDriverOrderCount(driver._id)} Orders
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
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                    >
                      No drivers found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
                    src={
                      selectedDriver.profilePicture || `/api/placeholder/96/96`
                    }
                    alt=""
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold dark:text-white">
                    {selectedDriver.name || "Unnamed Driver"}
                  </h2>
                  <div className="flex items-center mt-1">
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-semibold ${getStatusClass(
                        selectedDriver.status || "inactive"
                      )}`}
                    >
                      {(selectedDriver.status || "inactive")
                        .replace("_", " ")
                        .charAt(0)
                        .toUpperCase() +
                        (selectedDriver.status || "inactive")
                          .replace("_", " ")
                          .slice(1)}
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
                          {selectedDriver.email || "Not provided"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <FaPhone className="mr-3 mt-1 text-gray-500 dark:text-gray-400" />
                      <div>
                        <h4 className="font-medium dark:text-white">Phone</h4>
                        <p className="text-gray-600 dark:text-gray-300">
                          {selectedDriver.phone || "Not provided"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <FaMapMarkerAlt className="mr-3 mt-1 text-gray-500 dark:text-gray-400" />
                      <div>
                        <h4 className="font-medium dark:text-white">Address</h4>
                        <p className="text-gray-600 dark:text-gray-300">
                          {selectedDriver.address || "Not provided"}
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
                          {selectedDriver.vehiclePlate || "Not specified"}
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
                    <div className="flex items-start">
                      <FaCalendarAlt className="mr-3 mt-1 text-gray-500 dark:text-gray-400" />
                      <div>
                        <h4 className="font-medium dark:text-white">
                          Last Active
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300">
                          {selectedDriver.lastActive
                            ? formatDate(selectedDriver.lastActive)
                            : "Not available"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                  <div className="font-semibold text-blue-700 dark:text-blue-300 mb-1">
                    Total Orders
                  </div>
                  <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                    {selectedDriver.totalOrders}
                  </div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
                  <div className="font-semibold text-green-700 dark:text-green-300 mb-1">
                    Completed
                  </div>
                  <div className="text-2xl font-bold text-green-800 dark:text-green-200">
                    {selectedDriver.completedOrders}
                  </div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg">
                  <div className="font-semibold text-yellow-700 dark:text-yellow-300 mb-1">
                    Acceptance Rate
                  </div>
                  <div className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">
                    {selectedDriver.acceptanceRate}%
                  </div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
                  <div className="font-semibold text-purple-700 dark:text-purple-300 mb-1">
                    Avg Delivery Time
                  </div>
                  <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                    {selectedDriver.avgDeliveryTime} min
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 dark:text-white">
                  Recent Orders
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                    <thead className="bg-gray-100 dark:bg-gray-800">
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
                          Status
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
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-700 dark:divide-gray-600">
                      {selectedDriver.recentOrders.length > 0 ? (
                        selectedDriver.recentOrders.map((order, index) => (
                          <tr
                            key={index}
                            className="hover:bg-gray-50 dark:hover:bg-gray-600"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {order.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                              {order.restaurant}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                              {formatDate(order.date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  order.status === "DELIVERED"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                                    : order.status === "CANCELLED"
                                    ? "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
                                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300"
                                }`}
                              >
                                {order.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                              ${order.amount.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">
                              ${order.earnings.toFixed(2)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="6"
                            className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                          >
                            No recent orders found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FaMoneyBillWave className="text-green-600 dark:text-green-400" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Total Earnings:{" "}
                    <strong>${selectedDriver.totalEarnings.toFixed(2)}</strong>
                  </span>
                </div>
                <div className="flex flex-wrap justify-center sm:justify-end gap-2">
                  {selectedDriver.status === "pending_approval" && (
                    <button
                      onClick={() =>
                        handleChangeStatus(selectedDriver, "active")
                      }
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm font-medium rounded-md"
                    >
                      Approve Driver
                    </button>
                  )}
                  {selectedDriver.status === "active" && (
                    <button
                      onClick={() =>
                        handleChangeStatus(selectedDriver, "inactive")
                      }
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 text-sm font-medium rounded-md"
                    >
                      Deactivate
                    </button>
                  )}
                  {selectedDriver.status === "inactive" && (
                    <button
                      onClick={() =>
                        handleChangeStatus(selectedDriver, "active")
                      }
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium rounded-md"
                    >
                      Activate
                    </button>
                  )}
                  {selectedDriver.status !== "suspended" && (
                    <button
                      onClick={() =>
                        handleChangeStatus(selectedDriver, "suspended")
                      }
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm font-medium rounded-md"
                    >
                      Suspend
                    </button>
                  )}
                  {selectedDriver.status === "suspended" && (
                    <button
                      onClick={() =>
                        handleChangeStatus(selectedDriver, "inactive")
                      }
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 text-sm font-medium rounded-md"
                    >
                      Remove Suspension
                    </button>
                  )}
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
