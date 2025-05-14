import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import { checkApiHealth } from "../services/api";
import { motion } from "framer-motion";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState("checking"); // "checking", "online", "offline"
  const navigate = useNavigate();

  // Check if API is online
  useEffect(() => {
    const checkStatus = async () => {
      try {
        setApiStatus("checking");
        const isOnline = await checkApiHealth();
        setApiStatus(isOnline ? "online" : "offline");
        console.log("API Status:", isOnline ? "online" : "offline");
      } catch (error) {
        console.error("API health check error:", error);
        setApiStatus("offline");
      }
    };

    checkStatus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    try {
      setLoading(true);
      setError("");
      console.log(`Attempting admin login with email: ${email}`);

      const data = await login(email, password);
      console.log("Login successful:", data);

      // Verify the user is an admin
      if (data.user.role !== "admin") {
        setError("Access denied. Admin privileges required.");
        return false;
      }

      navigate("/");
    } catch (err) {
      console.error("Login failed:", err);

      if (apiStatus === "offline") {
        setError(
          "API is offline. Please check if the Resume-Builder API is running."
        );
      } else {
        setError(
          err.message || "Authentication failed. Please check your credentials."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      {/* Background with blur */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-80" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-slate-900 p-8 rounded-lg shadow-lg border border-slate-700 w-full max-w-md z-10"
      >
        <div className="flex justify-center mb-6">
          <div className="bg-indigo-600 rounded-full p-3">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-slate-200 mb-6 text-center">
          Resume Dashboard Admin Login
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-rose-900/50 border border-rose-700 text-rose-200 text-sm rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-300 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-300 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md shadow focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 disabled:opacity-50 transition-colors"
          >
            {loading ? "Logging In..." : "Login"}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-700">
          <p className="text-center text-sm text-slate-400">
            This dashboard is for Resume-Builder administrators only.
            <br />
            Regular users should login through the main application.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
