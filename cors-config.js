// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // List of allowed origins
    const allowedOrigins = [
      // Local development
      "http://localhost:5173",
      "http://localhost:3000",
      // Add your production frontend URL here
      process.env.PRODUCTION_CLIENT_URL ||
        "https://your-production-frontend-url.com",
      // Add any other domains that should access your API
    ];

    // Check if the request has no origin (like mobile apps or curl requests)
    // or if the origin is in our allowed list
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true, // Allow cookies and authentication headers
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  maxAge: 86400, // Cache preflight requests for 24 hours
};

module.exports = corsOptions;
