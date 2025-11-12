import { useState, useEffect, useCallback } from 'react';

export interface TiltData {
  alpha: number; // 0-360 degrees (compass heading)
  beta: number;  // -180 to 180 degrees (front-to-back tilt)
  gamma: number; // -90 to 90 degrees (left-to-right tilt)
}

export interface TiltControlsOptions {
  enabled: boolean;
  smoothing: number; // 0-1, how much to smooth the tilt data
  sensitivity: number; // 0-1, how sensitive to tilt changes
  invertX: boolean;
  invertY: boolean;
}

export function useTiltControls(options: TiltControlsOptions) {
  const [tiltData, setTiltData] = useState<TiltData>({ alpha: 0, beta: 0, gamma: 0 });
  const [smoothedTilt, setSmoothedTilt] = useState<TiltData>({ alpha: 0, beta: 0, gamma: 0 });
  const [isSupported, setIsSupported] = useState(false);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Check if DeviceOrientation is supported
  useEffect(() => {
    if (typeof DeviceOrientationEvent !== 'undefined') {
      setIsSupported(true);
    }
  }, []);
  
  // Request permission (required on iOS 13+)
  const requestPermission = useCallback(async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') {
          setIsPermissionGranted(true);
          setError(null);
          return true;
        } else {
          setError('Permission denied for device orientation');
          return false;
        }
      } catch (err) {
        setError('Failed to request device orientation permission');
        console.error(err);
        return false;
      }
    } else {
      // Permission not required (Android or older iOS)
      setIsPermissionGranted(true);
      return true;
    }
  }, []);
  
  // Smooth the tilt data
  useEffect(() => {
    if (!options.enabled) return;
    
    const smooth = (current: number, target: number, factor: number) => {
      return current * factor + target * (1 - factor);
    };
    
    const smoothingFactor = options.smoothing;
    
    setSmoothedTilt(prev => ({
      alpha: smooth(prev.alpha, tiltData.alpha, smoothingFactor),
      beta: smooth(prev.beta, tiltData.beta, smoothingFactor),
      gamma: smooth(prev.gamma, tiltData.gamma, smoothingFactor),
    }));
  }, [tiltData, options.enabled, options.smoothing]);
  
  // Listen to device orientation events
  useEffect(() => {
    if (!options.enabled || !isSupported || !isPermissionGranted) return;
    
    const handleOrientation = (event: DeviceOrientationEvent) => {
      const { alpha, beta, gamma } = event;
      
      if (alpha !== null && beta !== null && gamma !== null) {
        setTiltData({
          alpha,
          beta: options.invertY ? -beta : beta,
          gamma: options.invertX ? -gamma : gamma,
        });
      }
    };
    
    window.addEventListener('deviceorientation', handleOrientation);
    
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [options.enabled, isSupported, isPermissionGranted, options.invertX, options.invertY]);
  
  /**
   * Convert tilt to gravity angle (0-360 degrees)
   * Maps device tilt to a 2D gravity direction
   */
  const getGravityAngle = useCallback((): number => {
    const { beta, gamma } = smoothedTilt;
    
    // Calculate angle based on tilt
    // gamma: -90 (left) to 90 (right)
    // beta: -180 (back) to 180 (front)
    
    // Map to 0-360 degrees where:
    // 0° = top, 90° = right, 180° = bottom, 270° = left
    const angle = Math.atan2(gamma, beta) * (180 / Math.PI);
    
    // Normalize to 0-360
    return (angle + 360) % 360;
  }, [smoothedTilt]);
  
  /**
   * Get gravity strength based on how much the device is tilted
   * Returns 0-1 where 1 is maximum tilt
   */
  const getGravityStrength = useCallback((): number => {
    const { beta, gamma } = smoothedTilt;
    
    // Calculate tilt magnitude
    const magnitude = Math.sqrt(beta * beta + gamma * gamma);
    
    // Normalize to 0-1 (max tilt is ~180 degrees)
    const normalized = Math.min(magnitude / 180, 1);
    
    // Apply sensitivity
    return normalized * options.sensitivity;
  }, [smoothedTilt, options.sensitivity]);
  
  /**
   * Get normalized tilt values (-1 to 1 for both axes)
   */
  const getNormalizedTilt = useCallback((): { x: number; y: number } => {
    const { beta, gamma } = smoothedTilt;
    
    return {
      x: Math.max(-1, Math.min(1, gamma / 90)) * options.sensitivity,
      y: Math.max(-1, Math.min(1, beta / 90)) * options.sensitivity,
    };
  }, [smoothedTilt, options.sensitivity]);
  
  return {
    isSupported,
    isPermissionGranted,
    error,
    requestPermission,
    tiltData: smoothedTilt,
    getGravityAngle,
    getGravityStrength,
    getNormalizedTilt,
  };
}
