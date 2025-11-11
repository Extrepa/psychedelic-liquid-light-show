# Troubleshooting

Common issues and fixes.

## Blank Screen
- Check console for errors
- Verify `.env.local` exists and contains `GEMINI_API_KEY`
- Ensure `index.html` is serving `/src/index.tsx` under Vite dev

## Poor Performance
- Lower particle cap in `LiquidCanvas` (e.g., 1200 → 600)
- Increase fade strength `rgba(0,0,0,0.02)` to `0.05`
- Disable grain and chromatic aberration (Effects panel)

## Video Export Not Working
- Some browsers don’t support `MediaRecorder('video/webm; codecs=vp9')`
- Try lower bitrate (1 Mbps)
- Ensure the app has focus; avoid background tabs during recording

## AI Generation Fails
- Check network tab; ensure Gemini responses are 200
- Verify API key and quota limits
- Retry with simpler prompt

## Session Restore Not Prompting
- Confirm `localStorage['liquid-art-prompt-restore']` is `true`
- If corrupted, clear storage:
```js
localStorage.removeItem('liquid-art-session');
localStorage.removeItem('liquid-art-prompt-restore');
```

## Sidebar Position Broken
- Reset saved position:
```js
localStorage.removeItem('sidebar-pos');
```

## Colors Look Off
- Blend modes interact with background; try `additive` vs `screen`
- Disable chromatic aberration for color-critical output

## Next Steps
- See [Development](./development.md) for environment setup
- Read [Performance](./performance.md) to improve framerate
