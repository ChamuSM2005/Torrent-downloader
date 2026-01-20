
import React, { useState, useEffect, useCallback } from 'react';
import { AppTab, TorrentStatus } from './types';
import TorrentList from './components/TorrentList';
import MagnetInput from './components/MagnetInput';
import SearchGrounding from './components/SearchGrounding';
import TorrentSearch from './components/TorrentSearch';
import ImageWorkshop from './components/ImageWorkshop';
import Sidebar from './components/Sidebar';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.DASHBOARD);
  const [torrents, setTorrents] = useState<TorrentStatus[]>([]);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/status');
      if (response.ok) {
        const data = await response.json();
        setTorrents(data);
        setIsBackendConnected(true);
      } else {
        setIsBackendConnected(false);
        throw new Error("Backend not reachable");
      }
    } catch (err) {
      setIsBackendConnected(false);
      // Fallback is handled by the initial state or loading indicators, avoiding noisy mock data overwrites if simple connection failure
      if (torrents.length === 0) {
         // Optional: Keep mock data for dev preview only if absolutely no data exists
      }
    }
  }, [torrents.length]);

  useEffect(() => {
    const intervalId = setInterval(fetchStatus, 2000);
    return () => clearInterval(intervalId);
  }, [fetchStatus]);

  const handleAddMagnet = async (magnet: string) => {
    try {
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ magnet })
      });
      if (res.ok) {
        fetchStatus();
      }
    } catch (err) {
      console.error("Failed to add magnet:", err);
      // Mock local addition for demonstration
      const newTorrent: TorrentStatus = {
        id: Math.random().toString(36).substr(2, 9),
        name: 'New Magnet Task (Offline Demo)',
        progress: 0,
        download_speed: 0,
        upload_speed: 0,
        num_peers: 0,
        state: 'queued',
        total_size: 0,
        eta: '...'
      };
      setTorrents((prev) => [...prev, newTorrent]);
    }
  };

  const totalDownload = torrents.reduce((acc, t) => acc + t.download_speed, 0);
  const totalUpload = torrents.reduce((acc, t) => acc + t.upload_speed, 0);

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 border-b border-gray-800 flex items-center justify-between px-8 bg-gray-900/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold gradient-text">Cloud Torrent AI</h1>
            <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${isBackendConnected ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'}`}>
              {isBackendConnected ? 'Connected' : 'Offline / Mock'}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-arrow-down text-blue-500"></i>
              <span>{Math.round(totalDownload / 1024 / 1024)} MB/s</span>
            </div>
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-arrow-up text-purple-500"></i>
              <span>{Math.round(totalUpload / 1024 / 1024)} MB/s</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            {activeTab === AppTab.DASHBOARD && (
              <>
                <MagnetInput onAdd={handleAddMagnet} />
                <TorrentList torrents={torrents} />
              </>
            )}

            {activeTab === AppTab.SEARCH && <TorrentSearch />}
            
            {activeTab === AppTab.SMART_INFO && <SearchGrounding />}
            {activeTab === AppTab.CREATIVE && <ImageWorkshop />}

            {activeTab === AppTab.HELP && (
              <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
                <h2 className="text-2xl font-bold mb-4">How to use Cloud Torrent AI</h2>
                <div className="prose prose-invert max-w-none space-y-4 text-gray-400">
                  <p>1. <strong>Connect to Google Drive:</strong> Ensure your backend is running in a Colab environment with Drive mounted at <code>/content/drive</code>.</p>
                  <p>2. <strong>Search:</strong> Use the "Search Index" tab to find torrents on public trackers (TPB).</p>
                  <p>3. <strong>Smart Info:</strong> Use "Smart Info" to ask Gemini about specific files or media content.</p>
                  <p>4. <strong>Creative Lab:</strong> Remix or edit posters/covers for your downloaded media using Gemini.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
