import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="w-64 h-screen bg-gray-900 dark:bg-dark-sidebar text-white dark:dark-text fixed">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-8">Owner Dashboard</h1>
        <nav>
          <ul className="space-y-4">
            <li>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `block p-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-accent text-white'
                      : 'hover:bg-gray-700 dark:hover:bg-gray-600 hover:scale-105'
                  }`
                }
              >
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/restaurants/add"
                className={({ isActive }) =>
                  `block p-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-accent text-white'
                      : 'hover:bg-gray-700 dark:hover:bg-gray-600 hover:scale-105'
                  }`
                }
              >
                Add Restaurant
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/users"
                className={({ isActive }) =>
                  `block p-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-accent text-white'
                      : 'hover:bg-gray-700 dark:hover:bg-gray-600 hover:scale-105'
                  }`
                }
              >
                User Management
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;