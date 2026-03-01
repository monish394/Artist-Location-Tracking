import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* ===============================
   Marker Icons
================================ */
const userIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const venueIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

/* ===============================
   Distance Calculator
================================ */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/* ===============================
   Auto Fit Bounds
================================ */
const FitBounds = ({ userPos, venuePos }) => {
  const map = useMap();

  useEffect(() => {
    if (userPos && venuePos) {
      const bounds = L.latLngBounds([userPos, venuePos]);
      map.fitBounds(bounds, { padding: [80, 80] });
    }
  }, [userPos, venuePos, map]);

  return null;
};

const FanMap = () => {
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentPos, setCurrentPos] = useState(null);
  const [distance, setDistance] = useState(null);
  const [showMap, setShowMap] = useState(false);

  /* ===============================
     Fetch ONLY Joined Events
  ================================= */
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
      }
    };

    fetchMyEvents();
  }, []);

  /* ===============================
     Fetch Venues
  ================================= */
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          "http://localhost:5000/api/admin/venues",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setVenues(res.data.venues || res.data);
      } catch (err) {
        console.error("Venue fetch error:", err);
      }
    };

    fetchVenues();
  }, []);

  /* ===============================
     Live Location Tracking
  ================================= */
  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setCurrentPos({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => console.error("Location error:", err),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  /* ===============================
     Resolve Venue for Selected Event
  ================================= */
  const venueId =
    selectedEvent?.venue?._id ||
    (typeof selectedEvent?.venue === "string"
      ? selectedEvent?.venue
      : null);

  const venueForEvent = useMemo(
    () => venues.find((v) => v._id === venueId),
    [venues, venueId]
  );

  let venueLatLng = null;

  if (venueForEvent?.coordinates) {
    const lat = parseFloat(venueForEvent.coordinates.lat);
    const lng = parseFloat(venueForEvent.coordinates.lng);
    if (!isNaN(lat) && !isNaN(lng)) {
      venueLatLng = [lat, lng];
    }
  }

  /* ===============================
     Calculate Distance
  ================================= */
  useEffect(() => {
    if (currentPos && venueLatLng) {
      const dist = calculateDistance(
        currentPos.lat,
        currentPos.lng,
        venueLatLng[0],
        venueLatLng[1]
      );
      setDistance(dist.toFixed(2));
    }
  }, [currentPos, venueLatLng]);

  const defaultCenter = currentPos
    ? [currentPos.lat, currentPos.lng]
    : venueLatLng || [0, 0];

  const formatDateTime = (dt) =>
    dt ? new Date(dt).toLocaleString() : "Not set";

  // Only show upcoming events
  const upcomingEvents = events.filter(event => event.status === "upcoming");

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-900 py-10 px-4 flex items-center justify-center">
      <div className="w-full max-w-4xl space-y-10">

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-pink-600 text-white p-8 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Event Route Planner</h2>
            <p className="text-sm opacity-90 mt-1">
              See your joined upcoming events and navigate to their venues.
            </p>
          </div>
        </div>

        {/* Event Cards */}
        <div>
          {upcomingEvents.length === 0 ? (
            <div className="bg-white/90 dark:bg-slate-900/90 border border-indigo-100 dark:border-slate-800 rounded-2xl shadow-lg p-6 text-center">
              <p className="text-gray-700 dark:text-gray-300">
                You haven't joined any upcoming events yet. Join events to see routes.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingEvents.map((event) => {
                const eventVenueId =
                  event.venue?._id ||
                  (typeof event.venue === "string" ? event.venue : null);

                const eventVenue = venues.find((v) => v._id === eventVenueId);

                const hasValidVenue =
                  eventVenue?.coordinates?.lat &&
                  eventVenue?.coordinates?.lng &&
                  !isNaN(parseFloat(eventVenue.coordinates.lat)) &&
                  !isNaN(parseFloat(eventVenue.coordinates.lng));

                return (
                  <div
                    key={event._id}
                    className="bg-slate-800/70 backdrop-blur-sm border border-slate-700 rounded-xl p-5 text-white shadow-lg"
                  >
                    <h3 className="text-lg font-semibold mb-2">
                      {event.title}
                    </h3>

                    <p className="text-xs text-slate-300 mb-1">
                      {formatDateTime(event.startDateTime)}
                    </p>

                    <p className="text-xs text-slate-400 mb-4">
                      {eventVenue?.name || "Unknown Venue"}
                    </p>

                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          setSelectedEvent(event);
                          setShowMap(true);
                        }}
                        disabled={!hasValidVenue}
                        className="px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-pink-500 text-white text-sm font-semibold shadow-md hover:from-indigo-600 hover:to-pink-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
                      >
                        {hasValidVenue ? "Start" : "No Venue"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Popup Map */}
      {showMap && selectedEvent && venueLatLng && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="relative w-[90%] md:w-[70%] h-[80vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">

            {distance && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-indigo-600 text-white px-4 py-2 rounded-full shadow-lg text-xs font-semibold">
                Distance to Venue: {distance} km
              </div>
            )}

            <button
              onClick={() => setShowMap(false)}
              className="absolute top-4 right-4 z-[1000] bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-lg text-xs shadow-md"
            >
              Close
            </button>

            <MapContainer
              center={defaultCenter}
              zoom={13}
              scrollWheelZoom
              className="w-full h-full"
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {currentPos && venueLatLng && (
                <FitBounds
                  userPos={[currentPos.lat, currentPos.lng]}
                  venuePos={venueLatLng}
                />
              )}

              {currentPos && (
                <>
                  <Marker
                    position={[currentPos.lat, currentPos.lng]}
                    icon={userIcon}
                  >
                    <Popup>Your Location</Popup>
                    <Tooltip permanent direction="top" offset={[0, -30]}>
                      You
                    </Tooltip>
                  </Marker>

                  <Polyline
                    positions={[
                      [currentPos.lat, currentPos.lng],
                      venueLatLng,
                    ]}
                    pathOptions={{ color: "#6366f1", weight: 4 }}
                  />
                </>
              )}

              <Marker position={venueLatLng} icon={venueIcon}>
                <Popup>{venueForEvent?.name}</Popup>
                <Tooltip permanent direction="top" offset={[0, -30]}>
                  {venueForEvent?.name}
                </Tooltip>
              </Marker>
            </MapContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default FanMap;