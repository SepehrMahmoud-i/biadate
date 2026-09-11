import React from 'react';
import { PageId } from '../../types';

interface HowItWorksPageProps {
  onNavigate: (page: PageId) => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ onNavigate }) => {
  return (
    <section className="space-y-6 py-4">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-black text-stone-900">biaDate چطور کار می‌کنه؟</h1>
        <p className="text-xs text-stone-600">
          تجربه‌ای مدرن، ساده و بدون دردسر برای قرار گذاشتن
        </p>
      </div>

      <div className="space-y-3">
        <div className="bg-white p-5 rounded-3xl border border-stone-200/70 shadow-xs flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 font-black text-sm flex items-center justify-center shrink-0">
            ۱
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-900">دعوت‌نامه بساز</h3>
            <p className="text-xs text-stone-600 leading-relaxed mt-1">
              اسم کسی که دوستش داری رو بنویس و از قالب‌های اختصاصی biaDate یا متن دلخواهت استفاده کن.
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200/70 shadow-xs flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 font-black text-sm flex items-center justify-center shrink-0">
            ۲
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-900">لینکش رو بفرست</h3>
            <p className="text-xs text-stone-600 leading-relaxed mt-1">
              لینک اختصاصی ساخته شده را در تلگرام، واتس‌اپ یا پیامک برایش ارسال کن.
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200/70 shadow-xs flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 font-black text-sm flex items-center justify-center shrink-0">
            ۳
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-900">جوابش رو بگیر</h3>
            <p className="text-xs text-stone-600 leading-relaxed mt-1">
              طرف مقابل با یک صفحه تعاملی و پر انرژی روبرو میشه و بعد از تایید، سلیقه و زمان دلخواهش رو اعلام می‌کنه.
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200/70 shadow-xs flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 font-black text-sm flex items-center justify-center shrink-0">
            ۴
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-900">قرارتون رو هماهنگ کنید</h3>
            <p className="text-xs text-stone-600 leading-relaxed mt-1">
              پاسخ‌ها و زمان‌بندی در پنل اختصاصی تو نمایش داده میشه تا با خیال راحت به قرار بروید.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center pt-2">
        <button
          onClick={() => onNavigate('create-invitation')}
          className="px-6 py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md shadow-rose-500/20 cursor-pointer active:scale-95 transition-all"
        >
          امتحانش کن ❤️
        </button>
      </div>
    </section>
  );
};
