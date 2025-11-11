
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { LiquidCanvas } from './components/LiquidCanvas';
import { Toolbar, Tab } from './components/Toolbar';
import { FlyoutPanel } from './components/FlyoutPanel';
import { AppBar } from './ui/AppBar/AppBar';
import { TopPanel } from './ui/TopPanel/TopPanel';
import { isTopPanelEnabled } from './ui/flags';
import { ColorTray } from './ui/Trays/ColorTray';
import { PresetStrip, type CycleMode, type Cadence } from './ui/Trays/PresetStrip';
import { PRESETS } from './constants/presets';
import { MiniHUD } from './ui/HUD/MiniHUD';
import { SimulationPanel } from './components/controls/SimulationPanel';
import { SettingsPanel } from './components/controls/SettingsPanel';
import { ColorPanel } from './components/controls/ColorPanel';
import { EffectsPanel } from './components/controls/EffectsPanel';
import { BrushPanel } from './components/controls/BrushPanel';
import { BackgroundGradient } from './components/BackgroundGradient';
import { SaveModal } from './components/SaveModal';
import { GalleryModal } from './components/GalleryModal';
import { ExportVideoModal } from './components/ExportVideoModal';
import { AfterEffects } from './components/AfterEffects';
import { Toast } from './components/Toast';
import { generateColorPalette, generateVibe } from './services/paletteService';
import type { LiquidConfig } from './types';
import { DEFAULT_CONFIG } from './constants';
import { RestorePrompt } from './components/RestorePrompt';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ShortcutsModal } from './components/ShortcutsModal';
// New hooks
import { useHistory } from './hooks/useHistory';
import { useArtworkGallery } from './hooks/useArtworkGallery';
import { useVideoRecording } from './hooks/useVideoRecording';
import { useSessionPersistence, type SessionState } from './hooks/useSessionPersistence';


function App() {
  const { config, updateConfig, undo: handleUndo, redo: handleRedo, getSnapshot, setFromSnapshot, reset } = useHistory(DEFAULT_CONFIG);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isGridVisible, setIsGridVisible] = useState(false);
  const [activeColorIndex, setActiveColorIndex] = useState(0);
  
  const [isGenerating, setIsGenerating] = useState(false);

  // Preset cycle UI state
  const [cycleEnabled, setCycleEnabled] = useState(false);
  const [cycleMode, setCycleMode] = useState<CycleMode>('sequential');
  const [cadence, setCadence] = useState<Cadence>('per-stroke');
  const [selectedPresets, setSelectedPresets] = useState<number[]>([]);
  
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  // HUD state
  const [hudVisible, setHudVisible] = useState(false);
  const [hudPreset, setHudPreset] = useState<string | undefined>(undefined);

  useEffect(() => {
    // @ts-expect-error attach callbacks for canvas to notify HUD
    window.__onCycleStep = (name?: string) => {
      setHudPreset(name);
      setHudVisible(true);
      window.clearTimeout((window as any).__hudTimer);
      (window as any).__hudTimer = window.setTimeout(() => setHudVisible(false), 1500);
    };
    // @ts-expect-error
    window.__onCycleEnd = () => {
      window.clearTimeout((window as any).__hudTimer);
      (window as any).__hudTimer = window.setTimeout(() => setHudVisible(false), 800);
    };
    return () => {
      // @ts-expect-error
      delete window.__onCycleStep;
      // @ts-expect-error
      delete window.__onCycleEnd;
    };
  }, []);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [artworkName, setArtworkName] = useState('');
  const { savedArtworks, createAndSaveArtwork, deleteArtwork, getArtworkById } = useArtworkGallery();
  
  const [toast, setToast] = useState<{ message: string, id: number, type: 'success' | 'error' } | null>(null);
  const [cursorUrl, setCursorUrl] = useState('');
  
  const { isRecording, downloadUrl, setDownloadUrl, start: startRecording } = useVideoRecording();
  const [isWelcomeScreenVisible, setIsWelcomeScreenVisible] = useState(true);

  // Performance mode
  const [performanceMode, setPerformanceMode] = useState<boolean>(() => {
    try { return localStorage.getItem('ui:perf') === '1'; } catch { return false; }
  });

  const [activePanel, setActivePanel] = useState<Tab | null>(null);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  const getCanvasDataUrlRef = useRef<(() => string) | null>(null);
  const getCanvasStreamRef = useRef<(() => MediaStream) | null>(null);

  const { showRestorePrompt, handleRestore, handleDismiss } = useSessionPersistence({
    enabled: !isWelcomeScreenVisible,
    collect: () => ({
      ...getSnapshot(),
      isPlaying,
      isGridVisible,
      activeColorIndex,
    }),
    restore: (saved) => {
      // Guard activeColorIndex against palette shrink
      if (saved.activeColorIndex >= saved.config.colors.length) {
        saved.activeColorIndex = Math.max(0, saved.config.colors.length - 1);
      }
      setFromSnapshot(saved);
      setIsPlaying(saved.isPlaying);
      setIsGridVisible(saved.isGridVisible);
      setActiveColorIndex(saved.activeColorIndex);
      triggerToast("Previous session restored!");
    },
  });

  const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, id: Date.now(), type });
  };
  
  const generateCursor = (color: string) => {
    const svg = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="10" fill="${color}" stroke-width="2" stroke="white"/><circle cx="16" cy="16" r="10" stroke-width="2" stroke-opacity="0.5" stroke="black"/><line x1="16" y1="8" x2="16" y2="24" stroke-width="2" stroke="white"/><line x1="8" y1="16" x2="24" y2="16" stroke-width="2" stroke="white"/></svg>`;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  
  useEffect(() => {
    if (config.colors.length > 0 && config.colors[activeColorIndex]) {
      setCursorUrl(generateCursor(config.colors[activeColorIndex]));
    }
  }, [config.colors, activeColorIndex]);

  // Wrap history.updateConfig to enforce activeColorIndex staying in range when palette shrinks
  const updateConfigWithColorGuard = useCallback((newConfig: Partial<LiquidConfig>, pushToHistory = true) => {
    if (newConfig.colors && activeColorIndex >= newConfig.colors.length) {
      setActiveColorIndex(Math.max(0, newConfig.colors.length - 1));
    }
    updateConfig(newConfig, pushToHistory);
  }, [activeColorIndex, updateConfig]);
  

  const handleGeneratePalette = useCallback(async (prompt: string) => {
    setIsGenerating(true);
    try {
      const newColors = await generateColorPalette(prompt);
      if (newColors && newColors.length > 0) {
        updateConfigWithColorGuard({ colors: newColors });
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
        updateConfigWithColorGuard({ ...vibe.config, colors: vibe.colors });
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
    createAndSaveArtwork(artworkName, config, getCanvasDataUrlRef.current());
    triggerToast("Artwork saved successfully!");
    setIsSaveModalOpen(false);
    setArtworkName('');
  };

  const handleLoadArtwork = (id: number) => {
    const artworkToLoad = getArtworkById(id);
    if (artworkToLoad) {
      updateConfigWithColorGuard(artworkToLoad.config);
      setIsGalleryModalOpen(false);
      triggerToast(`Loaded "${artworkToLoad.name}"`);
    }
  };

  const handleDeleteArtwork = (id: number) => {
    deleteArtwork(id);
  };


  const handleStartRecording = (duration: number, quality: number) => {
    if (!getCanvasStreamRef.current) return;
    startRecording({ getStream: () => getCanvasStreamRef.current!(), durationSec: duration, bitrate: quality });
  };
  
  const handleBegin = () => {
    setIsWelcomeScreenVisible(false);
  };

  const handleDemoEnd = useCallback(() => {
    reset(DEFAULT_CONFIG);
    setActiveColorIndex(0);
    setActivePanel(null);
  }, [reset]);

  const handleGoToMenu = () => {
    setIsWelcomeScreenVisible(true);
    handleDemoEnd();
  };
  
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === '?' || (e.key === '/' && e.shiftKey)) && !isShortcutsOpen) {
        e.preventDefault(); setIsShortcutsOpen(true);
      }
      if (e.key.toLowerCase() === 'g') setIsGridVisible(v => !v);
      if (e.key.toLowerCase() === 'p') setIsPlaying(v => !v);
      if (e.key.toLowerCase() === 's') setIsSaveModalOpen(true);
      if (e.key.toLowerCase() === 'e') setIsExportModalOpen(true);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isShortcutsOpen]);

  const getPanelTitle = (panel: Tab | null) => {
      if (!panel) return '';
      return panel.charAt(0).toUpperCase() + panel.slice(1);
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-900 flex flex-col font-sans antialiased">
      <BackgroundGradient />
      <Toast toast={toast} onClose={() => setToast(null)} />
      <MiniHUD visible={hudVisible && cycleEnabled && selectedPresets.length > 0} presetName={hudPreset} mode={cycleMode} cadence={cadence} />
      {showRestorePrompt && <RestorePrompt onRestore={handleRestore} onDismiss={handleDismiss} />}
      {isWelcomeScreenVisible && <WelcomeScreen onBegin={handleBegin} />}

      {!isWelcomeScreenVisible && isTopPanelEnabled() && (
        <>
        <AppBar
          activePanel={activePanel}
          setActivePanel={setActivePanel}
          onExport={() => setIsExportModalOpen(true)}
          isRecording={isRecording}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying(p => !p)}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onSave={handleOpenSaveModal}
          onOpenGallery={() => setIsGalleryModalOpen(true)}
          onGoToMenu={handleGoToMenu}
          isGridVisible={isGridVisible}
          onToggleGrid={() => setIsGridVisible(v => !v)}
        />
          <ColorTray
            colors={config.colors}
            activeColorIndex={activeColorIndex}
            setActiveColorIndex={setActiveColorIndex}
            updateConfig={cfg => updateConfigWithColorGuard(cfg)}
          />
          <PresetStrip
            onApply={cfg => updateConfigWithColorGuard(cfg)}
            selected={selectedPresets}
            onToggleSelect={(idx) => setSelectedPresets(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx])}
            cycleEnabled={cycleEnabled}
            setCycleEnabled={setCycleEnabled}
            cycleMode={cycleMode}
            setCycleMode={setCycleMode}
            cadence={cadence}
            setCadence={setCadence}
          />
        </>
      )}
      {!isWelcomeScreenVisible && isTopPanelEnabled() && (
        <TopPanel
          isOpen={activePanel !== null}
          onClose={() => setActivePanel(null)}
          title={getPanelTitle(activePanel)}
        >
          {activePanel === 'simulation' && <SimulationPanel config={config} updateConfig={updateConfigWithColorGuard} />}
          {activePanel === 'colors' && <ColorPanel config={config} updateConfig={updateConfigWithColorGuard} onGeneratePalette={handleGeneratePalette} onGenerateVibe={handleGenerateVibe} isGenerating={isGenerating} activeColorIndex={activeColorIndex} setActiveColorIndex={setActiveColorIndex} />}
                {activePanel === 'effects' && <EffectsPanel config={config} updateConfig={updateConfigWithColorGuard} isGridVisible={isGridVisible} setIsGridVisible={setIsGridVisible} />}
                {activePanel === 'brush' && <BrushPanel config={config} updateConfig={updateConfigWithColorGuard} />}
                {activePanel === 'settings' && <SettingsPanel onClose={() => setActivePanel(null)} onPerfChange={(v)=> setPerformanceMode(v)} />}
            </TopPanel>
      )}
      {!isWelcomeScreenVisible && !isTopPanelEnabled() && (
        <>
          <Toolbar
            activePanel={activePanel}
            setActivePanel={setActivePanel}
            onExport={() => setIsExportModalOpen(true)}
            isRecording={isRecording}
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(p => !p)}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onSave={handleOpenSaveModal}
            onOpenGallery={() => setIsGalleryModalOpen(true)}
            onGoToMenu={handleGoToMenu}
          />
          <FlyoutPanel
            isOpen={activePanel !== null}
            onClose={() => setActivePanel(null)}
            title={getPanelTitle(activePanel)}
          >
            {activePanel === 'simulation' && <SimulationPanel config={config} updateConfig={updateConfigWithColorGuard} />}
            {activePanel === 'colors' && <ColorPanel config={config} updateConfig={updateConfigWithColorGuard} onGeneratePalette={handleGeneratePalette} onGenerateVibe={handleGenerateVibe} isGenerating={isGenerating} activeColorIndex={activeColorIndex} setActiveColorIndex={setActiveColorIndex} />}
            {activePanel === 'effects' && <EffectsPanel config={config} updateConfig={updateConfigWithColorGuard} isGridVisible={isGridVisible} setIsGridVisible={setIsGridVisible} />}
            {activePanel === 'brush' && <BrushPanel config={config} updateConfig={updateConfigWithColorGuard} />}
          </FlyoutPanel>
        </>
      )}

      <main className="flex-1 relative">
        <AfterEffects config={config}>
          <LiquidCanvas
            config={config}
            isPlaying={isPlaying}
            activeColorIndex={activeColorIndex}
            setGetDataUrlCallback={(callback) => getCanvasDataUrlRef.current = callback}
            setGetStreamCallback={(callback) => getCanvasStreamRef.current = callback}
            cursorUrl={cursorUrl}
            isDemoMode={isWelcomeScreenVisible}
            onDemoEnd={handleDemoEnd}
            
            // Preset cycling props passed to canvas for ephemeral application while painting
            cycleEnabled={cycleEnabled}
            cycleMode={cycleMode}
            cycleCadence={cadence}
            selectedPresets={selectedPresets}
            presets={PRESETS}
            onCommitConfig={(cfg) => updateConfigWithColorGuard(cfg)}
            performanceMode={performanceMode}
            />
        </AfterEffects>
      </main>

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

      <ShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />
    </div>
  );
}

export default App;
