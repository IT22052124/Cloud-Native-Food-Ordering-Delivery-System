// controllers/restaurantPaymentController.js
import RestaurantPayment from "../models/RestaurantPayment.js";
import Order from "../models/Order.js";
import {
  getWeekNumber,
  getWeekDates,
  getCurrentWeekInfo,
  getMonthDates,
  formatDateYMD,
} from "../utils/dateUtils.js";

/**
 * Get restaurant payments with filtering
 */
export const getRestaurantPayments = async (req, res) => {
  try {
    const {
      period = "weekly",
      status,
      restaurantId,
      weekNumber,
      year: yearParam,
      month,
    } = req.query;

    const currentYear = new Date().getFullYear();
    const year = yearParam ? parseInt(yearParam) : currentYear;

    const filters = { periodType: period };

    if (status && status !== "all") {
      filters.paymentStatus = status;
    }

    if (restaurantId && restaurantId !== "all") {
      filters.restaurantId = restaurantId;
    }

    // Apply period-specific filters
    if (period === "weekly" && weekNumber) {
      filters.weekNumber = parseInt(weekNumber);
      if (year) filters.year = year;
    } else if (period === "monthly" && month) {
      filters.month = month;
      if (year) filters.year = year;
    }

    const payments = await RestaurantPayment.find(filters).sort({
      weekNumber: -1,
      year: -1,
      month: -1,
      restaurantName: 1,
    });

    // Get summary information
    const total = payments.reduce(
      (sum, payment) => sum + payment.netPayable,
      0
    );
    const scheduled = payments.filter(
      (p) => p.paymentStatus === "scheduled"
    ).length;
    const pending = payments.filter(
      (p) => p.paymentStatus === "pending"
    ).length;

    // Get unique restaurants for the filter dropdown
    const allRestaurants = await RestaurantPayment.aggregate([
      {
        $group: {
          _id: "$restaurantId",
          name: { $first: "$restaurantName" },
        },
      },
    ]);

    const restaurants = allRestaurants.map((r) => ({
      id: r._id,
      name: r.name,
    }));

    // Current week/month info
    let currentPeriodInfo = {};
    if (period === "weekly") {
      const { weekNumber, year } = getCurrentWeekInfo();
      const { startDate, endDate } = getWeekDates(weekNumber, year);
      currentPeriodInfo = {
        weekNumber,
        year,
        startDate: formatDateYMD(startDate),
        endDate: formatDateYMD(endDate),
      };
    } else {
      const now = new Date();
      const month = now.toLocaleString("default", { month: "long" });
      const year = now.getFullYear();
      const { startDate, endDate } = getMonthDates(now.getMonth() + 1, year);
      currentPeriodInfo = {
        month,
        year,
        startDate: formatDateYMD(startDate),
        endDate: formatDateYMD(endDate),
      };
    }

    res.json({
      payments,
      summary: {
        total,
        scheduled,
        pending,
        currentPeriod: currentPeriodInfo,
      },
      restaurants,
    });
  } catch (error) {
    console.error("Error fetching restaurant payments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch restaurant payments",
      error: error.message,
    });
  }
};

/**
 * Generate weekly payments for restaurants
 */
export const generateWeeklyPayments = async (req, res) => {
  try {
    let { weekNumber, year } = req.body;

    // Default to current week if not specified
    if (!weekNumber || !year) {
      const currentWeek = getCurrentWeekInfo();
      weekNumber = currentWeek.weekNumber;
      year = currentWeek.year;
    } else {
      weekNumber = parseInt(weekNumber);
      year = parseInt(year);
    }

    // Get date range for the week
    const { startDate, endDate } = getWeekDates(weekNumber, year);

    // Check if payments already exist for this week
    const existingPayments = await RestaurantPayment.find({
      periodType: "weekly",
      weekNumber,
      year,
    });

    if (existingPayments.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Payments for week ${weekNumber} of ${year} already exist`,
        existingPayments,
      });
    }

    // Find all completed orders in the date range
    const completedOrders = await Order.find({
      "restaurantOrder.status": "DELIVERED",
      createdAt: { $gte: startDate, $lte: endDate },
      paymentStatus: "PAID",
    });

    // Group orders by restaurant
    const restaurantOrders = {};

    completedOrders.forEach((order) => {
      const restaurantId = order.restaurantOrder.restaurantId.toString();

      if (!restaurantOrders[restaurantId]) {
        restaurantOrders[restaurantId] = {
          restaurantId,
          restaurantName: order.restaurantOrder.restaurantName,
          orders: [],
          salesAmount: 0,
          ordersCount: 0,
        };
      }

      restaurantOrders[restaurantId].orders.push(order.orderId);
      restaurantOrders[restaurantId].salesAmount +=
        order.restaurantOrder.subtotal;
      restaurantOrders[restaurantId].ordersCount += 1;
    });

    // Create payment records for each restaurant
    const paymentRecords = [];

    for (const [restaurantId, data] of Object.entries(restaurantOrders)) {
      // Get commission rate for this restaurant
      // In a real app, this would come from the restaurant's contract settings
      let commissionRate;

      // For demo, we'll set different rates for different restaurants
      if (restaurantId.includes("rest1")) {
        commissionRate = 0.15; // 15%
      } else if (restaurantId.includes("rest2")) {
        commissionRate = 0.18; // 18%
      } else {
        commissionRate = 0.2; // 20% default
      }

      const commissionAmount = data.salesAmount * commissionRate;
      const taxAmount = data.salesAmount * 0.05; // Example tax rate
      const netPayable = data.salesAmount - commissionAmount - taxAmount;

      // Create payment record
      const paymentRecord = new RestaurantPayment({
        restaurantId,
        restaurantName: data.restaurantName,
        periodType: "weekly",
        weekNumber,
        year,
        weekStartDate: startDate,
        weekEndDate: endDate,
        orderIds: data.orders,
        ordersCount: data.ordersCount,
        salesAmount: data.salesAmount,
        commissionRate,
        commissionAmount,
        taxAmount,
        netPayable,
        paymentStatus: "pending",
        scheduledDate: new Date(endDate.getTime() + 24 * 60 * 60 * 1000), // Next day after week ends
        paymentMethod: "Bank Transfer",
        createdBy: req.user?.id || "system",
      });

      await paymentRecord.save();
      paymentRecords.push(paymentRecord);
    }

    if (paymentRecords.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No completed orders found for week ${weekNumber} of ${year}`,
      });
    }

    res.status(201).json({
      success: true,
      message: `Generated ${paymentRecords.length} weekly payment records for week ${weekNumber} of ${year}`,
      payments: paymentRecords,
    });
  } catch (error) {
    console.error("Error generating weekly payments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate weekly payments",
      error: error.message,
    });
  }
};

/**
 * Process a single restaurant payment
 */
export const processPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await RestaurantPayment.findOne({ paymentId });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    if (payment.paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "Payment already processed",
      });
    }

    // Here you would integrate with payment processor
    // For demo purposes, we'll just mark it as paid

    payment.paymentStatus = "paid";
    payment.paidAt = new Date();
    payment.paymentReference = `REF-${Date.now()}`;
    payment.processedBy = req.user?.id || "system";

    await payment.save();

    res.json({
      success: true,
      message: "Payment processed successfully",
      payment,
    });
  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process payment",
      error: error.message,
    });
  }
};

/**
 * Process multiple restaurant payments
 */
export const processBulkPayments = async (req, res) => {
  try {
    const { paymentIds } = req.body;

    if (!paymentIds || !Array.isArray(paymentIds) || paymentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No payment IDs provided",
      });
    }

    const results = {
      successful: [],
      failed: [],
    };

    for (const paymentId of paymentIds) {
      try {
        const payment = await RestaurantPayment.findOne({ paymentId });

        if (!payment || payment.paymentStatus === "paid") {
          results.failed.push({
            paymentId,
            reason: payment ? "Already paid" : "Not found",
          });
          continue;
        }

        // Update payment status
        payment.paymentStatus = "paid";
        payment.paidAt = new Date();
        payment.paymentReference = `REF-BULK-${Date.now()}-${paymentId}`;
        payment.processedBy = req.user?.id || "system";

        await payment.save();
        results.successful.push(paymentId);
      } catch (err) {
        results.failed.push({ paymentId, reason: err.message });
      }
    }

    res.json({
      success: true,
      message: `Processed ${results.successful.length} payments successfully, ${results.failed.length} failed`,
      results,
    });
  } catch (error) {
    console.error("Error processing bulk payments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process bulk payments",
      error: error.message,
    });
  }
};

/**
 * Update restaurant payment status
 */
export const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { status, notes } = req.body;

    const payment = await RestaurantPayment.findOne({ paymentId });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Update payment status
    payment.paymentStatus = status;

    if (notes) {
      payment.notes = notes;
    }

    if (status === "paid") {
      payment.paidAt = new Date();
    }

    await payment.save();

    res.json({
      success: true,
      message: "Payment status updated successfully",
      payment,
    });
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update payment status",
      error: error.message,
    });
  }
};

/**
 * Get restaurant payment details
 */
export const getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await RestaurantPayment.findOne({ paymentId });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Get order details
    const orders = await Order.find({
      orderId: { $in: payment.orderIds },
    });

    res.json({
      success: true,
      payment,
      orders,
    });
  } catch (error) {
    console.error("Error fetching payment details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment details",
      error: error.message,
    });
  }
};

/**
 * Get current week's payment summary
 */
export const getCurrentWeekSummary = async (req, res) => {
  try {
    const { weekNumber, year } = getCurrentWeekInfo();

    const payments = await RestaurantPayment.find({
      periodType: "weekly",
      weekNumber,
      year,
    });

    const { startDate, endDate } = getWeekDates(weekNumber, year);

    res.json({
      success: true,
      weekNumber,
      year,
      startDate: formatDateYMD(startDate),
      endDate: formatDateYMD(endDate),
      payments,
      totalCount: payments.length,
      totalPayable: payments.reduce((sum, p) => sum + p.netPayable, 0),
    });
  } catch (error) {
    console.error("Error fetching current week summary:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch current week summary",
      error: error.message,
    });
  }
};
