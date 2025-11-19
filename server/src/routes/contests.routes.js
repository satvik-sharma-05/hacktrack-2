import express from "express";
import fetch from "node-fetch";

const router = express.Router();

const CLIST_URL = `https://clist.by/api/v2/contest/?username=${process.env.CLIST_USERNAME}&api_key=${process.env.CLIST_API_KEY}&limit=100&order_by=-start`;

router.get("/", async (req, res) => {
  try {
    const response = await fetch(CLIST_URL);
    const data = await response.json();

    const contests = data.objects.map(c => ({
      id: c.id,
      event: c.event,
      host: c.host,
      start: c.start,
      end: c.end,
      href: c.href,
    }));

    res.json(contests);
  } catch (error) {
    console.error("Error fetching contests:", error);
    res.status(500).json({ error: "Failed to fetch contests" });
  }
});

export default router;
