// routes/invitations.js
import express from "express";
import TeamInvitation from "../models/TeamInvitation.js";
import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Send team invitation
router.post("/send", auth, async (req, res) => {
  try {
    const { toUserId, message, projectContext } = req.body;
    const fromUserId = req.user._id;

    // Prevent self-invitation
    if (fromUserId.toString() === toUserId) {
      return res.status(400).json({
        success: false,
        message: "You cannot send an invitation to yourself"
      });
    }

    // Check for existing pending invitation
    const existingInvitation = await TeamInvitation.findOne({
      fromUser: fromUserId,
      toUser: toUserId,
      status: "pending"
    });

    if (existingInvitation) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending invitation with this user"
      });
    }

    // Create new invitation
    const invitation = new TeamInvitation({
      fromUser: fromUserId,
      toUser: toUserId,
      message: message || "I'd like to invite you to join my team!",
      projectContext
    });

    await invitation.save();

    // Populate user details for response
    await invitation.populate("fromUser", "name avatar");
    await invitation.populate("toUser", "name avatar");

    res.status(201).json({
      success: true,
      message: "Invitation sent successfully",
      invitation
    });

  } catch (err) {
    console.error("Send invitation error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to send invitation"
    });
  }
});

// Get user's received invitations
router.get("/received", auth, async (req, res) => {
  try {
    const invitations = await TeamInvitation.find({
      toUser: req.user._id,
      status: "pending"
    })
    .populate("fromUser", "name avatar bio skills preferredRoles")
    .populate("projectContext.eventId", "title")
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      invitations
    });

  } catch (err) {
    console.error("Get received invitations error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load invitations"
    });
  }
});

// Get user's sent invitations
router.get("/sent", auth, async (req, res) => {
  try {
    const invitations = await TeamInvitation.find({
      fromUser: req.user._id,
      status: "pending"
    })
    .populate("toUser", "name avatar bio skills preferredRoles")
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      invitations
    });

  } catch (err) {
    console.error("Get sent invitations error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load sent invitations"
    });
  }
});

// Accept invitation
router.post("/:invitationId/accept", auth, async (req, res) => {
  try {
    const invitation = await TeamInvitation.findOne({
      _id: req.params.invitationId,
      toUser: req.user._id,
      status: "pending"
    });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: "Invitation not found or already processed"
      });
    }

    // Update invitation status
    invitation.status = "accepted";
    await invitation.save();

    // Create a chat between users
    const chat = new Chat({
      participants: [invitation.fromUser, invitation.toUser],
      invitation: invitation._id
    });

    await chat.save();

    // Create a system message
    const systemMessage = new Message({
      chat: chat._id,
      sender: invitation.fromUser, // or system user if you have one
      content: `You are now connected! Start planning your project together.`,
      messageType: "system"
    });

    await systemMessage.save();

    // Update chat's last message
    chat.lastMessage = systemMessage._id;
    await chat.save();

    // Populate data for response
    await chat.populate("participants", "name avatar");
    await invitation.populate("fromUser", "name avatar");

    res.json({
      success: true,
      message: "Invitation accepted! You can now chat with this user.",
      invitation,
      chat
    });

  } catch (err) {
    console.error("Accept invitation error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to accept invitation"
    });
  }
});

// Reject invitation
router.post("/:invitationId/reject", auth, async (req, res) => {
  try {
    const invitation = await TeamInvitation.findOne({
      _id: req.params.invitationId,
      toUser: req.user._id,
      status: "pending"
    });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: "Invitation not found or already processed"
      });
    }

    invitation.status = "rejected";
    await invitation.save();

    res.json({
      success: true,
      message: "Invitation declined"
    });

  } catch (err) {
    console.error("Reject invitation error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to reject invitation"
    });
  }
});

// Cancel invitation (sender can cancel)
router.post("/:invitationId/cancel", auth, async (req, res) => {
  try {
    const invitation = await TeamInvitation.findOne({
      _id: req.params.invitationId,
      fromUser: req.user._id,
      status: "pending"
    });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: "Invitation not found or already processed"
      });
    }

    invitation.status = "cancelled";
    await invitation.save();

    res.json({
      success: true,
      message: "Invitation cancelled"
    });

  } catch (err) {
    console.error("Cancel invitation error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to cancel invitation"
    });
  }
});

export default router;