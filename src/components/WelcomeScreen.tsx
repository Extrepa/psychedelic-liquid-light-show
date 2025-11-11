
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
      style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5000, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}
    >
      <div className="text-center text-white p-8 animate-fade-in-up" style={{ textAlign: 'center', color: '#fff', padding: 24, maxWidth: 880 }}>
        <h1 className="text-4xl md:text-6xl font-bold mb-4" style={{ fontSize: '3.2rem', fontWeight: 800, marginBottom: 16, textShadow: '0 0 18px rgba(255,255,255,0.35)' }}>
          Psychedelic Liquid Light Show
        </h1>
        <p className="text-xl md:text-2xl mb-8" style={{ fontSize: '1.25rem', opacity: 0.9, marginBottom: 16 }}>
          This is a psychedelic experience. Are you ready?
        </p>
        <p style={{ fontSize: '0.95rem', color: '#d1d5db', marginBottom: 24 }}>
          Heads-up: Rapid colors, motion, and flashing effects. If you’re sensitive to such visuals, proceed with care.
        </p>
        <button
          onClick={handleBegin}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-500/50 shadow-lg shadow-purple-500/30"
          style={{ background: '#7c3aed', padding: '12px 28px', borderRadius: 999, fontWeight: 700, fontSize: '1.1rem', boxShadow: '0 10px 30px rgba(124,58,237,0.35)' }}
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