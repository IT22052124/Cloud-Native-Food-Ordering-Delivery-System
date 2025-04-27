import { useContext, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeContext } from "./context/ThemeContext";
import { AuthContext } from "./context/AuthContext";
import DashboardLayout from "./Layouts/DashboardLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Notifications from "./pages/Notifications";
import Restaurants from "./pages/Restaurants";
import RestaurantDetail from "./pages/RestaurantDetail";
import Drivers from "./pages/Drivers";
import DriverDetail from "./pages/DriverDetail";
import Finance from "./pages/Finance";
import Reports from "./pages/Reports";

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  const token = localStorage.getItem("token");

  if (!user || !token) {
    return <Navigate to="/login" />;
  }
  return children;
};

function App() {
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    // Store original localStorage methods
    const originalSetItem = localStorage.setItem;
    const originalRemoveItem = localStorage.removeItem;

    // Override setItem to track token changes
    localStorage.setItem = function (key, value) {
      if (key === "token") {
        console.group("Token Setter Trace");
        console.log("Setting token to:", value);
        console.trace("Full stack trace");
        console.groupEnd();
      }
      originalSetItem.apply(this, arguments);
    };

    // Override removeItem to track token removal
    localStorage.removeItem = function (key) {
      if (key === "token") {
        console.group("Token Removal Trace");
        console.trace("Who is removing the token?");
        console.groupEnd();
      }
      originalRemoveItem.apply(this, arguments);
    };

    return () => {
      // Restore original methods
      localStorage.setItem = originalSetItem;
      localStorage.removeItem = originalRemoveItem;
    };
  }, []);

  return (
    <div className={`${theme} min-h-screen`}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="restaurants" element={<Restaurants />} />
          <Route path="restaurants/:id" element={<RestaurantDetail />} />
          <Route path="drivers" element={<Drivers />} />
          <Route path="drivers/:id" element={<DriverDetail />} />
          <Route path="finance" element={<Finance />} />
          <Route path="reports" element={<Reports />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
