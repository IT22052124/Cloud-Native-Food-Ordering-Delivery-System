import { useState, useContext } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";

// Icons (simplified with text but in real implementation, use svg icons)
const Icons = {
  Dashboard: "Chart Bar",
  Notifications: "Bell",
  Restaurants: "Store",
  Drivers: "Truck",
  Finance: "Currency Dollar",
  Reports: "Document Report",
  Settings: "Cog",
  Logout: "Logout",
  Sun: "Sun",
  Moon: "Moon",
  Menu: "Menu",
  Close: "X",
  User: "User",
};

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [notificationCount, setNotificationCount] = useState(5); // Dummy notification count
  const navigate = useNavigate();

  const navigation = [
    { name: "Dashboard", href: "/", icon: Icons.Dashboard },
    {
      name: "Notifications",
      href: "/notifications",
      icon: Icons.Notifications,
      count: notificationCount,
    },
    { name: "Restaurants", href: "/restaurants", icon: Icons.Restaurants },
    { name: "Drivers", href: "/drivers", icon: Icons.Drivers },
    { name: "Finance", href: "/finance", icon: Icons.Finance },
    { name: "Reports", href: "/reports", icon: Icons.Reports },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar for mobile */}
      <div
        className={`fixed inset-0 z-20 transition-opacity ${
          sidebarOpen
            ? "opacity-100 ease-out duration-300"
            : "opacity-0 ease-in duration-200 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-gray-600 opacity-75"
          onClick={() => setSidebarOpen(false)}
        ></div>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 transition duration-300 transform bg-white dark:bg-gray-800 overflow-y-auto lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? "translate-x-0 ease-out" : "-translate-x-full ease-in"
        }`}
      >
        <div className="flex items-center justify-center mt-8">
          <div className="flex items-center">
            <span className="text-2xl font-semibold text-gray-800 dark:text-white">
              Deliver
            </span>
            <span className="text-2xl font-bold text-blue-500">Admin</span>
          </div>
        </div>

        <nav className="mt-10">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center px-6 py-3 mt-1 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-white transition-colors duration-200 ${
                  isActive
                    ? "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white border-r-4 border-blue-500"
                    : ""
                }`
              }
            >
              <span className="mx-3">{item.icon}</span>
              <span className="mx-2">{item.name}</span>
              {item.count && (
                <span className="ml-auto bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                  {item.count}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full">
          <button
            onClick={toggleTheme}
            className="flex items-center px-6 py-3 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-white transition-colors duration-200 w-full"
          >
            <span className="mx-3">
              {theme === "dark" ? Icons.Sun : Icons.Moon}
            </span>
            <span className="mx-2">
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center px-6 py-3 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-white transition-colors duration-200 w-full"
          >
            <span className="mx-3">{Icons.Logout}</span>
            <span className="mx-2">Logout</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="py-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-gray-500 dark:text-gray-300 lg:hidden focus:outline-none"
              >
                <span>{Icons.Menu}</span>
              </button>

              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate("/notifications")}
                  className="relative text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors duration-200"
                >
                  <span>{Icons.Notifications}</span>
                  {notificationCount > 0 && (
                    <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-xs font-semibold w-4 h-4 flex items-center justify-center rounded-full">
                      {notificationCount}
                    </span>
                  )}
                </button>

                <div className="flex items-center">
                  <span className="text-gray-800 dark:text-white mr-2">
                    {user?.name}
                  </span>
                  <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                    <span>{Icons.User}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
