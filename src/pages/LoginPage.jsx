import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import { checkApiHealth } from "../services/api";
import { motion } from "framer-motion";

const LoginPage = () => {
  // Pre-fill with admin credentials for easy testing
  const [email, setEmail] = useState("admin@resumebuilder.com");
  const [password, setPassword] = useState("admin123");
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

  const performLogin = async (loginEmail, loginPassword) => {
    try {
      setLoading(true);
      setError("");
      console.log(`Attempting login with email: ${loginEmail}`);
      
      const data = await login(loginEmail, loginPassword);
      console.log("Login successful:", data);
      navigate("/");
      return true;
    } catch (err) {
      console.error("Login failed:", err);
      
      if (apiStatus === "offline") {
        setError("API is offline. Please try using the one-click login buttons below.");
      } else {
        setError(err.message || "Authentication failed. Please check your credentials.");
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }
    
    await performLogin(email, password);
  };

  const handleOneClickLogin = async (type) => {
    setLoading(true);
    setError("");
    
    try {
      if (type === "admin") {
        // Just use the direct login function with hardcoded values
        // to avoid state update timing issues
        await login("admin@resumebuilder.com", "admin123");
        console.log("Admin login successful");
        navigate("/");
      } else {
        await login("user@resumebuilder.com", "user123");
        console.log("User login successful");
        navigate("/");
      }
    } catch (err) {
      console.error("One-click login failed:", err);
      setError("One-click login failed. Please try again.");
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
          Resume Builder Login
        </h2>

        {apiStatus === "offline" && (
          <div className="mb-4 p-3 bg-amber-900/50 border border-amber-700 text-amber-200 text-sm rounded-md">
            <p className="font-medium mb-1">
              The Resume-Builder API appears to be offline.
            </p>
            <p>
              You can still log in with demo credentials. Click the
              buttons under "Demo Credentials" section.
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-rose-900/50 border border-rose-700 text-rose-200 text-sm rounded-md">
            {error}
          </div>
        )}
        
        <div className="mb-6 p-4 bg-slate-800 rounded-lg border border-slate-700">
          <h3 className="text-lg font-semibold text-slate-200 mb-4">
            Quick Login
          </h3>
          
          <div className="flex flex-col gap-3">
            <button
              onClick={() => handleOneClickLogin("admin")}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-md font-semibold transition-colors flex items-center justify-center"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                <span>Login as Admin</span>
              )}
            </button>
            
            <button
              onClick={() => handleOneClickLogin("user")}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-md font-semibold transition-colors"
            >
              Login as Regular User
            </button>
          </div>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-900 px-2 text-slate-400">Or Login Manually</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-slate-800 text-slate-200 rounded-md border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-slate-800 text-slate-200 rounded-md border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-700 text-white p-3 rounded-md hover:bg-slate-600 transition-colors font-semibold flex items-center justify-center mt-6"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-800/30 rounded-md">
          <h3 className="text-sm font-semibold text-blue-300 mb-2">
            Credentials & Info:
          </h3>
          <ul className="text-xs text-slate-300 space-y-1">
            <li>• Admin: <span className="text-blue-300">admin@resumebuilder.com / admin123</span></li>
            <li>• User: <span className="text-blue-300">user@resumebuilder.com / user123</span></li>
            <li>• API Status: 
              {apiStatus === "checking" ? (
                <span className="text-amber-300 ml-1">Checking...</span>
              ) : apiStatus === "online" ? (
                <span className="text-green-300 ml-1">Online ✅</span>
              ) : (
                <span className="text-rose-300 ml-1">Offline ❌</span>
              )}
            </li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
