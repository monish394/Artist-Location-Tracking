import Fan from "../model/Fan.js";
import Participant from "../model/Participant.js";
import Event from "../model/Event.js";

import multer from "multer";
import { storage } from "../../cloudinary.js"; 

const upload = multer({ storage });

const fanCtrl = {};

// ==============================
// ✅ DASHBOARD
// ==============================
fanCtrl.dashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const fan = await Fan.findOne({ user: userId });

    if (!fan) {
      return res.status(404).json({
        message: "Fan profile not found",
      });
    }

    const now = new Date();

    // ✅ Upcoming Joined Events
    const participants = await Participant.find({
      fan: fan._id,
      status: { $ne: "cancelled" },
    }).populate({
      path: "event",
      match: { startDate: { $gte: now } },
      populate: { path: "artist", select: "artistName" },
    });

    const upcomingEvents = participants
      .filter(p => p.event)
      .map(p => p.event);

    // ✅ Recommended Events (same city)
    const recommendedEvents = await Event.find({
      "location.city": fan.location?.city,
      startDate: { $gte: now },
    })
      .limit(10)
      .populate("artist", "artistName");

    res.json({
      fan: {
        firstName: fan.firstName,
        lastName: fan.lastName,
        city: fan.location?.city,
      },
      stats: {
        eventsRegistered: fan.eventsRegistered || 0,
        eventsAttended: fan.eventsAttended || 0,
        followingArtists: fan.followingArtists?.length || 0,
      },
      upcomingEvents,
      recommendedEvents,
    });

  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ==============================
// ✅ MY EVENTS
// ==============================
fanCtrl.getMyEvents = async (req, res) => {
  try {
    const fan = await Fan.findOne({ user: req.user.id });

    if (!fan) {
      return res.status(404).json({
        message: "Fan not found",
      });
    }

    const participants = await Participant.find({
      fan: fan._id,
      status: { $ne: "cancelled" },
    }).populate({
      path: "event",
      populate: { path: "artist", select: "artistName" },
    });

    const events = participants.map(p => p.event);

    res.json(events);

  } catch (error) {
    console.error("My Events error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ==============================
// ✅ GET PROFILE
// ==============================
fanCtrl.getProfile = async (req, res) => {
  try {
    const fan = await Fan.findOne({ user: req.user.id });

    if (!fan) {
      return res.status(404).json({
        message: "Profile not found",
      });
    }

    res.json(fan);

  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ==============================
// ✅ UPDATE PROFILE
// ==============================
fanCtrl.updateProfile = async (req, res) => {
  try {
    const updatedFan = await Fan.findOneAndUpdate(
      { user: req.user.id },
      req.body,
      { returnDocument: "after" }
    );
    res.json(updatedFan);
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Update failed" });
  }
};


fanCtrl.uploadProfileImage = [
  upload.single("image"),
  async (req, res) => {
    try {
      console.log("User ID:", req.user.id);
      console.log("File path:", req.file?.path);

      if (!req.file || !req.file.path) {
        return res.status(400).json({ msg: "No image uploaded" });
      }
      const fan = await Fan.findOneAndUpdate(
        { user: req.user.id },
        { profileImage: req.file.path },
        { returnDocument: "after" }
      );
      console.log("Updated fan:", fan);

      if (!fan) return res.status(404).json({ msg: "Fan not found" });
      res.json({ url: req.file.path });
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ msg: "Failed to upload image" });
    }
  }
];
export default fanCtrl;