import mongoose from "mongoose";

const CacheMetaSchema = new mongoose.Schema(
  {
    source: { type: String, required: true, unique: true }, 
    lastFetched: { type: Date, default: null }, // last API call timestamp
    totalEvents: { type: Number, default: 0 },  // number of imported events
    metadata: { type: Object, default: {} },    // extra info if needed later
  },
  { timestamps: true }
);

const CacheMeta = mongoose.model("CacheMeta", CacheMetaSchema);

export default CacheMeta;
