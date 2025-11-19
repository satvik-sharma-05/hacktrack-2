// routes/chats.js
import express from "express";
import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Get user's chats
router.get("/", auth, async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id,
      isActive: true
    })
    .populate("participants", "name avatar")
    .populate("lastMessage")
    .sort({ updatedAt: -1 });

    res.json({
      success: true,
      chats
    });

  } catch (err) {
    console.error("Get chats error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load chats"
    });
  }
});

// Get chat messages
router.get("/:chatId/messages", auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Verify user is participant in chat
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      participants: req.user._id
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found"
      });
    }

    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Mark messages as read
    await Message.updateMany(
      {
        chat: req.params.chatId,
        sender: { $ne: req.user._id },
        "readBy.user": { $ne: req.user._id }
      },
      {
        $push: {
          readBy: {
            user: req.user._id,
            readAt: new Date()
          }
        }
      }
    );

    res.json({
      success: true,
      messages: messages.reverse(), // Return in chronological order
      hasMore: messages.length === limit
    });

  } catch (err) {
    console.error("Get messages error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load messages"
    });
  }
});

// Send message
router.post("/:chatId/messages", auth, async (req, res) => {
  try {
    const { content } = req.body;

    // Verify user is participant in chat
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      participants: req.user._id,
      isActive: true
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found"
      });
    }

    const message = new Message({
      chat: req.params.chatId,
      sender: req.user._id,
      content,
      messageType: "text"
    });

    await message.save();

    // Update chat's last message and timestamp
    chat.lastMessage = message._id;
    await chat.save();

    await message.populate("sender", "name avatar");

    res.status(201).json({
      success: true,
      message
    });

  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to send message"
    });
  }
});

// Get specific chat with user
router.get("/user/:userId", auth, async (req, res) => {
  try {
    const chat = await Chat.findOne({
      participants: { $all: [req.user._id, req.params.userId] },
      isActive: true
    })
    .populate("participants", "name avatar")
    .populate("lastMessage");

    res.json({
      success: true,
      chat: chat || null
    });

  } catch (err) {
    console.error("Get chat with user error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load chat"
    });
  }
});

export default router;