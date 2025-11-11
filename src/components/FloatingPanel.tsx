import React, { useRef, useState, useEffect } from 'react';
import { CloseIcon } from './icons/CloseIcon';

interface FloatingPanelProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  initial: { x: number; y: number };
  onDragEnd?: (pos: { x: number; y: number }) => void;
}

export const FloatingPanel: React.FC<FloatingPanelProps> = ({ title, children, onClose, initial, onDragEnd }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(initial);
  const dragState = useRef<{ dragging: boolean; sx: number; sy: number; px: number; py: number } | null>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const d = dragState.current; if (!d || !d.dragging) return;
      const dx = e.clientX - d.sx;
      const dy = e.clientY - d.sy;
      setPos({ x: Math.max(8, d.px + dx), y: Math.max(60, d.py + dy) });
    };
    const onUp = () => {
      const d = dragState.current; if (!d) return; d.dragging = false;
      onDragEnd && onDragEnd({ x: pos.x, y: pos.y });
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [pos, onDragEnd]);

  const startDrag = (e: React.MouseEvent) => {
    dragState.current = { dragging: true, sx: e.clientX, sy: e.clientY, px: pos.x, py: pos.y };
  };

  return (
    <div
      ref={panelRef}
      style={{ position: 'fixed', left: pos.x, top: pos.y, zIndex: 4500, width: 'min(22rem, 92vw)' }}
      className="pointer-events-auto"
      role="dialog"
      aria-modal="false"
    >
      <div
        onMouseDown={startDrag}
        style={{ cursor: 'move' }}
        className="flex items-center justify-between gap-2 px-3 py-2 bg-gray-900/90 text-white border border-gray-700/60 rounded-t-xl backdrop-blur"
      >
        <h3 className="text-sm font-bold" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}>{title}</h3>
        <button onClick={onClose} aria-label="Close" className="p-1 text-gray-300 hover:text-white"><CloseIcon className="w-4 h-4"/></button>
      </div>
      <div className="bg-gray-900/80 border-x border-b border-gray-700/60 rounded-b-xl p-3" style={{ color: '#e5e7eb', textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}>
        {children}
      </div>
    </div>
  );
};