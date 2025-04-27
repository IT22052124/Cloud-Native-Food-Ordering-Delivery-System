import React, { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const ownerToken = localStorage.getItem("ownerToken");
    const adminToken = localStorage.getItem("adminToken");
    const lastRole = localStorage.getItem("lastRole");

    let selectedToken = null;
    let selectedRole = null;

    if (lastRole === "owner" && ownerToken) {
      selectedToken = ownerToken;
      selectedRole = "owner";
    } else if (lastRole === "admin" && adminToken) {
      selectedToken = adminToken;
      selectedRole = "admin";
    } else if (ownerToken) {
      selectedToken = ownerToken;
      selectedRole = "owner";
    } else if (adminToken) {
      selectedToken = adminToken;
      selectedRole = "admin";
    }

    if (selectedToken) {
      try {
        const decoded = jwtDecode(selectedToken);
        console.log(`Decoded ${selectedRole} token:`, decoded);
        setUser(decoded);
        setToken(selectedToken);
        setRole(selectedRole);
      } catch (error) {
        console.error("Token decode error:", error);
        setUser(null);
        setToken(null);
        setRole(null);
        // Only clear tokens if they're invalid
        localStorage.removeItem("ownerToken");
        localStorage.removeItem("adminToken");
        localStorage.removeItem("lastRole");
      }
    }
  }, []);

  const login = (newToken, userRole) => {
    if (!["owner", "admin"].includes(userRole)) {
      console.error("Invalid role:", userRole);
      return;
    }
    console.log(`AuthContext: Login with token for ${userRole}:`, newToken);
    try {
      const decoded = jwtDecode(newToken);
      console.log(`Decoded ${userRole} token:`, decoded);
      setUser(decoded);
      setToken(newToken);
      setRole(userRole);
      localStorage.setItem(`${userRole}Token`, newToken);
      localStorage.setItem("lastRole", userRole);
    } catch (error) {
      console.error("Token decode error during login:", error);
      setUser(null);
      setToken(null);
      setRole(null);
    }
  };

  const logout = () => {
    if (role === "owner") {
      localStorage.removeItem("ownerToken");
    } else if (role === "admin") {
      localStorage.removeItem("adminToken");
    }
    localStorage.removeItem("lastRole");
    setUser(null);
    setToken(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};