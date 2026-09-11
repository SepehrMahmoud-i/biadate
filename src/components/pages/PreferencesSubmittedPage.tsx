import React from 'react';
import { PageId } from '../../types';

interface PreferencesSubmittedPageProps {
  onNavigate: (page: PageId) => void;
  onShowToast: (msg: string) => void;
  isPreview?: boolean;
  onExitPreview?: () => void;
}

export const PreferencesSubmittedPage: React.FC<PreferencesSubmittedPageProps> = ({
  onNavigate,
  onShowToast,
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
              <p className="font-black">پایان شبیه‌سازی پیش‌نمایش</p>
              <p className="text-[10px] text-amber-900/80 font-normal">در دعوت‌نامه واقعی تغییری ایجاد نشد</p>
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

      <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-500 flex items-center justify-center text-3xl mx-auto shadow-xs">
        💌
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-black text-stone-900">انتخاب‌هات ارسال شد ❤️</h1>
        <p className="text-xs text-stone-600 max-w-xs mx-auto leading-relaxed">
          حالا نوبت اونه که با توجه به انتخابت، قرار رو هماهنگ کنه.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-stone-200/70 shadow-sm space-y-4">
        <div className="p-3 bg-rose-50/60 rounded-2xl text-xs text-rose-700 font-medium">
          ✨ به‌زودی جزئیات نهایی قرار رو باهات چک می‌کنه!
        </div>

        <div className="pt-2">
          <p className="text-xs text-stone-500 mb-3">اگر خواستی، لینک biaDate رو برای دوستات هم بفرست:</p>
          <button
            onClick={() => onShowToast('لینک معرفی biaDate در کلیپ‌بورد کپی شد 💖')}
            className="w-full py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-900 font-semibold text-xs transition-colors cursor-pointer"
          >
            معرفی biaDate به دوستان 💖
          </button>
        </div>
      </div>

      <div>
        <button
          onClick={() => onNavigate('landing')}
          className="text-xs text-stone-600 hover:text-rose-500 transition-colors cursor-pointer"
        >
          بازگشت به صفحه اصلی
        </button>
      </div>
    </section>
  );
};
