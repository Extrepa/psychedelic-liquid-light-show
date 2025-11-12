# Feature Roadmap
*Potential features for the Psychedelic Liquid Light Show, ordered by implementation difficulty*

---

## 🟢 Easy (1-2 hours each)

### 1. Quick preset switching with hotkeys
- Add keyboard shortcuts (1-9) to instantly switch presets
- Visual feedback when preset changes
- **Difficulty**: ⭐

### 2. Shake to clear
- Use device motion API to detect shake gestures
- Clear canvas on shake
- **Difficulty**: ⭐

### 3. Background patterns
- Add optional grid, dots, or gradient backgrounds
- Simple CSS/Canvas overlay
- **Difficulty**: ⭐

### 4. Color shifting over time
- Apply hue rotation to particles as they age
- Single parameter control
- **Difficulty**: ⭐⭐

### 5. Spray paint mode
- Continuous particle emission with randomization
- Alternative to single splats
- **Difficulty**: ⭐⭐

### 6. Eraser tool
- Click/drag to remove particles in a radius
- Simple particle filtering
- **Difficulty**: ⭐⭐

### 7. Glow/bloom intensity control
- Add post-processing blur pass
- Adjustable intensity slider
- **Difficulty**: ⭐⭐

---

## 🟡 Medium (2-5 hours each)

### 8. Tilt controls
- Use DeviceOrientation API for gravity direction
- Map phone tilt to gravity angle
- **Difficulty**: ⭐⭐⭐

### 9. Multi-touch support
- Handle multiple pointer events simultaneously
- Track each finger independently
- **Difficulty**: ⭐⭐⭐

### 10. Particle trails with motion blur
- Store particle history
- Render semi-transparent trail segments
- **Difficulty**: ⭐⭐⭐

### 11. Mirror/kaleidoscope mode
- Reflect drawing across symmetry axes
- 2, 4, 6, 8-way options
- **Difficulty**: ⭐⭐⭐

### 12. Animated brushes
- Add rotation, pulsation to brush patterns
- Time-based transformations
- **Difficulty**: ⭐⭐⭐

### 13. GIF export
- Use gif.js or similar library
- Capture canvas frames and encode
- **Difficulty**: ⭐⭐⭐

### 14. Undo/redo for brush strokes
- Track stroke history separately from config
- Replay strokes on undo
- **Difficulty**: ⭐⭐⭐⭐

### 15. Auto-record mode
- Circular buffer of last 30 seconds
- Save on demand
- **Difficulty**: ⭐⭐⭐⭐

### 16. Texture brushes
- Sample uploaded textures for stamp patterns
- Advanced image processing
- **Difficulty**: ⭐⭐⭐⭐

---

## 🟠 Advanced (5-10 hours each)

### 17. Turbulence/noise field
- Implement Perlin/Simplex noise
- Apply as force field to particles
- **Difficulty**: ⭐⭐⭐⭐

### 18. Gravity wells
- Click to create attraction points
- Calculate forces on all particles
- **Difficulty**: ⭐⭐⭐⭐

### 19. Wind simulation
- Directional force field
- Particle physics integration
- **Difficulty**: ⭐⭐⭐⭐

### 20. Particle attraction/repulsion
- Inter-particle forces
- Spatial hashing for performance
- **Difficulty**: ⭐⭐⭐⭐⭐

### 21. Vortex mode
- Swirling force fields
- Angular velocity calculations
- **Difficulty**: ⭐⭐⭐⭐⭐

### 22. Audio reactivity
- Web Audio API integration
- FFT analysis for frequency bands
- Map audio features to visual parameters
- **Difficulty**: ⭐⭐⭐⭐⭐

### 23. Share to social media
- OAuth integration for multiple platforms
- Image/video upload APIs
- Handle platform-specific requirements
- **Difficulty**: ⭐⭐⭐⭐⭐

---

## 🔴 Expert (10+ hours each)

### 24. Webcam integration
- MediaDevices API for camera access
- Real-time frame processing
- Computer vision for body tracking/masking
- **Difficulty**: ⭐⭐⭐⭐⭐⭐

### 25. Layer system
- Multiple independent fluid simulations
- Layer blending modes
- Complex state management
- **Difficulty**: ⭐⭐⭐⭐⭐⭐

### 26. Timelapse mode
- Variable playback speed
- Frame interpolation for smooth slowmo
- Complex recording state machine
- **Difficulty**: ⭐⭐⭐⭐⭐⭐

---

## Implementation Notes

### Quick Wins (Do First)
1. Quick preset switching with hotkeys
2. Shake to clear
3. Background patterns
4. Color shifting over time
5. Spray paint mode

### High Impact Features
- Audio reactivity (coolest but hardest)
- Mirror/kaleidoscope mode (medium effort, very cool)
- Glow/bloom intensity (easy and looks amazing)
- Multi-touch support (essential for mobile)
- Particle trails with motion blur (beautiful effect)

### Performance Considerations
- Features 20-21 (inter-particle physics) may require WebGL acceleration
- Audio reactivity should be optional/toggleable
- Layer system needs careful memory management
- Webcam integration requires optimization for mobile

### Mobile Priority
- Tilt controls
- Multi-touch support
- Shake to clear
- Performance optimization for all features

---

## Current Progress
✅ Brush patterns (single, polkadots, stripes, line, text, stamp)
✅ Custom stamp image upload
✅ Fade speed control (up to 2 minutes)
✅ Mobile gesture controls (pinch/rotate)
✅ Oil/Water phase system
✅ Dropper widget
✅ Preset cycling system
✅ Session persistence
✅ Gallery save/load
✅ Video export

---

*Last updated: 2025-11-12*
