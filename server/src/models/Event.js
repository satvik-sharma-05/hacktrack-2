import mongoose from "mongoose";

// ✅ Prevent model overwrite issues on hot-reload (Nodemon)
if (mongoose.models.Event) delete mongoose.models.Event;
if (mongoose.modelSchemas && mongoose.modelSchemas.Event)
  delete mongoose.modelSchemas.Event;

// ✅ Define Event schema
const eventSchema = new mongoose.Schema(
  {
    /* ------------------------------
     * CORE EVENT FIELDS
     * ------------------------------ */
    platform: {
      type: String,
      required: true,
      enum: [
        "clist",
        "devpost",
        "mlh",
        "eventbrite",
        "manual",
        "organizer", // <-- added
      ],
      default: "clist",
      index: true,
    },

    externalId: {
      type: String,
      trim: true,
      index: true,
      default: function () {
        return new mongoose.Types.ObjectId().toString();
      },
    },

    type: {
      type: String,
      enum: ["api", "manual"],
      default: "api",
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    url: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    start: {
      type: Date,
      required: true,
    },

    end: {
      type: Date,
    },

    location: {
      type: String,
      default: "online",
    },

    organizerRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },


    prize: {
      type: String,
      default: null,
    },

    prizeType: {
      type: String,
      enum: ["cash", "scholarship", "goods", "unknown"],
      default: "unknown",
    },

    themes: {
      type: [String],
      default: [],
    },

    skills: {
      type: [String],
      default: [],
    },

    /* ------------------------------
     * ORGANIZER-SPECIFIC FIELDS
     * ------------------------------ */
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    source: {
      type: String,
      enum: ["clist", "organizer", "manual"],
      default: "clist",
    },

    isApproved: {
      type: Boolean,
      default: function () {
        return this.source === "clist"; // auto-approved if from API
      },
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: function () {
        return this.source === "clist" ? "approved" : "pending";
      },
    },

    bannerImage: {
      type: String, // optional field for event image/banner
      default: "",
    },
  },
  {
    timestamps: true,
    strict: true,
  }
);

/* ------------------------------
 * INDEXES
 * ------------------------------ */

// Prevent duplicates per platform + externalId
eventSchema.index({ platform: 1, externalId: 1 }, { unique: true });

// Optimized search + sorting
eventSchema.index({ platform: 1, isApproved: 1, start: 1 });
eventSchema.index({ title: "text", description: "text", organizer: "text" });

/* ------------------------------
 * AUTO-DERIVED FIELDS / CLEANUP
 * ------------------------------ */

// If an event is from organizer → force platform & type
eventSchema.pre("save", function (next) {
  if (this.source === "organizer") {
    this.platform = "organizer";
    this.type = "manual";
  }
  next();
});

export default mongoose.model("Event", eventSchema);
