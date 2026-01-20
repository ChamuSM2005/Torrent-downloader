
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import uvicorn
from torrent_manager import manager

app = FastAPI(title="Cloud Torrent AI Backend")

class MagnetRequest(BaseModel):
    magnet: str

@app.post("/api/download")
async def start_download(req: MagnetRequest):
    try:
        tid = manager.add_magnet(req.magnet)
        return {"status": "success", "id": tid}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/status")
async def get_status():
    return manager.get_all_status()

if __name__ == "__main__":
    # In Colab, you might need to use a tunnel like ngrok or serve locally
    uvicorn.run(app, host="0.0.0.0", port=8000)
