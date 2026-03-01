import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    // WHO - Artist creating the event
    artist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Artist",
      required: true,
      index: true
    },

    // WHERE - Venue (Admin pre-added)
    venue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Venue",
      required: true,
      index: true
    },

    // WHAT - Event Details
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
      index: true
    },

    description: {
      type: String,
      maxlength: 2000
    },

    // WHEN - Timing
    startDateTime: {
      type: Date,
      required: [true, "Start date and time is required"]
    },

    endDateTime: {
      type: Date,
      validate: {
        validator: function (value) {
          return !value || value > this.startDateTime;
        },
        message: "End date must be after start date"
      }
    },

    // Category
    category: {
      type: String,
      enum: [
        "Concert",
        "Open Mic",
        "Festival",
        "Private Event",
        "Workshop",
        "Album Release",
        "Other"
      ],
      default: "Concert",
      index: true
    },

    // Capacity
    maxParticipants: {
      type: Number,
      min: 1
    },

    // Media
    poster: {
      type: String,
      default: "default-event.png"
    },

    images: [
      {
        type: String
      }
    ],

    // Status
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming",
      index: true
    },

    // Stats
    totalParticipants: {
      type: Number,
      default: 0
    },

    views: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);


const Event = mongoose.model("Event", eventSchema);

export default Event;