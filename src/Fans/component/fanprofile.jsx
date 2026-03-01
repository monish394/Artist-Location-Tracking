import { useEffect, useState, useRef } from "react";
import axios from "axios";

const GENRE_OPTIONS = [
  "Pop", "Rock", "Hip Hop", "Jazz", "Classical",
  "Electronic", "Country", "R&B", "Indie", "Folk", "Other"
];

const FanProfile = () => {
  const [profile, setProfile] = useState(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef();

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get(
          "http://localhost:5000/api/fan/profile",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setProfile(res.data);
        setForm({
          firstName: res.data.firstName || "",
          lastName: res.data.lastName || "",
          city: res.data.location?.city || "",
          state: res.data.location?.state || "",
          country: res.data.location?.country || "USA",
          favoriteGenres: res.data.favoriteGenres || [],
        });
        setPreview(null);
      } catch (err) {
        setError("Failed to load profile.");
      }
    };
    fetchProfile();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setSuccess("");
    setError("");
  };

  // Handle genre toggle
  const handleGenreToggle = (genre) => {
    setForm((prev) => {
      const exists = prev.favoriteGenres.includes(genre);
      return {
        ...prev,
        favoriteGenres: exists
          ? prev.favoriteGenres.filter((g) => g !== genre)
          : [...prev.favoriteGenres, genre],
      };
    });
    setSuccess("");
    setError("");
  };

  // Handle image file change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  // Upload profile image
  const handleImageUpload = async (e) => {
    e.preventDefault();
    const file = fileInputRef.current.files[0];
    if (!file) return;
    setUploading(true);
    setError("");
    setSuccess("");
    const token = localStorage.getItem("token");
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await axios.post(
        "http://localhost:5000/api/fan/profile-image",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setProfile((prev) => ({
        ...prev,
        profileImage: res.data.url,
      }));
      setSuccess("Profile image updated!");
      setPreview(null);
      fileInputRef.current.value = "";
    } catch (err) {
      setError(
        err.response?.data?.msg ||
        err.response?.data?.error ||
        "Failed to upload image."
      );
    } finally {
      setUploading(false);
    }
  };

  // Save profile
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        "http://localhost:5000/api/fan/profile",
        {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          favoriteGenres: form.favoriteGenres,
          location: {
            city: form.city.trim(),
            state: form.state.trim(),
            country: form.country.trim() || "USA",
          },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccess("Profile updated successfully.");
      setEdit(false);
      setProfile((prev) => ({
        ...prev,
        ...form,
        location: {
          city: form.city,
          state: form.state,
          country: form.country,
        },
        favoriteGenres: form.favoriteGenres,
      }));
    } catch (err) {
      setError(
        err.response?.data?.msg ||
        err.response?.data?.error ||
        "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  if (!profile || !form)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-900">
        <p className="text-gray-200 text-lg">Loading...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-900 py-10 px-4 flex items-center justify-center">
      <div className="w-full max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8">
        {/* Profile Image and Header */}
        <div className="flex items-center gap-6 mb-6">
          <div className="relative">
            <img
              src={preview || profile.profileImage || "/default-fan.png"}
              alt="Profile"
              className="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover bg-slate-200 dark:bg-slate-800"
              onError={e => { e.target.src = "/default-fan.png"; }}
            />
            {edit && (
              <form
                onSubmit={handleImageUpload}
                className="absolute bottom-0 right-0"
                encType="multipart/form-data"
              >
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="hidden"
                  id="profileImageInput"
                />
                <label
                  htmlFor="profileImageInput"
                  className="cursor-pointer bg-indigo-500 text-white rounded-full p-1 text-xs absolute -bottom-2 -right-2 shadow"
                  title="Change profile image"
                >
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                    <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M16.5 3.5h-9A4 4 0 0 0 3.5 7.5v9A4 4 0 0 0 7.5 20.5h9a4 4 0 0 0 4-4v-9a4 4 0 0 0-4-4Z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </label>
                {preview && (
                  <button
                    type="submit"
                    disabled={uploading}
                    className="block mt-2 px-2 py-1 rounded bg-indigo-500 text-white text-xs"
                  >
                    {uploading ? "Uploading..." : "Save Image"}
                  </button>
                )}
              </form>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
              Fan Profile
            </h1>
            <div className="text-slate-500 dark:text-slate-400 text-xs mt-1">
              {profile.firstName} {profile.lastName}
            </div>
          </div>
          {!edit && (
            <button
              onClick={() => setEdit(true)}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-semibold text-xs shadow hover:from-indigo-600 hover:to-pink-600 transition"
              aria-label="Edit Profile"
            >
              Edit Profile
            </button>
          )}
        </div>

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

        {!edit ? (
          <div className="space-y-5">
            <Section label="Name">
              {profile.firstName} {profile.lastName}
            </Section>
            <Section label="City">{profile.location?.city || "-"}</Section>
            <Section label="State">{profile.location?.state || "-"}</Section>
            <Section label="Country">{profile.location?.country || "USA"}</Section>
            <Section label="Favorite Genres">
              {profile.favoriteGenres?.length
                ? profile.favoriteGenres.join(", ")
                : "-"}
            </Section>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-slate-800 dark:text-slate-200 font-medium">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-slate-800 dark:text-slate-200 font-medium">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block mb-1 text-slate-800 dark:text-slate-200 font-medium">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block mb-1 text-slate-800 dark:text-slate-200 font-medium">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block mb-1 text-slate-800 dark:text-slate-200 font-medium">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block mb-2 text-slate-800 dark:text-slate-200 font-medium">
                Favorite Genres
              </label>
              <div className="flex flex-wrap gap-2">
                {GENRE_OPTIONS.map((genre) => (
                  <label
                    key={genre}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full cursor-pointer border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200"
                  >
                    <input
                      type="checkbox"
                      className="h-3 w-3 rounded border-slate-500 text-indigo-500 focus:ring-indigo-500 cursor-pointer"
                      checked={form.favoriteGenres.includes(genre)}
                      onChange={() => handleGenreToggle(genre)}
                    />
                    <span>{genre}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-pink-500 text-white text-xs font-semibold shadow-md hover:shadow-lg hover:from-indigo-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-70"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEdit(false);
                  setForm({
                    firstName: profile.firstName || "",
                    lastName: profile.lastName || "",
                    city: profile.location?.city || "",
                    state: profile.location?.state || "",
                    country: profile.location?.country || "USA",
                    favoriteGenres: profile.favoriteGenres || [],
                  });
                  setError("");
                  setSuccess("");
                }}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-gray-200 text-xs font-semibold shadow hover:bg-gray-300 dark:hover:bg-slate-700 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// Section component for clean display
function Section({ label, children }) {
  return (
    <div>
      <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase mb-1 tracking-wide">
        {label}
      </div>
      <div className="text-base text-slate-800 dark:text-slate-100">{children}</div>
    </div>
  );
}

export default FanProfile;