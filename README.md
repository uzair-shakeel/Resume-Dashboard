# Resume Dashboard

A modern dashboard application for managing and visualizing data from the Resume-Builder application.

## Prerequisites

- Node.js (version 14 or higher)
- Resume-Builder API running on http://localhost:3000

## Getting Started

### Installing and Running the Resume-Builder API

Before running the dashboard, you need to set up and start the Resume-Builder API:

1. Navigate to the Resume-Builder directory:

```bash
cd ../Resume-Builder
```

2. Install dependencies:

```bash
npm install
```

3. Seed the database with initial users:

```bash
npm run seed
```

4. Start the API server:

```bash
npm run dev
```

The API will be available at http://localhost:3000.

### Installing and Running the Dashboard

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

The dashboard will be available at http://localhost:5173 (or another port if 5173 is in use).

## Authentication

### Login Credentials

After running the seed script, the following users will be created:

**Admin User:**

- Email: admin@resumebuilder.com
- Password: admin123

**Regular User:**

- Email: user@resumebuilder.com
- Password: user123

## API Integration

This dashboard is integrated with the Resume-Builder API. To ensure proper functionality:

1. Make sure the Resume-Builder application is running on http://localhost:3000
2. The API configuration is set up in `/src/services/api.js`
3. All API requests are proxied through the Vite development server as configured in `vite.config.js`

## Features

- User Management: Create, update, delete users and manage their roles/permissions
- CV Analytics: Track CV creation, downloads, and template usage
- Cover Letter Analytics: Monitor cover letter creation, downloads, and template usage
- Revenue Analytics: View revenue data, payment history, and conversion metrics

## Architecture

The dashboard follows a modular architecture with:

- `/src/services`: API integration services
- `/src/pages`: Main page components
- `/src/components`: Reusable UI components
- `/src/context`: Global state management
- `/src/utils`: Utility functions

## API Services

The following services handle API integration:

- `authService.js`: Authentication operations
- `userService.js`: User management operations
- `cvService.js`: CV-related operations
- `coverLetterService.js`: Cover letter operations
- `analyticsService.js`: Analytics data retrieval
- `paymentService.js`: Payment operations

## Troubleshooting

If you encounter issues with API connectivity:

1. Check that the Resume-Builder API is running at http://localhost:3000
2. Verify that the API endpoints match the expected format
3. Check browser console for specific error messages
4. Ensure CORS is properly configured on the Resume-Builder API

## License

[MIT](LICENSE)
