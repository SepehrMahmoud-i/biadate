import React from 'react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-stone-900/90 backdrop-blur-md text-white px-5 py-3 rounded-2xl text-xs font-semibold shadow-xl border border-white/10 transition-all duration-300 animate-fade-in flex items-center gap-2">
      <span>✨</span>
      <span>{message}</span>
    </div>
  );
};
