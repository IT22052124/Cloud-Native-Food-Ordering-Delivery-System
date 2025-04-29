import axios from "axios";

/**
 * Middleware to protect routes by verifying JWT token
 */
const protect = async (req, res, next) => {
  console.log("hi");
  try {
    // Check if authorization header exists
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: 401,
        message: "Not authorized to access this route",
      });
    }

    // Get token from header
    const token = authHeader.split(" ")[1];

    // Validate token with auth service
    try {
      const response = await axios.get(
        `${global.gConfig.auth_url}/api/auth/validate-token`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Set user info in request object
      req.user = response.data.user;
      next();
    } catch (error) {
      if (error.response) {
        return res.status(error.response.status).json({
          status: error.response.status,
          message: error.response.data.message || "Authentication failed",
        });
      }

      return res.status(401).json({
        status: 401,
        message: "Authentication failed: " + error.message,
      });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

/**
 * Middleware to restrict access based on user role
 * @param {string[]} roles - Array of allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 401,
        message: "Not authenticated",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 403,
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }

    next();
  };
};

/**
 * Validate user token with auth service
 * For more rigorous validation, calls auth service to validate token
 */
const validateWithAuthService = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      // Extract token from Bearer token
      token = req.headers.authorization.split(" ")[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      });
    }

    try {
      // Call auth service to validate token
      const response = await axios.get(
        `${
          process.env.AUTH_SERVICE_URL || "http://localhost:5001"
        }/api/auth/validate-token`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // If valid, auth service will return user info
      if (response.data && response.data.success) {
        req.user = response.data.user;
        next();
      } else {
        return res.status(401).json({
          success: false,
          message: "Invalid authentication token",
        });
      }
    } catch (error) {
      // Handle auth service errors
      if (error.response) {
        // Auth service rejected the token
        return res.status(401).json({
          success: false,
          message: "Invalid or expired token",
        });
      }
      throw error; // Re-throw for other errors
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Server error in authentication",
    });
  }
};

export { protect, authorize, validateWithAuthService };
