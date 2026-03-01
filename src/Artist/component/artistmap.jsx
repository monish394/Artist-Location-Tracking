// src/Artist/component/ArtistMapPage.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
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

// ========== Configuration ==========
const API_BASE_URL = "http://localhost:5000/api";

// ========== Marker Icons ==========
const artistIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const venueIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// ========== Utility Functions ==========
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in kilometers
  const toRad = (angle) => (angle * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const formatDateTime = (dateTime) => {
  if (!dateTime) return "Not set";
  return new Date(dateTime).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ========== Auto Fit Bounds Component ==========
const FitBounds = ({ artistPos, venuePos }) => {
  const map = useMap();

  useEffect(() => {
    if (artistPos && venuePos) {
      const bounds = L.latLngBounds([artistPos, venuePos]);
      map.fitBounds(bounds, { padding: [80, 80] });
    }
  }, [artistPos, venuePos, map]);

  return null;
};

// ========== Main Component ==========
const ArtistMapPage = () => {
  const [event, setEvent] = useState(null);
  const [venues, setVenues] = useState([]);
  const [currentPos, setCurrentPos] = useState(null);
  const [distance, setDistance] = useState(null);
  const [showMap, setShowMap] = useState(false);

  // ========== API Calls ==========
  const fetchEvents = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/artist/events`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const allEvents = response.data.events || [];
      if (!allEvents.length) return;

      const now = new Date();
      const sortedEvents = allEvents
        .filter((event) => event.startDateTime)
        .sort(
          (a, b) =>
            new Date(a.startDateTime) - new Date(b.startDateTime)
        );

      const nextEvent =
        sortedEvents.find((event) => new Date(event.startDateTime) >= now) ||
        sortedEvents[0];

      setEvent(nextEvent);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  }, []);

  const fetchVenues = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/admin/venues`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setVenues(response.data.venues || response.data || []);
    } catch (error) {
      console.error("Error fetching venues:", error);
    }
  }, []);

  // ========== Geolocation ==========
  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn("Geolocation is not supported by this browser");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setCurrentPos({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => console.error("Geolocation error:", error),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // ========== Initial Data Load ==========
  useEffect(() => {
    fetchEvents();
    fetchVenues();
  }, [fetchEvents, fetchVenues]);

  // ========== Venue Resolution ==========
  const venueId = useMemo(() => {
    if (!event?.venue) return null;
    return event.venue._id || (typeof event.venue === "string" ? event.venue : null);
  }, [event]);

  const venueForEvent = useMemo(
    () => venues.find((venue) => venue._id === venueId),
    [venues, venueId]
  );

  const venueLatLng = useMemo(() => {
    if (!venueForEvent?.coordinates) return null;

    const lat = parseFloat(venueForEvent.coordinates.lat);
    const lng = parseFloat(venueForEvent.coordinates.lng);

    return !isNaN(lat) && !isNaN(lng) ? [lat, lng] : null;
  }, [venueForEvent]);

  // ========== Distance Calculation ==========
  useEffect(() => {
    if (currentPos && venueLatLng) {
      const dist = calculateDistance(
        currentPos.lat,
        currentPos.lng,
        venueLatLng[0],
        venueLatLng[1]
      );
      setDistance(dist.toFixed(2));
    } else {
      setDistance(null);
    }
  }, [currentPos, venueLatLng]);

  // ========== Map Configuration ==========
  const defaultCenter = useMemo(
    () =>
      currentPos
        ? [currentPos.lat, currentPos.lng]
        : venueLatLng || [0, 0],
    [currentPos, venueLatLng]
  );

  // ========== Event Handlers ==========
  const handleOpenMap = useCallback(() => {
    if (venueLatLng) {
      setShowMap(true);
    }
  }, [venueLatLng]);

  const handleCloseMap = useCallback(() => {
    setShowMap(false);
  }, []);

  // ========== Render ==========
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Event Card Section */}
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            Event Route Planner
          </h2>

          {!event ? (
            <p className="text-sm text-gray-700 dark:text-gray-300">
              You don't have any events yet.
            </p>
          ) : (
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-slate-100 shadow-md transition-all duration-300 hover:shadow-lg">
              <h3 className="text-lg font-semibold mb-1">{event.title}</h3>

              <p className="text-xs text-slate-300 mb-1">
                {formatDateTime(event.startDateTime)}
              </p>

              <p className="text-xs text-slate-300 mb-3">
                {venueForEvent?.name || "Unknown Venue"}
              </p>

              <div className="flex justify-end">
                <button
                  onClick={handleOpenMap}
                  disabled={!venueLatLng}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-pink-500 text-white text-xs font-semibold shadow-md hover:from-indigo-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Start Navigation
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* All Venues List */}
      <div className="w-full max-w-4xl mt-8 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
            All Venues
          </h2>
          {venues.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No venues found.</p>
          ) : (
            <ul className="divide-y divide-slate-200 dark:divide-slate-800">
              {venues.map((venue) => (
                <li key={venue._id} className="py-2">
                  <span className="font-semibold">{venue.name}</span>
                  {venue.location?.city && (
                    <span className="ml-2 text-sm text-slate-500 dark:text-slate-400">
                      ({venue.location.city})
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Map Modal */}
      {showMap && event && venueLatLng && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="relative w-[90%] md:w-[70%] h-[80vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
            
            {/* Distance Badge */}
            {distance && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-gradient-to-r from-indigo-600 to-pink-600 text-white px-4 py-2 rounded-full shadow-lg text-xs font-semibold">
                Distance to Venue: {distance} km
              </div>
            )}

            {/* Close Button */}
            <button
              onClick={handleCloseMap}
              className="absolute top-4 right-4 z-[1000] bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-lg text-xs shadow-md transition-colors duration-200"
              aria-label="Close map"
            >
              Close
            </button>

            {/* Map Container */}
            <MapContainer
              center={defaultCenter}
              zoom={13}
              scrollWheelZoom
              className="w-full h-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {currentPos && venueLatLng && (
                <FitBounds
                  artistPos={[currentPos.lat, currentPos.lng]}
                  venuePos={venueLatLng}
                />
              )}

              {/* Artist Marker & Route */}
              {currentPos && (
                <>
                  <Marker
                    position={[currentPos.lat, currentPos.lng]}
                    icon={artistIcon}
                  >
                    <Popup>Your Current Location</Popup>
                    <Tooltip permanent direction="top" offset={[0, -30]}>
                      You
                    </Tooltip>
                  </Marker>

                  <Polyline
                    positions={[
                      [currentPos.lat, currentPos.lng],
                      venueLatLng,
                    ]}
                    pathOptions={{ color: "#6366f1", weight: 4, opacity: 0.7 }}
                  />
                </>
              )}

              {/* Venue Marker */}
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

export default ArtistMapPage;