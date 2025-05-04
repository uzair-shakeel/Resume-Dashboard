import { api } from "./api";

// Demo credentials for offline development/testing
const DEMO_CREDENTIALS = {
  admin: {
    email: "admin@resumebuilder.com",
    password: "admin123",
    data: {
      _id: "demo-admin-id",
      id: "demo-admin-id",
      email: "admin@resumebuilder.com",
      name: "Admin User",
      role: "admin",
      status: "active",
    },
  },
  user: {
    email: "user@resumebuilder.com",
    password: "user123",
    data: {
      _id: "demo-user-id",
      id: "demo-user-id",
      email: "user@resumebuilder.com",
      name: "Regular User",
      role: "user",
      status: "active",
    },
  },
};

/**
 * Login user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} - User data and token
 */
export const login = async (email, password) => {
  // Check for admin demo credentials
  if (
    email === DEMO_CREDENTIALS.admin.email &&
    password === DEMO_CREDENTIALS.admin.password
  ) {
    console.log("Using demo admin credentials");
    const token = "demo-token-for-development";
    const userData = DEMO_CREDENTIALS.admin.data;

    // Store in localStorage
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));

    return { user: userData, token };
  }

  // Check for user demo credentials
  if (
    email === DEMO_CREDENTIALS.user.email &&
    password === DEMO_CREDENTIALS.user.password
  ) {
    console.log("Using demo user credentials");
    const token = "demo-token-for-development";
    const userData = DEMO_CREDENTIALS.user.data;

    // Store in localStorage
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));

    return { user: userData, token };
  }

  // If not using demo credentials, try to authenticate with the API
  try {
    console.log("Attempting API login for:", email);
    const response = await api.post("/auth/signin", { email, password });

    // Store token and user data in localStorage
    if (response.data && response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      return response.data;
    } else {
      throw new Error("Invalid response from server - missing token");
    }
  } catch (error) {
    console.error("API Login error:", error);

    // If API call fails but credentials match demo credentials, use those as fallback
    if (
      email === DEMO_CREDENTIALS.admin.email &&
      password === DEMO_CREDENTIALS.admin.password
    ) {
      console.log("API call failed, falling back to demo admin");
      const token = "demo-token-for-development";
      const userData = DEMO_CREDENTIALS.admin.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));

      return { user: userData, token };
    }

    if (
      email === DEMO_CREDENTIALS.user.email &&
      password === DEMO_CREDENTIALS.user.password
    ) {
      console.log("API call failed, falling back to demo user");
      const token = "demo-token-for-development";
      const userData = DEMO_CREDENTIALS.user.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));

      return { user: userData, token };
    }

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
 * Log out the current user
 */
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

/**
 * Get the current authenticated user
 * @returns {Object|null} - User data or null if not authenticated
 */
export const getCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch (e) {
    console.error("Error parsing user data:", e);
    return null;
  }
};

/**
 * Check if the current user is authenticated
 * @returns {boolean} - True if authenticated
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

/**
 * Check if the current user has admin role
 * @returns {boolean} - True if user is admin
 */
export const isAdmin = () => {
  const user = getCurrentUser();
  return user && user.role === "admin";
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
