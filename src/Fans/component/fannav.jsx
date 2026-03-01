import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";

const FanNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [fan, setFan] = useState(null);
  const [activeTab, setActiveTab] = useState("");

  const navItems = [
    { id: "dashboard", label: "Dashboard", path: "/fan/dashboard" },
    { id: "events", label: "Browse Events", path: "/fan/events" },
    { id: "my-events", label: "My Events", path: "/fan/my-events" },
    { id: "map", label: "Map View", path: "/fan/map" },

    { id: "profile", label: "Profile", path: "/fan/profile" },
  ];

  // ✅ Fetch fan profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get(
          "http://localhost:5000/api/users/profile",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setFan(res.data.user);
      } catch (err) {
        console.log("Error fetching fan profile:", err.response?.data || err.message);
      }
    };

    fetchProfile();
  }, []);

  // ✅ Detect active tab
  useEffect(() => {
    const currentTab = navItems.find(item =>
      location.pathname.startsWith(item.path)
    );
    setActiveTab(currentTab ? currentTab.id : "dashboard");
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-gradient-to-r from-slate-950/95 via-slate-900/95 to-slate-950/95 backdrop-blur shadow-lg shadow-slate-950/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">

        {/* ✅ Brand */}
        <Link
          to="/fan/dashboard"
          className="flex items-center gap-2 text-slate-100 font-semibold tracking-tight"
        >
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 text-white shadow-lg shadow-indigo-500/30">
            🎵
          </span>
          <span className="hidden sm:inline text-sm sm:text-base">
            Fan Panel
          </span>
        </Link>

        {/* ✅ Center Navigation */}
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 sm:gap-5 text-xs sm:text-sm bg-slate-900/70 border border-slate-800 rounded-full px-3 sm:px-4 py-1.5 shadow-inner shadow-slate-950/60">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;

              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => setActiveTab(item.id)}
                  className={[
                    "relative px-2 sm:px-3 py-1 rounded-full transition-colors whitespace-nowrap",
                    isActive
                      ? "text-white bg-slate-800 shadow shadow-slate-950/40"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/70",
                  ].join(" ")}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-gradient-to-r from-indigo-400 to-pink-400" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* ✅ Right side: fan info + logout */}
        <div className="flex items-center gap-3">
          {fan && (
            <div className="hidden sm:flex flex-col items-end max-w-[180px]">
              <span className="text-xs text-slate-300 truncate">
                {fan.email}
              </span>
              {fan.role && (
                <span className="mt-0.5 inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-emerald-300 uppercase tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {fan.role}
                </span>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1.5 text-xs sm:text-sm text-slate-200 hover:text-white hover:border-slate-500 hover:bg-slate-800 transition-colors shadow-md shadow-slate-950/40"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 17l5-5-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M15 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Logout</span>
          </button>
        </div>

      </div>
    </header>
  );
};

export default FanNavbar;