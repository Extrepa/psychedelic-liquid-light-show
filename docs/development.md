# Development Guide

How to run, build, and work on the Psychedelic Liquid Light Show locally.

## Prerequisites

- Node.js v16+
- npm (or pnpm/yarn)
- Modern browser (Chrome/Firefox/Safari/Edge)

## Install & Run

```bash
# install
npm install

# dev server (http://localhost:3000)
npm run dev

# production build (output: dist/)
npm run build

# preview production build
npm run preview
```

## Environment Variables

Create `.env.local` at the repo root:
```bash
GEMINI_API_KEY=your_api_key_here
```

Vite exposes the key to the client via `vite.config.ts`:
```ts
define: {
  'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
  'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
}
```

Access in code via `process.env.API_KEY`.

## Project Conventions

- **Language**: TypeScript (strict, noEmit)
- **Modules**: ESM-only (`type: module`)
- **Paths**: `@/*` alias → repo root
- **Styling**: Tailwind (CDN)
- **State**: React hooks; performance-sensitive state in refs

## Debugging Tips

- Toggle `console.log` in `LiquidCanvas` for particle counts, FPS
- Temporarily increase fade to inspect trails: `ctx.fillStyle = 'rgba(0,0,0,0.2)'`
- Lower particle cap (e.g., 400) for low-end devices
- Force blend mode to test modes: `config.blendMode = 'difference'`
- Disable effects for perf testing: set `chromaticAberration=0`, `grain=0`

## LocalStorage Keys

- `liquid-art-session`: Serialized session state
- `liquid-art-prompt-restore`: `true` to trigger restore prompt
- `liquid-art-gallery`: Array of saved artworks
- `sidebar-pos`: Sidebar X/Y position

Reset everything via DevTools:
```js
localStorage.clear();
```

## Testing Ideas

- Visual regression snapshots of canvas via `toDataURL`
- Performance budgets: ensure 60fps on mid-tier laptop
- Cross-browser tests (Chrome, Firefox, Safari)
- Mobile sanity pass (iOS Safari, Android Chrome)

## Code Layout (Current)

- Two parallel source trees exist:
  - Top-level files: legacy/original structure (`index.tsx`, `App.tsx`, `components/`)
  - `src/` folder: modernized structure (preferred)
- `index.html` references `/src/index.tsx`; the `src/` tree is the primary entry

## Suggested Reorg (Optional)

See [Refactoring](./refactoring.md) for a migration plan to a single `src/` tree with `@/` alias pointing to `src/`.

## Linting & Formatting

- Add ESLint + Prettier (recommended):
```bash
npm i -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-config-prettier eslint-plugin-react eslint-plugin-react-hooks prettier
```

Example `.eslintrc.cjs`:
```js
module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  extends: ['eslint:recommended', 'plugin:react/recommended', 'plugin:@typescript-eslint/recommended', 'plugin:react-hooks/recommended', 'prettier'],
};
```

## CI/CD (Optional)

- GitHub Actions workflow suggestion:
  - Install deps
  - Type-check
  - Build
  - Deploy to static hosting (Netlify/Vercel/GitHub Pages)

## Notes on AI Studio

- This project originated from AI Studio scaffolding
- `metadata.json` describes the app for Studio
- The `index.html` includes an import map for CDN dependencies, but Vite handles modules locally during dev/build

## Troubleshooting

- Build fails: Ensure Node 16+, delete `node_modules` and reinstall
- Blank screen: Check for console errors; verify `.env.local` is present and valid
- Video export issues: Some browsers/platforms don't support `MediaRecorder('video/webm;codecs=vp9')`

## Next Steps

- See [Performance](./performance.md) for profiling
- Read [Troubleshooting](./troubleshooting.md) for common fixes
- Explore [Refactoring](./refactoring.md) for codebase cleanup
