import { api } from "./api";

// Get all payments with pagination and filtering
export const getAllPayments = async (
  page = 1,
  limit = 20,
  userId = null,
  status = null,
  source = null,
  startDate = null,
  endDate = null
) => {
  const params = new URLSearchParams();
  params.append("page", page);
  params.append("limit", limit);
  if (userId) params.append("userId", userId);
  if (status) params.append("status", status);
  if (source) params.append("source", source);
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  const response = await api.get(`/payments?${params.toString()}`);
  return response.data;
};

// Create a new payment
export const createPayment = async (paymentData) => {
  const response = await api.post("/payments", paymentData);
  return response.data;
};
