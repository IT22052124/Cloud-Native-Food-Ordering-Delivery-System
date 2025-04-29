import jwt from "jsonwebtoken";

const authMiddlewareAdmin = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) {
    console.error("Authorization header missing");
    return res.status(403).json({ message: "Access Denied!" });
  }

  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
    console.log("Decoded admin token:", decoded); // Debug log
    req.resturantId = decoded.id; // Restaurant ID from token
    req.adminId = decoded.adminId; // Admin ID for additional checks if needed
    req.role = decoded.role; // Role for authorizeRole middleware
    req.username = decoded.username; // Username for additional checks if needed
    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);
    res.status(403).json({ message: "Invalid token!" });
  }
};

export default authMiddlewareAdmin;