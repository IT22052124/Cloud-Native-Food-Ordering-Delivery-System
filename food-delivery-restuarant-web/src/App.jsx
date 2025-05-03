import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./pages/Login/Login";
import RestaurantAdminLogin from "./pages/Login/RestaurantAdminLogin";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard"; // New
import AddRestaurant from "./pages/AddRestaurant";
import EditRestaurant from "./pages/EditRestaurant";
import Orders from "./pages/Orders";
import Dishes from "./pages/Dishes";
import AddDish from "./pages/AddDish";
import EditDish from "./pages/EditDish";
import RestaurantDetails from "./pages/RestaurantDetails";
import DishDetails from "./pages/DishDetails";
import IncomingOrders from "./pages/Orders/IncomingOrders";
import ProcessingOrders from "./pages/Orders/ProcessingOrders";
import OrderHistory from "./pages/Orders/OrderHistory";
import OrderEarnings from "./pages/Orders/Earnings";
import ReadyForPickupOrders from "./pages/Orders/PickUp";
import Resturant from "./pages/Restaurant";
import UserProfile from "./pages/userprofile";
import PendingRestaurantTable from "./pages/pendingRestaurant";
import RestaurantAdminDetails from "./pages/Admin/resturantAdminDetails"
import AdminEditRestaurant from "./pages/Admin/AdminEditRestaurant"
import Credentialpage from "./pages/Admin/credentialpage"
import Signup from "./pages/Login/SignUp";
import SignupConfirmation from "./pages/Login/signupConfirmationpage";
import OwnerEarnings from "./pages/OwnerEarnings";
const App = () => {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/restaurant/admin/login"
          element={<RestaurantAdminLogin />}
        />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signup/confirmation" element={<SignupConfirmation />} />


        <Route path="/admin-dashboard" element={<AdminDashboard />} />{" "}
        {/* New */}
        <Route path="/owner/earnings" element={<OwnerEarnings />} />

        <Route path="/restaurants/add" element={<AddRestaurant />} />
        <Route path="/restaurants/" element={<Resturant />} />
        <Route path="/restaurants/admin/profile" element={<RestaurantAdminDetails />} />
        <Route path="/restaurants/admin/edit/:id" element={<AdminEditRestaurant />} />
        <Route path="/restaurants/admin/credentials/:id" element={<Credentialpage />} />

        <Route path="/restaurants/:id" element={<RestaurantDetails />} />
        <Route path="/restaurants/edit/:id" element={<EditRestaurant />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/dishes" element={<Dishes />} />
        <Route path="/dishes/:id" element={<DishDetails />} />
        <Route path="/dishes/add" element={<AddDish />} />
        <Route path="/dishes/edit/:id" element={<EditDish />} />
        <Route path="/orders/incoming" element={<IncomingOrders />} />
        <Route path="/orders/earnings" element={<OrderEarnings />} />
        <Route path="/orders/processing" element={<ProcessingOrders />} />
        <Route path="/orders/ready" element={<ReadyForPickupOrders />} />
        <Route path="/orders/history" element={<OrderHistory />} />
        <Route path="/restaurants/pending" element={<PendingRestaurantTable />} />

        <Route path="/user" element={<UserProfile />} />
        <Route path="/" element={<Login />} />
      </Routes>
    </Router>
  );
};

export default App;
