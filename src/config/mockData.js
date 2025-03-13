// Mock data for Resume Builder Dashboard
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const mockData = {
  months, // Include months in mockData
  dashboardStats: {
    totalCVs: 1250,
    totalCoverLetters: 850,
    totalUsers: 2500,
    totalRevenue: 45750,
    monthlyGrowth: 15.5,
    activeUsers: 1800,
  },
  cvStats: {
    conversionRate: 68.5,
    createdPerMonth: [
      120, 150, 180, 210, 240, 270, 300, 330, 360, 390, 420, 450,
    ],
    downloadedPerMonth: [
      80, 100, 130, 150, 170, 190, 210, 230, 250, 270, 290, 310,
    ],
    popularTemplates: [
      { name: "Professional", usage: 450 },
      { name: "Modern", usage: 380 },
      { name: "Creative", usage: 320 },
      { name: "Simple", usage: 280 },
      { name: "Executive", usage: 250 },
    ],
  },
  coverLetterStats: {
    conversionRate: 72.3,
    createdPerMonth: [
      90, 110, 130, 150, 170, 190, 210, 230, 250, 270, 290, 310,
    ],
    downloadedPerMonth: [
      65, 80, 95, 110, 125, 140, 155, 170, 185, 200, 215, 230,
    ],
    popularTemplates: [
      { name: "Standard", usage: 380 },
      { name: "Professional", usage: 320 },
      { name: "Modern", usage: 280 },
      { name: "Basic", usage: 240 },
      { name: "Creative", usage: 200 },
    ],
  },
  userStats: {
    totalUsers: 15000,
    activeUsers: 12500,
    monthlyActiveUsers: [
      8000, 8500, 9000, 9500, 10000, 10500, 11000, 11500, 12000, 12500, 13000,
      13500,
    ],
    userTypes: [
      { type: "Free", count: 8000 },
      { type: "Basic", count: 4000 },
      { type: "Pro", count: 2500 },
      { type: "Enterprise", count: 500 },
    ],
    userGrowth: [500, 550, 600, 650, 700, 750, 800, 850, 900, 950, 1000, 1050],
  },
  revenueStats: {
    totalRevenue: 125000,
    monthlyRevenue: [
      8000, 9500, 10200, 11000, 11800, 12500, 13200, 14000, 14800, 15500, 16200,
      17000,
    ],
    subscriptionTypes: [
      { name: "Basic", revenue: 45000 },
      { name: "Pro", revenue: 65000 },
      { name: "Enterprise", revenue: 15000 },
    ],
    revenueBySource: [
      { source: "Subscriptions", amount: 95000 },
      { source: "One-time Purchases", amount: 20000 },
      { source: "Template Sales", amount: 10000 },
    ],
  },
};
