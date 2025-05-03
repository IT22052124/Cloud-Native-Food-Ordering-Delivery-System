const jwt = require("jsonwebtoken");
const axios = require("axios");
let sendKafkaNotification;
import("shared-kafka")
  .then((module) => {
    sendKafkaNotification = module.sendKafkaNotification;
  })
  .catch((err) => {
    console.error("Failed to import shared-kafka:", err);
  });

const JWT_SECRET = process.env.JWT_SECRET;
const AUTH_SERVICE_URL =
  process.env.AUTH_SERVICE_URL || "http://localhost:5001";

const register = async (req, res) => {
  try {
    const { sendKafkaNotification } = await import("shared-kafka");

    const response = await axios.post(`${AUTH_SERVICE_URL}/api/auth/register`, {
      ...req.body,
      role: "delivery", // Force delivery role
    });

    // Only proceed with Kafka message if registration was successful
    if (response.status === 201) {
      const driver = response.data; // Assuming the response contains the driver data

      const kafkaMessage = {
        topic: "driver-registrations",
        type: "DRIVER_REGISTERED",
        driverId: driver._id.toString(), // or driver.id depending on your response structure
        id: driver._id.toString(), // Alternative field for consumer compatibility
        name: driver.name,
        email: driver.email,
        phone: driver.phone,
        vehicleType: "motorcycle", // You might want to make this dynamic
        vehiclePlate: driver.vehiclePlate,
        nic: driver.nic,
        status: "pending", // Assuming new drivers need approval
        timestamp: new Date().toISOString(),
        metadata: {
          nicImage: driver.nicImage,
          requiresApproval: true,
          registrationSource: "web", // Could be "mobile" etc.
        },
      };

      try {
        await producer.connect();
        await producer.send({
          topic: "driver-registrations",
          messages: [{ value: JSON.stringify(kafkaMessage) }],
        });
        console.log("✅ Driver registration event published to Kafka");
      } catch (kafkaError) {
        console.error(
          "❌ Failed to publish driver registration event:",
          kafkaError
        );
        // Don't fail the request, just log the Kafka error
      } finally {
        await producer.disconnect();
      }
    }

    res.status(201).json(response.data);
  } catch (error) {
    handleAuthServiceError(res, error, "Registration failed");
  }
};

const login = async (req, res) => {
  try {
    const response = await axios.post(
      `${AUTH_SERVICE_URL}/api/auth/login`,
      req.body
    );
    res.json(response.data);
  } catch (error) {
    handleAuthServiceError(res, error, "Login failed");
  }
};

const refreshToken = async (req, res) => {
  try {
    const response = await axios.post(
      `${AUTH_SERVICE_URL}/api/auth/refresh-token`,
      req.body
    );
    res.json(response.data);
  } catch (error) {
    handleAuthServiceError(res, error, "Token refresh failed");
  }
};

const validateToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });

    // Verify locally first
    jwt.verify(token, JWT_SECRET);

    // Optional: Validate with auth service for additional checks
    const response = await axios.get(
      `${AUTH_SERVICE_URL}/api/auth/validate-token`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    res.json(response.data);
  } catch (error) {
    handleAuthServiceError(res, error, "Token validation failed");
  }
};

const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const response = await axios.post(
      `${AUTH_SERVICE_URL}/api/auth/logout`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    res.json(response.data);
  } catch (error) {
    handleAuthServiceError(res, error, "Logout failed");
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const response = await axios.get(`${AUTH_SERVICE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    res.json(response.data);
  } catch (error) {
    handleAuthServiceError(res, error, "Failed to fetch user");
  }
};

// Helper function for consistent error handling
const handleAuthServiceError = (res, error, defaultMessage) => {
  console.error("Auth Service Error:", error.response?.data || error.message);
  const status = error.response?.status || 500;
  const message = error.response?.data?.message || defaultMessage;
  res.status(status).json({ success: false, message });
};

module.exports = {
  register,
  login,
  refreshToken,
  validateToken,
  logout,
  getCurrentUser,
};
