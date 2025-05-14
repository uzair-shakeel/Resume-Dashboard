import { api } from "./api";

/**
 * Login user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} - User data and token
 */
export const login = async (email, password) => {
  try {
    console.log("Attempting admin dashboard login for:", email);
    // Use the admin-specific login endpoint
    const response = await api.post("/auth/dashboard-login", {
      email,
      password,
    });

    // Store token and user data in localStorage
    if (response.data && response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      return response.data;
    } else {
      throw new Error("Invalid response from server - missing token");
    }
  } catch (error) {
    console.error("Admin login error:", error);

    // Provide informative error message
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Authentication failed. Please check your credentials.";

    throw new Error(errorMessage);
  }
};

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} - New user data
 */
export const register = async (userData) => {
  try {
    const response = await api.post("/auth/register", userData);
    return response.data;
  } catch (error) {
    console.error("Registration error:", error);
    throw new Error(error.response?.data?.message || "Registration failed");
  }
};

/**
 * Logout user
 */
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

/**
 * Check if user is logged in
 * @returns {boolean} - True if user is logged in
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

/**
 * Get current user data
 * @returns {Object|null} - User data or null if not logged in
 */
export const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

/**
 * Check if current user is admin
 * @returns {boolean} - True if user is admin
 */
export const isAdmin = () => {
  const user = getCurrentUser();
  return user?.role === "admin";
};

/**
 * Update the API authentication token when needed
 */
export const setupAuthInterceptor = () => {
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Handle 401 responses
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        // Auto logout if 401 response returned from api
        logout();
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );
};
