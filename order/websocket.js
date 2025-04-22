import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import axios from "axios";
import Order from "./model/order.js";
import url from "url";

// Store active connections
const clients = new Map(); // Map of orderId -> [client1, client2, ...]

export function setupWebSocket(server) {
  const wss = new WebSocketServer({ noServer: true });

  // Handle WebSocket connection
  wss.on("connection", (ws, request, orderId, userId) => {
    console.log(`WebSocket connected for order ${orderId} by user ${userId}`);

    // Store client connection with orderId
    if (!clients.has(orderId)) {
      clients.set(orderId, []);
    }

    // Add client to order's connections
    const orderClients = clients.get(orderId);
    orderClients.push({
      userId: userId,
      ws: ws,
    });

    // Set up client disconnect handler
    ws.on("close", () => {
      console.log(
        `WebSocket disconnected for order ${orderId} by user ${userId}`
      );
      const orderClients = clients.get(orderId);
      if (orderClients) {
        // Remove this client
        const index = orderClients.findIndex((client) => client.ws === ws);
        if (index !== -1) {
          orderClients.splice(index, 1);
        }

        // If no clients left for this order, clean up
        if (orderClients.length === 0) {
          clients.delete(orderId);
        }
      }
    });

    // Handle client messages (if needed)
    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log(`Received message from client for order ${orderId}:`, data);

        // Handle specific message types if needed
        if (data.type === "PING") {
          ws.send(
            JSON.stringify({
              type: "PONG",
              timestamp: new Date().toISOString(),
            })
          );
        }
      } catch (err) {
        console.error("Error processing client message:", err);
      }
    });
  });

  // Handle HTTP server upgrade to WebSocket
  server.on("upgrade", async (request, socket, head) => {
    const parsedUrl = url.parse(request.url);
    const pathname = parsedUrl.pathname;

    // Extract token from query parameters
    const params = new URLSearchParams(parsedUrl.query || "");
    const token = params.get("token");

    // Only handle WebSocket connections for order tracking
    if (pathname.startsWith("/ws/orders/")) {
      try {
        // Validate token
        if (!token) {
          socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
          socket.destroy();
          return;
        }

        // Verify and decode token
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || "your-secret-key"
        );
        const userId = decoded.id;

        // Extract orderId from URL
        const orderId = pathname.split("/").pop();

        // Check if order exists and user has permission
        try {
          const order = await Order.findOne({ orderId });
          if (!order) {
            socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
            socket.destroy();
            return;
          }

          // Check permissions - allow admin, restaurant owner, customer of the order
          if (
            decoded.role !== "ADMIN" &&
            decoded.role !== "RESTAURANT" &&
            order.customerId.toString() !== userId
          ) {
            socket.write("HTTP/1.1 403 Forbidden\r\n\r\n");
            socket.destroy();
            return;
          }

          // Complete WebSocket handshake
          wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit("connection", ws, request, orderId, userId);
          });
        } catch (dbError) {
          console.error("Database error during WebSocket upgrade:", dbError);
          socket.write("HTTP/1.1 500 Internal Server Error\r\n\r\n");
          socket.destroy();
        }
      } catch (err) {
        console.error("WebSocket upgrade error:", err);
        socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
        socket.destroy();
      }
    } else {
      socket.destroy();
    }
  });

  return wss;
}

// Function to send order status update to connected clients
export function notifyOrderStatusUpdate(orderId, order) {
  if (clients.has(orderId)) {
    const orderClients = clients.get(orderId);
    const message = JSON.stringify({
      type: "ORDER_UPDATE",
      timestamp: new Date().toISOString(),
      order: {
        orderId: order.orderId,
        status: order.status,
        statusUpdates: order.statusHistory?.reduce((acc, status) => {
          const timestamp = new Date(status.timestamp).toLocaleString();
          acc[status.status.toLowerCase()] = timestamp;
          return acc;
        }, {}),
      },
    });

    orderClients.forEach((client) => {
      try {
        if (client.ws.readyState === 1) {
          // 1 = WebSocket.OPEN
          client.ws.send(message);
        }
      } catch (err) {
        console.error(
          `Error sending status update to client for order ${orderId}:`,
          err
        );
      }
    });
  }
}

// Function to send driver location update to connected clients
export function notifyDriverLocationUpdate(orderId, driverData) {
  if (clients.has(orderId)) {
    const orderClients = clients.get(orderId);
    const message = JSON.stringify({
      type: "TRACKING_UPDATE",
      timestamp: new Date().toISOString(),
      tracking: {
        driverLocation: driverData.location,
        estimatedArrival: driverData.estimatedDeliveryTime,
        routeCoordinates: driverData.route,
      },
    });

    orderClients.forEach((client) => {
      try {
        if (client.ws.readyState === 1) {
          // 1 = WebSocket.OPEN
          client.ws.send(message);
        }
      } catch (err) {
        console.error(
          `Error sending driver update to client for order ${orderId}:`,
          err
        );
      }
    });
  }
}
