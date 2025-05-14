// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // For development or testing, you can allow all origins
    const isProduction = process.env.NODE_ENV === 'production';
    
    // In production, use a whitelist approach
    if (isProduction) {
      // List of allowed origins
      const allowedOrigins = [
        // Add your production frontend URLs here
        process.env.PRODUCTION_CLIENT_URL || 'https://your-production-frontend-url.com',
        // You can add multiple production URLs if needed
        'https://your-app.vercel.app',
        'https://your-app.netlify.app'
      ].filter(Boolean); // Remove any falsy values
      
      // Check if the request has no origin (like mobile apps or curl requests)
      // or if the origin is in our allowed list
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked request from origin: ${origin}`);
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    } else {
      // In development, allow all origins
      callback(null, true);
    }
  },
  credentials: true, // Allow cookies and authentication headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  maxAge: 86400 // Cache preflight requests for 24 hours
};

module.exports = corsOptions;
