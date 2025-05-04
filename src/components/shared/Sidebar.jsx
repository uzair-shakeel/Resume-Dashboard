import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  Mail,
  Users,
  DollarSign,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { logout, getCurrentUser } from "../../services/authService";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get current user from auth service
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isAdmin = user && user.role === "admin";

  // Define navigation items
  const navItems = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      path: "/",
      adminOnly: false,
    },
    {
      name: "CVs",
      icon: <FileText className="w-5 h-5" />,
      path: "/cvs",
      adminOnly: false,
    },
    {
      name: "Cover Letters",
      icon: <Mail className="w-5 h-5" />,
      path: "/cover-letters",
      adminOnly: false,
    },
    {
      name: "Users",
      icon: <Users className="w-5 h-5" />,
      path: "/users",
      adminOnly: true,
    },
    {
      name: "Revenue",
      icon: <DollarSign className="w-5 h-5" />,
      path: "/revenue",
      adminOnly: true,
    },
  ];

  // Filter items based on user role
  const filteredNavItems = navItems.filter(
    (item) => !item.adminOnly || isAdmin
  );

  return (
    <div
      className={`h-full bg-slate-900 border-r border-slate-800 p-4 transition-all duration-300 ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Link to="/">
            <div className="flex items-center justify-center h-12">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M7 18H17V16H7V18Z" fill="rgba(99, 102, 241, 1)" />
                <path d="M17 14H7V12H17V14Z" fill="rgba(99, 102, 241, 0.8)" />
                <path d="M7 10H17V8H7V10Z" fill="rgba(99, 102, 241, 0.6)" />
                <path d="M7 6H17V4H7V6Z" fill="rgba(99, 102, 241, 0.4)" />
                <path
                  d="M5 2H19C20.1046 2 21 2.89543 21 4V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V4C3 2.89543 3.89543 2 5 2ZM5 4V20H19V4H5Z"
                  fill="white"
                />
              </svg>
              {isOpen && (
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="ml-3 text-xl font-bold text-slate-200"
                >
                  Resume
                </motion.span>
              )}
            </div>
          </Link>
        </div>

        {/* User info */}
        {user && (
          <div className="mb-6 flex items-center p-2 rounded-lg bg-slate-800/50">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-600 text-white">
              <UserIcon className="w-5 h-5" />
            </div>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="ml-3"
              >
                <div className="text-sm font-medium text-slate-200">
                  {user.name}
                </div>
                <div className="text-xs text-slate-400">{user.role}</div>
              </motion.div>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1">
          <ul className="space-y-2">
            {filteredNavItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center p-3 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? "bg-indigo-600 text-white"
                      : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  {item.icon}
                  {isOpen && (
                    <motion.span
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="ml-3"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Toggle and Logout */}
        <div className="mt-auto pt-4 border-t border-slate-800">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center p-3 w-full rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={
                  isOpen
                    ? "M11 19l-7-7 7-7m8 14l-7-7 7-7"
                    : "M13 5l7 7-7 7M5 5l7 7-7 7"
                }
              ></path>
            </svg>
            {isOpen && (
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="ml-3"
              >
                {isOpen ? "Collapse" : "Expand"}
              </motion.span>
            )}
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center p-3 w-full rounded-lg text-slate-300 hover:bg-slate-800 transition-colors mt-2"
          >
            <LogOut className="w-5 h-5" />
            {isOpen && (
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="ml-3"
              >
                Logout
              </motion.span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
