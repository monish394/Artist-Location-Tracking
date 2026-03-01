// src/Artist/component/ArtistNavbar.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const ArtistNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  // Artist pages for navbar
  const navItems = [
    { id: "dashboard", label: "Dashboard", path: "/artist/home" },
    { id: "my-events", label: "My Events", path: "/artist/events" },
    { id: "create-event", label: "Create Event", path: "/artist/events/new" },
    { id: "profile", label: "Profile", path: "/artist/profile" },
    { id: "map", label: "Map View", path: "/artist/map" },
  ];

  // Fetch artist profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get("http://localhost:5000/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data.user);
      } catch (err) {
        console.error("Error fetching artist profile:", err.response?.data || err.message);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-gradient-to-r from-slate-950/95 via-slate-900/95 to-slate-950/95 backdrop-blur shadow-lg shadow-slate-950/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link
          to="/artist/home"
          className="flex items-center gap-2 text-slate-100 font-semibold tracking-tight"
        >
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 text-white shadow-lg shadow-indigo-500/30">
            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 19V6L21 3V16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="6" cy="19" r="3" stroke="currentColor" strokeWidth="2" />
              <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="2" />
            </svg>
          </span>
          <span className="hidden sm:inline text-sm sm:text-base">Artist Panel</span>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 sm:gap-5 text-xs sm:text-sm bg-slate-900/70 border border-slate-800 rounded-full px-3 sm:px-4 py-1.5 shadow-inner shadow-slate-950/60">
            {navItems.map((item) => {
              // FIX: Only exact path is active
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={[
                    "relative px-2 sm:px-3 py-1 rounded-full transition-colors whitespace-nowrap",
                    isActive
                      ? "text-white bg-slate-800 shadow shadow-slate-950/40"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/70",
                  ].join(" ")}
                >
                  <span className="relative">
                    {item.label}
                    {isActive && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-gradient-to-r from-indigo-400 to-pink-400" />
                    )}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User + Logout */}
        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end max-w-[170px]">
              <span className="text-xs text-slate-300 truncate">{user.email}</span>
              {user.role && (
                <span className="mt-0.5 inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 uppercase tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {user.role}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1.5 text-xs sm:text-sm text-slate-200 hover:text-white hover:border-slate-500 hover:bg-slate-800 transition-colors shadow-md shadow-slate-950/40"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M10 17l5-5-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default ArtistNavbar;