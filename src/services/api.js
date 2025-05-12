import axios from "axios";

// Determine if we're in development mode
const isDevelopment =
  import.meta.env.DEV || window.location.hostname === "localhost";

// Create axios instance with base URL and timeout
const api = axios.create({
  baseURL: "https://resume-builderrr.vercel.app/api", // Use proxy in dev, full URL in prod
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for cookies/sessions
});

// Add a specific health check endpoint for the login page to use
export const checkApiHealth = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(
      isDevelopment
        ? "/api/health"
        : "https://resume-builderrr.vercel.app/api/health",
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.error("API Health check failed:", error);
    return false;
  }
};

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    // Log requests in development
    if (isDevelopment) {
      console.log(
        `🚀 API Request: ${config.method.toUpperCase()} ${config.baseURL}${
          config.url
        }`
      );
    }

    // Add token to request if available
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (isDevelopment) {
      console.log(
        `✅ API Response [${
          response.status
        }]: ${response.config.method.toUpperCase()} ${response.config.url}`
      );
    }
    return response;
  },
  (error) => {
    // Create a more detailed error message
    let errorMsg = "An error occurred with the API request";

    if (error.response) {
      // Server responded with an error status (4xx, 5xx)
      const status = error.response.status;
      const data = error.response.data;

      errorMsg = `Server error ${status}: ${
        data.message || JSON.stringify(data)
      }`;
      console.error(`🔴 API Error [${status}]:`, data);

      // Handle authentication errors
      if (status === 401 || status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // Consider redirecting to login page
        errorMsg = "Authentication failed. Please log in again.";
      }
    } else if (error.request) {
      // Request was made but no response received (network error)
      console.error("🔴 Network Error: No response received", error.request);
      errorMsg = "Network error: Could not connect to the API server";
    } else {
      // Error in setting up the request
      console.error("🔴 Request Setup Error:", error.message);
      errorMsg = `Request error: ${error.message}`;
    }

    // Add custom error message to the error object
    error.customMessage = errorMsg;

    return Promise.reject(error);
  }
);

export { api };
