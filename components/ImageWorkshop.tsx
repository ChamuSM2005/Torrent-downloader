
import React, { useState, useRef } from 'react';
import { editMediaImage } from '../services/gemini';

const ImageWorkshop: React.FC = () => {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSourceImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async () => {
    if (!sourceImage || !prompt) return;
    setLoading(true);
    try {
      // Remove data:image/...;base64,
      const base64 = sourceImage.split(',')[1];
      const result = await editMediaImage(base64, prompt);
      setResultImage(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-xl">
        <h2 className="text-xl font-bold mb-2">Creative Media Lab</h2>
        <p className="text-gray-400 text-sm mb-6">Upload a cover or poster and use AI to remix, filter, or enhance it.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="aspect-[4/3] bg-gray-800 border-2 border-dashed border-gray-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/50 hover:bg-gray-800/80 transition-all overflow-hidden relative group"
            >
              {sourceImage ? (
                <>
                  <img src={sourceImage} className="w-full h-full object-cover" alt="Source" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-sm font-semibold">Change Image</p>
                  </div>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-cloud-arrow-up text-3xl text-gray-600 mb-2"></i>
                  <p className="text-gray-500 text-sm">Click to upload poster</p>
                </>
              )}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
          </div>

          <div className="flex flex-col h-full">
            <label className="text-xs font-bold text-gray-500 uppercase mb-2 tracking-widest">Edit Instructions</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. 'Add a retro cyberpunk filter and increase the contrast' or 'Change the background to Mars'"
              className="flex-1 bg-gray-800 border border-gray-700 rounded-xl p-4 text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 mb-4"
            ></textarea>
            <button
              onClick={handleEdit}
              disabled={loading || !sourceImage}
              className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-purple-600/20"
            >
              {loading ? <i className="fa-solid fa-wand-sparkles fa-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
              Generate Masterpiece
            </button>
          </div>
        </div>
      </div>

      {resultImage && (
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-xl animate-in zoom-in-95">
          <h3 className="text-center text-sm font-bold text-gray-500 uppercase mb-6 tracking-widest">Result</h3>
          <div className="max-w-xl mx-auto rounded-xl overflow-hidden shadow-2xl">
            <img src={resultImage} alt="Edited Result" className="w-full h-auto" />
          </div>
          <div className="mt-8 flex justify-center gap-4">
            <a 
              href={resultImage} 
              download="cloud-torr-ai-edit.png"
              className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg flex items-center gap-2 border border-gray-700"
            >
              <i className="fa-solid fa-download"></i> Download
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageWorkshop;
