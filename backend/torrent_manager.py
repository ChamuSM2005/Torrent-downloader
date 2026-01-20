
import libtorrent as lt
import time
import os
import threading

class TorrentManager:
    def __init__(self, save_path="/content/drive/MyDrive/MyTorrents/"):
        self.save_path = save_path
        if not os.path.exists(save_path):
            os.makedirs(save_path, exist_ok=True)
            
        self.ses = lt.session({'listen_interfaces': '0.0.0.0:6881'})
        self.torrents = {} # handle_id -> handle
        self.status_data = {}

    def add_magnet(self, magnet_link):
        params = {
            'save_path': self.save_path,
            'storage_mode': lt.storage_mode_t(2),
        }
        handle = lt.add_magnet_uri(self.ses, magnet_link, params)
        torrent_id = str(time.time())
        self.torrents[torrent_id] = handle
        print(f"Added torrent: {magnet_link}")
        return torrent_id

    def get_all_status(self):
        result = []
        for tid, handle in self.torrents.items():
            s = handle.status()
            
            # Formatting state
            state_str = ['queued', 'checking', 'downloading_metadata', 
                         'downloading', 'finished', 'seeding', 'allocating', 'checking_resume_data']
            
            # Attempt to get name (might not be available during metadata download)
            name = handle.name() if handle.has_metadata() else "Downloading Metadata..."
            
            # Create subfolder based on name once metadata is fetched
            if handle.has_metadata() and not getattr(handle, '_subfolder_created', False):
                new_save_path = os.path.join(self.save_path, name)
                os.makedirs(new_save_path, exist_ok=True)
                # Technically we should move storage but for Colab simplicity we let libtorrent handle the root
                handle._subfolder_created = True

            eta = "Calculating..."
            if s.download_rate > 0:
                remaining_bytes = s.total_wanted - s.total_done
                eta_seconds = remaining_bytes / s.download_rate
                eta = time.strftime("%Hh %Mm %Ss", time.gmtime(eta_seconds))

            result.append({
                "id": tid,
                "name": name,
                "progress": s.progress * 100,
                "download_speed": s.download_rate,
                "upload_speed": s.upload_rate,
                "num_peers": s.num_peers,
                "state": state_str[s.state],
                "total_size": s.total_wanted,
                "eta": eta
            })
        return result

# Global Instance
manager = TorrentManager()
