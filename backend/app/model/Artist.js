import mongoose from "mongoose";

const artistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },

  artistName: {
    type: String,
    required: [true, "Artist name is required"],
    trim: true,
    index: true
  },

  stageName: {
    type: String,
    trim: true
  },

  bio: {
    type: String,
    maxlength: 1000
  },

  genre: [{
    type: String,
    enum: [
      "Pop", "Rock", "Hip Hop", "Jazz", "Classical",
      "Electronic", "Country", "R&B", "Indie", "Folk", "Other"
    ],
    index: true
  }],

  phone: String,

  website: {
    type: String,
    match: [/^https?:\/\/.+\..+/, "Invalid URL"]
  },

  socialMedia: {
    instagram: String,
    facebook: String,
    twitter: String,
    spotify: String,
    youtube: String
  },

  profileImage: {
    type: String,
    default: "default-artist.png"
  },

  location: {
    city: { type: String, index: true },
    state: String,
    country: { type: String, default: "USA" }
  },

  totalEvents: { type: Number, default: 0 },
  totalFollowers: { type: Number, default: 0 }

}, { timestamps: true });

export default mongoose.model("Artist", artistSchema);