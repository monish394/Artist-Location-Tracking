import React, { useEffect, useState } from "react";
import axios from "axios";
// import AdminNavbar from "./adminnav";

const AMENITY_OPTIONS = [
  "Parking",
  "Wheelchair Accessible",
  "Bar",
  "Food Service",
  "WiFi",
  "Sound System",
  "Stage",
  "Outdoor Seating",
  "Lighting",
];

const VENUE_TYPES = [
  "Bar",
  "Club",
  "Theater",
  "Concert Hall",
  "Outdoor",
  "Stadium",
  "Cafe",
  "Restaurant",
  "Other",
];

const AdminVenues = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [form, setForm] = useState({
    name: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "USA",
    venueType: "",
    capacity: "",
    phone: "",
    email: "",
    website: "",
    amenities: [],
    description: "",
  });

  const resetForm = () => {
    setEditingId(null);
    setForm({
      name: "",
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "USA",
      venueType: "",
      capacity: "",
      phone: "",
      email: "",
      website: "",
      amenities: [],
      description: "",
    });
  };

  const fetchVenues = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found. Please log in again.");
        setLoading(false);
        return;
      }

      const res = await axios.get("http://localhost:5000/api/admin/venues", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setVenues(res.data.venues || res.data);
      setCurrentPage(1); // Reset to first page on fetch
    } catch (err) {
      setError("Failed to fetch venues.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAmenityToggle = (amenity) => {
    setForm((prev) => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((a) => a !== amenity)
          : [...prev.amenities, amenity],
      };
    });
  };

  const startEdit = (venue) => {
    setEditingId(venue._id);
    setForm({
      name: venue.name || "",
      street: venue.address?.street || "",
      city: venue.address?.city || "",
      state: venue.address?.state || "",
      zipCode: venue.address?.zipCode || "",
      country: venue.address?.country || "USA",
      venueType: venue.venueType || "",
      capacity: venue.capacity ?? "",
      phone: venue.phone || "",
      email: venue.email || "",
      website: venue.website || "",
      amenities: venue.amenities || [],
      description: venue.description || "",
    });
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

    const body = {
      name: form.name.trim(),
      address: {
        street: form.street.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        zipCode: form.zipCode.trim(),
        country: form.country.trim() || "USA",
      },
      venueType: form.venueType,
      capacity: form.capacity ? Number(form.capacity) : undefined,
      phone: form.phone.trim() || undefined,
      email: form.email.trim() || undefined,
      website: form.website.trim() || undefined,
      amenities: form.amenities,
      description: form.description.trim() || undefined,
    };

    try {
      const headers = { Authorization: `Bearer ${token}` };

      if (editingId) {
        await axios.put(
          `http://localhost:5000/api/admin/venues/${editingId}`,
          body,
          { headers }
        );
      } else {
        await axios.post("http://localhost:5000/api/admin/venues", body, {
          headers,
        });
      }

      resetForm();
      await fetchVenues();
    } catch (err) {
      setError(
        err.response?.data?.msg ||
          err.response?.data?.error ||
          "Failed to save venue."
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (venue) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found. Please log in again.");
        return;
      }

      await axios.put(
        `http://localhost:5000/api/admin/venues/${venue._id}`,
        { isActive: !venue.isActive },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchVenues();
    } catch (err) {
      setError("Failed to update venue status.");
    }
  };

  // Pagination logic for venue table
  const totalPages = Math.ceil(venues.length / rowsPerPage);
  const paginatedVenues = venues.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handlePageChange = (page) => setCurrentPage(page);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        <h2 className="text-white text-2xl font-semibold">Loading venues...</h2>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      {/* <AdminNavbar /> */}

      <div className="w-full max-w-6xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Venue Management
        </h2>

        {error && (
          <div className="bg-red-500 text-white px-4 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm sm:text-base">
          Here you can manage all venues. Artists will only be able to select
          venues that you add here when they create their events. Latitude and
          longitude are calculated automatically on the server based on the
          address you enter.
        </p>

        {/* FORM */}
        <div className="mb-6 bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-slate-100">
          <h3 className="text-lg font-semibold mb-2">
            {editingId ? "Edit Venue" : "Add New Venue"}
          </h3>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm"
          >
            {/* ...form fields unchanged... */}
            {/* Left side */}
            <div className="space-y-3">
              {/* ...all your left side form fields... */}
              <div>
                <label className="block mb-1 text-slate-300">Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Skyline Bar"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-slate-300">
                  Street Address
                </label>
                <input
                  type="text"
                  name="street"
                  value={form.street}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. 123 Main St"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1 text-slate-300">City</label>
                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. New York"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-300">State</label>
                  <input
                    type="text"
                    name="state"
                    value={form.state}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. NY"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1 text-slate-300">ZIP Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={form.zipCode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. 10001"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-300">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={form.country}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. USA"
                  />
                </div>
              </div>
              <div>
                <label className="block mb-1 text-slate-300">
                  Description (optional)
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Short description of the venue, stage setup, etc."
                />
              </div>
            </div>
            {/* Right side */}
            <div className="space-y-3">
              <div>
                <label className="block mb-1 text-slate-300">Venue Type</label>
                <select
                  name="venueType"
                  value={form.venueType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select type</option>
                  {VENUE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 text-slate-300">Capacity</label>
                <input
                  type="number"
                  name="capacity"
                  value={form.capacity}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. 300"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1 text-slate-300">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. +1 555-123-4567"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-300">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="venue@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block mb-1 text-slate-300">Website</label>
                <input
                  type="url"
                  name="website"
                  value={form.website}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block mb-1 text-slate-300">Amenities</label>
                <div className="flex flex-wrap gap-2">
                  {AMENITY_OPTIONS.map((am) => (
                    <label
                      key={am}
                      className="inline-flex items-center gap-1 text-[11px] sm:text-xs text-slate-200 bg-slate-800 px-2 py-1 rounded-full cursor-pointer hover:bg-slate-700"
                    >
                      <input
                        type="checkbox"
                        className="h-3 w-3 rounded border-slate-500 text-indigo-500 focus:ring-indigo-500"
                        checked={form.amenities.includes(am)}
                        onChange={() => handleAmenityToggle(am)}
                      />
                      <span>{am}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-pink-500 text-white text-xs sm:text-sm font-semibold shadow-md hover:shadow-lg hover:from-indigo-600 hover:to-pink-600 disabled:opacity-70"
                >
                  {saving ? "Saving..." : editingId ? "Update Venue" : "Add Venue"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-xs sm:text-sm text-slate-300 hover:text-white"
                  >
                    Cancel edit
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* VENUE LIST */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-slate-100">
          <h3 className="text-lg font-semibold mb-3">Existing Venues</h3>
          {venues.length === 0 ? (
            <p className="text-xs text-slate-400">
              No venues added yet. Use the form above to create one.
            </p>
          ) : (
            <>
              <div className="overflow-x-auto text-xs sm:text-sm">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-300">
                      <th className="py-2 pr-3 text-left">Name</th>
                      <th className="py-2 pr-3 text-left">City</th>
                      <th className="py-2 pr-3 text-left">Type</th>
                      <th className="py-2 pr-3 text-left">Capacity</th>
                      <th className="py-2 pr-3 text-left">Status</th>
                      <th className="py-2 pr-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedVenues.map((v) => (
                      <tr
                        key={v._id}
                        className="border-b border-slate-800/60 last:border-none"
                      >
                        <td className="py-2 pr-3 text-slate-100">
                          {v.name}
                        </td>
                        <td className="py-2 pr-3 text-slate-300">
                          {v.address?.city}, {v.address?.state}
                        </td>
                        <td className="py-2 pr-3 text-slate-300">
                          {v.venueType}
                        </td>
                        <td className="py-2 pr-3 text-slate-300">
                          {v.capacity ?? "-"}
                        </td>
                        <td className="py-2 pr-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide ${
                              v.isActive
                                ? "bg-emerald-500/20 text-emerald-300"
                                : "bg-slate-700 text-slate-300"
                            }`}
                          >
                            {v.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="py-2 pr-3 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => startEdit(v)}
                            className="text-indigo-300 hover:text-indigo-200"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleActive(v)}
                            className="text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                          >
                            {v.isActive ? "Deactivate" : "Activate"}
                          </button>
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

export default AdminVenues;