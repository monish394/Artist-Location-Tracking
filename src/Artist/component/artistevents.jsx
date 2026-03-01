import React, { useEffect, useState } from "react";
import axios from "axios";

const ArtistEvents = () => {
  const [events, setEvents] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  const [editingEventId, setEditingEventId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    venueId: "",
    date: "",
    time: "",
    description: "",
    category: "Concert",
    maxParticipants: "",
    status: "upcoming",
  });
  const [venues, setVenues] = useState([]);
  const [loadingVenues, setLoadingVenues] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

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

      const res = await axios.get("http://localhost:5000/api/artist/events", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setEvents(res.data.events || []);
    } catch (err) {
      console.error("Fetch artist events error:", err);
      setError("Failed to fetch your events.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents = events.filter((ev) => {
    const now = Date.now();
    const start = ev.startDateTime ? new Date(ev.startDateTime).getTime() : null;
    let displayStatus = ev.status;

    if (start && start < now && (ev.status === "upcoming" || ev.status === "ongoing")) {
      displayStatus = "completed";
    }

    if (statusFilter && displayStatus !== statusFilter) return false;
    if (categoryFilter && ev.category !== categoryFilter) return false;
    return true;
  });

  const handleDelete = async (eventId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this event?"
    );
    if (!confirmed) return;

    try {
      setDeletingId(eventId);
      setError("");

      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:5000/api/artist/events/${eventId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchEvents();
    } catch (err) {
      console.error("Delete event error:", err);
      setError("Failed to delete event.");
    } finally {
      setDeletingId(null);
    }
  };

  const openEditForm = async (ev) => {
    try {
      setError("");
      setEditingEventId(ev._id);

      let date = "";
      let time = "";
      if (ev.startDateTime) {
        const start = new Date(ev.startDateTime);
        if (!isNaN(start.getTime())) {
          date = start.toISOString().slice(0, 10);
          time = start.toISOString().slice(11, 16);
        }
      }

      setEditForm({
        title: ev.title || "",
        venueId: ev.venue?._id || ev.venue || "",
        date,
        time,
        description: ev.description || "",
        category: ev.category || "Concert",
        maxParticipants:
          ev.maxParticipants != null ? String(ev.maxParticipants) : "",
        status: ev.status || "upcoming",
      });

      setLoadingVenues(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/admin/venues", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const allVenues = res.data.venues || res.data;
      setVenues(allVenues.filter((v) => v.isActive !== false));
      setLoadingVenues(false);
    } catch (err) {
      console.error("Open edit form error:", err);
      setError("Failed to open edit form.");
      setLoadingVenues(false);
      setEditingEventId(null);
    }
  };

  const closeEditForm = () => {
    setEditingEventId(null);
    setEditForm({
      title: "",
      venueId: "",
      date: "",
      time: "",
      description: "",
      category: "Concert",
      maxParticipants: "",
      status: "upcoming",
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    setError("");

    if (!editForm.title || !editForm.venueId || !editForm.date || !editForm.time) {
      setError("Please fill in title, venue, date, and time.");
      setSavingEdit(false);
      return;
    }

    const startDateTime = `${editForm.date}T${editForm.time}`;

    const body = {
      title: editForm.title.trim(),
      venue: editForm.venueId,
      startDateTime,
      description: editForm.description,
      category: editForm.category,
      maxParticipants: editForm.maxParticipants || undefined,
      status: editForm.status,
    };

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/artist/events/${editingEventId}`,
        body,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchEvents();
      closeEditForm();
    } catch (err) {
      console.error("Update event error:", err);
      setError("Failed to update event.");
    } finally {
      setSavingEdit(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        <h2 className="text-white text-2xl font-semibold">Loading events...</h2>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">
          My Events
        </h2>
        <p className="text-gray-300 text-sm">
          Manage your upcoming and past performances
        </p>
      </div>

      {error && (
        <div className="bg-red-500 text-white px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}

      {/* Edit Modal */}
      {editingEventId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-white mb-4">
              Edit Event
            </h3>

            {loadingVenues ? (
              <p className="text-slate-400">Loading venues...</p>
            ) : (
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <input
                  type="text"
                  name="title"
                  value={editForm.title}
                  onChange={handleEditChange}
                  placeholder="Event Title"
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <select
                  name="venueId"
                  value={editForm.venueId}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Venue</option>
                  {venues.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.name} — {v.address?.city}
                    </option>
                  ))}
                </select>

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="date"
                    name="date"
                    value={editForm.date}
                    onChange={handleEditChange}
                    className="px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="time"
                    name="time"
                    value={editForm.time}
                    onChange={handleEditChange}
                    className="px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <select
                    name="category"
                    value={editForm.category}
                    onChange={handleEditChange}
                    className="px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Concert">Concert</option>
                    <option value="Open Mic">Open Mic</option>
                    <option value="Festival">Festival</option>
                    <option value="Private Event">Private Event</option>
                  </select>

                  <input
                    type="number"
                    name="maxParticipants"
                    value={editForm.maxParticipants}
                    onChange={handleEditChange}
                    placeholder="Max Participants"
                    className="px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <select
                  name="status"
                  value={editForm.status}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleEditChange}
                  rows={3}
                  placeholder="Description"
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="flex-1 bg-gradient-to-r from-indigo-500 to-pink-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-indigo-600 hover:to-pink-600 disabled:opacity-50"
                  >
                    {savingEdit ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={closeEditForm}
                    className="px-6 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Status</option>
          <option value="upcoming">Upcoming</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Categories</option>
          <option value="Concert">Concert</option>
          <option value="Open Mic">Open Mic</option>
          <option value="Festival">Festival</option>
          <option value="Private Event">Private Event</option>
        </select>

        <button
          onClick={fetchEvents}
          className="ml-auto px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
        >
          Refresh
        </button>
      </div>

      {/* Events Table */}
      <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Your Events ({filteredEvents.length})
        </h3>

        {filteredEvents.length === 0 ? (
          <p className="text-slate-400">No events found</p>
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
                  <th className="py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((ev) => {
                  const now = Date.now();
                  const start = ev.startDateTime
                    ? new Date(ev.startDateTime).getTime()
                    : null;
                  let displayStatus = ev.status;

                  if (
                    start &&
                    start < now &&
                    (ev.status === "upcoming" || ev.status === "ongoing")
                  ) {
                    displayStatus = "completed";
                  }

                  return (
                    <tr
                      key={ev._id}
                      className="border-b border-slate-700 hover:bg-slate-700/30"
                    >
                      <td className="py-4 text-white font-medium">
                        {ev.title}
                      </td>
                      <td className="py-4 text-slate-300">
                        {ev.venue?.name || "Unknown"}
                      </td>
                      <td className="py-4 text-slate-300">
                        {ev.venue?.address?.city || "—"}
                      </td>
                      <td className="py-4 text-slate-300">
                        {ev.startDateTime
                          ? new Date(ev.startDateTime).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs uppercase ${
                            displayStatus === "upcoming"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : displayStatus === "completed"
                              ? "bg-slate-600/40 text-slate-300"
                              : "bg-red-500/20 text-red-300"
                          }`}
                        >
                          {displayStatus}
                        </span>
                      </td>
                      <td className="py-4 text-right space-x-2">
                        <button
                          onClick={() => openEditForm(ev)}
                          className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(ev._id)}
                          disabled={deletingId === ev._id}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs disabled:opacity-50"
                        >
                          {deletingId === ev._id ? "..." : "Delete"}
                        </button>
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
  );
};

export default ArtistEvents;