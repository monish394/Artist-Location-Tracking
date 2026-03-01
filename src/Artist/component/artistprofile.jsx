// src/Artist/component/ArtistProfile.jsx
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

// ========== Configuration ==========
const API_BASE_URL = "http://localhost:5000/api";

const GENRE_OPTIONS = [
  "Pop",
  "Rock",
  "Hip Hop",
  "Jazz",
  "Classical",
  "Electronic",
  "Country",
  "R&B",
  "Indie",
  "Folk",
  "Other",
];

// ========== Initial Form State ==========
const getInitialFormState = () => ({
  artistName: "",
  stageName: "",
  bio: "",
  city: "",
  state: "",
  country: "USA",
  genre: [],
  website: "",
  instagram: "",
  facebook: "",
  twitter: "",
  spotify: "",
  youtube: "",
});

// ========== Main Component ==========
const ArtistProfile = () => {
  const [form, setForm] = useState(getInitialFormState());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ========== Fetch Profile ==========
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found. Please log in again.");
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const user = response.data.user || {};
      const artist = user.artistProfile || {};

      setForm({
        artistName: artist.artistName || "",
        stageName: artist.stageName || "",
        bio: artist.bio || "",
        city: artist.location?.city || "",
        state: artist.location?.state || "",
        country: artist.location?.country || "USA",
        genre: Array.isArray(artist.genre) ? artist.genre : [],
        website: artist.website || "",
        instagram: artist.socialMedia?.instagram || "",
        facebook: artist.socialMedia?.facebook || "",
        twitter: artist.socialMedia?.twitter || "",
        spotify: artist.socialMedia?.spotify || "",
        youtube: artist.socialMedia?.youtube || "",
      });
    } catch (err) {
      console.error("Error fetching artist profile:", err);
      setError(
        err.response?.data?.msg ||
          err.response?.data?.error ||
          "Failed to load artist profile."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // ========== Event Handlers ==========
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setSuccess("");
    setError("");
  }, []);

  const handleGenreToggle = useCallback((genre) => {
    setForm((prev) => {
      const exists = prev.genre.includes(genre);
      return {
        ...prev,
        genre: exists
          ? prev.genre.filter((g) => g !== genre)
          : [...prev.genre, genre],
      };
    });
    setSuccess("");
    setError("");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found. Please log in again.");
      setSaving(false);
      return;
    }

    const body = {
      artistName: form.artistName.trim(),
      stageName: form.stageName.trim() || undefined,
      bio: form.bio.trim() || undefined,
      genre: form.genre,
      website: form.website.trim() || undefined,
      socialMedia: {
        instagram: form.instagram.trim() || undefined,
        facebook: form.facebook.trim() || undefined,
        twitter: form.twitter.trim() || undefined,
        spotify: form.spotify.trim() || undefined,
        youtube: form.youtube.trim() || undefined,
      },
      location: {
        city: form.city.trim() || undefined,
        state: form.state.trim() || undefined,
        country: form.country.trim() || "USA",
      },
    };

    try {
      await axios.put(`${API_BASE_URL}/artist/profile`, body, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess("Profile updated successfully.");
    } catch (err) {
      console.error("Error updating artist profile:", err);
      setError(
        err.response?.data?.msg ||
          err.response?.data?.error ||
          "Failed to update artist profile."
      );
    } finally {
      setSaving(false);
    }
  };

  // ========== Loading State ==========
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        <h2 className="text-white text-2xl font-semibold">
          Loading profile...
        </h2>
      </div>
    );
  }

  // ========== Render ==========
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
          My Artist Profile
        </h1>

        {/* Error & Success Messages */}
        {error && (
          <div className="bg-red-500 text-white px-4 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-emerald-500 text-white px-4 py-2 rounded mb-4 text-sm">
            {success}
          </div>
        )}

        <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm sm:text-base">
          Update your public artist information. This is what fans and venues
          will see when they view your profile and events.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          {/* Artist & Stage Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-slate-700 dark:text-slate-200 font-medium">
                Artist / Band Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="artistName"
                value={form.artistName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                placeholder="e.g. The Night Lights"
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-slate-700 dark:text-slate-200 font-medium">
                Stage Name <span className="text-xs text-slate-400">(optional)</span>
              </label>
              <input
                type="text"
                name="stageName"
                value={form.stageName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                placeholder="e.g. DJ Nova"
              />
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block mb-1 text-slate-700 dark:text-slate-200 font-medium">
                City
              </label>
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                placeholder="e.g. New York"
              />
            </div>
            <div>
              <label className="block mb-1 text-slate-700 dark:text-slate-200 font-medium">
                State
              </label>
              <input
                type="text"
                name="state"
                value={form.state}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                placeholder="e.g. NY"
              />
            </div>
            <div>
              <label className="block mb-1 text-slate-700 dark:text-slate-200 font-medium">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={form.country}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                placeholder="e.g. USA"
              />
            </div>
          </div>

          {/* Genres */}
          <div>
            <label className="block mb-2 text-slate-700 dark:text-slate-200 font-medium">
              Genre(s)
            </label>
            <div className="flex flex-wrap gap-2">
              {GENRE_OPTIONS.map((genre) => (
                <label
                  key={genre}
                  className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-200 bg-slate-900 px-3 py-1.5 rounded-full cursor-pointer border border-slate-700 hover:bg-slate-800 transition-colors duration-200"
                >
                  <input
                    type="checkbox"
                    className="h-3 w-3 rounded border-slate-500 text-indigo-500 focus:ring-indigo-500 cursor-pointer"
                    checked={form.genre.includes(genre)}
                    onChange={() => handleGenreToggle(genre)}
                  />
                  <span>{genre}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block mb-1 text-slate-700 dark:text-slate-200 font-medium">
              Bio
            </label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-all duration-200"
              placeholder="Tell fans and venues a bit about your sound, influences, and performance style..."
            />
          </div>

          {/* Website */}
          <div>
            <label className="block mb-1 text-slate-700 dark:text-slate-200 font-medium">
              Website <span className="text-xs text-slate-400">(optional)</span>
            </label>
            <input
              type="url"
              name="website"
              value={form.website}
              onChange={handleInputChange}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
              placeholder="https://yourband.com"
            />
          </div>

          {/* Social Media */}
          <div>
            <label className="block mb-2 text-slate-700 dark:text-slate-200 font-medium">
              Social Media <span className="text-xs text-slate-400">(optional)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                name="instagram"
                value={form.instagram}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                placeholder="Instagram handle or URL"
              />
              <input
                type="text"
                name="facebook"
                value={form.facebook}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                placeholder="Facebook page URL"
              />
              <input
                type="text"
                name="twitter"
                value={form.twitter}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                placeholder="Twitter/X handle or URL"
              />
              <input
                type="text"
                name="spotify"
                value={form.spotify}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                placeholder="Spotify artist URL"
              />
              <input
                type="text"
                name="youtube"
                value={form.youtube}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                placeholder="YouTube channel URL"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-pink-500 text-white text-xs sm:text-sm font-semibold shadow-md hover:shadow-lg hover:from-indigo-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ArtistProfile;