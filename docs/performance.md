# Performance Guide

Tips and techniques for profiling and optimizing the Liquid Light Show.

## Profiling Tools

- **Chrome DevTools** → Performance tab (record frame timeline)
- **Performance monitor**: `Rendering` tab for FPS, paint, layout
- **Memory** tab (check for leaks or excessive allocations)

## Tuning Levers

- **Particle Cap**: Reduce from 1200 → 800 → 400
- **Fade Strength**: Increase `rgba(0,0,0,0.02)` → `0.05` to reduce persistence
- **Splat Frequency**: Lower ambient interval (e.g., from 2s → 3–4s)
- **Splat Size**: Reduce `splatRadius` or base size from `0.05` → `0.03`
- **Blend Mode**: `lighter` can be more expensive than `multiply`
- **Effects**: Set `chromaticAberration = 0` and `grain = 0` on low-end devices

## Device Pixel Ratio (DPR)

- DPR scaling multiplies pixel count dramatically (2x DPR = 4x pixels)
- Consider a cap:
```ts
const dpr = Math.min(window.devicePixelRatio || 1, 2);
```

## Resize Strategy

- Use `ResizeObserver` (already implemented)
- Debounce heavy operations on resize
- Avoid resizing canvas every frame

## GC Pressure

- Avoid creating new arrays/objects in the draw loop
- Keep particle objects simple (plain objects, no classes)
- Precompute constants outside loop when possible

## Mobile Tips

- Prefer lower particle caps and smaller radius
- Disable chromatic aberration and grain by default
- Minimize layout thrashing (avoid forced reflows)

## Feature Toggles (Advanced)

- Implement a "Performance Mode" toggle:
  - Reduce particle cap
  - Lower splat size
  - Disable grain, chromatic aberration

## Checklist

- [ ] Maintain 60fps on mid-range devices
- [ ] No memory growth over a 5-minute session
- [ ] No major layout thrash (minimize style recalcs)

## Next Steps

- See [Architecture](./architecture.md) for render loop details
- Read [Troubleshooting](./troubleshooting.md) for known issues
