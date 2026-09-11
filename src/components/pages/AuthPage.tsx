import React, { useState, useEffect, useRef } from 'react';
import { PageId, User } from '../../types';
import { sendOtpApi, verifyOtpApi, completeRegistrationApi } from '../../services/api';
import { Smartphone, ShieldCheck, ArrowRight, RefreshCw, UserCheck, CheckCircle2, AlertCircle } from 'lucide-react';

interface AuthPageProps {
  onNavigate: (page: PageId) => void;
  onLoginSuccess: (user: { id?: number; name: string; phone?: string; email?: string; token?: string }) => void;
  onShowToast: (msg: string) => void;
  redirectTarget?: PageId | null;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onNavigate,
  onLoginSuccess,
  onShowToast,
  redirectTarget,
}) => {
  // Step: 1 = Phone Input, 2 = OTP Code, 3 = Name Input (for new users)
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form states
  const [phone, setPhone] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '']);
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<string>('');
  const [tempToken, setTempToken] = useState('');
  const [userAlreadyExists, setUserAlreadyExists] = useState(false);
  const [testOtpCode, setTestOtpCode] = useState<string | null>(null);

  // Status & Timing
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(120);
  const [canResend, setCanResend] = useState(false);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for OTP
  useEffect(() => {
    let timer: any = null;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [step, countdown]);

  // Convert Persian numbers to English
  const toEnglishDigits = (str: string) => {
    return str
      .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
      .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
  };

  // Convert English numbers to Persian
  const toPersianDigits = (n: number | string) => {
    return String(n).replace(/[0-9]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d, 10)]);
  };

  // Format countdown mm:ss
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const str = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return toPersianDigits(str);
  };

  // Handle Send OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    const clean = toEnglishDigits(phone).replace(/\s+/g, '').replace(/-/g, '');
    if (!clean.startsWith('09') || clean.length !== 11) {
      setErrorMessage('شماره موبایل باید ۱۱ رقم باشد و با ۰۹ شروع شود (مثال: ۰۹۱۲۳۴۵۶۷۸۹)');
      return;
    }

    setIsLoading(true);
    try {
      const res = await sendOtpApi(clean);
      setUserAlreadyExists(res.userExists);
      if (res.testOtp) {
        setTestOtpCode(res.testOtp);
      }
      setCountdown(res.expiresInSeconds || 120);
      setCanResend(false);
      setOtpDigits(['', '', '', '', '']);
      setStep(2);
      onShowToast(res.message);

      // Focus first digit box after transition
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    } catch (err: any) {
      setErrorMessage(err.message || 'خطا در ارسال کد تایید');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP Digit Input
  const handleDigitChange = (index: number, value: string) => {
    const cleanVal = toEnglishDigits(value).replace(/\D/g, '');
    const newDigits = [...otpDigits];

    if (cleanVal.length > 1) {
      // Pasted multiple digits
      const pasted = cleanVal.slice(0, 5).split('');
      pasted.forEach((ch, idx) => {
        if (index + idx < 5) newDigits[index + idx] = ch;
      });
      setOtpDigits(newDigits);
      const nextIdx = Math.min(index + pasted.length, 4);
      otpInputRefs.current[nextIdx]?.focus();

      if (newDigits.every((d) => d !== '')) {
        verifyOtp(newDigits.join(''));
      }
      return;
    }

    newDigits[index] = cleanVal;
    setOtpDigits(newDigits);

    if (cleanVal && index < 4) {
      otpInputRefs.current[index + 1]?.focus();
    }

    if (newDigits.every((d) => d !== '')) {
      verifyOtp(newDigits.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Verify OTP
  const verifyOtp = async (codeToVerify?: string) => {
    const code = codeToVerify || otpDigits.join('');
    if (code.length !== 5) {
      setErrorMessage('لطفاً کد تایید ۵ رقمی را کامل وارد کنید');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const clean = toEnglishDigits(phone).replace(/\s+/g, '');
      const res = await verifyOtpApi(clean, code);

      if (!res.isNewUser && res.user) {
        // Existing user: Logged in directly!
        onLoginSuccess({
          id: res.user.id,
          name: res.user.name,
          phone: res.user.phone,
          token: res.token,
        });
      } else {
        // New user: Move to step 3 to get Full Name
        setTempToken(res.tempToken || '');
        setStep(3);
        onShowToast('کد تایید شد. لطفاً نام و نام خانوادگی خود را بنویسید.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'کد وارد شده اشتباه یا منقضی است');
    } finally {
      setIsLoading(false);
    }
  };

  // Complete Registration (New User)
  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMessage('لطفاً نام و نام خانوادگی معتبر وارد کنید (حداقل ۲ حرف)');
      return;
    }
    if (!gender) {
      setErrorMessage('لطفاً جنسیت خود را انتخاب کنید');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await completeRegistrationApi(tempToken, fullName.trim(), gender);
      onLoginSuccess({
        id: res.user.id,
        name: res.user.name,
        phone: res.user.phone,
        gender: res.user.gender,
        token: res.token,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'خطا در تکمیل ثبت‌نام');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="space-y-6 py-6 max-w-sm mx-auto">
      {/* Brand & Title Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 to-rose-400 text-white flex items-center justify-center text-2xl mx-auto shadow-sm">
          💌
        </div>
        <h1 className="text-2xl font-black text-stone-900 tracking-tight">
          {step === 1 && 'ورود یا ثبت‌نام'}
          {step === 2 && 'تایید شماره موبایل'}
          {step === 3 && 'تکمیل مشخصات'}
        </h1>
        <p className="text-xs text-stone-600 leading-relaxed max-w-xs mx-auto">
          {step === 1 && 'شماره موبایل خود را وارد کنید تا کد یکبار مصرف برایتان ارسال شود.'}
          {step === 2 && `کد تایید ارسال شده به شماره ${toPersianDigits(phone)} را وارد کنید.`}
          {step === 3 && 'برای ایجاد حساب کاربری، لطفاً نام و نام خانوادگی خود را مشخص نمایید.'}
        </p>
      </div>

      {/* Security & Redirect Notice */}
      {redirectTarget && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 text-xs text-rose-900 leading-relaxed shadow-xs flex items-start gap-2.5">
          <span className="text-lg shrink-0">🔒</span>
          <div>
            <p className="font-bold text-stone-900">
              {redirectTarget === 'create-invitation'
                ? 'برای ساخت دعوت‌نامه، لطفاً ابتدا وارد شوید'
                : redirectTarget === 'invitations-list'
                ? 'برای مشاهده دعوت‌نامه‌های خود، ابتدا وارد شوید'
                : 'برای دسترسی به این بخش، لطفاً وارد شوید'}
            </p>
            <p className="text-[11px] text-stone-600 mt-0.5">
              {redirectTarget === 'create-invitation'
                ? 'پس از ورود سریع، بلافاصله به ادامه فرایند ساخت دعوت‌نامه منتقل خواهید شد.'
                : 'پس از ورود، بلافاصله به صفحه درخواستی هدایت خواهید شد.'}
            </p>
          </div>
        </div>
      )}

      {/* Main Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/80 shadow-xs relative">
        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: PHONE NUMBER INPUT */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-2">
                شماره موبایل
              </label>
              <div className="relative">
                <input
                  type="tel"
                  dir="ltr"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09123456789"
                  maxLength={11}
                  className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-stone-200 text-sm font-semibold tracking-wider text-left focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition-all placeholder:text-stone-300"
                  autoFocus
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                  <Smartphone className="w-4 h-4" />
                </div>
              </div>
              <p className="text-[11px] text-stone-600 mt-2 text-right leading-relaxed">
                • در صورت داشتن حساب قبلی وارد می‌شوید و در غیر این صورت حساب جدید ساخته می‌شود.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || !phone}
              className="w-full py-3.5 rounded-2xl font-bold text-sm bg-rose-500 text-white shadow-sm hover:bg-rose-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>در حال ارسال کد...</span>
                </>
              ) : (
                <span>ارسال کد یکبار مصرف</span>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: OTP VERIFICATION */}
        {step === 2 && (
          <div className="space-y-5">
            {/* Phone badge with change button */}
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-stone-50 border border-stone-200/60 text-xs">
              <span className="font-semibold text-stone-700">
                {toPersianDigits(phone)}
              </span>
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setErrorMessage(null);
                }}
                className="text-rose-500 hover:text-rose-600 font-bold cursor-pointer text-xs"
              >
                ویرایش شماره
              </button>
            </div>

            {/* Test OTP Helper Chip for instant developer convenience */}
            {testOtpCode && (
              <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200/70 text-amber-800 text-xs flex items-center justify-between">
                <span className="text-[11px] font-medium">کد تایید ارسالی (محیط تست):</span>
                <button
                  type="button"
                  onClick={() => {
                    const digits = testOtpCode.split('');
                    setOtpDigits(digits);
                    verifyOtp(testOtpCode);
                  }}
                  className="px-2 py-0.5 rounded-lg bg-amber-200 hover:bg-amber-300 font-mono font-bold text-amber-900 cursor-pointer text-xs transition-colors"
                  title="کلیک برای درج خودکار"
                >
                  {testOtpCode}
                </button>
              </div>
            )}

            {/* 5-Box OTP Inputs */}
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-2 text-center">
                کد تایید ۵ رقمی را وارد کنید
              </label>
              <div className="flex justify-center gap-2" dir="ltr">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-11 h-13 text-center text-lg font-black rounded-xl border border-stone-200 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition-all bg-stone-50/50"
                  />
                ))}
              </div>
            </div>

            {/* Timer & Resend */}
            <div className="text-center text-xs">
              {countdown > 0 ? (
                <span className="text-stone-600 font-medium">
                  امکان ارسال مجدد تا{' '}
                  <span className="font-bold text-stone-900 font-mono">
                    {formatTimer(countdown)}
                  </span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSendOtp()}
                  disabled={isLoading}
                  className="text-rose-500 font-bold hover:underline cursor-pointer flex items-center justify-center gap-1 mx-auto"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>ارسال مجدد کد تایید</span>
                </button>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={() => verifyOtp()}
              disabled={isLoading || otpDigits.some((d) => !d)}
              className="w-full py-3.5 rounded-2xl font-bold text-sm bg-rose-500 text-white shadow-sm hover:bg-rose-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>در حال بررسی...</span>
                </>
              ) : (
                <span>تایید و ورود</span>
              )}
            </button>
          </div>
        )}

        {/* STEP 3: NAME INPUT (FOR NEW USERS) */}
        {step === 3 && (
          <form onSubmit={handleCompleteRegistration} className="space-y-5">
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>شماره {toPersianDigits(phone)} با موفقیت تایید شد.</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-2">
                نام و نام خانوادگی
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="مثال: سپهر رضایی"
                  className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-stone-200 text-sm font-semibold focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition-all placeholder:text-stone-300"
                  autoFocus
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                  <UserCheck className="w-4 h-4" />
                </div>
              </div>
              <p className="text-[11px] text-stone-600 mt-2 text-right leading-relaxed">
                این نام در بالای دعوت‌نامه‌های شما به عنوان فرستنده نمایش داده خواهد شد.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-2">
                جنسیت
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl border border-stone-200 text-sm font-semibold focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition-all bg-white appearance-none cursor-pointer"
                style={{ backgroundPosition: 'left 1rem center', backgroundSize: '1em', backgroundRepeat: 'no-repeat', backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23a8a29e%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")` }}
              >
                <option value="" disabled>انتخاب کنید...</option>
                <option value="boy">پسر 👦</option>
                <option value="girl">دختر 👧</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading || !fullName.trim() || !gender}
              className="w-full py-3.5 rounded-2xl font-bold text-sm bg-rose-500 text-white shadow-sm hover:bg-rose-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>در حال ساخت حساب...</span>
                </>
              ) : (
                <span>تکمیل ثبت‌نام و ورود به برنامه</span>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Footer hint */}
      <div className="text-center">
        <button
          onClick={() => onNavigate('landing')}
          className="text-xs text-stone-600 hover:text-stone-700 flex items-center justify-center gap-1 mx-auto cursor-pointer"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>بازگشت به صفحه اصلی</span>
        </button>
      </div>
    </section>
  );
};
