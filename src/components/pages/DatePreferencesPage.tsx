import React, { useState } from 'react';
import { PageId, DatePreferences } from '../../types';

interface DatePreferencesPageProps {
  onNavigate: (page: PageId) => void;
  onSubmitPreferences: (prefs: DatePreferences) => void;
  isPreview?: boolean;
  onExitPreview?: () => void;
}

export const DatePreferencesPage: React.FC<DatePreferencesPageProps> = ({
  onNavigate,
  onSubmitPreferences,
  isPreview,
  onExitPreview,
}) => {
  const [step, setStep] = useState(1);
  const [activities, setActivities] = useState<string[]>(['☕ کافه', '🎬 سینما']);
  const [days, setDays] = useState<string[]>(['پنجشنبه', 'جمعه (آخر هفته)']);
  const [timeSlot, setTimeSlot] = useState('غروب و شب (۱۸:۰۰ تا ۲۲:۰۰)');
  const [notes, setNotes] = useState('جای دنج دوست دارم.');

  const toggleActivity = (act: string) => {
    setActivities((prev) =>
      prev.includes(act) ? prev.filter((a) => a !== act) : [...prev, act]
    );
  };

  const toggleDay = (day: string) => {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      onSubmitPreferences({
        activities,
        days,
        timeSlot,
        notes,
      });
      onNavigate('preferences-submitted');
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const titles = ['نوع قرار', 'روزهای مناسب', 'ساعت قرار', 'یادداشت دلخواه'];
  const persianStepDigits = ['۱', '۲', '۳', '۴'];

  return (
    <section className="space-y-5 py-4 max-w-sm mx-auto">
      {isPreview && (
        <div className="w-full bg-amber-500/15 border border-amber-300 text-amber-950 px-4 py-2.5 rounded-2xl flex items-center justify-between text-xs font-bold shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-base">✨</span>
            <div className="text-right">
              <p className="font-black">این یک پیش‌نمایش است</p>
              <p className="text-[10px] text-amber-900/80 font-normal">تغییرات در دعوت‌نامه واقعی ذخیره نمی‌شود</p>
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

      {/* Progress Bar Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-rose-600">مرحله {persianStepDigits[step - 1]} از ۴</span>
          <span className="text-stone-500">{titles[step - 1]}</span>
        </div>
        <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-rose-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${step * 25}%` }}
          />
        </div>
      </div>

      {/* Step Container */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200/70 shadow-sm">
        {/* STEP 1: Activities */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-stone-900">برای قرار چه چیزی دوست داری؟</h2>
              <p className="text-xs text-stone-500">می‌تونی چند گزینه رو انتخاب کنی.</p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { label: '☕ کافه', val: '☕ کافه' },
                { label: '🍽️ شام', val: '🍽️ شام' },
                { label: '🎬 سینما', val: '🎬 سینما' },
                { label: '🌳 پارک', val: '🌳 پارک' },
                { label: '🎮 بازی', val: '🎮 بازی' },
                { label: '✨ سورپرایز', val: '✨ سورپرایز' },
              ].map((item) => {
                const checked = activities.includes(item.val);
                return (
                  <label
                    key={item.val}
                    onClick={() => toggleActivity(item.val)}
                    className={`p-3.5 rounded-2xl border flex items-center gap-2.5 cursor-pointer transition-colors ${
                      checked
                        ? 'border-rose-500 bg-rose-50/50 text-rose-700'
                        : 'border-stone-200 hover:border-rose-300 text-stone-800'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {}}
                      className="text-rose-500 rounded focus:ring-rose-400"
                    />
                    <span className="text-sm font-semibold">{item.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: Days */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-stone-900">چه روزهایی برات راحت‌تره؟</h2>
              <p className="text-xs text-stone-500">روزهایی که وقتت خالی‌تره رو علامت بزن.</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                'شنبه',
                'یکشنبه',
                'دوشنبه',
                'سه‌شنبه',
                'چهارشنبه',
                'پنجشنبه',
                'جمعه (آخر هفته)',
              ].map((day, idx) => {
                const checked = days.includes(day);
                const isFullWidth = idx === 6;
                return (
                  <label
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-semibold cursor-pointer transition-colors ${
                      isFullWidth ? 'col-span-2' : ''
                    } ${
                      checked
                        ? 'border-rose-500 bg-rose-50 text-rose-700'
                        : 'border-stone-200 hover:border-rose-300 text-stone-800'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {}}
                      className="rounded text-rose-500 focus:ring-rose-400"
                    />
                    <span>{day}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: Time slot */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-stone-900">چه ساعتی رو ترجیح می‌دی؟</h2>
              <p className="text-xs text-stone-500">بازه زمانی مناسب برای قرارتان</p>
            </div>

            <div className="space-y-2.5">
              {[
                'صبح (۰۸:۰۰ تا ۱۲:۰۰)',
                'ظهر (۱۲:۰۰ تا ۱۵:۰۰)',
                'عصر (۱۶:۰۰ تا ۱۸:۰۰)',
                'غروب و شب (۱۸:۰۰ تا ۲۲:۰۰)',
              ].map((slot) => {
                const selected = timeSlot === slot;
                return (
                  <label
                    key={slot}
                    onClick={() => setTimeSlot(slot)}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-colors ${
                      selected
                        ? 'border-rose-500 bg-rose-50 text-rose-700 font-bold'
                        : 'border-stone-200 hover:border-rose-300 text-stone-800'
                    }`}
                  >
                    <span className="text-xs">{slot}</span>
                    <input
                      type="radio"
                      name="time-slot"
                      checked={selected}
                      onChange={() => {}}
                      className="text-rose-500 focus:ring-rose-400"
                    />
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: Notes */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-stone-900">
                چیز دیگه‌ای هست که دوست داری بدونیم؟
              </h2>
              <p className="text-xs text-stone-500">
                مثلاً غذای خاص، حساسیت یا فضای دنج مورد علاقه‌ات
              </p>
            </div>

            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثلاً: جای دنج دوست دارم یا قهوه لاته می‌خورم..."
              className="w-full p-3.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all"
            />
          </div>
        )}

        {/* Wizard Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-stone-100 mt-4">
          {step > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="px-4 py-2 rounded-xl border border-stone-200 text-stone-800 text-xs font-medium hover:bg-stone-100 transition-colors cursor-pointer"
            >
              مرحله قبل
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={handleNext}
            className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            {step === 4 ? 'ثبت انتخاب‌ها ❤️' : 'مرحله بعد →'}
          </button>
        </div>
      </div>
    </section>
  );
};
