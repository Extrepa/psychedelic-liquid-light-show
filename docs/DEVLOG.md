# Dev Log — Dropper + Presets + Display Effects

Date: 2025-11-12

Highlights
- Integrated dropper + symmetry final wiring (App.tsx callbacks)
- Right‑click 64‑color picker (ColorContextMenu) for on‑the‑fly color switching
- Dropper UX upgrades: hold‑growth preview, cancel on long-hold or off-screen, pointer-follow
- Visual angle: added subtle perspective + optional parallax tilt
- Display controls: brightness, resize flash, on‑splat flicker, edge runoff (thickness/length)
- Scroll shortcuts: wheel toggles Oil/Water; Cmd+wheel cycles colors
- Preset overhaul: categories, descriptions, and Display hooks; compact Presets panel
- Custom dropper art: uploadable image, size, rotation, and tip offset alignment

Files touched (key)
- App: App.tsx (wiring PresetsPanel, LiquidCanvas callbacks)
- Canvas: components/LiquidCanvas.tsx (dropper, preview, runoff, wheel, parallax, color menu, alignment)
- Controls: EffectsPanel.tsx (Display section), BrushPanel.tsx (dropper art + alignment), PresetsPanel.tsx (new)
- Presets: constants/presets.ts (categories, descriptions, display hooks)
- Config: types.ts, constants.ts (new fields and defaults)
- Visual: AfterEffects.tsx (brightness + flash/flicker overlay), BackgroundPattern.tsx (unchanged)

Next
- Group filters in PresetStrip (done) + favorites
- Optional dropper tip fine‑tune UI preset per vibe
- WebGL re-enable once PIXI v8 shader types resolved
- Test suite fix (add test runner types)
