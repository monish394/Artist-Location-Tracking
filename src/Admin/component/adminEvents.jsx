import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [search, setSearch] = useState(""); // <-- NEW
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found. Please log in again.");
        setLoading(false);
        return;
      }
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      const res = await axios.get("http://localhost:5000/api/admin/events", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setEvents(res.data.events || []);
      setCurrentPage(1);
    } catch (err) {
      setError("Failed to fetch events.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line
  }, [statusFilter, categoryFilter]);

  // Search and pagination logic
  const filteredEvents = events.filter(ev => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      ev.title?.toLowerCase().includes(s) ||
      ev.artist?.artistName?.toLowerCase().includes(s) ||
      ev.venue?.name?.toLowerCase().includes(s) ||
      ev.venue?.address?.city?.toLowerCase().includes(s) ||
      ev.category?.toLowerCase().includes(s) ||
      ev.status?.toLowerCase().includes(s)
    );
  });

  const totalPages = Math.ceil(filteredEvents.length / rowsPerPage);
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handlePageChange = (page) => setCurrentPage(page);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        <h2 className="text-white text-2xl font-semibold">Loading events...</h2>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Event Management
        </h2>
        {error && (
          <div className="bg-red-500 text-white px-4 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}
        <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm sm:text-base">
          View and monitor all events created by artists. Use filters to narrow
          down events by status or category.
        </p>
        {/* Filters and Search */}
        <div className="flex flex-wrap items-center gap-3 mb-4 text-xs sm:text-sm">
          <div>
            <label className="block mb-1 text-slate-300 dark:text-slate-200 text-[11px]">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 text-slate-300 dark:text-slate-200 text-[11px]">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All</option>
              <option value="Concert">Concert</option>
              <option value="Open Mic">Open Mic</option>
              <option value="Festival">Festival</option>
              <option value="Private Event">Private Event</option>
              <option value="Workshop">Workshop</option>
              <option value="Album Release">Album Release</option>
              <option value="Other">Other</option>
            </select>
          </div>
          {/* Search Bar */}
          <div className="flex-1 min-w-[180px]">
            <label className="block mb-1 text-slate-300 dark:text-slate-200 text-[11px]">
              Search
            </label>
            <input
              type="text"
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by title, artist, venue, city..."
              className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="button"
            onClick={fetchEvents}
            className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800 hover:border-slate-500 text-xs sm:text-sm"
          >
            Refresh
          </button>
        </div>
        {/* Events Table */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-slate-100">
          <h3 className="text-lg font-semibold mb-3">All Events</h3>
          {filteredEvents.length === 0 ? (
            <p className="text-xs text-slate-400">
              No events found. Once artists start creating events, they will
              appear here.
            </p>
          ) : (
            <>
              <div className="overflow-x-auto text-xs sm:text-sm">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-300">
                      <th className="py-2 pr-3 text-left">Title</th>
                      <th className="py-2 pr-3 text-left">Artist</th>
                      <th className="py-2 pr-3 text-left">Venue</th>
                      <th className="py-2 pr-3 text-left">City</th>
                      <th className="py-2 pr-3 text-left">Start</th>
                      <th className="py-2 pr-3 text-left">Status</th>
                      <th className="py-2 pr-3 text-left">Category</th>
                      <th className="py-2 pr-3 text-right">Participants</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedEvents.map((ev) => (
                      <tr
                        key={ev._id}
                        className="border-b border-slate-800/60 last:border-none"
                      >
                        <td className="py-2 pr-3 text-slate-100">
                          {ev.title}
                        </td>
                        <td className="py-2 pr-3 text-slate-300">
                          {ev.artist?.artistName || "Unknown Artist"}
                        </td>
                        <td className="py-2 pr-3 text-slate-300">
                          {ev.venue?.name || "Unknown Venue"}
                        </td>
                        <td className="py-2 pr-3 text-slate-300">
                          {ev.venue?.address?.city || ""}
                        </td>
                        <td className="py-2 pr-3 text-slate-300">
                          {ev.startDateTime
                            ? new Date(ev.startDateTime).toLocaleString()
                            : "-"}
                        </td>
                        <td className="py-2 pr-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide ${
                              ev.status === "upcoming"
                                ? "bg-emerald-500/20 text-emerald-300"
                                : ev.status === "ongoing"
                                ? "bg-sky-500/20 text-sky-300"
                                : ev.status === "completed"
                                ? "bg-slate-600/40 text-slate-200"
                                : "bg-red-500/20 text-red-300"
                            }`}
                          >
                            {ev.status}
                          </span>
                        </td>
                        <td className="py-2 pr-3 text-slate-300">
                          {ev.category}
                        </td>
                        <td className="py-2 pr-3 text-right text-slate-300">
                          {ev.totalParticipants ?? 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination Controls */}
              <div className="flex items-center justify-between mt-4">
                <div>
                  <label className="mr-2">Rows per page:</label>
                  <select
                    value={rowsPerPage}
                    onChange={e => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-100"
                  >
                    {[5, 10, 20, 50].map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-2 py-1 rounded bg-slate-800 text-slate-100 disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <span className="text-slate-200">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-2 py-1 rounded bg-slate-800 text-slate-100 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminEvents;