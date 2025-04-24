import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { restaurants } from "../data/restaurants";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Clock,
  Star,
  Truck,
  DollarSign,
  Clipboard,
  TrendingUp,
  AlertTriangle,
  Check,
} from "lucide-react";

const RestaurantDetail = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real application, you would fetch the restaurant data from an API
    // For now, we'll use the dummy data
    const foundRestaurant = restaurants.find((r) => r.id === parseInt(id));
    setRestaurant(foundRestaurant);
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-red-600">
          Restaurant not found
        </h2>
        <Link
          to="/restaurants"
          className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to restaurants
        </Link>
      </div>
    );
  }

  const calculateAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    return (
      reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    ).toFixed(1);
  };

  const recentOrders = restaurant.orders?.slice(0, 5) || [];
  const averageRating = calculateAverageRating(restaurant.reviews);

  return (
    <div className="p-6 space-y-6">
      {/* Header with back button */}
      <div className="flex items-center mb-6">
        <Link
          to="/restaurants"
          className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold">Restaurant Details</h1>
      </div>

      {/* Restaurant header info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="h-48 bg-gray-300 dark:bg-gray-700 relative">
          {restaurant.coverImage ? (
            <img
              src={restaurant.coverImage}
              alt={`${restaurant.name} cover`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center">
              <h2 className="text-white text-2xl font-bold">
                {restaurant.name}
              </h2>
            </div>
          )}
          <div className="absolute bottom-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            {restaurant.status}
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mr-4 border-2 border-white dark:border-gray-800 shadow-lg">
                {restaurant.logo ? (
                  <img
                    src={restaurant.logo}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold">
                    {restaurant.name.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold">{restaurant.name}</h2>
                <div className="flex items-center mt-1">
                  <Star className="w-4 h-4 text-yellow-500 mr-1" />
                  <span>{averageRating}</span>
                  <span className="mx-2 text-gray-500">•</span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {restaurant.cuisine}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 md:mt-0 flex space-x-3">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Contact
              </button>
              {restaurant.status === "Active" ? (
                <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                  Suspend
                </button>
              ) : (
                <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                  Activate
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="flex items-center">
              <MapPin className="w-5 h-5 text-gray-500 mr-2" />
              <span>{restaurant.address}</span>
            </div>
            <div className="flex items-center">
              <Phone className="w-5 h-5 text-gray-500 mr-2" />
              <span>{restaurant.phone}</span>
            </div>
            <div className="flex items-center">
              <Mail className="w-5 h-5 text-gray-500 mr-2" />
              <span>{restaurant.email}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-gray-500 mr-2" />
              <span>
                Joined on {new Date(restaurant.joinedDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                activeTab === "overview"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                activeTab === "orders"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
              }`}
            >
              Orders
            </button>
            <button
              onClick={() => setActiveTab("menu")}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                activeTab === "menu"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
              }`}
            >
              Menu
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                activeTab === "reviews"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
              }`}
            >
              Reviews
            </button>
            <button
              onClick={() => setActiveTab("payments")}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                activeTab === "payments"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
              }`}
            >
              Payments
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                activeTab === "settings"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
              }`}
            >
              Settings
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Total Revenue
                      </p>
                      <h3 className="text-xl font-bold mt-1">
                        ${restaurant.stats?.totalRevenue.toFixed(2) || "0.00"}
                      </h3>
                    </div>
                    <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                      <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Total Orders
                      </p>
                      <h3 className="text-xl font-bold mt-1">
                        {restaurant.stats?.totalOrders || 0}
                      </h3>
                    </div>
                    <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                      <Clipboard className="w-5 h-5 text-green-600 dark:text-green-300" />
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Avg. Order Value
                      </p>
                      <h3 className="text-xl font-bold mt-1">
                        ${restaurant.stats?.avgOrderValue.toFixed(2) || "0.00"}
                      </h3>
                    </div>
                    <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
                      <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-300" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                  <h3 className="font-medium mb-4">Restaurant Information</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Owner
                      </span>
                      <span className="col-span-2">{restaurant.owner}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Type
                      </span>
                      <span className="col-span-2">{restaurant.type}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Open Hours
                      </span>
                      <span className="col-span-2">{restaurant.openHours}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Delivery Radius
                      </span>
                      <span className="col-span-2">
                        {restaurant.deliveryRadius} km
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Commission
                      </span>
                      <span className="col-span-2">
                        {restaurant.commission}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                  <h3 className="font-medium mb-4">Recent Orders</h3>
                  {recentOrders.length > 0 ? (
                    <div className="space-y-3">
                      {recentOrders.map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center">
                            <div
                              className={`w-2 h-2 rounded-full mr-2 ${
                                order.status === "completed"
                                  ? "bg-green-500"
                                  : order.status === "pending"
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              }`}
                            ></div>
                            <span>Order #{order.id}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="mr-3 text-gray-600 dark:text-gray-400">
                              ${order.total.toFixed(2)}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(order.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      No recent orders
                    </div>
                  )}
                </div>
              </div>

              {/* Issues or Warnings */}
              {restaurant.issues && restaurant.issues.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                    <h3 className="font-medium text-red-800 dark:text-red-300">
                      Issues Requiring Attention
                    </h3>
                  </div>
                  <ul className="space-y-2 pl-5 list-disc text-red-700 dark:text-red-400">
                    {restaurant.issues.map((issue, index) => (
                      <li key={index}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === "orders" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium">Order History</h3>
                <div className="flex space-x-2">
                  <select className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm">
                    <option>All Orders</option>
                    <option>Completed</option>
                    <option>Pending</option>
                    <option>Cancelled</option>
                  </select>
                  <input
                    type="date"
                    className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm"
                  />
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
                        Order ID
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
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Driver
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {restaurant.orders?.map((order) => (
                      <tr key={order.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          #{order.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(order.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {order.customer}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          ${order.total.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              order.status === "completed"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                : order.status === "pending"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {order.driver || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400 mr-3">
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}

                    {(!restaurant.orders || restaurant.orders.length === 0) && (
                      <tr>
                        <td
                          colSpan="7"
                          className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                        >
                          No orders found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "menu" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium">Menu Items</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  Add Menu Item
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {restaurant.menu?.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm"
                  >
                    <div className="h-40 bg-gray-200 dark:bg-gray-700">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-300 dark:bg-gray-700">
                          <span className="text-gray-500 dark:text-gray-400">
                            No image
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between">
                        <h4 className="font-medium">{item.name}</h4>
                        <span className="font-semibold">
                          ${item.price.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {item.description}
                      </p>
                      <div className="mt-3 flex space-x-2">
                        <button className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-sm">
                          Edit
                        </button>
                        <button className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded text-sm">
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {(!restaurant.menu || restaurant.menu.length === 0) && (
                  <div className="col-span-full text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">
                      No menu items found
                    </p>
                    <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                      Add First Menu Item
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium">Customer Reviews</h3>
                <div>
                  <select className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm">
                    <option>All Ratings</option>
                    <option>5 Stars</option>
                    <option>4 Stars</option>
                    <option>3 Stars</option>
                    <option>2 Stars</option>
                    <option>1 Star</option>
                  </select>
                </div>
              </div>

              <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-blue-600 rounded-full p-3 mr-4">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium">Overall Rating</h4>
                      <div className="flex items-center mt-1">
                        <span className="text-2xl font-bold mr-2">
                          {averageRating}
                        </span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.round(averageRating)
                                  ? "text-yellow-500 fill-yellow-500"
                                  : "text-gray-300 dark:text-gray-600"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                          from {restaurant.reviews?.length || 0} reviews
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <div className="flex items-center space-x-1">
                      <span className="text-xs w-8">5 ★</span>
                      <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full"
                          style={{
                            width: `${
                              (restaurant.reviews?.filter((r) => r.rating === 5)
                                .length /
                                (restaurant.reviews?.length || 1)) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs w-8">4 ★</span>
                      <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full"
                          style={{
                            width: `${
                              (restaurant.reviews?.filter((r) => r.rating === 4)
                                .length /
                                (restaurant.reviews?.length || 1)) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs w-8">3 ★</span>
                      <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full"
                          style={{
                            width: `${
                              (restaurant.reviews?.filter((r) => r.rating === 3)
                                .length /
                                (restaurant.reviews?.length || 1)) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs w-8">2 ★</span>
                      <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full"
                          style={{
                            width: `${
                              (restaurant.reviews?.filter((r) => r.rating === 2)
                                .length /
                                (restaurant.reviews?.length || 1)) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs w-8">1 ★</span>
                      <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full"
                          style={{
                            width: `${
                              (restaurant.reviews?.filter((r) => r.rating === 1)
                                .length /
                                (restaurant.reviews?.length || 1)) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {restaurant.reviews?.map((review) => (
                  <div
                    key={review.id}
                    className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mr-3">
                          {review.userImage ? (
                            <img
                              src={review.userImage}
                              alt={review.userName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-lg font-bold">
                              {review.userName?.charAt(0) || "U"}
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium">{review.userName}</h4>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(review.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? "text-yellow-500 fill-yellow-500"
                                : "text-gray-300 dark:text-gray-600"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                      {review.comment}
                    </p>
                    {review.reply && (
                      <div className="mt-3 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium">Restaurant Reply:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {review.reply}
                        </p>
                      </div>
                    )}
                    {!review.reply && (
                      <div className="mt-3 flex justify-end">
                        <button className="text-blue-600 text-sm hover:text-blue-800 dark:hover:text-blue-400">
                          Reply to review
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {(!restaurant.reviews || restaurant.reviews.length === 0) && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">
                      No reviews yet
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "payments" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium">Payment History</h3>
                <div className="flex space-x-2">
                  <select className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm">
                    <option>All Payments</option>
                    <option>Completed</option>
                    <option>Pending</option>
                    <option>Failed</option>
                  </select>
                  <input
                    type="month"
                    className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm"
                  />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      Total Earned
                    </h4>
                    <p className="text-2xl font-bold">
                      ${restaurant.earnings?.total?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      Pending Payout
                    </h4>
                    <p className="text-2xl font-bold">
                      ${restaurant.earnings?.pending?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      Current Month
                    </h4>
                    <p className="text-2xl font-bold">
                      ${restaurant.earnings?.currentMonth?.toFixed(2) || "0.00"}
                    </p>
                  </div>
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
                        Transaction ID
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
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {restaurant.transactions?.map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          #{transaction.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(transaction.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {transaction.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          ${transaction.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              transaction.status === "completed"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                : transaction.status === "pending"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                            }`}
                          >
                            {transaction.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400">
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}

                    {(!restaurant.transactions ||
                      restaurant.transactions.length === 0) && (
                      <tr>
                        <td
                          colSpan="6"
                          className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                        >
                          No transactions found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="text-lg font-medium mb-4">
                  Restaurant Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Restaurant Name
                    </label>
                    <input
                      type="text"
                      defaultValue={restaurant.name}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Owner Name
                    </label>
                    <input
                      type="text"
                      defaultValue={restaurant.owner}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      defaultValue={restaurant.email}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      defaultValue={restaurant.phone}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Cuisine Type
                    </label>
                    <input
                      type="text"
                      defaultValue={restaurant.cuisine}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Restaurant Type
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md">
                      <option value="casual">Casual Dining</option>
                      <option value="fastfood">Fast Food</option>
                      <option value="cafe">Café</option>
                      <option value="finedining">Fine Dining</option>
                    </select>
                  </div>
                  <div className="col-span-full">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      defaultValue={restaurant.address}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    Save Information
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="text-lg font-medium mb-4">Operating Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Operating Hours
                    </label>
                    <input
                      type="text"
                      defaultValue={restaurant.openHours}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Delivery Radius (km)
                    </label>
                    <input
                      type="number"
                      defaultValue={restaurant.deliveryRadius}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Commission Rate (%)
                    </label>
                    <input
                      type="number"
                      defaultValue={restaurant.commission}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Preparation Time (minutes)
                    </label>
                    <input
                      type="number"
                      defaultValue={restaurant.prepTime || 30}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    Save Operating Details
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="text-lg font-medium mb-4">Account Status</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      Current Status:{" "}
                      <span
                        className={
                          restaurant.status === "Active"
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }
                      >
                        {restaurant.status}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {restaurant.status === "Active"
                        ? "Restaurant is currently active and can receive orders."
                        : "Restaurant is currently inactive and cannot receive orders."}
                    </p>
                  </div>
                  {restaurant.status === "Active" ? (
                    <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                      Suspend Restaurant
                    </button>
                  ) : (
                    <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                      Activate Restaurant
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="text-lg font-medium mb-4">Payment Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Payment Method
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md">
                      <option value="bank">Bank Transfer</option>
                      <option value="paypal">PayPal</option>
                      <option value="stripe">Stripe</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Account Details
                    </label>
                    <input
                      type="text"
                      placeholder="Bank account number or payment email"
                      defaultValue={
                        restaurant.paymentDetails?.accountNumber || ""
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Payment Schedule
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md">
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    Save Payment Settings
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetail;
