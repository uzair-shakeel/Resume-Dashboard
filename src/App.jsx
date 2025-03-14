import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

import Sidebar from "./components/shared/Sidebar";
import { MockModeProvider } from "./context/MockModeContext";

import Dashboard from "./pages/Dashboard";
import CVs from "./pages/CVs";
import CoverLetters from "./pages/CoverLetters";
import Users from "./pages/Users";
import Revenue from "./pages/Revenue";
import LoginPage from "./pages/LoginPage";

// Set up axios defaults
axios.defaults.withCredentials = true;

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  // If user is logged in and tries to access login page, redirect to dashboard
  if (isLoginPage && localStorage.getItem("token")) {
    return <Navigate to="/" />;
  }

  // If it's the login page, render only the LoginPage component
  if (isLoginPage) {
    return <LoginPage />;
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
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cvs"
                element={
                  <ProtectedRoute>
                    <CVs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cover-letters"
                element={
                  <ProtectedRoute>
                    <CoverLetters />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <ProtectedRoute adminOnly>
                    <Users />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/revenue"
                element={
                  <ProtectedRoute adminOnly>
                    <Revenue />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </div>
    </MockModeProvider>
  );
}

export default App;
