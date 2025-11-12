
import React, { useRef, useEffect, useCallback, useState } from 'react';
import type { LiquidConfig } from '../types';
import { supportsWebGL } from '../engines/liquid-pixi/capabilities';
import { LiquidRenderer } from '../engines/liquid-pixi/LiquidRenderer';
import { getHueShiftedColor } from '../utils/colorUtils';

// Canvas2D fallback renderer (original particle system)
const Canvas2DFluid = (canvas: HTMLCanvasElement, initialConfig: LiquidConfig, opts?: { performanceMode?: boolean }) => {
  const ctx = canvas.getContext('2d');
  let animationFrameId: number | null = null;
  const particles: any[] = [];
  const perf = !!opts?.performanceMode;
  let currentConfig = initialConfig;

  const resizeCanvas = () => {
    const { devicePixelRatio = 1 } = window;
    canvas.width = canvas.clientWidth * devicePixelRatio;
    canvas.height = canvas.clientHeight * devicePixelRatio;
  };

  const clearCanvas = () => {
    if (ctx) {
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        particles.length = 0;
    }
  };

  const draw = () => {
    if (ctx) {
      // Use 'source-over' for the fade effect to create trails
      // Lower alpha = slower fade (longer trails)
      // Use diffusion to control fade speed: high diffusion = very slow fade
      const fadeAlpha = Math.max(0.001, 0.15 - (currentConfig.diffusion * 0.14)); // 0.15 to 0.01
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = `rgba(0, 0, 0, ${fadeAlpha})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Switch to the configured blend mode for color interaction
      ctx.globalCompositeOperation = currentConfig.blendMode as GlobalCompositeOperation;
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        
        p.life -= 1;
        if (p.life <= 0) {
            particles.splice(i, 1);
            continue;
        }
        
        // Update particle physics
        p.x += p.vx;
        p.y += p.vy;
        p.vx += (Math.random() - 0.5) * 0.4;
        p.vy += (Math.random() - 0.5) * 0.4;
        
        // Friction/Damping
        p.vx *= 0.98;
        p.vy *= 0.98;

        // Shrink particles over time
        p.radius *= 0.99;

        if (ctx && p.radius > 0.1) {
            const alpha = Math.max(0, p.life / p.maxLife);
            const ageRatio = 1 - (p.life / p.maxLife); // 0 = new, 1 = old

            // Apply hue shifting if enabled
            const hueShift = currentConfig.hueShift ?? 0;
            const displayColor = hueShift > 0 
              ? getHueShiftedColor(p.color, ageRatio, hueShift)
              : p.color;

            // Create a soft, glowing gradient for each particle
            const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
            
            // Simple hex to rgba conversion
            const r = parseInt(displayColor.slice(1, 3), 16);
            const g = parseInt(displayColor.slice(3, 5), 16);
            const b = parseInt(displayColor.slice(5, 7), 16);
            
            gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha * 0.8})`);
            gradient.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, ${alpha * 0.2})`);
            gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
    
    animationFrameId = requestAnimationFrame(draw);
  };
  
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  clearCanvas();

  const instance = {
    updateConfig: (newConfig: LiquidConfig) => {
      currentConfig = newConfig;
    },
    erase: (x: number, y: number, radius: number) => {
      const { devicePixelRatio = 1 } = window;
      const ex = x * devicePixelRatio;
      const ey = y * devicePixelRatio;
      const er = radius * devicePixelRatio;
      
      // Remove particles within radius
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        const dx = p.x - ex;
        const dy = p.y - ey;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < er) {
          particles.splice(i, 1);
        }
      }
    },
    splat: (x: number, y: number, radius: number, color: string) => {
      const { devicePixelRatio = 1 } = window;
      // Use diffusion to control particle lifetime (0=fast fade, 1=long fade up to 2 minutes)
      // At 60fps: 60 * 120 = 7200 frames = 2 minutes max
      const lifetimeMultiplier = 1 + (currentConfig.diffusion * 60); // 1x to 61x base lifetime
      const baseLife = perf ? 60 + Math.random() * 30 : 120 + Math.random() * 60;
      const maxLife = baseLife * lifetimeMultiplier;
      const numParticles = perf ? 3 : 5; // Fewer particles in performance mode

      for (let i = 0; i < numParticles; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1;
        const particle = {
            x: x * devicePixelRatio,
            y: y * devicePixelRatio,
            radius: (radius + (Math.random() - 0.5) * radius * 0.5) * devicePixelRatio,
            color,
            life: maxLife,
            maxLife: maxLife,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
        };
        particles.push(particle);
      }
      
      // Safety cap: limit total particles to prevent performance issues
      // With longer lifetimes, we need a higher cap
      const cap = perf ? 500 : 2000;
      if (particles.length > cap) {
          // Remove oldest particles (from beginning of array)
          particles.splice(0, particles.length - cap);
      }
    },
    play: () => {
      if (!animationFrameId) {
        draw();
      }
    },
    pause: () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    },
    clear: clearCanvas,
    destroy: () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      particles.length = 0;
    }
  };
  
  return instance;
};

import type { Preset } from '../constants/presets';
import { nextIndex, type CycleMode } from '../features/presets/PresetCycleEngine';
import { generateBrushPattern, sampleStampImage } from '../utils/brushPatterns';
import { getEasing, lerp } from '../utils/easing';
import { getSymmetryPoints, isSymmetryActive, type Point } from '../utils/symmetry';
import { ColorContextMenu } from './ColorContextMenu';

interface LiquidCanvasProps {
  config: LiquidConfig;
  isPlaying: boolean;
  activeColorIndex: number;
  setGetDataUrlCallback: (callback: () => string) => void;
  setGetStreamCallback: (callback: () => MediaStream) => void;
  setClearCallback?: (callback: () => void) => void;
  cursorUrl: string;
  isDemoMode: boolean;
  onDemoEnd: () => void;
  // Preset cycling
  cycleEnabled?: boolean;
  cycleMode?: CycleMode;
  cycleCadence?: 'per-stroke' | 'per-splat';
  selectedPresets?: number[];
  presets?: Preset[];
  onCommitConfig?: (cfg: Partial<LiquidConfig>) => void;
  performanceMode?: boolean;
  // Symmetry origin setter
  setSymmetryOriginMode?: (callback: (enabled: boolean) => void) => void;
  updateConfig: (cfg: Partial<LiquidConfig>) => void;
  onChangeActiveColor?: (index: number) => void;
}

export const LiquidCanvas: React.FC<LiquidCanvasProps> = ({ config, isPlaying, activeColorIndex, setGetDataUrlCallback, setGetStreamCallback, setClearCallback, cursorUrl, isDemoMode, onDemoEnd, cycleEnabled = false, cycleMode = 'sequential', cycleCadence = 'per-stroke', selectedPresets = [], presets = [], onCommitConfig, performanceMode, setSymmetryOriginMode, updateConfig, onChangeActiveColor }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<LiquidRenderer | null>(null);
  const fallbackFluidRef = useRef<any>(null);
  // Temporarily disable WebGL while fixing PIXI v8 shader issues
  const [useWebGL, setUseWebGL] = useState<boolean>(false); // Was: supportsWebGL()
  const isPointerDownRef = useRef(false);
  
  // Dropper mode state
  const pointerDownAtRef = useRef<number | null>(null);
  const pointerDownPosRef = useRef<{ x: number; y: number } | null>(null);
  const lastPointerPosRef = useRef<{ x: number; y: number } | null>(null);
  const previewRadiusRef = useRef<number>(0);
  const dripTimerRef = useRef<number | null>(null);
  const [previewCircle, setPreviewCircle] = useState<{ x: number; y: number; radius: number } | null>(null);
  
  // Symmetry origin setting mode
  const [settingSymmetryOrigin, setSettingSymmetryOrigin] = useState(false);
  
  // Color context menu
  const [colorMenuPos, setColorMenuPos] = useState<{ x: number; y: number } | null>(null);
  const colorMenuOpenRef = useRef(false);
  useEffect(() => { colorMenuOpenRef.current = !!colorMenuPos; }, [colorMenuPos]);
  
  // Drop cancellation - max hold time (2.5 seconds)
  const MAX_DROP_HOLD_MS = 2500;

  // Parallax yaw (rotateY) in degrees
  const [parallaxYaw, setParallaxYaw] = useState(0);
  
  // Wheel cooldown for phase switching
  const lastPhaseSwitchAtRef = useRef(0);
  
  // Store config in a ref to avoid re-creating callbacks on every config change for performance
  const configRef = useRef(config);
  configRef.current = config;
  const activeColorIndexRef = useRef(activeColorIndex);
  activeColorIndexRef.current = activeColorIndex;
  const isDemoModeRef = useRef(isDemoMode);
  isDemoModeRef.current = isDemoMode;

  // Initialize renderer (WebGL or Canvas2D fallback)
  useEffect(() => {
    if (!containerRef.current) return;
    
    if (useWebGL) {
      // Try to create PIXI renderer
      try {
        rendererRef.current = new LiquidRenderer({
          parent: containerRef.current,
          config: configRef.current,
          performanceMode,
        });
        
        if (isPlaying) {
          rendererRef.current.play();
        }
        
        console.log('[LiquidCanvas] Using WebGL (PIXI) renderer');
      } catch (err) {
        console.warn('[LiquidCanvas] WebGL init failed, falling back to Canvas2D:', err);
        setUseWebGL(false);
      }
    }
    
    // Canvas2D fallback
    if (!useWebGL && canvasRef.current) {
      fallbackFluidRef.current = Canvas2DFluid(canvasRef.current, configRef.current, { performanceMode });
      if (isPlaying) {
        fallbackFluidRef.current.play();
      }
      console.log('[LiquidCanvas] Using Canvas2D fallback renderer');
    }

    return () => {
      rendererRef.current?.destroy();
      rendererRef.current = null;
      fallbackFluidRef.current?.destroy();
      fallbackFluidRef.current = null;
    };
  }, [performanceMode, useWebGL]); // Recreate if performance mode toggles

  // Demo mode (auto-splat)
  useEffect(() => {
    const renderer = rendererRef.current || fallbackFluidRef.current;
    let demoInterval: number | null = null;
    
    if (isDemoMode && renderer) {
      renderer.play();
      demoInterval = window.setInterval(() => {
        if (!isDemoModeRef.current || !renderer) {
          if (demoInterval) clearInterval(demoInterval);
          return;
        }
        const currentConfig = configRef.current;
        const palette = currentConfig.oilPalette || currentConfig.colors;
        if (containerRef.current && palette.length > 0) {
          const w = containerRef.current.clientWidth;
          const h = containerRef.current.clientHeight;
          const x = w * Math.random();
          const y = h * Math.random();
          const color = palette[Math.floor(Math.random() * palette.length)];
          const radius = w * 0.05 * (Math.random() * 0.5 + 0.25);
          
          if (rendererRef.current) {
            rendererRef.current.splat(x, y, radius, color, 'oil');
          } else if (fallbackFluidRef.current) {
            fallbackFluidRef.current.splat(x, y, radius, color);
          }
        }
      }, 500);
    } else if (!isDemoMode && renderer) {
        renderer.clear();
        onDemoEnd();
    }

    return () => {
      if (demoInterval) clearInterval(demoInterval);
    };
  }, [isDemoMode, onDemoEnd, useWebGL]);

  // Config updates
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.updateConfig(config);
    } else if (fallbackFluidRef.current) {
      fallbackFluidRef.current.updateConfig(config);
    }
  }, [config]);

  // Play/pause
  useEffect(() => {
    const renderer = rendererRef.current || fallbackFluidRef.current;
    if (renderer && !isDemoMode) {
      if (isPlaying) {
        renderer.play();
      } else {
        renderer.pause();
      }
    }
  }, [isPlaying, isDemoMode]);

  // Capture callbacks
  useEffect(() => {
    const getUrl = () => {
      if (rendererRef.current) {
        const canvas = rendererRef.current.getCanvas();
        return canvas ? canvas.toDataURL('image/jpeg', 0.8) : '';
      } else if (canvasRef.current) {
        return canvasRef.current.toDataURL('image/jpeg', 0.8);
      }
      return '';
    };
    setGetDataUrlCallback(getUrl);
    
    const getStream = () => {
      if (rendererRef.current) {
        const canvas = rendererRef.current.getCanvas();
        return canvas ? canvas.captureStream(30) : new MediaStream();
      } else if (canvasRef.current) {
        return canvasRef.current.captureStream(30);
      }
      return new MediaStream();
    };
    setGetStreamCallback(getStream);
    
    // Clear callback
    if (setClearCallback) {
      const clear = () => {
        if (rendererRef.current) {
          rendererRef.current.clear();
        } else if (fallbackFluidRef.current) {
          fallbackFluidRef.current.clear();
        }
      };
      setClearCallback(clear);
    }
    
    // Symmetry origin mode callback
    if (setSymmetryOriginMode) {
      setSymmetryOriginMode(setSettingSymmetryOrigin);
    }

  }, [setGetDataUrlCallback, setGetStreamCallback, setClearCallback, setSymmetryOriginMode, useWebGL]);

  // Preset cycle internal state (per stroke)
  const cycleStateRef = useRef<{ active: boolean; state: { current: number; dir: 1 | -1 }; lastApplied?: Partial<LiquidConfig> } | null>(null);

  const applyEphemeralPreset = useCallback((presetCfg: Partial<LiquidConfig>, presetName?: string) => {
    const target = { ...configRef.current, ...presetCfg } as LiquidConfig;
    if (activeColorIndexRef.current >= target.colors.length) {
      activeColorIndexRef.current = Math.max(0, target.colors.length - 1);
    }
    
    if (rendererRef.current) {
      rendererRef.current.updateConfig(target);
    } else if (fallbackFluidRef.current) {
      fallbackFluidRef.current.updateConfig(target);
    }
    
    configRef.current = target;
    cycleStateRef.current && (cycleStateRef.current.lastApplied = presetCfg);
    // @ts-expect-error optional callback at runtime
    (window.__onCycleStep || onCommitConfig) && (window.__onCycleStep?.(presetName), null);
  }, []);

  const lastSplatPosRef = useRef<{ x: number; y: number } | null>(null);

  const splat = useCallback((x: number, y: number) => {
    if (isDemoModeRef.current) return;

    const currentConfig = configRef.current;
    const canvasWidth = containerRef.current?.clientWidth || 800;
    const baseRadius = canvasWidth * 0.05 * (currentConfig.splatRadius ?? 0.25);

    // Handle eraser mode
    if (currentConfig.eraserMode) {
      if (fallbackFluidRef.current && fallbackFluidRef.current.erase) {
        fallbackFluidRef.current.erase(x, y, baseRadius * 1.5);
      }
      return;
    }

    // Cycle per-splat if enabled
    const sel = selectedPresets;
    if (cycleStateRef.current?.active && cycleCadence === 'per-splat' && sel.length > 0 && presets.length > 0) {
      const now = performance.now();
      const gate = (cycleStateRef.current as any).lastAt || 0;
      if (now - gate > 60) {
        const idxInSel = cycleStateRef.current.state.current;
        const preset = presets[sel[idxInSel]];
        if (preset) applyEphemeralPreset(preset.config, preset.name);
        (cycleStateRef.current as any).lastAt = now;
        cycleStateRef.current.state = nextIndex(cycleMode as CycleMode, cycleStateRef.current.state, sel.length);
      }
    }

    const currentActiveColorIndex = activeColorIndexRef.current;
    const phase = currentConfig.activePhase || 'oil';
    const palette = phase === 'oil' ? (currentConfig.oilPalette || currentConfig.colors) : (currentConfig.waterPalette || currentConfig.colors);
    const color = palette[currentActiveColorIndex] || palette[0] || '#ff0000';
    
    // Generate pattern-based splats
    const brushPattern = currentConfig.brushPattern || 'single';
    
    // Handle stamp pattern specially
    if (brushPattern === 'stamp' && currentConfig.brushStampImage) {
      sampleStampImage(
        currentConfig.brushStampImage,
        x,
        y,
        baseRadius * 4,
        (points, colors) => {
          points.forEach((point, i) => {
            const stampColor = colors[i] || color;
            if (rendererRef.current) {
              rendererRef.current.splat(point.x, point.y, point.radius, stampColor, phase);
            } else if (fallbackFluidRef.current) {
              fallbackFluidRef.current.splat(point.x, point.y, point.radius, stampColor);
            }
          });
        }
      );
    } else {
      // Generate pattern points
      const points = generateBrushPattern(
        x,
        y,
        baseRadius,
        currentConfig,
        canvasWidth,
        lastSplatPosRef.current || undefined
      );
      
      // Apply each splat point
      points.forEach(point => {
        if (rendererRef.current) {
          rendererRef.current.splat(point.x, point.y, point.radius, color, phase);
        } else if (fallbackFluidRef.current) {
          fallbackFluidRef.current.splat(point.x, point.y, point.radius, color);
        }
      });
    }
    
    // Store last position for stripes pattern
    lastSplatPosRef.current = { x, y };
  }, [applyEphemeralPreset, cycleCadence, cycleMode, presets, selectedPresets]);
  
  // Preview circle animation
  useEffect(() => {
    if (!configRef.current.dropperEnabled || !pointerDownAtRef.current || !lastPointerPosRef.current) {
      setPreviewCircle(null);
      return;
    }
    
    if (!configRef.current.dropPreview) return;
    
    let rafId: number;
    const animate = () => {
      if (!pointerDownAtRef.current || !lastPointerPosRef.current) {
        setPreviewCircle(null);
        return;
      }
      
      const now = performance.now();
      const heldMsRaw = now - pointerDownAtRef.current;
      const lag = configRef.current.dropPreviewLagMs ?? 500;
      const heldMs = Math.max(0, heldMsRaw - lag);
      const timeToMax = configRef.current.dropTimeToMaxMs || 1200;
      const progress = Math.min(heldMs / timeToMax, 1);
      const easingFn = getEasing(configRef.current.dropEasing || 'ease-out');
      const eased = easingFn(progress);
      
      const minR = configRef.current.dropMinRadius || 0.01;
      const maxR = configRef.current.dropMaxRadius || 0.15;
      const canvasWidth = containerRef.current?.clientWidth || 800;
      const radiusPx = lerp(minR * canvasWidth, maxR * canvasWidth, eased);
      
      previewRadiusRef.current = radiusPx;
      setPreviewCircle({
        x: lastPointerPosRef.current.x,
        y: lastPointerPosRef.current.y,
        radius: radiusPx,
      });
      
      rafId = requestAnimationFrame(animate);
    };
    
    animate();
    return () => cancelAnimationFrame(rafId);
  }, [pointerDownAtRef.current, lastPointerPosRef.current]);
  
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (isDemoModeRef.current) return;
    // If the color menu is open, ignore canvas clicks
    if (colorMenuOpenRef.current) return;
    
    // Prevent default context menu
    if (e.button === 2) {
      e.preventDefault();
      return;
    }
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const currentConfig = configRef.current;
    
    // Symmetry origin setting mode
    if (settingSymmetryOrigin) {
      const canvasWidth = rect.width;
      const canvasHeight = rect.height;
      const normalizedX = x / canvasWidth;
      const normalizedY = y / canvasHeight;
      updateConfig({ symmetryOrigin: { x: normalizedX, y: normalizedY } });
      setSettingSymmetryOrigin(false);
      return;
    }
    
    isPointerDownRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    
    // Dropper mode (main interaction)
    if (currentConfig.dropperEnabled && !currentConfig.lineEnabled && !currentConfig.dripEnabled) {
      pointerDownAtRef.current = performance.now();
      pointerDownPosRef.current = { x, y };
      lastPointerPosRef.current = { x, y };
      // Don't splat yet - wait for release
      return;
    }
    
    // Drip mode
    if (currentConfig.dripEnabled) {
      lastPointerPosRef.current = { x, y };
      const interval = currentConfig.dripIntervalMs || 140;
      dripTimerRef.current = window.setInterval(() => {
        if (!lastPointerPosRef.current) return;
        const minR = currentConfig.dropMinRadius || 0.01;
        const canvasWidth = containerRef.current?.clientWidth || 800;
        const radiusPx = minR * canvasWidth;
        performSplat(lastPointerPosRef.current.x, lastPointerPosRef.current.y, radiusPx);
      }, interval);
      return;
    }
    
    // Line mode (existing continuous behavior)
    if (currentConfig.lineEnabled) {
      // Begin cycling for this stroke if enabled
      if (cycleEnabled && selectedPresets.length > 0 && presets.length > 0) {
        cycleStateRef.current = { active: true, state: { current: 0, dir: 1 } };
        if (cycleCadence === 'per-stroke') {
          const preset = presets[selectedPresets[0]];
          if (preset) applyEphemeralPreset(preset.config, preset.name);
          cycleStateRef.current.state = nextIndex(cycleMode as CycleMode, cycleStateRef.current.state, selectedPresets.length);
        }
      } else {
        cycleStateRef.current = null;
      }
      splat(x, y);
    }
  }, [applyEphemeralPreset, cycleCadence, cycleEnabled, cycleMode, presets, selectedPresets, settingSymmetryOrigin, splat, updateConfig]);
  
  const performSplat = useCallback((x: number, y: number, radiusPx: number) => {
    const currentConfig = configRef.current;
    const canvasWidth = containerRef.current?.clientWidth || 800;
    const canvasHeight = containerRef.current?.clientHeight || 600;
    
    // Get color
    const currentActiveColorIndex = activeColorIndexRef.current;
    const phase = currentConfig.activePhase || 'oil';
    const palette = phase === 'oil' ? (currentConfig.oilPalette || currentConfig.colors) : (currentConfig.waterPalette || currentConfig.colors);
    const color = palette[currentActiveColorIndex] || palette[0] || '#ff0000';
    
    // Convert to normalized coordinates
    const normalizedX = x / canvasWidth;
    const normalizedY = y / canvasHeight;
    
    // Apply symmetry if enabled
    let points: Point[];
    if (isSymmetryActive(currentConfig)) {
      const origin = currentConfig.symmetryOrigin || { x: 0.5, y: 0.5 };
      points = getSymmetryPoints(
        { x: normalizedX, y: normalizedY },
        {
          origin,
          count: currentConfig.symmetryCount || 6,
          mirror: currentConfig.symmetryMirror !== false,
          rotationDeg: currentConfig.symmetryRotationDeg || 0,
        }
      );
    } else {
      points = [{ x: normalizedX, y: normalizedY }];
    }
    
    // Splat at each symmetric point
    points.forEach(point => {
      const px = point.x * canvasWidth;
      const py = point.y * canvasHeight;
      
      if (rendererRef.current) {
        rendererRef.current.splat(px, py, radiusPx, color, phase);
      } else if (fallbackFluidRef.current) {
        fallbackFluidRef.current.splat(px, py, radiusPx, color);
      }

      // Edge runoff: if near edges, spawn a drip
      if (configRef.current.edgeRunoffEnabled) {
        const margin = 0.02; // 2% near edge
        if (point.x < margin) spawnRunoff('left', py, color);
        else if (point.x > 1 - margin) spawnRunoff('right', py, color);
        else if (point.y < margin) spawnRunoff('top', px, color);
        else if (point.y > 1 - margin) spawnRunoff('bottom', px, color);
      }
    });

    // Notify for flicker
    (window as any).__onSplat && (window as any).__onSplat();
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (colorMenuOpenRef.current) return;
    if (!isPointerDownRef.current) return;
    
    const currentConfig = configRef.current;
    e.currentTarget.releasePointerCapture(e.pointerId);
    
    // Dropper mode - commit the drop
    if (currentConfig.dropperEnabled && !currentConfig.lineEnabled && !currentConfig.dripEnabled && pointerDownAtRef.current) {
      const now = performance.now();
      const heldMs = now - pointerDownAtRef.current;
      
      // Cancel if held too long
      if (heldMs > MAX_DROP_HOLD_MS) {
        pointerDownAtRef.current = null;
        pointerDownPosRef.current = null;
        lastPointerPosRef.current = null;
        setPreviewCircle(null);
        isPointerDownRef.current = false;
        return;
      }
      
      const timeToMax = currentConfig.dropTimeToMaxMs || 1200;
      const progress = Math.min(heldMs / timeToMax, 1);
      const easingFn = getEasing(currentConfig.dropEasing || 'ease-out');
      const eased = easingFn(progress);
      
      const minR = currentConfig.dropMinRadius || 0.01;
      const maxR = currentConfig.dropMaxRadius || 0.15;
      const canvasWidth = containerRef.current?.clientWidth || 800;
      const radiusPx = lerp(minR * canvasWidth, maxR * canvasWidth, eased);
      
      // Use release position
      if (lastPointerPosRef.current) {
        performSplat(lastPointerPosRef.current.x, lastPointerPosRef.current.y, radiusPx);
      }
      
      // Clear preview
      pointerDownAtRef.current = null;
      pointerDownPosRef.current = null;
      lastPointerPosRef.current = null;
      setPreviewCircle(null);
    }
    
    // Drip mode - clear timer
    if (dripTimerRef.current) {
      clearInterval(dripTimerRef.current);
      dripTimerRef.current = null;
    }
    
    // Line mode - commit preset cycle
    if (currentConfig.lineEnabled) {
      if (cycleStateRef.current?.active && cycleStateRef.current.lastApplied && onCommitConfig) {
        onCommitConfig(cycleStateRef.current.lastApplied);
      }
      cycleStateRef.current = null;
      // @ts-expect-error optional callback at runtime
      window.__onCycleEnd && window.__onCycleEnd();
    }
    
    isPointerDownRef.current = false;
  }, [onCommitConfig, performSplat]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (colorMenuOpenRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if pointer moved off screen (cancel dropper)
    const isOffScreen = x < 0 || y < 0 || x > rect.width || y > rect.height;
    if (isOffScreen && pointerDownAtRef.current) {
      // Cancel dropper
      pointerDownAtRef.current = null;
      pointerDownPosRef.current = null;
      lastPointerPosRef.current = null;
      setPreviewCircle(null);
      isPointerDownRef.current = false;
      return;
    }
    
    // Update last position for all modes
    lastPointerPosRef.current = { x, y };
    
    if (!isPointerDownRef.current) return;
    
    const currentConfig = configRef.current;
    
    // Line mode - continuous splat
    if (currentConfig.lineEnabled) {
      splat(x, y);
    }
    
    // Parallax yaw (gentle rotateY based on cursor X)
    const cfg = configRef.current;
    if (cfg.sceneParallaxEnabled) {
      const nx = (x / rect.width) * 2 - 1; // -1..1
      const maxYaw = (cfg.sceneParallaxAmount ?? 0.5) * 6; // up to ~6deg
      setParallaxYaw(nx * maxYaw);
    } else if (parallaxYaw !== 0) {
      setParallaxYaw(0);
    }
    
    // Dropper and drip modes update position but don't splat on move
  }, [parallaxYaw, splat]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (dripTimerRef.current) {
        clearInterval(dripTimerRef.current);
      }
    };
  }, []);
  
  // Keyboard shortcut: ESC to exit symmetry origin mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && settingSymmetryOrigin) {
        setSettingSymmetryOrigin(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settingSymmetryOrigin]);
  
  // Right-click handler for color picker
  const handleContextMenu = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setColorMenuPos({ x: e.clientX, y: e.clientY });
  }, []);
  
  const handleColorSelect = useCallback((color: string) => {
    const cfg = configRef.current;
    const idx = activeColorIndexRef.current;

    // If phase palettes exist, update the active palette slot so splats use it immediately
    if (cfg.activePhase === 'oil' && Array.isArray(cfg.oilPalette) && cfg.oilPalette.length) {
      const oil = [...cfg.oilPalette];
      if (idx < oil.length) oil[idx] = color; else oil.push(color);
      // Keep UI colors in sync with current phase palette
      updateConfig({ oilPalette: oil, colors: oil });
      onChangeActiveColor?.(Math.min(idx, oil.length - 1));
      return;
    }
    if (cfg.activePhase === 'water' && Array.isArray(cfg.waterPalette) && cfg.waterPalette.length) {
      const water = [...cfg.waterPalette];
      if (idx < water.length) water[idx] = color; else water.push(color);
      updateConfig({ waterPalette: water, colors: water });
      onChangeActiveColor?.(Math.min(idx, water.length - 1));
      return;
    }

    // Fallback: operate on generic colors array
    const currentColors = cfg.colors || [];
    const next = [...currentColors];
    if (idx < next.length) next[idx] = color; else next.push(color);
    updateConfig({ colors: next });
    onChangeActiveColor?.(Math.min(idx, next.length - 1));
  }, [onChangeActiveColor, updateConfig]);
  
  // Edge runoff model
  type Runoff = { id: number; side: 'left' | 'right' | 'top' | 'bottom'; pos: number; color: string; startedAt: number };
  const [runoffs, setRunoffs] = useState<Runoff[]>([]);
  const runoffIdRef = useRef(0);

  const spawnRunoff = (side: Runoff['side'], posPx: number, color: string) => {
    const id = runoffIdRef.current++;
    setRunoffs(r => [...r, { id, side, pos: posPx, color, startedAt: performance.now() }]);
  };

  useEffect(() => {
    let raf: number;
    const tick = () => {
      const now = performance.now();
      // Remove runoffs older than 2.5s
      setRunoffs(items => items.filter(it => now - it.startedAt < 2500));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const renderRunoff = (r: Runoff) => {
    if (!containerRef.current) return null;
    const w = containerRef.current.clientWidth;
    const h = containerRef.current.clientHeight;
    const t = Math.min(1, (performance.now() - r.startedAt) / 2500);
    const lengthScale = configRef.current.edgeRunoffLengthScale ?? 0.6;
    const length = h * lengthScale * t; // grows
    const thickness = (configRef.current.edgeRunoffThicknessPx ?? 4);
    const opacity = 0.6 * (1 - t);

    const common: React.CSSProperties = { position: 'absolute', opacity, pointerEvents: 'none' };
    const grad = `linear-gradient(${r.side === 'left' || r.side === 'right' ? 'to bottom' : 'to right'}, ${r.color}, rgba(255,255,255,0))`;

    if (r.side === 'left') return <div key={r.id} style={{ ...common, left: 0, top: r.pos - length / 2, width: thickness, height: length, background: grad }} />;
    if (r.side === 'right') return <div key={r.id} style={{ ...common, right: 0, top: r.pos - length / 2, width: thickness, height: length, background: grad }} />;
    if (r.side === 'top') return <div key={r.id} style={{ ...common, top: 0, left: r.pos - length / 2, height: thickness, width: length, background: grad }} />;
    return <div key={r.id} style={{ ...common, bottom: 0, left: r.pos - length / 2, height: thickness, width: length, background: grad }} />;
  };

  // Wheel to switch phase or colors
  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    if (isDemoModeRef.current) return;
    if (settingSymmetryOrigin) return;

    const dy = e.deltaY;
    // CMD/Meta scroll cycles colors
    if (e.metaKey) {
      e.preventDefault();
      const dir = dy > 0 ? 1 : -1;
      const colors = configRef.current.colors;
      if (!colors.length) return;
      let idx = (activeColorIndexRef.current + dir + colors.length) % colors.length;
      activeColorIndexRef.current = idx;
      onChangeActiveColor?.(idx);
      return;
    }

    // Plain scroll toggles oil/water with cooldown
    const now = performance.now();
    if (now - lastPhaseSwitchAtRef.current < 200) return;
    lastPhaseSwitchAtRef.current = now;
    e.preventDefault();
    const next = (configRef.current.activePhase || 'oil') === 'oil' ? 'water' : 'oil';
    updateConfig({ activePhase: next });
  }, [onChangeActiveColor, settingSymmetryOrigin, updateConfig]);
  
  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full"
      style={{ 
        cursor: settingSymmetryOrigin 
          ? 'crosshair' 
          : (cursorUrl ? `url(${cursorUrl}) 16 16, crosshair` : 'crosshair'),
        // Add subtle 3D perspective - viewing from slight angle + parallax yaw
        transform: `perspective(2000px) rotateX(7deg) rotateY(${parallaxYaw}deg)`,
        transformStyle: 'preserve-3d',
      }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerMove={handlePointerMove}
      onContextMenu={handleContextMenu}
      onWheel={handleWheel}
    >
      {/* Canvas2D fallback */}
      {!useWebGL && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />
      )}
      {/* WebGL renderer will append its own canvas to containerRef */}
      
      {/* Edge runoff overlays */}
      {runoffs.map(renderRunoff)}
      
      {/* Preview circle overlay - red transparent with grid lines */}
      {previewCircle && (
        <div
          className="absolute rounded-full pointer-events-none transition-all duration-75"
          style={{
            left: previewCircle.x - previewCircle.radius,
            top: previewCircle.y - previewCircle.radius,
            width: previewCircle.radius * 2,
            height: previewCircle.radius * 2,
            backgroundImage: `radial-gradient(circle, rgba(255,0,0,0.12), rgba(255,0,0,0.08)),
                              repeating-linear-gradient(0deg, rgba(255,0,0,0.25) 0 1px, rgba(255,0,0,0) 1px 10px),
                              repeating-linear-gradient(90deg, rgba(255,0,0,0.25) 0 1px, rgba(255,0,0,0) 1px 10px)`,
            border: '2px solid rgba(255,0,0,0.55)',
            boxShadow: `0 0 ${previewCircle.radius * 0.25}px rgba(255,0,0,0.45), inset 0 0 ${previewCircle.radius * 0.15}px rgba(255,0,0,0.25)`,
            opacity: 0.9,
          }}
        />
      )}

      {/* Dropper art overlay (follows cursor) */}
      {configRef.current.dropperCursorEnabled && configRef.current.dropperCursorUrl && lastPointerPosRef.current && (
        (()=>{
          // Determine active color and approximate tint via CSS filter
          const currentActiveColorIndex = activeColorIndexRef.current;
          const phase = configRef.current.activePhase || 'oil';
          const palette = phase === 'oil' ? (configRef.current.oilPalette || configRef.current.colors) : (configRef.current.waterPalette || configRef.current.colors);
          const color = palette[currentActiveColorIndex] || palette[0] || '#ffffff';

          const hexToHsl = (hex: string) => {
            let h=0,s=0,l=0;
            const m = hex.replace('#','');
            const bigint = parseInt(m.length===3 ? m.split('').map(c=>c+c).join('') : m, 16);
            const r = ((bigint>>16)&255)/255;
            const g = ((bigint>>8)&255)/255;
            const b = (bigint&255)/255;
            const max = Math.max(r,g,b), min = Math.min(r,g,b);
            l = (max+min)/2;
            if (max===min) { h=0; s=0; }
            else {
              const d = max-min;
              s = l>0.5 ? d/(2-max-min) : d/(max+min);
              switch(max){
                case r: h = (g-b)/d + (g<b?6:0); break;
                case g: h = (b-r)/d + 2; break;
                case b: h = (r-g)/d + 4; break;
              }
              h/=6;
            }
            return {h: h*360, s, l};
          };
          const {h} = hexToHsl(color.startsWith('#')?color:'#ffffff');
          const tintFilter = `sepia(1) saturate(6000%) hue-rotate(${Math.round(h)}deg) brightness(1.0)`;
          const left = lastPointerPosRef.current.x - (configRef.current.dropperCursorTipOffsetX ?? ((configRef.current.dropperCursorSizePx ?? 42) * 0.25));
          const top = lastPointerPosRef.current.y - (configRef.current.dropperCursorTipOffsetY ?? ((configRef.current.dropperCursorSizePx ?? 42) * 0.75));
          const w = (configRef.current.dropperCursorSizePx ?? 42);
          return (
            <img
              src={configRef.current.dropperCursorUrl!}
              alt="dropper"
              className="absolute pointer-events-none select-none"
              style={{
                left,
                top,
                width: w,
                height: 'auto',
                opacity: 0.98,
                filter: `${tintFilter} drop-shadow(0 2px 6px rgba(0,0,0,0.45))`,
                transform: `rotate(${configRef.current.dropperCursorRotationDeg ?? -8}deg)`,
                mixBlendMode: 'screen',
              }}
            />
          );
        })()
      )}
      
      {/* Symmetry origin crosshair */}
      {configRef.current.symmetryEnabled && configRef.current.symmetryOrigin && containerRef.current && !(configRef.current.dropperCursorEnabled && configRef.current.dropperCursorUrl) && (
        <div
          className="absolute pointer-events-none"
          style={{
            width: (configRef.current.crosshairSizePx ?? 12),
            height: (configRef.current.crosshairSizePx ?? 12),
            left: (configRef.current.symmetryOrigin.x * containerRef.current.clientWidth) - (configRef.current.crosshairSizePx ?? 12) / 2,
            top: (configRef.current.symmetryOrigin.y * containerRef.current.clientHeight) - (configRef.current.crosshairSizePx ?? 12) / 2,
          }}
        >
          <svg width={configRef.current.crosshairSizePx ?? 12} height={configRef.current.crosshairSizePx ?? 12} viewBox="0 0 16 16" className="drop-shadow-md">
            <line x1="8" y1="0" x2="8" y2="16" stroke="white" strokeWidth="1.2" />
            <line x1="0" y1="8" x2="16" y2="8" stroke="white" strokeWidth="1.2" />
            <circle cx="8" cy="8" r="3" fill="none" stroke="white" strokeWidth="1.2" />
          </svg>
        </div>
      )}
      
      {/* Symmetry origin setting mode overlay */}
      {settingSymmetryOrigin && (
        <div className="absolute inset-0 bg-black/20 pointer-events-none flex items-center justify-center">
          <div className="bg-gray-900/90 text-white px-4 py-2 rounded-lg text-sm">
            Click to set symmetry origin • Press ESC to cancel
          </div>
        </div>
      )}
      
      {/* Color context menu */}
      {colorMenuPos && (
        <>
          {/* Modal shield to disable canvas clicks while picking color */}
          <div className="absolute inset-0 z-[4999]" style={{ cursor: 'default' }} />
          <ColorContextMenu
            x={colorMenuPos.x}
            y={colorMenuPos.y}
            onColorSelect={(c)=>{ handleColorSelect(c); setColorMenuPos(null); }}
            onClose={() => setColorMenuPos(null)}
          />
        </>
      )}
    </div>
  );
};
