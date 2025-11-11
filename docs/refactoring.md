# Refactoring & Reorganization Plan

Concrete steps to simplify, harden, and scale the codebase.

## 1) Unify Source Tree

Currently both top-level and `src/` trees exist. Adopt `src/` as the canonical source.

### Steps
- Move (or remove) top-level `index.tsx`, `App.tsx`, `components/`, `services/`, `constants/`, `types.ts` once all references use `src/`
- Update `tsconfig.json` and `vite.config.ts`:
  - Set alias `@` → `path.resolve(__dirname, 'src')`
  - In `tsconfig.json` paths: `"@/*": ["./src/*"]`
- Ensure `index.html` continues to load `/src/index.tsx`

## 2) Strengthen Types & Config

- Extract `LiquidConfig` into `src/types.ts` (already present)
- Centralize config schema with ranges and metadata (for UI generation)
- Add zod (optional) to validate saved sessions and AI responses

## 3) Introduce Linting & Formatting

- ESLint + Prettier (see Development guide)
- Enforce no unused vars, consistent imports, and hook rules

## 4) Performance Guardrails

- Cap DPR at 2 on low-end devices
- Add a "Performance Mode" toggle in UI
- Snapshot capture throttling (already minimal)

## 5) Modularize Effects (Optional)

- Move AfterEffects filters to `src/effects/aftereffects.tsx`
- Create an `Effect` interface for consistent extension:
```ts
interface Effect {
  id: string;
  render(children: React.ReactNode, config: LiquidConfig): React.ReactNode;
}
```

## 6) Testing

- Add basic unit tests for utility functions (if added)
- Visual regression (optional): snapshot canvas outputs

## 7) PWA (Optional)

- Add service worker for offline use and installability
- Cache static assets and `dist/` build

## 8) WebGL Roadmap (Optional)

- Migrate particle sim to WebGL or WebGPU for higher particle counts
- Use ping-pong framebuffers for diffusion-like trails
- Post-processing pipeline (bloom, blur, aberration) via shader passes

## Migration Checklist

- [ ] Alias `@` points to `src/`
- [ ] Remove duplicate top-level components once parity is confirmed
- [ ] Lint passes; build passes
- [ ] README and docs updated
- [ ] Optional: enable CI to check type/lint/build
