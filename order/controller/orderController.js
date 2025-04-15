// Create a new order (generic create method)
import Order from "../model/order.js";
import CartItem from "../model/cartItem.js";
import axios from "axios";

const getRestaurantDishes = async (authorization, restaurantId) => {
  try {
    const response = await axios.get(
      `${global.gConfig.restaurant_url}/api/restaurants/${restaurantId}/dishes`,
      { headers: { authorization } }
    );
    return response;
  } catch (error) {
    console.error("Error fetching restaurant:", error);
  }
};

/**
 * Create a new order from cart items
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

    // Get restaurant info
    const restaurantId = cartItems[0].restaurantId;
    const restaurantResponse = await axios.get(
      `${global.gConfig.restaurant_url}/api/restaurants/${restaurantId}`,
      { headers: { authorization: req.headers.authorization } }
    );

    if (!restaurantResponse.data) {
      return res.status(404).json({
        status: 404,
        message: "Restaurant not found",
      });
    }
    const restaurant = restaurantResponse.data;

    const dishes = await getRestaurantDishes(
      req.headers.authorization,
      restaurantId
    );

    // Create item map for easier lookup
    const itemMap = {};
    dishes.data.dishes.forEach((item) => {
      itemMap[item._id] = item;
    });

    // Calculate order details
    const items = cartItems.map((cartItem) => {
      const menuItem = itemMap[cartItem.itemId];
      if (!menuItem) {
        throw new Error(`Menu item ${cartItem.itemId} not found`);
      }

      return {
        itemId: cartItem.itemId,
        name: menuItem.name,
        price: menuItem.price,
        quantity: cartItem.quantity,
        specialInstructions: cartItem.specialInstructions || "",
      };
    });

    // Calculate subtotal
    const subtotal = items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    // Calculate tax (8%)
    const tax = Math.round(subtotal * 0.08 * 100) / 100;

    // Get delivery fee from restaurant or use default
    const deliveryFee = restaurant.deliveryFee || 2.99;

    // Calculate total amount
    const totalAmount = subtotal + tax + deliveryFee;
    console.log(5);
    // Create new order
    const newOrder = new Order({
      orderId: `ORD-${Date.now().toString().slice(-6)}`,
      customerId,
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      type: req.body.type || "DELIVERY",
      restaurantOrder: {
        restaurantId,
        restaurantName: restaurant.name,
        restaurantLocation: {
          lat: restaurant.address.coordinates.lat,
          lng: restaurant.address.coordinates.lng,
        },
        items,
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
      },
      deliveryAddress: req.body.deliveryAddress || req.user.address,
      totalAmount,
      paymentMethod: req.body.paymentMethod || "CASH",
      paymentStatus: "PENDING",
      paymentDetails: req.body.paymentDetails || {},
    });

    // Save order
    const savedOrder = await newOrder.save();
    console.log(6);
    // Clear cart after successful order
    // await CartItem.deleteMany({ customerId });

    // Notify restaurant about new order
    // try {
    //   await axios.post(
    //     `${global.gConfig.notification_url}/notifications`,
    //     {
    //       type: "NEW_ORDER",
    //       recipientId: restaurantId,
    //       recipientType: "RESTAURANT",
    //       data: {
    //         orderId: savedOrder.orderId,
    //         customerName: name,
    //         itemCount: items.length,
    //         totalAmount,
    //       },
    //     },
    //     { headers: { authorization: req.headers.authorization } }
    //   );
    // } catch (error) {
    //   console.error("Failed to send notification to restaurant:", error);
    // }

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
 * Get order by ID
 * @route GET /api/orders/:id
 * @access Private
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

    // Check permissions
    const isRestaurant = false;
    if (req.user.role === "RESTAURANT") {
      const response = await axios.get(
        `${global.gConfig.restaurant_url}/api/restaurants/${req.user.id}/restaurant`,
        { headers: { authorization } }
      );
      isRestaurant = response.data.ownerId === req.user.id;
    }
    const isAdmin = req.user.role === "ADMIN";
    const isCustomer = order.customerId.toString() === req.user.id;

    if (!isAdmin && !isCustomer && !isRestaurant) {
      return res.status(403).json({
        status: 403,
        message: "You don't have permission to view this order",
      });
    }

    // For restaurant users, only return their part of the order
    if (isRestaurant) {
      return res.status(200).json({
        status: 200,
        order: {
          orderId: order.orderId,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          type: order.type,
          deliveryAddress: order.deliveryAddress,
          status: order.restaurantOrder.status,
          items: order.restaurantOrder.items,
          subtotal: order.restaurantOrder.subtotal,
          tax: order.restaurantOrder.tax,
          deliveryFee: order.restaurantOrder.deliveryFee,
          estimatedReadyTime: order.restaurantOrder.estimatedReadyTime,
        },
      });
    }

    res.status(200).json({
      status: 200,
      order,
    });
  } catch (error) {
    console.error("Error getting order:", error);
    res.status(500).json({
      status: 500,
      message: error.message || "Failed to get order",
    });
  }
};

/**
 * Get all orders for the authenticated user
 * @route GET /api/orders
 * @access Private
 */
const getUserOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const query = { customerId: req.user.id };
    if (status) {
      query["restaurantOrder.status"] = status;
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(query);

    // Process orders to include summary information
    const processedOrders = orders.map((order) => ({
      orderId: order.orderId,
      createdAt: order.createdAt,
      totalAmount: order.totalAmount,
      status: order.restaurantOrder.status,
      restaurant: order.restaurantOrder.restaurantName,
      totalItems: order.restaurantOrder.items.reduce(
        (total, item) => total + item.quantity,
        0
      ),
      type: order.type,
    }));

    res.status(200).json({
      status: 200,
      orders: processedOrders,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error("Error getting user orders:", error);
    res.status(500).json({
      status: 500,
      message: error.message || "Failed to get orders",
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
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const query = { "restaurantOrder.restaurantId": req.user.id };
    if (status) {
      query["restaurantOrder.status"] = status;
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(query);

    // Process orders to include only relevant information
    const processedOrders = orders.map((order) => ({
      orderId: order.orderId,
      createdAt: order.createdAt,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      type: order.type,
      deliveryAddress: order.deliveryAddress,
      status: order.restaurantOrder.status,
      items: order.restaurantOrder.items,
      subtotal: order.restaurantOrder.subtotal,
      tax: order.restaurantOrder.tax,
      deliveryFee: order.restaurantOrder.deliveryFee,
      estimatedReadyTime: order.restaurantOrder.estimatedReadyTime,
    }));

    res.status(200).json({
      status: 200,
      orders: processedOrders,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error("Error getting restaurant orders:", error);
    res.status(500).json({
      status: 500,
      message: error.message || "Failed to get orders",
    });
  }
};

/**
 * Update order status
 * @route PATCH /api/orders/:id/status
 * @access Private - Restaurant
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { status, notes, estimatedReadyMinutes } = req.body;
    const orderId = req.params.id;

    // Validate status
    const validStatuses = [
      "PLACED",
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
        message: "Invalid status value",
      });
    }

    // Get order
    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        status: 404,
        message: "Order not found",
      });
    }

    // Check if user is authorized to update status
    const isRestaurant =
      req.user.role === "RESTAURANT" &&
      order.restaurantOrder.restaurantId === req.user.id;
    const isAdmin = req.user.role === "ADMIN";

    if (!isRestaurant && !isAdmin) {
      return res.status(403).json({
        status: 403,
        message: "You don't have permission to update this order",
      });
    }

    // Update status
    order.restaurantOrder.status = status;
    order.restaurantOrder.statusHistory.push({
      status,
      timestamp: new Date(),
      updatedBy: req.user.id,
      notes: notes || "",
    });

    // Handle special statuses
    if (status === "CONFIRMED" && estimatedReadyMinutes) {
      order.restaurantOrder.estimatedReadyTime = new Date(
        Date.now() + estimatedReadyMinutes * 60000
      );
    } else if (status === "READY_FOR_PICKUP") {
      order.restaurantOrder.actualReadyTime = new Date();
    }

    // Save updated order
    const updatedOrder = await order.save();

    // Notify customer about status change
    try {
      await axios.post(
        `${global.gConfig.notification_url}/notifications`,
        {
          type: "ORDER_STATUS_UPDATE",
          recipientId: order.customerId,
          recipientType: "CUSTOMER",
          data: {
            orderId: order.orderId,
            status,
            restaurantName: order.restaurantOrder.restaurantName,
            estimatedReadyTime: order.restaurantOrder.estimatedReadyTime,
          },
        },
        { headers: { authorization: req.headers.authorization } }
      );
    } catch (error) {
      console.error("Failed to send notification to customer:", error);
    }

    res.status(200).json({
      status: 200,
      message: "Order status updated successfully",
      order: {
        orderId: updatedOrder.orderId,
        status: updatedOrder.restaurantOrder.status,
        statusHistory: updatedOrder.restaurantOrder.statusHistory,
        estimatedReadyTime: updatedOrder.restaurantOrder.estimatedReadyTime,
      },
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({
      status: 500,
      message: error.message || "Failed to update order status",
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
    const {
      status,
      startDate,
      endDate,
      restaurant,
      page = 1,
      limit = 10,
    } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (status) {
      query["restaurantOrder.status"] = status;
    }
    if (startDate) {
      query.createdAt = { $gte: new Date(startDate) };
    }
    if (endDate) {
      query.createdAt = { ...query.createdAt, $lte: new Date(endDate) };
    }
    if (restaurant) {
      query["restaurantOrder.restaurantId"] = restaurant;
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(query);

    // Process orders to include summary information
    const processedOrders = orders.map((order) => ({
      orderId: order.orderId,
      createdAt: order.createdAt,
      customerName: order.customerName,
      restaurant: order.restaurantOrder.restaurantName,
      itemCount: order.restaurantOrder.items.reduce(
        (total, item) => total + item.quantity,
        0
      ),
      totalAmount: order.totalAmount,
      type: order.type,
      paymentStatus: order.paymentStatus,
    }));

    res.status(200).json({
      status: 200,
      count: total,
      orders: processedOrders,
      page,
      limit,
    });
  } catch (error) {
    console.error("Error getting all orders:", error);
    res.status(500).json({
      status: 500,
      message: error.message || "Failed to get orders",
    });
  }
};

/**
 * Delete order
 * @route DELETE /api/orders/:id
 * @access Private - Customer or Admin
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

    // Check permissions
    const isAdmin = req.user.role === "ADMIN";
    const isCustomer = order.customerId === req.user.id;

    if (!isAdmin && !isCustomer) {
      return res.status(403).json({
        status: 403,
        message: "You don't have permission to delete this order",
      });
    }

    // Additional checks for customers
    if (
      isCustomer &&
      !["PLACED", "CANCELLED"].includes(order.restaurantOrder.status)
    ) {
      return res.status(400).json({
        status: 400,
        message: "Cannot delete order that is already being processed",
      });
    }

    // Delete the order
    await Order.deleteOne({ orderId: req.params.id });

    res.status(200).json({
      status: 200,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({
      status: 500,
      message: error.message || "Failed to delete order",
    });
  }
};

/**
 * Assign delivery person to an order
 * @route PATCH /api/orders/:id/delivery-person
 * @access Private - Admin, Delivery
 */
const assignDeliveryPerson = async (req, res) => {
  try {
    const {
      deliveryPersonId,
      name,
      phone,
      vehicleDetails,
      vehicleNumber,
      rating,
      profileImage,
    } = req.body;
    const orderId = req.params.id;

    // Get order
    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        status: 404,
        message: "Order not found",
      });
    }

    // Check if user is authorized to assign delivery person
    const isAdmin = req.user.role === "ADMIN";
    const isDeliveryService = req.user.role === "DELIVERY_SERVICE";

    if (!isAdmin && !isDeliveryService) {
      return res.status(403).json({
        status: 403,
        message: "You don't have permission to assign delivery person",
      });
    }

    // Check if order is in a valid status to assign delivery person
    const validStatuses = ["CONFIRMED", "PREPARING", "READY_FOR_PICKUP"];
    if (!validStatuses.includes(order.restaurantOrder.status)) {
      return res.status(400).json({
        status: 400,
        message: "Cannot assign delivery person in current order status",
      });
    }

    // Assign delivery person
    order.deliveryPerson = {
      id: deliveryPersonId,
      name,
      phone,
      vehicleDetails,
      vehicleNumber,
      rating,
      profileImage,
      assignedAt: new Date(),
    };

    // Set estimated delivery time
    if (order.restaurantOrder.estimatedReadyTime) {
      const estimatedDeliveryTime = new Date(
        order.restaurantOrder.estimatedReadyTime
      );
      estimatedDeliveryTime.setMinutes(estimatedDeliveryTime.getMinutes() + 25);
      order.estimatedDeliveryTime = estimatedDeliveryTime;
    }

    // Save updated order
    const updatedOrder = await order.save();

    // Notify customer about delivery person assignment
    try {
      await axios.post(
        `${global.gConfig.notification_url}/notifications`,
        {
          type: "DELIVERY_ASSIGNED",
          recipientId: order.customerId,
          recipientType: "CUSTOMER",
          data: {
            orderId: order.orderId,
            deliveryPersonName: name,
            deliveryPersonPhone: phone,
            estimatedDeliveryTime: order.estimatedDeliveryTime,
          },
        },
        { headers: { authorization: req.headers.authorization } }
      );
    } catch (error) {
      console.error("Failed to send notification to customer:", error);
    }

    res.status(200).json({
      status: 200,
      message: "Delivery person assigned successfully",
      order: {
        orderId: updatedOrder.orderId,
        deliveryPerson: updatedOrder.deliveryPerson,
        estimatedDeliveryTime: updatedOrder.estimatedDeliveryTime,
      },
    });
  } catch (error) {
    console.error("Error assigning delivery person:", error);
    res.status(500).json({
      status: 500,
      message: error.message || "Failed to assign delivery person",
    });
  }
};

/**
 * Update delivery person location
 * @route PATCH /api/orders/:id/delivery-location
 * @access Private - Delivery
 */
const updateDeliveryLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const orderId = req.params.id;

    if (!lat || !lng) {
      return res.status(400).json({
        status: 400,
        message: "Latitude and longitude are required",
      });
    }

    // Get order
    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        status: 404,
        message: "Order not found",
      });
    }

    // Check if user is authorized to update location
    const isDeliveryPerson =
      req.user.role === "DELIVERY" &&
      order.deliveryPerson &&
      order.deliveryPerson.id.toString() === req.user.id;

    if (!isDeliveryPerson) {
      return res.status(403).json({
        status: 403,
        message: "You don't have permission to update this delivery location",
      });
    }

    // Check if order is in a valid status
    if (order.restaurantOrder.status !== "OUT_FOR_DELIVERY") {
      return res.status(400).json({
        status: 400,
        message:
          "Can only update location for orders that are out for delivery",
      });
    }

    // Update delivery person's current location
    if (!order.deliveryPerson) {
      order.deliveryPerson = {};
    }

    order.deliveryPerson.currentLocation = {
      lat,
      lng,
      updatedAt: new Date(),
    };

    // Save updated order
    await order.save();

    res.status(200).json({
      status: 200,
      message: "Delivery location updated successfully",
    });
  } catch (error) {
    console.error("Error updating delivery location:", error);
    res.status(500).json({
      status: 500,
      message: error.message || "Failed to update delivery location",
    });
  }
};

export {
  createOrder,
  getOrderById,
  getUserOrders,
  getRestaurantOrders,
  getAllOrders,
  deleteOrder,
  updateOrderStatus,
  assignDeliveryPerson,
  updateDeliveryLocation,
};
