import React, { useEffect, useRef } from 'react';

interface ColorContextMenuProps {
  x: number;
  y: number;
  onColorSelect: (color: string) => void;
  onClose: () => void;
}

// Generate full rainbow spectrum with 64 colors
const generateRainbowPalette = (): string[] => {
  const colors: string[] = [];
  const hueSteps = 16; // 16 hues across spectrum
  const satLightSteps = 4; // 4 variations per hue (light to dark)
  
  for (let h = 0; h < hueSteps; h++) {
    const hue = (h / hueSteps) * 360;
    for (let sl = 0; sl < satLightSteps; sl++) {
      const lightness = 90 - (sl * 20); // 90%, 70%, 50%, 30%
      const saturation = 100;
      colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }
  }
  
  return colors;
};

const RAINBOW_COLORS = generateRainbowPalette();

export const ColorContextMenu: React.FC<ColorContextMenuProps> = ({
  x,
  y,
  onColorSelect,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Position menu, ensuring it stays on screen
  const menuStyle: React.CSSProperties = {
    position: 'fixed',
    left: Math.min(x, window.innerWidth - 340),
    top: Math.min(y, window.innerHeight - 380),
    zIndex: 9999,
  };

  return (
    <div
      ref={menuRef}
      style={menuStyle}
      className="bg-gray-900/95 backdrop-blur-lg border border-purple-500/50 rounded-lg p-3 shadow-2xl"
    >
      <div className="text-white text-sm font-semibold mb-2 px-1">
        Quick Color Picker
      </div>
      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: 'repeat(16, 18px)',
          width: '320px',
        }}
      >
        {RAINBOW_COLORS.map((color, idx) => (
          <button
            key={idx}
            onClick={() => {
              onColorSelect(color);
              onClose();
            }}
            className="w-[18px] h-[18px] rounded cursor-pointer border border-white/20 hover:border-white hover:scale-125 transition-transform"
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
      <div className="text-gray-400 text-xs mt-2 px-1">
        Right-click anywhere to pick color • ESC to close
      </div>
    </div>
  );
};
