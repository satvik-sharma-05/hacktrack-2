from flask import Flask, jsonify, request
from flask_cors import CORS
import time

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "http://127.0.0.1:5173"])

# Sample hackathon data
sample_hackathons = [
    {
        "id": 1, "title": "Global AI Hackathon 2024",
        "url": "https://devpost.com/software/ai-project",
        "description": "Build innovative AI solutions for real-world problems",
        "prize_amount": 25000, "location": "Online", "date": "December 1-15, 2024",
        "registration_count": 1500, "is_online": True, "organization": "Tech Corp",
        "source": "devpost", "image_url": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400",
        "deadline": "2024-12-15", "status": "upcoming"
    },
    {
        "id": 2, "title": "Climate Change Challenge",
        "url": "https://devpost.com/software/climate-solution",
        "description": "Develop solutions to combat climate change using technology",
        "prize_amount": 15000, "location": "San Francisco, CA", "date": "November 20-30, 2024",
        "registration_count": 800, "is_online": False, "organization": "Green Foundation",
        "source": "devpost", "image_url": "https://images.unsplash.com/photo-1569163139394-de44cb54d0c8?w=400",
        "deadline": "2024-11-30", "status": "open"
    },
    {
        "id": 3, "title": "HackerEarth AI Challenge 2024",
        "url": "https://www.hackerearth.com/challenges/hackathon/ai-challenge",
        "description": "Build cutting-edge AI and Machine Learning solutions",
        "prize_amount": 10000, "location": "Online", "date": "November 15-30, 2024",
        "registration_count": 2500, "is_online": True, "organization": "HackerEarth",
        "source": "hackerearth", "image_url": "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400",
        "deadline": "2024-11-30", "status": "upcoming"
    }
]

@app.route("/")
def home():
    return jsonify({"message": "Hackathon Scraper API is running!", "status": "healthy", "port": 5001})

@app.route("/api/hackathons", methods=["GET"])
def get_hackathons():
    source = request.args.get("source")
    status = request.args.get("status")
    online_only = request.args.get("online_only")

    filtered = sample_hackathons.copy()

    if source:
        filtered = [h for h in filtered if h.get("source") == source]
    if status:
        filtered = [h for h in filtered if h.get("status") == status]
    if online_only and online_only.lower() == "true":
        filtered = [h for h in filtered if h.get("is_online")]

    return jsonify({
        "hackathons": filtered,
        "total": len(filtered),
        "last_updated": time.time(),
        "sources": ["devpost", "hackerearth", "mlh", "eventbrite"]
    })

@app.route("/api/statistics", methods=["GET"])
def get_statistics():
    return jsonify({
        "total": len(sample_hackathons),
        "by_source": {"devpost": 2, "hackerearth": 1},
        "online_count": 2,
        "total_prize": 50000,
        "average_prize": 16666.67
    })

@app.route("/api/refresh", methods=["POST"])
def refresh_data():
    return jsonify({"message": "Data refreshed!", "count": len(sample_hackathons), "last_updated": time.time()})

@app.after_request
def after_request(response):
    response.headers["Access-Control-Allow-Origin"] = "http://localhost:5173"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response

if __name__ == "__main__":
    print("="*60)
    print("HACKATHON SCRAPER API STARTING...")
    print("Port: 5001")
    print("URL: http://localhost:5001")
    print("API: http://localhost:5001/api/hackathons")
    print("="*60)
    app.run(host="0.0.0.0", port=5001, debug=False)