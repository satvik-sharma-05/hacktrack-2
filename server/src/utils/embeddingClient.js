import fetch from "node-fetch";

const EMBEDDING_URL = process.env.EMBEDDING_API_URL; // Railway URL

export async function getEmbedding(text) {
  try {
    const response = await fetch(`${EMBEDDING_URL}/embed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`Embedding service error: ${response.status}`);
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
    const response = await fetch(`${EMBEDDING_URL}/similarity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vec1, vec2 }),
    });

    if (!response.ok) throw new Error("Similarity service error");

    const data = await response.json();
    return data.similarity;
  } catch (err) {
    console.warn("Similarity service down → using local fallback");
    return computeCosineSimilarity(vec1, vec2);
  }
}

function computeCosineSimilarity(vec1, vec2) {
  const minLen = Math.min(vec1.length, vec2.length);
  const a = vec1.slice(0, minLen);
  const b = vec2.slice(0, minLen);

  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));

  return magA && magB ? dot / (magA * magB) : 0;
}
