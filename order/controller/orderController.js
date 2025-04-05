// Create a new order (generic create method)
import Order from "../model/Order.js";
import CartItem from "../model/CartItem.js";
import axios from "axios";

/**
 * Create a new order that can contain items from multiple restaurants
 * @route POST /api/orders
 * @access Private - Customer
 */
const createOrder = async (req, res) => {
  try {
    // Get user ID and info from authenticated user
    const customerId = req.user.id;
    const { name, email, phone } = req.user;

    if (!name || !email || !phone) {
      return res.status(400).json({
        status: 400,
        message:
          "Your profile is incomplete. Please update your profile before placing an order.",
      });
    }

    // Get cart items for the customer
    const cartItems = await CartItem.find({ customerId });

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({
        status: 400,
        message:
          "Your cart is empty. Please add items before placing an order.",
      });
    }

    // Group cart items by restaurant
    const restaurantGroups = {};

    for (const item of cartItems) {
      if (!restaurantGroups[item.restaurantId]) {
        restaurantGroups[item.restaurantId] = [];
      }
      restaurantGroups[item.restaurantId].push(item);
    }

    // Fetch restaurant information for all restaurants
    const restaurantIds = Object.keys(restaurantGroups);
    const restaurantPromises = restaurantIds.map(async (restaurantId) => {
      try {
        const response = await axios.get(
          `${global.gConfig.restaurant_url}/api/restaurants/${restaurantId}`,
          { headers: { authorization: req.headers.authorization } }
        );
        return response.data;
      } catch (error) {
        console.error(
          `Error fetching restaurant ${restaurantId}:`,
          error.message
        );
        throw new Error(
          `Restaurant ${restaurantId} not found or is unavailable`
        );
      }
    });

    const restaurants = await Promise.all(restaurantPromises);

    // Create a map for easier lookup
    const restaurantMap = {};
    restaurants.forEach((restaurant) => {
      restaurantMap[restaurant._id] = restaurant;

      // Create a map of menu items for this restaurant
      restaurant.itemMap = {};
      restaurant.items.forEach((item) => {
        restaurant.itemMap[item._id] = item;
      });
    });

    // Create restaurant orders
    const restaurantOrders = [];

    for (const restaurantId of restaurantIds) {
      const restaurant = restaurantMap[restaurantId];
      const restaurantCartItems = restaurantGroups[restaurantId];

      // Map cart items to order items with price and name from menu
      const orderItems = restaurantCartItems.map((cartItem) => {
        const menuItem = restaurant.itemMap[cartItem.itemId];

        if (!menuItem) {
          throw new Error(
            `Menu item ${cartItem.itemId} not found in restaurant ${restaurant.name}`
          );
        }

        return {
          itemId: cartItem.itemId,
          name: menuItem.name,
          price: menuItem.price,
          quantity: cartItem.quantity,
          specialInstructions: cartItem.specialInstructions || "",
        };
      });

      // Calculate subtotal for this restaurant
      const subtotal = orderItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );

      // Calculate tax (assume 8% for demo)
      const tax = Math.round(subtotal * 0.08 * 100) / 100;

      // Get delivery fee from restaurant or use default
      const deliveryFee = restaurant.deliveryFee || 0;

      // Create restaurant order object
      restaurantOrders.push({
        restaurantId: restaurant._id,
        restaurantName: restaurant.name,
        items: orderItems,
        subtotal,
        tax,
        deliveryFee,
        status: "PLACED",
        statusHistory: [
          {
            status: "PLACED",
            timestamp: new Date(),
            updatedBy: customerId,
            notes: "Order placed by customer",
          },
        ],
        specialInstructions:
          req.body.restaurantInstructions?.[restaurant._id] || "",
      });
    }

    // Create new main order
    const newOrder = new Order({
      customerId,
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      type: req.body.type || "DELIVERY",
      restaurantOrders,
      deliveryAddress: req.body.deliveryAddress || req.user.address,
      paymentMethod: req.body.paymentMethod || "CASH",
      paymentStatus: req.body.paymentStatus || "PENDING",
      paymentDetails: req.body.paymentDetails || {},
    });

    // Save the order
    const savedOrder = await newOrder.save();

    // Clear the cart after successful order creation
    await CartItem.deleteMany({ customerId });

    // Queue notifications to restaurants (this would typically be done with a message queue)
    notifyRestaurants(savedOrder);

    // Return the new order
    res.status(201).json({
      status: 201,
      message: "Order placed successfully",
      order: savedOrder,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      status: 500,
      message: error.message || "Failed to create order",
    });
  }
};

/**
 * Notify restaurants about new order (would typically use a message queue in production)
 * @param {Object} order - The saved order object
 */
const notifyRestaurants = async (order) => {
  try {
    // For each restaurant in the order
    for (const restaurantOrder of order.restaurantOrders) {
      try {
        // Simulate sending notification to restaurant
        console.log(
          `Notifying restaurant ${restaurantOrder.restaurantId} about new order ${order.orderId}`
        );

        // In a real app, we would send HTTP request, websocket message,
        // or publish to a message queue for the notification service

        // Mark as notified and record in history
        restaurantOrder.restaurantNotified = true;
        restaurantOrder.notificationHistory.push({
          type: "ORDER_PLACED",
          timestamp: new Date(),
          success: true,
          details: `Initial notification for order ${order.orderId}`,
        });
      } catch (notifyError) {
        console.error(
          `Failed to notify restaurant ${restaurantOrder.restaurantId}:`,
          notifyError
        );
        // Record failed notification attempt
        restaurantOrder.notificationHistory.push({
          type: "ORDER_PLACED",
          timestamp: new Date(),
          success: false,
          details: `Failed to notify: ${notifyError.message}`,
        });
      }
    }

    // Save notification status updates
    await order.save();
  } catch (error) {
    console.error("Error in restaurant notification process:", error);
    // Don't throw - this runs after response has been sent
  }
};

/**
 * Update status of a specific restaurant's part of an order
 * @route PATCH /api/orders/:id/restaurant/:restaurantId/status
 * @access Private - Restaurant, Admin
 */
const updateRestaurantOrderStatus = async (req, res) => {
  try {
    const { id, restaurantId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        status: 400,
        message: "Status is required",
      });
    }

    // Validate status value
    const validStatuses = [
      "CONFIRMED",
      "PREPARING",
      "READY_FOR_PICKUP",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: 400,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    // Find the order
    const order = await Order.findOne({ orderId: id });

    if (!order) {
      return res.status(404).json({
        status: 404,
        message: "Order not found",
      });
    }

    // Find the restaurant's part of the order
    const restaurantOrder = order.restaurantOrders.find(
      (ro) => ro.restaurantId.toString() === restaurantId
    );

    if (!restaurantOrder) {
      return res.status(404).json({
        status: 404,
        message: "This restaurant is not part of this order",
      });
    }

    // Check authorization
    const isAdmin = req.user.role === "admin";
    const isRestaurant =
      req.user.role === "restaurant" &&
      restaurantId.toString() === req.user.restaurantId?.toString();

    if (!isAdmin && !isRestaurant) {
      return res.status(403).json({
        status: 403,
        message: "You don't have permission to update this order",
      });
    }

    // Validate status transition
    const currentStatus = restaurantOrder.status;

    // Admins can set any status
    if (!isAdmin) {
      // Status transition validation for restaurants
      const validTransitions = {
        PLACED: ["CONFIRMED", "CANCELLED"],
        CONFIRMED: ["PREPARING", "CANCELLED"],
        PREPARING: ["READY_FOR_PICKUP", "CANCELLED"],
        READY_FOR_PICKUP: ["OUT_FOR_DELIVERY"],
        OUT_FOR_DELIVERY: ["DELIVERED", "CANCELLED"],
      };

      if (
        !validTransitions[currentStatus] ||
        !validTransitions[currentStatus].includes(status)
      ) {
        return res.status(400).json({
          status: 400,
          message: `Cannot change status from ${currentStatus} to ${status}`,
        });
      }
    }

    // Update restaurant order status
    restaurantOrder.status = status;

    // Add status history entry
    restaurantOrder.statusHistory.push({
      status,
      timestamp: new Date(),
      updatedBy: req.user.id,
      notes: req.body.notes || "",
    });

    // Special handling for specific statuses
    if (status === "CONFIRMED") {
      // Set estimated ready time if provided or default to 30 mins
      const readyMinutes = req.body.estimatedReadyMinutes || 30;
      const readyTime = new Date();
      readyTime.setMinutes(readyTime.getMinutes() + readyMinutes);
      restaurantOrder.estimatedReadyTime = readyTime;
    }

    if (status === "READY_FOR_PICKUP") {
      restaurantOrder.actualReadyTime = new Date();
    }

    if (status === "OUT_FOR_DELIVERY" && req.body.driver) {
      restaurantOrder.assignedDriver = {
        driverId: req.body.driver.id,
        name: req.body.driver.name,
        phone: req.body.driver.phone,
        vehicleDetails: req.body.driver.vehicleDetails,
      };
    }

    // Save the updated order
    await order.save();

    // Notify customer about the status update
    notifyCustomer(order, restaurantOrder);

    res.status(200).json({
      status: 200,
      message: "Order status updated successfully",
      restaurantOrder,
    });
  } catch (error) {
    console.error("Error updating restaurant order status:", error);
    res.status(500).json({
      status: 500,
      message: error.message || "Internal server error",
    });
  }
};

/**
 * Notify customer about order status changes
 * @param {Object} order - The complete order object
 * @param {Object} restaurantOrder - The specific restaurant order that was updated
 */
const notifyCustomer = async (order, restaurantOrder) => {
  try {
    // In a real app, this would send an email, SMS, or push notification
    console.log(
      `Notifying customer ${order.customerId} about status update for restaurant ${restaurantOrder.restaurantName} to ${restaurantOrder.status}`
    );

    // Record notification in history
    order.customerNotificationHistory.push({
      type: "STATUS_UPDATE",
      timestamp: new Date(),
      success: true,
      details: `Restaurant ${restaurantOrder.restaurantName} status changed to ${restaurantOrder.status}`,
    });

    order.customerNotified = true;
    await order.save();
  } catch (error) {
    console.error("Error notifying customer:", error);
    // Don't throw - this runs after response has been sent
  }
};

/**
 * Update order status across all restaurants (admin only)
 * @route PATCH /api/orders/:id/status
 * @access Private - Admin
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!status) {
      return res.status(400).json({
        status: 400,
        message: "Status is required",
      });
    }

    // Validate status value
    const validStatuses = [
      "CONFIRMED",
      "PREPARING",
      "READY_FOR_PICKUP",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: 400,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    // Find the order
    const order = await Order.findOne({ orderId: id });

    if (!order) {
      return res.status(404).json({
        status: 404,
        message: "Order not found",
      });
    }

    // Only admin can use this endpoint
    const isAdmin = req.user.role === "admin";

    if (!isAdmin) {
      return res.status(403).json({
        status: 403,
        message:
          "Only administrators can update all restaurant statuses at once",
      });
    }

    // Update all restaurant order statuses
    for (const restaurantOrder of order.restaurantOrders) {
      restaurantOrder.status = status;

      // Add status history entry
      restaurantOrder.statusHistory.push({
        status,
        timestamp: new Date(),
        updatedBy: req.user.id,
        notes: req.body.notes || "Updated by administrator",
      });

      // Special handling for certain statuses
      if (status === "CONFIRMED" && !restaurantOrder.estimatedReadyTime) {
        const readyTime = new Date();
        readyTime.setMinutes(readyTime.getMinutes() + 30); // Default 30 minutes
        restaurantOrder.estimatedReadyTime = readyTime;
      }

      if (status === "READY_FOR_PICKUP" && !restaurantOrder.actualReadyTime) {
        restaurantOrder.actualReadyTime = new Date();
      }
    }

    // Save the updated order
    const updatedOrder = await order.save();

    // Notify the customer about the status change
    try {
      // Record notification in history
      order.customerNotificationHistory.push({
        type: "STATUS_UPDATE",
        timestamp: new Date(),
        success: true,
        details: `Order status changed to ${status} for all restaurants by administrator`,
      });

      order.customerNotified = true;
      await order.save();

      // In a real system, we would send an actual notification here
      console.log(
        `Notifying customer ${order.customerId} about status update to ${status} for all restaurants`
      );
    } catch (notifyError) {
      console.error("Error notifying customer:", notifyError);
    }

    res.status(200).json({
      status: 200,
      message: "Order status updated successfully for all restaurants",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({
      status: 500,
      message: error.message || "Internal server error",
    });
  }
};

/**
 * Get order by ID
 * @route GET /api/orders/:id
 * @access Private - Customer, Restaurant (if part of order), Admin
 */
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.id });

    if (!order) {
      return res.status(404).json({
        status: 404,
        message: "Order not found",
      });
    }

    // Check permissions based on role
    const isAdmin = req.user.role === "admin";
    const isCustomer =
      req.user.role === "customer" &&
      order.customerId.toString() === req.user.id.toString();
    const isInvolvedRestaurant =
      req.user.role === "restaurant" &&
      order.restaurantOrders.some(
        (ro) => ro.restaurantId.toString() === req.user.restaurantId?.toString()
      );

    if (!isAdmin && !isCustomer && !isInvolvedRestaurant) {
      return res.status(403).json({
        status: 403,
        message: "You don't have permission to view this order",
      });
    }

    // For restaurant users, only include their part of the order
    if (isInvolvedRestaurant) {
      // Create a filtered version of the order with only this restaurant's part
      const restaurantOrder = order.restaurantOrders.find(
        (ro) => ro.restaurantId.toString() === req.user.restaurantId.toString()
      );

      // Return modified order object with only this restaurant's information
      const restaurantView = {
        orderId: order.orderId,
        customerId: order.customerId,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        type: order.type,
        deliveryAddress: order.deliveryAddress,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        restaurantOrder: restaurantOrder,
      };

      return res.status(200).json({
        status: 200,
        order: restaurantView,
      });
    }

    // Return full order for customer or admin
    res.status(200).json({
      status: 200,
      order,
    });
  } catch (error) {
    console.error("Error getting order:", error);
    res.status(500).json({
      status: 500,
      message: error.message || "Internal server error",
    });
  }
};

/**
 * Get all orders for the authenticated customer
 * @route GET /api/orders
 * @access Private - Customer
 */
const getUserOrders = async (req, res) => {
  try {
    const customerId = req.user.id;
    const orders = await Order.find({ customerId })
      .sort({ createdAt: -1 })
      .lean();

    // Process orders to include overall status and estimated delivery time
    const processedOrders = orders.map((order) => {
      // Calculate overall status
      let overallStatus;
      const statuses = new Set(order.restaurantOrders.map((ro) => ro.status));

      if (statuses.size === 1) {
        overallStatus = order.restaurantOrders[0].status;
      } else if (statuses.has("CANCELLED")) {
        if (statuses.size === 2 && statuses.has("DELIVERED")) {
          overallStatus = "PARTIALLY_CANCELLED";
        } else {
          overallStatus = "PROCESSING";
        }
      } else {
        overallStatus = "PROCESSING";
      }

      // Get restaurant names and total items
      const restaurants = order.restaurantOrders.map((ro) => ro.restaurantName);
      const totalItems = order.restaurantOrders.reduce(
        (sum, ro) => sum + ro.items.reduce((s, i) => s + i.quantity, 0),
        0
      );

      // Return a summarized version for the orders list
      return {
        orderId: order.orderId,
        createdAt: order.createdAt,
        totalAmount: order.totalAmount,
        status: overallStatus,
        restaurants,
        totalItems,
        type: order.type,
      };
    });

    res.status(200).json({
      status: 200,
      orders: processedOrders,
    });
  } catch (error) {
    console.error("Error getting user orders:", error);
    res.status(500).json({
      status: 500,
      message: error.message || "Internal server error",
    });
  }
};

/**
 * Get all orders for the authenticated restaurant
 * @route GET /api/orders/restaurant
 * @access Private - Restaurant
 */
const getRestaurantOrders = async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;

    if (!restaurantId) {
      return res.status(400).json({
        status: 400,
        message: "Restaurant ID not found in user profile",
      });
    }

    // Find orders that include this restaurant
    const orders = await Order.find({
      "restaurantOrders.restaurantId": restaurantId,
    })
      .sort({ createdAt: -1 })
      .lean();

    // Process orders to only include this restaurant's part
    const restaurantOrders = orders.map((order) => {
      const restaurantOrder = order.restaurantOrders.find(
        (ro) => ro.restaurantId.toString() === restaurantId.toString()
      );

      return {
        orderId: order.orderId,
        createdAt: order.createdAt,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        type: order.type,
        deliveryAddress: order.deliveryAddress,
        paymentMethod: order.paymentMethod,
        status: restaurantOrder.status,
        items: restaurantOrder.items,
        subtotal: restaurantOrder.subtotal,
        tax: restaurantOrder.tax,
        deliveryFee: restaurantOrder.deliveryFee,
        total:
          restaurantOrder.subtotal +
          restaurantOrder.tax +
          restaurantOrder.deliveryFee,
        specialInstructions: restaurantOrder.specialInstructions,
        estimatedReadyTime: restaurantOrder.estimatedReadyTime,
        actualReadyTime: restaurantOrder.actualReadyTime,
      };
    });

    res.status(200).json({
      status: 200,
      orders: restaurantOrders,
    });
  } catch (error) {
    console.error("Error getting restaurant orders:", error);
    res.status(500).json({
      status: 500,
      message: error.message || "Internal server error",
    });
  }
};

/**
 * Get all orders (admin only)
 * @route GET /api/orders/admin/all
 * @access Private - Admin
 */
const getAllOrders = async (req, res) => {
  try {
    // Allow filtering by status
    const { status, startDate, endDate, restaurant } = req.query;

    const filter = {};

    if (status) {
      // For better querying, we need to search within the restaurantOrders array
      filter["restaurantOrders.status"] = status;
    }

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (startDate) {
      filter.createdAt = { $gte: new Date(startDate) };
    } else if (endDate) {
      filter.createdAt = { $lte: new Date(endDate) };
    }

    if (restaurant) {
      filter["restaurantOrders.restaurantId"] = restaurant;
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    // Process orders to include summary information
    const processedOrders = orders.map((order) => {
      const restaurantCount = order.restaurantOrders.length;
      const statuses = order.restaurantOrders.map((ro) => ro.status);
      const itemCount = order.restaurantOrders.reduce(
        (sum, ro) => sum + ro.items.reduce((s, i) => s + i.quantity, 0),
        0
      );

      return {
        orderId: order.orderId,
        createdAt: order.createdAt,
        customerName: order.customerName,
        restaurantCount,
        statuses,
        itemCount,
        totalAmount: order.totalAmount,
        type: order.type,
        paymentStatus: order.paymentStatus,
      };
    });

    res.status(200).json({
      status: 200,
      count: processedOrders.length,
      orders: processedOrders,
    });
  } catch (error) {
    console.error("Error getting all orders:", error);
    res.status(500).json({
      status: 500,
      message: error.message || "Internal server error",
    });
  }
};

/**
 * Delete an order
 * @route DELETE /api/orders/:id
 * @access Private - Customer (own orders), Admin
 */
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.id });

    if (!order) {
      return res.status(404).json({
        status: 404,
        message: "Order not found",
      });
    }

    // Only admin or the customer who created the order can delete it
    const isAdmin = req.user.role === "admin";
    const isCustomer =
      req.user.role === "customer" &&
      order.customerId.toString() === req.user.id.toString();

    if (!isAdmin && !isCustomer) {
      return res.status(403).json({
        status: 403,
        message: "You don't have permission to delete this order",
      });
    }

    // Customer can only delete orders that are in certain statuses
    if (isCustomer) {
      // Check if all restaurant orders are in a status that can be deleted
      const canDelete = order.restaurantOrders.every((ro) =>
        ["PLACED", "CANCELLED"].includes(ro.status)
      );

      if (!canDelete) {
        return res.status(400).json({
          status: 400,
          message: "Cannot delete order that is already being processed",
        });
      }
    }

    // Delete order
    await Order.deleteOne({ orderId: req.params.id });

    res.status(200).json({
      status: 200,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({
      status: 500,
      message: error.message || "Internal server error",
    });
  }
};

// Export all controller methods
export {
  createOrder,
  getOrderById,
  updateOrderStatus,
  getUserOrders,
  getRestaurantOrders,
  getAllOrders,
  deleteOrder,
  updateRestaurantOrderStatus,
};
