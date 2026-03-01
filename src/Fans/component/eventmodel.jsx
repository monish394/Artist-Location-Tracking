import { useState } from "react";
import axios from "axios";

const EventModal = ({ event, onClose, onJoined }) => {
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    const token = localStorage.getItem("token");

    try {
      setLoading(true);

      await axios.post(
        `http://localhost:5000/api/events/${event._id}/join`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setJoined(true);

      // ✅ Wait 1 second then remove from list
      setTimeout(() => {
        onJoined(event._id);
      }, 1000);

    } catch (err) {
      console.error(err);
      alert("Unable to join event");
    } finally {
      setLoading(false);
    }
  };

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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl relative">

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
        >
          ✕
        </button>

        {event.poster && (
          <img
            src={event.poster}
            className="w-full h-70 object-cover rounded-xl mb-4"
          />
        )}

        <h2 className="text-2xl font-bold mb-2">
          {event.title}
        </h2>

        {event.category && (
          <span className="inline-block bg-indigo-100 text-indigo-600 text-xs px-3 py-1 rounded-full mb-3">
            {event.category}
          </span>
        )}

        <p className="text-gray-600 mb-4">
          {event.description}
        </p>

        <div className="text-sm text-gray-700 mb-2">
          <strong>Date:</strong> {formatDateTime(event.startDateTime)}
        </div>

        {event.location?.venueName && (
          <div className="text-sm text-gray-700 mb-2">
            <strong>Venue:</strong> {event.location.venueName}
          </div>
        )}

        {event.location?.city && (
          <div className="text-sm text-gray-700 mb-2">
            <strong>City:</strong> {event.location.city}
          </div>
        )}

        <div className="text-sm text-gray-700 mb-2">
          <strong>Capacity:</strong>{" "}
          {event.totalParticipants || 0} / {event.maxParticipants}
        </div>

        <div className="mb-4">
          <span className={`text-xs px-3 py-1 rounded-full ${
            event.status === "upcoming"
              ? "bg-green-100 text-green-600"
              : event.status === "completed"
              ? "bg-gray-200 text-gray-600"
              : "bg-yellow-100 text-yellow-600"
          }`}>
            {event.status}
          </span>
        </div>

        {joined ? (
          <button
            disabled
            className="w-full bg-gray-400 text-white px-4 py-2 rounded-lg"
          >
            Joined ✅ (Removing...)
          </button>
        ) : (
          <button
            onClick={handleJoin}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 transition text-white px-4 py-2 rounded-lg"
          >
            {loading ? "Joining..." : "Join Event"}
          </button>
        )}
      </div>
    </div>
  );
};

export default EventModal;