import mongoose from "mongoose";

const fanSchema = new mongoose.Schema(
  {
    // Link back to User
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true
    },

    // Basic Info
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true
    },

    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true
    },

    dateOfBirth: {
      type: Date
    },

    // Preferences
    favoriteGenres: [
      {
        type: String,
        enum: [
          "Pop",
          "Rock",
          "Hip Hop",
          "Jazz",
          "Classical",
          "Electronic",
          "Country",
          "R&B",
          "Indie",
          "Folk",
          "Other"
        ],
        index: true
      }
    ],

    // Location
    location: {
      city: { type: String, index: true },
      state: { type: String },
      country: { type: String, default: "USA" },
      zipCode: { type: String }
    },

    // Following Artists
    followingArtists: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Artist"
      }
    ],

    // Media
    profileImage: {
      type: String,
      default: "default-fan.png"
    },

    // Notification Preferences
    notifications: {
      email: { type: Boolean, default: true },
      newEvents: { type: Boolean, default: true },
      eventReminders: { type: Boolean, default: true }
    },

    // Stats (auto-updated)
    eventsAttended: {
      type: Number,
      default: 0
    },

    eventsRegistered: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

const Fan = mongoose.model("Fan", fanSchema);

export default Fan;