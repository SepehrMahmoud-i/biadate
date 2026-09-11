import React from 'react';
import { PageId } from '../types';
import { Plus, Settings } from 'lucide-react';

interface HeaderProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  isLoggedIn: boolean;
  userName: string;
  userGender?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onNavigate,
  isLoggedIn,
  userName,
  userGender,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#faf8f5]/90 backdrop-blur-md border-b border-stone-200/60 transition-all">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo: biaDate */}
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-1.5 select-none group cursor-pointer"
        >
          <img src="/logo.svg" alt="biaDate" className="h-[80px] w-auto -my-4 group-hover:scale-105 transition-transform" />
        </button>

        {/* Header Actions - Top-left in RTL */}
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onNavigate('create-invitation')}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500 text-white hover:bg-rose-600 active:scale-95 transition-all flex items-center gap-1 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>دعوت جدید</span>
              </button>
              <button
                onClick={() => onNavigate('settings')}
                className="flex items-center gap-1.5 p-1 pr-2.5 pl-1 rounded-full bg-stone-100 hover:bg-rose-50 border border-stone-200 hover:border-rose-200 text-stone-700 hover:text-rose-600 transition-all cursor-pointer"
                title="تنظیمات حساب کاربری"
              >
                <Settings className="w-3.5 h-3.5 text-stone-500 group-hover:text-rose-500" />
                <div className="w-6 h-6 rounded-full bg-rose-500 text-white font-bold text-[11px] flex items-center justify-center">
                  {userGender === 'boy' ? '👦' : userGender === 'girl' ? '👧' : userName ? userName.charAt(0) : 'س'}
                </div>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onNavigate('settings')}
                className="w-8 h-8 rounded-xl bg-stone-100 text-stone-700 hover:bg-rose-50 hover:text-rose-600 font-bold text-xs flex items-center justify-center border border-stone-200 transition-colors cursor-pointer"
                title="تنظیمات"
              >
                <Settings className="w-4 h-4 text-stone-600" />
              </button>
              <button
                onClick={() => onNavigate('auth')}
                className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-rose-500 text-white shadow-sm hover:bg-rose-600 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>ورود / ثبت‌نام</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
