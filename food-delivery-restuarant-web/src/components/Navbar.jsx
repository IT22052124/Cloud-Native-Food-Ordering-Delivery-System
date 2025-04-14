import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { FaUser, FaSignOutAlt, FaMoon, FaSun, FaUtensils, FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg text-white dark:from-gray-800 dark:to-gray-900 dark:text-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <Link to="/" className="flex items-center space-x-2 text-xl font-bold">
            <FaUtensils className="text-white dark:text-orange-300" />
            <span className="hidden sm:inline">Food Delivery Admin</span>
            <span className="sm:hidden">FD Admin</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex items-center space-x-1 bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-full transition duration-200 dark:bg-gray-700 dark:hover:bg-gray-600"
              aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? (
                <>
                  <FaMoon className="text-white" />
                  <span className="text-sm">Dark</span>
                </>
              ) : (
                <>
                  <FaSun className="text-yellow-300" />
                  <span className="text-sm">Light</span>
                </>
              )}
            </button>

            {/* User Info & Actions */}
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full">
                  <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center">
                    <FaUser className="text-white" />
                  </div>
                  <span className="text-sm font-medium truncate max-w-[150px]">
                    {user.email || user.username}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition duration-200 dark:bg-red-700 dark:hover:bg-red-800"
                >
                  <FaSignOutAlt />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-1 bg-white text-orange-600 hover:bg-gray-100 px-4 py-2 rounded-lg transition duration-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
              >
                <FaUser />
                <span>Login</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-white focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <FaTimes className="h-6 w-6" />
              ) : (
                <FaBars className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20 dark:border-gray-700">
            <div className="flex flex-col space-y-3">
              {user ? (
                <>
                  <div className="flex items-center space-x-2 py-2">
                    <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center">
                      <FaUser className="text-white" />
                    </div>
                    <span className="text-sm font-medium truncate">
                      {user.email || user.username}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition duration-200 dark:bg-red-700 dark:hover:bg-red-800"
                  >
                    <FaSignOutAlt />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center space-x-2 bg-white text-orange-600 hover:bg-gray-100 px-4 py-2 rounded-lg transition duration-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                >
                  <FaUser />
                  <span>Login</span>
                </Link>
              )}
              <button
                onClick={toggleTheme}
                className="flex items-center justify-center space-x-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition duration-200 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                {theme === 'light' ? (
                  <>
                    <FaMoon className="mr-2" />
                    <span>Dark Mode</span>
                  </>
                ) : (
                  <>
                    <FaSun className="mr-2 text-yellow-300" />
                    <span>Light Mode</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;