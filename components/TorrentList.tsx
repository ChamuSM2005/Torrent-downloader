
import React from 'react';
import { TorrentStatus } from '../types';

interface TorrentListProps {
  torrents: TorrentStatus[];
}

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const TorrentList: React.FC<TorrentListProps> = ({ torrents }) => {
  if (torrents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-800">
        <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
          <i className="fa-solid fa-folder-open text-gray-600 text-2xl"></i>
        </div>
        <p className="text-gray-500 font-medium">No active downloads</p>
        <p className="text-gray-600 text-sm mt-1">Add a magnet link to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Active Torrents</h3>
        <span className="text-xs text-gray-500">{torrents.length} total</span>
      </div>
      
      {torrents.map((torrent) => (
        <div key={torrent.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-colors group">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${torrent.state === 'downloading' ? 'bg-blue-500/10 text-blue-500' : 'bg-gray-800 text-gray-500'}`}>
                <i className={`fa-solid ${torrent.state === 'downloading' ? 'fa-arrow-down' : 'fa-clock'} text-xl`}></i>
              </div>
              <div>
                <h4 className="font-semibold text-gray-100 line-clamp-1 mb-1">{torrent.name}</h4>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <i className="fa-solid fa-database"></i> {formatSize(torrent.total_size)}
                  </span>
                  <span className="flex items-center gap-1">
                    <i className="fa-solid fa-users"></i> {torrent.num_peers} Peers
                  </span>
                  <span className="capitalize px-2 py-0.5 rounded bg-gray-800 text-[10px] font-bold">
                    {torrent.state}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm font-bold text-gray-100">{torrent.progress.toFixed(1)}%</div>
              <div className="text-[10px] text-gray-500 mt-1 uppercase">ETA: {torrent.eta}</div>
            </div>
          </div>

          <div className="relative w-full h-2 bg-gray-800 rounded-full overflow-hidden mb-4">
            <div 
              className={`absolute top-0 left-0 h-full transition-all duration-1000 ${torrent.state === 'downloading' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-gray-600'}`}
              style={{ width: `${torrent.progress}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-blue-400">
                <i className="fa-solid fa-download"></i>
                <span>{formatSize(torrent.download_speed)}/s</span>
              </div>
              <div className="flex items-center gap-1.5 text-purple-400">
                <i className="fa-solid fa-upload"></i>
                <span>{formatSize(torrent.upload_speed)}/s</span>
              </div>
            </div>
            
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                <i className="fa-solid fa-pause"></i>
              </button>
              <button className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors">
                <i className="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TorrentList;
