import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaPlusCircle, FaUsers, FaUtensils,FaInbox } from 'react-icons/fa';

const Sidebar = () => {
  return (
    <div className="w-64 h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white fixed shadow-xl">
      <div className="p-6 flex flex-col h-full">
        {/* Logo/Branding */}
        <div className="flex items-center mb-8">
          <FaUtensils className="text-3xl text-orange-500 mr-2" />
          <h1 className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-pink-500">
            Owner Dashboard
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1">
          <ul className="space-y-2">
            <li>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `flex items-center p-3 rounded-xl transition-all duration-300 ease-in-out ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-md'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white hover:scale-105 hover:shadow-lg'
                  }`
                }
                end
              >
                <FaHome className="mr-3 text-lg" />
                <span className="font-medium">Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/restaurants"
                className={({ isActive }) =>
                  `flex items-center p-3 rounded-xl transition-all duration-300 ease-in-out ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white hover:scale-105 hover:shadow-lg'
                  }`
                }
                end
              >
                <FaUtensils className="mr-3 text-lg" />
                <span className="font-medium">Restaurants</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/restaurants/add"
                className={({ isActive }) =>
                  `flex items-center p-3 rounded-xl transition-all duration-300 ease-in-out ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white hover:scale-105 hover:shadow-lg'
                  }`
                }
              >
                <FaPlusCircle className="mr-3 text-lg" />
                <span className="font-medium">Add Restaurant</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/restaurants/pending"
                className={({ isActive }) =>
                  `flex items-center p-3 rounded-xl transition-all duration-300 ease-in-out ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white hover:scale-105 hover:shadow-lg'
                  }`
                }
              >
                <FaInbox className="mr-3 text-lg" />
                <span className="font-medium">Pending </span>
              </NavLink>
            </li>
            <li>
              <NavLink
               // to="/user"/owner/earnings
               to="/owner/earnings"
                className={({ isActive }) =>
                  `flex items-center p-3 rounded-xl transition-all duration-300 ease-in-out ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white hover:scale-105 hover:shadow-lg'
                  }`
                }
                end
              >
                <FaUsers className="mr-3 text-lg" />
                <span className="font-medium">User Management</span>
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* Footer */}
        <div className="mt-auto pt-6 border-t border-gray-700">
          <p className="text-sm text-gray-400 text-center">
            © 2025 Restaurant Platform
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;