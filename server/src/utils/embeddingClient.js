// src/utils/embeddingClient.js
import fetch from "node-fetch";

const EMBEDDING_URL = "http://localhost:5002";  // ← USE localhost EVERYWHERE

export async function getEmbedding(text) {
  try {
    const response = await fetch(`${EMBEDDING_URL}/embed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Embedding service error: ${response.status} ${error}`);
    }

    const data = await response.json();
    return data.embedding;
  } catch (err) {
    console.error("Embedding service error:", err.message);
    throw new Error("Embedding service unavailable");
  }
}

export async function getSimilarity(vec1, vec2) {
  try {
    if (!vec1 || !vec2 || !Array.isArray(vec1) || !Array.isArray(vec2)) {
      throw new Error("Invalid vectors");
    }
    if (vec1.length === 0 || vec2.length === 0) return 0;

    const response = await fetch(`${EMBEDDING_URL}/similarity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vec1, vec2 }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Similarity service error: ${response.status}`);
    }

    const data = await response.json();
    return data.similarity || 0;
  } catch (err) {
    console.warn("Similarity service down → using local fallback");
    return computeCosineSimilarity(vec1, vec2);
  }
}

// Local fallback (keeps working even if Flask is off)
function computeCosineSimilarity(vec1, vec2) {
  try {
    const minLen = Math.min(vec1.length, vec2.length);
    const a = vec1.slice(0, minLen);
    const b = vec2.slice(0, minLen);

    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));

    return magA && magB ? dot / (magA * magB) : 0;
  } catch {
    return 0;
  }
}