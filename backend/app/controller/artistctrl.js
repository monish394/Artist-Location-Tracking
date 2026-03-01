// src/controllers/artistCtrl.js
import Artist from "../model/Artist.js";
import Event from "../model/Event.js";
import Participant from "../model/Participant.js";
import Venue from "../model/Venue.js";

const artistCtrl = {};

// Helper: get current artist document from logged in user (req.user.id)
const getArtistForUser = async (userId) => {
  const artist = await Artist.findOne({ user: userId });
  return artist;
};

// ========== ARTIST DASHBOARD ==========
// ========== ARTIST DASHBOARD ==========
artistCtrl.getDashboard = async (req, res) => {
  try {
    const userId = req.user?.id;
    const artist = await getArtistForUser(userId);
    if (!artist) {
      return res.status(404).json({ msg: "Artist profile not found" });
    }

    const artistId = artist._id;
    const now = new Date();

    // Count totals using date logic
    const [totalEvents, upcomingEvents, pastEvents, totalParticipants] =
      await Promise.all([
        // All events for this artist
        Event.countDocuments({ artist: artistId }),

        // Upcoming = startDateTime in the future, and not cancelled
        Event.countDocuments({
          artist: artistId,
          startDateTime: { $gte: now },
          status: { $ne: "cancelled" },
        }),

        // Past = startDateTime in the past, and not cancelled
        Event.countDocuments({
          artist: artistId,
          startDateTime: { $lt: now },
          status: { $ne: "cancelled" },
        }),

        // Total participants across all this artist's events
        Participant.countDocuments({
          event: { $in: await Event.find({ artist: artistId }).distinct("_id") },
        }),
      ]);

    const recentEvents = await Event.find({ artist: artistId })
      .sort({ startDateTime: 1 })
      .limit(5)
      .populate("venue", "name address.city");

    const recentEventsMapped = recentEvents.map((ev) => ({
      id: ev._id,
      title: ev.title,
      venueName: ev.venue?.name || "Unknown Venue",
      city: ev.venue?.address?.city || "",
      startDateTime: ev.startDateTime,
      status: ev.status,
      category: ev.category,
    }));

    return res.json({
      artist: {
        id: artist._id,
        artistName: artist.artistName,
        stageName: artist.stageName,
        totalEvents: artist.totalEvents,
        totalFollowers: artist.totalFollowers,
      },
      stats: {
        totalEvents,
        upcomingEvents,
        pastEvents,
        totalParticipants,
      },
      recentEvents: recentEventsMapped,
    });
  } catch (err) {
    console.error("Artist dashboard error:", err);
    return res
      .status(500)
      .json({ msg: "Server error loading artist dashboard" });
  }
};

// ========== MY EVENTS: LIST ==========
artistCtrl.getMyEvents = async (req, res) => {
  try {
    const userId = req.user?.id;
    const artist = await getArtistForUser(userId);
    if (!artist) {
      return res.status(404).json({ msg: "Artist profile not found" });
    }

    const events = await Event.find({ artist: artist._id })
      .sort({ startDateTime: 1 })
      .populate("venue", "name address.city");

    return res.json({ events });
  } catch (err) {
    console.error("Get artist events error:", err);
    return res
      .status(500)
      .json({ msg: "Server error fetching artist events" });
  }
};

// ========== CREATE EVENT ==========
// ========== CREATE EVENT (date + time separated) ==========
// src/controllers/artistCtrl.js


// ========== CREATE EVENT ==========

// ========== CREATE EVENT ==========
// ========== CREATE EVENT ==========
// ========== CREATE EVENT ==========
artistCtrl.createEvent = async (req, res) => {
  try {
    const userId = req.user?.id;

    // 1️⃣ Verify artist profile exists
    const artist = await getArtistForUser(userId);
    if (!artist) {
      return res.status(404).json({ msg: "Artist profile not found" });
    }

    const {
      venueId,        // some frontend may send this
      venue,          // some frontend may send this instead
      title,
      description,
      date,           // "YYYY-MM-DD"
      time,           // "HH:mm"
      endDateTime,    // optional full datetime string
      category,
      maxParticipants,
      poster,
      images,
    } = req.body;

    // 👇 Accept either venueId or venue
    const finalVenueId = venueId || venue;

    // Debug (you can keep this while testing):
    console.log("createEvent body:", req.body);
    console.log("finalVenueId:", finalVenueId);

    // 2️⃣ Validate required fields
    if (!finalVenueId) {
      return res.status(400).json({ msg: "Venue is required" });
    }
    if (!title || !date || !time) {
      return res
        .status(400)
        .json({ msg: "Title, date, and time are required" });
    }

    // 3️⃣ Verify venue exists and is active
    const venueDoc = await Venue.findOne({ _id: finalVenueId, isActive: true });
    if (!venueDoc) {
      return res
        .status(400)
        .json({ msg: "Selected venue is invalid or inactive" });
    }

    // 4️⃣ Combine date + time into startDateTime
    const startDateTime = new Date(`${date}T${time}`);
    if (isNaN(startDateTime.getTime())) {
      return res.status(400).json({ msg: "Invalid date or time format" });
    }

    let end = undefined;
    if (endDateTime) {
      end = new Date(endDateTime);
      if (isNaN(end.getTime()) || end <= startDateTime) {
        return res
          .status(400)
          .json({ msg: "Invalid endDateTime: must be after start date/time" });
      }
    }

    // 4.5️⃣ Determine status based on startDateTime
    const now = new Date();
    let status = "upcoming";
    if (startDateTime < now) {
      status = "completed";
    }

    // 4.6️⃣ Set poster based on artist ID
    let eventPoster = poster; // default to whatever was sent
    if (String(artist._id) === "699ae341ae3b2d1863a38a05") {
      eventPoster = "https://res.cloudinary.com/dnb2n8wup/image/upload/v1771759472/Anirudh_Ravichander_at_Audi_Ritz_Style_Awards_2017__28cropped_29_o26phc.jpg";
    } else if (String(artist._id) === "699ae8ff739b72b23df8f586") {
      eventPoster = "https://res.cloudinary.com/dnb2n8wup/image/upload/v1771759958/9yxiDNYe_400x400_zf4bg8.jpg";
    }

    // 5️⃣ Create the event
    const newEvent = new Event({
      artist: artist._id,
      venue: venueDoc._id,
      title: title.trim(),
      description: description?.trim() || "",
      startDateTime,
      endDateTime: end,
      category: category || "Concert",
      maxParticipants:
        maxParticipants != null ? Number(maxParticipants) : undefined,
      poster: eventPoster || undefined, // <-- use eventPoster here
      images: images || [],
      status,
    });

    await newEvent.save();

    // 6️⃣ Update stats for artist and venue
    await Artist.findByIdAndUpdate(artist._id, { $inc: { totalEvents: 1 } });
    await Venue.findByIdAndUpdate(venueDoc._id, { $inc: { totalEvents: 1 } });

    // 7️⃣ Return success response
    return res.status(201).json({
      msg: "Event created successfully",
      event: newEvent,
    });
  } catch (err) {
    console.error("Create event error:", err);
    return res.status(500).json({ msg: "Server error creating event" });
  }
};

// export default artistCtrl;

// export default artistCtrl;

// ========== GET SINGLE EVENT (FOR EDIT) ==========
artistCtrl.getEventById = async (req, res) => {
  try {
    const userId = req.user?.id;
    const artist = await getArtistForUser(userId);
    if (!artist) {
      return res.status(404).json({ msg: "Artist profile not found" });
    }

    const { id } = req.params;
    const event = await Event.findOne({ _id: id, artist: artist._id }).populate(
      "venue",
      "name address.city"
    );

    if (!event) {
      return res.status(404).json({ msg: "Event not found" });
    }

    return res.json({ event });
  } catch (err) {
    console.error("Get event error:", err);
    return res.status(500).json({ msg: "Server error fetching event" });
  }
};

// ========== UPDATE EVENT ==========
artistCtrl.updateEvent = async (req, res) => {
  try {
    const userId = req.user?.id;
    const artist = await getArtistForUser(userId);
    if (!artist) {
      return res.status(404).json({ msg: "Artist profile not found" });
    }

    const { id } = req.params;
    const {
      venue,
      title,
      description,
      startDateTime,
      endDateTime,
      category,
      maxParticipants,
      poster,
      images,
      status,
    } = req.body;

    const event = await Event.findOne({ _id: id, artist: artist._id });
    if (!event) {
      return res.status(404).json({ msg: "Event not found" });
    }

    if (venue) {
      const venueDoc = await Venue.findOne({ _id: venue, isActive: true });
      if (!venueDoc) {
        return res
          .status(400)
          .json({ msg: "Selected venue is invalid or inactive" });
      }
      event.venue = venueDoc._id;
    }

    if (title !== undefined) event.title = title.trim();
    if (description !== undefined)
      event.description = description?.trim() || "";
    if (startDateTime !== undefined)
      event.startDateTime = new Date(startDateTime);
    if (endDateTime !== undefined)
      event.endDateTime = endDateTime ? new Date(endDateTime) : undefined;
    if (category !== undefined) event.category = category;
    if (maxParticipants !== undefined)
      event.maxParticipants =
        maxParticipants != null ? Number(maxParticipants) : undefined;
    if (poster !== undefined) event.poster = poster || undefined;
    if (images !== undefined) event.images = images || [];
    if (status !== undefined) event.status = status; // validate allowed statuses on frontend/backend

    await event.save();

    return res.json({
      msg: "Event updated successfully",
      event,
    });
  } catch (err) {
    console.error("Update event error:", err);
    return res.status(500).json({ msg: "Server error updating event" });
  }
};

// ========== DELETE/CANCEL EVENT (optional) ==========
artistCtrl.deleteEvent = async (req, res) => {
  try {
    const userId = req.user?.id;
    const artist = await getArtistForUser(userId);
    if (!artist) {
      return res.status(404).json({ msg: "Artist profile not found" });
    }

    const { id } = req.params;
    const event = await Event.findOneAndDelete({
      _id: id,
      artist: artist._id,
    });

    if (!event) {
      return res.status(404).json({ msg: "Event not found" });
    }

    // Optionally decrement stats on artist/venue
    await Artist.findByIdAndUpdate(artist._id, {
      $inc: { totalEvents: -1 },
    });
    await Venue.findByIdAndUpdate(event.venue, {
      $inc: { totalEvents: -1 },
    });

    return res.json({ msg: "Event deleted successfully" });
  } catch (err) {
    console.error("Delete event error:", err);
    return res.status(500).json({ msg: "Server error deleting event" });
  }
};

// ========== EVENT PARTICIPANTS ==========
artistCtrl.getEventParticipants = async (req, res) => {
  try {
    const userId = req.user?.id;
    const artist = await getArtistForUser(userId);
    if (!artist) {
      return res.status(404).json({ msg: "Artist profile not found" });
    }

    const { id } = req.params; // eventId
    const event = await Event.findOne({ _id: id, artist: artist._id });
    if (!event) {
      return res.status(404).json({ msg: "Event not found" });
    }

    const participants = await Participant.find({ event: event._id })
      .sort({ createdAt: -1 })
      .populate({
        path: "fan",
        select: "firstName lastName user",
        populate: { path: "user", select: "email" },
      });

    return res.json({ participants });
  } catch (err) {
    console.error("Get event participants error:", err);
    return res
      .status(500)
      .json({ msg: "Server error fetching event participants" });
  }
};
// src/controllers/artistCtrl.js
artistCtrl.updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    const artist = await Artist.findOne({ user: userId });
    if (!artist) {
      return res.status(404).json({ msg: "Artist profile not found" });
    }

    const { artistName, stageName, bio, genre, website, socialMedia, location } =
      req.body;

    if (artistName !== undefined) artist.artistName = artistName;
    if (stageName !== undefined) artist.stageName = stageName;
    if (bio !== undefined) artist.bio = bio;
    if (Array.isArray(genre)) artist.genre = genre;
    if (website !== undefined) artist.website = website;

    if (socialMedia) {
      artist.socialMedia = {
        ...artist.socialMedia.toObject(),
        ...socialMedia,
      };
    }

    if (location) {
      artist.location = {
        ...artist.location.toObject(),
        ...location,
      };
    }

    await artist.save();

    return res.json({ msg: "Artist profile updated", artist });
  } catch (err) {
    console.error("Update artist profile error:", err);
    return res.status(500).json({ msg: "Server error updating profile" });
  }
};

export default artistCtrl;