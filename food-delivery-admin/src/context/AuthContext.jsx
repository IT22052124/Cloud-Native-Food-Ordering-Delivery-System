import { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Initialize from localStorage if available
    const token = localStorage.getItem("token");
    return token ? { token } : null;
  });

  const login = (userData) => {
    // Add validation
    if (!userData || !userData.token) {
      console.error("Invalid userData in login:", userData);
      throw new Error("Login failed: Missing token in user data");
    }

    // Only proceed if token exists
    setUser(userData);
    localStorage.setItem("token", userData.token);
  };

  const logout = () => {
    setUser(null);
    // Clear ALL auth-related items
    localStorage.removeItem("token");
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("refreshToken");
    sessionStorage.removeItem("token_backup");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login, // Expose login function
        logout, // Expose logout function
        setUser, // Also expose setUser directly (optional)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
