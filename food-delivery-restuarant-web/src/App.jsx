import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Login';
import RestaurantAdminLogin from './pages/RestaurantAdminLogin';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard'; // New
import AddRestaurant from './pages/AddRestaurant';
import EditRestaurant from './pages/EditRestaurant';
import Orders from './pages/Orders';
import Dishes from './pages/Dishes';
import AddDish from './pages/AddDish';
import EditDish from './pages/EditDish';
import RestaurantDetails from './pages/RestaurantDetails';
import DishDetails from './pages/DishDetails';
const App = () => {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/restaurant-admin/login" element={<RestaurantAdminLogin />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} /> {/* New */}
        <Route path="/restaurants/add" element={<AddRestaurant />} />
        <Route path="/restaurants/:id" element={<RestaurantDetails />} />
        <Route path="/restaurants/edit/:id" element={<EditRestaurant />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/dishes" element={<Dishes />} />
        <Route path="/dishes/:id" element={<DishDetails />} />
        <Route path="/dishes/add" element={<AddDish />} />
        <Route path="/dishes/edit/:id" element={<EditDish />} />
        <Route path="/" element={<Login />} />
      </Routes>
    </Router>
  );
};

export default App;