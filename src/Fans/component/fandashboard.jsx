import { useEffect, useState } from "react";
import axios from "axios";

const FanDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:5000/api/fan/dashboard",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setData(res.data);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-900">
        <p className="text-gray-200 text-lg">Loading dashboard...</p>
      </div>
    );

  if (!data)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-900">
        <p className="text-gray-200 text-lg">Unable to load dashboard.</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-900 py-10 px-4 flex items-center justify-center">
      <div className="w-full max-w-5xl space-y-10">

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome, {data.fan.firstName} 👋
            </h1>
            <p className="text-sm opacity-90 mt-1">
              Here’s a quick overview of your activity.
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <span className="inline-block bg-white/10 px-4 py-2 rounded-full text-xs font-semibold tracking-wide border border-white/20">
              Fan Dashboard
            </span>
          </div>
        </div>

        {/* Import Details Section */}
        <div className="bg-white/90 dark:bg-slate-900/90 border border-indigo-100 dark:border-slate-800 rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-indigo-700 dark:text-indigo-300 mb-2">
            Important Details
          </h2>
          <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 text-sm space-y-1">
            <li>Stay updated with your favorite artists and events.</li>
            <li>Check your registration and attendance stats below.</li>
            <li>Follow more artists to get personalized recommendations.</li>
            <li>Contact support if you have any issues with your account.</li>
          </ul>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6">
          <StatCard
            title="Registered"
            value={data.stats.eventsRegistered}
            color="text-indigo-600"
          />
          <StatCard
            title="Attended"
            value={data.stats.eventsAttended}
            color="text-green-600"
          />
          <StatCard
            title="Following"
            value={data.stats.followingArtists}
            color="text-pink-600"
          />
          <StatCard
            title="Participants"
            value={data.stats.totalParticipants}
            color="text-orange-600"
          />
        </div>
      </div>
    </div>
  );
};

/* ============================= */

const StatCard = ({ title, value, color }) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-md hover:shadow-xl transition">
    <h3 className={`text-3xl font-bold ${color}`}>
      {value || 0}
    </h3>
    <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
      {title}
    </p>
  </div>
);

export default FanDashboard;