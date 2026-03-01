import mongoose from "mongoose";

const venueSchema = new mongoose.Schema(
  {
    // Basic Info
    name: {
      type: String,
      required: [true, "Venue name is required"],
      trim: true,
      index: true
    },

    // Address
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true, index: true },
      state: { type: String, required: true },
      zipCode: { type: String },
      country: { type: String, default: "USA" }
    },

    // Geolocation
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },

    // Details
    description: {
      type: String,
      maxlength: 1500
    },

    venueType: {
      type: String,
      enum: [
        "Bar",
        "Club",
        "Theater",
        "Concert Hall",
        "Outdoor",
        "Stadium",
        "Cafe",
        "Restaurant",
        "Other"
      ],
      required: true,
      index: true
    },

    capacity: {
      type: Number,
      min: 0
    },

    // Contact
    phone: String,

    email: {
      type: String,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"]
    },

    website: {
      type: String,
      match: [/^https?:\/\/.+\..+/, "Invalid website URL"]
    },

    // Media
    images: [String],

    // Amenities
    amenities: [
      {
        type: String,
        enum: [
          "Parking",
          "Wheelchair Accessible",
          "Bar",
          "Food Service",
          "WiFi",
          "Sound System",
          "Stage",
          "Outdoor Seating",
          "Lighting"
        ]
      }
    ],

    // Admin who added this venue
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    // Status
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },

    // Stats
    totalEvents: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate venues in same city
venueSchema.index({ name: 1, "address.city": 1 }, { unique: true });

const Venue = mongoose.model("Venue", venueSchema);

export default Venue;