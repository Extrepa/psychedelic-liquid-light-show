
import React, { useEffect, useState } from 'react';

interface ToastProps {
  toast: { message: string, id: number, type: 'success' | 'error' } | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (toast) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        // Allow fade-out animation before calling onClose
        setTimeout(onClose, 300);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  const toastStyles = {
    success: 'bg-green-600/90',
    error: 'bg-red-600/90',
  };

  return (
    <div
      className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'}`}
      role="status"
      aria-live="polite"
    >
      <div className={`${toastStyles[toast.type]} backdrop-blur-sm text-white font-semibold px-6 py-3 rounded-full shadow-lg`}>
        {toast.message}
      </div>
    </div>
  );
};