import React, { useEffect, useRef } from 'react';
import { CloseIcon } from '../../components/icons/CloseIcon';
import { prefersReducedMotion } from '../prefs';

interface TopPanelProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export const TopPanel: React.FC<TopPanelProps> = ({ isOpen, onClose, children, title }) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Simple focus trap when open
  useEffect(() => {
    if (!isOpen || !panelRef.current) return;
    const root = panelRef.current;
    const q = root.querySelectorAll<HTMLElement>(
      'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    const focusables = Array.from(q).filter(el => !el.hasAttribute('disabled'));
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    first?.focus();

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || focusables.length === 0) return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          (last || first).focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          (first || last).focus();
        }
      }
    };
    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  // Read reduced motion with user override
  const prefersReduced = prefersReducedMotion();

  return (
    <div
      className={`fixed top-12 left-2 md:top-16 md:left-4 z-30 w-[min(96vw,880px)] md:w-[min(92vw,880px)] ${prefersReduced ? '' : 'transition-transform duration-300 ease-in-out'} ${isOpen ? 'translate-y-0 opacity-100' : '-translate-y-6 opacity-0 pointer-events-none'}`}
      role="dialog"
      aria-modal="true"
      aria-hidden={!isOpen}
      data-top-panel
    >
      <div
        ref={panelRef}
        className="bg-gray-900/80 backdrop-blur-md border border-gray-700/60 rounded-xl p-2 md:p-4 shadow-2xl"
      >
        <div className="flex justify-between items-center mb-2 md:mb-3">
          {title && <h2 className="text-sm font-semibold text-white">{title}</h2>}
          <button
            onClick={onClose}
            className="p-1 text-gray-400 rounded-full hover:bg-gray-700 hover:text-white"
            aria-label="Close panel"
          >
            <CloseIcon className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto pr-1">
          {children}
        </div>
      </div>
    </div>
  );
};
