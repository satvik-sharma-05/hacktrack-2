// models/TeamInvitation.js
import mongoose from "mongoose";

const teamInvitationSchema = new mongoose.Schema({
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  message: {
    type: String,
    default: "I'd like to invite you to join my team!"
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "cancelled"],
    default: "pending"
  },
  projectContext: {
    name: String,
    description: String,
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event"
    }
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  }
}, {
  timestamps: true
});

// Index for faster queries
teamInvitationSchema.index({ fromUser: 1, toUser: 1, status: 1 });
teamInvitationSchema.index({ toUser: 1, status: 1 });
teamInvitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("TeamInvitation", teamInvitationSchema);