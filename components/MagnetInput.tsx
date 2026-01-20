
import React, { useState } from 'react';

interface MagnetInputProps {
  onAdd: (magnet: string) => void;
}

const MagnetInput: React.FC<MagnetInputProps> = ({ onAdd }) => {
  const [magnet, setMagnet] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (magnet.trim().startsWith('magnet:?')) {
      onAdd(magnet.trim());
      setMagnet('');
    } else {
      alert('Please enter a valid magnet link.');
    }
  };

  return (
    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-xl">
      <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Start New Download</h3>
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <i className="fa-solid fa-link absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"></i>
          <input
            type="text"
            value={magnet}
            onChange={(e) => setMagnet(e.target.value)}
            placeholder="Paste magnet link here..."
            className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-12 pr-4 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-8 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-600/20"
        >
          <i className="fa-solid fa-plus"></i>
          Add Torrent
        </button>
      </form>
    </div>
  );
};

export default MagnetInput;
