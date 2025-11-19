import mongoose from "mongoose";
import User from "../models/User.js";
import { getEmbedding } from "./embeddingClient.js";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/hacktrack";

const mockUsers = [
  {
    name: "Alice Johnson",
    email: "alice@example.com",
    password: "password123",
    role: "student",
    bio: "Frontend developer passionate about React and modern web UI.",
    skills: ["React", "HTML", "CSS", "JavaScript", "TailwindCSS"],
    interests: ["UI Design", "Web Performance", "Accessibility"],
    preferredRoles: ["Frontend Developer"],
    college: "Stanford University",
    graduationYear: 2026,
    location: "California, USA",
  },
  {
    name: "Bob Kumar",
    email: "bob@example.com",
    password: "password123",
    role: "student",
    bio: "Backend enthusiast experienced with Node.js and MongoDB.",
    skills: ["Node.js", "Express", "MongoDB", "REST APIs"],
    interests: ["APIs", "System Design", "DevOps"],
    preferredRoles: ["Backend Developer"],
    college: "IIT Delhi",
    graduationYear: 2025,
    location: "New Delhi, India",
  },
  {
    name: "Catherine Lee",
    email: "catherine@example.com",
    password: "password123",
    role: "student",
    bio: "Fullstack developer exploring MERN stack and AI integrations.",
    skills: ["React", "Node.js", "Express", "MongoDB", "Python"],
    interests: ["AI Tools", "Hackathons", "Startups"],
    preferredRoles: ["Fullstack Developer"],
    college: "MIT",
    graduationYear: 2026,
    location: "Massachusetts, USA",
  },
  {
    name: "David Chen",
    email: "david@example.com",
    password: "password123",
    role: "student",
    bio: "Game and graphics developer passionate about Unity and C++.",
    skills: ["Unity", "C++", "Blender", "3D Modeling"],
    interests: ["Game Development", "VR", "AI Agents"],
    preferredRoles: ["Game Developer"],
    college: "NUS Singapore",
    graduationYear: 2024,
    location: "Singapore",
  },
  {
    name: "Eva Singh",
    email: "eva@example.com",
    password: "password123",
    role: "student",
    bio: "Cybersecurity enthusiast exploring ethical hacking and network defense.",
    skills: ["Linux", "Python", "Wireshark", "Penetration Testing"],
    interests: ["Security", "CTFs", "Digital Forensics"],
    preferredRoles: ["Security Analyst"],
    college: "IIT Bombay",
    graduationYear: 2025,
    location: "Mumbai, India",
  },
];

async function seedUsers() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // 1️⃣ Remove old student mock users
    const deleted = await User.deleteMany({
      role: "student",
      email: { $in: mockUsers.map((u) => u.email) },
    });
    console.log(`🗑️ Deleted ${deleted.deletedCount} old mock users`);

    console.log("🧠 Generating embeddings via Flask service...");
    const createdUsers = [];

    for (const user of mockUsers) {
      try {
        // Combine all text fields for embedding
        const combinedText = [
          user.bio,
          ...user.skills,
          ...user.interests,
          ...user.preferredRoles,
        ].join(" ");

        const embedding = await getEmbedding(combinedText);
        user.profileEmbedding = embedding;
        user.googleId = undefined; // avoid unique null duplicate
        user.githubId = undefined; // avoid unique null duplicate

        const newUser = new User(user);
        await newUser.save();

        createdUsers.push(user.name);
        console.log(`✅ Created user: ${user.name}`);
      } catch (err) {
        console.error(`❌ Failed for ${user.name}:`, err.message);
      }
    }

    console.log(`\n🎉 Added mock users: ${createdUsers.join(", ")}`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
}

seedUsers();
