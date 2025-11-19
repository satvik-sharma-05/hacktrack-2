import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function testEmbedding() {
  const res = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: "frontend developer",
  });
  console.log("✅ Embedding length:", res.data[0].embedding.length);
}

testEmbedding();
