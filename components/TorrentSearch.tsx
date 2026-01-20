
import React, { useState } from 'react';
import { SearchResult } from '../types';

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const TorrentSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setResults([]);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      setResults(data.results || []);
      if (data.results && data.results.length === 0) {
        setError('No results found.');
      }
    } catch (err) {
      setError('Failed to fetch search results. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (magnet: string) => {
    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ magnet }),
      });
      if (response.ok) {
        alert('Download started! Check Dashboard.');
      } else {
        alert('Failed to start download.');
      }
    } catch (err) {
      alert('Error connecting to backend.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-xl">
        <h2 className="text-xl font-bold mb-2">Global Torrent Index</h2>
        <p className="text-gray-400 text-sm mb-6">Search The Pirate Bay and public trackers directly. Results sorted by seeders.</p>
        
        <div className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search for Linux ISOs, Creative Commons media..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl py-3 px-4 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white font-semibold py-3 px-8 rounded-xl flex items-center gap-2 transition-all active:scale-95"
          >
            {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-magnifying-glass"></i>}
            Search
          </button>
        </div>
      </div>

      {error && (
        <div className="text-center py-8 text-gray-500">
          <p>{error}</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden shadow-xl animate-in fade-in slide-in-from-bottom-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-800/50 text-gray-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-4 font-semibold">Name</th>
                  <th className="p-4 font-semibold w-24">Size</th>
                  <th className="p-4 font-semibold w-20 text-green-400">Seeds</th>
                  <th className="p-4 font-semibold w-20 text-red-400">Leech</th>
                  <th className="p-4 font-semibold w-32 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-800">
                {results.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-800/50 transition-colors">
                    <td className="p-4 font-medium text-gray-200">
                      <div className="truncate max-w-md" title={item.name}>{item.name}</div>
                    </td>
                    <td className="p-4 text-gray-400 whitespace-nowrap">{formatSize(item.size)}</td>
                    <td className="p-4 text-green-400 font-mono">{item.seeders}</td>
                    <td className="p-4 text-red-400 font-mono">{item.leechers}</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleDownload(item.magnet)}
                        className="bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-blue-600/30 flex items-center justify-center gap-2 w-full"
                      >
                        <i className="fa-solid fa-download"></i> Drive
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TorrentSearch;
