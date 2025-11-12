
import React from 'react';
import { Tooltip } from './Tooltip';
import { BeakerIcon } from './icons/BeakerIcon';
import { PaletteIcon } from './icons/PaletteIcon';
import { WandIcon } from './icons/WandIcon';
import { PaintbrushIcon } from './icons/PaintbrushIcon';
import { FilmIcon } from './icons/FilmIcon';
import { PlayIcon } from './icons/PlayIcon';
import { PauseIcon } from './icons/PauseIcon';
import { UndoIcon } from './icons/UndoIcon';
import { RedoIcon } from './icons/RedoIcon';
import { SaveIcon } from './icons/SaveIcon';
import { GalleryIcon } from './icons/GalleryIcon';
import { HomeIcon } from './icons/HomeIcon';
import { GearIcon } from './icons/GearIcon';

export type Tab = 'simulation' | 'colors' | 'effects' | 'brush' | 'presets' | 'settings';

interface ToolbarProps {
    activePanel: Tab | null;
    setActivePanel: (panel: Tab | null) => void;
    onExport: () => void;
    isRecording: boolean;
    isPlaying: boolean;
    onTogglePlay: () => void;
    onUndo: () => void;
    onRedo: () => void;
    onSave: () => void;
    onOpenGallery: () => void;
    onGoToMenu: () => void;
}

export const TABS: { id: Tab, label: string, icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
    { id: 'simulation', label: 'Simulation', icon: BeakerIcon },
    { id: 'colors', label: 'Colors', icon: PaletteIcon },
    { id: 'effects', label: 'Effects', icon: WandIcon },
    { id: 'brush', label: 'Brush', icon: PaintbrushIcon },
    { id: 'presets', label: 'Presets', icon: PaletteIcon },
    { id: 'settings', label: 'Settings', icon: GearIcon },
];

export const Toolbar: React.FC<ToolbarProps> = ({ 
    activePanel, 
    setActivePanel, 
    onExport, 
    isRecording,
    isPlaying,
    onTogglePlay,
    onUndo,
    onRedo,
    onSave,
    onOpenGallery,
    onGoToMenu
}) => {
    
    const handleTabClick = (tabId: Tab) => {
        setActivePanel(activePanel === tabId ? null : tabId);
    };

    return (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none w-full px-4">
            <div className="flex items-center justify-center gap-2 p-2 bg-gray-900/70 backdrop-blur-md border border-gray-700/50 rounded-2xl shadow-2xl pointer-events-auto max-w-max mx-auto">
                
                <Tooltip text={isPlaying ? "Pause" : "Play"}>
                  <button onClick={onTogglePlay} className="p-3 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg">
                    {isPlaying ? <PauseIcon className="w-6 h-6"/> : <PlayIcon className="w-6 h-6"/>}
                  </button>
                </Tooltip>
                <Tooltip text="Undo">
                  <button onClick={onUndo} className="p-3 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg">
                    <UndoIcon className="w-6 h-6" />
                  </button>
                </Tooltip>
                <Tooltip text="Redo">
                  <button onClick={onRedo} className="p-3 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg">
                    <RedoIcon className="w-6 h-6" />
                  </button>
                </Tooltip>
                
                <div className="w-px h-8 bg-gray-700 mx-1" />

                {TABS.map(tab => (
                    <Tooltip key={tab.id} text={tab.label}>
                        <button
                            onClick={() => handleTabClick(tab.id)}
                            className={`p-3 rounded-lg transition-colors ${activePanel === tab.id ? 'bg-purple-600/50 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                            aria-pressed={activePanel === tab.id}
                        >
                            <tab.icon className="w-6 h-6" />
                        </button>
                    </Tooltip>
                ))}

                <div className="w-px h-8 bg-gray-700 mx-1" />
                
                <Tooltip text="Save Artwork">
                  <button onClick={onSave} className="p-3 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg">
                    <SaveIcon className="w-6 h-6" />
                  </button>
                </Tooltip>
                <Tooltip text="Open Gallery">
                  <button onClick={onOpenGallery} className="p-3 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg">
                    <GalleryIcon className="w-6 h-6" />
                  </button>
                </Tooltip>
                <Tooltip text="Export as Video">
                    <button
                        onClick={onExport}
                        className={`p-3 rounded-lg transition-colors text-gray-300 hover:bg-gray-700 hover:text-white relative ${isRecording ? 'text-red-400' : ''}`}
                    >
                        <FilmIcon className="w-6 h-6" />
                        {isRecording && <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>}
                    </button>
                </Tooltip>
                <div className="w-px h-8 bg-gray-700 mx-1" />
                <Tooltip text="Main Menu">
                    <button onClick={onGoToMenu} className="p-3 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg">
                        <HomeIcon className="w-6 h-6" />
                    </button>
                </Tooltip>
            </div>
        </div>
    );
};
