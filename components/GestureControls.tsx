import React, { useEffect, useRef } from 'react';
import type { LiquidConfig } from '../types';

interface GestureControlsProps {
  config: LiquidConfig;
  updateConfig: (newConfig: Partial<LiquidConfig>) => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

interface Touch {
  id: number;
  x: number;
  y: number;
}

export const GestureControls: React.FC<GestureControlsProps> = ({ config, updateConfig, containerRef }) => {
  const touchesRef = useRef<Map<number, Touch>>(new Map());
  const initialAngleRef = useRef<number>(0);
  const initialDistanceRef = useRef<number>(0);
  const gestureActiveRef = useRef<boolean>(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const getTouch = (touch: globalThis.Touch): Touch => ({
      id: touch.identifier,
      x: touch.clientX,
      y: touch.clientY,
    });

    const getTwoFingerAngle = (t1: Touch, t2: Touch): number => {
      const dx = t2.x - t1.x;
      const dy = t2.y - t1.y;
      return Math.atan2(dy, dx) * (180 / Math.PI);
    };

    const getTwoFingerDistance = (t1: Touch, t2: Touch): number => {
      const dx = t2.x - t1.x;
      const dy = t2.y - t1.y;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        // Prevent default to avoid conflicts
        e.preventDefault();
        
        const t1 = getTouch(e.touches[0]);
        const t2 = getTouch(e.touches[1]);
        touchesRef.current.set(t1.id, t1);
        touchesRef.current.set(t2.id, t2);

        initialAngleRef.current = getTwoFingerAngle(t1, t2);
        initialDistanceRef.current = getTwoFingerDistance(t1, t2);
        gestureActiveRef.current = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && gestureActiveRef.current) {
        e.preventDefault();

        const t1 = getTouch(e.touches[0]);
        const t2 = getTouch(e.touches[1]);

        const currentAngle = getTwoFingerAngle(t1, t2);
        const currentDistance = getTwoFingerDistance(t1, t2);

        // Two-finger rotation -> Light Angle
        const angleDelta = currentAngle - initialAngleRef.current;
        if (Math.abs(angleDelta) > 5) {
          const newLightAngle = Math.max(0, Math.min(90, (config.lightAngleDeg ?? 45) + angleDelta * 0.5));
          updateConfig({ lightAngleDeg: Math.round(newLightAngle) });
          initialAngleRef.current = currentAngle;
        }

        // Pinch/spread -> Gravity Angle (more dramatic effect)
        const distanceDelta = currentDistance - initialDistanceRef.current;
        if (Math.abs(distanceDelta) > 10) {
          const currentGravity = config.gravityAngleDeg ?? 90;
          // Pinch in (distance decreases) -> decrease angle
          // Spread out -> increase angle
          const newGravityAngle = (currentGravity + distanceDelta * 0.3) % 360;
          updateConfig({ gravityAngleDeg: Math.round(newGravityAngle) });
          initialDistanceRef.current = currentDistance;
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        touchesRef.current.clear();
        gestureActiveRef.current = false;
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);
    container.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [config, updateConfig, containerRef]);

  return null; // This is a controller component with no UI
};
