import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { isAuthenticated } from "./services/authService";

import Sidebar from "./components/shared/Sidebar";
import { MockModeProvider } from "./context/MockModeContext";
import AdminRoute from "./components/AdminRoute";

import Dashboard from "./pages/Dashboard";
import CVs from "./pages/CVs";
import CoverLetters from "./pages/CoverLetters";
import Users from "./pages/Users";
import Revenue from "./pages/Revenue";
import LoginPage from "./pages/LoginPage";

function App() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Small delay to prevent flash of content during authentication check
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Determine if we're on the login page
  const isLoginPage = location.pathname === "/login";

  // If user is logged in and tries to access login page, redirect to dashboard
  if (!loading && isLoginPage && isAuthenticated()) {
    return <Navigate to="/" />;
  }

  // If it's the login page, render only the LoginPage component
  if (isLoginPage) {
    return <LoginPage />;
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="text-slate-200 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <MockModeProvider>
      <div className="flex h-screen bg-slate-950 text-slate-200">
        {/* Background with blur */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-80" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex w-full h-full">
          <Sidebar />
          <main className="flex-1 relative overflow-auto">
            <Routes>
              <Route
                path="/"
                element={
                  <AdminRoute>
                    <Dashboard />
                  </AdminRoute>
                }
              />
              <Route
                path="/cvs"
                element={
                  <AdminRoute>
                    <CVs />
                  </AdminRoute>
                }
              />
              <Route
                path="/cover-letters"
                element={
                  <AdminRoute>
                    <CoverLetters />
                  </AdminRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <AdminRoute>
                    <Users />
                  </AdminRoute>
                }
              />
              <Route
                path="/revenue"
                element={
                  <AdminRoute>
                    <Revenue />
                  </AdminRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </MockModeProvider>
  );
}

export default App;
