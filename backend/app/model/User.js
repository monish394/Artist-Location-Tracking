import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
      index: true
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6
    },

    role: {
      type: String,
      enum: ["admin", "artist", "fan"],
      required: [true, "Role is required"],
      index: true
    },

    // Link to role-specific profile
    artistProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Artist",
      default: null
    },

    fanProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fan",
      default: null
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true
    },

    lastLogin: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

const User = mongoose.model("User", userSchema);

export default User;