import mongoose from "mongoose";

const participantSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true
    },
    fan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fan",
      required: true
    },
    status: {
      type: String,
      enum: ["registered", "cancelled", "attended"],
      default: "registered"
    }
  },
  { timestamps: true }
);

// ✅ THIS is the correct way
participantSchema.index({ event: 1, fan: 1 }, { unique: true });

const Participant = mongoose.model("Participant", participantSchema);

export default Participant;