
import React, { useEffect, useRef } from 'react';
import { CloseIcon } from './icons/CloseIcon';

interface FlyoutPanelProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export const FlyoutPanel: React.FC<FlyoutPanelProps> = ({ isOpen, onClose, children, title }) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);
  
  return (
    <div 
        className={`fixed top-4 left-4 bottom-24 z-20 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-[110%]'}`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!isOpen}
        style={{ position: 'fixed', top: 16, left: 16, bottom: 96, zIndex: 4000, transform: isOpen ? 'translateX(0)' : 'translateX(-110%)', transition: 'transform 300ms ease-in-out', maxWidth: '22rem' }}
    >
      <div 
        ref={panelRef}
        className="h-full w-full bg-gray-900/80 backdrop-blur-md border border-gray-700/50 rounded-2xl p-4 overflow-y-auto flex flex-col"
        style={{ height: '100%', background: 'rgba(17,24,39,0.9)', border: '1px solid rgba(55,65,81,0.6)', borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', overflowY: 'auto', color: '#e5e7eb', textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}
      >
        <div className="flex justify-between items-center mb-4">
            {title && <h2 className="text-lg font-semibold text-white">{title}</h2>}
            <button
                onClick={onClose}
                className="p-1 text-gray-400 rounded-full hover:bg-gray-700 hover:text-white ml-auto"
                aria-label="Close panel"
            >
                <CloseIcon className="w-5 h-5"/>
            </button>
        </div>
        <div className="flex-1">
            {children}
        </div>
      </div>
    </div>
  );
};