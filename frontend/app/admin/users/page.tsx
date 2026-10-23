"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Users,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  UserCheck,
  UserX,
  Trash2,
  Heart,
  MessageSquare,
  Compass,
} from "lucide-react";
import api, { apiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

interface UserListItem {
  id: number;
  name: string;
  email: string;
  role: "admin" | "tourist";
  status: "active" | "inactive";
  plans_count: number;
  favorites_count: number;
  reviews_count: number;
  formatted_date: string;
}

export default function AdminUsersPage() {
  const { user: currentAdmin } = useAuth();

  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [roleFilter, setRoleFilter] = useState<"all" | "tourist" | "admin">("all");

  // Notifications
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Status updating / action pending ID
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Deletion modal
  const [userToDelete, setUserToDelete] = useState<UserListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsers = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await api.get("/admin/users");
      if (res.data?.data) {
        setUsers(res.data.data);
      }
    } catch (err) {
      setNotification({
        type: "error",
        message: apiError(err) || "Failed to load registered users.",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ? true : u.status === statusFilter;

      const matchesRole =
        roleFilter === "all" ? true : u.role === roleFilter;

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [users, searchQuery, statusFilter, roleFilter]);

  const handleToggleStatus = async (targetUser: UserListItem) => {
    if (currentAdmin && currentAdmin.id === targetUser.id) {
      setNotification({
        type: "error",
        message: "You cannot deactivate your own active administrative account.",
      });
      return;
    }

    const nextStatus = targetUser.status === "active" ? "inactive" : "active";
    setUpdatingId(targetUser.id);

    try {
      await api.put(`/admin/users/${targetUser.id}`, { status: nextStatus });
      setNotification({
        type: "success",
        message: `User ${targetUser.name} has been set to ${nextStatus}.`,
      });
      fetchUsers(true);
    } catch (err) {
      setNotification({
        type: "error",
        message: apiError(err) || "Failed to update user status.",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    if (currentAdmin && currentAdmin.id === userToDelete.id) {
      setNotification({
        type: "error",
        message: "You cannot delete your own administrative account.",
      });
      setUserToDelete(null);
      return;
    }

    setIsDeleting(true);

    try {
      await api.delete(`/admin/users/${userToDelete.id}`);
      setNotification({
        type: "success",
        message: `Account for ${userToDelete.name} was removed successfully.`,
      });
      setUserToDelete(null);
      fetchUsers(true);
    } catch (err) {
      setNotification({
        type: "error",
        message: apiError(err) || "Failed to delete user account.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header and Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-stone-500 text-xs font-medium uppercase tracking-wider mb-1">
            <Users className="w-4 h-4 text-[#174D44]" />
            <span>Management</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            User Accounts
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-0.5">
            View registered visitors, manage account activation status, and oversee explorer privileges.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchUsers(true)}
            disabled={refreshing || loading}
            title="Refresh user list"
            className="p-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 hover:text-stone-900 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-[#174D44]" : ""}`} />
          </button>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div
          className={`flex items-start justify-between gap-3 p-4 rounded-xl border text-sm transition-all ${
            notification.type === "success"
              ? "bg-emerald-50/90 border-emerald-200 text-emerald-900"
              : "bg-rose-50/90 border-rose-200 text-rose-900"
          }`}
        >
          <div className="flex items-start gap-2.5">
            {notification.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <p className="font-medium">{notification.message}</p>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-stone-400 hover:text-stone-600 p-0.5 rounded-sm"
          >
            &times;
          </button>
        </div>
      )}

      {/* Filters Bar: Search + Status + Role */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#174D44] focus:bg-white transition-all text-stone-800 placeholder-stone-400"
          />
        </div>

        {/* Status Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl bg-stone-100 p-1 border border-stone-200">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                statusFilter === "all"
                  ? "bg-white text-stone-900 shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              All Status
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                statusFilter === "active"
                  ? "bg-white text-emerald-700 shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter("inactive")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                statusFilter === "inactive"
                  ? "bg-white text-rose-700 shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              Inactive
            </button>
          </div>

          {/* Role Filter */}
          <div className="flex rounded-xl bg-stone-100 p-1 border border-stone-200">
            <button
              onClick={() => setRoleFilter("all")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                roleFilter === "all"
                  ? "bg-white text-stone-900 shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              All Roles
            </button>
            <button
              onClick={() => setRoleFilter("tourist")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                roleFilter === "tourist"
                  ? "bg-white text-stone-900 shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              Tourists
            </button>
            <button
              onClick={() => setRoleFilter("admin")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                roleFilter === "admin"
                  ? "bg-white text-[#174D44] shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              Admins
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-[#174D44]/30 border-t-[#174D44] rounded-full animate-spin mx-auto" />
            <p className="text-stone-500 text-sm font-medium">Loading user accounts...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-stone-800">No user accounts found</h3>
            <p className="text-stone-500 text-sm max-w-sm mx-auto">
              {searchQuery || statusFilter !== "all" || roleFilter !== "all"
                ? "No users match your applied search or filter criteria."
                : "No registered users in the database."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-stone-700">
              <thead className="bg-stone-50/80 border-b border-stone-200 text-stone-500 uppercase text-[11px] font-semibold tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-3.5">
                    User Details
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-center">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-center">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-center">
                    Activity
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-center">
                    Joined Date
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredUsers.map((u) => {
                  const isCurrent = Boolean(currentAdmin && currentAdmin.id === u.id);
                  const isUpdating = updatingId === u.id;

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-stone-50/70 transition-colors group"
                    >
                      {/* Name & Email */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#174D44]/10 text-[#174D44] font-bold flex items-center justify-center text-sm shrink-0">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-stone-900">
                                {u.name}
                              </span>
                              {isCurrent && (
                                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-md">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-stone-500">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        {u.role === "admin" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <ShieldCheck className="w-3 h-3 text-emerald-700" />
                            <span>Admin</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200">
                            <span>Tourist</span>
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        {u.status === "active" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* User Activity: Plans, Favorites, Reviews */}
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-3 text-xs text-stone-500">
                          <span className="inline-flex items-center gap-1" title="Visit Plans Created">
                            <Compass className="w-3.5 h-3.5 text-[#174D44]" />
                            <span>{u.plans_count}</span>
                          </span>
                          <span className="inline-flex items-center gap-1" title="Places Favorited">
                            <Heart className="w-3.5 h-3.5 text-[#8C2E1F]" />
                            <span>{u.favorites_count}</span>
                          </span>
                          <span className="inline-flex items-center gap-1" title="Reviews Submitted">
                            <MessageSquare className="w-3.5 h-3.5 text-[#C88A2C]" />
                            <span>{u.reviews_count}</span>
                          </span>
                        </div>
                      </td>

                      {/* Joined Date */}
                      <td className="px-6 py-4 text-center text-xs text-stone-500 whitespace-nowrap">
                        {u.formatted_date}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Toggle Active/Inactive */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(u)}
                            disabled={isCurrent || isUpdating}
                            title={
                              isCurrent
                                ? "Cannot modify your own account"
                                : u.status === "active"
                                ? "Deactivate User"
                                : "Activate User"
                            }
                            className={`p-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors ${
                              isCurrent
                                ? "opacity-30 cursor-not-allowed text-stone-400"
                                : u.status === "active"
                                ? "text-amber-700 hover:bg-amber-50"
                                : "text-emerald-700 hover:bg-emerald-50"
                            }`}
                          >
                            {u.status === "active" ? (
                              <UserX className="w-4 h-4" />
                            ) : (
                              <UserCheck className="w-4 h-4" />
                            )}
                          </button>

                          {/* Delete User */}
                          <button
                            type="button"
                            onClick={() => setUserToDelete(u)}
                            disabled={isCurrent}
                            title={isCurrent ? "Cannot delete your own account" : "Delete Account"}
                            className={`p-1.5 rounded-lg text-stone-600 transition-colors ${
                              isCurrent
                                ? "opacity-30 cursor-not-allowed"
                                : "hover:text-rose-600 hover:bg-rose-50"
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete User Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(userToDelete)}
        title="Delete User Account"
        itemName={userToDelete?.name || ""}
        message={`Are you sure you want to permanently remove the account for ${userToDelete?.email}? All their saved visit plans, favorites, and reviews will be removed.`}
        confirmLabel="Delete User"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setUserToDelete(null)}
      />
    </div>
  );
}
