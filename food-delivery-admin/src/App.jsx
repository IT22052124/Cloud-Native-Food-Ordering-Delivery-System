import { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeContext } from "./context/ThemeContext";
import { AuthContext } from "./context/AuthContext";
import DashboardLayout from "./layouts/DashboardLayout";
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
  if (!user) {
    return <Navigate to="/login" />;
  }
  return children;
};

function App() {
  const { theme } = useContext(ThemeContext);

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
