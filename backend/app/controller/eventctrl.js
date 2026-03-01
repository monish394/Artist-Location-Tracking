// import Event from "../models/Event.js";
import Event from "../model/Event.js"
// import Fan from "../model/Fan.js";
import Fan from "../model/Fan.js";
import Participant from "../model/Participant.js";

const eventctrl={}

// ✅ GET ALL EVENTS (For Fan Browse)
eventctrl.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate("artist")
      .sort({ startDate: 1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ GET SINGLE EVENT (For Event Detail Page)
eventctrl.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId)
      .populate("artist");

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};



eventctrl.joinEvent = async (req, res) => {
  try {
    const eventId = req.params.eventId;

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.id;

    const fan = await Fan.findOne({ user: userId });
    if (!fan) {
      return res.status(404).json({ message: "Fan profile not found" });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const alreadyJoined = await Participant.findOne({
      event: eventId,
      fan: fan._id,
    });

    if (alreadyJoined) {
      return res.status(400).json({ message: "Already joined this event" });
    }

    await Participant.create({
      event: eventId,
      fan: fan._id,
      status: "registered",
    });

    await Event.findByIdAndUpdate(eventId, {
      $inc: { totalParticipants: 1 },
    });

    await Fan.findByIdAndUpdate(fan._id, {
      $inc: { eventsRegistered: 1 },
    });

    res.status(200).json({ message: "Joined successfully" });

  } catch (error) {
    console.error("JOIN EVENT ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};



export default eventctrl