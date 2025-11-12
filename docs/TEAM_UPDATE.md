# Team Update — Consolidated Status, Decisions, and Next‑Day Plan

Date: 2025-11-12
Owner: Engineering

Executive summary
- Core interactions and display polish landed: dramatic Dropper with symmetry, preset catalog with categories, brighter scene with flicker/flash, and a consolidated ControlDock (pinned sidebar) nearly ready to replace the legacy top HUD.
- Immediate next steps: finalize DimmerSlider as always‑on brightness control, hide legacy TopPanel by default with a Settings toggle, and QA ControlDock behaviors. Git push is currently blocked by SSH auth; see Actions.

How to run
- Dev: `npm run dev` then open http://localhost:5180
- Tests: `npm run test`
- Typecheck: `npm run typecheck`
- Build: `npm run build`, Preview: `npm run preview` (http://localhost:4321)

Status by theme
1) Dropper + Symmetry — Complete (tuning ongoing)
- Hold‑to‑grow from 1% to 15% with easing; quick click makes a small drop; ~1.2s hold reaches max.
- Red preview circle with grid styling shows growth and intentionally lags actual radius by ~500ms.
- Symmetry: toggleable counts (2/4/6/8/12) + mirror; origin set mode with crosshair; ESC cancels.
- Perspective: light rotateX plus optional cursor parallax.
- Custom dropper art overlay (upload) with size, rotation, and tip offsets; dropper tint follows active color; crosshair hides when custom dropper art is visible.
- Wheel UX: wheel toggles Oil/Water; Cmd+wheel cycles colors.
- Key code: components/LiquidCanvas.tsx, components/controls/BrushPanel.tsx, components/ColorContextMenu.tsx.

2) Brightness, Flash/Flicker, Darken Overlay, Grain — Active
- Brightness control implemented in components/AfterEffects.tsx via CSS brightness filter; default scene brightened.
- Resize Flash and on‑splat Flicker overlays added with rAF decay.
- Optional black “darken overlay” below content with adjustable amount.
- Grain default greatly reduced for clarity.
- Always‑on DimmerSlider component exists (components/DimmerSlider.tsx) and needs to be rendered in App so it’s persistently available.

3) Presets system — Complete (polish ongoing)
- Broad catalog with categories: Core, Acid, Goofy, Nitrous, Healing, Blends; one‑line descriptions.
- PresetStrip exposes category filter chips; compact mobile sizing.
- PresetsPanel groups presets for fast scanning; presets can also drive Display hooks (brightness/flicker/runoff, etc.).
- Key code: ui/Trays/PresetStrip.tsx, components/controls/PresetsPanel.tsx.

4) UI restructure — Complete
- Effects consolidated into Settings; Display controls moved to Settings for clarity.
- AppBar/TopPanel and PresetStrip compacted for mobile friendliness.
- Key code: components/controls/SettingsPanel.tsx, ui/AppBar/AppBar.tsx, ui/TopPanel/TopPanel.tsx, ui/Trays/PresetStrip.tsx, components/controls/ColorPanel.tsx.

5) ControlDock (full‑height pinned sidebar) — Active
- ControlDock provides consolidated controls with tabs (Brush/Colors/Presets/Effects/Sim/Settings) and header actions (Play/Pause, Undo/Redo, Save, Export, Grid). Pinned mode is a full‑height sidebar with scrollable content and compact scale.
- Collapsed mode shows a small "Open Controls" button.
- To finalize: ensure consistent full‑height behavior across viewports; verify all header actions; make it the primary control surface; hide legacy HUD by default (toggle in Settings). After verification, archive legacy files.
- Key code: components/ControlDock.tsx, App wiring (renders above canvas), ui/* legacy HUD files.

6) Right‑click Color Picker — Complete
- 64‑color quick menu; canvas interactions disabled while open; selecting a color updates active phase immediately and closes the menu.
- Key code: components/ColorContextMenu.tsx, components/LiquidCanvas.tsx (overlay shield + onColorSelect).

7) Flash/Flicker and Edge Runoff — Complete (tuning possible)
- Resize flash and on‑splat flicker in AfterEffects; runoff near edges animates drips.
- Mobile performance looks acceptable; keep an eye on low‑end devices.
- Key code: components/AfterEffects.tsx, components/LiquidCanvas.tsx.

Decisions and eliminations
- Make ControlDock the primary control surface; legacy TopPanel/AppBar will be hidden by default and later archived once parity confirmed.
- Scene is intentionally brighter by default; user can dial down via DimmerSlider.
- Grain is near‑zero by default; use sparingly for texture.

Acceptance criteria checkpoints
- Dropper: quick click small drop; 1.2s hold reaches 15% with smooth ease‑out; preview lags by ~0.5s and shows grid styling.
- Symmetry/mirror work; origin set via crosshair; ESC cancels.
- Custom dropper art: tinted to active color; crosshair hides whenever custom art is shown.
- Right‑click color picker: blocks canvas, updates color immediately, closes on select.
- Wheel: toggles Oil/Water; Cmd+wheel cycles palette colors.
- Brightness: persistent slider always visible; darken overlay optional and adjustable.
- ControlDock pinned fits window height, internal panels scroll as needed; header actions functional.

Risks and mitigations
- Mobile perf: runoff and overlays might spike CPU. Mitigate with throttles and early bailouts on low DPR; profile on devices.
- Pointer‑blocking overlays: ensure shield only mounts while menu open; verify z‑index doesn’t trap input unexpectedly.
- LocalStorage persistence: guard against null/parse errors; debounce writes.
- Export via MediaRecorder: browser compatibility varies; provide graceful fallback messaging.

Actions to prep for tomorrow
1) Wire always‑on brightness slider
- Render components/DimmerSlider.tsx globally so it updates sceneBrightness live.
- Verify it plays nicely with darken overlay and preset Display hooks.

2) Hide legacy top HUD by default
- Ensure SettingsPanel toggle exists and defaults to off; keep the option to re‑enable for comparison.
- After QA, move ui/AppBar/AppBar.tsx and ui/TopPanel/TopPanel.tsx to an archive folder and remove from app render.

3) ControlDock QA pass
- Verify full‑height pinned layout across viewport sizes; confirm scroll areas within content.
- Test header actions: Play/Pause, Undo/Redo, Save, Export, Grid.
- Confirm collapsed state and re‑open affordance.

4) Final interaction polish
- Confirm crosshair reliably hides when custom dropper art is active and tinting matches current color.
- Validate preview lag timing feels correct across frame rates.
- Test wheel interactions on macOS trackpads (phase toggle and color cycling).

5) Git push/auth
- Load SSH key, then push: `ssh-add ~/.ssh/id_ed25519` and retry `git push`.

Owner sweep (suggested)
- Controls/UI: ControlDock, Settings toggle — Owner A
- Canvas/FX: DimmerSlider wiring, AfterEffects brightness interplay — Owner B
- Input/UX polish: crosshair hide, wheel behaviors, right‑click menu QA — Owner C
- Infra: SSH auth + push, docs update — Owner D

Open questions
- Do we want a small commit delay for drops (dropCommitDelayMs) or keep instant?
- Add Favorites and search to Presets now or later?
- Timeline to re‑enable PIXI WebGL shaders path once v8 shader types are stabilized?

Reference file map (key)
- components/LiquidCanvas.tsx — pointer handlers, preview, symmetry, wheel, runoff, color menu shield
- components/AfterEffects.tsx — brightness filter, flash/flicker, darken overlay
- components/ControlDock.tsx — sidebar/pinned controls and header actions
- components/DimmerSlider.tsx — persistent lights slider (to wire into App)
- components/controls/SettingsPanel.tsx — Display and Layout toggles (HUD visibility)
- ui/Trays/PresetStrip.tsx — category filters and compact strip
- components/controls/PresetsPanel.tsx — grouped presets with descriptions
- components/ColorContextMenu.tsx — right‑click color picker

Ready to pick up
- Start with Actions (1) and (2), then do the ControlDock QA pass. Run `npm run dev` and validate acceptance criteria above. When ready, archive the legacy HUD and push once SSH is unlocked.
