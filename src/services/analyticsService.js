import { api } from "./api";

// Get CV analytics
export const getCVAnalytics = async () => {
  const response = await api.get("/analytics/cvs");
  return response.data;
};

// Get Cover Letter analytics
export const getCoverLetterAnalytics = async () => {
  const response = await api.get("/analytics/coverletters");
  return response.data;
};

// Get Revenue analytics
export const getRevenueAnalytics = async () => {
  const response = await api.get("/analytics/revenue");
  return response.data;
};

// Get Detailed Revenue analytics
export const getDetailedRevenueAnalytics = async () => {
  const response = await api.get("/analytics/revenue/details");
  return response.data;
};

// Get Revenue Dashboard Data
export const getRevenueDashboardData = async () => {
  const response = await api.get("/analytics/revenue/dashboard");
  return response.data;
};

// Get Analytics Totals
export const getAnalyticsTotals = async () => {
  const response = await api.get("/analytics/totals");
  return response.data;
};

// Get User Analytics
export const getUserAnalytics = async () => {
  const response = await api.get("/analytics/users");
  return response.data;
};
