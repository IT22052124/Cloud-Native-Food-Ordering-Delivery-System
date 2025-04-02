// Middleware for role-based access control
export const authorizeRole = (...roles) => {
    // Return a middleware function
    return (req, res, next) => {
      if (!req.user || !roles.includes(req.user.role)) {
        return res
          .status(403)
          .json({ error: "Access forbidden: Insufficient permissions" });
      }
      // Move to the next middleware
      next();
    };
  };
  