import React from 'react';
import { PageId } from '../types';

interface BottomNavProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentPage, onNavigate }) => {
  // Hide bottom nav on recipient-focused screens
  const isRecipientView = [
    'public-invitation',
    'invitation-accepted',
    'date-preferences',
    'preferences-submitted',
  ].includes(currentPage);

  if (isRecipientView) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/80 py-2 shadow-sm">
      <div className="max-w-md mx-auto px-4 flex items-center justify-around text-[11px] font-semibold text-stone-800/60">
        <button
          onClick={() => onNavigate('landing')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            currentPage === 'landing' ? 'text-rose-500' : 'hover:text-rose-500 text-stone-700'
          }`}
        >
          <span className="text-base">🏠</span>
          <span>خانه</span>
        </button>

        <button
          onClick={() => onNavigate('dashboard')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            currentPage === 'dashboard' ? 'text-rose-500' : 'hover:text-rose-500 text-stone-700'
          }`}
        >
          <span className="text-base">📊</span>
          <span>داشبورد</span>
        </button>

        <button
          onClick={() => onNavigate('create-invitation')}
          className="flex flex-col items-center gap-0.5 -mt-4 cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-full bg-rose-500 text-white flex items-center justify-center text-lg shadow-md shadow-rose-500/30 group-hover:bg-rose-600 group-hover:scale-105 transition-all">
            ❤️
          </div>
          <span className="text-stone-900 font-bold">دعوت</span>
        </button>

        <button
          onClick={() => onNavigate('invitations-list')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            currentPage === 'invitations-list' ? 'text-rose-500' : 'hover:text-rose-500 text-stone-700'
          }`}
        >
          <span className="text-base">💌</span>
          <span>دعوت‌ها</span>
        </button>

        <button
          onClick={() => onNavigate('settings')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            currentPage === 'settings' ? 'text-rose-500' : 'hover:text-rose-500 text-stone-700'
          }`}
        >
          <span className="text-base">⚙️</span>
          <span>تنظیمات</span>
        </button>
      </div>
    </nav>
  );
};
