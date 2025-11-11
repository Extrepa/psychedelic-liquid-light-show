import React from 'react';
import { PlayIcon } from './icons/PlayIcon';
import { PauseIcon } from './icons/PauseIcon';
import { UndoIcon } from './icons/UndoIcon';
import { RedoIcon } from './icons/RedoIcon';
import { SaveIcon } from './icons/SaveIcon';
import { GalleryIcon } from './icons/GalleryIcon';
import { FilmIcon } from './icons/FilmIcon';
import { HomeIcon } from './icons/HomeIcon';
import { TrashIcon } from './icons/TrashIcon';

interface QuickActionsDockProps {
  isRecording: boolean;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onOpenGallery: () => void;
  onExport: () => void;
  onGoToMenu: () => void;
  onClear: () => void;
}

const QAButton: React.FC<React.PropsWithChildren<{ onClick: () => void; label: string }>> = ({ onClick, label, children }) => (
  <button
    onClick={onClick}
    className="p-2 rounded-lg text-gray-200 hover:text-white hover:bg-gray-700 transition-colors"
    aria-label={label}
    title={label}
  >
    {children}
  </button>
);

export const QuickActionsDock: React.FC<QuickActionsDockProps> = ({ isRecording, isPlaying, onTogglePlay, onUndo, onRedo, onSave, onOpenGallery, onExport, onGoToMenu, onClear }) => {
  return (
    <div className="fixed top-4 right-4 z-30 pointer-events-auto" style={{ position: 'fixed', top: 16, right: 16, zIndex: 3000 }}>
      <div
        className="bg-gray-900/70 backdrop-blur-md border border-gray-700/50 rounded-xl shadow-xl flex items-center gap-1 px-2"
        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(17,24,39,0.7)', border: '1px solid rgba(55,65,81,0.5)', borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}
      >
        <QAButton onClick={onTogglePlay} label={isPlaying ? 'Pause' : 'Play'}>
          {isPlaying ? <PauseIcon className="w-5 h-5"/> : <PlayIcon className="w-5 h-5"/>}
        </QAButton>
        <QAButton onClick={onUndo} label="Undo"><UndoIcon className="w-5 h-5"/></QAButton>
        <QAButton onClick={onRedo} label="Redo"><RedoIcon className="w-5 h-5"/></QAButton>
        <div className="w-px h-6 bg-gray-700 mx-1" style={{ width: 1, height: 24, background: '#374151', margin: '0 4px' }}/>
        <QAButton onClick={onSave} label="Save"><SaveIcon className="w-5 h-5"/></QAButton>
        <QAButton onClick={onOpenGallery} label="Gallery"><GalleryIcon className="w-5 h-5"/></QAButton>
        <QAButton onClick={onClear} label="Clear"><TrashIcon className="w-5 h-5"/></QAButton>
        <QAButton onClick={onExport} label="Export">
          <div className="relative" style={{ position: 'relative' }}>
            <FilmIcon className="w-5 h-5"/>
            {isRecording && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ position: 'absolute', top: -4, right: -4, width: 8, height: 8, background: '#ef4444', borderRadius: '50%' }}/>}        
          </div>
        </QAButton>
        <div className="w-px h-6 bg-gray-700 mx-1" style={{ width: 1, height: 24, background: '#374151', margin: '0 4px' }}/>
        <QAButton onClick={onGoToMenu} label="Menu"><HomeIcon className="w-5 h-5"/></QAButton>
      </div>
    </div>
  );
};
