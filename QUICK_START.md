# Quick Start Guide - New Features

A fast reference for using the newly implemented medium-difficulty features.

---

## 🚀 Quick Setup

### 1. Import Everything
```typescript
// In App.tsx or your main component
import { getAudioService, DEFAULT_AUDIO_PARAMS } from './services/audioService';
import { getTransitionService } from './services/transitionService';
import { useTiltControls } from './hooks/useTiltControls';
import { AudioPanel } from './components/controls/AudioPanel';
import { AdvancedPanel, DEFAULT_ADVANCED_EFFECTS } from './components/controls/AdvancedPanel';
```

### 2. Add State
```typescript
const [audioParams, setAudioParams] = useState(DEFAULT_AUDIO_PARAMS);
const [advancedEffects, setAdvancedEffects] = useState(DEFAULT_ADVANCED_EFFECTS);

const tiltControls = useTiltControls({
  enabled: advancedEffects.tilt.enabled,
  smoothing: advancedEffects.tilt.smoothing,
  sensitivity: advancedEffects.tilt.sensitivity,
  invertX: advancedEffects.tilt.invertX,
  invertY: advancedEffects.tilt.invertY,
});
```

### 3. Add UI
```tsx
{/* In your control panel/sidebar */}
<AudioPanel
  params={audioParams}
  onParamsChange={(p) => setAudioParams(prev => ({ ...prev, ...p }))}
/>

<AdvancedPanel
  effects={advancedEffects}
  onEffectsChange={setAdvancedEffects}
  onRequestTiltPermission={tiltControls.requestPermission}
  tiltSupported={tiltControls.isSupported}
/>
```

---

## 🎵 Audio Reactivity - 1 Minute Setup

```typescript
// 1. Get the service
const audioService = getAudioService();

// 2. Enable microphone (in a click handler)
const handleEnableAudio = async () => {
  await audioService.initializeMicrophone();
  setAudioParams({ ...audioParams, enabled: true });
};

// 3. Read audio data (in render loop)
useEffect(() => {
  if (!audioParams.enabled) return;
  
  const interval = setInterval(() => {
    const data = audioService.getAudioData();
    const level = audioService.getPrimaryValue(); // 0-1
    
    // Use it!
    if (audioParams.modulateVelocity) {
      updateConfig({
        velocity: 0.3 + level * 0.5 * audioParams.velocityAmount
      });
    }
  }, 16); // 60 FPS
  
  return () => clearInterval(interval);
}, [audioParams]);
```

**Done!** Audio levels now control your visuals.

---

## 📱 Tilt Controls - 1 Minute Setup

```typescript
// Already have the hook from step 2 above!

// Just use it in an effect
useEffect(() => {
  if (!advancedEffects.tilt.enabled) return;
  
  const interval = setInterval(() => {
    const angle = tiltControls.getGravityAngle();    // 0-360°
    const strength = tiltControls.getGravityStrength(); // 0-1
    
    updateConfig({
      gravityAngleDeg: angle,
      gravityStrength: strength * 0.8,
    });
  }, 50); // 20 FPS is enough
  
  return () => clearInterval(interval);
}, [advancedEffects.tilt.enabled]);
```

**Done!** Tilting device now changes gravity.

---

## 🔮 Shaders - 1 Minute Setup

```typescript
// 1. Import shaders (vite-plugin-glsl handles this)
import kaleidoscopeShader from './shaders/kaleidoscope.frag.glsl';
import displacementShader from './shaders/displacement.frag.glsl';

// 2. Create filters (in component mount or ref callback)
const kaleidoscopeFilter = new PIXI.Filter(null, kaleidoscopeShader, {
  uSegments: 6,
  uAngle: 0,
  uCenter: [0.5, 0.5],
  uResolution: [canvas.width, canvas.height],
});

const displacementFilter = new PIXI.Filter(null, displacementShader, {
  uTime: 0,
  uStrength: 0.5,
  uDirection: [0, 0],
  uResolution: [canvas.width, canvas.height],
});

// 3. Apply to sprite/stage
useEffect(() => {
  const filters = [];
  
  if (advancedEffects.kaleidoscope.enabled) {
    kaleidoscopeFilter.uniforms.uSegments = advancedEffects.kaleidoscope.segments;
    kaleidoscopeFilter.uniforms.uAngle = advancedEffects.kaleidoscope.rotation * Math.PI / 180;
    filters.push(kaleidoscopeFilter);
  }
  
  if (advancedEffects.displacement.enabled) {
    displacementFilter.uniforms.uStrength = advancedEffects.displacement.strength;
    displacementFilter.uniforms.uDirection = [
      advancedEffects.displacement.direction.x,
      advancedEffects.displacement.direction.y,
    ];
    filters.push(displacementFilter);
  }
  
  sprite.filters = filters.length > 0 ? filters : null;
}, [advancedEffects]);

// 4. Animate time (in ticker)
app.ticker.add((delta) => {
  displacementFilter.uniforms.uTime += delta * 0.01;
});
```

**Done!** Shaders are now active!

---

## 🎨 Transitions - 30 Second Setup

```typescript
const transitionService = getTransitionService();

// In your preset selection handler
const handlePresetSelect = (newPreset) => {
  transitionService.transition(config, newPreset, {
    duration: 2000, // 2 seconds
    easing: 'easeInOut',
    onUpdate: (interpolatedConfig) => {
      updateConfig(interpolatedConfig, false); // false = don't push to history
    },
    onComplete: () => {
      console.log('Transition complete!');
    },
  });
};
```

**Done!** Smooth transitions between presets!

---

## 📋 Cheat Sheet

### Audio Modulation Values
```typescript
const data = audioService.getAudioData();
// data.bass      // 0-1, low frequencies
// data.mid       // 0-1, mid frequencies  
// data.treble    // 0-1, high frequencies
// data.overall   // 0-1, full spectrum
// data.spectrum  // array of frequency bins
// data.waveform  // array of time-domain data
```

### Tilt Values
```typescript
const angle = tiltControls.getGravityAngle();      // 0-360°
const strength = tiltControls.getGravityStrength(); // 0-1
const { x, y } = tiltControls.getNormalizedTilt();  // -1 to 1
```

### Shader Uniforms
```glsl
// Kaleidoscope
uniform float uSegments;  // 2, 4, 6, 8, 12
uniform float uAngle;     // radians
uniform vec2 uCenter;     // 0-1, 0-1

// Displacement
uniform float uTime;      // seconds
uniform float uStrength;  // 0-1
uniform vec2 uDirection;  // -1 to 1, -1 to 1
```

### Transition Easing
```typescript
'linear'     // Constant speed
'easeIn'     // Slow start
'easeOut'    // Slow end
'easeInOut'  // Slow start and end
```

---

## 🎯 Common Patterns

### Audio-Reactive Color Cycling
```typescript
useEffect(() => {
  if (!audioParams.enabled || !audioParams.modulateColors) return;
  
  let currentColorIndex = 0;
  const audioService = getAudioService();
  
  const interval = setInterval(() => {
    const level = audioService.getPrimaryValue();
    
    // Cycle colors on beat (threshold crossing)
    if (level > 0.7 && lastLevel <= 0.7) {
      currentColorIndex = (currentColorIndex + 1) % config.colors.length;
      setActiveColorIndex(currentColorIndex);
    }
    
    lastLevel = level;
  }, 16);
  
  return () => clearInterval(interval);
}, [audioParams]);
```

### Tilt-Based Particle Size
```typescript
useEffect(() => {
  if (!advancedEffects.tilt.enabled) return;
  
  const interval = setInterval(() => {
    const strength = tiltControls.getGravityStrength();
    const size = 0.1 + strength * 0.4; // 0.1 to 0.5
    
    updateConfig({ splatRadius: size });
  }, 50);
  
  return () => clearInterval(interval);
}, [advancedEffects.tilt.enabled]);
```

### Auto-Cycle Presets with Transitions
```typescript
useEffect(() => {
  if (!autoCycleEnabled) return;
  
  let currentIndex = 0;
  const interval = setInterval(() => {
    currentIndex = (currentIndex + 1) % PRESETS.length;
    const nextPreset = PRESETS[currentIndex];
    
    transitionService.transition(config, nextPreset.config, {
      duration: 3000,
      easing: 'easeInOut',
      onUpdate: updateConfig,
    });
  }, 10000); // Switch every 10 seconds
  
  return () => clearInterval(interval);
}, [autoCycleEnabled]);
```

### Kaleidoscope Auto-Rotate
```typescript
useEffect(() => {
  if (!advancedEffects.kaleidoscope.enabled) return;
  
  let rotation = 0;
  const interval = setInterval(() => {
    rotation = (rotation + 1) % 360;
    setAdvancedEffects(prev => ({
      ...prev,
      kaleidoscope: { ...prev.kaleidoscope, rotation }
    }));
  }, 33); // ~30 FPS
  
  return () => clearInterval(interval);
}, [advancedEffects.kaleidoscope.enabled]);
```

---

## 🔥 Performance Tips

1. **Throttle Updates**
   - Audio: 30-60 FPS is plenty
   - Tilt: 20 FPS is enough for gravity
   - Config updates: Debounce rapid changes

2. **Shader Optimization**
   - Kaleidoscope + displacement = ~5-8ms per frame
   - Consider quality toggle for mobile
   - Disable on low-end devices

3. **Audio Buffer Management**
   - Service uses ~100KB memory
   - Only one audio context needed
   - Destroy service on unmount

4. **Transition Performance**
   - Interpolation is fast (<0.1ms)
   - Can run many transitions
   - Cancel old transition before starting new

---

## 🐛 Troubleshooting

### Audio Not Working
```typescript
// Check microphone permission
if (audioParams.enabled && !isInitialized) {
  console.log('Microphone not initialized');
  // Call: audioService.initializeMicrophone()
}

// Check audio context state
await audioService.resume(); // Required after user interaction
```

### Tilt Not Working (iOS)
```typescript
// Must request permission on iOS 13+
const granted = await tiltControls.requestPermission();
if (!granted) {
  console.log('Permission denied');
}

// Check support
if (!tiltControls.isSupported) {
  console.log('Device orientation not supported');
}
```

### Shaders Not Applying
```typescript
// Check WebGL support
const hasWebGL = !!canvas.getContext('webgl');

// Verify filter creation
console.log(kaleidoscopeFilter.program); // Should not be undefined

// Check uniforms
console.log(kaleidoscopeFilter.uniforms.uSegments); // Should be a number
```

### Transitions Jerky
```typescript
// Don't push to history during transition
transitionService.transition(config, target, {
  onUpdate: (c) => updateConfig(c, false), // false = no history
  //                                ^^^^^ Important!
});
```

---

## 📚 More Info

- **Full Documentation**: `docs/new-features.md`
- **Implementation Details**: `IMPLEMENTATION_SUMMARY.md`
- **Feature Roadmap**: `FEATURE_ROADMAP.md`

---

**Happy coding!** 🎨🎵✨
