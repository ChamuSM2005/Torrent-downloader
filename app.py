from fastapi import FastAPI, HTTPException, Request, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
import uvicorn
import os
import threading

# Import our custom modules
from torrent_downloader import downloader
from torrent_search import search_engine

app = FastAPI(title="Cloud Torrent Engine")

# CORS Middleware (Crucial for React Frontend + FastAPI communication)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup Static & Templates (Optional if using React, but good for fallbacks)
os.makedirs("static", exist_ok=True)
os.makedirs("templates", exist_ok=True)
if os.path.exists("static"):
    app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# --- Data Models ---
class MagnetRequest(BaseModel):
    magnet: str

# --- Routes ---

@app.get("/api/search")
async def search_torrents(q: str = Query(..., min_length=2)):
    """
    Search endpoint.
    1. Fetches from Indexer (TPB).
    2. Sorts by Seeders.
    3. Returns JSON.
    """
    results = search_engine.search(q)
    return {"results": results}

@app.post("/api/download")
async def start_download(req: MagnetRequest):
    """
    Starts a download directly to Google Drive.
    """
    if not req.magnet.startswith("magnet:?"):
        raise HTTPException(status_code=400, detail="Invalid magnet link")
    
    try:
        torrent_id = downloader.add_magnet(req.magnet)
        return {"status": "success", "id": torrent_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/status")
async def get_status():
    """
    Returns real-time status of active downloads.
    """
    return downloader.get_all_status()

@app.delete("/api/torrent/{torrent_id}")
async def delete_torrent(torrent_id: str):
    if downloader.remove_torrent(torrent_id):
        return {"status": "deleted"}
    raise HTTPException(status_code=404, detail="Torrent not found")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
