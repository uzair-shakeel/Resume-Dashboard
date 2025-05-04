import React, { useState, useEffect } from "react";
import { Users as UsersIcon, Plus, Edit2, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import * as userService from "../services/userService";
import { toast } from "react-toastify";

const ROLES = {
  ADMIN: "admin",
  USER: "user",
};

const STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  SUSPENDED: "suspended",
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: ROLES.USER,
    status: STATUS.ACTIVE,
    password: "",
  });
  const [availableRoles, setAvailableRoles] = useState([
    { value: "admin", label: "Admin" },
    { value: "user", label: "User" },
  ]);

  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem("user")) || {
    role: "user",
  };
  const isAdmin = true; // Enable for all users as per requirements

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      if (data && data.users) {
        setUsers(data.users);
        console.log("User data successfully loaded:", data);

        // Extract unique roles from the user data
        const roleSet = new Set();
        data.users.forEach((user) => {
          if (user.role) roleSet.add(user.role);
        });

        // Add default roles if they don't exist
        roleSet.add("admin");
        roleSet.add("user");

        // Convert to the format needed for the dropdown
        const roleArray = Array.from(roleSet).map((role) => ({
          value: role,
          label: role.charAt(0).toUpperCase() + role.slice(1),
        }));

        setAvailableRoles(roleArray);
      } else {
        console.error("Invalid response format:", data);
        toast.error("Received invalid data format from the server");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error(error.response?.data?.error || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);

      if (!editingUser) {
        // Create new user - admin will provide all details
        const userData = { ...formData };
        console.log("Creating new user:", userData);
        const response = await userService.createUser(userData);
        console.log("User created:", response);
        toast.success("User created successfully");
      } else {
        // Update existing user
        const response = await userService.updateUser(
          editingUser._id,
          formData
        );
        console.log("User updated:", response);
        toast.success("User updated successfully");
      }

      // Refresh the user list
      await fetchUsers();
      resetForm();
    } catch (error) {
      console.error("Error during operation:", error);
      toast.error(error.response?.data?.error || "Operation failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      setActionLoading(true);

      // Disable the UI during the API call
      const userIndex = users.findIndex((u) => u._id === userId);
      const updatedUsers = [...users];
      if (userIndex !== -1) {
        updatedUsers[userIndex] = { ...updatedUsers[userIndex], role: newRole };
        setUsers(updatedUsers);
      }

      console.log(`Changing role for user ${userId} to ${newRole}`);

      // Make the API call to update role
      const response = await userService.changeUserRole(userId, newRole);
      console.log("Role updated:", response);
      toast.success("User role updated successfully");

      // Refresh the full user list to ensure data consistency
      await fetchUsers();
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error(error.response?.data?.error || "Failed to update role");
      // Revert the UI change by refreshing
      await fetchUsers();
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (userId === currentUser._id) {
      toast.error("You cannot delete your own account");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      setActionLoading(true);
      console.log(`Deleting user ${userId}`);
      const response = await userService.deleteUser(userId);
      console.log("User deleted:", response);
      toast.success("User deleted successfully");
      await fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(error.response?.data?.error || "Failed to delete user");
    } finally {
      setActionLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      role: ROLES.USER,
      status: STATUS.ACTIVE,
      password: "",
    });
    setIsAddingUser(false);
    setEditingUser(null);
  };

  const initializeNewUser = () => {
    setFormData({
      name: "",
      email: "",
      role: ROLES.USER,
      status: STATUS.ACTIVE,
      password: "",
    });
    setEditingUser(null);
    setIsAddingUser(true);
  };

  if (loading) {
    return (
      <div className="flex-1 p-8 bg-slate-950 text-slate-200 flex items-center justify-center">
        <div className="text-xl">Loading users...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex-1 p-8 bg-slate-950 text-slate-200">
        <div className="text-center text-red-500">
          You don't have permission to access this page.
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 overflow-auto bg-slate-950 text-slate-200">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <UsersIcon className="w-8 h-8 mr-3 text-indigo-500" />
            <h1 className="text-3xl font-bold">User Management</h1>
          </div>
          <button
            onClick={initializeNewUser}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            disabled={actionLoading}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add User
          </button>
        </div>

        {/* User Form Modal */}
        {isAddingUser && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70">
          <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900 rounded-lg p-6 w-full max-w-2xl shadow-lg border border-slate-700"
            >
              <h2 className="text-xl font-semibold mb-4 text-slate-200">
              {editingUser ? "Edit User" : "Add New User"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1 text-slate-300">
                      Name
                    </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                      className="w-full bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 text-slate-300">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                      className="w-full bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                      placeholder="Enter email address"
                  />
                </div>
                {!editingUser && (
                  <div>
                      <label className="block text-sm font-medium mb-1 text-slate-300">
                      Password
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                        className="w-full bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required={!editingUser}
                        placeholder="Enter password"
                    />
                  </div>
                )}
                <div>
                    <label className="block text-sm font-medium mb-1 text-slate-300">
                      Role
                    </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                      className="w-full bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                      {availableRoles.map((role) => (
                        <option
                          key={role.value}
                          value={role.value}
                          className="bg-slate-800"
                        >
                          {role.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
                <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={resetForm}
                    className="px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-800 transition-colors"
                    disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processing...
                      </>
                    ) : editingUser ? (
                      "Update User"
                    ) : (
                      "Create User"
                    )}
                </button>
              </div>
            </form>
          </motion.div>
          </div>
        )}

        {/* Users List */}
        <div className="bg-slate-900 rounded-lg shadow-lg overflow-hidden border border-slate-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {users.length === 0 ? (
                  <tr>
                    <td
                      colSpan="3"
                      className="px-6 py-4 text-center text-slate-400"
                    >
                      No users found. Create a new user to get started.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                      className="hover:bg-slate-800"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                            <div className="text-sm font-medium text-slate-200">
                            {user.name}
                          </div>
                            <div className="text-sm text-slate-400">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                      <select
                            value={user.role || ""}
                        onChange={(e) =>
                          handleRoleChange(user._id, e.target.value)
                        }
                            className="bg-slate-800 text-slate-200 border border-slate-700 rounded px-3 py-1 focus:ring-indigo-500 focus:border-indigo-500"
                            disabled={
                              actionLoading || user._id === currentUser?._id
                            }
                          >
                            {availableRoles.map((role) => (
                              <option
                                key={role.value}
                                value={role.value}
                                className="bg-slate-800"
                              >
                                {role.label}
                          </option>
                        ))}
                      </select>
                        </div>
                    </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => {
                          setEditingUser(user);
                          setFormData({
                            name: user.name,
                            email: user.email,
                            role: user.role,
                                status: user.status || STATUS.ACTIVE,
                          });
                          setIsAddingUser(true);
                        }}
                            className="text-blue-400 hover:text-blue-300 disabled:opacity-50"
                        title="Edit User"
                            disabled={actionLoading}
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                          {user._id !== currentUser?._id && (
                        <button
                          onClick={() => handleDelete(user._id)}
                              className="text-red-400 hover:text-red-300 disabled:opacity-50"
                          title="Delete User"
                              disabled={actionLoading}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                        </div>
                    </td>
                  </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;
