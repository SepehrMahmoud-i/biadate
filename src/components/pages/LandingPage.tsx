import React from 'react';
import { PageId } from '../../types';

interface LandingPageProps {
  onNavigate: (page: PageId) => void;
  onShowToast: (msg: string) => void;
  onOpenLivePreview?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onShowToast,
  onOpenLivePreview,
}) => {
  return (
    <section className="space-y-10 py-4">
      {/* Hero Section */}
      <div className="text-center space-y-4 pt-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold animate-pulse-soft">
          <span>✨</span>
          <span>راهی نو و دلنشین برای دعوت به یک قرار عاشقانه</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-stone-900 leading-[1.35] tracking-tight">
          وقتشه یه نفر رو<br />
          <span className="text-rose-500">به قرار دعوت کنی.</span>
        </h1>

        <p className="text-sm sm:text-base text-stone-700 leading-relaxed max-w-xs mx-auto">
          یک دعوت‌نامه‌ی خاص بساز، لینک آن را برای کسی که دوستش داری بفرست و بگذار جوابش را خودش بدهد.
        </p>

        {/* Hero CTAs */}
        <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center items-center">
          <button
            onClick={() => onNavigate('create-invitation')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-base shadow-lg shadow-rose-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>ساخت دعوت‌نامه</span>
            <span>❤️</span>
          </button>
          <button
            onClick={() => onNavigate('how-it-works')}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white border border-stone-200 text-stone-800 font-medium text-sm hover:bg-stone-100 transition-colors cursor-pointer"
          >
            چطور کار می‌کند؟
          </button>
        </div>
      </div>

      {/* Hero Invitation Live Preview Card */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-rose-400 to-amber-300 rounded-3xl blur opacity-25 group-hover:opacity-40 transition"></div>
        <div className="relative bg-white rounded-3xl p-6 border border-rose-100 shadow-xl space-y-5 text-center">
          <div className="flex items-center justify-center text-xs text-stone-500 pb-2 border-b border-stone-100">
            <span className="inline-flex items-center gap-1">💌 پیش‌نمایش زنده</span>
          </div>

          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center text-2xl shadow-inner animate-heart">
            💌
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
              یک دعوت‌نامه برای تو
            </span>
            <h3 className="text-xl font-bold text-stone-900">سارا...</h3>
          </div>

          <p className="text-sm text-stone-700 leading-relaxed bg-[#faf8f5]/80 p-3 rounded-xl border border-stone-100">
            «یه سوال مهم ازت دارم.<br />حاضری با من یه قرار بریم؟ ❤️»
          </p>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => {
                if (onOpenLivePreview) {
                  onOpenLivePreview();
                } else {
                  onNavigate('public-invitation');
                }
              }}
              className="py-2.5 rounded-xl bg-rose-500 text-white font-bold text-xs shadow-sm hover:bg-rose-600 transition-all cursor-pointer"
            >
              آره، بریم! 😍
            </button>
            <button
              onClick={() => onShowToast('این دکمه فرار می‌کنه! توی صفحه اختصاصی امتحانش کن 😉')}
              className="py-2.5 rounded-xl bg-stone-100 text-stone-700 font-medium text-xs hover:bg-stone-200 transition-colors cursor-pointer"
            >
              نه 😐
            </button>
          </div>

          <div className="text-[11px] text-stone-500 pt-1">
            برای تجربه دریافت دعوت‌نامه روی گزینه‌ها کلیک کن
          </div>
        </div>
      </div>

      {/* 3 Steps Section */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/70 shadow-sm space-y-5">
        <div className="text-center space-y-1">
          <h2 className="text-lg font-bold text-stone-900">ساده در ۳ گام</h2>
          <p className="text-xs text-stone-500">بدون ثبت‌نام پیچیده و در کمتر از ۳۰ ثانیه</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 font-black text-sm flex items-center justify-center shrink-0">
              ۱
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900">دعوت‌نامه بساز</h4>
              <p className="text-xs text-stone-600 mt-0.5">اسم طرف مقابل و پیام دلخواهت رو انتخاب کن.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 font-black text-sm flex items-center justify-center shrink-0">
              ۲
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900">لینک را بفرست</h4>
              <p className="text-xs text-stone-600 mt-0.5">لینک یکتای ساخته شده رو در پیام‌رسان دلخواه براش بفرست.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 font-black text-sm flex items-center justify-center shrink-0">
              ۳
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900">قرار را برنامه‌ریزی کنید</h4>
              <p className="text-xs text-stone-600 mt-0.5">جوابش رو همراه با ترجیحات کافه و ساعت دریافت کن.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="space-y-3">
        <div className="text-center">
          <h3 className="text-base font-bold text-stone-900">چرا biaDate؟</h3>
        </div>
        <div className="grid grid-cols-1 gap-2.5">
          <div className="bg-white/90 p-4 rounded-2xl border border-stone-200/70 flex items-center gap-3 shadow-xs">
            <span className="text-2xl">🌹</span>
            <div>
              <h5 className="text-sm font-bold text-stone-900">دعوتی که فراموش نمی‌شود</h5>
              <p className="text-xs text-stone-600">یک تجربه جذاب و تعاملی به جای یک پیام متنی ساده</p>
            </div>
          </div>
          <div className="bg-white/90 p-4 rounded-2xl border border-stone-200/70 flex items-center gap-3 shadow-xs">
            <span className="text-2xl">⚡</span>
            <div>
              <h5 className="text-sm font-bold text-stone-900">ساده و سریع</h5>
              <p className="text-xs text-stone-600">طراحی شده برای ساخت لینک در کمتر از یک دقیقه</p>
            </div>
          </div>
          <div className="bg-white/90 p-4 rounded-2xl border border-stone-200/70 flex items-center gap-3 shadow-xs">
            <span className="text-2xl">✨</span>
            <div>
              <h5 className="text-sm font-bold text-stone-900">مخصوص خودتان</h5>
              <p className="text-xs text-stone-600">شخصی‌سازی شده با نام و متن مورد علاقه شما</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Banner CTA */}
      <div className="bg-gradient-to-b from-rose-500 to-rose-600 text-white rounded-3xl p-6 text-center space-y-4 shadow-lg shadow-rose-500/20">
        <h3 className="text-xl font-black">خب... آماده‌ای دعوتش کنی؟ ❤️</h3>
        <p className="text-xs text-rose-100">اولین دعوت‌نامه‌ات رایگان و آماده ارساله.</p>
        <button
          onClick={() => onNavigate('create-invitation')}
          className="w-full py-3 rounded-2xl bg-white text-rose-600 font-bold text-sm shadow-md hover:bg-rose-50 active:scale-98 transition-all cursor-pointer"
        >
          ساخت دعوت‌نامه
        </button>
      </div>

      {/* Footer */}
      <footer className="pt-8 pb-4 text-center flex flex-col items-center space-y-5 border-t border-stone-200">
        <div className="flex justify-center">
          <img src="/logo.svg" alt="biaDate" className="h-[128px] w-auto mb-1" />
        </div>
        <div className="flex flex-wrap justify-center gap-4 text-xs text-stone-600">
          <button onClick={() => onNavigate('how-it-works')} className="hover:text-rose-500 transition-colors cursor-pointer">
            درباره ما
          </button>
          <button onClick={() => onNavigate('faq')} className="hover:text-rose-500 transition-colors cursor-pointer">
            سوالات متداول
          </button>
          <button onClick={() => onNavigate('settings')} className="hover:text-rose-500 transition-colors cursor-pointer">
            قوانین و حریم خصوصی
          </button>
          <button onClick={() => onShowToast('پشتیبانی: support@biadate.ir')} className="hover:text-rose-500 transition-colors cursor-pointer">
            تماس با ما
          </button>
        </div>
        <p className="text-[11px] text-stone-400">تمامی حقوق برای biaDate محفوظ است © ۱۴۰۵</p>
      </footer>
    </section>
  );
};
