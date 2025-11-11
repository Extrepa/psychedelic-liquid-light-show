
import React, { useState } from 'react';

interface WelcomeScreenProps {
  onBegin: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onBegin }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleBegin = () => {
    setIsExiting(true);
    setTimeout(onBegin, 500); // Match animation duration
  };

  return (
    <div
      className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center flex-col transition-opacity duration-500 ${isExiting ? 'opacity-0' : 'opacity-100'}`}
      aria-modal="true"
      role="dialog"
    >
      <div className="text-center text-white p-8 animate-fade-in-up">
        <h1 className="text-4xl md:text-6xl font-bold mb-4" style={{ textShadow: '0 0 15px rgba(255,255,255,0.3)' }}>
          Psychedelic Liquid Light Show
        </h1>
        <p className="text-xl md:text-2xl mb-8">
          This is a psychedelic experience. Are you ready?
        </p>
        <button
          onClick={handleBegin}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-500/50 shadow-lg shadow-purple-500/30"
        >
          OK
        </button>
      </div>
       <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
