import mongoose from "mongoose";
import bcrypt from "bcryptjs";

/* -----------------------------
   USER SCHEMA (Students + Organizers + Admin)
----------------------------- */

const userSchema = new mongoose.Schema(
  {
    /* 🔐 Basic Credentials */
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, minlength: 6 },

    /* 🌐 OAuth Integrations */
    githubId: { type: String, default: null },  // Remove unique and sparse
    googleId: { type: String, default: null },  // Remove unique and sparse

    /* 🧩 Role & Permissions */
    role: {
      type: String,
      enum: ["pending", "student", "organizer", "admin"],
      default: "pending",
    },

    /* 🧠 Profile Information for AI Matching */
    bio: { type: String, default: "" },
    interests: { type: [String], default: [] },
    preferredRoles: { type: [String], default: [] }, // Example: ["Frontend", "Backend", "Cybersecurity"]
    skills: { type: [String], default: [] },

    // 🧠 Embeddings for semantic AI search
    skillsEmbeddings: { type: [[Number]], default: [] },
    profileEmbedding: { type: [Number], default: [] },

    /* 🌍 Extended Info (Filters for Recommendations) */
    location: { type: String, default: "" },
    college: { type: String, default: "" },
    graduationYear: { type: Number, default: null },
    domainInterest: { type: [String], default: [] }, // e.g. ["AI", "Web Dev", "Blockchain"]

    /* 💼 Organizer-Specific Info */
    organization: { type: String, default: "" },
    organizationDescription: { type: String, default: "" },
    website: { type: String, default: "" },
    contactEmail: { type: String, default: "" },
    contactNumber: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    twitter: { type: String, default: "" },

    /* 🔖 Event Bookmarks */
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],

    /* 🧮 Gamification / XP */
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },

    /* ⚙️ System Fields */
    isVerified: { type: Boolean, default: false },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

/* -----------------------------
   PASSWORD HASHING
----------------------------- */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  if (this.password) this.password = await bcrypt.hash(this.password, 10);
  next();
});

/* -----------------------------
   PASSWORD COMPARISON
----------------------------- */
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return bcrypt.compare(enteredPassword, this.password);
};

/* -----------------------------
   CLEAN OUTPUT
----------------------------- */
userSchema.set("toJSON", {
  transform: (_, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("User", userSchema);
