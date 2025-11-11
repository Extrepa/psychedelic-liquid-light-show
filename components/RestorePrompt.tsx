
import React from 'react';

interface RestorePromptProps {
  onRestore: () => void;
  onDismiss: () => void;
}

export const RestorePrompt: React.FC<RestorePromptProps> = ({ onRestore, onDismiss }) => {
  return (
    <div
      className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-gray-800/90 backdrop-blur-sm text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-4 animate-fade-in-down"
      role="alert"
      style={{ animation: 'fade-in-down 0.5s ease-out forwards' }}
    >
      <p className="font-semibold text-sm">Restore your previous session?</p>
      <div className="flex items-center gap-2">
        <button
          onClick={onRestore}
          className="px-4 py-1 text-sm font-medium text-white bg-blue-600 rounded-full hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 transition-colors"
        >
          Restore
        </button>
        <button
          onClick={onDismiss}
          className="px-4 py-1 text-sm font-medium text-gray-300 bg-gray-700/80 rounded-full hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-500 transition-colors"
        >
          Dismiss
        </button>
      </div>
      <style>{`
        @keyframes fade-in-down {
          0% {
            opacity: 0;
            transform: translate(-50%, -20px);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
