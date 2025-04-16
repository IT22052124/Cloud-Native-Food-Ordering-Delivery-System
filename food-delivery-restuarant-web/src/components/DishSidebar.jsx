import React, {useContext}from 'react';
import { NavLink } from 'react-router-dom';
import { FaTachometerAlt, FaUtensils, FaPlus, FaClipboardList, FaUsers } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';

const DishSidebar = () => {
      const { user } = useContext(AuthContext);
    
  return (
    <div className="fixed top-0 left-0 w-64 h-screen bg-gray-50 dark:bg-gray-800 shadow-md p-4 flex flex-col border-r border-gray-200 dark:border-gray-700">
      {/* Logo/App Name */}
      <div className="mb-10 pt-4 px-2">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
          <FaUtensils className="mr-3 text-accent" />
          <span>FoodDelivery</span>
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Admin Dashboard</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 overflow-y-auto">        
        <NavLink
          to="/admin-dashboard"
          className={({ isActive }) =>
            `flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
              isActive
                ? 'bg-accent text-white shadow-md'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`
          }
        >
          <FaTachometerAlt className="flex-shrink-0" />
          <span className="font-medium">Dashboard</span>
        </NavLink>

        <NavLink
          to="/dishes"
          className={({ isActive }) =>
            `flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
              isActive
                ? 'bg-accent text-white shadow-md'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`
          }
        >
          <FaUtensils className="flex-shrink-0" />
          <span className="font-medium">All Dishes</span>
        </NavLink>

        <NavLink
          to="/dishes/add"
          className={({ isActive }) =>
            `flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
              isActive
                ? 'bg-accent text-white shadow-md'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`
          }
        >
          <FaPlus className="flex-shrink-0" />
          <span className="font-medium">Add New Dish</span>
        </NavLink>

        <NavLink
          to="/orders"
          className={({ isActive }) =>
            `flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
              isActive
                ? 'bg-accent text-white shadow-md'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`
          }
        >
          <FaClipboardList className="flex-shrink-0" />
          <span className="font-medium">Orders</span>
          <span className="ml-auto bg-accent text-white text-xs px-2 py-1 rounded-full">
            5
          </span>
        </NavLink>

        <NavLink
          to="/users"
          className={({ isActive }) =>
            `flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
              isActive
                ? 'bg-accent text-white shadow-md'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`
          }
        >
          <FaUsers className="flex-shrink-0" />
          <span className="font-medium">Users</span>
        </NavLink>
      </nav>

      {/* User profile/settings at bottom */}
      <div className="mt-auto p-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white">
            <span>AD</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800 dark:text-white">Admin User</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user.email || user.username}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DishSidebar;