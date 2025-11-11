# Psychedelic Liquid Light Show

## New Top-Left Layout (Preview)

- Enable via URL: `?ui=top` (default on)
- Classic layout: `?ui=classic`
- Persist choice in devtools:
  - `localStorage.setItem('ui:topPanel','1')`
  - `localStorage.setItem('ui:topPanel','0')`

### What’s New
- AppBar at top-left with primary actions
- Pull-down TopPanel for Simulation, Colors, Effects, Brush
- Color Tray with larger swatches and hex input
- Preset Strip with multi-select and cycling (Sequential / Ping-pong / Random)
- Mini HUD shows current preset/mode while painting
- Unified glass-box styling for modals

### Preset Cycling
- Select multiple presets (Cmd/Ctrl-click)
- Toggle Cycle and choose Mode + Cadence (Per-stroke or Per-splat)
- Painting applies presets ephemerally; on release one history entry is committed

### Accessibility
- TopPanel traps focus; ESC to close
- Color and Preset trays support keyboard navigation

### Dev
- Tests: `npm run test`
- Build: `npm run build`
- Dev: `npm run dev` then open http://localhost:5180/?ui=top
- Preview: `npm run preview` (defaults to port 4321)

> A virtual recreation of 1960s-era liquid light shows using interactive Canvas2D particle simulations and AI-powered color palette generation.

https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6

## Overview

This app recreates the mesmerizing art form of projecting oil, water, and food coloring through overhead projectors—a staple of psychedelic performances in the 1960s. Users can paint flowing, morphing blobs of color, tweak simulation physics, generate AI-powered palettes, apply post-processing effects, and record their creations.

Built with: React 19, TypeScript, Vite, Canvas2D, and Google Gemini AI.

View in AI Studio: https://ai.studio/apps/drive/15tTC3EwsPv9lJAFVS8PWjoeYllbVW9aS

---

## Quickstart

Prerequisites
- Node.js (v16 or higher recommended)
- A modern browser (Chrome, Firefox, Safari, Edge)

Installation & Running

```bash
# Install dependencies
npm install

# Set your Gemini API key in .env.local
echo "GEMINI_API_KEY=your_api_key_here" > .env.local

# Run development server
npm run dev
```

Open http://localhost:3000 in your browser.

Building for Production

```bash
npm run build
npm run preview
```

The built site will be in `dist/`.

---

## How to Use

1. Welcome Screen: Click "OK" to start. You'll see an animated liquid demo.
2. Paint: Click and drag to paint with the active color. Paint persists and mixes.
3. Controls:
   - Top-right dock: Play/Pause, Undo/Redo, Save, Gallery, Clear, Export, Menu
   - Bottom dock: Quick color picker, Studio button, and minimize toggle
   - Sidebar (Studio): Full controls for simulation, colors, effects, blending, and brush size
4. AI Features:
   - Generate color palettes or full "vibes" (palette + simulation params) from text prompts
   - Example prompts: "Bioluminescent forest," "Cosmic soup," "Neon noir"
5. Presets: Choose from 12 built-in palettes (Lava Lamp, Aurora Borealis, Ink Drop, etc.)
6. Session Restore: If you navigate away, you'll be prompted to restore your session on return
7. Gallery: Save artworks locally with thumbnails; reload configurations anytime
8. Export Video: Record 5–30 second WebM videos at various quality levels

---

## What We Did Today

This app was built from the ground up with the following components and features:

Core Architecture
- React 19 + TypeScript: Strict typing with functional components and hooks
- Vite: Fast dev server and optimized production builds
- Canvas2D Particle System: Custom fluid-like simulation with ~1200 active particles, radial gradients, physics (velocity, damping, life cycle)
- Dual Rendering Modes: Demo mode (auto-splat) and interactive painting mode

UI/UX Features
- Welcome Screen: Modal intro with fade-out animation
- Floating Sidebar: Draggable, snaps to edges, persists position in localStorage
- Bottom Dock: Minimizable color palette and tool selector
- Quick Actions Dock: Top-right compact toolbar for play, undo, save, export, clear, menu
- Tooltips: Contextual help on hover for all controls
- Modals: Save artwork, gallery browser, video export wizard
- Toast Notifications: Success/error feedback with auto-dismiss
- Session Persistence: Auto-saves state on beforeunload; prompts to restore on return

Simulation & Physics
- Particle System:
  - 5 particles per splat with random angle/speed
  - Life cycle (350–600 frames), alpha fade, size decay
  - Velocity damping (friction), random jitter
  - Caps at 1200 particles (FIFO eviction)
- Configurable Parameters:
  - Density, velocity, viscosity, pressure, diffusion (0–1 range)
  - Blend modes: lighter (additive), screen, overlay, soft-light, multiply, difference
  - Splat radius: 0.1–1.0

Color & Palette Management
- Dynamic Palettes: Add/remove colors, edit hex/picker, shuffle order
- AI Palette Generation (via Gemini 2.5 Flash):
  - Palette mode: 5 hex codes from a text prompt
  - Vibe mode: palette + density/velocity/viscosity tuned to the theme
- 12 Built-in Presets: Cosmic Soup, Lava Lamp, Aurora Borealis, Neon Noir, Oceanic Depth, Fairy Garden, Ink Drop, Pastel Dreams, Psychedelic Storm, Retro Opal, Toxic Slime, Solar Flare
- Paint Behaviors:
  - Blend: Use active color
  - Alternate/Sequence: Cycle through palette on each stroke

Effects & Post-Processing
- SVG Filters:
  - Chromatic Aberration: RGB channel offset for retro fringe effect
  - Grain: Fractal noise overlay at adjustable intensity
- Canvas Effects:
  - Configurable composite operations (lighter, screen, overlay, etc.)
  - Fade trails via partial-alpha background clear
- Grid Overlay: Optional alignment grid (32px)

Undo/Redo & History
- Visual Snapshots: WebP snapshots captured after strokes
- Config History: 30-step parameter undo/redo
- Clear Action: Undoable via snapshot system

Saving & Export
- Gallery:
  - Save artworks with names and JPEG thumbnails
  - Stored in localStorage (key: liquid-art-gallery)
  - Load saved configs; delete unwanted artworks
- Video Export:
  - MediaRecorder API (WebM/VP9)
  - Durations: 5s, 10s, 15s, 30s
  - Quality: 1 Mbps (Low), 5 Mbps (Medium), 10 Mbps (High)
  - Downloads as .webm file

Accessibility & Polish
- Keyboard Support: ESC closes panels/modals, Enter submits forms
- ARIA Labels: Proper roles, labels, and live regions for screen readers
- Responsive Layout: Sidebar and docks adapt to viewport; mobile-friendly touch events
- Custom Cursor: SVG crosshair with active color preview
- Dark Theme: Gray-900 base with purple accents, backdrop blur, subtle borders

Performance Optimizations
- ResizeObserver: Efficient canvas resizing with device pixel ratio
- Refs for State: Avoid re-renders for high-frequency updates (pointer, config)
- Particle Pooling: Cap at 1200, FIFO eviction
- Debounced Snapshots: Only capture after stroke ends
- Ambient Splats: Low-frequency (2s interval) background motion when idle

Developer Experience
- TypeScript: Strict mode, complete type coverage
- ESM Imports: Modern module syntax
- Path Alias: @/* maps to project root
- Hot Module Replacement: Vite HMR for instant feedback
- Environment Variables: Secure API key via .env.local

---

## Documentation

Explore detailed guides:

- Overview: ./docs/overview.md
- Structure: ./docs/structure.md
- Architecture: ./docs/architecture.md
- Components: ./docs/components.md
- AI Integration: ./docs/ai-integration.md
- Development: ./docs/development.md
- Performance: ./docs/performance.md
- Troubleshooting: ./docs/troubleshooting.md
- Refactoring: ./docs/refactoring.md
- Roadmap: ./docs/roadmap.md

---

## License

This project was created as part of an AI Studio exploration. See the repository for license information.

---

## Credits

- Inspired by 1960s liquid light shows
- Built with React, TypeScript, Vite
- AI-powered palettes via Google Gemini
- Icon components adapted from Heroicons
