/**
 * Audio Reactivity Service
 * 
 * Provides real-time audio analysis using Web Audio API
 * Maps frequency bands to visual parameters
 */

export interface AudioReactiveParams {
  enabled: boolean;
  sensitivity: number; // 0-1
  smoothing: number; // 0-1
  frequencyRange: 'bass' | 'mid' | 'treble' | 'full';
  
  // What to modulate
  modulateColors: boolean;
  modulateVelocity: boolean;
  modulateSize: boolean;
  modulateParticleCount: boolean;
  modulateGravity: boolean;
  
  // Modulation amounts (0-1)
  colorAmount: number;
  velocityAmount: number;
  sizeAmount: number;
  particleAmount: number;
  gravityAmount: number;
}

export const DEFAULT_AUDIO_PARAMS: AudioReactiveParams = {
  enabled: false,
  sensitivity: 0.7,
  smoothing: 0.8,
  frequencyRange: 'full',
  modulateColors: true,
  modulateVelocity: true,
  modulateSize: true,
  modulateParticleCount: false,
  modulateGravity: false,
  colorAmount: 0.5,
  velocityAmount: 0.6,
  sizeAmount: 0.4,
  particleAmount: 0.3,
  gravityAmount: 0.2,
};

export interface AudioAnalysisData {
  bass: number; // 0-1
  mid: number; // 0-1
  treble: number; // 0-1
  overall: number; // 0-1
  waveform: number[]; // normalized waveform data
  spectrum: number[]; // normalized frequency spectrum
}

export class AudioReactivityService {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private audioSource: MediaElementAudioSourceNode | null = null;
  
  private dataArray: Uint8Array | null = null;
  private waveformArray: Uint8Array | null = null;
  
  private params: AudioReactiveParams = DEFAULT_AUDIO_PARAMS;
  private smoothedData: AudioAnalysisData = {
    bass: 0,
    mid: 0,
    treble: 0,
    overall: 0,
    waveform: [],
    spectrum: [],
  };
  
  private animationFrameId: number | null = null;
  private isInitialized = false;
  
  constructor() {}
  
  /**
   * Initialize audio context and request microphone access
   */
  async initializeMicrophone(): Promise<void> {
    if (this.isInitialized && this.microphone) return;
    
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        } 
      });
      
      this.setupAnalyser();
      this.microphone = this.audioContext!.createMediaStreamSource(stream);
      this.microphone.connect(this.analyser!);
      
      this.isInitialized = true;
      this.startAnalysis();
    } catch (error) {
      console.error('Failed to initialize microphone:', error);
      throw new Error('Microphone access denied or not available');
    }
  }
  
  /**
   * Initialize with audio element (for music playback)
   */
  initializeAudioElement(audioElement: HTMLAudioElement): void {
    if (this.audioSource) return;
    
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.audioElement = audioElement;
    
    this.setupAnalyser();
    this.audioSource = this.audioContext!.createMediaElementSource(audioElement);
    this.audioSource.connect(this.analyser!);
    this.analyser!.connect(this.audioContext!.destination); // Connect to speakers
    
    this.isInitialized = true;
    this.startAnalysis();
  }
  
  private setupAnalyser(): void {
    this.analyser = this.audioContext!.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.8;
    
    const bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(bufferLength);
    this.waveformArray = new Uint8Array(bufferLength);
  }
  
  /**
   * Start continuous audio analysis
   */
  private startAnalysis(): void {
    if (this.animationFrameId !== null) return;
    
    const analyze = () => {
      if (!this.analyser || !this.dataArray || !this.waveformArray) return;
      
      // Get frequency data
      this.analyser.getByteFrequencyData(this.dataArray);
      // Get waveform data
      this.analyser.getByteTimeDomainData(this.waveformArray);
      
      // Calculate frequency band averages
      const bass = this.getFrequencyAverage(0, 100);
      const mid = this.getFrequencyAverage(100, 500);
      const treble = this.getFrequencyAverage(500, 1000);
      const overall = this.getFrequencyAverage(0, 1000);
      
      // Apply smoothing
      const smoothing = this.params.smoothing;
      this.smoothedData.bass = this.smooth(this.smoothedData.bass, bass, smoothing);
      this.smoothedData.mid = this.smooth(this.smoothedData.mid, mid, smoothing);
      this.smoothedData.treble = this.smooth(this.smoothedData.treble, treble, smoothing);
      this.smoothedData.overall = this.smooth(this.smoothedData.overall, overall, smoothing);
      
      // Normalize arrays
      this.smoothedData.spectrum = Array.from(this.dataArray).map(v => v / 255);
      this.smoothedData.waveform = Array.from(this.waveformArray).map(v => (v - 128) / 128);
      
      this.animationFrameId = requestAnimationFrame(analyze);
    };
    
    analyze();
  }
  
  /**
   * Calculate average frequency magnitude for a frequency range
   */
  private getFrequencyAverage(startFreq: number, endFreq: number): number {
    if (!this.analyser || !this.dataArray) return 0;
    
    const nyquist = this.audioContext!.sampleRate / 2;
    const startBin = Math.floor(startFreq / nyquist * this.dataArray.length);
    const endBin = Math.floor(endFreq / nyquist * this.dataArray.length);
    
    let sum = 0;
    let count = 0;
    
    for (let i = startBin; i < endBin && i < this.dataArray.length; i++) {
      sum += this.dataArray[i];
      count++;
    }
    
    return count > 0 ? (sum / count / 255) * this.params.sensitivity : 0;
  }
  
  /**
   * Simple exponential smoothing
   */
  private smooth(current: number, target: number, smoothing: number): number {
    return current * smoothing + target * (1 - smoothing);
  }
  
  /**
   * Get current audio analysis data
   */
  getAudioData(): AudioAnalysisData {
    return { ...this.smoothedData };
  }
  
  /**
   * Get the primary frequency value based on selected range
   */
  getPrimaryValue(): number {
    switch (this.params.frequencyRange) {
      case 'bass': return this.smoothedData.bass;
      case 'mid': return this.smoothedData.mid;
      case 'treble': return this.smoothedData.treble;
      case 'full': return this.smoothedData.overall;
      default: return this.smoothedData.overall;
    }
  }
  
  /**
   * Update parameters
   */
  updateParams(newParams: Partial<AudioReactiveParams>): void {
    this.params = { ...this.params, ...newParams };
    
    if (this.analyser) {
      this.analyser.smoothingTimeConstant = this.params.smoothing;
    }
  }
  
  /**
   * Get current parameters
   */
  getParams(): AudioReactiveParams {
    return { ...this.params };
  }
  
  /**
   * Resume audio context (required after user interaction)
   */
  async resume(): Promise<void> {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }
  
  /**
   * Pause analysis
   */
  pause(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
  
  /**
   * Resume analysis
   */
  play(): void {
    if (this.isInitialized && this.animationFrameId === null) {
      this.startAnalysis();
    }
  }
  
  /**
   * Clean up resources
   */
  destroy(): void {
    this.pause();
    
    if (this.microphone) {
      const stream = (this.microphone.mediaStream as MediaStream);
      stream.getTracks().forEach(track => track.stop());
      this.microphone.disconnect();
      this.microphone = null;
    }
    
    if (this.audioSource) {
      this.audioSource.disconnect();
      this.audioSource = null;
    }
    
    if (this.analyser) {
      this.analyser.disconnect();
      this.analyser = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.isInitialized = false;
  }
}

// Singleton instance
let audioService: AudioReactivityService | null = null;

export function getAudioService(): AudioReactivityService {
  if (!audioService) {
    audioService = new AudioReactivityService();
  }
  return audioService;
}
