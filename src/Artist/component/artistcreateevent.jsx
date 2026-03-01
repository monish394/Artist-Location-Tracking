// src/Artist/component/ArtistCreateEvent.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
// import ArtistNavbar from "./artistnav";

const ArtistCreateEvent = () => {
  const [venues, setVenues] = useState([]);
  const [form, setForm] = useState({
    title: "",
    venueId: "",
    date: "",
    time: "",
    description: "",
    category: "Concert",
    maxParticipants: "",
  });
  const [loadingVenues, setLoadingVenues] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const fetchVenues = async () => {
    try {
      setLoadingVenues(true);
      setError("");

      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found. Please log in again.");
        setLoadingVenues(false);
        return;
      }

      const res = await axios.get("http://localhost:5000/api/admin/venues", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const allVenues = res.data.venues || res.data;
      // Only active venues
      setVenues(allVenues.filter((v) => v.isActive !== false));
    } catch (err) {
      console.error(err);
      setError("Failed to load venues. Please try again.");
    } finally {
      setLoadingVenues(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found. Please log in again.");
      setSaving(false);
      return;
    }

    if (!form.title || !form.venueId || !form.date || !form.time) {
      setError("Please fill in title, venue, date and time.");
      setSaving(false);
      return;
    }

    const body = {
      title: form.title,
      venueId: form.venueId,        // backend accepts venueId
      date: form.date,              // "YYYY-MM-DD"
      time: form.time,              // "HH:mm"
      description: form.description,
      category: form.category,
      maxParticipants: form.maxParticipants || undefined,
    };

    try {
      await axios.post("http://localhost:5000/api/artist/events", body, {
        headers: { Authorization: `Bearer ${token}` },
      });

      navigate("/artist/events");
    } catch (err) {
      console.error("Create event error:", err);
      setError(
        err.response?.data?.msg ||
          err.response?.data?.error ||
          "Failed to create event."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loadingVenues)
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        <h2 className="text-white text-2xl font-semibold">
          Loading venues...
        </h2>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      {/* <ArtistNavbar /> */}

      <div className="w-full max-w-3xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Create New Event
        </h2>

        {error && (
          <div className="bg-red-500 text-white px-4 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm sm:text-base">
          Create a new performance and link it to one of the venues added by
          the admin. Fans will see these events on the map and event list.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          {/* Title */}
          <div>
            <label className="block mb-1 text-slate-700 dark:text-slate-200">
              Event Title
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Sunset Live Session"
            />
          </div>

          {/* Venue */}
          <div>
            <label className="block mb-1 text-slate-700 dark:text-slate-200">
              Venue
            </label>
            <select
              name="venueId"
              value={form.venueId}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select a venue</option>
              {venues.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.name} — {v.address?.city}, {v.address?.state}
                </option>
              ))}
            </select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-slate-700 dark:text-slate-200">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block mb-1 text-slate-700 dark:text-slate-200">
                Time
              </label>
              <input
                type="time"
                name="time"
                value={form.time}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Category & Max Participants */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-slate-700 dark:text-slate-200">
                Category
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Concert">Concert</option>
                <option value="Open Mic">Open Mic</option>
                <option value="Festival">Festival</option>
                <option value="Private Event">Private Event</option>
                <option value="Workshop">Workshop</option>
                <option value="Album Release">Album Release</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 text-slate-700 dark:text-slate-200">
                Max Participants (optional)
              </label>
              <input
                type="number"
                name="maxParticipants"
                value={form.maxParticipants}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. 200"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block mb-1 text-slate-700 dark:text-slate-200">
              Description (optional)
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Short description about this performance..."
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-pink-500 text-white text-xs sm:text-sm font-semibold shadow-md hover:shadow-lg hover:from-indigo-600 hover:to-pink-600 disabled:opacity-70"
            >
              {saving ? "Creating..." : "Create Event"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/artist/events")}
              className="text-xs sm:text-sm text-slate-300 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ArtistCreateEvent;