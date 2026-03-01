// src/controllers/adminCtrl.js
import axios from "axios";
import User from "../model/User.js";
import Artist from "../model/Artist.js";
import Fan from "../model/Fan.js";
import Event from "../model/Event.js";
import Participant from "../model/Participant.js";
import Venue from "../model/Venue.js";

const adminCtrl = {};

// ===== Helpers =====

// Build a readable address string based on venue name + city + state + country
const buildAddressString = (data = {}) => {
  const parts = [
    data.name,                        // venue name
    data.city,
    data.state,
    data.country || "India",          // default to India if missing
  ]
    .map((v) => (v ? v.toString().trim() : ""))
    .filter(Boolean);

  return parts.join(", ");
};

// Geocode using OpenStreetMap Nominatim (no API key) with fallback
const geocodeAddress = async (data) => {
  const query = buildAddressString(data);
  if (!query) throw new Error("Cannot geocode empty address");

  console.log("🗺 Geocoding query:", query);

  try {
    // 🔹 Build encoded URL like:
    // https://nominatim.openstreetmap.org/search?q=lalbagh%20Bangalore&format=json&limit=1
    const encodedQuery = encodeURIComponent(query);

    const url = `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&limit=1`;

    const { data: result } = await axios.get(url, {
      headers: {
        "User-Agent":
          "artist-performance-tracker/1.0 (your-email@example.com)",
      },
    });

    if (!Array.isArray(result) || result.length === 0) {
      throw new Error(`No results for "${query}"`);
    }

    const { lat, lon } = result[0];

    if (!lat || !lon) {
      throw new Error("Missing coordinates in geocoding response");
    }

    return {
      lat: parseFloat(lat),
      lng: parseFloat(lon),
    };

  } catch (err) {
    console.error(
      "❌ Nominatim geocoding error:",
      err.response?.data || err.message
    );

    /* ===============================
       FALLBACK LOGIC
    =============================== */

    if (data.city && data.city.toLowerCase().includes("bengaluru")) {
      console.warn(
        "Using fallback coordinates for Bengaluru (approx. Basavanagudi)"
      );
      return { lat: 12.9416, lng: 77.5670 };
    }

    console.warn("Using generic fallback coordinates (Bengaluru center)");
    return { lat: 12.9716, lng: 77.5946 };
  }
};

// ========== DASHBOARD ==========
adminCtrl.getAdminDashboard = async (req, res) => {
  try {
    const [
      totalUsers,
      totalArtists,
      totalFans,
      totalVenues,
      totalEvents,
      totalParticipants,
    ] = await Promise.all([
      User.countDocuments(),
      Artist.countDocuments(),
      Fan.countDocuments(),
      Venue.countDocuments({ isActive: true }),
      Event.countDocuments(),
      Participant.countDocuments(),
    ]);

    const eventsByStatusAgg = await Event.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const eventsByStatus = {};
    eventsByStatusAgg.forEach((row) => {
      eventsByStatus[row._id] = row.count;
    });

    const eventsByCategoryAgg = await Event.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);
    const eventsByCategory = {};
    eventsByCategoryAgg.forEach((row) => {
      eventsByCategory[row._id] = row.count;
    });

    const recentEventsRaw = await Event.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("artist", "artistName")
      .populate("venue", "name address.city");

    const recentEvents = recentEventsRaw.map((ev) => ({
      id: ev._id,
      title: ev.title,
      artistName: ev.artist?.artistName || "Unknown Artist",
      venueName: ev.venue?.name || "Unknown Venue",
      city: ev.venue?.address?.city || "",
      startDateTime: ev.startDateTime,
      status: ev.status,
      category: ev.category,
    }));

    return res.json({
      totals: {
        users: totalUsers,
        artists: totalArtists,
        fans: totalFans,
        venues: totalVenues,
        events: totalEvents,
        participants: totalParticipants,
      },
      eventsByStatus,
      eventsByCategory,
      recentEvents,
    });
  } catch (err) {
    console.error("Admin dashboard error:", err);
    return res
      .status(500)
      .json({ msg: "Server error loading admin dashboard" });
  }
};

// ========== VENUES: GET ALL ==========
adminCtrl.getVenues = async (req, res) => {
  try {
    const venues = await Venue.find({}).sort({
      "address.city": 1,
      name: 1,
    });
    return res.json({ venues });
  } catch (err) {
    console.error("Get venues error:", err);
    return res.status(500).json({ msg: "Server error fetching venues" });
  }
};

// ========== VENUES: CREATE (auto lat/lng via Nominatim) ==========
adminCtrl.createVenue = async (req, res) => {
  try {
    const {
      name,
      address,
      venueType,
      capacity,
      phone,
      email,
      website,
      amenities,
      description,
    } = req.body;

    if (!name || !address?.city || !address?.state) {
      return res
        .status(400)
        .json({ msg: "Name, city, and state are required" });
    }

    if (!venueType) {
      return res.status(400).json({ msg: "Venue type is required" });
    }

    // AUTO-GEOCODE based on venue name + city + state + country
    let coords;
    try {
      coords = await geocodeAddress({
        name,
        city: address.city,
        state: address.state,
        country: address.country || "India",
      });
    } catch (geoErr) {
      return res.status(400).json({ msg: geoErr.message });
    }

    const newVenue = new Venue({
      name: name.trim(),
      address: {
        street: address.street?.trim() || "",  // optional
        city: address.city.trim(),
        state: address.state.trim(),
        zipCode: address.zipCode?.trim(),
        country: address.country?.trim() || "India",
      },
      coordinates: {
        lat: coords.lat,
        lng: coords.lng,
      },
      venueType,
      capacity: capacity != null ? Number(capacity) : undefined,
      phone: phone?.trim() || undefined,
      email: email?.trim() || undefined,
      website: website?.trim() || undefined,
      amenities: amenities || [],
      description: description?.trim() || undefined,
      addedBy: req.user?.id,
    });

    await newVenue.save();

    return res.status(201).json({
      msg: "Venue created successfully",
      venue: newVenue,
    });
  } catch (err) {
    console.error("Create venue error:", err);

    if (err.code === 11000) {
      return res
        .status(400)
        .json({ msg: "A venue with this name already exists in this city" });
    }

    return res.status(500).json({ msg: "Server error creating venue" });
  }
};

// ========== VENUES: UPDATE (auto lat/lng if address or name changed) ==========
adminCtrl.updateVenue = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      address,
      venueType,
      capacity,
      phone,
      email,
      website,
      amenities,
      description,
      isActive,
    } = req.body;

    const update = {};
    let shouldGeocode = false;

    if (name !== undefined) {
      update.name = name.trim();
      shouldGeocode = true;
    }

    if (address) {
      update.address = {
        street: address.street?.trim() || "",
        city: address.city?.trim(),
        state: address.state?.trim(),
        zipCode: address.zipCode?.trim(),
        country: address.country?.trim() || "India",
      };
      shouldGeocode = true;
    }

    if (venueType !== undefined) {
      update.venueType = venueType;
    }

    if (capacity !== undefined) {
      update.capacity = capacity != null ? Number(capacity) : undefined;
    }

    if (phone !== undefined) {
      update.phone = phone?.trim() || undefined;
    }

    if (email !== undefined) {
      update.email = email?.trim() || undefined;
    }

    if (website !== undefined) {
      update.website = website?.trim() || undefined;
    }

    if (amenities !== undefined) {
      update.amenities = amenities;
    }

    if (description !== undefined) {
      update.description = description?.trim() || undefined;
    }

    if (isActive !== undefined) {
      update.isActive = Boolean(isActive);
    }

    // If name or address changed, re-geocode
    if (shouldGeocode) {
      try {
        const existing = await Venue.findById(id);
        if (!existing) {
          return res.status(404).json({ msg: "Venue not found" });
        }

        const queryData = {
          name: update.name || existing.name,
          city: update.address?.city || existing.address.city,
          state: update.address?.state || existing.address.state,
          country:
            update.address?.country ||
            existing.address.country ||
            "India",
        };

        const coords = await geocodeAddress(queryData);
        update.coordinates = { lat: coords.lat, lng: coords.lng };
      } catch (geoErr) {
        return res.status(400).json({ msg: geoErr.message });
      }
    }

    const updated = await Venue.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ msg: "Venue not found" });
    }

    return res.json({
      msg: "Venue updated successfully",
      venue: updated,
    });
  } catch (err) {
    console.error("Update venue error:", err);

    if (err.code === 11000) {
      return res
        .status(400)
        .json({ msg: "A venue with this name already exists in this city" });
    }

    return res.status(500).json({ msg: "Server error updating venue" });
  }
};

// ========== EVENTS: GET ALL (ADMIN GLOBAL VIEW) ==========
adminCtrl.getAdminEvents = async (req, res) => {
  try {
    const { status, category, artist, venue, from, to } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (category) {
      filter.category = category;
    }

    if (artist) {
      filter.artist = artist;
    }

    if (venue) {
      filter.venue = venue;
    }

    if (from || to) {
      filter.startDateTime = {};
      if (from) filter.startDateTime.$gte = new Date(from);
      if (to) filter.startDateTime.$lte = new Date(to);
    }

    const events = await Event.find(filter)
      .sort({ startDateTime: 1 })
      .populate("artist", "artistName")
      .populate("venue", "name address.city");

    return res.json({ events });
  } catch (err) {
    console.error("Get admin events error:", err);
    return res
      .status(500)
      .json({ msg: "Server error fetching events for admin" });
  }
};

// ========== USERS: GET ALL (ADMIN) ==========
adminCtrl.getUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select("-password")
      .sort({ createdAt: -1 });

    return res.json({ users });
  } catch (err) {
    console.error("Get users error:", err);
    return res.status(500).json({ msg: "Server error fetching users" });
  }
};

// ========== USERS: UPDATE (role / isActive) ==========
adminCtrl.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, isActive } = req.body;

    const update = {};
    if (role !== undefined) {
      update.role = role;
    }
    if (isActive !== undefined) {
      update.isActive = Boolean(isActive);
    }

    const updated = await User.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updated) {
      return res.status(404).json({ msg: "User not found" });
    }

    return res.json({
      msg: "User updated successfully",
      user: updated,
    });
  } catch (err) {
    console.error("Update user error:", err);
    return res.status(500).json({ msg: "Server error updating user" });
  }
};

// ========== PARTICIPANTS: GET ALL (ADMIN) ==========
adminCtrl.getParticipants = async (req, res) => {
  try {
    const { status, event, fan } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }
    if (event) {
      filter.event = event;
    }
    if (fan) {
      filter.fan = fan;
    }

    const participants = await Participant.find(filter)
      .sort({ createdAt: -1 })
      .populate({
        path: "event",
        select: "title startDateTime status",
        populate: [
          { path: "artist", select: "artistName" },
          { path: "venue", select: "name address.city" },
        ],
      })
      .populate({
        path: "fan",
        select: "firstName lastName user",
        populate: { path: "user", select: "email" },
      });

    return res.json({ participants });
  } catch (err) {
    console.error("Get participants error:", err);
    return res
      .status(500)
      .json({ msg: "Server error fetching participants" });
  }
};

export default adminCtrl;