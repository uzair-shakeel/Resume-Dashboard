import { api } from "./api";

// Get all CVs with pagination and filtering
export const getAllCVs = async (
  page = 1,
  limit = 20,
  userId = null,
  template = null,
  search = null,
  sortBy = "createdAt",
  sortOrder = "desc"
) => {
  const params = new URLSearchParams();
  params.append("page", page);
  params.append("limit", limit);
  if (userId) params.append("userId", userId);
  if (template) params.append("template", template);
  if (search) params.append("search", search);
  params.append("sortBy", sortBy);
  params.append("sortOrder", sortOrder);

  const response = await api.get(`/cvs?${params.toString()}`);
  return response.data;
};
