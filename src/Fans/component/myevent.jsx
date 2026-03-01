import { useEffect, useState } from "react";
import axios from "axios";

const MyEvent = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

    const DetailCard = ({ label, value }) => (
    <div className="bg-gray-50 dark:bg-slate-800 p-5 rounded-xl shadow-sm">
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
        {label}
      </p>
      <p className="font-semibold text-gray-800 dark:text-gray-200 break-words">
        {value || "N/A"}
      </p>
    </div>
  );

  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          "http://localhost:5000/api/fan/my-events",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setEvents(res.data || []);
      } catch (err) {
        console.error("Error fetching my events:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyEvents();
  }, []);

  // ✅ Safe date formatter
  const formatDateTime = (date) => {
    if (!date) return "Date not available";

    const parsed = new Date(date);
    if (isNaN(parsed)) return "Invalid date";

    return parsed.toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div>
    {/* Event Modal */}
{selectedEvent && (
  <div
    onClick={() => setSelectedEvent(null)}
    className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh] relative"
    >
      {/* Close Button */}
      <button
        onClick={() => setSelectedEvent(null)}
        className="absolute top-4 right-4 bg-white/80 dark:bg-slate-800 p-2 rounded-full shadow hover:scale-110 transition"
      >
        ✕
      </button>

      {/* Poster */}
      {selectedEvent.poster && (
        <img
          src={selectedEvent.poster}
          alt={selectedEvent.title}
          className="w-full h-80 object-cover rounded-t-3xl"
        />
      )}

      <div className="p-8 space-y-8">
        {/* Title & Date */}
        <div>
          <h2 className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">
            {selectedEvent.title}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {formatDateTime(selectedEvent.startDateTime)}
          </p>
        </div>

        {/* Status Badge */}
        <div>
          <span
            className={`text-xs px-4 py-1 rounded-full font-medium ${
              selectedEvent.status === "upcoming"
                ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                : selectedEvent.status === "completed"
                ? "bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                : selectedEvent.status === "cancelled"
                ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
                : "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300"
            }`}
          >
            {selectedEvent.status}
          </span>
        </div>

        {/* Description */}
        <div>
          <h3 className="font-semibold text-lg mb-2 text-gray-800 dark:text-gray-200">
            Description
          </h3>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {selectedEvent.description}
          </p>
        </div>

        {/* Event Details Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <DetailCard label="Event ID" value={selectedEvent._id} />
          <DetailCard label="Artist ID" value={selectedEvent.artist} />
          <DetailCard label="Venue ID" value={selectedEvent.venue} />
          <DetailCard label="Category" value={selectedEvent.category} />
          <DetailCard
            label="Max Participants"
            value={selectedEvent.maxParticipants}
          />
          <DetailCard
            label="Total Participants"
            value={selectedEvent.totalParticipants}
          />
          <DetailCard label="Views" value={selectedEvent.views} />
        </div>

        {/* Extra Images (if available) */}
        {selectedEvent.images && selectedEvent.images.length > 0 && (
          <div>
            <h3 className="font-semibold text-lg mb-4 text-gray-800 dark:text-gray-200">
              Event Gallery
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {selectedEvent.images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`event-img-${index}`}
                  className="rounded-xl object-cover h-40 w-full"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
)}
       <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-900 py-10 px-4 flex items-center justify-center">

      <div className="w-full max-w-5xl mx-auto space-y-10">

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-pink-600 text-white p-8 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              My Events
            </h1>
            <p className="text-sm opacity-90 mt-1">
              All events you have joined are listed below.
            </p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-10">
            <p className="text-gray-200 text-lg">
              Loading your events...
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && events.length === 0 && (
          <div className="bg-white/90 dark:bg-slate-900/90 border border-indigo-100 dark:border-slate-800 p-8 rounded-2xl shadow text-center text-gray-500 dark:text-gray-300">
            You haven’t joined any events yet.
          </div>
        )}

        {/* Event Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          <div
  key={event._id}
  onClick={() => setSelectedEvent(event)}
  className="cursor-pointer bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-md hover:shadow-xl transition flex flex-col"
>
          {events.map(event => (
            <div
              key={event._id}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-md hover:shadow-xl transition flex flex-col"
            >
              <h3 className="text-lg font-semibold mb-2 text-indigo-700 dark:text-indigo-300">
                {event.title}
              </h3>

              <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                {formatDateTime(event.startDateTime)}
              </p>

              {event.category && (
                <span className="inline-block bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 text-xs px-3 py-1 rounded-full mb-3">
                  {event.category}
                </span>
              )}

              {event.status && (
                <div className="mb-3">
                  <span className={`text-xs px-3 py-1 rounded-full ${
                    event.status === "upcoming"
                      ? "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300"
                      : event.status === "completed"
                      ? "bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                      : "bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300"
                  }`}>
                    {event.status}
                  </span>
                </div>
              )}

              <div className="text-sm text-gray-500 dark:text-gray-400">
                {event.location?.city}
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default MyEvent;