import React from 'react';

interface ColorHUDProps {
  colors: string[];
  activeIndex: number;
  setActiveIndex: (i: number) => void;
  openFullPanel: () => void;
}

export const ColorHUD: React.FC<ColorHUDProps> = ({ colors, activeIndex, setActiveIndex, openFullPanel }) => {
  return (
    <div style={{ position: 'fixed', left: 16, bottom: 16, zIndex: 3500 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', background: 'rgba(17,24,39,0.8)', border: '1px solid rgba(55,65,81,0.6)', borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
        {colors.map((c, i) => (
          <button key={i} onClick={() => setActiveIndex(i)} aria-label={`Select color ${i+1}`} style={{ width: 22, height: 22, borderRadius: '999px', border: `2px solid ${activeIndex===i?'#8b5cf6':'#374151'}`, boxShadow: activeIndex===i?'0 0 0 2px rgba(139,92,246,0.5)':'none', background: c }} />
        ))}
        <button onClick={openFullPanel} aria-label="More color controls" style={{ padding: '4px 8px', fontSize: 12, color: '#e5e7eb', background: '#374151', border: '1px solid rgba(55,65,81,0.8)', borderRadius: 8 }}>More</button>
      </div>
    </div>
  );
};