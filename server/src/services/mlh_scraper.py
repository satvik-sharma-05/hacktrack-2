import json
import os
import time
from datetime import datetime
from typing import List, Dict
from bs4 import BeautifulSoup
import cloudscraper

# Cache file path and expiry (6 hours)
CACHE_FILE = r"C:\Users\sharm\OneDrive\Desktop\hacktrack_project\server\data\mlh_hackathons_cache.json"
CACHE_EXPIRY = 6 * 60 * 60  # 6 hours in seconds


class MLHHackathonScraper:
    def __init__(self, url: str = "https://mlh.io/seasons/2026/events"):
        self.url = url
        self.hackathons = []

    def fetch_page(self) -> str:
        """Fetch the HTML content from MLH using Cloudflare-safe scraper."""
        try:
            headers = {
                "User-Agent": (
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/123.0.0.0 Safari/537.36"
                )
            }
            scraper = cloudscraper.create_scraper()
            response = scraper.get(self.url, headers=headers)
            response.raise_for_status()
            return response.text
        except Exception as e:
            print(f"Error fetching page: {e}")
            return None

    def parse_hackathon(self, event_div) -> Dict:
        """Extract hackathon details from a single MLH event div."""
        hackathon = {}
        try:
            link = event_div.find("a", class_="event-link")
            hackathon["url"] = link.get("href", "") if link else ""
            hackathon["title"] = link.get("title", "") if link else ""

            name_elem = event_div.find("h3", class_="event-name")
            hackathon["name"] = name_elem.get_text(strip=True) if name_elem else ""

            date_elem = event_div.find("p", class_="event-date")
            hackathon["dates"] = date_elem.get_text(strip=True) if date_elem else ""

            start_date = event_div.find("meta", itemprop="startDate")
            end_date = event_div.find("meta", itemprop="endDate")
            hackathon["start_date"] = start_date.get("content", "") if start_date else ""
            hackathon["end_date"] = end_date.get("content", "") if end_date else ""

            location_div = event_div.find("div", class_="event-location")
            if location_div:
                city = location_div.find("span", itemprop="city")
                state = location_div.find("span", itemprop="state")
                hackathon["city"] = city.get_text(strip=True) if city else ""
                hackathon["state"] = state.get_text(strip=True) if state else ""
                hackathon["location"] = f"{hackathon['city']}, {hackathon['state']}".strip(", ")

            img_tag = event_div.find("div", class_="image-wrap")
            if img_tag:
                img = img_tag.find("img")
                hackathon["image"] = img.get("src", "") if img else ""

        except Exception as e:
            print(f"Error parsing hackathon: {e}")

        return hackathon

    def scrape(self) -> List[Dict]:
        """Scrape all MLH hackathons from the website."""
        html = self.fetch_page()
        if not html:
            print("Failed to fetch HTML content.")
            return []

        soup = BeautifulSoup(html, "html.parser")
        events = soup.find_all("div", class_="event")
        print(f"Found {len(events)} hackathons.")

        for div in events:
            data = self.parse_hackathon(div)
            if data:
                self.hackathons.append(data)

        return self.hackathons

    def save_cache(self):
        """Save results to cache file."""
        data = {
            "timestamp": int(time.time()),
            "count": len(self.hackathons),
            "events": self.hackathons,
        }
        os.makedirs(os.path.dirname(CACHE_FILE), exist_ok=True)
        with open(CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"Cache updated at {CACHE_FILE}")

    def load_cache(self) -> List[Dict]:
        """Load cached events if available and still valid."""
        if os.path.exists(CACHE_FILE):
            with open(CACHE_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                age = time.time() - data.get("timestamp", 0)
                if age < CACHE_EXPIRY:
                    print(f"Using cached MLH data ({round(age / 3600, 1)} hours old).")
                    self.hackathons = data.get("events", [])
                    return self.hackathons
                else:
                    print("Cache expired. Re-scraping new data...")
        else:
            print("No cache found. Scraping fresh data...")

        return None


def main():
    print("Starting MLH Hackathon Scraper with Cache System...")
    print("=" * 60)

    scraper = MLHHackathonScraper()
    cached_data = scraper.load_cache()

    if cached_data:
        print(f"Loaded {len(cached_data)} cached hackathons.")
        return

    # Fresh scrape
    new_data = scraper.scrape()
    if new_data:
        print(f"Scraped {len(new_data)} new hackathons.")
        scraper.save_cache()
        print("Scraping completed successfully.")
    else:
        print("No hackathons found.")


if __name__ == "__main__":
    main()
