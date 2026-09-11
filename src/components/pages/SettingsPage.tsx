import React, { useState } from 'react';
import { PageId } from '../../types';
import { sendChangePhoneOtpApi, verifyChangePhoneOtpApi } from '../../services/api';
import { Phone, Check, ArrowRight, ShieldCheck, RefreshCw, KeyRound, LogOut } from 'lucide-react';

interface SettingsPageProps {
  userName: string;
  userPhone?: string;
  userGender?: string;
  onUpdateProfile: (name: string, phone?: string, gender?: string) => void;
  onShowToast: (msg: string) => void;
  onNavigate: (page: PageId) => void;
  isLoggedIn?: boolean;
  onSignOut?: () => void;
}

function cleanIranianPhone(raw: string): string | null {
  if (!raw || typeof raw !== 'string') return null;
  let cleaned = raw.replace(/[\u200B-\u200F\u202A-\u202E\uFEFF\u00A0]/g, '');
  cleaned = cleaned
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .trim()
    .replace(/[^\d+]/g, '');

  if (cleaned.startsWith('+98')) cleaned = '0' + cleaned.substring(3);
  else if (cleaned.startsWith('0098')) cleaned = '0' + cleaned.substring(4);
  else if (cleaned.startsWith('98') && cleaned.length >= 12) cleaned = '0' + cleaned.substring(2);
  else if (cleaned.startsWith('9') && cleaned.length === 10) cleaned = '0' + cleaned;

  if (/^09\d{9}$/.test(cleaned)) {
    return cleaned;
  }
  return null;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  userName,
  userPhone,
  userGender,
  onUpdateProfile,
  onShowToast,
  onNavigate,
  isLoggedIn = true,
  onSignOut,
}) => {
  const [name, setName] = useState(userName || 'کاربر گرامی');
  const [gender, setGender] = useState(userGender || '');
  const [currentPhone, setCurrentPhone] = useState(userPhone || '09123456789');
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Phone change OTP state
  const [isChangingPhone, setIsChangingPhone] = useState(false);
  const [newPhoneInput, setNewPhoneInput] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpStep, setOtpStep] = useState<'phone' | 'code'>('phone');
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [testOtpHint, setTestOtpHint] = useState<string | null>(null);

  const [smsNotify, setSmsNotify] = useState(true);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      onShowToast('لطفاً نام خود را وارد کنید');
      return;
    }
    
    setIsSavingProfile(true);
    try {
        const { updateProfileApi } = await import('../../services/api');
        const res = await updateProfileApi(name.trim(), gender);
        onUpdateProfile(res.user.name, currentPhone, res.user.gender);
        onShowToast('اطلاعات هویتی با موفقیت به‌روزرسانی شد');
    } catch (err: any) {
        onShowToast(err.message || 'خطا در ذخیره اطلاعات');
    } finally {
        setIsSavingProfile(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawNew = newPhoneInput.trim();
    if (!rawNew) {
      onShowToast('لطفاً شماره تماس جدید را وارد کنید');
      return;
    }
    const cleanNew = cleanIranianPhone(rawNew);
    if (!cleanNew) {
      onShowToast('شماره موبایل وارد شده نامعتبر است (مثال: ۰۹۱۲۳۴۵۶۷۸۹)');
      return;
    }
    if (cleanNew === cleanIranianPhone(currentPhone)) {
      onShowToast('شماره جدید با شماره فعلی شما یکسان است');
      return;
    }

    setOtpSending(true);
    try {
      const res = await sendChangePhoneOtpApi(currentPhone, cleanNew);
      setTestOtpHint(res.testOtp || null);
      setNewPhoneInput(cleanNew);
      setOtpStep('code');
      onShowToast(res.message || 'کد تایید برای شماره جدید ارسال شد');
    } catch (err: any) {
      console.error('Error sending change phone OTP:', err);
      onShowToast(err.message || 'خطا در ارسال کد تایید');
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      onShowToast('کد تایید ۵ رقمی را وارد کنید');
      return;
    }
    setOtpVerifying(true);
    try {
      const res = await verifyChangePhoneOtpApi(currentPhone, newPhoneInput, otpCode);
      setCurrentPhone(res.newPhone);
      onUpdateProfile(name, res.newPhone);
      onShowToast('شماره تماس شما با موفقیت تغییر یافت 🎉');
      setIsChangingPhone(false);
      setOtpStep('phone');
      setNewPhoneInput('');
      setOtpCode('');
      setTestOtpHint(null);
    } catch (err: any) {
      console.error('Error verifying change phone OTP:', err);
      onShowToast(err.message || 'کد تایید وارد شده نامعتبر است');
    } finally {
      setOtpVerifying(false);
    }
  };

  return (
    <section className="space-y-5 py-4 max-w-md mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-stone-900">تنظیمات حساب کاربری</h1>
        <button
          onClick={() => onNavigate('dashboard')}
          className="text-xs text-stone-500 hover:text-rose-500 inline-flex items-center gap-1 cursor-pointer transition-colors"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>بازگشت</span>
        </button>
      </div>

      {/* Profile & Name Form */}
      <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl p-5 border border-stone-200/70 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-stone-600 border-b border-stone-100 pb-2">
          اطلاعات هویتی
        </h3>

        <div>
          <label className="block text-xs font-semibold text-stone-800 mb-1">نام و نام خانوادگی</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-rose-400"
            placeholder="مثال: علی رضایی"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-800 mb-1">جنسیت</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-rose-400 bg-white appearance-none cursor-pointer"
            style={{ backgroundPosition: 'left 0.75rem center', backgroundSize: '1em', backgroundRepeat: 'no-repeat', backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23a8a29e%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")` }}
          >
            <option value="" disabled>انتخاب کنید...</option>
            <option value="boy">پسر 👦</option>
            <option value="girl">دختر 👧</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isSavingProfile}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white font-bold text-xs shadow-xs cursor-pointer active:scale-98 transition-all disabled:opacity-50"
        >
          {isSavingProfile ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
          ذخیره تغییرات
        </button>
      </form>

      {/* Phone Number Management with OTP */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200/70 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-2">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-rose-500" />
            <h3 className="text-xs font-bold text-stone-700">شماره تماس (احراز هویت پیامکی)</h3>
          </div>
          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            تایید شده
          </span>
        </div>

        <div className="space-y-1">
          <span className="text-[11px] text-stone-500 block">شماره تماس فعلی متصل به حساب:</span>
          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between">
            <span className="font-mono text-stone-900 font-bold text-sm dir-ltr">
              {currentPhone}
            </span>
            <span className="text-[11px] text-stone-600">ورود با رمز یکبار مصرف (OTP)</span>
          </div>
        </div>

        {!isChangingPhone ? (
          <button
            type="button"
            onClick={() => setIsChangingPhone(true)}
            className="w-full py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>تغییر شماره تماس با کد یکبار مصرف</span>
          </button>
        ) : (
          <div className="p-4 rounded-2xl bg-rose-50/40 border border-rose-200 space-y-3 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-800 flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-rose-500" />
                <span>مراحل تغییر شماره تماس</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsChangingPhone(false);
                  setOtpStep('phone');
                  setTestOtpHint(null);
                }}
                className="text-[11px] text-stone-500 hover:text-stone-700 underline cursor-pointer"
              >
                انصراف
              </button>
            </div>

            {otpStep === 'phone' ? (
              <form onSubmit={handleSendOtp} className="space-y-3">
                <p className="text-[11px] text-stone-600">
                  برای تغییر شماره، کد تایید یکبار مصرف برای شماره جدید ارسال خواهد شد.
                </p>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    شماره تماس جدید (مثال: ۰۹۱۲۳۴۵۶۷۸۹)
                  </label>
                  <input
                    type="tel"
                    dir="ltr"
                    value={newPhoneInput}
                    onChange={(e) => setNewPhoneInput(e.target.value)}
                    placeholder="09..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs font-mono focus:outline-none focus:border-rose-500 text-center"
                  />
                </div>
                <button
                  type="submit"
                  disabled={otpSending}
                  className="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  {otpSending ? 'در حال ارسال کد تایید...' : 'ارسال کد تایید به شماره جدید'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-3">
                <div className="text-[11px] text-stone-600 flex items-center justify-between">
                  <span>کد تایید پیامک شده به {newPhoneInput}:</span>
                  <button
                    type="button"
                    onClick={() => setOtpStep('phone')}
                    className="text-rose-600 hover:underline cursor-pointer"
                  >
                    اصلاح شماره
                  </button>
                </div>

                {testOtpHint && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-center justify-between">
                    <span>کد تست تایید:</span>
                    <span className="font-mono font-bold tracking-widest text-sm bg-white px-2 py-0.5 rounded border border-amber-300">
                      {testOtpHint}
                    </span>
                  </div>
                )}

                <div>
                  <input
                    type="text"
                    dir="ltr"
                    maxLength={5}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="• • • • •"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-base tracking-widest font-mono text-center focus:outline-none focus:border-rose-500 font-bold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={otpVerifying}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  {otpVerifying ? 'در حال بررسی کد...' : 'تایید نهایی و تغییر شماره'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200/70 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-stone-600 border-b border-stone-100 pb-2">
          اعلان‌ها
        </h3>

        <label className="flex items-center justify-between cursor-pointer py-1">
          <span className="text-xs font-medium text-stone-900">
            دریافت پیامک لحظه‌ای هنگام پاسخ به دعوت‌نامه
          </span>
          <input
            type="checkbox"
            checked={smsNotify}
            onChange={(e) => {
              setSmsNotify(e.target.checked);
              onShowToast('تنظیمات اعلان پیامکی ذخیره شد');
            }}
            className="rounded text-rose-500 focus:ring-rose-400 cursor-pointer"
          />
        </label>
      </div>

      {/* Account & Sign Out */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200/70 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-stone-100 pb-2">
          <h3 className="text-xs font-bold text-stone-600">
            حساب کاربری و نشست
          </h3>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${isLoggedIn ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-600'}`}>
            {isLoggedIn ? 'وارد شده' : 'کاربر مهمان'}
          </span>
        </div>

        {isLoggedIn ? (
          <div>
            {!confirmSignOut ? (
              <div className="flex items-center justify-between pt-1">
                <div>
                  <h4 className="text-xs font-bold text-stone-900">خروج از حساب کاربری (Sign Out)</h4>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    پایان دادن به نشست فعال در این مرورگر
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setConfirmSignOut(true)}
                  className="px-4 py-2 rounded-xl bg-stone-50 hover:bg-rose-50 text-stone-700 hover:text-rose-600 font-bold text-xs flex items-center gap-1.5 transition-all border border-stone-200 hover:border-rose-200 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>خروج</span>
                </button>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-rose-50/80 border border-rose-200 space-y-3">
                <div className="text-xs font-bold text-rose-900">
                  آیا مطمئن هستید که می‌خواهید از حساب کاربری خود خارج شوید؟
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (onSignOut) {
                        onSignOut();
                      }
                    }}
                    className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>بله، خروج از حساب</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmSignOut(false)}
                    className="px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 font-bold text-xs hover:bg-stone-100 transition-colors cursor-pointer"
                  >
                    انصراف
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between pt-1">
            <div>
              <h4 className="text-xs font-bold text-stone-900">ورود به حساب کاربری</h4>
              <p className="text-[11px] text-stone-500 mt-0.5">
                برای مدیریت دعوت‌نامه‌ها و دریافت اطلاعات وارد شوید
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('auth')}
              className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
            >
              ورود / ثبت‌نام
            </button>
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50/50 rounded-3xl p-5 border border-red-200 space-y-2">
        <h3 className="text-xs font-bold text-red-600">بخش حساس</h3>
        <p className="text-[11px] text-red-800/70">
          با حذف حساب کاربری، تمامی دعوت‌نامه‌های ایجاد شده از سیستم پاک خواهند شد.
        </p>
        <button
          onClick={() => onShowToast('درخواست حذف حساب شما ثبت گردید')}
          className="px-4 py-2 rounded-xl bg-white border border-red-300 text-red-600 font-bold text-xs hover:bg-red-50 transition-colors cursor-pointer"
        >
          حذف حساب
        </button>
      </div>
    </section>
  );
};
