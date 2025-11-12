import { useEffect, useRef, useState } from 'react';

interface ShakeToClearProps {
  onShake: () => void;
  threshold?: number;
}

export const ShakeToClear: React.FC<ShakeToClearProps> = ({ 
  onShake, 
  threshold = 15 // Sensitivity threshold
}) => {
  const [isShaking, setIsShaking] = useState(false);
  const lastShakeTime = useRef<number>(0);
  const lastX = useRef<number>(0);
  const lastY = useRef<number>(0);
  const lastZ = useRef<number>(0);

  useEffect(() => {
    // Check if DeviceMotion is supported
    if (typeof DeviceMotionEvent === 'undefined') {
      console.log('[ShakeToClear] DeviceMotion not supported');
      return;
    }

    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc || acc.x === null || acc.y === null || acc.z === null) return;

      const current = Date.now();
      
      // Throttle: only check every 100ms
      if (current - lastShakeTime.current < 100) return;

      // Calculate acceleration delta
      const deltaX = Math.abs(acc.x - lastX.current);
      const deltaY = Math.abs(acc.y - lastY.current);
      const deltaZ = Math.abs(acc.z - lastZ.current);

      // Check if shake threshold exceeded
      if (deltaX > threshold || deltaY > threshold || deltaZ > threshold) {
        // Prevent multiple triggers within 1 second
        if (current - lastShakeTime.current > 1000) {
          console.log('[ShakeToClear] Shake detected!');
          setIsShaking(true);
          onShake();
          lastShakeTime.current = current;
          
          // Reset visual indicator
          setTimeout(() => setIsShaking(false), 500);
        }
      }

      // Store current values
      lastX.current = acc.x;
      lastY.current = acc.y;
      lastZ.current = acc.z;
    };

    // Request permission on iOS 13+
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      (DeviceMotionEvent as any).requestPermission()
        .then((response: string) => {
          if (response === 'granted') {
            window.addEventListener('devicemotion', handleMotion);
          }
        })
        .catch(console.error);
    } else {
      // Non-iOS or older iOS
      window.addEventListener('devicemotion', handleMotion);
    }

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [onShake, threshold]);

  // Visual feedback when shaking
  return isShaking ? (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 animate-bounce">
        <p className="text-white font-bold text-lg">Canvas Cleared! 🎨</p>
      </div>
    </div>
  ) : null;
};
