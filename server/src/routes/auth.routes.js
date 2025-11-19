// auth.routes.js
import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { config } from "../config/env.js";
import { sendToken } from "../utils/jwt.js";
import auth from "../middleware/auth.js";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";


const router = express.Router();

// Helper function for consistent OAuth success handling
const handleOAuthSuccess = async (user, res) => {
  const token = jwt.sign({ id: user._id }, config.JWT_SECRET, { expiresIn: "7d" });
  
  if (user.role === "pending") {
    // Redirect to role selection page
    res.redirect(`${config.FRONTEND_URL}/select-role?tempId=${user._id}`);
  } else {
    // Redirect to login success with token for automatic login
    res.redirect(`${config.FRONTEND_URL}/login-success?token=${token}&role=${user.role}`);
  }
};

/* -------------------------
   1️⃣ REGISTER (email/password)
-------------------------- */
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!email || !name || !password)
      return res.status(400).json({ message: "All fields are required" });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already registered" });

    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    const user = await User.create({
      name,
      email,
      password,
      role: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Registration successful. Please select your role.",
      redirect: `/select-role?tempId=${user._id}`,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* -------------------------
   2️⃣ LOGIN (email/password)
-------------------------- */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const match = await user.matchPassword(password);
    if (!match) return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign({ id: user._id }, config.JWT_SECRET, { expiresIn: "7d" });

    let redirect = "/";
    if (user.role === "organizer") redirect = "/organizer";
    else if (user.role === "student") redirect = "/profile";
    else if (user.role === "pending") redirect = `/select-role?tempId=${user._id}`;

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      redirect,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* -------------------------
   3️⃣ LOGOUT   
-------------------------- */
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ success: true, message: "Logged out" });
});

/* -------------------------
   4️⃣ CURRENT USER
-------------------------- */
router.get("/me", auth, async (req, res) => {
  res.json({ user: req.user });
});

/* -------------------------
   🟢 GITHUB OAUTH (Fixed & Clean)
-------------------------- */
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

router.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  async (req, res) => {
    try {
      // ✅ Extract profile first
      const profile = req.user._json || req.user;

      // ✅ Normalize fields safely
      const githubId = profile.id || req.user.id;
      const name = profile.name || profile.login || "GitHub User";
      const email =
        profile.email ||
        (profile.login ? `${profile.login}@github.com` : "unknown@github.com");

      // ✅ Lookup user by GitHub ID or email
      let user = await User.findOne({
        $or: [{ githubId }, { email }],
      });

      // ✅ Normalize and sanitize role (if any)
      if (user?.role) user.role = user.role.trim().toLowerCase();

      // ✅ Create or update user
      if (user) {
        if (!user.githubId) user.githubId = githubId;
        await user.save();
      } else {
        user = await User.create({
          githubId,
          name,
          email,
          role: "pending", // default until admin/organizer verified
        });
      }

      // ✅ Issue JWT + redirect
      await handleOAuthSuccess(user, res);
    } catch (err) {
      console.error("GitHub OAuth error:", err);
      res.redirect(`${config.FRONTEND_URL}/login?error=github_failed`);
    }
  }
);
  

/* -------------------------
   🔵 GOOGLE OAUTH (Fixed & Consistent)
-------------------------- */
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  async (req, res) => {
    try {
      const profile = req.user._json || req.user;

      const googleId = profile.sub || req.user.id;
      const name = profile.name || profile.given_name || "Google User";
      const email = profile.email || `${googleId}@google.com`;

      let user = await User.findOne({
        $or: [{ googleId }, { email }],
      });

      if (user) {
        if (!user.googleId) user.googleId = googleId;
        await user.save();
      } else {
        user = await User.create({
          googleId,
          name,
          email,
          role: "pending",
        });
      }

      await handleOAuthSuccess(user, res);
    } catch (err) {
      console.error("Google OAuth error:", err);
      res.redirect(`${config.FRONTEND_URL}/login?error=google_failed`);
    }
  }
);

/* -------------------------
   SET ROLE (after OAuth or registration)
-------------------------- */
router.post("/set-role", async (req, res) => {
  try {
    const { id, role } = req.body;

    if (!id || !role) {
      return res.status(400).json({ message: "Missing user ID or role" });
    }

    if (!["student", "organizer"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = role;
    await user.save();

    // Generate token and send proper response
    const token = jwt.sign({ id: user._id }, config.JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      redirect: role === "student" ? "/profile" : "/organizer",
    });
  } catch (err) {
    console.error("Set role error:", err);
    res.status(500).json({ message: "Server error" });
  }
});






/* ------------------------------
   🧩 Forgot Password (Email Only)
------------------------------- */
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  console.log("Loaded email user:", process.env.EMAIL_USER);
  console.log("Loaded email pass:", process.env.EMAIL_PASS ? "✔️ yes" : "❌ missing");

  try {
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "No account with that email" });

    // 🚫 Block OAuth-only users (Google/GitHub/LinkedIn)
    if (!user.password) {
      return res.status(400).json({
        message:
          "This account uses Google or GitHub login. Please sign in via your OAuth provider.",
      });
    }

    // ✅ Create a short-lived JWT (15 min)
    const token = jwt.sign({ id: user._id }, config.JWT_SECRET, { expiresIn: "15m" });
    const resetURL = `${config.FRONTEND_URL}/reset-password/${token}`;

    // ✅ Configure Transporter (try Gmail, fallback to Ethereal)
    let transporter;
    try {
      transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: config.EMAIL_USER,
          pass: config.EMAIL_PASS,
        },
      });
      console.log("✅ Gmail transporter created");
    } catch (gmailErr) {
      console.error("⚠️ Gmail setup failed, switching to Ethereal:", gmailErr);
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log("📧 Using Ethereal:", testAccount.web);
    }

    // ✅ Send the password reset email
    const info = await transporter.sendMail({
      from: `"HackTrack Support" <${config.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;">
          <h2>Reset Your Password</h2>
          <p>We received a request to reset your password. Click below:</p>
          <a href="${resetURL}" target="_blank"
             style="background:#2563eb;color:white;padding:10px 15px;
             border-radius:5px;text-decoration:none;">Reset Password</a>
          <p style="margin-top:10px;color:#666;font-size:13px;">
            This link expires in 15 minutes. If you didn’t request it, please ignore this email.
          </p>
        </div>
      `,
    });

    console.log("📨 Email sent:", info.messageId);
    if (nodemailer.getTestMessageUrl(info)) {
      console.log("📧 Preview URL:", nodemailer.getTestMessageUrl(info));
    }

    res.json({ success: true, message: "Password reset link sent to your email." });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});



/* -------------------------
   🔑 RESET PASSWORD (verify token)
-------------------------- */
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!newPassword || newPassword.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    if (err.name === "TokenExpiredError")
      return res.status(400).json({ message: "Reset link expired. Please try again." });
    res.status(400).json({ message: "Invalid or expired reset link" });
  }
});




/* -------------------------
   🔐 CHANGE PASSWORD (logged-in user)
-------------------------- */
router.put("/change-password", auth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: "User not found" });

    // Check old password
    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch)
      return res.status(400).json({ message: "Incorrect current password" });

    if (newPassword.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    user.password = newPassword; // Will be hashed automatically by pre-save hook
    await user.save();

    res.json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


export default router;