
import libtorrent as lt
import time
import os
import shutil

class TorrentDownloader:
    def __init__(self, base_save_path="/content/drive/MyDrive/MyTorrents/"):
        self.base_save_path = base_save_path
        self.ensure_base_path()
        
        # High-performance session settings
        self.ses = lt.session({
            'listen_interfaces': '0.0.0.0:6881',
            'download_rate_limit': 0,
            'upload_rate_limit': 0,
            'alert_mask': lt.alert.category_t.storage_notification
        })
        
        self.torrents = {} # id -> handle

    def ensure_base_path(self):
        """Ensures the Google Drive path exists, falls back to local if not mounted."""
        if not os.path.exists(self.base_save_path):
            try:
                os.makedirs(self.base_save_path, exist_ok=True)
                print(f"✅ Storage initialized: {self.base_save_path}")
            except Exception as e:
                print(f"⚠️ Drive not found. Falling back to local ./downloads/")
                self.base_save_path = "./downloads/"
                os.makedirs(self.base_save_path, exist_ok=True)

    def add_magnet(self, magnet_link):
        """Adds a magnet link to the download queue."""
        params = {
            'save_path': self.base_save_path,
            'storage_mode': lt.storage_mode_t(2), # storage_mode_sparse
        }
        try:
            handle = lt.add_magnet_uri(self.ses, magnet_link, params)
            torrent_id = str(int(time.time() * 1000))
            self.torrents[torrent_id] = handle
            return torrent_id
        except Exception as e:
            print(f"Error adding magnet: {e}")
            raise e

    def remove_torrent(self, torrent_id):
        """Removes a torrent from the session."""
        if torrent_id in self.torrents:
            handle = self.torrents.pop(torrent_id)
            self.ses.remove_torrent(handle)
            return True
        return False

    def get_all_status(self):
        """Returns the status of all active torrents."""
        result = []
        state_str = [
            'Queued', 'Checking', 'Metadata', 
            'Downloading', 'Finished', 'Seeding', 
            'Allocating', 'Checking Resume'
        ]

        for tid, handle in list(self.torrents.items()):
            try:
                if not handle.is_valid():
                    self.torrents.pop(tid)
                    continue

                s = handle.status()
                
                # Handle name resolution
                name = handle.name()
                if not name or name == "":
                    name = "Fetching Metadata..."
                
                # Calculate ETA
                eta = "∞"
                if s.download_rate > 0:
                    remaining = s.total_wanted - s.total_done
                    eta_seconds = remaining / s.download_rate
                    if eta_seconds > 3600:
                        eta = f"{int(eta_seconds // 3600)}h {int((eta_seconds % 3600) // 60)}m"
                    else:
                        eta = f"{int(eta_seconds // 60)}m {int(eta_seconds % 60)}s"

                result.append({
                    "id": tid,
                    "name": name,
                    "progress": round(s.progress * 100, 2),
                    "download_speed": s.download_rate,
                    "upload_speed": s.upload_rate,
                    "num_peers": s.num_peers,
                    "num_seeds": s.num_seeds,
                    "state": state_str[s.state],
                    "total_size": s.total_wanted,
                    "eta": eta
                })
            except Exception as e:
                print(f"Error processing status for {tid}: {e}")
                
        return result

# Global instance
downloader = TorrentDownloader()
