import React, { useEffect, useState } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found. Please log in again.");
        setLoading(false);
        return;
      }
      const res = await axios.get("http://localhost:5000/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data.users || []);
    } catch (err) {
      setError("Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) =>
    roleFilter ? u.role === roleFilter : true
  );

  const toggleActive = async (user) => {
    try {
      setSavingId(user._id);
      setError("");
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found. Please log in again.");
        setSavingId(null);
        return;
      }
      await axios.put(
        `http://localhost:5000/users/${user._id}`,
        { isActive: !user.isActive },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchUsers();
    } catch (err) {
      setError("Failed to update user.");
    } finally {
      setSavingId(null);
    }
  };

  const columns = [
    {
      name: "Email",
      selector: row => row.email,
      sortable: true,
    },
    {
      name: "Role",
      selector: row => row.role,
      sortable: true,
      cell: row => <span className="capitalize">{row.role}</span>,
    },
    {
      name: "Status",
      selector: row => row.isActive !== false ? "Active" : "Inactive",
      sortable: true,
      cell: row => (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide ${
            row.isActive !== false
              ? "bg-emerald-500/20 text-emerald-300"
              : "bg-slate-700 text-slate-300"
          }`}
        >
          {row.isActive !== false ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      name: "Created",
      selector: row => row.createdAt,
      sortable: true,
      cell: row =>
        row.createdAt
          ? new Date(row.createdAt).toLocaleDateString()
          : "-",
    },
    {
      name: "Actions",
      cell: row => (
        <button
          type="button"
          disabled={savingId === row._id}
          onClick={() => toggleActive(row)}
          className="text-xs px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-60"
        >
          {row.isActive !== false ? "Deactivate" : "Activate"}
        </button>
      ),
      ignoreRowClick: true,
    },
  ];

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        <h2 className="text-white text-2xl font-semibold">Loading users...</h2>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
          User Management
        </h2>
        {error && (
          <div className="bg-red-500 text-white px-4 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}
        <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm sm:text-base">
          View and manage all users registered on the platform, including
          admins, artists and fans. You can filter by role and activate or
          deactivate accounts.
        </p>
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-4 text-xs sm:text-sm">
          <div>
            <label className="block mb-1 text-slate-300 dark:text-slate-200 text-[11px]">
              Role
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All</option>
              <option value="admin">Admin</option>
              <option value="artist">Artist</option>
              <option value="fan">Fan</option>
            </select>
          </div>
          <button
            type="button"
            onClick={fetchUsers}
            className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800 hover:border-slate-500 text-xs sm:text-sm"
          >
            Refresh
          </button>
        </div>
        {/* Users DataTable */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-slate-100">
          <h3 className="text-lg font-semibold mb-3">All Users</h3>
          <DataTable
            columns={columns}
            data={filteredUsers}
            pagination
            highlightOnHover
            dense
            theme="dark"
            noDataComponent={<p className="text-xs text-slate-400">No users found for this filter.</p>}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;