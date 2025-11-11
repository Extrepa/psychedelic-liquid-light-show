# Component Reference

Complete UI component documentation with props, usage, and styling details.

## Core Components

### LiquidCanvas
**Purpose**: Main rendering component; handles particle simulation, user input, and canvas lifecycle

**Props**:
```typescript
{
  config: LiquidConfig;              // Simulation parameters
  isPlaying: boolean;                // Play/pause state
  activeColorIndex: number;          // Active color from palette
  setGetDataUrlCallback: (fn) => void;  // Register snapshot callback
  setGetStreamCallback: (fn) => void;   // Register video stream callback
  setClearCallback?: (fn) => void;      // Register clear callback
  setUndoRedoCallbacks?: (cbs) => void; // Register undo/redo
  cursorUrl: string;                 // Custom SVG cursor
  isDemoMode: boolean;               // Auto-splat demo
  onDemoEnd: () => void;             // Demo cleanup callback
  behaviorMode?: 'blend'|'alternate'|'sequence';  // Paint behavior
}
```

**Key Features**:
- Canvas2D particle system (1200 max particles)
- ResizeObserver for responsive sizing
- Pointer event handling (mouse/touch)
- Visual snapshot system for undo
- Demo mode with auto-splats

---

### AfterEffects
**Purpose**: Applies SVG filters (chromatic aberration, grain) and grid overlay

**Props**:
```typescript
{
  config: LiquidConfig;      // For chromatic aberration & grain values
  showGrid?: boolean;        // Display alignment grid
  children: React.ReactNode; // Wrapped content
}
```

**Filters**:
- Chromatic Aberration: `0–0.1` (RGB channel offset)
- Grain: `0–1` (fractal noise opacity)
- Grid: 32px repeating lines

---

## Layout Components

### QuickActionsDock
**Purpose**: Top-right toolbar with essential actions

**Props**:
```typescript
{
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
```

**Actions**: Play/Pause | Undo | Redo | Save | Gallery | Clear | Export | Menu

---

### BottomDock
**Purpose**: Color palette picker and tool selector

**Props**:
```typescript
{
  colors: string[];              // Palette colors
  activeColorIndex: number;
  setActiveColorIndex: (i: number) => void;
  minimized: boolean;
  setMinimized: (v: boolean) => void;
  onTogglePanel: (tab: DockTab) => void;
  onToggleStudio?: () => void;
}
```

**Features**:
- Minimizable design
- Color thumbnails (5×5 circles)
- Studio button
- Tool icons (Simulation, Colors, Effects, Brush)

---

### Sidebar
**Purpose**: Draggable tools panel with all controls

**Props**:
```typescript
{
  config: LiquidConfig;
  updateConfig: (cfg: Partial<LiquidConfig>) => void;
  isGridVisible: boolean;
  setIsGridVisible: (v: boolean) => void;
  activeColorIndex: number;
  setActiveColorIndex: (i: number) => void;
  behaviorMode: 'blend'|'alternate'|'sequence';
  setBehaviorMode: (m) => void;
  onClear: () => void;
  visible: boolean;
  onClose: () => void;
}
```

**Panels**:
- Paint Behavior (Blend/Alternate/Sequence)
- Quick Color (hex input + picker)
- Brush Size
- Motion (Velocity, Viscosity)
- Effects (Bloom, Sunrays, Grid)
- Actions (Clear, Close)

**Behavior**:
- Draggable header
- Snaps to left/right edge
- Persists position in localStorage

---

## Control Panels

### SimulationPanel
**Controls**: Density, Velocity, Viscosity, Pressure, Diffusion

**Props**:
```typescript
{
  config: LiquidConfig;
  updateConfig: (cfg: Partial<LiquidConfig>) => void;
}
```

**Tooltips**:
- Density: "How much the fluid resists compression"
- Velocity: "Speed at which disturbances propagate"
- Viscosity: "Thickness of the fluid (syrup vs water)"
- Pressure: "External force applied to the fluid"
- Diffusion: "How quickly colors mix and spread"

---

### ColorPanel
**Controls**: Palette editor, AI generation, presets

**Props**:
```typescript
{
  config: LiquidConfig;
  updateConfig: (cfg: Partial<LiquidConfig>) => void;
  onGeneratePalette: (prompt: string) => void;
  onGenerateVibe: (prompt: string) => void;
  isGenerating: boolean;
  activeColorIndex: number;
  setActiveColorIndex: (i: number) => void;
}
```

**Features**:
- Active color selector (hex input + color picker)
- Palette grid (add/remove/shuffle colors)
- AI prompt input with Palette/Vibe buttons
- 8–12 built-in presets

---

### EffectsPanel
**Controls**: Blend mode, Bloom, Sunrays, Chromatic Aberration, Grain, Grid

**Props**:
```typescript
{
  config: LiquidConfig;
  updateConfig: (cfg: Partial<LiquidConfig>, pushToHistory?: boolean) => void;
  isGridVisible: boolean;
  setIsGridVisible: (v: boolean) => void;
}
```

**Blend Modes**: Additive, Screen, Overlay, Soft Light, Multiply, Difference

---

### BrushPanel
**Controls**: Splat radius (0.1–1.0)

**Props**:
```typescript
{
  config: LiquidConfig;
  updateConfig: (cfg: Partial<LiquidConfig>) => void;
}
```

---

## Modal Components

### SaveModal
**Purpose**: Name and save current artwork

**Props**:
```typescript
{
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  artworkName: string;
  setArtworkName: (name: string) => void;
}
```

**Behavior**:
- Auto-focuses input on open
- Enter key submits
- ESC closes

---

### GalleryModal
**Purpose**: Browse and load saved artworks

**Props**:
```typescript
{
  isOpen: boolean;
  onClose: () => void;
  artworks: SavedArtwork[];
  onLoad: (id: number) => void;
  onDelete: (id: number) => void;
}
```

**Layout**: Grid of thumbnails (1/2/3 columns responsive)

---

### ExportVideoModal
**Purpose**: Record and download WebM video

**Props**:
```typescript
{
  isOpen: boolean;
  onClose: () => void;
  onStartRecording: (duration: number, quality: number) => void;
  isRecording: boolean;
  downloadUrl: string | null;
  setDownloadUrl: (url: string | null) => void;
}
```

**Options**:
- Duration: 5s, 10s, 15s, 30s
- Quality: 1 Mbps (Low), 5 Mbps (Medium), 10 Mbps (High)

---

## Utility Components

### Toast
**Purpose**: Temporary notification banners

**Props**:
```typescript
{
  toast: { message: string; id: number; type: 'success'|'error' } | null;
  onClose: () => void;
}
```

**Behavior**: Auto-dismiss after 3 seconds, fade animation

---

### Tooltip
**Purpose**: Hover help text

**Props**:
```typescript
{
  text: string;
  children: React.ReactNode;
}
```

**Styling**: Dark background, white text, centered above element

---

### WelcomeScreen
**Purpose**: Initial modal with demo animation

**Props**:
```typescript
{
  onBegin: () => void;
}
```

**Behavior**: Fade-out animation on "OK" click

---

### RestorePrompt
**Purpose**: Prompt to restore previous session

**Props**:
```typescript
{
  onRestore: () => void;
  onDismiss: () => void;
}
```

**Display**: Top-center floating banner

---

## Icon Components

All icons accept `className` prop for Tailwind styling.

**List**:
- BeakerIcon (Simulation)
- PaletteIcon (Colors)
- WandIcon (Effects)
- PaintbrushIcon (Brush)
- FilmIcon (Export)
- PlayIcon / PauseIcon
- UndoIcon / RedoIcon
- SaveIcon
- GalleryIcon
- HomeIcon
- PlusIcon
- ShuffleIcon
- SparklesIcon (AI)
- GridIcon
- CloseIcon
- TrashIcon

---

## Styling Conventions

- **Background**: `bg-gray-900/80` with `backdrop-blur`
- **Borders**: `border-gray-700/50`
- **Text**: `text-white` / `text-gray-300`
- **Accent**: `bg-purple-600`, `text-purple-500`
- **Hover**: `hover:bg-gray-700`, `hover:text-white`
- **Transitions**: `transition-colors`, `transition-all`
- **Shadows**: `shadow-xl`, `shadow-2xl`
- **Rounded**: `rounded-xl`, `rounded-2xl` for containers; `rounded-md` for inputs

---

## Next Steps

- Read [Architecture](./architecture.md) for data flow
- See [AI Integration](./ai-integration.md) for Gemini usage
- Check [Development](./development.md) for local setup
