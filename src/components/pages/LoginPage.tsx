import React, { useState } from 'react';
import { PageId } from '../../types';

interface LoginPageProps {
  onNavigate: (page: PageId) => void;
  onLoginSuccess: (email: string) => void;
  onShowToast: (msg: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onNavigate,
  onLoginSuccess,
  onShowToast,
}) => {
  const [email, setEmail] = useState('sepehr@biadate.ir');
  const [password, setPassword] = useState('12345678');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      onShowToast('لطفاً ایمیل خود را وارد کنید');
      return;
    }
    onLoginSuccess(email);
    onShowToast('با موفقیت وارد شدید! خوش آمدید ❤️');
    onNavigate('dashboard');
  };

  return (
    <section className="space-y-6 py-6 max-w-sm mx-auto">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-500 flex items-center justify-center text-xl mx-auto mb-2">
          👋
        </div>
        <h1 className="text-2xl font-black text-stone-900">خوش برگشتی ❤️</h1>
        <p className="text-xs text-stone-600">وارد حساب biaDate شو.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 border border-stone-200/70 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-semibold text-stone-800 mb-1.5">ایمیل</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all dir-ltr text-right"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-semibold text-stone-800">رمز عبور</label>
            <button
              type="button"
              onClick={() => onShowToast('لینک بازیابی رمز عبور به ایمیل شما ارسال شد.')}
              className="text-[11px] text-rose-500 hover:underline cursor-pointer"
            >
              رمز عبورم را فراموش کرده‌ام
            </button>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all dir-ltr text-right"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm shadow-md shadow-rose-500/15 active:scale-98 transition-all cursor-pointer"
        >
          ورود
        </button>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => onNavigate('register')}
            className="text-xs text-stone-700 hover:text-rose-500 cursor-pointer"
          >
            حساب ندارم؛ <span className="font-bold text-rose-500">ثبت‌نام می‌کنم</span>
          </button>
        </div>
      </form>
    </section>
  );
};
