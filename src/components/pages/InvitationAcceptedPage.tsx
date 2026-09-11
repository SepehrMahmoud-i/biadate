import React from 'react';
import { PageId } from '../../types';

interface InvitationAcceptedPageProps {
  onNavigate: (page: PageId) => void;
  isPreview?: boolean;
  onExitPreview?: () => void;
}

export const InvitationAcceptedPage: React.FC<InvitationAcceptedPageProps> = ({
  onNavigate,
  isPreview,
  onExitPreview,
}) => {
  return (
    <section className="space-y-6 py-6 text-center max-w-sm mx-auto">
      {isPreview && (
        <div className="w-full bg-amber-500/15 border border-amber-300 text-amber-950 px-4 py-2.5 rounded-2xl flex items-center justify-between text-xs font-bold shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-base">✨</span>
            <div className="text-right">
              <p className="font-black">این یک پیش‌نمایش است</p>
              <p className="text-[10px] text-amber-900/80 font-normal">شبیه‌سازی پذیرش دعوت</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (onExitPreview) onExitPreview();
              onNavigate('dashboard');
            }}
            className="px-2.5 py-1 rounded-xl bg-white hover:bg-amber-100 text-stone-800 text-[11px] font-bold border border-amber-200 transition-colors cursor-pointer shrink-0"
          >
            خروج از پیش‌نمایش
          </button>
        </div>
      )}

      <div className="w-20 h-20 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center text-4xl mx-auto shadow-inner animate-bounce">
        🎉
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-black text-rose-600">Yesss! ❤️</h1>
        <h2 className="text-lg font-bold text-stone-900">پس قرار شد!</h2>
        <p className="text-xs text-stone-600 max-w-xs mx-auto leading-relaxed">
          حالا بگو دوست داری قرارتون چطوری باشه تا به بهترین شکل هماهنگ بشه.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-stone-200/70 shadow-sm space-y-4">
        <div className="text-xs text-stone-600 leading-relaxed">
          فقط ۴ تا سوال سریع درباره مکان و زمان مورد علاقه‌ات
        </div>

        <button
          onClick={() => onNavigate('date-preferences')}
          className="w-full py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm shadow-md shadow-rose-500/20 active:scale-98 transition-all cursor-pointer"
        >
          انتخاب‌های من ✨
        </button>
      </div>
    </section>
  );
};
