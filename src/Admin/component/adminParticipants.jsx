// src/Admin/component/AdminParticipants.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
// import AdminNavbar from "./adminnav";

const AdminParticipants = () => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState("");  // registered, confirmed, etc.

  const fetchParticipants = async () => {
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

      const res = await axios.get(
        "http://localhost:5000/participants",
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }
      );

      setParticipants(res.data.participants || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch participants.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        <h2 className="text-white text-2xl font-semibold">
          Loading participants...
        </h2>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      {/* <AdminNavbar /> */}

      <div className="w-full max-w-6xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Participants Overview
        </h2>

        {error && (
          <div className="bg-red-500 text-white px-4 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm sm:text-base">
          See which fans have registered, confirmed, or attended events across
          the platform. Use filters to narrow down by participation status.
        </p>

        {/* Filters */}
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
              <option value="registered">Registered</option>
              <option value="confirmed">Confirmed</option>
              <option value="attended">Attended</option>
              <option value="cancelled">Cancelled</option>
              <option value="no-show">No-show</option>
            </select>
          </div>

          <button
            type="button"
            onClick={fetchParticipants}
            className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800 hover:border-slate-500 text-xs sm:text-sm"
          >
            Refresh
          </button>
        </div>

        {/* Participants Table */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-slate-100">
          <h3 className="text-lg font-semibold mb-3">All Participants</h3>

          {participants.length === 0 ? (
            <p className="text-xs text-slate-400">
              No participants found for this filter. When fans join events,
              their registrations will appear here.
            </p>
          ) : (
            <div className="overflow-x-auto text-xs sm:text-sm">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-300">
                    <th className="py-2 pr-3 text-left">Event</th>
                    <th className="py-2 pr-3 text-left">Artist</th>
                    <th className="py-2 pr-3 text-left">Venue / City</th>
                    <th className="py-2 pr-3 text-left">Fan</th>
                    <th className="py-2 pr-3 text-left">Ticket</th>
                    <th className="py-2 pr-3 text-left">Status</th>
                    <th className="py-2 pr-3 text-left">Guests</th>
                    <th className="py-2 pr-3 text-left">Check-in</th>
                    <th className="py-2 pr-3 text-left">Registered At</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((p) => {
                    const event = p.event;
                    const venue = event?.venue;
                    const artist = event?.artist;
                    const fan = p.fan;
                    const fanEmail = fan?.user?.email;
                    const fanName =
                      fan?.firstName || fan?.lastName
                        ? `${fan.firstName || ""} ${fan.lastName || ""}`.trim()
                        : fanEmail || "Unknown Fan";

                    return (
                      <tr
                        key={p._id}
                        className="border-b border-slate-800/60 last:border-none"
                      >
                        <td className="py-2 pr-3 text-slate-100">
                          {event?.title || "Unknown Event"}
                        </td>
                        <td className="py-2 pr-3 text-slate-300">
                          {artist?.artistName || "Unknown Artist"}
                        </td>
                        <td className="py-2 pr-3 text-slate-300">
                          {venue?.name || "Unknown Venue"}
                          {venue?.address?.city && (
                            <span className="block text-[11px] text-slate-400">
                              {venue.address.city}
                            </span>
                          )}
                        </td>
                        <td className="py-2 pr-3 text-slate-300">
                          <span className="block">{fanName}</span>
                          {fanEmail && (
                            <span className="block text-[11px] text-slate-400">
                              {fanEmail}
                            </span>
                          )}
                        </td>
                        <td className="py-2 pr-3 text-slate-300">
                          <span className="block capitalize">
                            {p.ticketType || "free"}
                          </span>
                          {p.ticketNumber && (
                            <span className="block text-[11px] text-slate-400">
                              #{p.ticketNumber}
                            </span>
                          )}
                        </td>
                        <td className="py-2 pr-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide ${
                              p.status === "registered"
                                ? "bg-sky-500/20 text-sky-300"
                                : p.status === "confirmed"
                                ? "bg-emerald-500/20 text-emerald-300"
                                : p.status === "attended"
                                ? "bg-indigo-500/20 text-indigo-300"
                                : p.status === "cancelled"
                                ? "bg-red-500/20 text-red-300"
                                : "bg-slate-600/40 text-slate-200"
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="py-2 pr-3 text-slate-300">
                          {p.numberOfGuests ?? 0}
                        </td>
                        <td className="py-2 pr-3 text-slate-300">
                          {p.checkedIn ? (
                            <span className="text-emerald-300">
                              Yes
                              {p.checkInTime && (
                                <span className="block text-[11px] text-slate-400">
                                  {new Date(
                                    p.checkInTime
                                  ).toLocaleString()}
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="text-slate-400">No</span>
                          )}
                        </td>
                        <td className="py-2 pr-3 text-slate-300">
                          {p.createdAt
                            ? new Date(p.createdAt).toLocaleString()
                            : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminParticipants;