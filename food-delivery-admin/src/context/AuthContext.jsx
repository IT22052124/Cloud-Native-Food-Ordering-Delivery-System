import { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Initialize user state

  // Function to update user (login)
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("token", userData.token); // Optional: Store token
  };

  // Function to clear user (logout)
  const logout = () => {
    setUser(null);
    localStorage.removeItem("token"); // Optional: Remove token
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
