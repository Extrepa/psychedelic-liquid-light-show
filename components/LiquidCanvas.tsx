
import React, { useRef, useEffect, useCallback } from 'react';
import type { LiquidConfig } from '../types';

// This is a mock implementation to provide visual feedback.
// It uses a 2D canvas context with a particle system to simulate a fluid effect.
const WebGLFluid = (canvas: HTMLCanvasElement, initialConfig: LiquidConfig, opts?: { performanceMode?: boolean }) => {
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
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
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

            // Create a soft, glowing gradient for each particle
            const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
            
            // Simple hex to rgba conversion
            const r = parseInt(p.color.slice(1, 3), 16);
            const g = parseInt(p.color.slice(3, 5), 16);
            const b = parseInt(p.color.slice(5, 7), 16);
            
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
    splat: (x: number, y: number, radius: number, color: string) => {
      const { devicePixelRatio = 1 } = window;
      const maxLife = perf ? 60 + Math.random() * 30 : 80 + Math.random() * 50;
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
      
      const cap = perf ? 150 : 300;
      if (particles.length > cap) {
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

interface LiquidCanvasProps {
  config: LiquidConfig;
  isPlaying: boolean;
  activeColorIndex: number;
  setGetDataUrlCallback: (callback: () => string) => void;
  setGetStreamCallback: (callback: () => MediaStream) => void;
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

export const LiquidCanvas: React.FC<LiquidCanvasProps> = ({ config, isPlaying, activeColorIndex, setGetDataUrlCallback, setGetStreamCallback, cursorUrl, isDemoMode, onDemoEnd, cycleEnabled = false, cycleMode = 'sequential', cycleCadence = 'per-stroke', selectedPresets = [], presets = [], onCommitConfig, performanceMode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fluidRef = useRef<any>(null);
  const isPointerDownRef = useRef(false);
  // Store config in a ref to avoid re-creating callbacks on every config change for performance
  const configRef = useRef(config);
  configRef.current = config;
  const activeColorIndexRef = useRef(activeColorIndex);
  activeColorIndexRef.current = activeColorIndex;
  const isDemoModeRef = useRef(isDemoMode);
  isDemoModeRef.current = isDemoMode;

  useEffect(() => {
    if (canvasRef.current && !fluidRef.current) {
      fluidRef.current = WebGLFluid(canvasRef.current, configRef.current, { performanceMode });
    }
    
    if (fluidRef.current && isPlaying) {
      fluidRef.current.play();
    }

    return () => {
      fluidRef.current?.destroy();
      fluidRef.current = null;
    }
  }, [performanceMode]); // Recreate if performance mode toggles

  useEffect(() => {
    let demoInterval: number | null = null;
    if (isDemoMode && fluidRef.current) {
      fluidRef.current.play();
      demoInterval = window.setInterval(() => {
        if (!isDemoModeRef.current || !fluidRef.current) {
          if (demoInterval) clearInterval(demoInterval);
          return;
        }
        const currentConfig = configRef.current;
        const colors = currentConfig.colors;
        if (canvasRef.current && colors.length > 0) {
          const x = canvasRef.current.clientWidth * Math.random();
          const y = canvasRef.current.clientHeight * Math.random();
          const color = colors[Math.floor(Math.random() * colors.length)];
          const radius = canvasRef.current.clientWidth * 0.05 * (Math.random() * 0.5 + 0.25);
          fluidRef.current.splat(x, y, radius, color);
        }
      }, 500);
    } else if (!isDemoMode && fluidRef.current) {
        fluidRef.current.clear();
        onDemoEnd();
    }

    return () => {
      if (demoInterval) clearInterval(demoInterval);
    };
  }, [isDemoMode, onDemoEnd]);

  useEffect(() => {
    if (fluidRef.current) {
      fluidRef.current.updateConfig(config);
    }
  }, [config]);

  useEffect(() => {
    if (fluidRef.current && !isDemoMode) { // Don't let user pause the demo
      if (isPlaying) {
        fluidRef.current.play();
      } else {
        fluidRef.current.pause();
      }
    }
  }, [isPlaying, isDemoMode]);

  useEffect(() => {
    const getUrl = () => {
      return canvasRef.current?.toDataURL('image/jpeg', 0.8) || '';
    };
    setGetDataUrlCallback(getUrl);
    
    const getStream = () => {
      return canvasRef.current?.captureStream(30) || new MediaStream();
    };
    setGetStreamCallback(getStream);

  }, [setGetDataUrlCallback, setGetStreamCallback]);

  // Preset cycle internal state (per stroke)
  const cycleStateRef = useRef<{ active: boolean; state: { current: number; dir: 1 | -1 }; lastApplied?: Partial<LiquidConfig> } | null>(null);

  const applyEphemeralPreset = useCallback((presetCfg: Partial<LiquidConfig>, presetName?: string) => {
    // Clamp activeColorIndex if colors shrink
    const target = { ...configRef.current, ...presetCfg } as LiquidConfig;
    if (activeColorIndexRef.current >= target.colors.length) {
      activeColorIndexRef.current = Math.max(0, target.colors.length - 1);
    }
    fluidRef.current?.updateConfig(target);
    configRef.current = target;
    cycleStateRef.current && (cycleStateRef.current.lastApplied = presetCfg);
    // Notify HUD step
    // @ts-expect-error optional callback at runtime
    (window.__onCycleStep || onCommitConfig) && (window.__onCycleStep?.(presetName), null);
  }, []);

  const splat = useCallback((x: number, y: number) => {
    if (isDemoModeRef.current) return;

    // If cycling per splat, advance before applying the splat
    const sel = selectedPresets;
    if (cycleStateRef.current?.active && cycleCadence === 'per-splat' && sel.length > 0 && presets.length > 0) {
      const now = performance.now();
      const gate = (cycleStateRef.current as any).lastAt || 0;
      // throttle to ~60ms to avoid excessive reconfig on very fast moves
      if (now - gate > 60) {
        const idxInSel = cycleStateRef.current.state.current;
        const preset = presets[sel[idxInSel]];
        if (preset) applyEphemeralPreset(preset.config, preset.name);
        (cycleStateRef.current as any).lastAt = now;
        // move to next for subsequent splat
        cycleStateRef.current.state = nextIndex(cycleMode, cycleStateRef.current.state, sel.length);
      }
    }

    const currentConfig = configRef.current;
    const currentActiveColorIndex = activeColorIndexRef.current;
    if (fluidRef.current && canvasRef.current && currentConfig.colors[currentActiveColorIndex]) {
        const radius = canvasRef.current.clientWidth * 0.05 * currentConfig.splatRadius;
        fluidRef.current.splat(x, y, radius, currentConfig.colors[currentActiveColorIndex]);
    }
  }, [applyEphemeralPreset, cycleCadence, cycleMode, presets, selectedPresets]);
  
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
      isPointerDownRef.current = true;

      // Begin cycling for this stroke if enabled
      if (!isDemoModeRef.current && cycleEnabled && selectedPresets.length > 0 && presets.length > 0) {
        cycleStateRef.current = { active: true, state: { current: 0, dir: 1 } };
        if (cycleCadence === 'per-stroke') {
          const preset = presets[selectedPresets[0]];
          if (preset) applyEphemeralPreset(preset.config, preset.name);
          cycleStateRef.current.state = nextIndex(cycleMode, cycleStateRef.current.state, selectedPresets.length);
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

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isPointerDownRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      splat(x, y);
    }
  }, [splat]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full"
      style={{ cursor: cursorUrl ? `url(${cursorUrl}) 16 16, crosshair` : 'crosshair' }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerMove={handlePointerMove}
    />
  );
};