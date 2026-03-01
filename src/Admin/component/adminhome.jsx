// src/Admin/component/AdminHome.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
// import AdminNavbar from "./adminnav";

const AdminHome = () => {
  const [admin, setAdmin] = useState(null);
  const [stats, setStats] = useState(null); // dashboard stats from backend
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No token found. Please login again.");
          setLoading(false);
          return;
        }

        // Fetch profile + dashboard stats in parallel
        const [profileRes, dashboardRes] = await Promise.all([
          axios.get("http://localhost:5000/api/users/profile", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/admin/dashboardstats", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setAdmin(profileRes.data.user);
        setStats(dashboardRes.data);
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data?.msg ||
            "Failed to load admin dashboard. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  if (loading)
    return (
      <div className=" bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        <h2 className="text-white text-2xl font-semibold">Loading...</h2>
      </div>
    );

  const displayName = admin?.name || admin?.email || "Admin";

  // Safe fallbacks if stats is null
  const totals = stats?.totals || {
    users: 0,
    artists: 0,
    fans: 0,
    venues: 0,
    events: 0,
    participants: 0,
  };
  const eventsByStatus = stats?.eventsByStatus || {};
  const eventsByCategory = stats?.eventsByCategory || {};
  const recentEvents = stats?.recentEvents || [];

  return (
    <div>
      {/* <AdminNavbar /> */}
      <div className="fy-center p-4">
        <div className="relative w-full  bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8">
          {/* Header */}
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome, {displayName}
          </h2>

          {error && (
            <div className="bg-red-500 text-white px-4 py-2 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          <p className="text-gray-700 dark:text-gray-300 mb-6 text-sm sm:text-base">
            This is your admin home. Monitor platform activity, manage users,
            artists, venues and events, and keep the system healthy and safe
            for everyone.
          </p>

          {/* Admin overview cards (now using real stats) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl p-4 text-white shadow-md hover:shadow-xl transition-shadow">
              <h3 className="text-sm font-semibold mb-1">Total Users</h3>
              <p className="text-2xl font-bold mb-1">{totals.users}</p>
              <p className="text-xs opacity-90">
                Artists + fans registered on the platform.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl p-4 text-white shadow-md hover:shadow-xl transition-shadow">
              <h3 className="text-sm font-semibold mb-1">Artists</h3>
              <p className="text-2xl font-bold mb-1">{totals.artists}</p>
              <p className="text-xs opacity-90">Active artist profiles.</p>
            </div>

            <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl p-4 text-white shadow-md hover:shadow-xl transition-shadow">
              <h3 className="text-sm font-semibold mb-1">Fans</h3>
              <p className="text-2xl font-bold mb-1">{totals.fans}</p>
              <p className="text-xs opacity-90">Registered music fans.</p>
            </div>

            <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl p-4 text-white shadow-md hover:shadow-xl transition-shadow">
              <h3 className="text-sm font-semibold mb-1">Venues</h3>
              <p className="text-2xl font-bold mb-1">{totals.venues}</p>
              <p className="text-xs opacity-90">
                Active venues available for events.
              </p>
            </div>
          </div>

          {/* Events stats (status + category) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Events by Status */}
            <section className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-slate-100 shadow-md">
              <h3 className="text-lg font-semibold mb-2">Events by Status</h3>
              <p className="text-sm text-slate-300 mb-3">
                Distribution of events based on their current status.
              </p>
              <ul className="text-xs sm:text-sm space-y-1.5 text-slate-300">
                <li className="flex justify-between">
                  <span>Upcoming</span>
                  <span className="font-semibold">
                    {eventsByStatus.upcoming || 0}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Ongoing</span>
                  <span className="font-semibold">
                    {eventsByStatus.ongoing || 0}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Completed</span>
                  <span className="font-semibold">
                    {eventsByStatus.completed || 0}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Cancelled</span>
                  <span className="font-semibold">
                    {eventsByStatus.cancelled || 0}
                  </span>
                </li>
              </ul>
            </section>

            {/* Events by Category */}
            <section className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-slate-100 shadow-md">
              <h3 className="text-lg font-semibold mb-2">Events by Category</h3>
              <p className="text-sm text-slate-300 mb-3">
                Breakdown of events by type (concert, open mic, etc.).
              </p>
              <ul className="text-xs sm:text-sm space-y-1.5 text-slate-300">
                {Object.keys(eventsByCategory).length === 0 && (
                  <li className="text-slate-500 text-xs">
                    No events created yet.
                  </li>
                )}
                {Object.entries(eventsByCategory).map(([cat, count]) => (
                  <li key={cat} className="flex justify-between">
                    <span>{cat}</span>
                    <span className="font-semibold">{count}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Two-column textual sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* User Management */}
            <section className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-slate-100 shadow-md">
              <h3 className="text-lg font-semibold mb-2">User Management</h3>
              <p className="text-sm text-slate-300 mb-3">
                Quickly review accounts, deactivate abusive users, and manage
                access.
              </p>
              <ul className="text-xs sm:text-sm space-y-1.5 text-slate-300">
                <li>• View all registered users (artists + fans)</li>
                <li>• Search by email or username</li>
                <li>• Temporarily deactivate problematic accounts</li>
                <li>• Reset passwords upon verified requests</li>
              </ul>
            </section>

            {/* Content & Reports */}
            <section className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-slate-100 shadow-md">
              <h3 className="text-lg font-semibold mb-2">Content & Reports</h3>
              <p className="text-sm text-slate-300 mb-3">
                Stay on top of reported content and ensure platform guidelines
                are followed.
              </p>
              <ul className="text-xs sm:text-sm space-y-1.5 text-slate-300">
                <li>• Review reports from fans and artists</li>
                <li>• Flag inappropriate content for removal</li>
                <li>• Communicate with users about violations</li>
                <li>• Track resolved vs. unresolved issues</li>
              </ul>
            </section>
          </div>

          {/* Lower section: Platform health + recent events */}
          <section className="mt-6 bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-slate-100 shadow-md">
            <h3 className="text-lg font-semibold mb-2">Platform Health</h3>
            <p className="text-sm text-slate-300 mb-3">
              Monitor high-level system status and recent admin activity.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm mb-4">
              <div className="bg-slate-800 rounded-lg p-3">
                <p className="text-slate-400">API Status</p>
                <p className="font-semibold text-emerald-400 mt-1">
                  All systems operational
                </p>
              </div>
              <div className="bg-slate-800 rounded-lg p-3">
                <p className="text-slate-400">Total Events</p>
                <p className="font-semibold text-slate-200 mt-1">
                  {totals.events}
                </p>
              </div>
              <div className="bg-slate-800 rounded-lg p-3">
                <p className="text-slate-400">Total Participants</p>
                <p className="font-semibold text-slate-200 mt-1">
                  {totals.participants}
                </p>
              </div>
            </div>

            {/* Recent Events Table */}
            <div className="mt-3">
              <h4 className="text-sm sm:text-base font-semibold mb-2">
                Recent Events
              </h4>
              {recentEvents.length === 0 ? (
                <p className="text-xs text-slate-500">
                  No events have been created yet.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-700 text-slate-300">
                        <th className="py-2 pr-4">Title</th>
                        <th className="py-2 pr-4">Artist</th>
                        <th className="py-2 pr-4">Venue</th>
                        <th className="py-2 pr-4">City</th>
                        <th className="py-2 pr-4">Start</th>
                        <th className="py-2 pr-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentEvents.map((ev) => (
                        <tr
                          key={ev.id}
                          className="border-b border-slate-800/60 last:border-none"
                        >
                          <td className="py-2 pr-4 text-slate-100">
                            {ev.title}
                          </td>
                          <td className="py-2 pr-4 text-slate-300">
                            {ev.artistName}
                          </td>
                          <td className="py-2 pr-4 text-slate-300">
                            {ev.venueName}
                          </td>
                          <td className="py-2 pr-4 text-slate-300">
                            {ev.city}
                          </td>
                          <td className="py-2 pr-4 text-slate-300">
                            {new Date(ev.startDateTime).toLocaleString()}
                          </td>
                          <td className="py-2 pr-4 text-slate-300 capitalize">
                            {ev.status}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          {!admin && (
            <p className="mt-6 text-xs text-gray-500 dark:text-gray-500">
              You&apos;re viewing a demo version of the admin home. Log in with
              an admin account to see real statistics and management tools.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminHome;