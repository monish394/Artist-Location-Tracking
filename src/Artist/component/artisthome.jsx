import React, { useEffect, useState } from "react";
import API from "../../config/axios";

const ArtistDashboard = () => {
  const [artist, setArtist] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get("/artist/dashboard");

      setArtist(res.data.artist || null);
      setStats(res.data.stats || null);
      setRecentEvents(res.data.recentEvents || []);
    } catch (err) {
      console.error("Artist dashboard error:", err);
      setError(
        err.response?.data?.msg ||
        err.response?.data?.error ||
        "Failed to load artist dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        <h2 className="text-white text-2xl font-semibold">
          Loading dashboard...
        </h2>
      </div>
    );

  const artistName =
    artist?.artistName ||
    artist?.stageName ||
    "Artist";

  const totals = stats || {
    totalEvents: 0,
    upcomingEvents: 0,
    pastEvents: 0,
    totalParticipants: 0,
  };

  const followers = artist?.totalFollowers ?? 0;

  const getDisplayStatus = (ev) => {
    const now = Date.now();
    const start = ev.startDateTime ? new Date(ev.startDateTime).getTime() : null;
    let displayStatus = ev.status;

    if (
      start &&
      start < now &&
      (ev.status === "upcoming" || ev.status === "ongoing")
    ) {
      displayStatus = "completed";
    }
    return displayStatus;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">
          Welcome, {artistName}
        </h2>
        <p className="text-gray-300 text-sm">
          Review your events, track fan engagement, and manage your performances
        </p>
      </div>

      {error && (
        <div className="bg-red-500 text-white px-4 py-2 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition">
          <h3 className="text-sm font-semibold mb-1 opacity-90">Total Events</h3>
          <p className="text-4xl font-bold mb-2">
            {totals.totalEvents}
          </p>
          <p className="text-xs opacity-80">
            All scheduled performances
          </p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition">
          <h3 className="text-sm font-semibold mb-1 opacity-90">Upcoming</h3>
          <p className="text-4xl font-bold mb-2">
            {totals.upcomingEvents}
          </p>
          <p className="text-xs opacity-80">
            Coming shows
          </p>
        </div>

        <div className="bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition">
          <h3 className="text-sm font-semibold mb-1 opacity-90">Completed</h3>
          <p className="text-4xl font-bold mb-2">
            {totals.pastEvents}
          </p>
          <p className="text-xs opacity-80">
            Past performances
          </p>
        </div>

        <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition">
          <h3 className="text-sm font-semibold mb-1 opacity-90">Participants</h3>
          <p className="text-4xl font-bold mb-2">
            {totals.totalParticipants}
          </p>
          <p className="text-xs opacity-80">
            Total registrations
          </p>
        </div>
      </div>

      {/* Profile + Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <section className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-4">
            Profile Overview
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Artist name</span>
              <span className="font-semibold text-white">
                {artist?.artistName || "Not set"}
              </span>
            </div>
            <div className="flex justify-between border-t border-slate-700 pt-3">
              <span className="text-slate-400">Stage name</span>
              <span className="font-semibold text-white">
                {artist?.stageName || "Not set"}
              </span>
            </div>
            <div className="flex justify-between border-t border-slate-700 pt-3">
              <span className="text-slate-400">Followers</span>
              <span className="font-semibold text-white">
                {followers}
              </span>
            </div>
          </div>
        </section>

        <section className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-4">
            Quick Tips
          </h3>
          <ul className="text-sm space-y-3 text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">•</span>
              <span>Keep your upcoming shows updated</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">•</span>
              <span>Use clear event titles and descriptions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">•</span>
              <span>Perform at different venues</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">•</span>
              <span>Share your event links with fans</span>
            </li>
          </ul>
        </section>
      </div>

      {/* Recent Events */}
      <section className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-4">
          Recent Events
        </h3>

        {recentEvents.length === 0 ? (
          <p className="text-sm text-slate-400">
            No events yet. Create your first event to start tracking.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-300 border-b border-slate-700">
                  <th className="py-3 text-left">Title</th>
                  <th className="py-3 text-left">Venue</th>
                  <th className="py-3 text-left">City</th>
                  <th className="py-3 text-left">Date</th>
                  <th className="py-3 text-left">Status</th>
                  <th className="py-3 text-left">Category</th>
                </tr>
              </thead>
              <tbody>
                {recentEvents.map((ev) => {
                  const displayStatus = getDisplayStatus(ev);
                  return (
                    <tr
                      key={ev.id}
                      className="border-b border-slate-700 hover:bg-slate-700/30 transition"
                    >
                      <td className="py-4 text-white font-medium">
                        {ev.title}
                      </td>
                      <td className="py-4 text-slate-300">
                        {ev.venueName}
                      </td>
                      <td className="py-4 text-slate-300">
                        {ev.city}
                      </td>
                      <td className="py-4 text-slate-300">
                        {ev.startDateTime
                          ? new Date(ev.startDateTime).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs uppercase ${displayStatus === "upcoming"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : displayStatus === "ongoing"
                              ? "bg-sky-500/20 text-sky-300"
                              : displayStatus === "completed"
                                ? "bg-slate-600/40 text-slate-300"
                                : "bg-red-500/20 text-red-300"
                            }`}
                        >
                          {displayStatus}
                        </span>
                      </td>
                      <td className="py-4 text-slate-300">
                        {ev.category}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default ArtistDashboard;