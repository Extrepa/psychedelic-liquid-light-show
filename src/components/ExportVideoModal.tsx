
import React, { useState, useEffect } from 'react';
import { FilmIcon } from './icons/FilmIcon';
import { CloseIcon } from './icons/CloseIcon';

interface ExportVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartRecording: (duration: number, quality: number) => void;
  isRecording: boolean;
  downloadUrl: string | null;
  setDownloadUrl: (url: string | null) => void;
}

export const ExportVideoModal: React.FC<ExportVideoModalProps> = ({ isOpen, onClose, onStartRecording, isRecording, downloadUrl, setDownloadUrl }) => {
  const [duration, setDuration] = useState(10);
  const [quality, setQuality] = useState(5000000); // 5 Mbps

  useEffect(() => {
    if (isOpen) {
      setDownloadUrl(null); // Reset download URL when modal opens
    }
  }, [isOpen, setDownloadUrl]);

  if (!isOpen) return null;

  const handleStart = () => {
    onStartRecording(duration, quality);
  };
  
  const handleClose = () => {
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
    }
    setDownloadUrl(null);
    onClose();
  }

  return (
    <div 
      className="fixed z-50"
      role="dialog"
      aria-modal="false"
      aria-labelledby="export-modal-title"
      style={{ position:'fixed', top: 64, right: 16, width: 360, zIndex: 5000 }}
    >
      <div 
        className="bg-gray-900/90 border border-gray-700 rounded-xl shadow-2xl w-full p-4 backdrop-blur"
      >
        <div className="flex justify-between items-start mb-2">
            <h2 id="export-modal-title" className="text-sm font-bold text-white">Export as Video</h2>
            <button onClick={handleClose} aria-label="Close export dialog" className="p-1 text-gray-300 rounded hover:bg-gray-700 hover:text-white">
                <CloseIcon className="w-4 h-4" />
            </button>
        </div>
        
        {isRecording && (
          <div className="text-center">
            <p className="text-sm text-white mb-3">Recording...</p>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
            </div>
            <p className="text-xs text-gray-400 mt-2">Please wait, this may take a moment.</p>
          </div>
        )}

        {downloadUrl && (
          <div className="text-center">
             <p className="text-sm text-white mb-3">Your video is ready!</p>
             <a 
                href={downloadUrl}
                download={`liquid-light-show-${Date.now()}.webm`}
                className="inline-block px-4 py-2 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
            >
                Download Video
            </a>
          </div>
        )}

        {!isRecording && !downloadUrl && (
          <>
            <p className="text-xs text-gray-300 mb-2">Choose your export settings.</p>
            
            <div className="mb-2">
              <label htmlFor="duration" className="block text-xs font-medium text-gray-300 mb-1">Duration</label>
              <select 
                id="duration"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full bg-gray-900/70 border border-gray-600 text-white rounded-md px-2 py-1 text-xs"
              >
                <option value="5">5 seconds</option>
                <option value="10">10 seconds</option>
                <option value="15">15 seconds</option>
                <option value="30">30 seconds</option>
              </select>
            </div>

            <div className="mb-2">
              <label htmlFor="quality" className="block text-xs font-medium text-gray-300 mb-1">Quality</label>
               <select 
                id="quality"
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value))}
                className="w-full bg-gray-900/70 border border-gray-600 text-white rounded-md px-2 py-1 text-xs"
              >
                <option value="1000000">Low (1 Mbps)</option>
                <option value="5000000">Medium (5 Mbps)</option>
                <option value="10000000">High (10 Mbps)</option>
              </select>
            </div>

            <div className="mt-3 flex justify-end gap-2">
              <button onClick={handleClose} className="px-3 py-1 text-xs font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600">Cancel</button>
              <button onClick={handleStart} className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center gap-1">
                <FilmIcon className="w-3 h-3" /> Start
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};