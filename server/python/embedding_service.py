from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

app = Flask(__name__)

print("Loading all-MiniLM-L6-v2 model...")
model = SentenceTransformer("all-MiniLM-L6-v2")
print("Model loaded successfully!")

@app.route("/embed", methods=["POST"])
def embed():
    try:
        data = request.get_json()
        text = data.get("text", "")

        if isinstance(text, (dict, list)):
            text = " ".join(str(v) for v in (text.values() if isinstance(text, dict) else text) if v)
        if not isinstance(text, str) or not text.strip():
            return jsonify({"error": "Invalid or empty text"}), 400

        embedding = model.encode(text.strip()).tolist()
        return jsonify({"embedding": embedding})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/similarity", methods=["POST"])
def similarity():
    try:
        data = request.get_json()
        vec1 = data.get("vec1")
        vec2 = data.get("vec2")
        if not vec1 or not vec2 or len(vec1) != len(vec2):
            return jsonify({"error": "Invalid vectors"}), 400

        sim = cosine_similarity([vec1], [vec2])[0][0]
        return jsonify({"similarity": float(sim)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy", "port": 5002})

if __name__ == "__main__":
    print("EMBEDDING SERVICE STARTING -> http://localhost:5002")
    app.run(host="0.0.0.0", port=5002, debug=False)