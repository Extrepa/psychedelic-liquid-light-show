# Project Structure

This document describes the repository layout and purpose of each file and directory.

## Repository Layout

```
psychedelic-liquid-light-show/
├── index.html              # HTML entry point
├── index.tsx               # React entry point (top-level, original structure)
├── App.tsx                 # Main application component (top-level, original structure)
├── package.json            # Dependencies and scripts
├── package-lock.json       # Locked dependency tree
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite bundler configuration
├── .env.local              # Environment variables (API keys)
├── .gitignore              # Git ignore patterns
├── metadata.json           # AI Studio app metadata
├── README.md               # Project overview and quickstart
├── constants.ts            # Default configuration constants (top-level, original)
├── types.ts                # TypeScript type definitions (top-level, original)
│
├── components/             # React components (top-level, original structure)
│   ├── LiquidCanvas.tsx    # Core canvas rendering and particle system
│   ├── AfterEffects.tsx    # SVG filters (chromatic aberration, grain)
│   ├── BackgroundGradient.tsx  # Animated background gradient
│   ├── Toolbar.tsx         # Bottom toolbar with tabs
│   ├── FlyoutPanel.tsx     # Side panel container
│   ├── SaveModal.tsx       # Artwork save dialog
│   ├── GalleryModal.tsx    # Gallery browser
│   ├── GalleryItem.tsx     # Individual gallery thumbnail
│   ├── ExportVideoModal.tsx # Video recording dialog
│   ├── Toast.tsx           # Notification toasts
│   ├── Tooltip.tsx         # Hover tooltips
│   ├── GridOverlay.tsx     # Optional alignment grid
│   ├── RestorePrompt.tsx   # Session restore prompt
│   ├── WelcomeScreen.tsx   # Initial welcome modal
│   ├── controls/           # Control panel components
│   │   ├── SimulationPanel.tsx  # Density, velocity, viscosity, etc.
│   │   ├── ColorPanel.tsx       # Palette editor and AI generation
│   │   ├── EffectsPanel.tsx     # Bloom, sunrays, chromatic aberration, grain
│   │   └── BrushPanel.tsx       # Splat radius control
│   └── icons/              # SVG icon components
│       ├── BeakerIcon.tsx
│       ├── PaletteIcon.tsx
│       ├── WandIcon.tsx
│       ├── PaintbrushIcon.tsx
│       ├── FilmIcon.tsx
│       ├── PlayIcon.tsx
│       ├── PauseIcon.tsx
│       ├── UndoIcon.tsx
│       ├── RedoIcon.tsx
│       ├── SaveIcon.tsx
│       ├── GalleryIcon.tsx
│       ├── HomeIcon.tsx
│       ├── PlusIcon.tsx
│       ├── ShuffleIcon.tsx
│       ├── SparklesIcon.tsx
│       ├── GridIcon.tsx
│       └── CloseIcon.tsx
│
├── constants/              # Constants and presets (top-level, original)
│   └── presets.ts          # Built-in color/simulation presets
│
├── services/               # External API integrations (top-level, original)
│   └── geminiService.ts    # Google Gemini AI palette/vibe generation
│
├── src/                    # Modern refactored source (mirrors top-level structure)
│   ├── index.tsx           # React entry point
│   ├── App.tsx             # Main application component
│   ├── types.ts            # TypeScript type definitions
│   ├── constants/
│   │   ├── index.ts        # Default configuration
│   │   └── presets.ts      # Built-in presets
│   ├── services/
│   │   └── geminiService.ts
│   └── components/         # All UI components
│       ├── LiquidCanvas.tsx
│       ├── AfterEffects.tsx
│       ├── BackgroundGradient.tsx
│       ├── QuickActionsDock.tsx     # Top-right action buttons
│       ├── BottomDock.tsx           # Bottom color palette dock
│       ├── Sidebar.tsx              # Draggable tools sidebar
│       ├── StudioBoard.tsx          # Full studio control panel
│       ├── FloatingPanel.tsx        # Draggable panel container
│       ├── EdgeDock.tsx             # Left-edge tool dock
│       ├── GuideOverlay.tsx         # Tutorial/guide overlay
│       ├── SaveModal.tsx
│       ├── GalleryModal.tsx
│       ├── GalleryItem.tsx
│       ├── ExportVideoModal.tsx
│       ├── Toast.tsx
│       ├── Tooltip.tsx
│       ├── GridOverlay.tsx
│       ├── RestorePrompt.tsx
│       ├── WelcomeScreen.tsx
│       ├── ColorHUD.tsx             # Color info heads-up display
│       ├── controls/
│       │   ├── SimulationPanel.tsx
│       │   ├── ColorPanel.tsx
│       │   ├── EffectsPanel.tsx
│       │   ├── BrushPanel.tsx
│       │   └── ActionPanel.tsx
│       └── icons/           # SVG icon components (same as top-level)
│
├── dist/                   # Production build output (generated)
├── node_modules/           # NPM dependencies (generated)
└── docs/                   # Documentation (this folder)
    ├── overview.md
    ├── structure.md (you are here)
    ├── architecture.md
    ├── components.md
    ├── ai-integration.md
    ├── development.md
    ├── performance.md
    ├── troubleshooting.md
    ├── refactoring.md
    └── roadmap.md
```

---

## Key Files

### `index.html`
HTML entry point that:
- Sets up the viewport and base styles
- Includes Tailwind CSS via CDN
- Defines an import map for CDN dependencies (React, ReactDOM, Gemini SDK)
- Mounts the React app to `<div id="root">`
- Includes a gradient keyframe animation

### `index.tsx` / `src/index.tsx`
React entry point that:
- Imports React and ReactDOM
- Creates a root and renders `<App />` in StrictMode
- Throws an error if the `#root` element is missing

### `App.tsx` / `src/App.tsx`
Main application component managing:
- **State**: config, history, active color, playing status, modals, recording status
- **Effects**: session persistence, cursor generation, artwork loading
- **Callbacks**: undo/redo, save, load, generate AI palettes/vibes, video recording
- **Layout**: `<BackgroundGradient>`, `<LiquidCanvas>`, `<AfterEffects>`, toolbars, modals

### `LiquidCanvas.tsx` / `src/components/LiquidCanvas.tsx`
Core rendering engine:
- **WebGLFluid factory**: Creates canvas renderer, particle system, draw loop
- **Lifecycle**: init, play/pause, clear, destroy
- **Pointer handling**: Splat on click/drag
- **Demo mode**: Auto-splats for welcome screen
- **Snapshot system**: Visual undo/redo via canvas.toDataURL

### `types.ts` / `src/types.ts`
TypeScript interfaces:
- `LiquidConfig`: Simulation parameters (density, velocity, colors, etc.)
- `SavedArtwork`: Gallery entry structure

### `constants.ts` / `src/constants/index.ts`
Default config values:
- `DEFAULT_CONFIG`: Initial simulation state
- `MAX_HISTORY_SIZE`: Undo/redo limit (30)

### `constants/presets.ts` / `src/constants/presets.ts`
Array of 12 `Preset` objects with:
- `name`: Display name
- `config`: Partial `LiquidConfig` (colors + optional simulation overrides)

### `services/geminiService.ts` / `src/services/geminiService.ts`
AI palette generation:
- `generateColorPalette(prompt)`: Returns 5 hex codes
- `generateVibe(prompt)`: Returns palette + density/velocity/viscosity

---

## Component Organization

### Layout Hierarchy

```
App
├── BackgroundGradient (z-index: -10)
├── Toast (z-index: 50)
├── RestorePrompt (z-index: 50)
├── WelcomeScreen (z-index: 50)
├── AfterEffects (z-index: auto)
│   └── LiquidCanvas (absolute positioned)
├── QuickActionsDock (z-index: 3000, top-right)
├── BottomDock (z-index: 3600, bottom-center)
├── Sidebar (z-index: 4800, draggable)
├── SaveModal (z-index: 40)
├── GalleryModal (z-index: 40)
└── ExportVideoModal (z-index: 40)
```

### Control Panels

All control panels (`SimulationPanel`, `ColorPanel`, `EffectsPanel`, `BrushPanel`) accept:
- `config`: Current `LiquidConfig`
- `updateConfig`: Callback to update config (triggers history push)

`ColorPanel` also accepts:
- `onGeneratePalette`: AI palette generation callback
- `onGenerateVibe`: AI vibe generation callback
- `isGenerating`: Loading state
- `activeColorIndex` / `setActiveColorIndex`: Active color management

### Icon Components

All icons are SVG functional components accepting:
- `className`: Tailwind classes for size and color
- Standard `SVGProps<SVGSVGElement>` props

---

## Data Flow

### Configuration Updates

```
User interaction → Control Panel → updateConfig() → setConfig() → 
  History push → LiquidCanvas receives new config → fluidRef.current.updateConfig()
```

### Splat/Paint

```
Pointer event → handlePointerDown/Move → splat(x, y) → 
  fluidRef.current.splat(x, y, radius, color) → 
  5 particles pushed to particles array → 
  requestAnimationFrame loop draws particles
```

### AI Generation

```
User prompt → handleGeneratePalette/Vibe → 
  geminiService.generateColorPalette/Vibe() → 
  Gemini API (JSON schema response) → 
  updateConfig({ colors: newColors }) → 
  triggerToast("Success")
```

### Saving

```
handleOpenSaveModal() → getCanvasDataUrlRef.current() → 
  canvas.toDataURL('image/jpeg', 0.8) → 
  User enters name → handleSaveArtwork() → 
  localStorage.setItem('liquid-art-gallery', JSON.stringify(artworks))
```

### Video Export

```
handleStartRecording() → getCanvasStreamRef.current() → 
  canvas.captureStream(30) → MediaRecorder → 
  ondataavailable → Blob → URL.createObjectURL() → 
  <a download> link
```

---

## Adding New Features

### New Effect/Simulation Parameter

1. Add field to `LiquidConfig` in `types.ts`:
   ```ts
   export interface LiquidConfig {
     // ...
     myNewParam: number;
   }
   ```

2. Add default value in `constants.ts`:
   ```ts
   export const DEFAULT_CONFIG: LiquidConfig = {
     // ...
     myNewParam: 0.5,
   };
   ```

3. Consume in `LiquidCanvas.tsx`:
   ```ts
   const currentConfig = configRef.current;
   const value = currentConfig.myNewParam;
   // Use in particle physics or rendering
   ```

4. Add control slider in appropriate panel (`SimulationPanel`, `EffectsPanel`, etc.):
   ```tsx
   <Slider label="My New Param" value={config.myNewParam} 
     onChange={v => updateConfig({ myNewParam: v })} />
   ```

### New Preset

Add to `constants/presets.ts`:

```ts
{
  name: 'My Preset',
  config: {
    colors: ['#ff00ff', '#00ffff'],
    density: 0.8,
    velocity: 0.6,
    // ...
  },
}
```

### New Component

Create in `components/` or `src/components/`:
- Use functional components with TypeScript
- Export as named export
- Follow existing naming conventions (`PascalCase.tsx`)
- Add JSX props interface above component
- Use Tailwind for styling

---

## Next Steps

- See [Architecture](./architecture.md) for rendering pipeline details
- Check [Components](./components.md) for UI component reference
- Read [Development](./development.md) for local setup and workflow
