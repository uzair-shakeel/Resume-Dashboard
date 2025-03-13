import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaFileAlt,
  FaEnvelope,
  FaUsers,
  FaDollarSign,
  FaSignOutAlt,
} from "react-icons/fa";

const Sidebar = () => {
  const location = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: FaHome },
    { name: "CVs", href: "/cvs", icon: FaFileAlt },
    { name: "Cover Letters", href: "/cover-letters", icon: FaEnvelope },
    { name: "Users", href: "/users", icon: FaUsers },
    { name: "Revenue", href: "/revenue", icon: FaDollarSign },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className="flex flex-col w-64 bg-gray-800">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 bg-gray-900">
        <span className="text-xl font-bold text-white">Resume Builder</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                location.pathname === item.href
                  ? "bg-gray-900 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white transition-colors"
        >
          <FaSignOutAlt className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
