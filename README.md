
# ☁️ Cloud Torrent Search & Drive Engine

A professional Torrent Search & Download suite running directly in Google Colab.

## 🌟 Features
1.  **Integrated Search**: Search The Pirate Bay index directly from the UI.
2.  **Smart Sorting**: Results auto-sorted by Seeder count (highest first).
3.  **Direct-to-Drive**: Writes file chunks directly to `/content/drive`.
4.  **No ZIPs**: Files are extracted/downloaded as-is.

## 📦 Installation (Google Colab)

**Step 1: Mount Drive**
```python
from google.colab import drive
drive.mount('/content/drive')
```

**Step 2: Install System Dependencies**
```bash
!apt install python3-libtorrent
```

**Step 3: Install App Requirements**
```bash
!pip install fastapi uvicorn requests beautifulsoup4 jinja2
```

**Step 4: Run the Engine**
Copy all project files (app.py, torrent_search.py, etc.) to Colab and run:

```python
import uvicorn
import threading
from app import app

# Start Server in Background
threading.Thread(target=lambda: uvicorn.run(app, host="0.0.0.0", port=8000), daemon=True).start()
```

**Step 5: Open UI**
Use the Colab port forwarder:
```python
from google.colab.output import eval_js
print(eval_js("google.colab.kernel.proxyPort(8000)"))
```

## ⚠️ Notes
- **Storage**: Ensure you have enough Google Drive space.
- **Seeding**: Cloud seeding stops when the Colab runtime disconnects.
- **Legal**: Use this tool only for content you have the legal right to download (e.g., Linux ISOs, Public Domain content).
