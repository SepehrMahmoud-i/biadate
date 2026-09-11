import React from 'react';
import { ChevronDown } from 'lucide-react';

export const FaqPage: React.FC = () => {
  const faqs = [
    {
      q: 'biaDate چیه؟',
      a: 'biaDate یک پلتفرم نوآورانه برای ساخت و ارسال دعوت‌نامه‌های شخصی‌سازی شده به قرار ملاقات و دیت است تا دعوت کردن را به تجربه‌ای شیرین و خاطره‌انگیز تبدیل کند.',
    },
    {
      q: 'آیا ساخت دعوت‌نامه رایگانه؟',
      a: 'بله، ساخت و اشتراک‌گذاری دعوت‌نامه‌ها در biaDate کاملاً رایگان است.',
    },
    {
      q: 'آیا طرف مقابل برای پاسخ دادن نیاز به حساب کاربری داره؟',
      a: 'خیر! دریافت‌کننده فقط کافی است روی لینکی که برایش فرستاده‌اید کلیک کند و بدون نیاز به ورود یا ثبت‌نام پاسخ دهد.',
    },
    {
      q: 'آیا می‌تونم دعوت‌نامه رو شخصی‌سازی کنم؟',
      a: 'بله، شما می‌توانید نام شخص، متن پیام و حتی جزئیات پیشنهادی را دقیقاً مطابق سلیقه خود تنظیم کنید.',
    },
    {
      q: 'اگر دعوت‌نامه رد بشه چی میشه؟',
      a: 'هیچ اتفاق بدی نمی‌افتد! فضا کاملاً صمیمانه و با احترام طراحی شده و احترام به نظر طرف مقابل اصل اول است.',
    },
    {
      q: 'اطلاعات من و طرف مقابلم امن می‌مونه؟',
      a: 'اطلاعات شما با استانداردهای امنیتی رمزنگاری محافظت می‌شود و به هیچ عنوان در اختیار اشخاص ثالث قرار نمی‌گیرد.',
    },
  ];

  return (
    <section className="space-y-5 py-4">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-black text-stone-900">سوالات متداول</h1>
        <p className="text-xs text-stone-600">
          پاسخ به پرتکرارترین پرسش‌های شما درباره biaDate
        </p>
      </div>

      <div className="space-y-2.5">
        {faqs.map((faq, idx) => (
          <details
            key={idx}
            className="group bg-white rounded-2xl border border-stone-200/80 p-4 open:border-rose-300 transition-all"
          >
            <summary className="flex justify-between items-center font-bold text-xs text-stone-900 cursor-pointer select-none">
              <span>{faq.q}</span>
              <ChevronDown className="w-4 h-4 text-stone-400 group-open:rotate-180 transition-transform" />
            </summary>
            <p className="text-xs text-stone-700 mt-3 leading-relaxed border-t border-stone-100 pt-2">
              {faq.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
};
