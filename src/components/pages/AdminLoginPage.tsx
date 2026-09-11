import React, { useState } from 'react';
import { PageId } from '../../types';
import { adminLoginApi } from '../../services/api';
import { ShieldAlert, Lock, User, Eye, EyeOff, KeyRound, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';

interface AdminLoginPageProps {
  onNavigate: (page: PageId) => void;
  onAdminLoginSuccess: () => void;
  onShowToast: (msg: string) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onNavigate,
  onAdminLoginSuccess,
  onShowToast,
}) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim()) {
      setErrorMessage('نام کاربری مدیر را وارد کنید.');
      return;
    }
    if (!password) {
      setErrorMessage('کلمه عبور امنیتی را وارد کنید.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await adminLoginApi({
        username: username.trim(),
        password,
      });

      if (res.success) {
        onShowToast('هویت امنیتی مدیر تایید شد. ورود به داشبورد مدیریت...');
        onAdminLoginSuccess();
        onNavigate('admin-dashboard');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'اعتبارسنجی ناموفق بود.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-8 max-w-md mx-auto">
      {/* High Security Badge Header */}
      <div className="text-center space-y-3 mb-6">
        <div className="w-16 h-16 rounded-3xl bg-stone-900 text-stone-100 flex items-center justify-center text-2xl mx-auto shadow-md border border-stone-700/60 relative">
          <Lock className="w-8 h-8 text-rose-500" />
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-stone-900 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          </div>
        </div>
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-900 text-stone-200 text-[11px] font-mono font-semibold tracking-wider uppercase mb-2 border border-stone-800">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>درگاه مدیریت اختصاصی • BiaDate Secure Portal</span>
          </div>
          <h1 className="text-2xl font-black text-stone-900">ورود به پنل مدیریت</h1>
          <p className="text-xs text-stone-600 mt-1">
            دسترسی به این صفحه محرمانه و اختصاصی مدیران سیستم است.
          </p>
        </div>
      </div>

      {/* Vault Card */}
      <div className="bg-stone-900 text-stone-100 rounded-3xl p-6 sm:p-7 border border-stone-800 shadow-xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Security Warning / Error Notice */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-950/80 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1.5">
              نام کاربری مدیر (Admin Username)
            </label>
            <div className="relative">
              <input
                type="text"
                dir="ltr"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-800 border border-stone-700 text-stone-100 text-sm font-mono focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all placeholder:text-stone-500"
                autoComplete="username"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                <User className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1.5">
              کلمه عبور امنیتی (Security Key)
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                dir="ltr"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-stone-800 border border-stone-700 text-stone-100 text-sm font-mono focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all placeholder:text-stone-500"
                autoComplete="current-password"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[11px] text-stone-400">
              <span>رمز پیش‌فرض سرور: BiaDate@Secure2025!</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl font-bold text-sm bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white shadow-lg transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <span>در حال اعتبارسنجی امنیتی...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>تایید هویت و ورود به داشبورد</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Security Audit Badge */}
        <div className="mt-5 pt-4 border-t border-stone-800 flex items-center justify-between text-[10px] text-stone-400">
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>End-to-End Encrypted Session</span>
          </div>
          <span className="font-mono">IP: Protected • Rate-Limited</span>
        </div>
      </div>

      {/* Return to main app */}
      <div className="text-center mt-6">
        <button
          onClick={() => onNavigate('landing')}
          className="text-xs text-stone-600 hover:text-stone-800 flex items-center justify-center gap-1 mx-auto cursor-pointer"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>بازگشت به سایت</span>
        </button>
      </div>
    </section>
  );
};
