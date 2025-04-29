// utils/dashboardData.js
export const processDashboardData = (orders = [], users = []) => {
  // Ensure inputs are arrays
  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeUsers = Array.isArray(users) ? users : [];

  const now = new Date();
  const todayStart = new Date(now.setHours(0, 0, 0, 0));
  const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Process orders - using the correct property names from your API response
  const todayOrders = safeOrders.filter(
    (order) =>
      order &&
      order.createdAt &&
      new Date(order.createdAt) >= todayStart &&
      order.paymentStatus !== "CANCELLED" // Using paymentStatus instead of status
  );

  const weeklyOrders = safeOrders.filter(
    (order) =>
      order &&
      order.createdAt &&
      new Date(order.createdAt) >= weekStart &&
      order.paymentStatus !== "CANCELLED"
  );

  const monthlyOrders = safeOrders.filter(
    (order) =>
      order &&
      order.createdAt &&
      new Date(order.createdAt) >= monthStart &&
      order.paymentStatus !== "CANCELLED"
  );

  // Process cancellations
  const todayCancelled = safeOrders.filter(
    (order) =>
      order &&
      order.createdAt &&
      new Date(order.createdAt) >= todayStart &&
      order.paymentStatus === "CANCELLED"
  ).length;

  const weeklyCancelled = safeOrders.filter(
    (order) =>
      order &&
      order.createdAt &&
      new Date(order.createdAt) >= weekStart &&
      order.paymentStatus === "CANCELLED"
  ).length;

  const monthlyCancelled = safeOrders.filter(
    (order) =>
      order &&
      order.createdAt &&
      new Date(order.createdAt) >= monthStart &&
      order.paymentStatus === "CANCELLED"
  ).length;

  // Process users
  const todayUsers = safeUsers.filter(
    (user) => user && user.createdAt && new Date(user.createdAt) >= todayStart
  ).length;

  const weeklyUsers = safeUsers.filter(
    (user) => user && user.createdAt && new Date(user.createdAt) >= weekStart
  ).length;

  const monthlyUsers = safeUsers.filter(
    (user) => user && user.createdAt && new Date(user.createdAt) >= monthStart
  ).length;

  // Calculate revenue with null checks
  const todayRevenue = todayOrders.reduce(
    (sum, order) => sum + (order.totalAmount || 0),
    0
  );
  const weeklyRevenue = weeklyOrders.reduce(
    (sum, order) => sum + (order.totalAmount || 0),
    0
  );
  const monthlyRevenue = monthlyOrders.reduce(
    (sum, order) => sum + (order.totalAmount || 0),
    0
  );

  return {
    today: {
      orders: todayOrders.length,
      revenue: todayRevenue,
      newUsers: todayUsers,
      cancellations: todayCancelled,
    },
    weekly: {
      orders: weeklyOrders.length,
      revenue: weeklyRevenue,
      newUsers: weeklyUsers,
      cancellations: weeklyCancelled,
    },
    monthly: {
      orders: monthlyOrders.length,
      revenue: monthlyRevenue,
      newUsers: monthlyUsers,
      cancellations: monthlyCancelled,
    },
    recentOrders: safeOrders
      .filter((order) => order && order.createdAt && order.orderId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
      .map((order) => ({
        id: order.orderId,
        customer: order.customerName || "Unknown",
        restaurant: order.restaurant || "Unknown", // Changed from restaurantOrder.restaurantName
        amount: order.totalAmount || 0,
        status:
          order.paymentStatus === "PENDING"
            ? "Pending"
            : order.paymentStatus === "COMPLETED"
            ? "Delivered"
            : order.paymentStatus === "CANCELLED"
            ? "Cancelled"
            : "Processing", // Adjusted to match your API statuses
        date: order.createdAt,
      })),
  };
};
