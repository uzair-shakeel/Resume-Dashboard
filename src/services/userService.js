import { api } from "./api";

// Get all users
export const getAllUsers = async (
  page = 1,
  limit = 20,
  role = null,
  status = null,
  search = null
) => {
  const params = new URLSearchParams();
  params.append("page", page);
  params.append("limit", limit);
  if (role) params.append("role", role);
  if (status) params.append("status", status);
  if (search) params.append("search", search);

  const response = await api.get(`/users?${params.toString()}`);
  return response.data;
};

// Get user by ID
export const getUserById = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

// Create new user
export const createUser = async (userData) => {
  const response = await api.post("/users", userData);
  return response.data;
};

// Update user
export const updateUser = async (id, userData) => {
  const response = await api.put(`/users/${id}`, userData);
  return response.data;
};

// Delete user
export const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

// Change user role
export const changeUserRole = async (id, role) => {
  const response = await api.patch(`/users/${id}/role`, { role });
  return response.data;
};

// Update user status
export const updateUserStatus = async (id, status) => {
  const response = await api.patch(`/users/${id}/status`, { status });
  return response.data;
};

// Reset user password
export const resetUserPassword = async (id) => {
  const response = await api.post(`/users/${id}/reset-password`);
  return response.data;
};
