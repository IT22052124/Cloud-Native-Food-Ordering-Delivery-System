import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to handle login
  const login = async (email, password) => {
    try {
      setLoading(true);
      // In real implementation, this would make a request to your auth service
      // For demo purposes, we'll use dummy data
      if (email === "admin@example.com" && password === "password") {
        const userData = {
          id: "admin-123",
          name: "Admin User",
          email: "admin@example.com",
          role: "admin",
          token: "dummy-jwt-token",
        };
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        return userData;
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Function to handle logout
  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  // Check for stored user on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};
