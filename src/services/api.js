import axios from "axios";

// Create API instance
export const api = axios.create({
  baseURL:
    process.env.NODE_ENV === "development"
      ? "/api" // Use the local proxy defined in vite.config.js
      : "https://qt6hfks5dj.execute-api.eu-central-1.amazonaws.com/development",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error("API Error:", error.response.data);
      console.error("Status:", error.response.status);
    } else if (error.request) {
      // Request made but no response received
      console.error("Network Error:", error.request);

      // If this is a CORS error in development, provide a more helpful message
      if (process.env.NODE_ENV === "development") {
        console.error(
          "Network error occurred. This might be due to CORS or connectivity issues."
        );
        console.error("Check your Vite proxy configuration in vite.config.js");
      }
    } else {
      // Error in request setup
      console.error("Request Error:", error.message);
    }
    return Promise.reject(error);
  }
);
