
import React, { useState, useEffect } from 'react';
import { FilmIcon } from './icons/FilmIcon';
import { CloseIcon } from './icons/CloseIcon';
import { getExportDefaults } from '../ui/prefs';

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
      const d = getExportDefaults();
      setDuration(d.duration);
      setQuality(d.quality);
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
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
    >
      <div 
        className="w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-gray-900/80 backdrop-blur-md border border-gray-700/60 rounded-2xl shadow-2xl p-6">
        <div className="flex justify-between items-start mb-4">
            <h2 id="export-modal-title" className="text-lg font-semibold text-white">Export as Video</h2>
            <button onClick={handleClose} aria-label="Close export dialog" className="p-1 text-gray-400 rounded-full hover:bg-gray-700 hover:text-white">
                <CloseIcon className="w-5 h-5" />
            </button>
        </div>
        
        {isRecording && (
          <div className="text-center">
            <p className="text-lg text-white mb-4">Recording...</p>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div className="bg-blue-600 h-2.5 rounded-full animate-pulse" style={{ width: '100%' }}></div>
            </div>
             <p className="text-sm text-gray-400 mt-2">Please wait, this may take a moment.</p>
          </div>
        )}

        {downloadUrl && (
          <div className="text-center">
             <p className="text-lg text-white mb-4">Your video is ready!</p>
             <a 
                href={downloadUrl}
                download={`liquid-light-show-${Date.now()}.webm`}
                className="inline-block px-6 py-3 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
            >
                Download Video
            </a>
          </div>
        )}

        {!isRecording && !downloadUrl && (
          <>
            <p className="text-sm text-gray-300 mb-4">Choose your preferred export settings.</p>
            
            <div className="mb-4">
              <label htmlFor="duration" className="block text-sm font-medium text-gray-300 mb-2">Duration</label>
              <select 
                id="duration"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full bg-gray-900/70 border border-gray-600 text-white rounded-md px-3 py-2"
              >
                <option value="5">5 seconds</option>
                <option value="10">10 seconds</option>
                <option value="15">15 seconds</option>
                <option value="30">30 seconds</option>
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="quality" className="block text-sm font-medium text-gray-300 mb-2">Quality</label>
               <select 
                id="quality"
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value))}
                className="w-full bg-gray-900/70 border border-gray-600 text-white rounded-md px-3 py-2"
              >
                <option value="1000000">Low (1 Mbps)</option>
                <option value="5000000">Medium (5 Mbps)</option>
                <option value="10000000">High (10 Mbps)</option>
              </select>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button 
                onClick={handleClose} 
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
              <button 
                onClick={handleStart}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center gap-2"
              >
                <FilmIcon className="w-4 h-4" />
                Start Recording
              </button>
            </div>
          </>
        )}
        </div>
      </div>
    </div>
  );
};
