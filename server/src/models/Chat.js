// models/Chat.js
import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }],
  invitation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TeamInvitation"
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message"
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Ensure unique participant pairs
chatSchema.index({ participants: 1 }, { unique: true });

export default mongoose.model("Chat", chatSchema);