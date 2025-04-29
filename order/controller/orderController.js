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

const getRestaurantById = async (authorization, restaurantId) => {
  try {
    const response = await axios.get(
      `${global.gConfig.restaurant_url}/api/restaurants/${restaurantId}`,
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

      // Base order item
      const orderItem = {
        itemId: cartItem.itemId,
        name: menuItem.name,
        price: cartItem.itemPrice, // Use the stored item price from cart which already accounts for portions
        quantity: cartItem.quantity,
        specialInstructions: cartItem.specialInstructions || "",
      };

      // Add portion information if it's a portion item
      if (cartItem.isPortionItem) {
        const portion = menuItem.portions?.find(
          (p) => p._id.toString() === cartItem.portionId.toString()
        );
        if (!portion) {
          throw new Error(
            `Portion ${cartItem.portionId} not found for item ${cartItem.itemId}`
          );
        }
        orderItem.portionId = cartItem.portionId;
        orderItem.portionName = cartItem.portionName;
        orderItem.isPortionItem = true;
      }

      return orderItem;
    });

    // Calculate subtotal using the cart item's stored total prices
    const subtotal =
      req.body.subtotal ||
      cartItems.reduce((total, item) => total + item.totalPrice, 0);

    const orderType = req.body.type || "DELIVERY";

    // Calculate tax - use custom tax rate if provided, otherwise use default 8%
    const taxRate = req.body.customTaxRate || 0.08; // Default to 8% if not provided

    // Use provided tax value if available, otherwise calculate
    const tax = req.body.tax || Math.round(subtotal * taxRate * 100) / 100;

    // Get delivery fee - use provided value or get from restaurant or use default
    const deliveryFee =
      req.body.deliveryFee !== undefined
        ? req.body.deliveryFee
        : orderType === "PICKUP"
        ? 0
        : restaurant.deliveryFee || 2.99;

    // Calculate total amount
    const totalAmount = subtotal + tax + deliveryFee;

    console.log(restaurant.imageUrls[0], restaurant.coverImageUrl);
    // Create new order
    const orderData = {
      orderId: `ORD-${Date.now().toString().slice(-6)}`,
      customerId,
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      type: orderType,
      restaurantOrder: {
        restaurantId,
        restaurantName: restaurant.name,
        restaurantLocation: {
          lat: restaurant.address.coordinates.lat,
          lng: restaurant.address.coordinates.lng,
        },
        restaurantImage: restaurant.imageUrls[0] || restaurant.coverImageUrl,
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
      totalAmount,
      paymentMethod: req.body.paymentMethod || "CASH",
      paymentStatus: "PENDING",
      paymentDetails: req.body.paymentDetails || {},
    };

    if (orderType === "DELIVERY") {
      if (!req.body.deliveryAddress && !req.user.address) {
        return res.status(400).json({
          status: 400,
          message: "Delivery address is required for delivery orders",
        });
      }
      orderData.deliveryAddress = req.body.deliveryAddress || req.user.address;
    }

    // Save order
    const newOrder = new Order(orderData);
    const savedOrder = await newOrder.save();

    // Calculate platform fee (example: 20% of subtotal)
    const platformFee = savedOrder.restaurantOrder.subtotal * 0.2;

    // Call settlement service to record this order
    try {
      await axios.post(
        `${global.gConfig.admin_url}/api/settlements/add-order`,
        {
          restaurantId: savedOrder.restaurantOrder.restaurantId,
          restaurantName: savedOrder.restaurantOrder.restaurantName,
          orderId: savedOrder._id,
          subtotal: savedOrder.restaurantOrder.subtotal,
          platformFee: platformFee,
          weekEnding: getNextSunday(), // Helper function below
        },
        {
          headers: { Authorization: req.headers.authorization },
          "Content-Type": "application/json",
        }
      );
    } catch (err) {
      console.error(
        "Failed to update restaurant settlement (non-critical):",
        err
      );
    }
    // Clear cart after successful order
    await CartItem.deleteMany({ customerId });

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

function getNextSunday() {
  const today = new Date();
  const nextSunday = new Date(today);
  nextSunday.setDate(today.getDate() + (7 - today.getDay()));
  return nextSunday.toISOString().split("T")[0];
}

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

    // Check permissions and get full restaurant details
    const isRestaurant = false;
    const response = await getRestaurantById(
      req.headers.authorization,
      order.restaurantOrder.restaurantId
    );

    const restaurant = response.data;
    if (req.user.role === "RESTAURANT") {
      isRestaurant = restaurant.ownerId === req.user.id;
    }

    const isAdmin = req.user.role === "ADMIN";
    const isCustomer = order.customerId.toString() === req.user.id;

    // if (!isAdmin && !isCustomer && !isRestaurant) {
    //   return res.status(403).json({
    //     status: 403,
    //     message: "You don't have permission to view this order",
    //   });
    // }

    // Fetch current dish data to get images
    const dishesResponse = await getRestaurantDishes(
      req.headers.authorization,
      order.restaurantOrder.restaurantId
    );

    // Create a map of dish IDs to their data
    const dishMap = {};
    if (dishesResponse && dishesResponse.data && dishesResponse.data.dishes) {
      dishesResponse.data.dishes.forEach((dish) => {
        dishMap[dish._id] = dish;
      });
    }

    // Add image URLs to order items
    const enhancedItems = order.restaurantOrder.items.map((item) => {
      const dish = dishMap[item.itemId];
      return {
        ...item.toObject(),
        image: dish.imageUrls ? dish.imageUrls[0] || null : null,
      };
    });

    // Create a new order object with enhanced items
    const enhancedOrder = {
      ...order.toObject(),
      restaurantOrder: {
        ...order.restaurantOrder.toObject(),
        items: enhancedItems,
      },
    };

    // For restaurant users, only return their part of the order
    if (isRestaurant) {
      return res.status(200).json({
        status: 200,
        order: {
          orderId: enhancedOrder.orderId,
          customerName: enhancedOrder.customerName,
          customerPhone: enhancedOrder.customerPhone,
          type: enhancedOrder.type,
          deliveryAddress: enhancedOrder.deliveryAddress,
          status: enhancedOrder.restaurantOrder.status,
          items: enhancedOrder.restaurantOrder.items, // Now includes images
          subtotal: enhancedOrder.restaurantOrder.subtotal,
          tax: enhancedOrder.restaurantOrder.tax,
          deliveryFee: enhancedOrder.restaurantOrder.deliveryFee,
          estimatedReadyTime: enhancedOrder.restaurantOrder.estimatedReadyTime,
        },
      });
    }

    res.status(200).json({
      status: 200,
      order: enhancedOrder,
      restaurant,
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
      items: order.restaurantOrder.items,
      restaurant: order.restaurantOrder.restaurantName,
      restaurantImage: order.restaurantOrder.restaurantImage,
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
    console.log("processedOrders", processedOrders);

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
 * Get tracking information for an order
 * @route GET /api/orders/:id/tracking
 * @access Private
 */
const getOrderTracking = async (req, res) => {
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
    const isCustomer = order.customerId.toString() === req.user.id;
    const isRestaurant =
      req.user.role === "RESTAURANT" &&
      order.restaurantOrder.restaurantId.toString() === req.user.restaurantId;

    if (!isAdmin && !isCustomer && !isRestaurant) {
      return res.status(403).json({
        status: 403,
        message: "You don't have permission to view this order tracking",
      });
    }

    // Only provide tracking for certain order statuses
    if (
      order.restaurantOrder.status === "PLACED" ||
      order.restaurantOrder.status === "CANCELLED"
    ) {
      return res.status(400).json({
        status: 400,
        message: "Tracking not available for this order status",
      });
    }

    const restaurantLocation = order.restaurantOrder.restaurantLocation || null;

    // Determine driver location and route based on order status
    let driverLocation = null;
    let route = null;
    let estimatedDeliveryTime = null;

    if (order.delivery && order.delivery.deliveryPerson) {
      // If order has delivery person assigned
      if (order.delivery.deliveryPerson.currentLocation) {
        driverLocation = {
          latitude: order.delivery.deliveryPerson.currentLocation.lat,
          longitude: order.delivery.deliveryPerson.currentLocation.lng,
        };
      }

      // If status is OUT_FOR_DELIVERY, calculate route and ETA
      if (order.restaurantOrder.status === "OUT_FOR_DELIVERY") {
        // In a real app, we would call a routing service like Google Maps
        // For this demo, we'll use a simplified mock route

        // Mock route between driver and delivery address
        if (driverLocation && order.deliveryAddress) {
          route = [
            driverLocation,
            // Add some intermediate points for realistic route
            {
              latitude:
                (driverLocation.latitude + order.deliveryAddress.latitude) / 2,
              longitude:
                (driverLocation.longitude + order.deliveryAddress.longitude) /
                2,
            },
            {
              latitude: order.deliveryAddress.latitude,
              longitude: order.deliveryAddress.longitude,
            },
          ];

          // Calculate estimated delivery time (mock)
          const now = new Date();
          estimatedDeliveryTime = new Date(now.getTime() + 20 * 60000); // 20 minutes from now
        }
      } else if (order.restaurantOrder.status === "READY_FOR_PICKUP") {
        // Driver is at or going to restaurant
        driverLocation = restaurantLocation;

        // Calculate estimated delivery time for this status
        const now = new Date();
        estimatedDeliveryTime = new Date(now.getTime() + 30 * 60000); // 30 minutes from now
      }
    } else {
      // If no delivery person assigned yet but status indicates delivery
      if (order.restaurantOrder.status === "READY_FOR_PICKUP") {
        driverLocation = restaurantLocation;
      } else if (order.type === "DELIVERY") {
        // For other statuses, provide some mock data for demo purposes
        driverLocation = {
          latitude: 37.7765,
          longitude: -122.4075,
        };

        // Mock route
        if (order.deliveryAddress) {
          route = [
            driverLocation,
            {
              latitude:
                (driverLocation.latitude + order.deliveryAddress.latitude) / 2,
              longitude:
                (driverLocation.longitude + order.deliveryAddress.longitude) /
                2,
            },
            order.deliveryAddress,
          ];
        }
      }
    }

    // When no real driver data is available, provide mock data for demo
    // if (!driverLocation && order.restaurantOrder.status === "PREPARING") {
    // Simulate driver at the restaurant
    driverLocation = restaurantLocation;
    // }

    const trackingData = {
      orderId: order.orderId,
      status: order.restaurantOrder.status,
      restaurantLocation,
      driverLocation,
      route,
      estimatedDeliveryTime: estimatedDeliveryTime
        ? estimatedDeliveryTime.toISOString()
        : null,
      lastUpdated: new Date().toISOString(),
    };

    res.status(200).json(trackingData);
  } catch (error) {
    console.error("Error getting order tracking:", error);
    res.status(500).json({
      status: 500,
      message: error.message || "Failed to get order tracking information",
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

    // // Check if user is authorized to update status
    // const isRestaurant =
    //   req.user.role === "RESTAURANT" &&
    //   order.restaurantOrder.restaurantId === req.user.id;
    // const isAdmin = req.user.role === "ADMIN";

    // if (!isRestaurant && !isAdmin) {
    //   return res.status(403).json({
    //     status: 403,
    //     message: "You don't have permission to update this order",
    //   });
    // }

    // Update status
    order.restaurantOrder.status = status;
    order.restaurantOrder.statusHistory.push({
      status,
      timestamp: new Date(),
      updatedBy: req.user.id,
      notes: notes || "",
    });

    // Handle special statuses
    if (status === "PREPARING" && estimatedReadyMinutes) {
      order.restaurantOrder.estimatedReadyTime = new Date(
        Date.now() + estimatedReadyMinutes * 60000
      );
    } else if (status === "READY_FOR_PICKUP") {
      order.restaurantOrder.actualReadyTime = new Date();
    }

    // Save updated order
    const updatedOrder = await order.save();

    // Notify customer about status change via WebSocket
    try {
      // Import the notifyOrderStatusUpdate function from websocket.js
      const { notifyOrderStatusUpdate } = await import("../websocket.js");

      // Send WebSocket update to all connected clients for this order
      notifyOrderStatusUpdate(order.orderId, {
        orderId: order.orderId,
        status: status,
        statusHistory: updatedOrder.restaurantOrder.statusHistory,
      });
    } catch (socketError) {
      console.error("Failed to send WebSocket notification:", socketError);
      // Continue without WebSocket notification if it fails
    }

    // Notify customer about status change via notification service (existing code)
    // try {
    //   await axios.post(
    //     `${global.gConfig.notification_url}/notifications`,
    //     {
    //       type: "ORDER_STATUS_UPDATE",
    //       recipientId: order.customerId,
    //       recipientType: "CUSTOMER",
    //       data: {
    //         orderId: order.orderId,
    //         status,
    //         restaurantName: order.restaurantOrder.restaurantName,
    //         estimatedReadyTime: order.restaurantOrder.estimatedReadyTime,
    //       },
    //     },
    //     { headers: { authorization: req.headers.authorization } }
    //   );
    // } catch (error) {
    //   console.error("Failed to send notification to customer:", error);
    // }

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
      restaurantImage: order.restaurantOrder.imageUrls[0],
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
    const validStatuses = ["PREPARING", "READY_FOR_PICKUP"];
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

const updateOrderPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentDetails } = req.body;

    // Validate input
    if (
      !paymentDetails ||
      !paymentDetails.transactionId ||
      !paymentDetails.paymentProcessor
    ) {
      return res.status(400).json({
        error: "Transaction ID and payment processor are required",
      });
    }

    // Find and update the order
    const updatedOrder = await Order.findOneAndUpdate(
      { orderId },
      {
        $set: {
          paymentStatus: "PROCESSING",
          paymentDetails: {
            transactionId: paymentDetails.transactionId,
            paymentProcessor: paymentDetails.paymentProcessor,
            updatedAt: new Date(),
          },
        },
        $push: {
          paymentHistory: {
            status: "PROCESSING",
            timestamp: new Date(),
            transactionId: paymentDetails.transactionId,
          },
        },
      },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Optionally: Send notification to customer
    // await sendPaymentNotification(updatedOrder);

    res.status(200).json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order payment:", error);
    res.status(500).json({
      error: "Failed to update order payment status",
      details: error.message,
    });
  }
};

const updateOrderPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, paymentDetails } = req.body;

    // Validate input
    if (!status || !paymentDetails?.transactionId) {
      return res.status(400).json({
        error: "Status and transaction details are required",
      });
    }

    // Validate payment status
    const validPaymentStatuses = [
      "PAID",
      "FAILED",
      "REFUND_INITIATED",
      "REFUNDED",
    ];
    if (!validPaymentStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid payment status. Must be one of: ${validPaymentStatuses.join(
          ", "
        )}`,
      });
    }

    // Determine the appropriate order status based on payment status
    let orderStatus;
    switch (status) {
      case "PAID":
        orderStatus = "PLACED";
        break;
      case "FAILED":
        orderStatus = "CANCELLED";
        break;
      default:
        orderStatus = "CANCELLED"; // For refund cases
    }

    // Find and update the order
    const updatedOrder = await Order.findOneAndUpdate(
      { orderId },
      {
        $set: {
          paymentStatus: status,
          "restaurantOrder.status": orderStatus,
          paymentDetails: {
            ...paymentDetails,
            updatedAt: new Date(),
          },
        },
        $push: {
          "restaurantOrder.statusHistory": {
            status: orderStatus,
            timestamp: new Date(),
            updatedBy: null, // System initiated
            notes: `Payment status changed to ${status}`,
          },
          customerNotificationHistory: {
            type: status === "PAID" ? "ORDER_CONFIRMED" : "STATUS_UPDATE",
            timestamp: new Date(),
            success: true,
            details: `Payment ${status.toLowerCase()}`,
          },
        },
      },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.status(200).json({
      success: true,
      order: {
        orderId: updatedOrder.orderId,
        status: updatedOrder.restaurantOrder.status,
        paymentStatus: updatedOrder.paymentStatus,
        paymentDetails: updatedOrder.paymentDetails,
      },
    });
  } catch (error) {
    console.error("Error updating order payment status:", error);
    res.status(500).json({
      error: "Failed to update order payment status",
      details: error.message,
    });
  }
};

const queryOrders = async (req, res) => {
  try {
    const { startDate, endDate, status, paymentStatus } = req.query;

    // Validate required parameters
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "startDate and endDate are required parameters",
      });
    }

    // Construct the query
    const query = {
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    };

    // Add optional filters if provided
    if (status) {
      query["restaurantOrder.status"] = status;
    }

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    // Execute the query
    const orders = await Order.find(query)
      .select("-__v")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Error querying orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to query orders",
      error: error.message,
    });
  }
};

/**
 * Fetch multiple orders by ID
 * This endpoint is used by the payment service to get detailed order information
 */
const getOrdersByIds = async (req, res) => {
  try {
    const { orderIds } = req.body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Valid orderIds array is required",
      });
    }

    const orders = await Order.find({
      orderId: { $in: orderIds },
    }).select("-__v");

    // Check if any orders were not found
    const foundIds = orders.map((order) => order.orderId);
    const missingIds = orderIds.filter((id) => !foundIds.includes(id));

    res.json({
      success: true,
      count: orders.length,
      orders,
      missingIds: missingIds.length > 0 ? missingIds : undefined,
    });
  } catch (error) {
    console.error("Error fetching orders by IDs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders by IDs",
      error: error.message,
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
  getOrderTracking,
  updateOrderPayment,
  updateOrderPaymentStatus,
  getOrdersByIds,
  queryOrders,
};
