import { useEffect, useState } from "react";
import axios from "axios";
import EventModal from "./eventmodel";

const FanEvents = () => {
  const [allEvents, setAllEvents] = useState([]);
  const [joinedEventIds, setJoinedEventIds] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(9); // 3x3 grid

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");

      // Fetch all events
      const eventsRes = await axios.get(
        "http://localhost:5000/api/events"
      );

      // Fetch joined events
      const joinedRes = await axios.get(
        "http://localhost:5000/api/fan/my-events",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const joinedIds = joinedRes.data.map(e => e._id);

      setAllEvents(eventsRes.data || []);
      setJoinedEventIds(joinedIds);

    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  };

  // Show only events that are not joined and are "upcoming"
  const availableEvents = allEvents.filter(
    event => !joinedEventIds.includes(event._id) && event.status === "upcoming"
  );

  // Pagination logic
  const totalPages = Math.ceil(availableEvents.length / rowsPerPage);
  const paginatedEvents = availableEvents.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handlePageChange = (page) => setCurrentPage(page);

  // Add event to joined list after joining
  const handleEventJoined = (eventId) => {
    setJoinedEventIds([...joinedEventIds, eventId]);
    setSelectedEvent(null);
  };

  const formatDate = (date) => {
    if (!date) return "Date not available";
    const parsed = new Date(date);
    if (isNaN(parsed)) return "Invalid date";
    return parsed.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (date) => {
    if (!date) return "";
    const parsed = new Date(date);
    if (isNaN(parsed)) return "";
    return parsed.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-900 py-10 px-4 flex items-center justify-center">
      <div className="w-full max-w-6xl mx-auto space-y-10">

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-pink-600 text-white p-8 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Browse Events
            </h1>
            <p className="text-sm opacity-90 mt-1">
              Discover and join upcoming events.
            </p>
          </div>
        </div>

        {/* Loading / Empty State */}
        {loading && (
          <div className="flex justify-center py-10">
            <p className="text-gray-200 text-lg">Loading events...</p>
          </div>
        )}

        {!loading && availableEvents.length === 0 && (
          <div className="flex justify-center py-10">
            <p className="text-gray-200 text-lg">
              No upcoming events available.
            </p>
          </div>
        )}

        {/* Events Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {paginatedEvents.map(event => (
            <div
              key={event._id}
              className="bg-white/90 dark:bg-slate-900/90 border border-indigo-100 dark:border-slate-800 rounded-2xl shadow-lg hover:shadow-2xl transition p-6 flex flex-col"
            >
              <h3 className="font-semibold text-lg mb-2 text-indigo-700 dark:text-indigo-300">
                {event.title || "Untitled Event"}
              </h3>

              <div className="mb-2">
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {formatDate(event.startDateTime)}
                </p>
                <p className="text-gray-400 dark:text-gray-400 text-xs">
                  {formatTime(event.startDateTime)}
                </p>
              </div>

              <div className="flex-1" />

              <button
                onClick={() => setSelectedEvent(event)}
                className="mt-4 bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 transition text-white px-4 py-2 rounded-lg text-sm font-semibold shadow"
              >
                View Details
              </button>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        {availableEvents.length > 0 && (
          <div className="flex items-center justify-between mt-8">
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
                {[3, 6, 9, 12, 18].map(n => (
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
        )}

        {/* Modal */}
        {selectedEvent && (
          <EventModal
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
            onJoined={handleEventJoined}
          />
        )}
      </div>
    </div>
  );
};

export default FanEvents;