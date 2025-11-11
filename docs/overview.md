# Overview

## Project Vision

The Psychedelic Liquid Light Show is a modern web recreation of the mesmerizing 1960s art form where artists projected swirling mixtures of oil, water, and food coloring through overhead projectors onto screens at concerts and performances. This digital version captures that trippy, organic aesthetic using Canvas2D particle simulations, AI-generated color palettes, and real-time user interaction.

### Goals

- **Authentic Feel**: Recreate the flowing, morphing, unpredictable nature of analog liquid light shows
- **Interactive Creation**: Allow users to "paint" and shape their own psychedelic visuals
- **AI-Powered Creativity**: Generate color palettes and simulation parameters from text descriptions
- **Accessibility**: Run smoothly in modern browsers without plugins or installations
- **Preservation**: Save and share creations via local gallery and video export

### Non-Goals

- This is not a physically accurate fluid simulation (we favor aesthetics and performance over realism)
- No server required—all data stored locally in the browser
- Not intended for production streaming (WebM export is for personal use)

---

## Supported Platforms

### Desktop (Recommended)
- **Chrome/Edge**: Full support, best performance
- **Firefox**: Full support
- **Safari**: Full support (macOS/iOS)

### Mobile/Tablet
- Touch interactions supported
- Performance varies by device (older phones may struggle with 1200+ particles)
- Video export may not work on all mobile browsers

---

## Features

### Core Simulation
- **Particle-Based Rendering**: Each "splat" spawns 5 particles with randomized physics
- **Fluid-like Motion**: Particles drift, jitter, fade, and shrink over their life cycle (350–600 frames)
- **Blend Modes**: lighter (additive), screen, overlay, soft-light, multiply, difference
- **Trail Effects**: Configurable fade for long, flowing streaks or sharp, defined strokes
- **Ambient Motion**: Gentle auto-splats keep the canvas alive even when idle

### Color & Palettes
- **Dynamic Editing**: Add, remove, shuffle, and edit colors in real-time
- **AI Generation**:
  - **Palette Mode**: Get 5 hex codes inspired by a text prompt (e.g., "bioluminescent forest")
  - **Vibe Mode**: Get a full preset (palette + simulation parameters) tuned to your theme
- **12 Built-in Presets**: Cosmic Soup, Lava Lamp, Aurora Borealis, Neon Noir, Oceanic Depth, Fairy Garden, Ink Drop, Pastel Dreams, Psychedelic Storm, Retro Opal, Toxic Slime, Solar Flare
- **Paint Behaviors**:
  - Blend: Always use the active color
  - Alternate/Sequence: Cycle through all palette colors on each stroke

### Post-Processing Effects
- **Chromatic Aberration**: RGB channel offset for retro film/camera artifacts
- **Grain**: Fractal noise overlay for analog texture
- **Grid Overlay**: Optional 32px alignment grid

### Saving & Export
- **Gallery**: Save snapshots with names and thumbnails to localStorage
- **Video Recording**: Capture 5–30 second WebM clips at Low/Medium/High quality
- **Session Persistence**: Auto-saves your work on tab close; prompts to restore on return

### UI/UX
- **Welcome Screen**: Animated demo intro
- **Draggable Sidebar**: Snaps to screen edges, persists position
- **Bottom Dock**: Minimizable color palette and tool selector
- **Quick Actions**: Top-right toolbar for play/pause, undo/redo, save, clear, export, menu
- **Keyboard Shortcuts**: ESC closes panels, Enter submits forms
- **Tooltips**: Contextual help on all controls
- **Dark Theme**: Elegant gray-900 base with purple accents

### Undo/Redo
- **Visual Snapshots**: WebP images captured after each stroke
- **Config History**: 30-step undo/redo for simulation parameters
- **Clear is Undoable**: Clearing the canvas creates a history checkpoint

---

## Terminology

### Canvas & Rendering
- **Canvas**: HTML5 `<canvas>` element where all visuals are drawn
- **Context (ctx)**: 2D rendering context (`CanvasRenderingContext2D`)
- **Device Pixel Ratio (DPR)**: Multiplier for Retina/high-DPI displays
- **Composite Operation**: How new pixels blend with existing pixels (e.g., `lighter`, `screen`)

### Simulation
- **Splat**: A single click/drag action that spawns 5 particles
- **Particle**: Individual visual unit with position, velocity, radius, color, and life
- **Life Cycle**: Number of frames a particle exists before being removed
- **Damping/Friction**: Velocity reduction each frame (simulates air resistance)
- **Jitter**: Small random velocity adjustments for organic motion

### Effects
- **Bloom**: Glow around bright areas (simulated parameter; not implemented in current version)
- **Sunrays**: Radial light beams (simulated parameter; not implemented in current version)
- **Chromatic Aberration**: Color fringing by offsetting RGB channels
- **Grain**: Film-like texture via SVG noise filter

### Data Management
- **Config**: The `LiquidConfig` object containing all simulation parameters
- **History**: Array of past configs for undo/redo
- **Snapshot**: Saved image of the canvas at a point in time
- **Artwork**: Saved configuration + thumbnail stored in localStorage

---

## What Makes This Special?

1. **AI-Powered Creativity**: Unlike traditional art tools, you can describe a mood or scene and let Gemini AI generate a matching palette and physics settings
2. **Persistent Canvas**: Your paint stays and mixes—no frame-by-frame clearing
3. **True Undo/Redo**: Visual snapshots let you rewind strokes, not just parameter changes
4. **No Installation**: Runs entirely in the browser with no server or plugins
5. **Inspired by History**: Pays homage to a forgotten 1960s art form

---

## Next Steps

- Explore the [Architecture](./architecture.md) to understand how rendering works
- Read [Development](./development.md) to set up your local environment
- Check out [Components](./components.md) for UI/UX implementation details
- See [AI Integration](./ai-integration.md) to learn how Gemini powers palette generation
