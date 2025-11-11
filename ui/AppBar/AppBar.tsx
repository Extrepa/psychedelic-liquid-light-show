import React from 'react';
import { Tooltip } from '../../components/Tooltip';
import { BeakerIcon } from '../../components/icons/BeakerIcon';
import { PaletteIcon } from '../../components/icons/PaletteIcon';
import { WandIcon } from '../../components/icons/WandIcon';
import { PaintbrushIcon } from '../../components/icons/PaintbrushIcon';
import { FilmIcon } from '../../components/icons/FilmIcon';
import { PlayIcon } from '../../components/icons/PlayIcon';
import { PauseIcon } from '../../components/icons/PauseIcon';
import { UndoIcon } from '../../components/icons/UndoIcon';
import { RedoIcon } from '../../components/icons/RedoIcon';
import { SaveIcon } from '../../components/icons/SaveIcon';
import { GalleryIcon } from '../../components/icons/GalleryIcon';
import { HomeIcon } from '../../components/icons/HomeIcon';
import { GearIcon } from '../../components/icons/GearIcon';
import { GridIcon } from '../../components/icons/GridIcon';

export type Tab = 'simulation' | 'colors' | 'effects' | 'brush' | 'settings';

interface AppBarProps {
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
  isGridVisible?: boolean;
  onToggleGrid?: () => void;
}

const TABS: { id: Tab, label: string, icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
  { id: 'simulation', label: 'Simulation', icon: BeakerIcon },
  { id: 'colors', label: 'Colors', icon: PaletteIcon },
  { id: 'effects', label: 'Effects', icon: WandIcon },
  { id: 'brush', label: 'Brush', icon: PaintbrushIcon },
  { id: 'settings', label: 'Settings', icon: GearIcon },
];

export const AppBar: React.FC<AppBarProps> = ({
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
  onGoToMenu,
  isGridVisible,
  onToggleGrid,
}) => {
  const handleTabClick = (tabId: Tab) => {
    setActivePanel(activePanel === tabId ? null : tabId);
  };

  return (
    <div className="fixed top-4 left-4 z-40 pointer-events-none">
      <div className="flex items-center gap-2 p-2 bg-gray-900/70 backdrop-blur-md border border-gray-700/50 rounded-2xl shadow-2xl pointer-events-auto">
        <Tooltip text={isPlaying ? 'Pause' : 'Play'}>
          <button onClick={onTogglePlay} className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg">
            {isPlaying ? <PauseIcon className="w-5 h-5"/> : <PlayIcon className="w-5 h-5"/>}
          </button>
        </Tooltip>
        <Tooltip text="Undo">
          <button onClick={onUndo} className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg">
            <UndoIcon className="w-5 h-5" />
          </button>
        </Tooltip>
        <Tooltip text="Redo">
          <button onClick={onRedo} className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg">
            <RedoIcon className="w-5 h-5" />
          </button>
        </Tooltip>

        <div className="w-px h-6 bg-gray-700 mx-1" />

        {TABS.map(tab => (
          <Tooltip key={tab.id} text={tab.label}>
            <button
              onClick={() => handleTabClick(tab.id)}
              className={`p-2 rounded-lg transition-colors ${activePanel === tab.id ? 'bg-purple-600/50 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
              aria-pressed={activePanel === tab.id}
            >
              <tab.icon className="w-5 h-5" />
            </button>
          </Tooltip>
        ))}

        <div className="w-px h-6 bg-gray-700 mx-1" />

        {onToggleGrid && (
          <Tooltip text={isGridVisible ? 'Hide Grid' : 'Show Grid'}>
            <button onClick={onToggleGrid} className={`p-2 rounded-lg ${isGridVisible ? 'bg-purple-600/40 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>
              <GridIcon className="w-5 h-5" />
            </button>
          </Tooltip>
        )}

        <div className="w-px h-6 bg-gray-700 mx-1" />

        <Tooltip text="Save Artwork">
          <button onClick={onSave} className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg">
            <SaveIcon className="w-5 h-5" />
          </button>
        </Tooltip>
        <Tooltip text="Open Gallery">
          <button onClick={onOpenGallery} className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg">
            <GalleryIcon className="w-5 h-5" />
          </button>
        </Tooltip>
        <Tooltip text="Export as Video">
          <button
            onClick={onExport}
            className={`p-2 rounded-lg transition-colors text-gray-300 hover:bg-gray-700 hover:text-white relative ${isRecording ? 'text-red-400' : ''}`}
          >
            <FilmIcon className="w-5 h-5" />
            {isRecording && <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>}
          </button>
        </Tooltip>

        <div className="w-px h-6 bg-gray-700 mx-1" />
        <Tooltip text="Main Menu">
          <button onClick={onGoToMenu} className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg">
            <HomeIcon className="w-5 h-5" />
          </button>
        </Tooltip>
      </div>
    </div>
  );
};
