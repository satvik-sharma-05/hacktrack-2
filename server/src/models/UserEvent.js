import mongoose from "mongoose";

const UserEventSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", index: true },
  action: { type: String, enum: ["bookmark", "join"], required: true },
}, { timestamps: true });

UserEventSchema.index({ user: 1, event: 1, action: 1 }, { unique: true });

export default mongoose.model("UserEvent", UserEventSchema);
