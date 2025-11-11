# Roadmap

Ideas and future directions.

## Near-Term
- Performance mode toggle (reduced particles, disabled effects)
- Sidebar preset manager (save/load custom presets)
- Shareable URLs (encode palette + params)
- Gallery export/import (JSON)

## Medium-Term
- Audio reactivity (microphone → FFT bands → parameters)
- Multi-touch painting (up to 5 concurrent splats)
- Controller/MIDI support (map knobs to parameters)
- OBS overlay mode (transparent background)

## Long-Term
- WebGL/WebGPU backend (true fluid sim or high-performance particles)
- Shader-based effects (bloom, blur, displacement, distortion)
- PWA installability and offline mode
- Multi-pass composer with effect graph
- Community preset library (curation, ratings)

## Tech Debt
- Duplicate source trees (top-level vs src/)
- Missing linting/formatting pipeline
- No test suite

## Notes
- Keep the analog aesthetic central; WebGL should enhance the vibe, not sterilize it
- Maintain zero-setup experience: run in modern browsers, no installs
