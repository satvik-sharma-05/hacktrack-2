// server.js
import express from "express";
import session from "express-session";
import mongoose from "mongoose";
import { connectDB } from "./src/config/db.js";
import { config } from "./src/config/env.js";
import { errorHandler } from "./src/middleware/error.js";

import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import passport from "passport";
import initPassport from "./src/config/passport.js";

import authRoutes from "./src/routes/auth.routes.js";
import eventsRoutes from "./src/routes/events.routes.js";
import userRoutes from "./src/routes/user.routes.js";
import contestsRoutes from "./src/routes/contests.routes.js";
import organizerRoutes from "./src/routes/organizer.routes.js";
import participationRoutes from "./src/routes/participation.routes.js";
import adminRoutes from "./src/routes/admin.routes.js";
import teammatesRoutes from "./src/routes/teammates.routes.js";
import invitationRoutes from "./src/routes/invitations.js";
import chatRoutes from "./src/routes/chats.js";
import { fetchDevpostEvents } from "./src/services/devpost.service.js";
import { fetchMLHEvents } from "./src/services/mlhService.js";
import { fetchClist } from "./src/services/clist.js";

// ✅ Initialize app
const app = express();

// ✅ Connect to DB
await connectDB();
console.log("✅ MongoDB Connected");

function startBackgroundRefresh() {
  console.log("🕐 Starting background refresh every 6 hours...");

  const refresh = async () => {
    console.log("🔄 Refreshing caches (Devpost + MLH + CLIST)...");
    await Promise.all([
      fetchDevpostEvents().catch(err => console.error("Devpost refresh failed:", err.message)),
      fetchMLHEvents().catch(err => console.error("MLH refresh failed:", err.message)),
      fetchClist().catch(err => console.error("CLIST refresh failed:", err.message)),
    ]);
    console.log("✅ Caches refreshed");
  };

  // Initial warm-up
  refresh();

  // Repeat every 6 hours
  setInterval(refresh, 6 * 60 * 60 * 1000);
}

startBackgroundRefresh();




// ✅ Import models AFTER connection
import Event from "./src/models/Event.js";
import { getLiveMLH, getMLHHealth } from "./src/controllers/events.controller.js";
console.log("✅ Model registered:", Event.modelName);

// ✅ SECURITY MIDDLEWARE
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// ✅ CORS (MUST be configured exactly like this)
app.use(
  cors({
    origin: ["http://localhost:5173"], // ✅ exact frontend origin
    credentials: true, // ✅ allow cookies to flow
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Other middleware
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// ✅ Session (for OAuth / Passport)
app.use(
  session({
    secret: config.SESSION_SECRET || "hacktrack-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // ✅ true only in production (https)
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  })
);

// ✅ Passport setup
initPassport();
app.use(passport.initialize());
app.use(passport.session());

// ✅ ROUTES
app.get("/", (_req, res) => res.json({ hello: "HackTrack API" }));
app.use("/api/auth", authRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/users", userRoutes);
app.use("/api/organizer", organizerRoutes);
app.use("/api/contests", contestsRoutes);
app.use("/api/participation", participationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/teammates", teammatesRoutes);
app.use("/api/invitations", invitationRoutes);
app.use("/api/chats", chatRoutes);

app.get('/api/events/mlh', getLiveMLH);
app.get('/api/events/mlh/health', getMLHHealth);
// ✅ Debug routes
app.get("/api/debug/schema", (req, res) => {
  const paths = Object.keys(Event.schema.paths);
  res.json({ totalFields: paths.length, fields: paths });
});

app.get("/api/debug/routes", (req, res) => {
  const routes = [];
  const print = (layer, prefix = "") => {
    if (layer.route) {
      const path = prefix + layer.route.path;
      const methods = Object.keys(layer.route.methods).join(",").toUpperCase();
      routes.push({ path, methods });
    } else if (layer.name === "router" && layer.handle.stack) {
      layer.handle.stack.forEach((l) =>
        print(l, prefix + (layer.regexp?.source === "^\\/" ? "" : ""))
      );
    }
  };
  app._router.stack.forEach((layer) => print(layer));
  res.json({ total: routes.length, routes });
});











// ✅ Error handler
app.use(errorHandler);

// ✅ Start server
app.listen(config.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${config.PORT}`);
});
import cron from "node-cron";
import { exec } from "child_process";
import path from "path";

const PYTHON_SCRIPT = path.resolve("server/src/services/mlh_scraper.py");

// 🕒 Run once every 6 hours (at 00:00, 06:00, 12:00, 18:00)
cron.schedule("0 */6 * * *", () => {
  console.log("🕒 [CRON] Starting MLH cache refresh...");
  
  exec(`python "${PYTHON_SCRIPT}"`, (error, stdout, stderr) => {
    if (error) {
      console.error("❌ [CRON] MLH scrape failed:", error.message);
      console.error(stderr);
      return;
    }
    console.log("✅ [CRON] MLH cache refreshed successfully.");
    console.log(stdout.split("\n").slice(0, 5).join("\n")); // print first few lines
  });
});
