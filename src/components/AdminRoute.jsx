import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated, isAdmin } from "../services/authService";

/**
 * AdminRoute component to protect routes that require admin access
 * @param {object} props - Component properties
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @returns {React.ReactNode} - The protected route or redirect to login
 */
const AdminRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check if the user is authenticated and is an admin
    const checkAuth = () => {
      const isAuth = isAuthenticated();
      const adminStatus = isAdmin();

      setAuthorized(isAuth && adminStatus);
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Show a loading state while checking authorization
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-slate-200">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // If not authorized, redirect to login
  if (!authorized) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authorized, render the children
  return children;
};

export default AdminRoute;
