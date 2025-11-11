
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { LiquidCanvas } from './components/LiquidCanvas';
import type { Tab } from './components/Toolbar';
import { QuickActionsDock } from './components/QuickActionsDock';
import { BottomDock } from './components/BottomDock';
import { Sidebar } from './components/Sidebar';
import { FlyoutPanel } from './components/FlyoutPanel';
import { SimulationPanel } from './components/controls/SimulationPanel';
import { ColorPanel } from './components/controls/ColorPanel';
import { EffectsPanel } from './components/controls/EffectsPanel';
import { BrushPanel } from './components/controls/BrushPanel';
import { BackgroundGradient } from './components/BackgroundGradient';
import { SaveModal } from './components/SaveModal';
import { GalleryModal } from './components/GalleryModal';
import { ExportVideoModal } from './components/ExportVideoModal';
import { AfterEffects } from './components/AfterEffects';
import { Toast } from './components/Toast';
import { generateColorPalette, generateVibe } from './services/geminiService';
import type { LiquidConfig, SavedArtwork } from './types';
import { DEFAULT_CONFIG, MAX_HISTORY_SIZE } from './constants';
import { RestorePrompt } from './components/RestorePrompt';
import { WelcomeScreen } from './components/WelcomeScreen';


// Define the shape of the saved session state
interface SessionState {
  config: LiquidConfig;
  history: LiquidConfig[];
  historyIndex: number;
  isPlaying: boolean;
  isGridVisible: boolean;
  activeColorIndex: number;
}

function App() {
  const [config, setConfig] = useState<LiquidConfig>(DEFAULT_CONFIG);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isGridVisible, setIsGridVisible] = useState(false);
  const [activeColorIndex, setActiveColorIndex] = useState(0);
  
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [artworkName, setArtworkName] = useState('');
  const [savedArtworks, setSavedArtworks] = useState<SavedArtwork[]>([]);
  
  const [toast, setToast] = useState<{ message: string, id: number, type: 'success' | 'error' } | null>(null);
  const [cursorUrl, setCursorUrl] = useState('');
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);
  
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isWelcomeScreenVisible, setIsWelcomeScreenVisible] = useState(true);

  const [activePanel, setActivePanel] = useState<Tab | null>(null);
  const [dockMinimized, setDockMinimized] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [behaviorMode, setBehaviorMode] = useState<'blend'|'alternate'|'sequence'>('blend');



  const history = useRef<LiquidConfig[]>([DEFAULT_CONFIG]);
  const historyIndex = useRef<number>(0);

  const getCanvasDataUrlRef = useRef<(() => string) | null>(null);
  const getCanvasStreamRef = useRef<(() => MediaStream) | null>(null);
  const clearCanvasRef = useRef<(() => void) | null>(null);
  
  // Effect to save state to localStorage when the user navigates away
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isWelcomeScreenVisible) { // Don't save if we haven't started
        localStorage.removeItem('liquid-art-prompt-restore');
        localStorage.removeItem('liquid-art-session');
        return;
      }
      try {
        const stateToSave: SessionState = {
          config,
          history: history.current,
          historyIndex: historyIndex.current,
          isPlaying,
          isGridVisible,
          activeColorIndex,
        };
        localStorage.setItem('liquid-art-session', JSON.stringify(stateToSave));
        localStorage.setItem('liquid-art-prompt-restore', 'true');
      } catch (e) {
        console.error("Failed to save session to localStorage", e);
        localStorage.removeItem('liquid-art-prompt-restore');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [config, isPlaying, isGridVisible, activeColorIndex, isWelcomeScreenVisible]);
  
  useEffect(() => {
    const shouldPrompt = localStorage.getItem('liquid-art-prompt-restore') === 'true';
    const savedStateJSON = localStorage.getItem('liquid-art-session');
    if (shouldPrompt && savedStateJSON) {
      setShowRestorePrompt(true);
    } else {
      localStorage.removeItem('liquid-art-prompt-restore');
      localStorage.removeItem('liquid-art-session');
    }
  }, []);

  const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, id: Date.now(), type });
  };
  
  const generateCursor = (color: string) => {
    const svg = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="10" fill="${color}" stroke-width="2" stroke="white"/><circle cx="16" cy="16" r="10" stroke-width="2" stroke-opacity="0.5" stroke="black"/><line x1="16" y1="8" x2="16" y2="24" stroke-width="2" stroke="white"/><line x1="8" y1="16" x2="24" y2="16" stroke-width="2" stroke="white"/></svg>`;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  useEffect(() => {
    try {
      const storedArtworks = localStorage.getItem('liquid-art-gallery');
      if (storedArtworks) {
        setSavedArtworks(JSON.parse(storedArtworks));
      }
    } catch (e) {
      console.error("Failed to load artworks from localStorage", e);
    }
  }, []);
  
  useEffect(() => {
    if (config.colors.length > 0 && config.colors[activeColorIndex]) {
      setCursorUrl(generateCursor(config.colors[activeColorIndex]));
    }
  }, [config.colors, activeColorIndex]);

  const updateConfig = useCallback((newConfig: Partial<LiquidConfig>, pushToHistory = true) => {
    setConfig(currentConfig => {
      const updated = { ...currentConfig, ...newConfig };
      
      if (pushToHistory) {
        if (historyIndex.current < history.current.length - 1) {
          history.current = history.current.slice(0, historyIndex.current + 1);
        }
        history.current.push(updated);
        if (history.current.length > MAX_HISTORY_SIZE) {
          history.current.shift();
        }
        historyIndex.current = history.current.length - 1;
      }

      if (newConfig.colors && activeColorIndex >= newConfig.colors.length) {
        setActiveColorIndex(Math.max(0, newConfig.colors.length - 1));
      }

      return updated;
    });
  }, [activeColorIndex]);
  
  const canvasUndoRef = useRef<(() => void) | null>(null);
  const canvasRedoRef = useRef<(() => void) | null>(null);

  const handleUndo = useCallback(() => {
    if (historyIndex.current > 0) {
      historyIndex.current--;
      setConfig(history.current[historyIndex.current]);
    }
    canvasUndoRef.current && canvasUndoRef.current();
  }, []);

  const handleRedo = useCallback(() => {
    if (historyIndex.current < history.current.length - 1) {
      historyIndex.current++;
      setConfig(history.current[historyIndex.current]);
    }
    canvasRedoRef.current && canvasRedoRef.current();
  }, []);

  const handleGeneratePalette = useCallback(async (prompt: string) => {
    setIsGenerating(true);
    try {
      const newColors = await generateColorPalette(prompt);
      if (newColors && newColors.length > 0) {
        updateConfig({ colors: newColors });
        triggerToast("New palette generated!");
      } else {
        triggerToast("The AI returned an empty color palette. Try another prompt!", 'error');
      }
    } catch (e) {
      triggerToast("Failed to generate palette. Please try again.", 'error');
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  }, [updateConfig]);

  const handleGenerateVibe = useCallback(async (prompt: string) => {
    setIsGenerating(true);
    try {
      const vibe = await generateVibe(prompt);
      if (vibe) {
        updateConfig({ ...vibe.config, colors: vibe.colors });
        triggerToast("New vibe generated!");
      } else {
         triggerToast("The AI returned an empty vibe. Try another prompt!", 'error');
      }
    } catch (e) {
      triggerToast("Failed to generate vibe. Please try again.", 'error');
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  }, [updateConfig]);

  const handleOpenSaveModal = () => {
    if (getCanvasDataUrlRef.current) {
      setArtworkName(`Liquid Dream #${savedArtworks.length + 1}`);
      setIsSaveModalOpen(true);
    }
  };

  const handleSaveArtwork = () => {
    if (!artworkName.trim() || !getCanvasDataUrlRef.current) return;

    const newArtwork: SavedArtwork = {
      id: Date.now(),
      name: artworkName,
      config: config,
      thumbnail: getCanvasDataUrlRef.current(),
    };

    const updatedArtworks = [...savedArtworks, newArtwork];
    setSavedArtworks(updatedArtworks);
    localStorage.setItem('liquid-art-gallery', JSON.stringify(updatedArtworks));
    
    triggerToast("Artwork saved successfully!");
    setIsSaveModalOpen(false);
    setArtworkName('');
  };

  const handleLoadArtwork = (id: number) => {
    const artworkToLoad = savedArtworks.find(art => art.id === id);
    if (artworkToLoad) {
      updateConfig(artworkToLoad.config);
      setIsGalleryModalOpen(false);
      triggerToast(`Loaded "${artworkToLoad.name}"`);
    }
  };

  const handleDeleteArtwork = (id: number) => {
    const updatedArtworks = savedArtworks.filter(art => art.id !== id);
    setSavedArtworks(updatedArtworks);
    localStorage.setItem('liquid-art-gallery', JSON.stringify(updatedArtworks));
  };

  const handleRestoreSession = () => {
    try {
      const savedStateJSON = localStorage.getItem('liquid-art-session');
      if (savedStateJSON) {
        const savedState: SessionState = JSON.parse(savedStateJSON);
        if (savedState.config && savedState.history && savedState.historyIndex !== undefined) {
          if (savedState.activeColorIndex >= savedState.config.colors.length) {
            savedState.activeColorIndex = Math.max(0, savedState.config.colors.length - 1);
          }
          setConfig(savedState.config);
          history.current = savedState.history;
          historyIndex.current = savedState.historyIndex;
          setIsPlaying(savedState.isPlaying);
          setIsGridVisible(savedState.isGridVisible);
          setActiveColorIndex(savedState.activeColorIndex);
          triggerToast("Previous session restored!");
        } else {
          throw new Error("Invalid session data");
        }
      }
    } catch (e) {
      console.error("Failed to restore session", e);
      triggerToast("Could not restore session.", 'error');
      localStorage.removeItem('liquid-art-session');
    } finally {
      localStorage.removeItem('liquid-art-prompt-restore');
      setShowRestorePrompt(false);
    }
  };

  const handleDismissRestore = () => {
    localStorage.removeItem('liquid-art-prompt-restore');
    localStorage.removeItem('liquid-art-session');
    setShowRestorePrompt(false);
  };

  const handleStartRecording = (duration: number, quality: number) => {
    if (!getCanvasStreamRef.current || isRecording) return;

    const stream = getCanvasStreamRef.current();
    const options = { mimeType: 'video/webm; codecs=vp9', bitsPerSecond: quality };
    try {
      mediaRecorderRef.current = new MediaRecorder(stream, options);
    } catch (e) {
      console.error("Failed to create MediaRecorder:", e);
      triggerToast("Video recording is not supported on this browser.", 'error');
      return;
    }

    recordedChunksRef.current = [];
    setDownloadUrl(null);

    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setIsRecording(false);
    };

    mediaRecorderRef.current.start();
    setIsRecording(true);

    setTimeout(() => {
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    }, duration * 1000);
  };
  
  const handleBegin = () => {
    setIsWelcomeScreenVisible(false);
  };

  const handleDemoEnd = useCallback(() => {
    setConfig(DEFAULT_CONFIG);
    history.current = [DEFAULT_CONFIG];
    historyIndex.current = 0;
    setActiveColorIndex(0);
    setActivePanel(null);
  }, []);

  const handleGoToMenu = () => {
    setIsWelcomeScreenVisible(true);
    handleDemoEnd();
  };
  
  const getPanelTitle = (panel: Tab | null) => {
      if (!panel) return '';
      return panel.charAt(0).toUpperCase() + panel.slice(1);
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-900 flex flex-col font-sans antialiased" style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#111827' }}>
      <BackgroundGradient />
      <Toast toast={toast} onClose={() => setToast(null)} />
      {showRestorePrompt && <RestorePrompt onRestore={handleRestoreSession} onDismiss={handleDismissRestore} />}
      {isWelcomeScreenVisible && <WelcomeScreen onBegin={handleBegin} />}
      
      <main className="flex-1 relative" style={{ position: 'relative', flex: 1, minHeight: '100%', width: '100%' }}>
        <AfterEffects config={config} showGrid={isGridVisible}>
            <LiquidCanvas 
              config={config} 
              isPlaying={isPlaying} 
              activeColorIndex={activeColorIndex}
              setGetDataUrlCallback={(callback) => getCanvasDataUrlRef.current = callback}
              setGetStreamCallback={(callback) => getCanvasStreamRef.current = callback}
              setClearCallback={(callback) => (clearCanvasRef.current = callback)}
              setUndoRedoCallbacks={({ undo, redo }) => { canvasUndoRef.current = undo; canvasRedoRef.current = redo; }}
              behaviorMode={behaviorMode}
              cursorUrl={cursorUrl}
              isDemoMode={isWelcomeScreenVisible}
              onDemoEnd={handleDemoEnd}
            />
        </AfterEffects>
      </main>

      {!isWelcomeScreenVisible && (
        <>
            {/* Compact quick actions in the corner */}
            <QuickActionsDock
                isRecording={isRecording}
                isPlaying={isPlaying}
                onTogglePlay={() => setIsPlaying(p => !p)}
                onUndo={handleUndo}
                onRedo={handleRedo}
                onSave={handleOpenSaveModal}
                onOpenGallery={() => setIsGalleryModalOpen(true)}
                onExport={() => setIsExportModalOpen(true)}
                onGoToMenu={handleGoToMenu}
                onClear={() => clearCanvasRef.current && clearCanvasRef.current()}
            />

            {/* Bottom dock: tools + quick colors */}
            <BottomDock
              colors={config.colors}
              activeColorIndex={activeColorIndex}
              setActiveColorIndex={setActiveColorIndex}
              minimized={dockMinimized}
              setMinimized={setDockMinimized}
              onTogglePanel={() => setSidebarOpen(v=>!v)}
              onToggleStudio={() => setSidebarOpen(v=>!v)}
            />

            <Sidebar
              config={config}
              updateConfig={updateConfig}
              isGridVisible={isGridVisible}
              setIsGridVisible={setIsGridVisible}
              activeColorIndex={activeColorIndex}
              setActiveColorIndex={setActiveColorIndex}
              behaviorMode={behaviorMode}
              setBehaviorMode={setBehaviorMode}
              onClear={() => clearCanvasRef.current && clearCanvasRef.current()}
              visible={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
            />

        </>
      )}

      <SaveModal 
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={handleSaveArtwork}
        artworkName={artworkName}
        setArtworkName={setArtworkName}
      />

      <GalleryModal
        isOpen={isGalleryModalOpen}
        onClose={() => setIsGalleryModalOpen(false)}
        artworks={savedArtworks}
        onLoad={handleLoadArtwork}
        onDelete={handleDeleteArtwork}
      />

      <ExportVideoModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onStartRecording={handleStartRecording}
        isRecording={isRecording}
        downloadUrl={downloadUrl}
        setDownloadUrl={setDownloadUrl}
      />
    </div>
  );
}

export default App;