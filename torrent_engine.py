
import libtorrent as lt
import time
import os
import threading

class TorrentEngine:
    def __init__(self, base_save_path="/content/drive/MyDrive/MyTorrents/"):
        self.base_save_path = base_save_path
        self.ensure_base_path()
        
        # Configure session for high speed
        self.ses = lt.session({
            'listen_interfaces': '0.0.0.0:6881',
            'download_rate_limit': 0,
            'upload_rate_limit': 0,
            'active_downloads': 20,
            'active_seeds': 20,
        })
        
        self.torrents = {} # id -> handle
        self.start_time = time.time()

    def ensure_base_path(self):
        if not os.path.exists(self.base_save_path):
            try:
                os.makedirs(self.base_save_path, exist_ok=True)
                print(f"Created base storage: {self.base_save_path}")
            except Exception as e:
                print(f"Error creating storage: {e}. Falling back to local.")
                self.base_save_path = "./downloads/"
                os.makedirs(self.base_save_path, exist_ok=True)

    def add_magnet(self, magnet_link):
        params = {
            'save_path': self.base_save_path,
            'storage_mode': lt.storage_mode_t(2),
        }
        handle = lt.add_magnet_uri(self.ses, magnet_link, params)
        torrent_id = str(int(time.time() * 1000))
        self.torrents[torrent_id] = handle
        return torrent_id

    def remove_torrent(self, torrent_id):
        if torrent_id in self.torrents:
            handle = self.torrents.pop(torrent_id)
            self.ses.remove_torrent(handle)
            return True
        return False

    def get_all_status(self):
        result = []
        # State mapping
        state_str = [
            'Queued', 'Checking', 'Downloading Metadata', 
            'Downloading', 'Finished', 'Seeding', 
            'Allocating', 'Checking Resume Data'
        ]

        for tid, handle in list(self.torrents.items()):
            try:
                s = handle.status()
                name = handle.name() if handle.has_metadata() else "Fetching metadata..."
                
                # Direct-to-Drive logic: Once metadata is present, ensure correct subfolder
                # libtorrent handles the internal folder structure based on save_path
                
                eta = "0s"
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
                    "state": state_str[s.state],
                    "total_size": s.total_wanted,
                    "eta": eta
                })
            except Exception as e:
                print(f"Error reading torrent {tid}: {e}")
                
        return result

# Global instance
engine = TorrentEngine()
