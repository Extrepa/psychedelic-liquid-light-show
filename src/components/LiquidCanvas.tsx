
import React, { useRef, useEffect, useCallback } from 'react';
import type { LiquidConfig } from '../types';

// This is a mock implementation to provide visual feedback.
// It uses a 2D canvas context with a particle system to simulate a fluid effect.
const WebGLFluid = (canvas: HTMLCanvasElement, initialConfig: LiquidConfig) => {
  const ctx = canvas.getContext('2d');
  let animationFrameId: number | null = null;
  const particles: any[] = [];
  let currentConfig = initialConfig;

  const resizeCanvas = () => {
    const { devicePixelRatio = 1 } = window;
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;
    if (cssW === 0 || cssH === 0) return; // wait until layout is ready
    const desiredW = Math.floor(cssW * devicePixelRatio);
    const desiredH = Math.floor(cssH * devicePixelRatio);
    if (canvas.width !== desiredW || canvas.height !== desiredH) {
      canvas.width = desiredW;
      canvas.height = desiredH;
    }
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
      ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Switch to the configured blend mode for color interaction
      ctx.globalCompositeOperation = currentConfig.blendMode as GlobalCompositeOperation;
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        
        p.life -= 0.5;
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
        p.radius *= 0.995;

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
  
  // Keep canvas in sync with element size
  const ro = new ResizeObserver(() => resizeCanvas());
  ro.observe(canvas);
  window.addEventListener('resize', resizeCanvas);
  // Defer initial resize in case layout is not ready
  setTimeout(resizeCanvas, 0);
  clearCanvas();

  const instance = {
    updateConfig: (newConfig: LiquidConfig) => {
      currentConfig = newConfig;
    },
    splat: (x: number, y: number, radius: number, color: string) => {
      const { devicePixelRatio = 1 } = window;
      const maxLife = 350 + Math.random() * 250;
      const numParticles = 5; // Create a small burst

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
      
      if (particles.length > 1200) {
          particles.splice(0, particles.length - 1200);
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
      ro.disconnect();
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      particles.length = 0;
    }
  };
  
  return instance;
};

interface LiquidCanvasProps {
  config: LiquidConfig;
  isPlaying: boolean;
  activeColorIndex: number;
  setGetDataUrlCallback: (callback: () => string) => void;
  setGetStreamCallback: (callback: () => MediaStream) => void;
  setClearCallback?: (callback: () => void) => void;
  setUndoRedoCallbacks?: (callbacks: { undo: () => void; redo: () => void }) => void;
  cursorUrl: string;
  isDemoMode: boolean;
  onDemoEnd: () => void;
  onFirstPaint?: () => void;
  behaviorMode?: 'blend' | 'alternate' | 'sequence';
}

type PaintAction = { type: 'splat'; x: number; y: number; radius: number; color: string } | { type: 'clear' };

export const LiquidCanvas: React.FC<LiquidCanvasProps> = ({ config, isPlaying, activeColorIndex, setGetDataUrlCallback, setGetStreamCallback, setClearCallback, setUndoRedoCallbacks, cursorUrl, isDemoMode, onDemoEnd, onFirstPaint, behaviorMode = 'blend' }) => {
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
  const hasPaintedRef = useRef(false);
  const rotateIndexRef = useRef(0);
  // Paint history for undo/redo
  const actionsRef = useRef<PaintAction[]>([]);
  const actionIndexRef = useRef<number>(0);

  useEffect(() => {
    if (canvasRef.current && !fluidRef.current) {
      fluidRef.current = WebGLFluid(canvasRef.current, configRef.current);
    }
    
    if (fluidRef.current && isPlaying) {
      fluidRef.current.play();
    }

    return () => {
      fluidRef.current?.destroy();
      fluidRef.current = null;
    }
  }, []); // Only run once on mount

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

  // Snapshot-based history (visual)
  const snapshotRef = useRef<string[]>([]);
  const snapshotIndexRef = useRef<number>(0);

  const captureSnapshot = () => {
    try {
      const url = canvasRef.current?.toDataURL('image/webp', 0.7) || '';
      return url;
    } catch {
      return '';
    }
  };
  const drawSnapshot = (url: string) => {
    const img = new Image();
    img.onload = () => {
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx && canvasRef.current) {
        ctx.globalCompositeOperation = 'source-over';
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    };
    img.src = url;
  };
  const commitSnapshot = () => {
    const url = captureSnapshot();
    if (!url) return;
    snapshotRef.current = snapshotRef.current.slice(0, snapshotIndexRef.current);
    snapshotRef.current.push(url);
    snapshotIndexRef.current = snapshotRef.current.length;
  };

  // Subtle ambient motion even outside demo
  useEffect(() => {
    if (!fluidRef.current) return;
    let ambient: number | null = null;
    if (!isDemoModeRef.current && isPlaying) {
      ambient = window.setInterval(() => {
        if (!fluidRef.current || !canvasRef.current) return;
        const currentConfig = configRef.current;
        const colors = currentConfig.colors;
        if (colors.length === 0) return;
        const x = canvasRef.current.clientWidth * Math.random();
        const y = canvasRef.current.clientHeight * Math.random();
        const color = colors[Math.floor(Math.random() * colors.length)];
        const radius = canvasRef.current.clientWidth * 0.03 * (Math.random() * 0.4 + 0.2);
        fluidRef.current.splat(x, y, radius, color);
      }, 2000);
    }
    return () => { if (ambient) clearInterval(ambient); };
  }, [isPlaying]);

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

    const doClear = () => {
      // commit current before clear
      commitSnapshot();
      // record clear action and perform
      actionsRef.current = actionsRef.current.slice(0, actionIndexRef.current);
      actionsRef.current.push({ type: 'clear' });
      actionIndexRef.current = actionsRef.current.length;
      fluidRef.current?.clear();
      commitSnapshot();
    };
    setClearCallback && setClearCallback(doClear);

    const replay = () => {
      fluidRef.current?.clear();
      const upto = actionIndexRef.current;
      for (let i = 0; i < upto; i++) {
        const a = actionsRef.current[i];
        if (a.type === 'clear') {
          fluidRef.current?.clear();
        } else if (a.type === 'splat') {
          fluidRef.current?.splat(a.x, a.y, a.radius, a.color);
        }
      }
    };

    const undo = () => {
      // paint snapshots
      if (snapshotIndexRef.current > 1) { // keep at least initial
        snapshotIndexRef.current -= 1;
        drawSnapshot(snapshotRef.current[snapshotIndexRef.current - 1]);
      } else {
        replay();
      }
    };
    const redo = () => {
      if (snapshotIndexRef.current < snapshotRef.current.length) {
        drawSnapshot(snapshotRef.current[snapshotIndexRef.current]);
        snapshotIndexRef.current += 1;
      } else {
        replay();
      }
    };
    setUndoRedoCallbacks && setUndoRedoCallbacks({ undo, redo });

  }, [setGetDataUrlCallback, setGetStreamCallback, setClearCallback, setUndoRedoCallbacks]);

  const splat = useCallback((x: number, y: number) => {
    if (isDemoModeRef.current) return;
    const currentConfig = configRef.current;
    const currentActiveColorIndex = activeColorIndexRef.current;
    if (fluidRef.current && canvasRef.current && currentConfig.colors.length>0) {
        const radius = canvasRef.current.clientWidth * 0.05 * currentConfig.splatRadius;
        let color = currentConfig.colors[currentActiveColorIndex] || '#ffffff';
        if (behaviorMode !== 'blend') {
          const idx = rotateIndexRef.current % currentConfig.colors.length;
          color = currentConfig.colors[idx];
          rotateIndexRef.current = (rotateIndexRef.current + 1) % Math.max(1,currentConfig.colors.length);
        }
        fluidRef.current.splat(x, y, radius, color);
        // record action
        actionsRef.current = actionsRef.current.slice(0, actionIndexRef.current);
        actionsRef.current.push({ type: 'splat', x, y, radius, color });
        actionIndexRef.current = actionsRef.current.length;
        if (!hasPaintedRef.current) {
          hasPaintedRef.current = true;
          onFirstPaint && onFirstPaint();
        }
    }
  }, [onFirstPaint]);
  
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
      isPointerDownRef.current = true;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      splat(x, y);
  }, [splat]);

  const handlePointerUp = useCallback(() => {
    isPointerDownRef.current = false;
    // commit final visual after a stroke
    commitSnapshot();
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isPointerDownRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      splat(x, y);
    }
  }, [splat]);

  useEffect(() => {
    // initial snapshot after setup
    const t = setTimeout(() => commitSnapshot(), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full"
      style={{
        position: 'absolute', left: 0, top: 0, width: '100%', height: '100%',
        cursor: cursorUrl ? `url(${cursorUrl}) 16 16, crosshair` : 'crosshair',
        display: 'block'
      }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerMove={handlePointerMove}
    />
  );
};