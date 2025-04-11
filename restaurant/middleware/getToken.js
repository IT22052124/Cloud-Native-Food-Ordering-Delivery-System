// Middleware to verify token and extract owner ID
import jwt from "jsonwebtoken";
const authMiddlewareAdmin = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) {
    console.error("Authorization header missing");
    return res.status(403).json({ message: "Access Denied!" });
  }

  try {
 
    const decoded = jwt.verify(
      token.replace("Bearer ", ""),
      process.env.JWT_SECRET
    );
    req.resturantId = decoded.id; // Attach owner ID to request
    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);
    res.status(403).json({ message: "Invalid token!" });
  }
};

export default authMiddlewareAdmin;
