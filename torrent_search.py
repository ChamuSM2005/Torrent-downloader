
import requests
import urllib.parse

class TorrentSearchEngine:
    """
    Handles searching for torrents using the APILayer (The Pirate Bay backend).
    This is chosen over HTML scraping for speed, reliability, and JSON output.
    """
    
    BASE_URL = "https://apibay.org/q.php"
    TRACKERS = [
        "udp://tracker.coppersurfer.tk:6969/announce",
        "udp://tracker.openbittorrent.com:80",
        "udp://open.demonii.com:1337/announce",
        "udp://tracker.opentrackr.org:1337/announce",
        "udp://p4p.arenabg.com:1337",
        "wss://tracker.openwebtorrent.com"
    ]

    def search(self, query: str):
        """
        Searches for torrents, sorts by seeders, and generates magnet links.
        """
        try:
            # Clean query
            clean_query = urllib.parse.quote(query)
            url = f"{self.BASE_URL}?q={clean_query}&cat=0"
            
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            results = response.json()

            # Handle "No results found" API response
            if isinstance(results, list) and len(results) == 1 and results[0].get('name') == 'No results found':
                return []

            processed_results = []
            
            for item in results:
                # Filter out garbage data
                if item['id'] == '0':
                    continue

                info_hash = item['info_hash']
                name = item['name']
                seeders = int(item['seeders'])
                leechers = int(item['leechers'])
                size_bytes = int(item['size'])
                
                # Generate Magnet Link
                magnet = self._generate_magnet(info_hash, name)

                processed_results.append({
                    "name": name,
                    "size": size_bytes,
                    "seeders": seeders,
                    "leechers": leechers,
                    "magnet": magnet,
                    "source": "TPB"
                })

            # Sort by Seeders (Descending) - MANDATORY REQUIREMENT
            processed_results.sort(key=lambda x: x['seeders'], reverse=True)

            return processed_results

        except Exception as e:
            print(f"Search Error: {e}")
            return []

    def _generate_magnet(self, info_hash: str, name: str) -> str:
        """
        Constructs a magnet link from the infohash and name.
        """
        magnet = f"magnet:?xt=urn:btih:{info_hash}&dn={urllib.parse.quote(name)}"
        for tracker in self.TRACKERS:
            magnet += f"&tr={urllib.parse.quote(tracker)}"
        return magnet

# Global Instance
search_engine = TorrentSearchEngine()
