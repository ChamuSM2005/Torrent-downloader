
import React, { useState } from 'react';
import { searchTorrentInfo } from '../services/gemini';

const SearchGrounding: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ text: string; sources: any[] } | null>(null);

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const data = await searchTorrentInfo(query);
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-xl">
        <h2 className="text-xl font-bold mb-2">Smart Content Intelligence</h2>
        <p className="text-gray-400 text-sm mb-6">Ask Gemini about any media, software, or file to get context and reviews.</p>
        
        <div className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="e.g. Big Buck Bunny movie details and cast..."
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

      {result && (
        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 shadow-xl animate-in fade-in slide-in-from-bottom-4">
          <div className="prose prose-invert max-w-none mb-8 text-gray-300 whitespace-pre-wrap leading-relaxed">
            {result.text}
          </div>

          {result.sources.length > 0 && (
            <div className="border-t border-gray-800 pt-6">
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-4 tracking-widest">Sources & References</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.sources.map((source, idx) => (
                  <a
                    key={idx}
                    href={source.web?.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-800 hover:border-blue-500/30 transition-all text-sm group"
                  >
                    <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center shrink-0">
                      <i className="fa-solid fa-globe text-blue-400"></i>
                    </div>
                    <span className="text-gray-300 truncate group-hover:text-blue-400">
                      {source.web?.title || source.web?.uri}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchGrounding;
