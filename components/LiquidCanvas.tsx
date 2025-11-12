
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
}

export const LiquidCanvas: React.FC<LiquidCanvasProps> = ({ config, isPlaying, activeColorIndex, setGetDataUrlCallback, setGetStreamCallback, setClearCallback, cursorUrl, isDemoMode, onDemoEnd, cycleEnabled = false, cycleMode = 'sequential', cycleCadence = 'per-stroke', selectedPresets = [], presets = [], onCommitConfig, performanceMode }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<LiquidRenderer | null>(null);
  const fallbackFluidRef = useRef<any>(null);
  // Temporarily disable WebGL while fixing PIXI v8 shader issues
  const [useWebGL, setUseWebGL] = useState<boolean>(false); // Was: supportsWebGL()
  const isPointerDownRef = useRef(false);
  
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

  }, [setGetDataUrlCallback, setGetStreamCallback, setClearCallback, useWebGL]);

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

    const currentConfig = configRef.current;
    const currentActiveColorIndex = activeColorIndexRef.current;
    const phase = currentConfig.activePhase || 'oil';
    const palette = phase === 'oil' ? (currentConfig.oilPalette || currentConfig.colors) : (currentConfig.waterPalette || currentConfig.colors);
    const color = palette[currentActiveColorIndex] || palette[0] || '#ff0000';
    const canvasWidth = containerRef.current?.clientWidth || 800;
    const baseRadius = canvasWidth * 0.05 * (currentConfig.splatRadius ?? 0.25);
    
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
  
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
      isPointerDownRef.current = true;

      // Begin cycling for this stroke if enabled
      if (!isDemoModeRef.current && cycleEnabled && selectedPresets.length > 0 && presets.length > 0) {
        cycleStateRef.current = { active: true, state: { current: 0, dir: 1 } };
        if (cycleCadence === 'per-stroke') {
          const preset = presets[selectedPresets[0]];
          if (preset) applyEphemeralPreset(preset.config, preset.name);
          cycleStateRef.current.state = nextIndex(cycleMode as CycleMode, cycleStateRef.current.state, selectedPresets.length);
        }
      } else {
        cycleStateRef.current = null;
      }

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      splat(x, y);
  }, [applyEphemeralPreset, cycleCadence, cycleEnabled, cycleMode, presets, selectedPresets, splat]);

  const handlePointerUp = useCallback(() => {
    isPointerDownRef.current = false;
    // Commit final applied preset to history (single entry per stroke)
    if (cycleStateRef.current?.active && cycleStateRef.current.lastApplied && onCommitConfig) {
      onCommitConfig(cycleStateRef.current.lastApplied);
    }
    cycleStateRef.current = null;
    // Notify HUD end
    // @ts-expect-error optional callback at runtime
    window.__onCycleEnd && window.__onCycleEnd();
  }, [onCommitConfig]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (isPointerDownRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      splat(x, y);
    }
  }, [splat]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full"
      style={{ cursor: cursorUrl ? `url(${cursorUrl}) 16 16, crosshair` : 'crosshair' }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerMove={handlePointerMove}
    >
      {/* Canvas2D fallback */}
      {!useWebGL && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />
      )}
      {/* WebGL renderer will append its own canvas to containerRef */}
    </div>
  );
};
