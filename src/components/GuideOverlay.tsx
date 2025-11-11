import React from 'react';
import { CloseIcon } from './icons/CloseIcon';

export type GuideStepId = 'welcome' | 'simulation' | 'colors' | 'effects' | 'brush' | 'export' | 'done';

interface GuideOverlayProps {
  step: GuideStepId | null;
  onNext: () => void;
  onSkip: () => void;
  onClose: () => void;
  openPanel: (panel: 'simulation'|'colors'|'effects'|'brush') => void;
}

const StepTitle: Record<Exclude<GuideStepId,'done'|'welcome'>, string> = {
  simulation: 'Simulation Controls',
  colors: 'Colors & Palettes',
  effects: 'Visual Effects',
  brush: 'Brush Size',
  export: 'Export & Gallery' as any
} as any;

const StepBody: Partial<Record<GuideStepId, string>> = {
  welcome: 'Welcome! You paint by clicking and dragging. We will show you the tools in a few quick steps.',
  simulation: 'Tune movement: density, velocity, viscosity. Try sliding and see the motion change.',
  colors: 'Pick or AI-generate palettes. You can add/remove colors and set the active color.',
  effects: 'Tweak bloom, sunrays, and filmic touches like grain or chromatic aberration.',
  brush: 'Adjust splat size for bigger or finer strokes.',
  export: 'Save snapshots to your local gallery or record a short video to download.',
  done: 'You’re ready. Create something trippy!'
};

export const GuideOverlay: React.FC<GuideOverlayProps> = ({ step, onNext, onSkip, onClose, openPanel }) => {
  if (!step) return null;
  const isLast = step === 'done';

  const openIfPanel = () => {
    if (step === 'simulation' || step === 'colors' || step === 'effects' || step === 'brush') {
      openPanel(step);
    }
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 6000, pointerEvents: 'none' }}
      aria-hidden={false}
    >
      {/* scrim but non-blocking; panel itself accepts pointer events */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)' }} />

      <div
        role="dialog"
        aria-modal="false"
        style={{
          position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(17,24,39,0.92)', color: '#fff', border: '1px solid rgba(55,65,81,0.6)',
          borderRadius: 14, padding: 16, width: 'min(720px, 92vw)', boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
          pointerEvents: 'auto'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>
            {step === 'welcome' ? 'How it works' : step === 'done' ? 'All set' : StepTitle[step as Exclude<GuideStepId,'done'|'welcome'>]}
          </h3>
          <button aria-label="Close guide" onClick={onClose} style={{ background: 'transparent', color: '#d1d5db', border: 'none', padding: 6, borderRadius: 8 }}>
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
        <p style={{ marginTop: 8, marginBottom: 16, color: '#d1d5db', fontSize: 14 }}>{StepBody[step]}</p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          {step !== 'done' && (
            <button onClick={onSkip} style={{ padding: '8px 12px', background: '#374151', color: '#e5e7eb', border: '1px solid rgba(55,65,81,0.8)', borderRadius: 8 }}>Skip</button>
          )}
          {!isLast && (
            <button onClick={() => { openIfPanel(); onNext(); }} style={{ padding: '8px 12px', background: '#2563eb', color: '#fff', border: '1px solid #1d4ed8', borderRadius: 8 }}>Next</button>
          )}
          {isLast && (
            <button onClick={onClose} style={{ padding: '8px 12px', background: '#10b981', color: '#06281b', border: '1px solid #059669', borderRadius: 8, fontWeight: 700 }}>Start Creating</button>
          )}
        </div>
      </div>
    </div>
  );
};