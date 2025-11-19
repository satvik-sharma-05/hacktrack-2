// server/src/models/Participation.js
import mongoose from "mongoose";

const participationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    joinedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ["joined", "left"], default: "joined" },
    meta: { type: Object, default: {} }, // optional: store extra metadata (team, answers etc)
  },
  { timestamps: true }
);

// prevent duplicate joins (unique compound index)
participationSchema.index({ user: 1, event: 1 }, { unique: true });

export default mongoose.models.Participation || mongoose.model("Participation", participationSchema);
