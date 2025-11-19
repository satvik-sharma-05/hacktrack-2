import requests
import json
import csv
import re
from datetime import datetime
from typing import List, Dict, Optional

class DevpostScraper:
    """
    Scraper for Devpost hackathons using their public API
    """
    
    def __init__(self):
        self.api_url = "https://devpost.com/api/hackathons"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json',
            'Referer': 'https://devpost.com/hackathons'
        }
        self.hackathons = []
    
    def fetch_hackathons(self, page: int = 1, per_page: int = 50) -> Optional[Dict]:
        """
        Fetch hackathons from the API
        
        Args:
            page: Page number to fetch
            per_page: Number of results per page (max appears to be 50)
        
        Returns:
            Dictionary containing API response or None if failed
        """
        params = {
            'page': page,
            'per_page': per_page,
            'order_by': 'submission_period_dates'  # Can be: featured, prize_amount, recently_added, submission_period_dates
        }
        
        try:
            response = requests.get(self.api_url, headers=self.headers, params=params, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error fetching page {page}: {e}")
            return None
    
    def extract_hackathon_data(self, hackathon: Dict) -> Dict:
        """
        Extract relevant data from a hackathon object
        
        Args:
            hackathon: Raw hackathon data from API
        
        Returns:
            Cleaned and structured hackathon data
        """
        return {
            'id': hackathon.get('id'),
            'title': hackathon.get('title'),
            'url': hackathon.get('url'),
            'thumbnail_url': hackathon.get('thumbnail_url'),
            'analytics_identifier': hackathon.get('analytics_identifier'),
            'featured': hackathon.get('featured', False),
            'organization_name': hackathon.get('organization_name'),
            'prize_amount': self._parse_prize_amount(hackathon.get('prize_amount')),
            'prize_amount_raw': hackathon.get('prize_amount'),
            'registrations_count': hackathon.get('registrations_count'),
            'submission_period_dates': hackathon.get('submission_period_dates'),
            'themes': hackathon.get('themes', []),
            'is_online': hackathon.get('online', False),
            'location': hackathon.get('location'),
            'open_state': hackathon.get('open_state'),  # upcoming, open, ended
            'description': hackathon.get('tagline') or hackathon.get('description', ''),
            'time_left_to_submission': hackathon.get('time_left_to_submission'),
            'submission_deadline': hackathon.get('submission_deadline'),
            'challenge_type': hackathon.get('challenge_type'),
            'eligible_criteria': hackathon.get('eligible_criteria'),
            'displayed_location': self._parse_displayed_location(hackathon.get('displayed_location', {})),
            'members_count': hackathon.get('members_count'),
            'num_winners_published': hackathon.get('num_winners_published'),
            'banner_image_url': hackathon.get('banner_image_url')
        }
    
    def _parse_displayed_location(self, location_dict: Dict) -> str:
        """
        Parse the displayed location into a readable string
        
        Args:
            location_dict: Dictionary containing location information
        
        Returns:
            Formatted location string
        """
        if not location_dict:
            return "Online"
        
        location = location_dict.get('location', '')
        if location:
            return location
        
        return "Online"
    
    def _parse_prize_amount(self, prize_str) -> float:
        """
        Parse prize amount from various formats (HTML, plain text, etc.)
        
        Args:
            prize_str: Prize amount as string (may contain HTML)
        
        Returns:
            Prize amount as float, 0 if cannot parse
        """
        if not prize_str:
            return 0.0
        
        # Convert to string if not already
        prize_str = str(prize_str)
        
        # Remove HTML tags
        prize_str = re.sub(r'<[^>]+>', '', prize_str)
        
        # Remove currency symbols and commas
        prize_str = prize_str.replace('$', '').replace(',', '').replace('€', '').replace('£', '')
        
        # Remove any whitespace
        prize_str = prize_str.strip()
        
        # Try to convert to float
        try:
            return float(prize_str)
        except (ValueError, TypeError):
            return 0.0
    
    def scrape_all_hackathons(self, max_pages: int = None) -> List[Dict]:
        """
        Scrape all available hackathons
        
        Args:
            max_pages: Maximum number of pages to scrape (None for all)
        
        Returns:
            List of all hackathon data
        """
        print("Starting Devpost hackathons scraping...")
        page = 1
        total_scraped = 0
        
        while True:
            if max_pages and page > max_pages:
                break
            
            print(f"Fetching page {page}...")
            data = self.fetch_hackathons(page=page)
            
            if not data:
                print("Failed to fetch data, stopping...")
                break
            
            hackathons = data.get('hackathons', [])
            
            if not hackathons:
                print("No more hackathons found.")
                break
            
            for hackathon in hackathons:
                extracted = self.extract_hackathon_data(hackathon)
                self.hackathons.append(extracted)
                total_scraped += 1
            
            print(f"Scraped {len(hackathons)} hackathons from page {page} (Total: {total_scraped})")
            
            # Check if there are more pages
            meta = data.get('meta', {})
            total_count = meta.get('total_count', 0)
            
            if total_scraped >= total_count:
                print("All hackathons scraped!")
                break
            
            page += 1
        
        print(f"\nTotal hackathons scraped: {len(self.hackathons)}")
        return self.hackathons
    
    def save_to_json(self, filename: str = "devpost_hackathons.json"):
        """
        Save scraped data to JSON file
        
        Args:
            filename: Output JSON filename
        """
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.hackathons, f, indent=2, ensure_ascii=False)
        print(f"Data saved to {filename}")
    
    def save_to_csv(self, filename: str = "devpost_hackathons.csv"):
        """
        Save scraped data to CSV file
        
        Args:
            filename: Output CSV filename
        """
        if not self.hackathons:
            print("No data to save!")
            return
        
        # Get all unique keys from all hackathons
        fieldnames = set()
        for hackathon in self.hackathons:
            fieldnames.update(hackathon.keys())
        fieldnames = sorted(fieldnames)
        
        with open(filename, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            
            for hackathon in self.hackathons:
                # Convert lists and dicts to strings for CSV
                row = {}
                for key, value in hackathon.items():
                    if isinstance(value, (list, dict)):
                        row[key] = json.dumps(value)
                    else:
                        row[key] = value
                writer.writerow(row)
        
        print(f"Data saved to {filename}")
    
    def get_statistics(self) -> Dict:
        """
        Get statistics about scraped hackathons
        
        Returns:
            Dictionary containing statistics
        """
        if not self.hackathons:
            return {}
        
        total = len(self.hackathons)
        online = sum(1 for h in self.hackathons if h.get('is_online'))
        featured = sum(1 for h in self.hackathons if h.get('featured'))
        
        # Count by state
        states = {}
        for h in self.hackathons:
            state = h.get('open_state', 'unknown')
            states[state] = states.get(state, 0) + 1
        
        # Total prize money (prize_amount is already float)
        total_prizes = sum(
            h.get('prize_amount', 0) or 0
            for h in self.hackathons
        )
        
        # Total registrations
        total_registrations = sum(
            int(h.get('registrations_count', 0) or 0) 
            for h in self.hackathons
        )
        
        return {
            'total_hackathons': total,
            'online_hackathons': online,
            'in_person_hackathons': total - online,
            'featured_hackathons': featured,
            'states': states,
            'total_prize_money': total_prizes,
            'total_registrations': total_registrations
        }
    
    def print_statistics(self):
        """
        Print statistics about scraped hackathons
        """
        stats = self.get_statistics()
        if not stats:
            print("No data available for statistics")
            return
        
        print("\n" + "="*50)
        print("DEVPOST HACKATHONS STATISTICS")
        print("="*50)
        print(f"Total Hackathons: {stats['total_hackathons']}")
        print(f"Online Hackathons: {stats['online_hackathons']}")
        print(f"In-Person Hackathons: {stats['in_person_hackathons']}")
        print(f"Featured Hackathons: {stats['featured_hackathons']}")
        print(f"\nTotal Prize Money: ${stats['total_prize_money']:,.2f}")
        print(f"Total Registrations: {stats['total_registrations']:,}")
        print("\nHackathons by State:")
        for state, count in stats['states'].items():
            print(f"  {state.capitalize()}: {count}")
        print("="*50 + "\n")


def main():
    """
    Main function to run the scraper
    """
    scraper = DevpostScraper()
    
    # Scrape all hackathons (or limit with max_pages parameter)
    hackathons = scraper.scrape_all_hackathons(max_pages=5)  # Remove max_pages to get all
    
    # Print statistics
    scraper.print_statistics()
    
    # Save data
    scraper.save_to_json("devpost_hackathons.json")
    scraper.save_to_csv("devpost_hackathons.csv")
    
    # Print first few hackathons as example
    print("\nExample Hackathons:")
    print("-" * 50)
    for i, hackathon in enumerate(hackathons[:3], 1):
        print(f"\n{i}. {hackathon['title']}")
        print(f"   Organization: {hackathon.get('organization_name', 'N/A')}")
        print(f"   Prize: ${hackathon.get('prize_amount', 0):,}")
        print(f"   Registrations: {hackathon.get('registrations_count', 'N/A')}")
        print(f"   Status: {hackathon.get('open_state', 'N/A')}")
        print(f"   Location: {hackathon.get('displayed_location', 'N/A')}")
        print(f"   Online: {'Yes' if hackathon.get('is_online') else 'No'}")
        print(f"   URL: {hackathon.get('url', 'N/A')}")


if __name__ == "__main__":
    # your main function call here
    main()